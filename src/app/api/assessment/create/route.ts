import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";

/**
 * POST /api/assessment/create
 * Create a new assessment for a candidate
 *
 * Request body:
 * - scenarioId: string - The scenario to create an assessment for
 *
 * Returns:
 * - assessment: object - The created assessment
 */
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Parse request body
  let scenarioId: string;
  try {
    const body = await request.json();
    scenarioId = body.scenarioId;

    if (!scenarioId || typeof scenarioId !== "string") {
      return NextResponse.json(
        { error: "scenarioId is required" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Fetch the scenario
  const scenario = await db.scenario.findUnique({
    where: { id: scenarioId },
    select: {
      id: true,
      name: true,
      isPublished: true,
    },
  });

  if (!scenario) {
    return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
  }

  // Only allow creating assessments for published scenarios
  if (!scenario.isPublished) {
    return NextResponse.json(
      { error: "Scenario is not available" },
      { status: 400 }
    );
  }

  // Check for existing assessment for this user and scenario
  const existingAssessment = await db.assessment.findFirst({
    where: {
      userId,
      scenarioId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (existingAssessment) {
    // Return existing assessment instead of creating a new one
    return NextResponse.json({
      assessment: existingAssessment,
      isExisting: true,
    });
  }

  // Create new assessment with WORKING status (skips welcome page)
  const assessment = await db.assessment.create({
    data: {
      userId,
      scenarioId,
      status: "WORKING",
    },
  });

  return NextResponse.json(
    {
      assessment,
      isExisting: false,
    },
    { status: 201 }
  );
}
