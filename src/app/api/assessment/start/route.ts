import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";

/**
 * POST /api/assessment/start
 * Start an assessment - updates status from WELCOME to WORKING
 *
 * Request body:
 * - assessmentId: string - The assessment to start
 *
 * Returns:
 * - assessment: object - The updated assessment
 */
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Parse request body
  let assessmentId: string;
  try {
    const body = await request.json();
    assessmentId = body.assessmentId;

    if (!assessmentId || typeof assessmentId !== "string") {
      return NextResponse.json(
        { error: "assessmentId is required" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Fetch the assessment
  const assessment = await db.assessment.findUnique({
    where: { id: assessmentId },
  });

  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  // Verify ownership
  if (assessment.userId !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // If already WORKING, just return success (idempotent)
  if (assessment.status === "WORKING") {
    return NextResponse.json({ assessment });
  }

  // If COMPLETED, return error - can't restart a completed assessment
  if (assessment.status === "COMPLETED") {
    return NextResponse.json(
      { error: "Assessment is already completed" },
      { status: 400 }
    );
  }

  // Update status to WORKING
  const updatedAssessment = await db.assessment.update({
    where: { id: assessmentId },
    data: {
      status: "WORKING",
    },
  });

  return NextResponse.json({ assessment: updatedAssessment });
}
