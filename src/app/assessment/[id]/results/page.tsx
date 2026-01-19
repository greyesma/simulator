import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { ResultsClient } from "./client";
import type { AssessmentReport } from "@/lib/analysis";

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // Fetch the assessment and verify ownership
  const assessment = await db.assessment.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      scenario: {
        select: {
          name: true,
          companyName: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!assessment) {
    redirect("/");
  }

  // Check if assessment is completed or processing
  if (assessment.status !== "COMPLETED" && assessment.status !== "PROCESSING") {
    // Assessment not ready for results yet
    redirect(`/assessment/${id}/defense`);
  }

  // If no report exists yet, try to generate one
  let report = assessment.report as AssessmentReport | null;

  if (!report && assessment.status === "COMPLETED") {
    // Try to generate the report via API
    // This is a fallback - normally the report is generated during finalization
    try {
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const response = await fetch(`${baseUrl}/api/assessment/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `next-auth.session-token=${session.user.id}`,
        },
        body: JSON.stringify({ assessmentId: id }),
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        report = data.report;
      }
    } catch (error) {
      console.error("Error generating report on results page:", error);
    }
  }

  return (
    <ResultsClient
      assessmentId={id}
      scenarioName={assessment.scenario.name}
      companyName={assessment.scenario.companyName}
      userName={assessment.user?.name || session.user.name || "there"}
      report={report}
      isProcessing={assessment.status === "PROCESSING"}
    />
  );
}
