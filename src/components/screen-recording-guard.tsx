"use client";

import { useEffect, useState } from "react";
import { Monitor, Mic, AlertTriangle, ArrowRight } from "lucide-react";
import { useScreenRecordingContext } from "@/contexts/screen-recording-context";

interface ScreenRecordingGuardProps {
  children: React.ReactNode;
  assessmentId: string;
  companyName?: string;
}

export function ScreenRecordingGuard({
  children,
  assessmentId,
  companyName = "the company",
}: ScreenRecordingGuardProps) {
  const { state, permissionState, isRecording, startRecording, retryRecording } =
    useScreenRecordingContext();
  const [showStoppedModal, setShowStoppedModal] = useState(false);
  const [showInitialModal, setShowInitialModal] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Check if this is a fresh start or if recording was interrupted
  useEffect(() => {
    const wasRecording = sessionStorage.getItem(
      `screen-recording-${assessmentId}`
    );

    if (wasRecording === "active" && state === "stopped") {
      // Recording was active but stopped (user closed screen share)
      setShowStoppedModal(true);
      setShowInitialModal(false);
    } else if (state === "stopped" && permissionState === "stopped") {
      // Recording stopped after being active
      setShowStoppedModal(true);
      setShowInitialModal(false);
    } else if (isRecording) {
      // Recording is active
      setShowStoppedModal(false);
      setShowInitialModal(false);
    } else if (state === "idle" && !wasRecording) {
      // Fresh start - show initial consent modal
      setShowInitialModal(true);
      setShowStoppedModal(false);
    }
  }, [state, permissionState, isRecording, assessmentId]);

  const handleRetry = async () => {
    setIsRetrying(true);
    const success = await retryRecording();
    setIsRetrying(false);
    if (success) {
      setShowStoppedModal(false);
    }
  };

  const handleAcceptAndStart = async () => {
    setIsStarting(true);
    const success = await startRecording();
    setIsStarting(false);
    if (success) {
      setShowInitialModal(false);
    }
  };

  // Initial consent modal (before recording starts)
  if (showInitialModal) {
    return (
      <>
        <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            {/* Icons */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-4">
                <div className="bg-secondary border-4 border-foreground p-4">
                  <Monitor className="w-8 h-8 text-secondary-foreground" />
                </div>
                <span className="text-2xl font-bold">+</span>
                <div className="bg-secondary border-4 border-foreground p-4">
                  <Mic className="w-8 h-8 text-secondary-foreground" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center mb-4">
              Recording Notice
            </h2>

            {/* Message */}
            <div className="bg-muted border-2 border-foreground p-6 mb-6">
              <p className="text-foreground mb-4">
                To provide you with detailed feedback on your work, we need to record:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Monitor className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold">Screen Recording</span>
                    <p className="text-sm text-muted-foreground">
                      Your screen will be recorded during the coding task
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mic className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold">Voice Recording</span>
                    <p className="text-sm text-muted-foreground">
                      Voice conversations will be recorded and transcribed
                    </p>
                  </div>
                </li>
              </ul>
              <p className="mt-4 text-sm text-muted-foreground font-mono border-t border-border pt-4">
                Your recordings are private and only used for assessment at {companyName}.
              </p>
            </div>

            {/* Accept button */}
            <button
              onClick={handleAcceptAndStart}
              disabled={isStarting}
              className="w-full bg-foreground text-background px-6 py-4 text-lg font-bold border-4 border-foreground hover:bg-secondary hover:text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isStarting ? (
                <>
                  <div className="w-5 h-5 border-2 border-background border-t-transparent animate-spin" />
                  Starting Recording...
                </>
              ) : (
                <>
                  Accept & Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="mt-4 text-center text-sm text-muted-foreground font-mono">
              You will be prompted to share your screen next
            </p>
          </div>
        </div>

        {/* Render children behind the overlay (hidden) */}
        <div className="blur-sm pointer-events-none">{children}</div>
      </>
    );
  }

  // Re-prompt modal (recording stopped)
  if (showStoppedModal) {
    return (
      <>
        {/* Overlay */}
        <div className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            {/* Warning icon */}
            <div className="mb-6 text-center">
              <div className="inline-block bg-secondary border-4 border-foreground p-4">
                <AlertTriangle className="w-12 h-12 text-secondary-foreground" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center mb-4">
              Screen Recording Stopped
            </h2>

            {/* Message */}
            <div className="bg-muted border-2 border-foreground p-6 mb-6">
              <p className="text-muted-foreground mb-4">
                Your screen recording has stopped. To continue with the
                assessment, you need to share your screen again.
              </p>
              <p className="text-sm font-mono text-muted-foreground">
                Screen recording is required to capture your work process and
                provide you with detailed feedback.
              </p>
            </div>

            {/* Retry button */}
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full bg-foreground text-background px-6 py-4 text-lg font-bold border-4 border-foreground hover:bg-secondary hover:text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isRetrying ? (
                <>
                  <div className="w-5 h-5 border-2 border-background border-t-transparent animate-spin" />
                  Requesting Permission...
                </>
              ) : (
                <>
                  <Monitor className="w-5 h-5" />
                  Resume Screen Sharing
                </>
              )}
            </button>

            <p className="mt-4 text-center text-sm text-muted-foreground font-mono">
              You cannot continue without screen sharing enabled
            </p>
          </div>
        </div>

        {/* Render children behind the overlay (hidden) */}
        <div className="blur-sm pointer-events-none">{children}</div>
      </>
    );
  }

  return <>{children}</>;
}
