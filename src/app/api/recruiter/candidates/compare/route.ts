import { auth } from "@/auth";
import { db } from "@/server/db";
import { success, error } from "@/lib/api";
import { VideoAssessmentStatus } from "@prisma/client";
import { getStoredPercentiles } from "@/lib/candidate/percentile-calculator";

// ============================================================================
// Types
// ============================================================================

/**
 * Candidate strength levels based on overall score (1-5 scale)
 */
type CandidateStrengthLevel = "Exceptional" | "Strong" | "Proficient" | "Developing";

/**
 * Session user interface for type safety
 */
interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string;
}

/**
 * Dimension score with percentile for comparison
 */
interface DimensionScoreComparison {
  dimension: string;
  score: number;
  percentile: number;
}

/**
 * Candidate summary for comparison view
 */
interface CandidateComparison {
  candidateId: string;
  candidateName: string | null;
  overallScore: number;
  overallPercentile: number;
  strengthLevel: CandidateStrengthLevel;
  dimensionScores: DimensionScoreComparison[];
  topStrength: string | null;
  biggestGap: string | null;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get candidate strength level from overall score
 */
function getStrengthLevel(overallScore: number): CandidateStrengthLevel {
  if (overallScore >= 4.5) return "Exceptional";
  if (overallScore >= 3.5) return "Strong";
  if (overallScore >= 2.5) return "Proficient";
  return "Developing";
}

/**
 * Find the dimension with highest percentile (top strength)
 */
function findTopStrength(dimensionScores: DimensionScoreComparison[]): string | null {
  if (dimensionScores.length === 0) return null;

  let maxPercentile = -1;
  let topDimension: string | null = null;

  for (const ds of dimensionScores) {
    if (ds.percentile > maxPercentile) {
      maxPercentile = ds.percentile;
      topDimension = ds.dimension;
    }
  }

  return topDimension;
}

/**
 * Find the dimension with lowest percentile that is marked as trainable gap
 */
function findBiggestGap(
  dimensionScores: DimensionScoreComparison[],
  trainableGaps: Set<string>
): string | null {
  if (dimensionScores.length === 0) return null;

  let minPercentile = Infinity;
  let gapDimension: string | null = null;

  for (const ds of dimensionScores) {
    // Only consider dimensions that are marked as trainable gaps
    if (trainableGaps.has(ds.dimension) && ds.percentile < minPercentile) {
      minPercentile = ds.percentile;
      gapDimension = ds.dimension;
    }
  }

  return gapDimension;
}

// ============================================================================
// Route Handler
// ============================================================================

/**
 * GET /api/recruiter/candidates/compare
 *
 * Returns comparison data for multiple candidates for side-by-side view.
 *
 * Query params:
 * - assessmentIds: comma-separated list of assessment IDs (max 4)
 *
 * Returns array of candidate summaries with:
 * - candidateId, candidateName
 * - overallScore, overallPercentile
 * - strengthLevel
 * - dimensionScores with percentiles
 * - topStrength (highest percentile dimension)
 * - biggestGap (lowest percentile dimension marked as trainableGap)
 */
export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return error("Unauthorized", 401);
  }

  const user = session.user as SessionUser;
  if (user.role !== "RECRUITER" && user.role !== "ADMIN") {
    return error("Recruiter access required", 403);
  }

  // Parse assessmentIds from query params
  const url = new URL(request.url);
  const assessmentIdsParam = url.searchParams.get("assessmentIds");

  if (!assessmentIdsParam) {
    return error("assessmentIds query parameter is required", 400);
  }

  const assessmentIds = assessmentIdsParam.split(",").map((id) => id.trim()).filter(Boolean);

  if (assessmentIds.length === 0) {
    return error("At least one assessmentId is required", 400);
  }

  if (assessmentIds.length > 4) {
    return error("Maximum 4 assessmentIds allowed for comparison", 400);
  }

  // Fetch all assessments with related data
  const assessments = await db.assessment.findMany({
    where: {
      id: { in: assessmentIds },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      scenario: {
        select: {
          id: true,
          createdById: true,
        },
      },
      videoAssessment: {
        include: {
          scores: true,
        },
      },
    },
  });

  // Verify all requested assessments were found
  if (assessments.length !== assessmentIds.length) {
    const foundIds = new Set(assessments.map((a) => a.id));
    const missingIds = assessmentIds.filter((id) => !foundIds.has(id));
    return error(`Assessments not found: ${missingIds.join(", ")}`, 404);
  }

  // Verify recruiter owns all simulations (unless admin)
  if (user.role !== "ADMIN") {
    const unauthorizedAssessments = assessments.filter(
      (a) => a.scenario.createdById !== user.id
    );

    if (unauthorizedAssessments.length > 0) {
      return error("You do not have access to one or more of these candidates", 403);
    }
  }

  // Build comparison data for each candidate
  const comparisons: CandidateComparison[] = await Promise.all(
    assessments.map(async (assessment) => {
      const videoAssessment = assessment.videoAssessment;
      const hasCompletedVideoAssessment =
        videoAssessment?.status === VideoAssessmentStatus.COMPLETED;

      // Get percentiles from stored data
      const percentiles = await getStoredPercentiles(assessment.id);
      const overallPercentile = percentiles?.overall ?? 0;

      // Build dimension scores with percentiles
      const dimensionScores: DimensionScoreComparison[] = [];
      const trainableGaps = new Set<string>();

      if (hasCompletedVideoAssessment && videoAssessment?.scores) {
        for (const score of videoAssessment.scores) {
          const percentile = percentiles?.[score.dimension] ?? 0;

          dimensionScores.push({
            dimension: score.dimension,
            score: score.score,
            percentile,
          });

          if (score.trainableGap) {
            trainableGaps.add(score.dimension);
          }
        }
      }

      // Calculate overall score from dimension scores
      const overallScore =
        dimensionScores.length > 0
          ? dimensionScores.reduce((sum, s) => sum + s.score, 0) / dimensionScores.length
          : 0;

      // Find top strength (highest percentile) and biggest gap (lowest percentile trainable gap)
      const topStrength = findTopStrength(dimensionScores);
      const biggestGap = findBiggestGap(dimensionScores, trainableGaps);

      return {
        candidateId: assessment.user.id,
        candidateName: assessment.user.name,
        overallScore,
        overallPercentile,
        strengthLevel: getStrengthLevel(overallScore),
        dimensionScores,
        topStrength,
        biggestGap,
      };
    })
  );

  return success(comparisons);
}
