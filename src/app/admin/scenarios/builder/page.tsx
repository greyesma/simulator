import { requireAdmin } from "@/lib/admin";
import { ScenarioBuilderClient } from "./client";

export default async function ScenarioBuilderPage() {
  // This ensures only admins can access this page
  await requireAdmin();

  return (
    <div className="flex h-[calc(100vh-73px)] flex-col">
      <ScenarioBuilderClient />
    </div>
  );
}
