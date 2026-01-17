/**
 * Video Evaluation Service
 *
 * Server-side service that sends simulation videos to Gemini 3 Pro for evaluation.
 * Produces dimension scores with evidence and timestamps.
 *
 * @since 2026-01-16
 */

import { gemini } from "@/lib/gemini";
import { db } from "@/server/db";
import { withRetry } from "@/lib/error-recovery";
import {
  VIDEO_EVALUATION_PROMPT,
  EVALUATION_PROMPT_VERSION,
  buildVideoEvaluationPrompt,
  type VideoEvaluationOutput,
  type AssessmentDimensionType,
} from "@/prompts/analysis/video-evaluation";
import { AssessmentDimension, VideoAssessmentStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";

// Model for video evaluation (Gemini 3 Pro)
const VIDEO_EVALUATION_MODEL = "gemini-3-pro-preview";

// ============================================================================
// Types
// ============================================================================

export interface VideoEvaluationResult {
  success: boolean;
  assessmentId: string;
  overallScore: number | null;
  dimensionScores: Map<AssessmentDimension, number | null>;
  summary: string | null;
  error?: string;
}

export interface EvaluateVideoOptions {
  assessmentId: string;
  videoUrl: string;
  videoDurationMinutes?: number;
  taskDescription?: string;
  expectedOutcomes?: string[];
}

// ============================================================================
// Response Parsing
// ============================================================================

/**
 * Cleans JSON response from Gemini by removing markdown code blocks
 */
function cleanJsonResponse(response: string): string {
  let cleaned = response.trim();

  // Remove markdown code block markers
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  }
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }

  return cleaned.trim();
}

/**
 * Parses and validates the Gemini evaluation response
 */
function parseEvaluationResponse(responseText: string): VideoEvaluationOutput {
  const cleaned = cleanJsonResponse(responseText);
  const parsed = JSON.parse(cleaned);

  // Validate required fields
  if (typeof parsed.overall_score !== "number") {
    throw new Error("Missing or invalid overall_score in response");
  }

  if (!parsed.dimension_scores || typeof parsed.dimension_scores !== "object") {
    throw new Error("Missing or invalid dimension_scores in response");
  }

  if (!parsed.overall_summary || typeof parsed.overall_summary !== "string") {
    throw new Error("Missing or invalid overall_summary in response");
  }

  return parsed as VideoEvaluationOutput;
}

/**
 * Maps string dimension name to Prisma AssessmentDimension enum
 */
function mapDimensionToEnum(
  dimension: AssessmentDimensionType
): AssessmentDimension {
  const mapping: Record<AssessmentDimensionType, AssessmentDimension> = {
    COMMUNICATION: AssessmentDimension.COMMUNICATION,
    PROBLEM_SOLVING: AssessmentDimension.PROBLEM_SOLVING,
    TECHNICAL_KNOWLEDGE: AssessmentDimension.TECHNICAL_KNOWLEDGE,
    COLLABORATION: AssessmentDimension.COLLABORATION,
    ADAPTABILITY: AssessmentDimension.ADAPTABILITY,
    LEADERSHIP: AssessmentDimension.LEADERSHIP,
    CREATIVITY: AssessmentDimension.CREATIVITY,
    TIME_MANAGEMENT: AssessmentDimension.TIME_MANAGEMENT,
  };
  return mapping[dimension];
}

/**
 * Formats timestamps array to JSON for database storage
 * Ensures timestamps are in MM:SS or HH:MM:SS format
 */
function formatTimestamps(timestamps: string[]): Prisma.InputJsonValue {
  // Validate timestamp format
  const timestampRegex = /^(\d{1,2}:)?\d{1,2}:\d{2}$/;
  const validTimestamps = timestamps.filter((ts) => timestampRegex.test(ts));
  return validTimestamps as unknown as Prisma.InputJsonValue;
}

// ============================================================================
// Main Evaluation Function
// ============================================================================

/**
 * Evaluates a video using Gemini 3 Pro
 *
 * Sends the video to Gemini for evaluation against the 8-dimension rubric.
 * Stores results in DimensionScore and VideoAssessmentSummary tables.
 *
 * @param options - Evaluation options including assessmentId and videoUrl
 * @returns Evaluation result with scores and summary
 */
export async function evaluateVideo(
  options: EvaluateVideoOptions
): Promise<VideoEvaluationResult> {
  const { assessmentId, videoUrl, videoDurationMinutes, taskDescription, expectedOutcomes } =
    options;

  // Update status to PROCESSING
  await db.videoAssessment.update({
    where: { id: assessmentId },
    data: { status: VideoAssessmentStatus.PROCESSING },
  });

  try {
    // Build the evaluation prompt with optional context
    const prompt = buildVideoEvaluationPrompt({
      videoDurationMinutes,
      taskDescription,
      expectedOutcomes,
    });

    // Call Gemini with retry logic (max 3 attempts, exponential backoff)
    const responseText = await withRetry(
      async () => {
        const result = await gemini.models.generateContent({
          model: VIDEO_EVALUATION_MODEL,
          contents: [
            {
              role: "user",
              parts: [
                {
                  fileData: {
                    fileUri: videoUrl,
                    mimeType: "video/mp4", // Assuming MP4, could be made configurable
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
          ],
        });

        const text = result.text;
        if (!text) {
          throw new Error("No response from Gemini");
        }
        return text;
      },
      {
        maxAttempts: 3,
        baseDelayMs: 1000,
        maxDelayMs: 30000,
        onRetry: (attempt, error, delay) => {
          console.warn(
            `[VideoEvaluation] Retry ${attempt} after ${delay}ms: ${error.message}`
          );
        },
      }
    );

    // Parse the response
    const evaluation = parseEvaluationResponse(responseText);

    // Store dimension scores
    const dimensionScores = new Map<AssessmentDimension, number | null>();

    for (const [dimensionName, scoreData] of Object.entries(
      evaluation.dimension_scores
    )) {
      const dimension = mapDimensionToEnum(
        dimensionName as AssessmentDimensionType
      );
      const score = scoreData.score;
      dimensionScores.set(dimension, score);

      // Only create score record if we have a score (not null)
      if (score !== null) {
        await db.dimensionScore.upsert({
          where: {
            assessmentId_dimension: {
              assessmentId,
              dimension,
            },
          },
          create: {
            assessmentId,
            dimension,
            score,
            observableBehaviors: scoreData.observable_behaviors,
            timestamps: formatTimestamps(scoreData.timestamps),
            trainableGap: scoreData.trainable_gap,
          },
          update: {
            score,
            observableBehaviors: scoreData.observable_behaviors,
            timestamps: formatTimestamps(scoreData.timestamps),
            trainableGap: scoreData.trainable_gap,
          },
        });
      }
    }

    // Store assessment summary with raw AI response
    await db.videoAssessmentSummary.upsert({
      where: { assessmentId },
      create: {
        assessmentId,
        overallSummary: evaluation.overall_summary,
        rawAiResponse: evaluation as unknown as Prisma.InputJsonValue,
      },
      update: {
        overallSummary: evaluation.overall_summary,
        rawAiResponse: evaluation as unknown as Prisma.InputJsonValue,
      },
    });

    // Update assessment status to COMPLETED
    await db.videoAssessment.update({
      where: { id: assessmentId },
      data: {
        status: VideoAssessmentStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    return {
      success: true,
      assessmentId,
      overallScore: evaluation.overall_score,
      dimensionScores,
      summary: evaluation.overall_summary,
    };
  } catch (error) {
    console.error("[VideoEvaluation] Evaluation failed:", error);

    // Update assessment status to FAILED
    await db.videoAssessment.update({
      where: { id: assessmentId },
      data: { status: VideoAssessmentStatus.FAILED },
    });

    return {
      success: false,
      assessmentId,
      overallScore: null,
      dimensionScores: new Map(),
      summary: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Gets the evaluation status for an assessment
 */
export async function getEvaluationStatus(assessmentId: string): Promise<{
  status: VideoAssessmentStatus;
  completedAt: Date | null;
  hasScores: boolean;
  hasSummary: boolean;
}> {
  const assessment = await db.videoAssessment.findUnique({
    where: { id: assessmentId },
    include: {
      scores: { select: { id: true } },
      summary: { select: { id: true } },
    },
  });

  if (!assessment) {
    throw new Error(`Assessment not found: ${assessmentId}`);
  }

  return {
    status: assessment.status,
    completedAt: assessment.completedAt,
    hasScores: assessment.scores.length > 0,
    hasSummary: !!assessment.summary,
  };
}

/**
 * Gets the full evaluation results for an assessment
 */
export async function getEvaluationResults(assessmentId: string): Promise<{
  assessment: {
    id: string;
    status: VideoAssessmentStatus;
    completedAt: Date | null;
  };
  scores: Array<{
    dimension: AssessmentDimension;
    score: number;
    observableBehaviors: string;
    timestamps: string[];
    trainableGap: boolean;
  }>;
  summary: {
    overallSummary: string;
    rawAiResponse: VideoEvaluationOutput | null;
  } | null;
}> {
  const assessment = await db.videoAssessment.findUnique({
    where: { id: assessmentId },
    include: {
      scores: true,
      summary: true,
    },
  });

  if (!assessment) {
    throw new Error(`Assessment not found: ${assessmentId}`);
  }

  return {
    assessment: {
      id: assessment.id,
      status: assessment.status,
      completedAt: assessment.completedAt,
    },
    scores: assessment.scores.map((score) => ({
      dimension: score.dimension,
      score: score.score,
      observableBehaviors: score.observableBehaviors,
      timestamps: (score.timestamps as string[]) || [],
      trainableGap: score.trainableGap,
    })),
    summary: assessment.summary
      ? {
          overallSummary: assessment.summary.overallSummary,
          rawAiResponse: assessment.summary
            .rawAiResponse as unknown as VideoEvaluationOutput | null,
        }
      : null,
  };
}

// Export model constant for testing/configuration
export { VIDEO_EVALUATION_MODEL };
