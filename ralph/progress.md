# Ralph Progress Log

## Issue #111: DS-001: Install shadcn/ui CLI and initialize configuration

### What was implemented
- Created `src/lib/utils.ts` with the `cn()` utility function for merging Tailwind classes
- Created `components.json` with shadcn/ui CLI configuration (paths, aliases, icon library)
- Updated `tailwind.config.ts` to use HSL CSS variables and shadcn-compatible border radius
- Updated `src/app/globals.css` with HSL-based CSS variables for light/dark themes
- New design tokens: primary #237CF1 (blue), radius 0.5rem

### Files changed
- `src/lib/utils.ts` (new) - cn() utility
- `components.json` (new) - shadcn CLI config
- `tailwind.config.ts` (modified) - HSL colors, radius, ES module import
- `src/app/globals.css` (modified) - HSL CSS variables, @layer base

### Pre-existing issues fixed (unrelated to this task)
- `src/components/chat/coworker-sidebar.test.tsx` - removed unused fireEvent import
- `src/lib/ai/coworker-persona.ts` - removed unused PersonalityStyle import
- `src/lib/analysis/ai-call-logging.ts` - prefixed unused endpoint variables with underscore
- `src/test/mocks/media.test.ts` - removed unused vi import
- `src/app/api/assessment/report/route.ts` - fixed ChatMessage import to use @/types
- `src/lib/analysis/assessment-aggregation.ts` - fixed ChatMessage import to use @/types

### Learnings for future iterations
1. The project already had several shadcn-related dependencies (`clsx`, `tailwind-merge`, `tailwindcss-animate`, Radix primitives) - this made the setup straightforward
2. The tailwind.config.ts was using `require()` which fails ESLint's no-require-imports rule - use ES module imports instead
3. shadcn/ui uses HSL values without the `hsl()` wrapper in CSS variables (e.g., `--primary: 214 93% 54%`), then wraps them in tailwind config (`hsl(var(--primary))`)
4. There were pre-existing lint/type errors in the codebase that needed fixing before the build could pass:
   - Unused imports in test files
   - Missing exports in barrel files (`ChatMessage` was removed from `@/lib/ai` but still imported)
5. The design system migration uses new tokens: primary blue (#237CF1) instead of gold/black neo-brutalist, 0.5rem radius instead of 0

### Gotchas discovered
- Next.js build runs lint as part of the process, so pre-existing lint errors block the build
- The `@react-email/render` module warning is a known issue with resend package but doesn't block compilation
