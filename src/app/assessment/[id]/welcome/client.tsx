"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Monitor,
  Bot,
  HelpCircle,
  Briefcase,
  ArrowRight,
} from "lucide-react";

interface WelcomePageClientProps {
  assessmentId: string;
  scenarioName: string;
  companyName: string;
  isResume: boolean;
}

export function WelcomePageClient({
  assessmentId,
  scenarioName,
  companyName,
  isResume,
}: WelcomePageClientProps) {
  const router = useRouter();
  const [consentChecked, setConsentChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    if (!consentChecked && !isResume) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update assessment status to WORKING
      const response = await fetch("/api/assessment/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to start assessment");
        setIsLoading(false);
        return;
      }

      // Navigate to chat page
      router.push(`/assessment/${assessmentId}/chat`);
    } catch {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/skillvee-logo.png"
              alt="SkillVee"
              width={160}
              height={40}
              className="mx-auto"
              priority
            />
          </Link>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">
            {isResume ? "Welcome Back" : "Welcome to Your Assessment"}
          </h1>
          <p className="text-stone-600">
            {companyName} - {scenarioName}
          </p>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 lg:p-8 space-y-6">
          {/* What is Skillvee */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900 mb-1">
                What is Skillvee?
              </h2>
              <p className="text-stone-600">
                Skillvee is a realistic day-at-work simulation. You&apos;ll experience
                what it&apos;s like to work on a real task, communicate with AI-powered
                colleagues via Slack, and submit your work for review. This isn&apos;t
                a coding test - it&apos;s an assessment of how you work.
              </p>
            </div>
          </div>

          <hr className="border-stone-200" />

          {/* Screen Recording */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Monitor className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900 mb-1">
                Screen Recording
              </h2>
              <p className="text-stone-600">
                Your screen will be recorded during the assessment. This is how
                we evaluate <strong>how</strong> you work, not just what you produce.
                We&apos;re looking at your problem-solving approach, communication
                style, and overall workflow.
              </p>
            </div>
          </div>

          <hr className="border-stone-200" />

          {/* AI Usage Encouraged */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bot className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900 mb-1">
                AI Usage Encouraged
              </h2>
              <p className="text-stone-600">
                Feel free to use any AI tools you&apos;re comfortable with - GitHub
                Copilot, ChatGPT, Claude, or any other assistants. This reflects
                modern development practices and we want to see how you leverage
                these tools effectively.
              </p>
            </div>
          </div>

          <hr className="border-stone-200" />

          {/* Intentionally Vague */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900 mb-1">
                Intentionally Vague
              </h2>
              <p className="text-stone-600">
                The task context is intentionally incomplete. Part of the assessment
                is seeing how you seek clarification and gather requirements. Don&apos;t
                hesitate to reach out to your colleagues in Slack for more context -
                that&apos;s exactly what we want to see!
              </p>
            </div>
          </div>
        </div>

        {/* Consent Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-stone-200 p-6 lg:p-8">
          {!isResume && (
            <label
              htmlFor="consent"
              className="flex items-start gap-3 mb-6 cursor-pointer"
            >
              <input
                type="checkbox"
                id="consent"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-stone-700 select-none">
                I understand and agree to screen recording and the assessment
                process. I acknowledge that my screen activity will be recorded
                and reviewed as part of this evaluation.
              </span>
            </label>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleStart}
            disabled={(!consentChecked && !isResume) || isLoading}
            size="lg"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {isResume ? "Resuming..." : "Starting..."}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {isResume ? "Resume Simulation" : "Start Simulation"}
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </Button>

          {!isResume && !consentChecked && (
            <p className="text-center text-sm text-stone-500 mt-3">
              Please check the box above to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
