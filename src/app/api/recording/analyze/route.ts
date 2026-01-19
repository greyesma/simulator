import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { supabaseAdmin } from "@/lib/external";
import { STORAGE_BUCKETS } from "@/lib/external";
import { z } from "zod";
import {
  analyzeSegmentScreenshots,
  buildSegmentAnalysisData,
  aggregateSegmentAnalyses,
  type SegmentAnalysisResponse,
} from "@/lib/analysis";
import type { Prisma } from "@prisma/client";

// Schema for analyze request
const analyzeRequestSchema = z.object({
  assessmentId: z.string(),
  segmentId: z.string().optional(), // If provided, analyze only this segment
  forceReanalyze: z.boolean().optional(), // Re-analyze even if already analyzed
});

// POST /api/recording/analyze - Analyze recording screenshots
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = analyzeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { assessmentId, segmentId, forceReanalyze } = parsed.data;

    // Verify the assessment belongs to the user
    const assessment = await db.assessment.findFirst({
      where: {
        id: assessmentId,
        userId: session.user.id,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const recordingId = `${assessmentId}-screen`;

    // Get recording with segments (optionally filter by segmentId)
    const recording = await db.recording.findUnique({
      where: { id: recordingId },
      include: {
        segments: {
          where: segmentId ? { id: segmentId } : {},
          orderBy: { segmentIndex: "asc" },
          include: {
            analysis: true,
          },
        },
      },
    });

    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      );
    }

    if (recording.segments.length === 0) {
      return NextResponse.json(
        { error: "No segments found for recording" },
        { status: 404 }
      );
    }

    // Filter segments to analyze (skip already analyzed unless forceReanalyze)
    const segmentsToAnalyze = recording.segments.filter((segment) => {
      // Only analyze completed or interrupted segments (not currently recording)
      if (segment.status === "recording") {
        return false;
      }
      // Skip if already analyzed unless forcing re-analysis
      if (segment.analysis && !forceReanalyze) {
        return false;
      }
      // Skip if no screenshots
      if (segment.screenshotPaths.length === 0) {
        return false;
      }
      return true;
    });

    if (segmentsToAnalyze.length === 0) {
      // Return existing analyses if any
      const existingAnalyses = recording.segments
        .filter((s) => s.analysis)
        .map((s) => s.analysis!);

      if (existingAnalyses.length > 0) {
        // Aggregate existing analyses
        const aggregatedAnalyses = existingAnalyses.map(
          (a) => a.aiAnalysis as unknown as SegmentAnalysisResponse
        );
        const aggregated = aggregateSegmentAnalyses(aggregatedAnalyses);

        return NextResponse.json({
          success: true,
          message: "No new segments to analyze",
          analyzed: false,
          existingAnalysesCount: existingAnalyses.length,
          aggregated,
        });
      }

      return NextResponse.json({
        success: true,
        message: "No segments ready for analysis",
        analyzed: false,
      });
    }

    // Analyze each segment
    const analysisResults: {
      segmentId: string;
      analysis: SegmentAnalysisResponse;
      screenshotsAnalyzed: number;
    }[] = [];

    for (const segment of segmentsToAnalyze) {
      // Generate signed URLs for screenshots
      const screenshotUrls = await Promise.all(
        segment.screenshotPaths.map(async (path) => {
          const { data } = await supabaseAdmin.storage
            .from(STORAGE_BUCKETS.SCREENSHOTS)
            .createSignedUrl(path, 60 * 60); // 1 hour expiry for analysis
          return data?.signedUrl || null;
        })
      );

      const validUrls = screenshotUrls.filter(
        (url): url is string => url !== null
      );

      // Calculate segment duration
      const segmentDurationSeconds = segment.endTime
        ? Math.round(
            (segment.endTime.getTime() - segment.startTime.getTime()) / 1000
          )
        : 0;

      try {
        // Analyze screenshots
        const analysis = await analyzeSegmentScreenshots(
          validUrls,
          segment.startTime,
          segmentDurationSeconds
        );

        analysisResults.push({
          segmentId: segment.id,
          analysis,
          screenshotsAnalyzed: validUrls.length,
        });

        // Save analysis to database
        const analysisData = buildSegmentAnalysisData(
          segment.id,
          analysis,
          validUrls.length
        );

        await db.segmentAnalysis.upsert({
          where: { segmentId: segment.id },
          create: analysisData,
          update: {
            ...analysisData,
            updatedAt: new Date(),
          },
        });
      } catch (error) {
        console.error(`Failed to analyze segment ${segment.id}:`, error);
        // Continue with other segments even if one fails
      }
    }

    if (analysisResults.length === 0) {
      return NextResponse.json(
        { error: "Failed to analyze any segments" },
        { status: 500 }
      );
    }

    // Aggregate all analyses (including existing ones)
    const allAnalyses = [
      ...analysisResults.map((r) => r.analysis),
      ...recording.segments
        .filter(
          (s) => s.analysis && !segmentsToAnalyze.some((st) => st.id === s.id)
        )
        .map(
          (s) => s.analysis!.aiAnalysis as unknown as SegmentAnalysisResponse
        ),
    ];

    const aggregated = aggregateSegmentAnalyses(allAnalyses);

    // Update the Recording model with aggregated analysis
    await db.recording.update({
      where: { id: recordingId },
      data: {
        analysis: {
          ...aggregated,
          lastAnalyzedAt: new Date().toISOString(),
          segmentsAnalyzed: analysisResults.length,
          totalSegments: recording.segments.length,
        } as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({
      success: true,
      analyzed: true,
      segmentsAnalyzed: analysisResults.length,
      totalScreenshotsAnalyzed: analysisResults.reduce(
        (sum, r) => sum + r.screenshotsAnalyzed,
        0
      ),
      aggregated,
    });
  } catch (error) {
    console.error("Recording analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/recording/analyze - Get analysis results for a recording
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get("assessmentId");
    const segmentId = searchParams.get("segmentId");

    if (!assessmentId) {
      return NextResponse.json(
        { error: "assessmentId is required" },
        { status: 400 }
      );
    }

    // Verify the assessment belongs to the user
    const assessment = await db.assessment.findFirst({
      where: {
        id: assessmentId,
        userId: session.user.id,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const recordingId = `${assessmentId}-screen`;

    // Get recording with segment analyses
    const recording = await db.recording.findUnique({
      where: { id: recordingId },
      include: {
        segments: {
          where: segmentId ? { id: segmentId } : {},
          orderBy: { segmentIndex: "asc" },
          include: {
            analysis: true,
          },
        },
      },
    });

    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      );
    }

    // If specific segment requested
    if (segmentId) {
      const segment = recording.segments[0];
      if (!segment) {
        return NextResponse.json(
          { error: "Segment not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        segmentId: segment.id,
        segmentIndex: segment.segmentIndex,
        status: segment.status,
        hasAnalysis: !!segment.analysis,
        analysis: segment.analysis,
      });
    }

    // Return all segment analyses and aggregated recording analysis
    const segmentAnalyses = recording.segments.map((segment) => ({
      segmentId: segment.id,
      segmentIndex: segment.segmentIndex,
      status: segment.status,
      hasAnalysis: !!segment.analysis,
      analysis: segment.analysis
        ? {
            activityTimeline: segment.analysis.activityTimeline,
            toolUsage: segment.analysis.toolUsage,
            stuckMoments: segment.analysis.stuckMoments,
            totalActiveTime: segment.analysis.totalActiveTime,
            totalIdleTime: segment.analysis.totalIdleTime,
            focusScore: segment.analysis.focusScore,
            screenshotsAnalyzed: segment.analysis.screenshotsAnalyzed,
            analyzedAt: segment.analysis.analyzedAt,
          }
        : null,
    }));

    return NextResponse.json({
      recordingId: recording.id,
      hasRecording: true,
      aggregatedAnalysis: recording.analysis,
      segments: segmentAnalyses,
      totalSegments: recording.segments.length,
      analyzedSegments: recording.segments.filter((s) => s.analysis).length,
    });
  } catch (error) {
    console.error("Get recording analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
