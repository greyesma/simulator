"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ConsentClientProps {
  assessmentId: string;
  scenarioName: string;
  companyName: string;
}

function DataCollectionItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 p-4 border-2 border-border">
      <div className="w-12 h-12 bg-secondary flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-bold mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}

export function ConsentClient({
  assessmentId,
  scenarioName,
  companyName,
}: ConsentClientProps) {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);
  const [hasRead, setHasRead] = useState(false);
  const [error, setError] = useState("");

  const handleAccept = async () => {
    if (!hasRead) {
      setError("Please confirm you have read the privacy policy");
      return;
    }

    setIsAccepting(true);
    setError("");

    try {
      const response = await fetch("/api/assessment/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to record consent");
      }

      // Redirect to CV upload
      router.push(`/assessment/${assessmentId}/cv-upload`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsAccepting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Decorative triangles */}
      <div className="relative">
        <div
          className="absolute -top-16 -right-16 w-32 h-32 bg-secondary opacity-20"
          style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
        />
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-block border-2 border-border px-4 py-2 mb-6">
          <span className="font-mono text-sm">BEFORE YOU START</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Privacy & Consent</h1>
        <p className="text-muted-foreground text-lg">
          To provide you with accurate feedback on your <span className="text-secondary font-semibold">{scenarioName}</span> assessment
          at <span className="font-semibold">{companyName}</span>, we need to collect some data during the session.
        </p>
      </div>

      {/* Data collection items */}
      <div className="space-y-4 mb-8">
        <DataCollectionItem
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          }
          title="Screen Recording"
          description="Your screen will be recorded during the coding task portion of the assessment. This helps us understand your problem-solving approach and tool usage."
        />

        <DataCollectionItem
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          }
          title="Voice Recording"
          description="Your voice conversations during the HR interview, manager kickoff, and PR defense will be recorded and transcribed for assessment purposes."
        />

        <DataCollectionItem
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
          title="CV/Resume Storage"
          description="If you upload your CV/resume, it will be stored securely and used to provide context during the HR interview and for assessment purposes."
        />
      </div>

      {/* Privacy policy link and checkbox */}
      <div className="border-2 border-border p-6 mb-6 bg-accent/10">
        <label className="flex items-start gap-4 cursor-pointer">
          <input
            type="checkbox"
            checked={hasRead}
            onChange={(e) => {
              setHasRead(e.target.checked);
              setError("");
            }}
            className="w-6 h-6 mt-0.5 border-2 border-border bg-background appearance-none cursor-pointer checked:bg-secondary checked:border-secondary"
            style={{
              backgroundImage: hasRead
                ? `url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='black' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3E%3C/svg%3E")`
                : "none",
            }}
          />
          <span className="text-sm">
            I have read and agree to the{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="text-secondary font-semibold border-b-2 border-secondary hover:opacity-80"
            >
              Privacy Policy
            </Link>
            . I understand that my screen, voice, and uploaded documents will be
            recorded and analyzed to provide assessment feedback.
          </span>
        </label>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 border-2 border-destructive bg-destructive/10 text-destructive font-mono text-sm">
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-4">
        <Link
          href="/profile"
          className="flex-1 text-center px-6 py-4 font-semibold border-2 border-border hover:bg-accent"
        >
          Cancel
        </Link>
        <button
          onClick={handleAccept}
          disabled={isAccepting}
          className="flex-1 bg-foreground text-background px-6 py-4 font-semibold border-2 border-foreground hover:bg-secondary hover:text-secondary-foreground hover:border-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAccepting ? "Processing..." : "Accept & Continue"}
        </button>
      </div>

      {/* Data rights notice */}
      <p className="mt-6 text-center text-muted-foreground text-sm">
        You can request deletion of your data at any time from your{" "}
        <Link
          href="/profile"
          className="text-foreground border-b border-border hover:border-secondary"
        >
          profile settings
        </Link>
        .
      </p>
    </div>
  );
}
