import { requireAdmin } from "@/lib/admin";
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
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-bold text-xl">
              Skillvee
            </Link>
            <span className="font-mono text-xs bg-secondary text-secondary-foreground px-2 py-1">
              ADMIN
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/admin"
              className="font-mono text-sm hover:text-secondary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/scenarios"
              className="font-mono text-sm hover:text-secondary transition-colors"
            >
              Scenarios
            </Link>
            <Link
              href="/admin/assessments"
              className="font-mono text-sm hover:text-secondary transition-colors"
            >
              Assessments
            </Link>
            <Link
              href="/admin/users"
              className="font-mono text-sm hover:text-secondary transition-colors"
            >
              Users
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link
              href="/"
              className="font-mono text-sm hover:text-secondary transition-colors"
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
