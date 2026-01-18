/**
 * Vitest Test Setup
 *
 * This file runs before each test file and configures the test environment.
 * It sets up global mocks, extends matchers, and configures the testing environment.
 *
 * @see Issue #98: REF-008
 */

import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// ============================================================================
// Global Mocks
// ============================================================================

/**
 * Mock next/navigation
 *
 * Provides mock implementations for Next.js navigation hooks.
 * These are commonly used in components and need to be mocked for testing.
 */
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

/**
 * Mock next/image
 *
 * Next.js Image component requires server-side optimization.
 * Replace with a standard img element for testing.
 */
vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

/**
 * Mock next/link
 *
 * Next.js Link component for client-side navigation.
 * Replace with a standard anchor element for testing.
 */
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// ============================================================================
// Browser API Mocks
// ============================================================================

/**
 * Mock window.matchMedia
 *
 * Used by many UI libraries for responsive design.
 * Provides a basic implementation that always returns false.
 */
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

/**
 * Mock window.scrollTo
 *
 * Window scroll method used by various components.
 */
Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: vi.fn(),
});

/**
 * Mock IntersectionObserver
 *
 * Used for lazy loading and infinite scroll features.
 */
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: readonly number[] = [];

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});

/**
 * Mock ResizeObserver
 *
 * Used for responsive components that need to track element sizes.
 */
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: MockResizeObserver,
});

/**
 * Mock URL.createObjectURL and revokeObjectURL
 *
 * Used for blob handling, file previews, etc.
 */
Object.defineProperty(URL, "createObjectURL", {
  writable: true,
  value: vi.fn().mockReturnValue("blob:mock-url"),
});

Object.defineProperty(URL, "revokeObjectURL", {
  writable: true,
  value: vi.fn(),
});

// ============================================================================
// Console Suppression (Optional)
// ============================================================================

/**
 * Suppress specific console warnings in tests.
 *
 * Uncomment to suppress common React warnings that clutter test output.
 * Be careful with this - only suppress known safe warnings.
 */
// const originalError = console.error;
// console.error = (...args) => {
//   if (
//     typeof args[0] === "string" &&
//     args[0].includes("Warning: ReactDOM.render is no longer supported")
//   ) {
//     return;
//   }
//   originalError.call(console, ...args);
// };
