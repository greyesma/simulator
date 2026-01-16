import { describe, it, expect, vi, beforeEach } from "vitest";
import { AssessmentStatus } from "@prisma/client";

// Mock auth
const mockAuth = vi.fn();
vi.mock("@/auth", () => ({
  auth: () => mockAuth(),
}));

// Mock db
const mockAssessmentFindUnique = vi.fn();
const mockAssessmentUpdate = vi.fn();
vi.mock("@/server/db", () => ({
  db: {
    assessment: {
      findUnique: (...args: unknown[]) => mockAssessmentFindUnique(...args),
      update: (...args: unknown[]) => mockAssessmentUpdate(...args),
    },
  },
}));

import { POST } from "./route";

describe("POST /api/assessment/finalize", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const request = new Request("http://localhost/api/assessment/finalize", {
      method: "POST",
      body: JSON.stringify({ assessmentId: "test-id" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 when assessmentId is missing", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-123" },
    });

    const request = new Request("http://localhost/api/assessment/finalize", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe("Assessment ID is required");
  });

  it("should return 404 when assessment not found", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockAssessmentFindUnique.mockResolvedValue(null);

    const request = new Request("http://localhost/api/assessment/finalize", {
      method: "POST",
      body: JSON.stringify({ assessmentId: "test-id" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data.error).toBe("Assessment not found");
  });

  it("should return 403 when user does not own the assessment", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockAssessmentFindUnique.mockResolvedValue({
      id: "test-id",
      userId: "other-user", // Different user
      status: AssessmentStatus.FINAL_DEFENSE,
      startedAt: new Date(),
    });

    const request = new Request("http://localhost/api/assessment/finalize", {
      method: "POST",
      body: JSON.stringify({ assessmentId: "test-id" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(403);

    const data = await response.json();
    expect(data.error).toBe("Unauthorized to modify this assessment");
  });

  it("should return 400 when assessment is not in FINAL_DEFENSE status", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockAssessmentFindUnique.mockResolvedValue({
      id: "test-id",
      userId: "user-123",
      status: AssessmentStatus.WORKING, // Wrong status
      startedAt: new Date(),
    });

    const request = new Request("http://localhost/api/assessment/finalize", {
      method: "POST",
      body: JSON.stringify({ assessmentId: "test-id" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain("Must be in FINAL_DEFENSE status");
  });

  it("should finalize assessment and return timing info", async () => {
    const startedAt = new Date("2024-01-01T10:00:00Z");

    mockAuth.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockAssessmentFindUnique.mockResolvedValue({
      id: "test-id",
      userId: "user-123",
      status: AssessmentStatus.FINAL_DEFENSE,
      startedAt,
    });
    mockAssessmentUpdate.mockResolvedValue({
      id: "test-id",
      status: AssessmentStatus.COMPLETED,
      startedAt,
      completedAt: new Date(),
    });

    const request = new Request("http://localhost/api/assessment/finalize", {
      method: "POST",
      body: JSON.stringify({ assessmentId: "test-id" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.assessment.status).toBe(AssessmentStatus.COMPLETED);
    expect(data.timing.startedAt).toBe(startedAt.toISOString());
    expect(data.timing.completedAt).toBeDefined();
    expect(data.timing.totalDurationSeconds).toBeGreaterThan(0);

    expect(mockAssessmentUpdate).toHaveBeenCalledWith({
      where: { id: "test-id" },
      data: {
        status: AssessmentStatus.COMPLETED,
        completedAt: expect.any(Date),
      },
      select: {
        id: true,
        status: true,
        startedAt: true,
        completedAt: true,
      },
    });
  });

  it("should return 500 on internal error", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockAssessmentFindUnique.mockRejectedValue(new Error("DB error"));

    const request = new Request("http://localhost/api/assessment/finalize", {
      method: "POST",
      body: JSON.stringify({ assessmentId: "test-id" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toBe("Failed to finalize assessment");
  });

  it("should not finalize if already completed", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-123" },
    });
    mockAssessmentFindUnique.mockResolvedValue({
      id: "test-id",
      userId: "user-123",
      status: AssessmentStatus.COMPLETED, // Already completed
      startedAt: new Date(),
    });

    const request = new Request("http://localhost/api/assessment/finalize", {
      method: "POST",
      body: JSON.stringify({ assessmentId: "test-id" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain("COMPLETED");
  });
});
