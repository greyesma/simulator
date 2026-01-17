import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/server/db";
import { retryVideoAssessment } from "@/lib/video-evaluation";
import { VideoAssessmentStatus } from "@prisma/client";

/**
 * POST /api/admin/video-assessment/retry
 * Retries a failed video assessment.
 * Admin only - for manually retrying failed assessments.
 */
export async function POST(request: Request) {
  try {
    // Verify admin role
    await requireAdmin();

    const body = await request.json();
    const { videoAssessmentId } = body;

    if (!videoAssessmentId) {
      return NextResponse.json(
        { error: "videoAssessmentId is required" },
        { status: 400 }
      );
    }

    const result = await retryVideoAssessment(videoAssessmentId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to retry assessment" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      videoAssessmentId: result.videoAssessmentId,
      message: "Video assessment retry initiated",
    });
  } catch (error) {
    console.error("Error retrying video assessment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/video-assessment/retry
 * Lists all failed video assessments that can be retried.
 * Admin only.
 */
export async function GET() {
  try {
    // Verify admin role
    await requireAdmin();

    const failedAssessments = await db.videoAssessment.findMany({
      where: {
        status: VideoAssessmentStatus.FAILED,
      },
      select: {
        id: true,
        candidateId: true,
        assessmentId: true,
        videoUrl: true,
        createdAt: true,
        candidate: {
          select: {
            name: true,
            email: true,
          },
        },
        assessment: {
          select: {
            scenario: {
              select: {
                name: true,
              },
            },
          },
        },
        logs: {
          where: {
            eventType: "ERROR",
          },
          orderBy: {
            timestamp: "desc",
          },
          take: 1,
          select: {
            timestamp: true,
            metadata: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      failedAssessments: failedAssessments.map((assessment) => ({
        id: assessment.id,
        candidateId: assessment.candidateId,
        candidateName: assessment.candidate.name,
        candidateEmail: assessment.candidate.email,
        assessmentId: assessment.assessmentId,
        scenarioName: assessment.assessment?.scenario?.name,
        videoUrl: assessment.videoUrl,
        createdAt: assessment.createdAt.toISOString(),
        lastError: assessment.logs[0]?.metadata,
        lastErrorAt: assessment.logs[0]?.timestamp?.toISOString(),
      })),
      count: failedAssessments.length,
    });
  } catch (error) {
    console.error("Error listing failed video assessments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
