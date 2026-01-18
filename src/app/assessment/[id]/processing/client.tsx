"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Users,
  MessageSquare,
  CheckCircle2,
  Mail,
  Loader2,
  Video,
  AlertCircle,
} from "lucide-react";
import type { ProcessingStats } from "./page";

interface ProcessingClientProps {
  assessmentId: string;
  stats: ProcessingStats;
}

function StatCard({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`border-2 border-foreground p-6 ${highlight ? "bg-secondary" : "bg-background"}`}
    >
      <div className="mb-2 flex items-center gap-3">
        <Icon
          className={`h-5 w-5 ${highlight ? "text-secondary-foreground" : "text-muted-foreground"}`}
        />
        <span
          className={`font-mono text-xs ${highlight ? "text-secondary-foreground" : "text-muted-foreground"}`}
        >
          {label}
        </span>
      </div>
      <div
        className={`text-3xl font-bold ${highlight ? "text-secondary-foreground" : "text-foreground"}`}
      >
        {value}
      </div>
    </div>
  );
}

function CompletionBadge({
  completed,
  label,
}: {
  completed: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-5 w-5 items-center justify-center border-2 border-foreground ${completed ? "bg-secondary" : "bg-muted"}`}
      >
        {completed && (
          <CheckCircle2 className="h-4 w-4 text-secondary-foreground" />
        )}
      </div>
      <span
        className={`font-mono text-sm ${completed ? "text-foreground" : "text-muted-foreground"}`}
      >
        {label}
      </span>
    </div>
  );
}

export function ProcessingClient({
  assessmentId,
  stats,
}: ProcessingClientProps) {
  const router = useRouter();
  const [isPolling, setIsPolling] = useState(true);
  const [dots, setDots] = useState("");

  // Animate loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Poll for report completion
  useEffect(() => {
    if (!isPolling) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/assessment/report?assessmentId=${assessmentId}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.report) {
            setIsPolling(false);
            router.push(`/assessment/${assessmentId}/results`);
          }
        }
      } catch (error) {
        console.error("Error polling for report:", error);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [assessmentId, isPolling, router]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b-2 border-foreground bg-background">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="mb-2 inline-block bg-secondary px-3 py-1 font-mono text-xs text-secondary-foreground">
            {stats.companyName}
          </div>
          <h1 className="text-2xl font-bold">{stats.scenarioName}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Success message */}
        <section className="mb-8 border-2 border-foreground p-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center border-2 border-foreground bg-secondary">
            <CheckCircle2 className="h-10 w-10 text-secondary-foreground" />
          </div>

          <h2 className="mb-4 text-3xl font-bold">
            Great work, {stats.userName}!
          </h2>
          <p className="mx-auto max-w-md text-lg text-muted-foreground">
            Your assessment is complete. We&apos;re analyzing your performance
            and generating your personalized report.
          </p>
        </section>

        {/* Quick stats */}
        <section className="mb-8">
          <h3 className="mb-4 font-mono text-sm text-muted-foreground">
            SESSION SUMMARY
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <StatCard
              icon={Clock}
              label="TIME SPENT"
              value={`${stats.totalDurationMinutes} min`}
              highlight
            />
            <StatCard
              icon={Users}
              label="COWORKERS CONTACTED"
              value={stats.coworkersContacted}
            />
            <StatCard
              icon={MessageSquare}
              label="TOTAL MESSAGES"
              value={stats.totalMessages}
            />
          </div>
        </section>

        {/* Completion checklist */}
        <section className="mb-8 border-2 border-foreground p-6">
          <h3 className="mb-4 font-mono text-sm text-muted-foreground">
            COMPLETED STAGES
          </h3>
          <div className="space-y-3">
            <CompletionBadge
              completed={stats.hasHRInterview}
              label="HR Interview"
            />
            <CompletionBadge completed label="Manager Kickoff" />
            <CompletionBadge
              completed={stats.coworkersContacted > 0}
              label="Team Collaboration"
            />
            <CompletionBadge completed label="Coding Task" />
            <CompletionBadge
              completed={stats.hasDefenseCall}
              label="PR Defense"
            />
          </div>
        </section>

        {/* Processing indicator */}
        <section className="border-2 border-foreground bg-muted p-8">
          <div className="mb-4 flex items-center justify-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin text-secondary" />
            <span className="text-lg font-bold">
              Generating your report{dots}
            </span>
          </div>
          <p className="mx-auto mb-6 max-w-md text-center text-muted-foreground">
            Our AI is analyzing your interview responses, code quality,
            collaboration patterns, and presentation skills.
          </p>

          {/* Video Assessment Status */}
          {stats.videoAssessment && (
            <div className="mb-6 border-t border-border pt-6">
              <div className="flex items-center justify-center gap-3 text-sm">
                {stats.videoAssessment.status === "PENDING" && (
                  <>
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Video assessment queued
                    </span>
                  </>
                )}
                {stats.videoAssessment.status === "PROCESSING" && (
                  <>
                    <div className="relative">
                      <Video className="h-4 w-4 text-secondary" />
                      <Loader2 className="absolute -right-1 -top-1 h-3 w-3 animate-spin text-secondary" />
                    </div>
                    <span className="font-medium text-foreground">
                      Video assessment in progress
                    </span>
                  </>
                )}
                {stats.videoAssessment.status === "COMPLETED" && (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-green-600">
                      Video assessment complete
                    </span>
                  </>
                )}
                {stats.videoAssessment.status === "FAILED" && (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-red-500">
                      Video assessment failed - will be retried
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Email notification */}
          <div className="flex items-center justify-center gap-3 border-t border-border pt-6 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>
              We&apos;ll also send your full report to your email when it&apos;s
              ready.
            </span>
          </div>
        </section>

        {/* Decorative elements */}
        <div className="mt-12 flex justify-center gap-4">
          <div
            className="h-8 w-8 bg-secondary"
            style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
          />
          <div
            className="h-8 w-8 bg-foreground"
            style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
          />
          <div
            className="h-8 w-8 bg-secondary"
            style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
          />
        </div>
      </main>
    </div>
  );
}
