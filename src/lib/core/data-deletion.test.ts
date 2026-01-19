import { describe, it, expect, vi, beforeEach } from "vitest";

// Define mock functions before vi.mock calls
const mockFindMany = vi.fn();
const mockCount = vi.fn();
const mockDeleteMany = vi.fn();
const mockUpdate = vi.fn();
const mockStorageRemove = vi.fn();

vi.mock("@/server/db", () => ({
  db: {
    assessment: {
      findMany: (args: unknown) => mockFindMany(args),
      count: (args: unknown) => mockCount(args),
      deleteMany: (args: unknown) => mockDeleteMany(args),
    },
    conversation: {
      count: (args: unknown) => mockCount(args),
    },
    recording: {
      count: (args: unknown) => mockCount(args),
    },
    recordingSegment: {
      count: (args: unknown) => mockCount(args),
    },
    hRInterviewAssessment: {
      count: (args: unknown) => mockCount(args),
    },
    user: {
      update: (args: unknown) => mockUpdate(args),
    },
  },
}));

vi.mock("./supabase", () => ({
  supabaseAdmin: {
    storage: {
      from: () => ({
        remove: (paths: string[]) => mockStorageRemove(paths),
      }),
    },
  },
}));

import {
  deleteUserData,
  hasGracePeriodPassed,
  processImmediateDeletion,
} from "./data-deletion";

describe("data-deletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("hasGracePeriodPassed", () => {
    it("returns false if request is less than 30 days old", () => {
      const now = new Date();
      const requestDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000); // 29 days ago

      expect(hasGracePeriodPassed(requestDate)).toBe(false);
    });

    it("returns true if request is exactly 30 days old", () => {
      const now = new Date();
      const requestDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

      expect(hasGracePeriodPassed(requestDate)).toBe(true);
    });

    it("returns true if request is more than 30 days old", () => {
      const now = new Date();
      const requestDate = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000); // 31 days ago

      expect(hasGracePeriodPassed(requestDate)).toBe(true);
    });

    it("respects custom grace period", () => {
      const now = new Date();
      const requestDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

      expect(hasGracePeriodPassed(requestDate, 7)).toBe(true);
      expect(hasGracePeriodPassed(requestDate, 8)).toBe(false);
    });
  });

  describe("deleteUserData", () => {
    it("returns success with zero counts when user has no data", async () => {
      mockFindMany.mockResolvedValueOnce([]); // No assessments
      mockStorageRemove.mockResolvedValue({ error: null }); // Storage succeeds
      mockCount.mockResolvedValue(0); // All counts are 0
      mockDeleteMany.mockResolvedValueOnce({ count: 0 });
      mockUpdate.mockResolvedValueOnce({});

      const result = await deleteUserData("user-123");

      expect(result.success).toBe(true);
      expect(result.deletedItems.assessments).toBe(0);
      expect(result.deletedItems.storageFiles).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it("deletes storage files from all buckets", async () => {
      mockFindMany.mockResolvedValueOnce([
        {
          cvUrl: "https://storage.example.com/resumes/user-123/cv.pdf",
          recordings: [
            {
              storageUrl: "recordings/user-123/video.webm",
              segments: [
                {
                  chunkPaths: ["recordings/user-123/chunk1.webm"],
                  screenshotPaths: ["screenshots/user-123/ss1.png"],
                },
              ],
            },
          ],
        },
      ]);
      mockStorageRemove.mockResolvedValue({ error: null });
      mockCount.mockResolvedValue(1);
      mockDeleteMany.mockResolvedValueOnce({ count: 1 });
      mockUpdate.mockResolvedValueOnce({});

      const result = await deleteUserData("user-123");

      expect(result.success).toBe(true);
      // Should have called storage remove for each bucket
      expect(mockStorageRemove).toHaveBeenCalledTimes(3);
      expect(result.deletedItems.storageFiles).toBeGreaterThan(0);
    });

    it("soft deletes user and clears personal data", async () => {
      mockFindMany.mockResolvedValueOnce([]);
      mockStorageRemove.mockResolvedValue({ error: null });
      mockCount.mockResolvedValue(0);
      mockDeleteMany.mockResolvedValueOnce({ count: 0 });
      mockUpdate.mockResolvedValueOnce({});

      await deleteUserData("user-123");

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: {
          deletedAt: expect.any(Date),
          name: null,
          email: null,
          image: null,
          password: null,
          emailVerified: null,
        },
      });
    });

    it("continues deletion even if storage fails", async () => {
      mockFindMany.mockResolvedValueOnce([
        {
          cvUrl: "cv.pdf",
          recordings: [],
        },
      ]);
      mockStorageRemove.mockResolvedValue({
        error: { message: "Storage error" },
      });
      mockCount.mockResolvedValue(0);
      mockDeleteMany.mockResolvedValueOnce({ count: 0 });
      mockUpdate.mockResolvedValueOnce({});

      const result = await deleteUserData("user-123");

      // Should still succeed overall, but record the error
      expect(result.success).toBe(true);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("returns failure if database operation fails", async () => {
      mockFindMany.mockRejectedValueOnce(new Error("Database error"));

      const result = await deleteUserData("user-123");

      expect(result.success).toBe(false);
      expect(result.errors).toContain("Database error");
    });
  });

  describe("processImmediateDeletion", () => {
    it("calls deleteUserData with the provided userId", async () => {
      mockFindMany.mockResolvedValueOnce([]);
      mockStorageRemove.mockResolvedValue({ error: null });
      mockCount.mockResolvedValue(0);
      mockDeleteMany.mockResolvedValueOnce({ count: 0 });
      mockUpdate.mockResolvedValueOnce({});

      const result = await processImmediateDeletion("user-456");

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user-456" },
        })
      );
    });
  });
});
