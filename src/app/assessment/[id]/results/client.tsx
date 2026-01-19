"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Award,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Target,
  TrendingUp,
  Clock,
  Users,
  Bot,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import type {
  AssessmentReport,
  SkillScore,
} from "@/lib/analysis";

interface ResultsClientProps {
  assessmentId: string;
  scenarioName: string;
  companyName: string;
  userName: string;
  report: AssessmentReport | null;
  isProcessing: boolean;
}

function SkillScoreBar({
  score,
  maxScore = 5,
}: {
  score: number;
  maxScore?: number;
}) {
  const segments = Array.from({ length: maxScore }, (_, i) => i + 1);

  return (
    <div className="flex gap-1">
      {segments.map((segment) => (
        <div
          key={segment}
          className={`h-3 flex-1 ${
            segment <= score ? "bg-secondary" : "bg-muted"
          } border border-foreground`}
        />
      ))}
    </div>
  );
}

function SkillCard({
  skill,
  isExpanded,
  onToggle,
}: {
  skill: SkillScore;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const categoryLabels: Record<string, string> = {
    communication: "Communication",
    problem_decomposition: "Problem Decomposition",
    ai_leverage: "AI Leverage",
    code_quality: "Code Quality",
    xfn_collaboration: "XFN Collaboration",
    time_management: "Time Management",
    technical_decision_making: "Technical Decision-Making",
    presentation: "Presentation",
  };

  const levelColors: Record<string, string> = {
    exceptional: "bg-secondary text-secondary-foreground",
    strong: "bg-green-100 text-green-800 border-green-800",
    adequate: "bg-blue-100 text-blue-800 border-blue-800",
    developing: "bg-yellow-100 text-yellow-800 border-yellow-800",
    needs_improvement: "bg-red-100 text-red-800 border-red-800",
  };

  return (
    <div className="border-2 border-foreground">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 hover:bg-muted"
      >
        <div className="flex flex-1 items-center gap-4">
          <div className="min-w-[200px] text-left font-bold">
            {categoryLabels[skill.category] || skill.category}
          </div>
          <div className="max-w-xs flex-1">
            <SkillScoreBar score={skill.score} />
          </div>
          <div className="font-mono text-lg font-bold">{skill.score}/5</div>
          <span
            className={`border px-2 py-1 font-mono text-xs ${levelColors[skill.level] || "bg-muted"}`}
          >
            {skill.level.replace("_", " ").toUpperCase()}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-border bg-muted px-4 pb-4 pt-2">
          <p className="mb-3 text-sm text-muted-foreground">{skill.notes}</p>
          {skill.evidence.length > 0 && (
            <div>
              <h5 className="mb-2 font-mono text-xs text-muted-foreground">
                EVIDENCE
              </h5>
              <ul className="space-y-1">
                {skill.evidence.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-secondary">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OverallScoreDisplay({
  score,
  level,
}: {
  score: number;
  level: string;
}) {
  const levelLabels: Record<string, { label: string; color: string }> = {
    exceptional: { label: "Exceptional", color: "text-secondary" },
    strong: { label: "Strong", color: "text-green-600" },
    adequate: { label: "Adequate", color: "text-blue-600" },
    developing: { label: "Developing", color: "text-yellow-600" },
    needs_improvement: { label: "Needs Improvement", color: "text-red-600" },
  };

  const config = levelLabels[level] || {
    label: level,
    color: "text-foreground",
  };

  return (
    <div className="py-8 text-center">
      <div className="inline-flex h-32 w-32 items-center justify-center border-4 border-foreground bg-background">
        <div>
          <div className="text-5xl font-bold">{score}</div>
          <div className="font-mono text-sm text-muted-foreground">/5</div>
        </div>
      </div>
      <div className={`mt-4 text-2xl font-bold ${config.color}`}>
        {config.label}
      </div>
    </div>
  );
}

function MetricsGrid({ metrics }: { metrics: AssessmentReport["metrics"] }) {
  const testStatusIcons: Record<string, React.ReactNode> = {
    passing: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    failing: <XCircle className="h-5 w-5 text-red-600" />,
    none: <AlertCircle className="h-5 w-5 text-muted-foreground" />,
    unknown: <AlertCircle className="h-5 w-5 text-muted-foreground" />,
  };

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {metrics.totalDurationMinutes !== null && (
        <div className="border-2 border-border p-4">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="font-mono text-xs">TOTAL TIME</span>
          </div>
          <div className="text-xl font-bold">
            {metrics.totalDurationMinutes} min
          </div>
        </div>
      )}

      {metrics.workingPhaseMinutes !== null && (
        <div className="border-2 border-border p-4">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <Target className="h-4 w-4" />
            <span className="font-mono text-xs">WORKING PHASE</span>
          </div>
          <div className="text-xl font-bold">
            {metrics.workingPhaseMinutes} min
          </div>
        </div>
      )}

      <div className="border-2 border-border p-4">
        <div className="mb-2 flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="font-mono text-xs">COWORKERS</span>
        </div>
        <div className="text-xl font-bold">{metrics.coworkersContacted}</div>
      </div>

      <div className="border-2 border-border p-4">
        <div className="mb-2 flex items-center gap-2 text-muted-foreground">
          <Bot className="h-4 w-4" />
          <span className="font-mono text-xs">AI TOOLS</span>
        </div>
        <div className="text-xl font-bold">
          {metrics.aiToolsUsed ? "Yes" : "No"}
        </div>
      </div>

      <div className="border-2 border-border p-4">
        <div className="mb-2 flex items-center gap-2 text-muted-foreground">
          {testStatusIcons[metrics.testsStatus]}
          <span className="font-mono text-xs">CI TESTS</span>
        </div>
        <div className="text-xl font-bold capitalize">
          {metrics.testsStatus}
        </div>
      </div>

      {metrics.codeReviewScore !== null && (
        <div className="border-2 border-border p-4">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <Award className="h-4 w-4" />
            <span className="font-mono text-xs">CODE REVIEW</span>
          </div>
          <div className="text-xl font-bold">{metrics.codeReviewScore}/5</div>
        </div>
      )}
    </div>
  );
}

function ProcessingState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="max-w-md border-2 border-foreground p-12 text-center">
        <div className="mx-auto mb-6 h-16 w-16 animate-spin border-4 border-secondary border-t-transparent" />
        <h2 className="mb-4 text-2xl font-bold">Processing Your Assessment</h2>
        <p className="mb-6 text-muted-foreground">
          We&apos;re analyzing your performance and generating your personalized
          report. This usually takes less than a minute.
        </p>
        <button
          onClick={onRetry}
          className="mx-auto flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>
    </div>
  );
}

function NoReportState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="max-w-md border-2 border-foreground p-12 text-center">
        <AlertCircle className="mx-auto mb-6 h-16 w-16 text-secondary" />
        <h2 className="mb-4 text-2xl font-bold">Report Not Ready</h2>
        <p className="mb-6 text-muted-foreground">
          Your assessment report is still being generated. Click below to check
          again.
        </p>
        <button
          onClick={onGenerate}
          className="border-2 border-foreground bg-foreground px-6 py-3 font-bold text-background hover:border-secondary hover:bg-secondary hover:text-secondary-foreground"
        >
          Generate Report
        </button>
      </div>
    </div>
  );
}

export function ResultsClient({
  assessmentId,
  scenarioName,
  companyName,
  userName,
  report: initialReport,
  isProcessing,
}: ResultsClientProps) {
  const router = useRouter();
  const [report, setReport] = useState<AssessmentReport | null>(initialReport);
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
  const [_isLoading, setIsLoading] = useState(false);

  // Poll for report if processing
  useEffect(() => {
    if (!isProcessing || report) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/assessment/report?assessmentId=${assessmentId}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.report) {
            setReport(data.report);
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error("Error polling for report:", error);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [assessmentId, isProcessing, report]);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/assessment/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId }),
      });

      if (response.ok) {
        const data = await response.json();
        setReport(data.report);
      }
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    router.refresh();
  };

  const toggleSkill = (category: string) => {
    setExpandedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (report) {
      setExpandedSkills(new Set(report.skillScores.map((s) => s.category)));
    }
  };

  const collapseAll = () => {
    setExpandedSkills(new Set());
  };

  // Show processing state
  if (isProcessing && !report) {
    return <ProcessingState onRetry={handleRetry} />;
  }

  // Show no report state
  if (!report) {
    return <NoReportState onGenerate={handleGenerateReport} />;
  }

  const formattedDate = new Date(report.generatedAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b-2 border-foreground bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-mono text-sm">Back to Profile</span>
            </Link>
          </div>
          <div className="text-right">
            <h1 className="font-bold">Assessment Results</h1>
            <p className="font-mono text-xs text-muted-foreground">
              {formattedDate}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Hero Section */}
        <section className="mb-8 border-2 border-foreground p-8">
          <div className="flex flex-col items-center gap-8 md:flex-row">
            <div className="flex-1">
              <div className="mb-4 inline-block bg-secondary px-3 py-1 font-mono text-xs text-secondary-foreground">
                {companyName}
              </div>
              <h2 className="mb-2 text-3xl font-bold">{scenarioName}</h2>
              <p className="text-muted-foreground">
                Great work, {userName}! Here&apos;s your detailed assessment
                breakdown.
              </p>
            </div>
            <OverallScoreDisplay
              score={report.overallScore}
              level={report.overallLevel}
            />
          </div>
        </section>

        {/* Metrics */}
        <section className="mb-8">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Target className="h-5 w-5 text-secondary" />
            Session Metrics
          </h3>
          <MetricsGrid metrics={report.metrics} />
        </section>

        {/* Skill Breakdown */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xl font-bold">
              <TrendingUp className="h-5 w-5 text-secondary" />
              Skill Breakdown
            </h3>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="font-mono text-xs text-muted-foreground hover:text-foreground"
              >
                Expand All
              </button>
              <span className="text-muted-foreground">|</span>
              <button
                onClick={collapseAll}
                className="font-mono text-xs text-muted-foreground hover:text-foreground"
              >
                Collapse All
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {report.skillScores.map((skill) => (
              <SkillCard
                key={skill.category}
                skill={skill}
                isExpanded={expandedSkills.has(skill.category)}
                onToggle={() => toggleSkill(skill.category)}
              />
            ))}
          </div>
        </section>

        {/* Narrative Feedback */}
        <section className="mb-8">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Award className="h-5 w-5 text-secondary" />
            Narrative Feedback
          </h3>

          <div className="border-2 border-foreground">
            {/* Summary */}
            <div className="border-b border-border p-6">
              <h4 className="mb-3 font-mono text-xs text-muted-foreground">
                OVERALL SUMMARY
              </h4>
              <div className="prose prose-sm max-w-none">
                {report.narrative.overallSummary
                  .split("\n\n")
                  .map((paragraph, i) => (
                    <p key={i} className="mb-3 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
              </div>
            </div>

            {/* Strengths */}
            <div className="border-b border-border bg-green-50 p-6">
              <h4 className="mb-3 flex items-center gap-2 font-mono text-xs text-green-800">
                <CheckCircle2 className="h-4 w-4" />
                STRENGTHS
              </h4>
              <ul className="space-y-2">
                {report.narrative.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 text-green-600">+</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="border-b border-border bg-yellow-50 p-6">
              <h4 className="mb-3 flex items-center gap-2 font-mono text-xs text-yellow-800">
                <TrendingUp className="h-4 w-4" />
                AREAS FOR IMPROVEMENT
              </h4>
              <ul className="space-y-2">
                {report.narrative.areasForImprovement.map((area, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 text-yellow-600">•</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Notable Observations */}
            {report.narrative.notableObservations.length > 0 && (
              <div className="bg-blue-50 p-6">
                <h4 className="mb-3 flex items-center gap-2 font-mono text-xs text-blue-800">
                  <AlertCircle className="h-4 w-4" />
                  NOTABLE OBSERVATIONS
                </h4>
                <ul className="space-y-2">
                  {report.narrative.notableObservations.map(
                    (observation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1 text-blue-600">*</span>
                        <span>{observation}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Recommendations */}
        <section className="mb-8">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Target className="h-5 w-5 text-secondary" />
            Recommendations
          </h3>

          <div className="space-y-4">
            {report.recommendations.map((rec, index) => {
              const priorityColors: Record<string, string> = {
                high: "bg-red-100 text-red-800 border-red-800",
                medium: "bg-yellow-100 text-yellow-800 border-yellow-800",
                low: "bg-green-100 text-green-800 border-green-800",
              };

              return (
                <div key={index} className="border-2 border-foreground p-6">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <h4 className="text-lg font-bold">{rec.title}</h4>
                    <span
                      className={`border px-2 py-1 font-mono text-xs ${priorityColors[rec.priority]}`}
                    >
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="mb-4 text-muted-foreground">
                    {rec.description}
                  </p>
                  <div>
                    <h5 className="mb-2 font-mono text-xs text-muted-foreground">
                      ACTION STEPS
                    </h5>
                    <ol className="space-y-2">
                      {rec.actionableSteps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start gap-3">
                          <span className="font-mono text-sm font-bold text-secondary">
                            {stepIndex + 1}.
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer Actions */}
        <section className="mt-8 border-t-2 border-foreground pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              Assessment ID: <span className="font-mono">{assessmentId}</span>
            </p>
            <div className="flex gap-4">
              <Link
                href="/profile"
                className="border-2 border-foreground bg-muted px-6 py-3 font-semibold text-foreground hover:bg-foreground hover:text-background"
              >
                Back to Profile
              </Link>
              <Link
                href="/"
                className="border-2 border-foreground bg-secondary px-6 py-3 font-bold text-secondary-foreground hover:bg-foreground hover:text-background"
              >
                Start New Assessment
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
