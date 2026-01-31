import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { JoinPageClient } from "./client";

interface PageProps {
  params: Promise<{ scenarioId: string }>;
}

/**
 * Fetch scenario for join page (public access)
 * Returns scenario info for candidates to view before signing up
 */
async function getScenarioForJoin(scenarioId: string) {
  const scenario = await db.scenario.findUnique({
    where: { id: scenarioId },
    select: {
      id: true,
      name: true,
      companyName: true,
      companyDescription: true,
      taskDescription: true,
      techStack: true,
      isPublished: true,
    },
  });

  if (!scenario || !scenario.isPublished) {
    return null;
  }

  return {
    id: scenario.id,
    name: scenario.name,
    companyName: scenario.companyName,
    companyDescription: scenario.companyDescription,
    taskDescription: scenario.taskDescription,
    techStack: scenario.techStack,
  };
}

/**
 * Check if user has existing assessment for this scenario
 */
async function getExistingAssessment(userId: string, scenarioId: string) {
  const assessment = await db.assessment.findFirst({
    where: {
      userId,
      scenarioId,
    },
    select: {
      id: true,
      status: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return assessment;
}

/**
 * Join page for candidates to enter a simulation
 * This is the main entry point shared by recruiters via /join/[scenarioId]
 */
export default async function JoinPage({ params }: PageProps) {
  const { scenarioId } = await params;

  // Get scenario data (public)
  const scenario = await getScenarioForJoin(scenarioId);

  if (!scenario) {
    notFound();
  }

  // Check if user is logged in
  const session = await auth();
  const user = session?.user;

  // If logged in, check for existing assessment
  let existingAssessment = null;
  if (user?.id) {
    existingAssessment = await getExistingAssessment(user.id, scenarioId);
  }

  return (
    <JoinPageClient
      scenario={scenario}
      user={user?.id ? { id: user.id, email: user.email ?? undefined } : null}
      existingAssessment={existingAssessment}
    />
  );
}
