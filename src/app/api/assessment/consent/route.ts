import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";

/**
 * POST /api/assessment/consent
 * Record user consent for an assessment (screen recording, voice recording, CV storage)
 */
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { assessmentId } = await request.json();

    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID is required" },
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

    // Check if consent was already given
    if (assessment.consentGivenAt) {
      return NextResponse.json({
        success: true,
        message: "Consent already recorded",
        consentGivenAt: assessment.consentGivenAt,
      });
    }

    // Record consent
    const updated = await db.assessment.update({
      where: { id: assessmentId },
      data: { consentGivenAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "Consent recorded successfully",
      consentGivenAt: updated.consentGivenAt,
    });
  } catch (error) {
    console.error("Error recording consent:", error);
    return NextResponse.json(
      { error: "Failed to record consent" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/assessment/consent
 * Check consent status for an assessment
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const assessmentId = searchParams.get("assessmentId");

  if (!assessmentId) {
    return NextResponse.json(
      { error: "Assessment ID is required" },
      { status: 400 }
    );
  }

  try {
    const assessment = await db.assessment.findFirst({
      where: {
        id: assessmentId,
        userId: session.user.id,
      },
      select: {
        id: true,
        consentGivenAt: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      hasConsent: !!assessment.consentGivenAt,
      consentGivenAt: assessment.consentGivenAt,
    });
  } catch (error) {
    console.error("Error checking consent:", error);
    return NextResponse.json(
      { error: "Failed to check consent status" },
      { status: 500 }
    );
  }
}
