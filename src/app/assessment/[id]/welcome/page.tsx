import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { getAssessmentForWelcome } from "@/server/queries/assessment";
import { WelcomePageClient } from "./client";

interface WelcomePageProps {
  params: Promise<{ id: string }>;
}

export default async function WelcomePage({ params }: WelcomePageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const { id } = await params;

  const assessment = await getAssessmentForWelcome(id, session.user.id);

  // Page guard: assessment not found or belongs to someone else
  if (!assessment) {
    notFound();
  }

  // If assessment is already COMPLETED: Redirect to results
  if (assessment.status === "COMPLETED") {
    redirect(`/assessment/${id}/results`);
  }

  // Determine if this is a resume (assessment already started)
  const isResume = assessment.status === "WORKING";

  return (
    <WelcomePageClient
      assessmentId={id}
      scenarioName={assessment.scenario.name}
      companyName={assessment.scenario.companyName}
      isResume={isResume}
    />
  );
}
