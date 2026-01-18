/**
 * User Factory Tests (RED phase)
 *
 * Following TDD: Write tests first, watch them fail, then implement.
 * @see Issue #98: REF-008
 */

import { describe, it, expect } from "vitest";
import { UserRole } from "@prisma/client";
import { createMockUser } from "./user";

describe("createMockUser", () => {
  it("returns a user with all required fields", () => {
    const user = createMockUser();

    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("email");
    expect(user).toHaveProperty("role");
    expect(user).toHaveProperty("createdAt");
    expect(user).toHaveProperty("updatedAt");
  });

  it("returns valid default values", () => {
    const user = createMockUser();

    expect(typeof user.id).toBe("string");
    expect(user.id.length).toBeGreaterThan(0);
    expect(user.role).toBe(UserRole.USER);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it("allows overriding specific fields", () => {
    const customId = "custom-user-id";
    const customEmail = "custom@example.com";
    const customRole = UserRole.ADMIN;

    const user = createMockUser({
      id: customId,
      email: customEmail,
      role: customRole,
    });

    expect(user.id).toBe(customId);
    expect(user.email).toBe(customEmail);
    expect(user.role).toBe(customRole);
  });

  it("preserves default values when only partial overrides provided", () => {
    const user = createMockUser({ id: "custom-id" });

    expect(user.id).toBe("custom-id");
    expect(user.role).toBe(UserRole.USER); // default preserved
    expect(user.email).toBeDefined();
  });

  it("allows overriding optional fields", () => {
    const name = "John Doe";
    const image = "https://example.com/avatar.png";

    const user = createMockUser({
      name,
      image,
    });

    expect(user.name).toBe(name);
    expect(user.image).toBe(image);
  });

  it("returns consistent default id format", () => {
    const user1 = createMockUser();
    const user2 = createMockUser();

    // Both should have test-prefixed IDs for easy identification in tests
    expect(user1.id).toContain("test-");
    expect(user2.id).toContain("test-");
  });

  it("provides valid email format by default", () => {
    const user = createMockUser();

    expect(user.email).toMatch(/@/);
  });
});
