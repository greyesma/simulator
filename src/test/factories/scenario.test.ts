/**
 * Scenario Factory Tests (RED phase)
 *
 * Following TDD: Write tests first, watch them fail, then implement.
 * @see Issue #98: REF-008
 */

import { describe, it, expect } from "vitest";
import { createMockScenario } from "./scenario";

describe("createMockScenario", () => {
  it("returns a scenario with all required fields", () => {
    const scenario = createMockScenario();

    expect(scenario).toHaveProperty("id");
    expect(scenario).toHaveProperty("name");
    expect(scenario).toHaveProperty("companyName");
    expect(scenario).toHaveProperty("companyDescription");
    expect(scenario).toHaveProperty("taskDescription");
    expect(scenario).toHaveProperty("repoUrl");
    expect(scenario).toHaveProperty("techStack");
    expect(scenario).toHaveProperty("isPublished");
    expect(scenario).toHaveProperty("createdAt");
    expect(scenario).toHaveProperty("updatedAt");
  });

  it("returns valid default values", () => {
    const scenario = createMockScenario();

    expect(typeof scenario.id).toBe("string");
    expect(scenario.id.length).toBeGreaterThan(0);
    expect(typeof scenario.name).toBe("string");
    expect(typeof scenario.companyName).toBe("string");
    expect(Array.isArray(scenario.techStack)).toBe(true);
    expect(scenario.isPublished).toBe(false);
    expect(scenario.createdAt).toBeInstanceOf(Date);
    expect(scenario.updatedAt).toBeInstanceOf(Date);
  });

  it("allows overriding specific fields", () => {
    const customId = "custom-scenario-id";
    const customName = "Custom Scenario";
    const customTechStack = ["rust", "wasm"];

    const scenario = createMockScenario({
      id: customId,
      name: customName,
      techStack: customTechStack,
    });

    expect(scenario.id).toBe(customId);
    expect(scenario.name).toBe(customName);
    expect(scenario.techStack).toEqual(customTechStack);
  });

  it("preserves default values when only partial overrides provided", () => {
    const scenario = createMockScenario({ id: "custom-id" });

    expect(scenario.id).toBe("custom-id");
    expect(scenario.isPublished).toBe(false); // default preserved
    expect(scenario.name).toBeDefined();
    expect(scenario.techStack.length).toBeGreaterThan(0);
  });

  it("allows setting isPublished to true", () => {
    const scenario = createMockScenario({ isPublished: true });

    expect(scenario.isPublished).toBe(true);
  });

  it("returns consistent default id format", () => {
    const scenario1 = createMockScenario();
    const scenario2 = createMockScenario();

    // Both should have test-prefixed IDs for easy identification in tests
    expect(scenario1.id).toContain("test-");
    expect(scenario2.id).toContain("test-");
  });

  it("provides valid repoUrl format by default", () => {
    const scenario = createMockScenario();

    expect(scenario.repoUrl).toMatch(/^https:\/\//);
  });

  it("provides a realistic default tech stack", () => {
    const scenario = createMockScenario();

    // Default should include common web technologies
    expect(scenario.techStack.length).toBeGreaterThan(0);
    expect(scenario.techStack.some((tech) => tech.length > 0)).toBe(true);
  });
});
