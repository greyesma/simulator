import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { AssessmentStatus } from "@prisma/client";

/**
 * POST /api/assessment/finalize
 * Marks assessment as fully completed after the final defense call
 * - Transitions status from FINAL_DEFENSE to COMPLETED
 * - Records final completion timestamp
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assessmentId } = body;

    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID is required" },
        { status: 400 }
      );
    }

    // Verify assessment exists and belongs to user
    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      select: {
        id: true,
        userId: true,
        status: true,
        startedAt: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (assessment.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to modify this assessment" },
        { status: 403 }
      );
    }

    // Check that assessment is in FINAL_DEFENSE status
    if (assessment.status !== AssessmentStatus.FINAL_DEFENSE) {
      return NextResponse.json(
        {
          error: `Cannot finalize assessment in ${assessment.status} status. Must be in FINAL_DEFENSE status.`,
        },
        { status: 400 }
      );
    }

    // Calculate total duration
    const now = new Date();
    const totalDurationMs = now.getTime() - assessment.startedAt.getTime();
    const totalDurationSeconds = Math.floor(totalDurationMs / 1000);

    // Update assessment status to COMPLETED
    const updatedAssessment = await db.assessment.update({
      where: { id: assessmentId },
      data: {
        status: AssessmentStatus.COMPLETED,
        completedAt: now,
      },
      select: {
        id: true,
        status: true,
        startedAt: true,
        completedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      assessment: updatedAssessment,
      timing: {
        startedAt: assessment.startedAt.toISOString(),
        completedAt: now.toISOString(),
        totalDurationSeconds,
      },
    });
  } catch (error) {
    console.error("Error finalizing assessment:", error);
    return NextResponse.json(
      { error: "Failed to finalize assessment" },
      { status: 500 }
    );
  }
}
