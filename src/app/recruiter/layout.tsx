import { requireRecruiter } from "@/lib/core";
import { RecruiterSidebar } from "./components/sidebar";

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect non-recruiters to home page
  const user = await requireRecruiter();

  return (
    <div className="flex h-screen bg-stone-50">
      <RecruiterSidebar user={{ name: user.name ?? null, email: user.email ?? null }} />
      <main className="flex h-full flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
