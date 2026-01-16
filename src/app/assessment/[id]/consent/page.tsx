import { auth } from "@/auth";
import { db } from "@/server/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ConsentClient } from "./client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ConsentPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=/assessment/${id}/consent`);
  }

  // Fetch the assessment
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
    },
  });

  if (!assessment) {
    notFound();
  }

  // If consent was already given, redirect to HR interview
  if (assessment.consentGivenAt) {
    redirect(`/assessment/${id}/hr-interview`);
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b-2 border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-bold text-xl">
              Skillvee
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-mono text-sm text-muted-foreground">
              {assessment.scenario.name}
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/profile"
              className="text-muted-foreground hover:text-foreground font-mono text-sm"
            >
              Profile
            </Link>
          </nav>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="border-b-2 border-border">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                0
              </div>
              <span className="font-semibold">Consent</span>
            </div>
            <div className="h-px flex-1 bg-border" />
            <div className="flex items-center gap-2 opacity-40">
              <div className="w-8 h-8 border-2 border-border flex items-center justify-center font-bold">
                1
              </div>
              <span>HR Interview</span>
            </div>
            <div className="h-px flex-1 bg-border" />
            <div className="flex items-center gap-2 opacity-40">
              <div className="w-8 h-8 border-2 border-border flex items-center justify-center font-bold">
                2
              </div>
              <span>Manager Kickoff</span>
            </div>
            <div className="h-px flex-1 bg-border" />
            <div className="flex items-center gap-2 opacity-40">
              <div className="w-8 h-8 border-2 border-border flex items-center justify-center font-bold">
                3
              </div>
              <span>Coding Task</span>
            </div>
            <div className="h-px flex-1 bg-border" />
            <div className="flex items-center gap-2 opacity-40">
              <div className="w-8 h-8 border-2 border-border flex items-center justify-center font-bold">
                4
              </div>
              <span>PR Defense</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <ConsentClient
          assessmentId={id}
          scenarioName={assessment.scenario.name}
          companyName={assessment.scenario.companyName}
        />
      </div>
    </main>
  );
}
