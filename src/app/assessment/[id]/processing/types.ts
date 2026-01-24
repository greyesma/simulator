import type { VideoAssessmentStatus } from "@prisma/client";

export interface VideoAssessmentInfo {
  id: string;
  status: VideoAssessmentStatus;
}

export interface ProcessingStats {
  totalDurationMinutes: number | null;
  coworkersContacted: number;
  totalMessages: number;
  scenarioName: string;
  companyName: string;
  userName: string;
  hasHRInterview: boolean;
  hasDefenseCall: boolean;
  videoAssessment: VideoAssessmentInfo | null;
}
