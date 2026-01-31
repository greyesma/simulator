"use client";

import { SlackLayout, Chat } from "@/components/chat";

interface Coworker {
  id: string;
  name: string;
  role: string;
  avatarUrl: string | null;
}

interface ChatPageClientProps {
  assessmentId: string;
  coworkers: Coworker[];
  selectedCoworkerId: string | null;
}

export function ChatPageClient({
  assessmentId,
  coworkers,
  selectedCoworkerId,
}: ChatPageClientProps) {
  const selectedCoworker = coworkers.find((c) => c.id === selectedCoworkerId);

  // Note: PR submission handling and defense call are now handled within the
  // Slack interface (RF-012). The candidate will call the manager from within
  // Slack after submitting a PR, instead of navigating to a separate defense page.

  return (
    <SlackLayout assessmentId={assessmentId} coworkers={coworkers}>
      {selectedCoworker ? (
        <Chat
          assessmentId={assessmentId}
          coworker={selectedCoworker}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h2 className="mb-2 text-xl font-semibold">No Coworkers Available</h2>
            <p className="text-muted-foreground">
              There are no coworkers configured for this scenario.
            </p>
          </div>
        </div>
      )}
    </SlackLayout>
  );
}
