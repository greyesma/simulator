import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { CongratulationsClient } from "./client";

interface CongratulationsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CongratulationsPage({
  params,
}: CongratulationsPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const { id } = await params;

  const assessment = await db.assessment.findUnique({
    where: { id },
    include: {
      scenario: true,
      conversations: {
        where: {
          coworkerId: null, // HR interview
          type: "voice",
        },
        select: {
          transcript: true,
        },
      },
    },
  });

  if (!assessment || assessment.userId !== session.user.id) {
    redirect("/profile");
  }

  // Only show congratulations if HR interview transcript exists
  const hasCompletedInterview =
    assessment.conversations[0]?.transcript &&
    Array.isArray(assessment.conversations[0].transcript) &&
    assessment.conversations[0].transcript.length > 0;

  if (!hasCompletedInterview) {
    redirect(`/assessment/${id}/hr-interview`);
  }

  const userName = session.user.name?.split(" ")[0] || "there";

  return (
    <CongratulationsClient
      assessmentId={id}
      userName={userName}
      companyName={assessment.scenario.companyName}
      scenarioName={assessment.scenario.name}
    />
  );
}
