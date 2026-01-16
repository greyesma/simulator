import { describe, it, expect, vi, beforeEach } from "vitest";

// Define mock functions before vi.mock calls
const mockAuth = vi.fn();
const mockFindFirst = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@/server/db", () => ({
  db: {
    assessment: {
      findFirst: (args: unknown) => mockFindFirst(args),
      update: (args: unknown) => mockUpdate(args),
    },
  },
}));

import { POST, GET } from "./route";
import { NextRequest } from "next/server";

describe("/api/assessment/consent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST - Record consent", () => {
    it("returns 401 if not authenticated", async () => {
      mockAuth.mockResolvedValueOnce(null);

      const request = new NextRequest("http://localhost/api/assessment/consent", {
        method: "POST",
        body: JSON.stringify({ assessmentId: "test-id" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("returns 400 if assessmentId is missing", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "user-123" } });

      const request = new NextRequest("http://localhost/api/assessment/consent", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Assessment ID is required");
    });

    it("returns 404 if assessment not found", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "user-123" } });
      mockFindFirst.mockResolvedValueOnce(null);

      const request = new NextRequest("http://localhost/api/assessment/consent", {
        method: "POST",
        body: JSON.stringify({ assessmentId: "nonexistent-id" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Assessment not found");
    });

    it("returns success if consent already given", async () => {
      const existingConsentDate = new Date("2025-01-01");
      mockAuth.mockResolvedValueOnce({ user: { id: "user-123" } });
      mockFindFirst.mockResolvedValueOnce({
        id: "assessment-123",
        consentGivenAt: existingConsentDate,
      });

      const request = new NextRequest("http://localhost/api/assessment/consent", {
        method: "POST",
        body: JSON.stringify({ assessmentId: "assessment-123" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe("Consent already recorded");
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("records consent successfully", async () => {
      const newConsentDate = new Date();
      mockAuth.mockResolvedValueOnce({ user: { id: "user-123" } });
      mockFindFirst.mockResolvedValueOnce({
        id: "assessment-123",
        consentGivenAt: null,
      });
      mockUpdate.mockResolvedValueOnce({
        id: "assessment-123",
        consentGivenAt: newConsentDate,
      });

      const request = new NextRequest("http://localhost/api/assessment/consent", {
        method: "POST",
        body: JSON.stringify({ assessmentId: "assessment-123" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe("Consent recorded successfully");
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: "assessment-123" },
        data: { consentGivenAt: expect.any(Date) },
      });
    });
  });

  describe("GET - Check consent status", () => {
    it("returns 401 if not authenticated", async () => {
      mockAuth.mockResolvedValueOnce(null);

      const request = new NextRequest(
        "http://localhost/api/assessment/consent?assessmentId=test-id"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("returns 400 if assessmentId is missing", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "user-123" } });

      const request = new NextRequest("http://localhost/api/assessment/consent");

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Assessment ID is required");
    });

    it("returns 404 if assessment not found", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "user-123" } });
      mockFindFirst.mockResolvedValueOnce(null);

      const request = new NextRequest(
        "http://localhost/api/assessment/consent?assessmentId=nonexistent-id"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Assessment not found");
    });

    it("returns hasConsent: false when consent not given", async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: "user-123" } });
      mockFindFirst.mockResolvedValueOnce({
        id: "assessment-123",
        consentGivenAt: null,
      });

      const request = new NextRequest(
        "http://localhost/api/assessment/consent?assessmentId=assessment-123"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.hasConsent).toBe(false);
      expect(data.consentGivenAt).toBeNull();
    });

    it("returns hasConsent: true when consent was given", async () => {
      const consentDate = new Date("2025-01-01");
      mockAuth.mockResolvedValueOnce({ user: { id: "user-123" } });
      mockFindFirst.mockResolvedValueOnce({
        id: "assessment-123",
        consentGivenAt: consentDate,
      });

      const request = new NextRequest(
        "http://localhost/api/assessment/consent?assessmentId=assessment-123"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.hasConsent).toBe(true);
      expect(data.consentGivenAt).toBe(consentDate.toISOString());
    });
  });
});
