import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { AssessmentStatus } from "@prisma/client";

/**
 * Smart redirect page that handles assessment start flow:
 * - If not authenticated → redirect to sign-in
 * - If authenticated with in-progress assessment → resume where they left off
 * - If authenticated with no in-progress assessment → create new assessment → redirect to CV upload
 * - If no published scenarios exist → show message
 */
export default async function StartPage() {
  const session = await auth();

  // If not authenticated, redirect to sign-in with callback to /start
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/start");
  }

  const userId = session.user.id;

  // Find most recent in-progress assessment (any status except COMPLETED)
  const existingAssessment = await db.assessment.findFirst({
    where: {
      userId,
      status: {
        not: AssessmentStatus.COMPLETED,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      scenario: {
        include: {
          coworkers: true,
        },
      },
    },
  });

  // If user has an in-progress assessment, redirect to appropriate page
  if (existingAssessment) {
    // Find manager for WORKING status redirect
    const manager = existingAssessment.scenario.coworkers.find((c) =>
      c.role.toLowerCase().includes("manager")
    );
    const redirectUrl = getRedirectUrlForStatus(
      existingAssessment.id,
      existingAssessment.status,
      manager?.id
    );
    redirect(redirectUrl);
  }

  // No in-progress assessment - find the default published scenario
  const publishedScenario = await db.scenario.findFirst({
    where: {
      isPublished: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // If no published scenarios exist, show message
  if (!publishedScenario) {
    return <NoScenariosMessage />;
  }

  // Create new assessment for the published scenario
  const newAssessment = await db.assessment.create({
    data: {
      userId,
      scenarioId: publishedScenario.id,
      status: AssessmentStatus.HR_INTERVIEW,
    },
  });

  // Redirect to CV upload page for new assessment
  redirect(`/assessment/${newAssessment.id}/cv-upload`);
}

/**
 * Determines the redirect URL based on assessment status
 */
function getRedirectUrlForStatus(
  assessmentId: string,
  status: AssessmentStatus,
  managerId?: string
): string {
  switch (status) {
    case AssessmentStatus.HR_INTERVIEW:
      // Route to cv-upload which will auto-skip to hr-interview if CV exists
      return `/assessment/${assessmentId}/cv-upload`;
    case AssessmentStatus.ONBOARDING:
      return `/assessment/${assessmentId}/congratulations`;
    case AssessmentStatus.WORKING:
      // Redirect to chat with manager if managerId available, otherwise fallback to welcome
      return managerId
        ? `/chat?coworkerId=${managerId}`
        : `/assessment/${assessmentId}/welcome`;
    case AssessmentStatus.FINAL_DEFENSE:
      return `/assessment/${assessmentId}/defense`;
    case AssessmentStatus.PROCESSING:
      return `/assessment/${assessmentId}/processing`;
    default:
      // Fallback to CV upload if unknown status
      return `/assessment/${assessmentId}/cv-upload`;
  }
}

/**
 * Message displayed when no published scenarios are available
 */
function NoScenariosMessage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="max-w-md text-center">
        <div className="border-2 border-border p-8">
          <div className="mb-6">
            <div
              className="mx-auto h-16 w-16 bg-secondary"
              style={{
                clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              }}
            />
          </div>
          <h1 className="mb-4 text-2xl font-bold">No Assessments Available</h1>
          <p className="mb-6 text-muted-foreground">
            We&apos;re working on preparing new assessment scenarios. Please
            check back soon.
          </p>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            className="inline-block border-2 border-foreground bg-foreground px-6 py-3 font-semibold text-background hover:border-secondary hover:bg-secondary hover:text-secondary-foreground"
          >
            Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}
