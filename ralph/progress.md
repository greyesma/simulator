# Ralph Progress

Learnings from autonomous issue resolution.

## Issue #98: REF-008 - Create Test Factory Pattern

### What was implemented
- Created `src/test/factories/` with factory functions for Assessment, User, and Scenario
- Created `src/test/mocks/` with reusable mocks for MediaRecorder, AudioContext, Gemini, and Prisma
- Created `src/test/utils.tsx` with `renderWithProviders()` helper
- Expanded `src/test/setup.tsx` with global mock configuration for Next.js and browser APIs
- Added `src/test/CLAUDE.md` documenting test patterns
- Added 3 example component tests using the new factories

### Files changed
- `src/test/factories/assessment.ts` - `createMockAssessment(overrides?)`
- `src/test/factories/user.ts` - `createMockUser(overrides?)`
- `src/test/factories/scenario.ts` - `createMockScenario(overrides?)`
- `src/test/factories/index.ts` - Re-exports
- `src/test/mocks/media.ts` - MediaRecorder, AudioContext, MediaStream mocks
- `src/test/mocks/gemini.ts` - Gemini session mock
- `src/test/mocks/prisma.ts` - Prisma client mock
- `src/test/mocks/index.ts` - Re-exports
- `src/test/utils.tsx` - `renderWithProviders()`, re-exports testing-library
- `src/test/setup.tsx` - Extended global setup with Next.js mocks
- `src/test/CLAUDE.md` - Test patterns documentation
- `src/components/error-display.test.tsx` - Example using factory pattern
- `src/components/pr-link-modal.test.tsx` - Example with form testing
- `src/components/coworker-sidebar.test.tsx` - Example with interaction testing
- `vitest.config.ts` - Updated setup file path

### Learnings for future iterations

1. **Vitest Mock Types**: When using `vi.fn()` return values as callable functions, TypeScript may complain about `Mock<Procedure | Constructable>` not being callable. Cast to specific function signature: `(mock.fn as Mock<() => void>)()`

2. **JSX in Test Files**: Test files with JSX must use `.tsx` extension, not `.ts`. This applies to setup files, utils, and test files themselves.

3. **Global Mock Classes**: For browser APIs that need to work as constructors (like `MediaRecorder`, `AudioContext`), use actual class definitions instead of `vi.fn().mockImplementation()`:
   ```typescript
   class MockMediaRecorderClass {
     static isTypeSupported = vi.fn().mockReturnValue(true);
     start = vi.fn();
     // ...
   }
   global.MediaRecorder = MockMediaRecorderClass as unknown as typeof MediaRecorder;
   ```

4. **Factory Pattern**: All factories should:
   - Return complete objects with all required fields
   - Use `test-` prefixed IDs for easy identification
   - Accept partial overrides that spread last
   - Use realistic default values

5. **TDD for Test Infrastructure**: Even test utilities benefit from TDD. Write tests for factories first, watch them fail, then implement.

6. **Button States**: When testing forms, be aware of disabled button states. If a button is disabled when input is empty, clicking it won't trigger validation - adjust tests accordingly.
