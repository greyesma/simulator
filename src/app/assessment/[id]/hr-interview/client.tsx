"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { VoiceConversation } from "@/components/assessment";
import { Card, CardContent } from "@/components/ui/card";
import type { TranscriptMessage } from "@/lib/ai";

interface HRInterviewClientProps {
  assessmentId: string;
  scenarioName: string;
  companyName: string;
}

export function HRInterviewClient({
  assessmentId,
  scenarioName,
  companyName,
}: HRInterviewClientProps) {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);
  const [_transcript, setTranscript] = useState<TranscriptMessage[]>([]);

  const handleInterviewEnd = (finalTranscript: TranscriptMessage[]) => {
    setTranscript(finalTranscript);
    setIsCompleted(true);
    // Redirect to congratulations screen
    router.push(`/assessment/${assessmentId}/congratulations`);
  };

  if (isCompleted) {
    // Show brief loading state while redirecting
    return (
      <div className="flex flex-1 items-center justify-center">
        <Card className="max-w-md shadow-md">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-10 w-10 text-primary" />
            </div>
            <h2 className="mb-4 text-2xl font-semibold">Interview Completed!</h2>
            <p className="text-muted-foreground">Redirecting...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Intro section */}
      <div className="border-b border-border bg-muted/50 p-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-xl font-semibold">
            Welcome to your HR Interview
          </h2>
          <p className="mb-4 text-muted-foreground">
            You&apos;re about to start a voice conversation with Sarah Mitchell,
            Senior Technical Recruiter at {companyName}. This is a phone
            screening to verify your experience and assess your fit for the{" "}
            {scenarioName} role.
          </p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="mb-1 text-muted-foreground">Duration</div>
                <div className="font-semibold">~20 minutes</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="mb-1 text-muted-foreground">Format</div>
                <div className="font-semibold">Voice Call</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-3">
                <div className="mb-1 text-muted-foreground">Focus</div>
                <div className="font-semibold">CV Verification</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Voice conversation */}
      <div className="flex-1">
        <VoiceConversation
          assessmentId={assessmentId}
          onEnd={handleInterviewEnd}
        />
      </div>
    </div>
  );
}
