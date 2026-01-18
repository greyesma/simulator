"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CongratulationsClientProps {
  assessmentId: string;
  userName: string;
  companyName: string;
  scenarioName: string;
}

export function CongratulationsClient({
  assessmentId,
  userName,
  companyName,
  scenarioName,
}: CongratulationsClientProps) {
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(10);

  // Sharp, stepped animation sequence (no smooth transitions)
  useEffect(() => {
    // Each step appears instantly after a delay
    const timers = [
      setTimeout(() => setShowContent(true), 100),
      setTimeout(() => setShowBadge(true), 300),
      setTimeout(() => setShowMessage(true), 600),
      setTimeout(() => setShowDetails(true), 900),
      setTimeout(() => setShowButton(true), 1200),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  // Auto-advance countdown
  useEffect(() => {
    if (!showButton) return;

    const interval = setInterval(() => {
      setAutoAdvanceTimer((prev) => {
        if (prev <= 1) {
          router.push(`/assessment/${assessmentId}/welcome`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showButton, assessmentId, router]);

  const handleContinue = () => {
    router.push(`/assessment/${assessmentId}/welcome`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Decorative geometric shapes - neo-brutalist style */}
      <div
        className="absolute left-0 top-0 h-32 w-32 border-2 border-foreground bg-secondary"
        style={{
          clipPath: "polygon(0 0, 100% 0, 0 100%)",
          opacity: showContent ? 1 : 0,
        }}
      />
      <div
        className="absolute right-0 top-0 h-24 w-24 bg-foreground"
        style={{
          clipPath: "polygon(100% 0, 100% 100%, 0 0)",
          opacity: showContent ? 1 : 0,
        }}
      />
      <div
        className="absolute bottom-0 right-0 h-40 w-40 border-2 border-foreground bg-secondary"
        style={{
          clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
          opacity: showContent ? 1 : 0,
        }}
      />
      <div
        className="absolute bottom-0 left-0 h-20 w-20 bg-foreground"
        style={{
          clipPath: "polygon(0 0, 100% 100%, 0 100%)",
          opacity: showContent ? 1 : 0,
        }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-xl text-center">
        {/* Celebratory badge */}
        <div
          className="mb-8"
          style={{
            opacity: showBadge ? 1 : 0,
            transform: showBadge ? "scale(1)" : "scale(0)",
          }}
        >
          <div className="inline-block border-4 border-foreground bg-secondary p-6">
            <div className="text-6xl font-bold text-secondary-foreground">
              &#10003;
            </div>
          </div>
        </div>

        {/* Main message */}
        <div
          style={{
            opacity: showMessage ? 1 : 0,
            transform: showMessage ? "translateY(0)" : "translateY(-20px)",
          }}
        >
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Congratulations, {userName}!
          </h1>
          <p className="mb-2 text-2xl md:text-3xl">
            <span className="inline-block bg-foreground px-3 py-1 text-secondary">
              You got the job!
            </span>
          </p>
        </div>

        {/* Job details */}
        <div
          className="mb-8 mt-8"
          style={{
            opacity: showDetails ? 1 : 0,
          }}
        >
          <div className="inline-block border-2 border-foreground bg-muted p-6">
            <p className="mb-2 text-sm uppercase tracking-wider text-muted-foreground">
              Your new role
            </p>
            <p className="mb-1 text-xl font-bold">{scenarioName}</p>
            <p className="text-muted-foreground">at {companyName}</p>
          </div>
        </div>

        {/* Continue button with auto-advance */}
        <div
          style={{
            opacity: showButton ? 1 : 0,
          }}
        >
          <button
            onClick={handleContinue}
            className="border-4 border-foreground bg-foreground px-8 py-4 text-lg font-bold text-background hover:bg-secondary hover:text-secondary-foreground"
          >
            Start Your First Day
          </button>
          <p className="mt-4 font-mono text-sm text-muted-foreground">
            Auto-advancing in {autoAdvanceTimer}s...
          </p>
        </div>
      </div>
    </div>
  );
}
