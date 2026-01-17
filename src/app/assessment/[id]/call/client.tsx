"use client";

import { useRouter } from "next/navigation";
import { SlackLayout } from "@/components/slack-layout";
import { CoworkerVoiceCall } from "@/components/coworker-voice-call";

interface Coworker {
  id: string;
  name: string;
  role: string;
  avatarUrl: string | null;
}

interface CallPageClientProps {
  assessmentId: string;
  coworkers: Coworker[];
  selectedCoworkerId: string | null;
}

export function CallPageClient({
  assessmentId,
  coworkers,
  selectedCoworkerId,
}: CallPageClientProps) {
  const router = useRouter();

  const selectedCoworker = coworkers.find((c) => c.id === selectedCoworkerId);

  const handleCallEnd = () => {
    // Navigate back to chat after call ends
    if (selectedCoworkerId) {
      router.push(`/assessment/${assessmentId}/chat?coworkerId=${selectedCoworkerId}`);
    }
  };

  return (
    <SlackLayout assessmentId={assessmentId} coworkers={coworkers}>
      {selectedCoworker ? (
        <CoworkerVoiceCall
          assessmentId={assessmentId}
          coworker={selectedCoworker}
          onEnd={handleCallEnd}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="font-bold text-xl mb-2">Select a Coworker</h2>
            <p className="text-muted-foreground">
              Choose a coworker from the sidebar to start a voice call.
            </p>
          </div>
        </div>
      )}
    </SlackLayout>
  );
}
