import { requireRecruiter } from "@/lib/core";
import { CandidateCompareClient } from "./client";

/**
 * Side-by-side candidate comparison page (server component)
 *
 * Reads `ids` query param (comma-separated assessment IDs) and passes
 * them to the client component which fetches comparison data.
 */
export default async function CandidateComparePage() {
  // Verify user is a recruiter (will redirect if not)
  await requireRecruiter();

  // Pass to client component which will read query params and fetch data
  return <CandidateCompareClient />;
}
