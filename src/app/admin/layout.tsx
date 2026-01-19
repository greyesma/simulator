import { requireAdmin } from "@/lib/core";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect non-admins to home page
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Admin Header */}
      <header className="border-b-2 border-border bg-foreground text-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">
              Skillvee
            </Link>
            <span className="bg-secondary px-2 py-1 font-mono text-xs text-secondary-foreground">
              ADMIN
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/admin"
              className="font-mono text-sm transition-colors hover:text-secondary"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/scenarios"
              className="font-mono text-sm transition-colors hover:text-secondary"
            >
              Scenarios
            </Link>
            <Link
              href="/admin/assessments"
              className="font-mono text-sm transition-colors hover:text-secondary"
            >
              Assessments
            </Link>
            <Link
              href="/admin/users"
              className="font-mono text-sm transition-colors hover:text-secondary"
            >
              Users
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link
              href="/"
              className="font-mono text-sm transition-colors hover:text-secondary"
            >
              Exit Admin
            </Link>
            <span className="font-mono text-xs text-muted-foreground">
              {user.email}
            </span>
          </nav>
        </div>
      </header>

      {/* Admin Content */}
      <main>{children}</main>
    </div>
  );
}
