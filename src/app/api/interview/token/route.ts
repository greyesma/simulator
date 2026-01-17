import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import {
  generateEphemeralToken,
  HR_PERSONA_SYSTEM_PROMPT,
} from "@/lib/gemini";
import { getSignedResumeUrl } from "@/lib/storage";
import {
  formatProfileForPrompt,
  profileFromPrismaJson,
} from "@/lib/cv-parser";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { assessmentId } = body;

    if (!assessmentId) {
      return NextResponse.json(
        { error: "Assessment ID is required" },
        { status: 400 }
      );
    }

    // Fetch the assessment and verify ownership
    const assessment = await db.assessment.findFirst({
      where: {
        id: assessmentId,
        userId: session.user.id,
      },
      include: {
        scenario: true,
        user: {
          select: {
            name: true,
            email: true,
            cvUrl: true,
            parsedProfile: true,
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Get CV content if available
    let cvContext = "";

    // First, try to use the parsed profile from Assessment (if CV was uploaded during assessment)
    // Then fallback to User's parsed profile (if CV was uploaded from profile page)
    const parsedProfileJson = assessment.parsedProfile || assessment.user.parsedProfile;

    if (parsedProfileJson) {
      try {
        const profile = profileFromPrismaJson(parsedProfileJson);
        if (profile) {
          cvContext = `

## Candidate's CV/Resume
The following is the parsed content from the candidate's CV. Use this information to ask specific questions about their experience, verify claims, and assess their background.

${formatProfileForPrompt(profile)}

Please reference specific details from their CV during the interview. Ask follow-up questions about their work experience, projects, and skills.`;
        }
      } catch (error) {
        console.error("Error parsing stored profile:", error);
      }
    }

    // Fallback to basic info if no parsed profile
    // Check both assessment.cvUrl and user.cvUrl
    const cvUrl = assessment.cvUrl || assessment.user.cvUrl;
    if (!cvContext && cvUrl) {
      cvContext = `

## Candidate's CV
The candidate has uploaded their CV/resume. Basic details from their application:
- Candidate Name: ${assessment.user.name || "Not provided"}
- Email: ${assessment.user.email || "Not provided"}

Note: The CV content could not be parsed. Please ask the candidate to describe their background and experience verbally.`;
    }

    // Build the full system instruction with scenario context
    const systemInstruction = `${HR_PERSONA_SYSTEM_PROMPT}

## Interview Context
- Company: ${assessment.scenario.companyName}
- Role: Software Engineer position
- Company Description: ${assessment.scenario.companyDescription}
${cvContext}

Start the interview now by introducing yourself and the company.`;

    // Generate ephemeral token for client-side connection
    const token = await generateEphemeralToken({
      systemInstruction,
    });

    return NextResponse.json({
      token,
      assessmentId: assessment.id,
      scenarioName: assessment.scenario.name,
      companyName: assessment.scenario.companyName,
    });
  } catch (error) {
    console.error("Error generating interview token:", error);
    return NextResponse.json(
      { error: "Failed to initialize interview" },
      { status: 500 }
    );
  }
}
