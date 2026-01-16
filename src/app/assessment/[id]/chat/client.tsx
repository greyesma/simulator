"use client";

import { useRouter } from "next/navigation";
import { CoworkerSidebar } from "@/components/coworker-sidebar";
import { Chat } from "@/components/chat";

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
  const router = useRouter();

  const selectedCoworker = coworkers.find((c) => c.id === selectedCoworkerId);

  const handleSelectCoworker = (coworkerId: string, action: "chat" | "call") => {
    if (action === "chat") {
      router.push(`/assessment/${assessmentId}/chat?coworkerId=${coworkerId}`);
    } else {
      // TODO: Implement voice call functionality
      router.push(`/assessment/${assessmentId}/call?coworkerId=${coworkerId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <CoworkerSidebar
        coworkers={coworkers}
        onSelectCoworker={handleSelectCoworker}
        selectedCoworkerId={selectedCoworkerId}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {selectedCoworker ? (
          <Chat assessmentId={assessmentId} coworker={selectedCoworker} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="font-bold text-xl mb-2">No Coworkers Available</h2>
              <p className="text-muted-foreground">
                There are no coworkers configured for this scenario.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
