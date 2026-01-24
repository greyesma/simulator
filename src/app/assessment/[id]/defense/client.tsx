"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  ExternalLink,
} from "lucide-react";
import { useDefenseCall, type VoiceConnectionState as ConnectionState } from "@/hooks/voice";
import type { TranscriptMessage } from "@/lib/ai";
import { Button } from "@/components/ui/button";

interface DefenseClientProps {
  assessmentId: string;
  managerName: string;
  managerRole: string;
  companyName: string;
  userName: string;
  prUrl: string;
}

function ConnectionStateIndicator({ state }: { state: ConnectionState }) {
  const stateConfig = {
    idle: { label: "Ready to defend", color: "bg-muted" },
    "requesting-permission": {
      label: "Requesting microphone...",
      color: "bg-primary",
    },
    connecting: { label: "Connecting...", color: "bg-primary" },
    connected: { label: "In call", color: "bg-green-500" },
    error: { label: "Connection error", color: "bg-destructive" },
    ended: { label: "Call ended", color: "bg-muted" },
    retrying: { label: "Retrying...", color: "bg-primary" },
  };

  const config = stateConfig[state];

  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-3 w-3 rounded-full transition-colors duration-200 ${config.color}`}
      />
      <span className="text-sm text-muted-foreground">{config.label}</span>
    </div>
  );
}

function TranscriptView({
  messages,
  managerName,
}: {
  messages: TranscriptMessage[];
  managerName: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Call transcript will appear here
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="h-full space-y-4 overflow-y-auto p-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] rounded-lg p-3 transition-all duration-200 ${
              message.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}
          >
            <div className="mb-1 text-xs opacity-70">
              {message.role === "user" ? "You" : managerName}
            </div>
            <p className="text-sm">{message.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function DefenseClient({
  assessmentId,
  managerName,
  managerRole,
  companyName,
  userName,
  prUrl,
}: DefenseClientProps) {
  const router = useRouter();

  const {
    connectionState,
    permissionState,
    transcript,
    error,
    isAudioSupported,
    isSpeaking,
    isListening,
    connect,
    endCall,
  } = useDefenseCall({
    assessmentId,
    onTranscriptUpdate: () => {
      // Transcript updated
    },
    onCallEnded: () => {
      // Finalize assessment after call ends
      finalizeAssessment();
    },
  });

  const finalizeAssessment = async () => {
    try {
      // Mark assessment as completed
      await fetch("/api/assessment/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId }),
      });
    } catch (err) {
      console.error("Error finalizing assessment:", err);
    }
  };

  const handleEndCall = async () => {
    await endCall();
  };

  const handleViewResults = () => {
    router.push(`/assessment/${assessmentId}/processing`);
  };

  // Browser not supported
  if (!isAudioSupported) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="max-w-md rounded-xl border bg-card p-8 text-center shadow-lg">
          <div className="mb-4 text-4xl">
            <MicOff className="mx-auto h-12 w-12 text-destructive" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">Browser Not Supported</h3>
          <p className="mb-4 text-muted-foreground">
            Your browser doesn&apos;t support audio capture. Please use a modern
            browser like Chrome, Firefox, or Safari.
          </p>
        </div>
      </div>
    );
  }

  // Permission denied
  if (permissionState === "denied" && connectionState === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="max-w-md rounded-xl border bg-card p-8 text-center shadow-lg">
          <div className="mb-4 text-4xl">
            <MicOff className="mx-auto h-12 w-12 text-destructive" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">Microphone Access Required</h3>
          <p className="mb-4 text-muted-foreground">
            Please enable microphone access in your browser settings to join the
            defense call.
          </p>
          <ol className="mx-auto mb-6 max-w-md space-y-2 text-left text-sm text-muted-foreground">
            <li>1. Click the lock icon in your browser&apos;s address bar</li>
            <li>2. Find &quot;Microphone&quot; in the permissions list</li>
            <li>3. Change the setting to &quot;Allow&quot;</li>
            <li>4. Refresh this page</li>
          </ol>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Manager avatar */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <span className="text-sm font-semibold text-primary">
                {getInitials(managerName)}
              </span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">
                Final Defense with {managerName}
              </h1>
              <p className="text-sm text-muted-foreground">
                {managerRole} at {companyName}
              </p>
            </div>
          </div>
          <ConnectionStateIndicator state={connectionState} />
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1">
        {/* Transcript panel */}
        <div className="flex flex-1 flex-col border-r">
          <div className="border-b p-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Transcript
            </h3>
          </div>
          <div className="flex-1 overflow-hidden">
            <TranscriptView messages={transcript} managerName={managerName} />
          </div>
        </div>

        {/* Control panel */}
        <div className="flex w-96 flex-col">
          <div className="flex flex-1 flex-col items-center justify-center p-8">
            {/* Avatar */}
            <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
              <span className="text-4xl font-semibold text-primary">
                {getInitials(managerName)}
              </span>
            </div>
            <h3 className="mb-1 text-xl font-semibold">{managerName}</h3>
            <p className="mb-2 text-sm text-muted-foreground">
              {managerRole}
            </p>

            {/* PR Link */}
            <a
              href={prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-6 flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              View Your PR
            </a>

            {/* Audio indicators */}
            {connectionState === "connected" && (
              <div className="mb-6 flex items-center gap-4">
                <div
                  className={`rounded-full p-1.5 transition-colors duration-200 ${
                    isListening ? "bg-green-500/20" : "bg-muted"
                  }`}
                >
                  {isListening ? (
                    <Mic className="h-5 w-5 text-green-500" />
                  ) : (
                    <MicOff className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div
                  className={`rounded-full p-1.5 transition-colors duration-200 ${
                    isSpeaking ? "bg-primary/20" : "bg-muted"
                  }`}
                >
                  {isSpeaking ? (
                    <Volume2 className="h-5 w-5 text-primary" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            )}

            {/* Speaking indicator */}
            {connectionState === "connected" && (
              <div className="mb-6">
                {isSpeaking ? (
                  <div className="flex items-center gap-2 text-primary">
                    <Volume2 className="h-5 w-5 animate-pulse" />
                    <span className="text-sm">Speaking...</span>
                  </div>
                ) : isListening ? (
                  <div className="flex items-center gap-2 text-green-500">
                    <Mic className="h-5 w-5 animate-pulse" />
                    <span className="text-sm">Listening...</span>
                  </div>
                ) : null}
              </div>
            )}

            {/* Connection controls */}
            {connectionState === "idle" && (
              <div className="text-center">
                <p className="mb-6 max-w-xs text-muted-foreground">
                  Hey {userName}! {managerName} is ready to review your PR with
                  you. Walk them through your solution and explain your
                  decisions.
                </p>
                <Button
                  onClick={connect}
                  className="bg-green-600 text-white transition-all duration-200 hover:bg-green-700"
                >
                  <Phone className="h-5 w-5" />
                  Start Defense Call
                </Button>
              </div>
            )}

            {(connectionState === "requesting-permission" ||
              connectionState === "connecting") && (
              <div className="flex items-center gap-2 text-primary">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-sm">
                  {connectionState === "requesting-permission"
                    ? "Requesting microphone..."
                    : "Connecting..."}
                </span>
              </div>
            )}

            {connectionState === "connected" && (
              <Button
                variant="destructive"
                onClick={handleEndCall}
                className="transition-all duration-200"
              >
                <PhoneOff className="h-5 w-5" />
                End Call
              </Button>
            )}

            {connectionState === "error" && error && (
              <div className="text-center">
                <p className="mb-4 text-sm text-destructive">{error}</p>
                <Button onClick={connect}>
                  Try Again
                </Button>
              </div>
            )}

            {connectionState === "ended" && (
              <div className="text-center">
                <p className="mb-2 text-sm text-muted-foreground">
                  Defense completed
                </p>
                <p className="mb-6 text-sm text-muted-foreground">
                  {transcript.length} messages recorded
                </p>
                <Button onClick={handleViewResults}>
                  View Summary
                </Button>
                <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                  Your assessment is complete. See your session summary while we
                  generate your report.
                </p>
              </div>
            )}
          </div>

          {/* Tips panel */}
          {connectionState === "idle" && (
            <div className="rounded-b-xl border-t bg-muted/50 p-4">
              <h4 className="mb-2 text-xs font-medium text-muted-foreground">
                Tips
              </h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Walk through your solution at a high level first</li>
                <li>• Be prepared to explain your technical decisions</li>
                <li>• Discuss trade-offs you considered</li>
                <li>• Mention challenges and how you solved them</li>
                <li>• Be honest about areas for improvement</li>
              </ul>
            </div>
          )}

          {connectionState === "connected" && (
            <div className="rounded-b-xl border-t bg-muted/50 p-4">
              <h4 className="mb-2 text-xs font-medium text-muted-foreground">
                In Defense
              </h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Explain your reasoning clearly</li>
                <li>• Reference specific code decisions</li>
                <li>
                  • It&apos;s okay to say &quot;I would do X differently&quot;
                </li>
                <li>• Ask for clarification if needed</li>
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
