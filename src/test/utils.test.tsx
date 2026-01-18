/**
 * Test Utilities Tests (RED phase)
 *
 * Following TDD: Write tests first, watch them fail, then implement.
 * @see Issue #98: REF-008
 */

import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders, waitForAsync } from "./utils";

// Mock next-auth
vi.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession: () => ({
    data: null,
    status: "unauthenticated",
  }),
}));

// Simple test component
function TestComponent({ text = "Hello World" }: { text?: string }) {
  return <div data-testid="test-component">{text}</div>;
}

describe("renderWithProviders", () => {
  it("renders a component", () => {
    renderWithProviders(<TestComponent />);

    expect(screen.getByTestId("test-component")).toBeInTheDocument();
  });

  it("passes props to the component", () => {
    renderWithProviders(<TestComponent text="Custom Text" />);

    expect(screen.getByText("Custom Text")).toBeInTheDocument();
  });

  it("returns all testing-library utilities", () => {
    const result = renderWithProviders(<TestComponent />);

    expect(result.container).toBeDefined();
    expect(result.rerender).toBeDefined();
    expect(result.unmount).toBeDefined();
  });

  it("supports rerendering", () => {
    const { rerender } = renderWithProviders(<TestComponent text="Initial" />);

    expect(screen.getByText("Initial")).toBeInTheDocument();

    rerender(<TestComponent text="Updated" />);

    expect(screen.getByText("Updated")).toBeInTheDocument();
  });

  it("wraps component with SessionProvider", () => {
    // If SessionProvider wasn't working, this would throw
    renderWithProviders(<TestComponent />);
    expect(screen.getByTestId("test-component")).toBeInTheDocument();
  });
});

describe("waitForAsync", () => {
  it("resolves after the specified delay", async () => {
    const start = Date.now();
    await waitForAsync(50);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(45); // Allow some timing variance
  });

  it("uses default delay when not specified", async () => {
    const start = Date.now();
    await waitForAsync();
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(0);
    expect(elapsed).toBeLessThan(100); // Default is 0
  });

  it("returns a promise", () => {
    const result = waitForAsync(10);

    expect(result).toBeInstanceOf(Promise);
  });
});
