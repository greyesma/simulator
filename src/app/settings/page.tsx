import { auth } from "@/auth";
import { db } from "@/server/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { UserRole } from "@prisma/client";
import { AdminNav } from "@/components/admin-nav";
import { AccountDeletionSection } from "./account-deletion-section";

interface ExtendedUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: UserRole;
}

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/settings");
  }

  const user = session.user as ExtendedUser;

  const dbUser = await db.user.findUnique({
    where: { id: user.id, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      dataDeleteRequestedAt: true,
    },
  });

  if (!dbUser) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b-2 border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            Skillvee
          </Link>
          <nav className="flex items-center gap-4">
            <AdminNav />
            <Link
              href="/profile"
              className="text-muted-foreground hover:text-foreground font-mono text-sm"
            >
              Profile
            </Link>
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground font-mono text-sm"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Settings Header */}
        <section className="mb-12">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </section>

        {/* Account Information */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Account Information</h2>
          <div className="border-2 border-border p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-semibold">Name</p>
                  <p className="text-muted-foreground font-mono text-sm">
                    {dbUser.name || "Not set"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-muted-foreground font-mono text-sm">
                    {dbUser.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold">Member Since</p>
                  <p className="text-muted-foreground font-mono text-sm">
                    {new Intl.DateTimeFormat("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }).format(dbUser.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Privacy</h2>
          <div className="border-2 border-border p-6">
            <Link
              href="/privacy"
              className="flex items-center justify-between py-3 hover:text-secondary group"
            >
              <div>
                <p className="font-semibold group-hover:text-secondary">
                  Privacy Policy
                </p>
                <p className="text-muted-foreground font-mono text-sm">
                  Read how we handle your data
                </p>
              </div>
              <svg
                className="w-5 h-5 text-muted-foreground group-hover:text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="square"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </section>

        {/* Delete Account Section */}
        <AccountDeletionSection
          deletionRequestedAt={dbUser.dataDeleteRequestedAt}
        />
      </div>
    </main>
  );
}
