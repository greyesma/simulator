import { describe, it, expect } from "vitest";
import {
  buildCoworkerSystemPrompt,
  parseCoworkerKnowledge,
  CoworkerKnowledge,
  CoworkerPersona,
  EXAMPLE_COWORKERS,
} from "./coworker-persona";

describe("parseCoworkerKnowledge", () => {
  it("should return empty array for null/undefined input", () => {
    expect(parseCoworkerKnowledge(null)).toEqual([]);
    expect(parseCoworkerKnowledge(undefined)).toEqual([]);
  });

  it("should return empty array for non-array input", () => {
    expect(parseCoworkerKnowledge("string")).toEqual([]);
    expect(parseCoworkerKnowledge(123)).toEqual([]);
    expect(parseCoworkerKnowledge({ topic: "test" })).toEqual([]);
  });

  it("should filter out invalid knowledge entries", () => {
    const input = [
      { topic: "valid", triggerKeywords: ["keyword"], response: "response" },
      { topic: "missing-keywords", response: "response" },
      { triggerKeywords: ["keyword"], response: "response" },
      { topic: "missing-response", triggerKeywords: ["keyword"] },
      null,
      "string",
    ];

    const result = parseCoworkerKnowledge(input);
    expect(result).toHaveLength(1);
    expect(result[0].topic).toBe("valid");
  });

  it("should parse valid knowledge entries", () => {
    const input: CoworkerKnowledge[] = [
      {
        topic: "authentication",
        triggerKeywords: ["auth", "login", "session"],
        response: "We use JWT tokens",
        isCritical: true,
      },
      {
        topic: "testing",
        triggerKeywords: ["test", "vitest"],
        response: "Run npm test",
        isCritical: false,
      },
    ];

    const result = parseCoworkerKnowledge(input);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      topic: "authentication",
      triggerKeywords: ["auth", "login", "session"],
      response: "We use JWT tokens",
      isCritical: true,
    });
    expect(result[1].isCritical).toBe(false);
  });

  it("should default isCritical to false if not provided", () => {
    const input = [
      { topic: "test", triggerKeywords: ["keyword"], response: "response" },
    ];

    const result = parseCoworkerKnowledge(input);
    expect(result[0].isCritical).toBe(false);
  });
});

describe("buildCoworkerSystemPrompt", () => {
  const baseCoworker: CoworkerPersona = {
    name: "Jordan Rivera",
    role: "Senior Software Engineer",
    personaStyle: "Technical and detail-oriented",
    knowledge: [
      {
        topic: "authentication",
        triggerKeywords: ["auth", "login"],
        response: "We use JWT tokens",
        isCritical: true,
      },
    ],
  };

  const baseContext = {
    companyName: "Acme Corp",
  };

  it("should include coworker name and role", () => {
    const prompt = buildCoworkerSystemPrompt(baseCoworker, baseContext);

    expect(prompt).toContain("You are Jordan Rivera");
    expect(prompt).toContain("Senior Software Engineer");
    expect(prompt).toContain("Acme Corp");
  });

  it("should include persona style", () => {
    const prompt = buildCoworkerSystemPrompt(baseCoworker, baseContext);

    expect(prompt).toContain("Technical and detail-oriented");
  });

  it("should include knowledge topics and trigger keywords", () => {
    const prompt = buildCoworkerSystemPrompt(baseCoworker, baseContext);

    expect(prompt).toContain("authentication");
    expect(prompt).toContain("auth, login");
    expect(prompt).toContain("We use JWT tokens");
  });

  it("should mark critical knowledge", () => {
    const prompt = buildCoworkerSystemPrompt(baseCoworker, baseContext);

    expect(prompt).toContain("[CRITICAL - candidate should discover this]");
  });

  it("should include candidate name when provided", () => {
    const prompt = buildCoworkerSystemPrompt(baseCoworker, {
      ...baseContext,
      candidateName: "Alex",
    });

    expect(prompt).toContain("Alex");
    expect(prompt).toContain("conversation with Alex");
  });

  it("should include task description when provided", () => {
    const prompt = buildCoworkerSystemPrompt(baseCoworker, {
      ...baseContext,
      taskDescription: "Implement user authentication feature",
    });

    expect(prompt).toContain("Implement user authentication feature");
  });

  it("should include tech stack when provided", () => {
    const prompt = buildCoworkerSystemPrompt(baseCoworker, {
      ...baseContext,
      techStack: ["TypeScript", "React", "Node.js"],
    });

    expect(prompt).toContain("TypeScript, React, Node.js");
  });

  it("should handle coworker with no knowledge", () => {
    const coworkerWithNoKnowledge: CoworkerPersona = {
      ...baseCoworker,
      knowledge: [],
    };

    const prompt = buildCoworkerSystemPrompt(coworkerWithNoKnowledge, baseContext);

    expect(prompt).toContain("don't have specific technical knowledge");
  });

  it("should apply formal style guidelines", () => {
    const formalCoworker: CoworkerPersona = {
      ...baseCoworker,
      personaStyle: "Formal and professional communication style",
    };

    const prompt = buildCoworkerSystemPrompt(formalCoworker, baseContext);

    expect(prompt).toContain("proper grammar");
    expect(prompt).toContain("professional terminology");
  });

  it("should apply casual style guidelines", () => {
    const casualCoworker: CoworkerPersona = {
      ...baseCoworker,
      personaStyle: "Casual and friendly, loves to chat",
    };

    const prompt = buildCoworkerSystemPrompt(casualCoworker, baseContext);

    expect(prompt).toContain("warm and approachable");
    expect(prompt).toContain("conversational language");
  });

  it("should apply technical style guidelines", () => {
    const technicalCoworker: CoworkerPersona = {
      ...baseCoworker,
      personaStyle: "Highly technical, loves details",
    };

    const prompt = buildCoworkerSystemPrompt(technicalCoworker, baseContext);

    expect(prompt).toContain("precise technical details");
    expect(prompt).toContain("correct terminology");
  });

  it("should apply supportive style guidelines", () => {
    const supportiveCoworker: CoworkerPersona = {
      ...baseCoworker,
      personaStyle: "Very supportive and helpful mentor",
    };

    const prompt = buildCoworkerSystemPrompt(supportiveCoworker, baseContext);

    expect(prompt).toContain("Proactively offer to help");
    expect(prompt).toContain("Encourage them");
  });

  it("should apply busy style guidelines", () => {
    const busyCoworker: CoworkerPersona = {
      ...baseCoworker,
      personaStyle: "Usually busy, prefers brief interactions",
    };

    const prompt = buildCoworkerSystemPrompt(busyCoworker, baseContext);

    expect(prompt).toContain("Keep responses concise");
    expect(prompt).toContain("async communication");
  });

  it("should include conversation rules", () => {
    const prompt = buildCoworkerSystemPrompt(baseCoworker, baseContext);

    expect(prompt).toContain("Stay in character");
    expect(prompt).toContain("Answer questions fully");
    expect(prompt).toContain("don't do their work for them");
  });
});

describe("EXAMPLE_COWORKERS", () => {
  it("should have at least 4 example coworkers", () => {
    expect(EXAMPLE_COWORKERS.length).toBeGreaterThanOrEqual(4);
  });

  it("should include an Engineering Manager", () => {
    const manager = EXAMPLE_COWORKERS.find((c) =>
      c.role.toLowerCase().includes("manager")
    );
    expect(manager).toBeDefined();
    expect(manager?.name).toBe("Alex Chen");
  });

  it("should include a Senior Engineer with technical knowledge", () => {
    const engineer = EXAMPLE_COWORKERS.find((c) =>
      c.role.toLowerCase().includes("senior")
    );
    expect(engineer).toBeDefined();
    expect(engineer?.knowledge.length).toBeGreaterThan(0);

    const hasAuthKnowledge = engineer?.knowledge.some(
      (k) => k.topic === "authentication"
    );
    expect(hasAuthKnowledge).toBe(true);
  });

  it("should include a Product Manager", () => {
    const pm = EXAMPLE_COWORKERS.find((c) =>
      c.role.toLowerCase().includes("product")
    );
    expect(pm).toBeDefined();
    expect(pm?.name).toBe("Sam Patel");
  });

  it("should include a QA Lead", () => {
    const qa = EXAMPLE_COWORKERS.find((c) =>
      c.role.toLowerCase().includes("qa")
    );
    expect(qa).toBeDefined();
    expect(qa?.name).toBe("Riley Kim");
  });

  it("each coworker should have required fields", () => {
    EXAMPLE_COWORKERS.forEach((coworker) => {
      expect(coworker.name).toBeTruthy();
      expect(coworker.role).toBeTruthy();
      expect(coworker.personaStyle).toBeTruthy();
      expect(Array.isArray(coworker.knowledge)).toBe(true);
    });
  });

  it("each knowledge entry should have required fields", () => {
    EXAMPLE_COWORKERS.forEach((coworker) => {
      coworker.knowledge.forEach((knowledge) => {
        expect(knowledge.topic).toBeTruthy();
        expect(Array.isArray(knowledge.triggerKeywords)).toBe(true);
        expect(knowledge.triggerKeywords.length).toBeGreaterThan(0);
        expect(knowledge.response).toBeTruthy();
        expect(typeof knowledge.isCritical).toBe("boolean");
      });
    });
  });

  it("should have at least one critical knowledge item per technical coworker", () => {
    const technicalCoworkers = EXAMPLE_COWORKERS.filter(
      (c) =>
        c.role.toLowerCase().includes("engineer") ||
        c.role.toLowerCase().includes("qa")
    );

    technicalCoworkers.forEach((coworker) => {
      const hasCritical = coworker.knowledge.some((k) => k.isCritical);
      expect(hasCritical).toBe(true);
    });
  });

  it("each coworker should have distinct persona style", () => {
    // Manager: professional, supportive
    const manager = EXAMPLE_COWORKERS.find((c) => c.name === "Alex Chen");
    expect(manager?.personaStyle.toLowerCase()).toContain("professional");

    // Senior dev: technical
    const senior = EXAMPLE_COWORKERS.find((c) => c.name === "Jordan Rivera");
    expect(senior?.personaStyle.toLowerCase()).toContain("technical");

    // PM: friendly, casual
    const pm = EXAMPLE_COWORKERS.find((c) => c.name === "Sam Patel");
    expect(pm?.personaStyle.toLowerCase()).toContain("friendly");

    // QA: thorough, methodical
    const qa = EXAMPLE_COWORKERS.find((c) => c.name === "Riley Kim");
    expect(qa?.personaStyle.toLowerCase()).toContain("thorough");
  });
});
