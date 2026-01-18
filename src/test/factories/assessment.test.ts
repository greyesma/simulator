/**
 * Assessment Factory Tests (RED phase)
 *
 * Following TDD: Write tests first, watch them fail, then implement.
 * @see Issue #98: REF-008
 */

import { describe, it, expect } from "vitest";
import { AssessmentStatus } from "@prisma/client";
import { createMockAssessment } from "./assessment";

describe("createMockAssessment", () => {
  it("returns an assessment with all required fields", () => {
    const assessment = createMockAssessment();

    expect(assessment).toHaveProperty("id");
    expect(assessment).toHaveProperty("userId");
    expect(assessment).toHaveProperty("scenarioId");
    expect(assessment).toHaveProperty("status");
    expect(assessment).toHaveProperty("startedAt");
    expect(assessment).toHaveProperty("createdAt");
    expect(assessment).toHaveProperty("updatedAt");
  });

  it("returns valid default values", () => {
    const assessment = createMockAssessment();

    expect(typeof assessment.id).toBe("string");
    expect(assessment.id.length).toBeGreaterThan(0);
    expect(assessment.status).toBe(AssessmentStatus.HR_INTERVIEW);
    expect(assessment.startedAt).toBeInstanceOf(Date);
    expect(assessment.createdAt).toBeInstanceOf(Date);
    expect(assessment.updatedAt).toBeInstanceOf(Date);
  });

  it("allows overriding specific fields", () => {
    const customId = "custom-assessment-id";
    const customStatus = AssessmentStatus.COMPLETED;

    const assessment = createMockAssessment({
      id: customId,
      status: customStatus,
    });

    expect(assessment.id).toBe(customId);
    expect(assessment.status).toBe(customStatus);
  });

  it("preserves default values when only partial overrides provided", () => {
    const assessment = createMockAssessment({ id: "custom-id" });

    expect(assessment.id).toBe("custom-id");
    expect(assessment.status).toBe(AssessmentStatus.HR_INTERVIEW); // default preserved
    expect(assessment.userId).toBeDefined();
  });

  it("allows overriding optional fields", () => {
    const prUrl = "https://github.com/test/repo/pull/1";
    const completedAt = new Date("2026-01-15");

    const assessment = createMockAssessment({
      prUrl,
      completedAt,
    });

    expect(assessment.prUrl).toBe(prUrl);
    expect(assessment.completedAt).toEqual(completedAt);
  });

  it("returns consistent default id format", () => {
    const assessment1 = createMockAssessment();
    const assessment2 = createMockAssessment();

    // Both should have test-prefixed IDs for easy identification in tests
    expect(assessment1.id).toContain("test-");
    expect(assessment2.id).toContain("test-");
  });
});
