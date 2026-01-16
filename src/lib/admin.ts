import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";

/**
 * Extended session user with role information
 */
interface ExtendedSessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: UserRole;
}

/**
 * Check if the given user has admin role
 */
export function isAdmin(user: ExtendedSessionUser | undefined | null): boolean {
  return user?.role === "ADMIN";
}

/**
 * Get the current session with user role information
 * Returns null if not authenticated
 */
export async function getSessionWithRole() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return {
    ...session,
    user: session.user as ExtendedSessionUser,
  };
}

/**
 * Require admin role for a page or API route
 * Throws a redirect to home if not admin
 * For use in server components and page handlers
 */
export async function requireAdmin(): Promise<ExtendedSessionUser> {
  const session = await getSessionWithRole();

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/admin");
  }

  if (!isAdmin(session.user)) {
    redirect("/");
  }

  return session.user;
}

/**
 * Check if current user is admin
 * Returns boolean for conditional rendering
 * For use in server components
 */
export async function checkIsAdmin(): Promise<boolean> {
  const session = await getSessionWithRole();
  return isAdmin(session?.user);
}
