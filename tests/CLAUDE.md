# tests - Test Suite

850+ unit tests (Vitest, co-located as *.test.ts). E2E tests via agent-browser.

## Vitest Mocking

Define mocks INSIDE `vi.mock()` factory due to hoisting. Mock next/navigation's notFound/redirect by throwing errors.

## E2E (agent-browser)

Commands: open, screenshot, snapshot, click, fill, type. Run with `npm run test:e2e`.

## Gotchas

- jsdom File/Blob `arrayBuffer()` hangs - skip large file tests
- MediaRecorder doesn't exist in Node.js - must mock
- Global fetch mocks need beforeEach/afterEach cleanup

## Screenshots

Issue verification: `screenshots/issue-<N>.png`. E2E: `tests/e2e/screenshots/`.
