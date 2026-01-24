import type { AssessmentStatus, AssessmentLogEventType } from "@prisma/client";

// Serialized types from server (dates as strings)
export interface SerializedLog {
  id: string;
  eventType: AssessmentLogEventType;
  timestamp: string;
  durationMs: number | null;
  metadata: unknown;
}

export interface SerializedApiCall {
  id: string;
  requestTimestamp: string;
  responseTimestamp: string | null;
  durationMs: number | null;
  modelVersion: string;
  statusCode: number | null;
  errorMessage: string | null;
  stackTrace: string | null;
  promptTokens: number | null;
  responseTokens: number | null;
  promptText: string;
  responseText: string | null;
}

export interface SerializedRecording {
  id: string;
  type: string;
  storageUrl: string;
  startTime: string;
  endTime: string | null;
}

export interface SerializedAssessment {
  id: string;
  userId: string;
  scenarioId: string;
  status: AssessmentStatus;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  supersededBy: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  scenario: {
    id: string;
    name: string;
  };
  logs: SerializedLog[];
  apiCalls: SerializedApiCall[];
  recordings: SerializedRecording[];
}

// Event types for unified timeline
export type TimelineEventType = "log" | "apiCall";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: string;
  eventType?: AssessmentLogEventType;
  modelVersion?: string;
  durationMs: number | null;
  isError: boolean;
  metadata?: unknown;
  errorMessage?: string | null;
  stackTrace?: string | null;
  statusCode?: number | null;
  promptTokens?: number | null;
  responseTokens?: number | null;
  promptText?: string;
  responseText?: string | null;
  responseTimestamp?: string | null;
}

// Toast notification type
export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}
