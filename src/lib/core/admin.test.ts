import { describe, it, expect, vi, beforeEach } from "vitest";
import { isAdmin } from "./admin";
import type { UserRole } from "@prisma/client";

// Define mock functions before vi.mock() calls (hoisting requirement)
const mockAuth = vi.fn();
const mockRedirect = vi.fn();

vi.mock("@/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error(`REDIRECT: ${url}`);
  },
}));

interface MockSessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: UserRole;
}

describe("admin utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isAdmin", () => {
    it("should return true for ADMIN role", () => {
      const user: MockSessionUser = { id: "1", role: "ADMIN" };
      expect(isAdmin(user)).toBe(true);
    });

    it("should return false for USER role", () => {
      const user: MockSessionUser = { id: "1", role: "USER" };
      expect(isAdmin(user)).toBe(false);
    });

    it("should return false for undefined user", () => {
      expect(isAdmin(undefined)).toBe(false);
    });

    it("should return false for null user", () => {
      expect(isAdmin(null)).toBe(false);
    });

    it("should return false for user without role", () => {
      const user: MockSessionUser = { id: "1" };
      expect(isAdmin(user)).toBe(false);
    });
  });

  describe("getSessionWithRole", () => {
    it("should return session with extended user when authenticated", async () => {
      const { getSessionWithRole } = await import("./admin");

      mockAuth.mockResolvedValueOnce({
        user: { id: "1", email: "admin@test.com", role: "ADMIN" },
      });

      const session = await getSessionWithRole();

      expect(session).not.toBeNull();
      expect(session?.user.id).toBe("1");
      expect(session?.user.email).toBe("admin@test.com");
      expect(session?.user.role).toBe("ADMIN");
    });

    it("should return null when not authenticated", async () => {
      const { getSessionWithRole } = await import("./admin");

      mockAuth.mockResolvedValueOnce(null);

      const session = await getSessionWithRole();

      expect(session).toBeNull();
    });

    it("should return null when session has no user", async () => {
      const { getSessionWithRole } = await import("./admin");

      mockAuth.mockResolvedValueOnce({});

      const session = await getSessionWithRole();

      expect(session).toBeNull();
    });
  });

  describe("requireAdmin", () => {
    it("should redirect to sign-in when not authenticated", async () => {
      const { requireAdmin } = await import("./admin");

      mockAuth.mockResolvedValueOnce(null);

      await expect(requireAdmin()).rejects.toThrow(
        "REDIRECT: /sign-in?callbackUrl=/admin"
      );
      expect(mockRedirect).toHaveBeenCalledWith("/sign-in?callbackUrl=/admin");
    });

    it("should redirect to home when user is not admin", async () => {
      const { requireAdmin } = await import("./admin");

      mockAuth.mockResolvedValueOnce({
        user: { id: "1", role: "USER" },
      });

      await expect(requireAdmin()).rejects.toThrow("REDIRECT: /");
      expect(mockRedirect).toHaveBeenCalledWith("/");
    });

    it("should return user when user is admin", async () => {
      const { requireAdmin } = await import("./admin");

      const adminUser = { id: "1", email: "admin@test.com", role: "ADMIN" };
      mockAuth.mockResolvedValueOnce({
        user: adminUser,
      });

      const user = await requireAdmin();

      expect(user.id).toBe("1");
      expect(user.role).toBe("ADMIN");
    });
  });

  describe("checkIsAdmin", () => {
    it("should return true when user is admin", async () => {
      const { checkIsAdmin } = await import("./admin");

      mockAuth.mockResolvedValueOnce({
        user: { id: "1", role: "ADMIN" },
      });

      const result = await checkIsAdmin();

      expect(result).toBe(true);
    });

    it("should return false when user is not admin", async () => {
      const { checkIsAdmin } = await import("./admin");

      mockAuth.mockResolvedValueOnce({
        user: { id: "1", role: "USER" },
      });

      const result = await checkIsAdmin();

      expect(result).toBe(false);
    });

    it("should return false when not authenticated", async () => {
      const { checkIsAdmin } = await import("./admin");

      mockAuth.mockResolvedValueOnce(null);

      const result = await checkIsAdmin();

      expect(result).toBe(false);
    });
  });
});
