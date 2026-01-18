# Test Infrastructure

Test utilities, factories, and mocks for consistent, maintainable tests.

## Quick Start

```typescript
import { renderWithProviders, screen } from "@/test/utils";
import { createMockUser, createMockAssessment } from "@/test/factories";
import { createMockPrismaClient, setupMediaMocks } from "@/test/mocks";
```

## Structure

```
src/test/
├── setup.tsx              # Global test setup (runs before each file)
├── utils.tsx              # renderWithProviders, waitForAsync
├── factories/
│   ├── assessment.ts      # createMockAssessment()
│   ├── user.ts            # createMockUser()
│   ├── scenario.ts        # createMockScenario()
│   └── index.ts           # Re-exports
├── mocks/
│   ├── media.ts           # MediaRecorder, AudioContext mocks
│   ├── gemini.ts          # Gemini session mock
│   ├── prisma.ts          # Prisma client mock
│   └── index.ts           # Re-exports
└── CLAUDE.md              # This file
```

## Factories

Factories create type-safe mock data with sensible defaults.

### Usage

```typescript
import { createMockUser, createMockAssessment, createMockScenario } from "@/test/factories";

// Use defaults
const user = createMockUser();

// Override specific fields
const admin = createMockUser({ role: "ADMIN" });
const completed = createMockAssessment({
  status: AssessmentStatus.COMPLETED,
  completedAt: new Date(),
});
```

### Factory Pattern

All factories follow this pattern:

1. Return complete objects with all required fields
2. Use `test-` prefixed IDs for easy identification
3. Accept partial overrides that spread last
4. Use realistic default values

## Mocks

### Media Mocks (MediaRecorder, AudioContext, MediaStream)

For components using browser media APIs:

```typescript
import { setupMediaMocks, teardownMediaMocks, createMockMediaRecorder } from "@/test/mocks";

describe("MediaComponent", () => {
  let mediaMocks: MediaMocksState;

  beforeEach(() => {
    mediaMocks = setupMediaMocks();
  });

  afterEach(() => {
    teardownMediaMocks(mediaMocks);
  });

  it("starts recording", () => {
    const recorder = new MediaRecorder(new MediaStream());
    recorder.start();
    expect(recorder.start).toHaveBeenCalled();
  });
});
```

### Gemini Mocks

For AI conversation components:

```typescript
import { createMockGeminiSession, MockGeminiSession } from "@/test/mocks";

// Simple mock
const session = createMockGeminiSession();
await session.send({ text: "Hello" });
expect(session.send).toHaveBeenCalled();

// Full-featured mock class
const session = new MockGeminiSession();
session.setResponseHandler((msg) => ({ text: `Echo: ${msg.text}` }));
```

### Prisma Mocks

For database interactions:

```typescript
import { createMockPrismaClient, MockPrismaClient } from "@/test/mocks";

// Simple mock
const prisma = createMockPrismaClient();
prisma.user.findUnique.mockResolvedValue({ id: "123", name: "Test" });

// Full-featured mock class
const prisma = new MockPrismaClient();
prisma.user.findMany.mockResolvedValue([user1, user2]);
```

## Rendering Components

Always use `renderWithProviders` for component tests:

```typescript
import { renderWithProviders, screen } from "@/test/utils";

it("renders component", () => {
  renderWithProviders(<MyComponent />);
  expect(screen.getByText("Hello")).toBeInTheDocument();
});
```

This wraps components with SessionProvider and other required providers.

## Global Setup

The `setup.tsx` file provides automatic mocks for:

- **next/navigation**: `useRouter`, `usePathname`, `useSearchParams`, `useParams`
- **next/image**: Renders as standard `<img>`
- **next/link**: Renders as standard `<a>`
- **window.matchMedia**: Always returns `matches: false`
- **IntersectionObserver**: No-op observer
- **ResizeObserver**: No-op observer
- **URL.createObjectURL/revokeObjectURL**: Returns mock blob URLs

## Patterns

### Test Organization

```typescript
describe("ComponentName", () => {
  describe("rendering", () => {
    it("renders with default props", () => {});
    it("renders with custom props", () => {});
  });

  describe("interactions", () => {
    it("handles click events", () => {});
    it("handles form submission", () => {});
  });

  describe("edge cases", () => {
    it("handles empty data", () => {});
    it("handles error states", () => {});
  });
});
```

### Testing Async Behavior

```typescript
import { waitFor } from "@testing-library/react";

it("loads data asynchronously", async () => {
  renderWithProviders(<DataComponent />);

  await waitFor(() => {
    expect(screen.getByText("Loaded")).toBeInTheDocument();
  });
});
```

### Testing User Interactions

```typescript
import { userEvent } from "@/test/utils";

it("handles button click", async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();

  renderWithProviders(<Button onClick={onClick} />);
  await user.click(screen.getByRole("button"));

  expect(onClick).toHaveBeenCalled();
});
```

## Gotchas

1. **JSX in test files**: Use `.tsx` extension, not `.ts`
2. **Import order**: Import from `@/test/*` not relative paths from components
3. **Async mocks**: Always `await` async operations
4. **Mock cleanup**: Reset mocks in `afterEach` if they hold state
5. **Provider wrapping**: Use `renderWithProviders`, not bare `render`
