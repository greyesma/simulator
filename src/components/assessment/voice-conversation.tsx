"use client";

import { useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import {
  useVoiceConversation,
  type VoiceConnectionState as ConnectionState,
} from "@/hooks/voice";
import type { TranscriptMessage } from "@/lib/ai";
import {
  ErrorDisplay,
  SessionRecoveryPrompt,
} from "@/components/feedback";
import { Button } from "@/components/ui/button";

interface VoiceConversationProps {
  assessmentId: string;
  onEnd?: (transcript: TranscriptMessage[]) => void;
  onFallbackToText?: () => void;
}

function ConnectionStateIndicator({ state }: { state: ConnectionState }) {
  const stateConfig = {
    idle: { label: "Ready to connect", color: "bg-muted" },
    "requesting-permission": {
      label: "Requesting microphone...",
      color: "bg-primary",
    },
    connecting: { label: "Connecting...", color: "bg-primary" },
    connected: { label: "Connected", color: "bg-green-500" },
    error: { label: "Connection error", color: "bg-destructive" },
    ended: { label: "Interview ended", color: "bg-muted" },
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

function TranscriptView({ messages }: { messages: TranscriptMessage[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Conversation transcript will appear here
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
              {message.role === "user" ? "You" : "HR Interviewer"}
            </div>
            <p className="text-sm">{message.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function _AudioVisualizerBar({ active }: { active: boolean }) {
  return (
    <div className="flex h-8 items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full bg-primary transition-all duration-150 ${
            active ? "animate-pulse" : ""
          }`}
          style={{
            height: active ? `${Math.random() * 100}%` : "20%",
            animationDelay: `${i * 100}ms`,
          }}
        />
      ))}
    </div>
  );
}

export function VoiceConversation({
  assessmentId,
  onEnd,
  onFallbackToText,
}: VoiceConversationProps) {
  const {
    connectionState,
    permissionState,
    transcript,
    error,
    categorizedError,
    isAudioSupported,
    isSpeaking,
    isListening,
    retryCount,
    maxRetries,
    connect,
    endInterview,
    retry,
    hasRecoverableSession,
    recoverSession,
  } = useVoiceConversation({
    assessmentId,
    onTranscriptUpdate: () => {
      // Transcript updated
    },
  });

  const handleEndInterview = async () => {
    const success = await endInterview();
    if (success) {
      onEnd?.(transcript);
    }
    // If save failed, don't redirect - user stays on page to retry
  };

  const isRetrying = connectionState === "retrying";

  // Browser not supported
  if (!isAudioSupported) {
    return (
      <div className="flex h-full items-center justify-center p-8">
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
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-w-md rounded-xl border bg-card p-8 text-center shadow-lg">
          <div className="mb-4 text-4xl">
            <MicOff className="mx-auto h-12 w-12 text-destructive" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">
            Microphone Access Required
          </h3>
          <p className="mb-4 text-muted-foreground">
            Please enable microphone access in your browser settings to continue
            with the voice interview.
          </p>
          <ol className="mx-auto mb-6 max-w-md space-y-2 text-left text-sm text-muted-foreground">
            <li>1. Click the lock icon in your browser&apos;s address bar</li>
            <li>2. Find &quot;Microphone&quot; in the permissions list</li>
            <li>3. Change the setting to &quot;Allow&quot;</li>
            <li>4. Refresh this page</li>
          </ol>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </Button>
            {onFallbackToText && (
              <Button variant="secondary" onClick={onFallbackToText}>
                <MessageSquare className="h-4 w-4" />
                Continue with Text
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Session recovery prompt
  if (hasRecoverableSession && connectionState === "idle") {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <SessionRecoveryPrompt
          onRecover={() => {
            recoverSession();
            connect();
          }}
          onStartFresh={connect}
          lastSaved={new Date().toISOString()}
          progressSummary={`${transcript.length} messages saved`}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h2 className="text-xl font-semibold">HR Interview</h2>
          <ConnectionStateIndicator state={connectionState} />
        </div>

        <div className="flex items-center gap-4">
          {/* Audio indicators */}
          <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Transcript panel */}
        <div className="flex-1 border-r">
          <div className="flex h-full flex-col">
            <div className="border-b p-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Transcript
              </h3>
            </div>
            <div className="flex-1 overflow-hidden">
              <TranscriptView messages={transcript} />
            </div>
          </div>
        </div>

        {/* Control panel */}
        <div className="flex w-80 flex-col">
          <div className="flex flex-1 flex-col items-center justify-center p-8">
            {/* Avatar */}
            <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
              <span className="text-4xl font-semibold text-primary">SM</span>
            </div>
            <h3 className="mb-1 text-xl font-semibold">Sarah Mitchell</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Senior Technical Recruiter
            </p>

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
              <Button
                onClick={connect}
                className="bg-green-600 text-white transition-all duration-200 hover:bg-green-700"
              >
                <Phone className="h-5 w-5" />
                Start Interview
              </Button>
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
                onClick={handleEndInterview}
                className="transition-all duration-200"
              >
                <PhoneOff className="h-5 w-5" />
                End Interview
              </Button>
            )}

            {(connectionState === "error" || connectionState === "retrying") &&
              categorizedError && (
                <ErrorDisplay
                  error={categorizedError}
                  onRetry={retry}
                  onFallback={onFallbackToText}
                  fallbackLabel="Continue with Text"
                  isRetrying={isRetrying}
                  retryCount={retryCount}
                  maxRetries={maxRetries}
                  showFallbackOption={!!onFallbackToText}
                />
              )}

            {connectionState === "error" && !categorizedError && error && (
              <div className="text-center">
                <p className="mb-4 text-sm text-destructive">{error}</p>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <Button onClick={connect}>
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                  {onFallbackToText && (
                    <Button variant="secondary" onClick={onFallbackToText}>
                      <MessageSquare className="h-4 w-4" />
                      Continue with Text
                    </Button>
                  )}
                </div>
              </div>
            )}

            {connectionState === "ended" && (
              <div className="text-center">
                <p className="mb-4 text-sm text-muted-foreground">
                  Interview completed
                </p>
                <p className="text-sm text-muted-foreground">
                  {transcript.length} messages recorded
                </p>
              </div>
            )}
          </div>

          {/* Tips */}
          {connectionState === "idle" && (
            <div className="rounded-b-xl border-t bg-muted/50 p-4">
              <h4 className="mb-2 text-xs font-medium text-muted-foreground">
                Tips
              </h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Speak clearly into your microphone</li>
                <li>• Find a quiet environment</li>
                <li>• Expected duration: ~20 minutes</li>
                <li>• You can interrupt the interviewer</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
