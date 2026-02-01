import { requireRecruiter } from "@/lib/core";
import { db } from "@/server/db";
import { VideoAssessmentStatus } from "@prisma/client";
import { RecruiterCandidatesClient } from "./client";

/**
 * Calculate strength level from overall score (1-5 scale)
 */
function getStrengthLevel(
  overallScore: number
): "Exceptional" | "Strong" | "Proficient" | "Developing" {
  if (overallScore >= 4.5) return "Exceptional";
  if (overallScore >= 3.5) return "Strong";
  if (overallScore >= 2.5) return "Proficient";
  return "Developing";
}

/**
 * Fetch all candidates who have taken assessments for the recruiter's scenarios
 */
async function getRecruiterCandidates(recruiterId: string) {
  // Get scenarios owned by this recruiter
  const scenarios = await db.scenario.findMany({
    where: { createdById: recruiterId },
    select: { id: true },
  });

  const scenarioIds = scenarios.map((s) => s.id);

  if (scenarioIds.length === 0) {
    return [];
  }

  // Get all assessments for recruiter's scenarios with user, scenario, and video assessment info
  const assessments = await db.assessment.findMany({
    where: { scenarioId: { in: scenarioIds } },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      scenario: { select: { id: true, name: true } },
      videoAssessment: {
        include: {
          scores: {
            select: { score: true },
          },
        },
      },
    },
  });

  return assessments.map((assessment) => {
    // Calculate score data only for completed assessments with video assessments
    const hasCompletedVideoAssessment =
      assessment.status === "COMPLETED" &&
      assessment.videoAssessment?.status === VideoAssessmentStatus.COMPLETED &&
      assessment.videoAssessment.scores.length > 0;

    let overallScore: number | null = null;
    let strengthLevel: "Exceptional" | "Strong" | "Proficient" | "Developing" | null = null;

    if (hasCompletedVideoAssessment && assessment.videoAssessment) {
      const scores = assessment.videoAssessment.scores;
      overallScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
      strengthLevel = getStrengthLevel(overallScore);
    }

    // Get percentile from stored report if available
    let overallPercentile: number | null = null;
    if (hasCompletedVideoAssessment && assessment.report) {
      const report = assessment.report as Record<string, unknown>;
      const percentiles = report.percentiles as
        | { overall: number }
        | undefined;
      if (percentiles?.overall !== undefined) {
        overallPercentile = percentiles.overall;
      }
    }

    return {
      id: assessment.id,
      status: assessment.status,
      createdAt: assessment.createdAt.toISOString(),
      completedAt: assessment.completedAt?.toISOString() ?? null,
      user: {
        name: assessment.user.name,
        email: assessment.user.email,
      },
      scenario: {
        id: assessment.scenario.id,
        name: assessment.scenario.name,
      },
      // Score data for completed assessments
      overallScore,
      overallPercentile,
      strengthLevel,
    };
  });
}

/**
 * Get unique scenarios for filtering
 */
async function getRecruiterScenarioOptions(recruiterId: string) {
  const scenarios = await db.scenario.findMany({
    where: { createdById: recruiterId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return scenarios;
}

export default async function RecruiterCandidatesPage() {
  const user = await requireRecruiter();

  const [candidates, scenarioOptions] = await Promise.all([
    getRecruiterCandidates(user.id),
    getRecruiterScenarioOptions(user.id),
  ]);

  return (
    <RecruiterCandidatesClient
      candidates={candidates}
      scenarioOptions={scenarioOptions}
    />
  );
}
