import { describe, it, expect, vi, beforeEach } from "vitest";
import { logAICall, logCompletedAICall } from "./ai-call-logging";

// Mock the database
vi.mock("@/server/db", () => ({
  db: {
    assessmentApiCall: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Import the mocked db
import { db } from "@/server/db";

const mockCreate = db.assessmentApiCall.create as ReturnType<typeof vi.fn>;
const mockUpdate = db.assessmentApiCall.update as ReturnType<typeof vi.fn>;

describe("ai-call-logging", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("logAICall", () => {
    it("should create an API call log entry with required fields", async () => {
      mockCreate.mockResolvedValue({
        id: "test-api-call-id",
        requestTimestamp: new Date(),
      });

      const tracker = await logAICall({
        assessmentId: "test-assessment-id",
        endpoint: "/api/chat",
        promptText: "Hello, AI!",
        modelVersion: "gemini-2.0-flash-exp",
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          assessmentId: "test-assessment-id",
          promptText: "Hello, AI!",
          modelVersion: "gemini-2.0-flash-exp",
        }),
      });
      expect(tracker.id).toBe("test-api-call-id");
    });

    it("should create an API call log entry with AI context fields", async () => {
      mockCreate.mockResolvedValue({
        id: "test-api-call-id",
        requestTimestamp: new Date(),
      });

      await logAICall({
        assessmentId: "test-assessment-id",
        endpoint: "/api/chat",
        promptText: "Hello, AI!",
        modelVersion: "gemini-2.0-flash-exp",
        promptType: "CHAT",
        promptVersion: "1.0",
        modelUsed: "gemini-3-flash-preview",
        tokenCount: 100,
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          promptType: "CHAT",
          promptVersion: "1.0",
          modelUsed: "gemini-3-flash-preview",
          tokenCount: 100,
        }),
      });
    });

    it("should update the log entry when complete is called", async () => {
      mockCreate.mockResolvedValue({
        id: "test-api-call-id",
        requestTimestamp: new Date(),
      });
      mockUpdate.mockResolvedValue({});

      const tracker = await logAICall({
        assessmentId: "test-assessment-id",
        endpoint: "/api/chat",
        promptText: "Hello, AI!",
        modelVersion: "gemini-2.0-flash-exp",
      });

      await tracker.complete({
        responseText: "Hello, human!",
        statusCode: 200,
        promptTokens: 10,
        responseTokens: 5,
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: "test-api-call-id" },
        data: expect.objectContaining({
          responseText: "Hello, human!",
          statusCode: 200,
          promptTokens: 10,
          responseTokens: 5,
        }),
      });
    });

    it("should include duration when complete is called", async () => {
      mockCreate.mockResolvedValue({
        id: "test-api-call-id",
        requestTimestamp: new Date(),
      });
      mockUpdate.mockResolvedValue({});

      const tracker = await logAICall({
        assessmentId: "test-assessment-id",
        endpoint: "/api/chat",
        promptText: "Hello, AI!",
        modelVersion: "gemini-2.0-flash-exp",
      });

      await tracker.complete({ statusCode: 200 });

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: "test-api-call-id" },
        data: expect.objectContaining({
          durationMs: expect.any(Number),
          responseTimestamp: expect.any(Date),
        }),
      });
    });

    it("should update the log entry with error details when fail is called", async () => {
      mockCreate.mockResolvedValue({
        id: "test-api-call-id",
        requestTimestamp: new Date(),
      });
      mockUpdate.mockResolvedValue({});

      const tracker = await logAICall({
        assessmentId: "test-assessment-id",
        endpoint: "/api/chat",
        promptText: "Hello, AI!",
        modelVersion: "gemini-2.0-flash-exp",
      });

      const error = new Error("AI call failed");
      await tracker.fail(error);

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: "test-api-call-id" },
        data: expect.objectContaining({
          errorMessage: "AI call failed",
          stackTrace: expect.any(String),
          statusCode: 500,
        }),
      });
    });
  });

  describe("logCompletedAICall", () => {
    it("should create a completed API call log in one operation", async () => {
      mockCreate.mockResolvedValue({
        id: "test-api-call-id",
      });

      const id = await logCompletedAICall({
        assessmentId: "test-assessment-id",
        endpoint: "/api/code-review",
        promptText: "Review this code",
        modelVersion: "gemini-2.0-flash-exp",
        promptType: "CODE_REVIEW",
        promptVersion: "1.0",
        responseText: "Code looks good!",
        statusCode: 200,
      });

      expect(id).toBe("test-api-call-id");
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          assessmentId: "test-assessment-id",
          promptText: "Review this code",
          modelVersion: "gemini-2.0-flash-exp",
          promptType: "CODE_REVIEW",
          promptVersion: "1.0",
          responseText: "Code looks good!",
          statusCode: 200,
          durationMs: 0,
        }),
      });
    });

    it("should handle error details in one-shot logging", async () => {
      mockCreate.mockResolvedValue({
        id: "test-api-call-id",
      });

      await logCompletedAICall({
        assessmentId: "test-assessment-id",
        endpoint: "/api/code-review",
        promptText: "Review this code",
        modelVersion: "gemini-2.0-flash-exp",
        errorMessage: "Rate limit exceeded",
        stackTrace: "Error at line 1",
        statusCode: 429,
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          errorMessage: "Rate limit exceeded",
          stackTrace: "Error at line 1",
          statusCode: 429,
        }),
      });
    });
  });
});
