# Ralph Progress Notes

## Issue #128: DS-018: Migrate chat/ core components to modern design

- **What was implemented:**
  - Migrated `chat.tsx` to use Input and Button components from shadcn/ui
  - Updated message bubbles to use rounded-lg corners with proper background colors (primary for user, muted for coworker)
  - Migrated `coworker-avatar.tsx` to use Avatar component with AvatarImage and AvatarFallback
  - Updated typing indicator to use modern rounded pill style with animate-pulse
  - Updated header with modern border styling and rounded status indicators
  - Added Send icon to the Send button

- **Files changed:**
  - `src/components/chat/chat.tsx` - Major update: Input, Button, Avatar imports and styling
  - `src/components/chat/coworker-avatar.tsx` - Migrated to Avatar component with fallback initials

- **Learnings for future iterations:**
  - The eslint rule `no-restricted-imports` warns about `@/components/ui/*` imports, but this is expected for component imports (the rule is meant for TYPE imports from implementation files)
  - Avatar component from shadcn uses `rounded-full` by default which works well for circular avatars
  - DiceBear identicon API works well with the new primary blue color (#237CF1)
  - When migrating to modern design, use `font-semibold` instead of `font-bold` for a softer look

- **Visual verification:**
  - Screenshots captured in `screenshots/issue-128-chat-modern-design.png` and `screenshots/issue-128-chat-with-input.png`

## Issue #129: DS-019: Migrate chat/ layout components to modern design

- **What was implemented:**
  - Updated `slack-layout.tsx` with shadow-md, rounded corners (rounded-r-lg), modern border styling
  - Updated `coworker-sidebar.tsx` with smooth transitions (ease-in-out), rounded hover states
  - Added active coworker highlighting with primary blue accent (border-l-primary bg-primary/10)
  - Updated `floating-call-bar.tsx` to use Button and Badge components from shadcn/ui
  - Added rounded-xl and shadow-lg to call bar for floating effect
  - Replaced neo-brutalist 2px borders with subtle border-border styling throughout

- **Files changed:**
  - `src/components/chat/slack-layout.tsx` - Container shadow, rounded corners, modern borders, smooth transitions
  - `src/components/chat/coworker-sidebar.tsx` - Smooth hover transitions, rounded corners, call button styling
  - `src/components/chat/floating-call-bar.tsx` - Button/Badge components, rounded-xl shadow-lg, green Badge for in-call

- **Learnings for future iterations:**
  - Use `transition-all duration-200 ease-in-out` for smooth hover effects (all three timing properties)
  - Active/selected states work well with `border-l-4 border-l-primary bg-primary/10`
  - For floating elements, combine `rounded-xl` with `shadow-lg` for depth
  - Badge component with custom bg-green-500 works well for status indicators
  - Both slack-layout and coworker-sidebar have CoworkerItem/OfflineTeamMember - keep them consistent

- **Gotchas:**
  - slack-layout.tsx has its own CoworkerItem component (different from coworker-sidebar.tsx) - must update both
  - The floating-call-bar already had Button imported but wasn't using it for all buttons

## Issue #164: Fix missing @react-email/render dependency

- **What was implemented:**
  - Installed `@react-email/render` package (v2.0.4) as a direct dependency
  - This resolves the build warning about module not found in the resend package

- **Files changed:**
  - `package.json` - Added `@react-email/render` dependency
  - `package-lock.json` - Updated with new package and its dependencies

- **Learnings for future iterations:**
  - The `resend` package has a peer dependency on `@react-email/render` that wasn't automatically installed
  - The dependency trace was: `resend` → `email.ts` → `external/index.ts` → `cv-parser.ts`
  - When adding email packages like `resend`, check if peer dependencies need manual installation

- **Verification:**
  - Build passes without the `@react-email/render` module not found warning

## Issue #165: Fix ESLint import restriction warnings in chat components

- **What was implemented:**
  - Updated ESLint config to allow `@/components/ui/*` imports (shadcn components)
  - The `no-restricted-imports` rule pattern was too broad, catching legitimate component imports
  - Added negative pattern `!@/components/ui/*` to exclude shadcn UI components from the restriction

- **Files changed:**
  - `eslint.config.mjs` - Updated pattern from `["@/components/*/*"]` to `["@/components/*/*", "!@/components/ui/*"]`

- **Learnings for future iterations:**
  - The `no-restricted-imports` rule pattern `@/components/*/*` was meant to catch TYPE imports from implementation files
  - But shadcn/ui components legitimately export components from `@/components/ui/*` paths
  - Use negative patterns (`!@/components/ui/*`) to create exceptions in ESLint restricted import rules
  - The original warning message was misleading since these weren't type imports at all

- **Verification:**
  - Build passes without the 6 warnings about imports from `@/components/ui/input`, `@/components/ui/button`, `@/components/ui/avatar`, and `@/components/ui/badge`

## Issue #166: Fix missing useCallback dependency in cv-upload.tsx

- **What was implemented:**
  - Wrapped `uploadFile` function in `useCallback` with proper dependencies (`assessmentId`, `onError`, `onUploadComplete`)
  - Added `uploadFile` to the `handleDrop` useCallback dependency array
  - This fixes the `react-hooks/exhaustive-deps` ESLint warning

- **Files changed:**
  - `src/components/shared/cv-upload.tsx` - Wrapped `uploadFile` in `useCallback` and updated `handleDrop` dependencies

- **Learnings for future iterations:**
  - When a callback uses a function defined in the same component, that function must either:
    1. Be wrapped in `useCallback` with its own dependencies
    2. Then included as a dependency in the callback that uses it
  - Simply adding the function to the dependency array without wrapping it would cause infinite re-renders
  - The `uploadFile` function uses props (`assessmentId`, `onError`, `onUploadComplete`) which must be in its dependency array

- **Verification:**
  - Build passes without the `react-hooks/exhaustive-deps` warning for cv-upload.tsx

## Issue #167: Replace img with Next.js Image in markdown.tsx

- **What was implemented:**
  - Replaced `<img>` element with Next.js `<Image />` component in the markdown renderer
  - Added `unoptimized` prop since markdown images can come from any external source
  - Used `width={0} height={0} sizes="100vw"` pattern for responsive images with unknown dimensions
  - Added type guard for `src` since react-markdown types include `Blob` (though markdown only provides strings)
  - Wrapped Image in a `<span>` block element to maintain proper block-level behavior

- **Files changed:**
  - `src/components/shared/markdown.tsx` - Imported Image from next/image, replaced img component

- **Learnings for future iterations:**
  - react-markdown's `Components` type defines `src` as `string | Blob`, requiring a type guard
  - For markdown/CMS content with unknown image sources, use `unoptimized` to bypass domain restrictions
  - The `width={0} height={0} sizes="100vw"` pattern allows responsive sizing for images with unknown dimensions
  - Next.js Image must be wrapped in a block element when used in inline contexts to maintain layout

- **Verification:**
  - Build passes without the `@next/next/no-img-element` warning for markdown.tsx

## Issue #130: DS-020: Migrate chat/ voice components to modern design

- **What was implemented:**
  - Updated `coworker-voice-call.tsx` with modern shadcn/ui design system styling
  - Added Button component import and replaced all custom buttons with Button variants
  - Container now has rounded-xl corners, shadow-lg, and bg-card styling
  - Connection state indicator has rounded-full status dot with smooth transitions
  - Audio indicators (mic/speaker) have rounded backgrounds with state-aware colors
  - Speaking indicator uses primary blue color instead of gold/secondary
  - End call button uses Button destructive variant (red)
  - Start call button uses custom green styling with Button component
  - Transcript message bubbles use rounded-lg with primary/muted backgrounds
  - All state transitions use `transition-all duration-200` for smooth animations
  - Error states use text-destructive instead of text-red-500
  - Tips section has rounded-b-xl with bg-muted/50 background
  - Headers use font-semibold instead of font-bold

- **Files changed:**
  - `src/components/chat/coworker-voice-call.tsx` - Complete modern design overhaul

- **Learnings for future iterations:**
  - The Button component has size="icon" for icon-only buttons (h-10 w-10)
  - For custom colored buttons (like green Start Call), use className override on Button
  - Use bg-{color}/20 for subtle background states (e.g., bg-green-500/20 for active mic)
  - Animate-pulse works well for active speaking/listening indicators
  - The destructive variant is perfect for end call buttons
  - Use rounded-full for small status indicators, rounded-xl for containers

- **Gotchas:**
  - Voice calls require real audio support, so headless browsers show "Not supported" error
  - The call UI is rendered inline in the chat page, not as a separate modal
  - FloatingCallBar shows "In call" status in the chat sidebar

- **Visual verification:**
  - Screenshots captured in `screenshots/issue-130-chat-page.png` and `screenshots/issue-130-voice-call.png`
  - Note: Full voice call UI cannot be tested in headless browser due to audio requirements

## Issue #131: DS-021: Migrate assessment/ components to modern design

- **What was implemented:**
  - Updated `screen-recording-guard.tsx` to use Dialog and Button components from shadcn/ui
  - Initial consent modal now uses Dialog with rounded-xl icons in bg-primary/10 backgrounds
  - Recording stopped modal uses destructive color scheme for warning icon
  - Permission request modals prevent closing via onPointerDownOutside and onEscapeKeyDown
  - All buttons replaced with Button component (size="lg" for full-width actions)
  - Updated `voice-conversation.tsx` to match coworker-voice-call.tsx styling
  - Main container uses rounded-xl border bg-card shadow-lg
  - Status indicators use rounded-full with transition-colors duration-200
  - Audio indicators have rounded-full backgrounds with state-aware colors (green/primary)
  - Speaking indicator uses primary blue with animate-pulse
  - Avatar uses rounded-full with bg-primary/10 and text-primary
  - Message bubbles use rounded-lg with primary/muted backgrounds
  - Tips section uses rounded-b-xl with bg-muted/50
  - Headers use font-semibold instead of font-bold

- **Files changed:**
  - `src/components/assessment/screen-recording-guard.tsx` - Dialog and Button migration
  - `src/components/assessment/voice-conversation.tsx` - Complete modern design overhaul
  - Note: `assessment-screen-wrapper.tsx` is a thin context provider wrapper with no visual styling

- **Learnings for future iterations:**
  - Voice conversation component styling should match coworker-voice-call.tsx for consistency
  - Dialog component from shadcn/ui handles modal overlay, animations, and accessibility
  - Use onPointerDownOutside and onEscapeKeyDown to prevent modal dismissal for required flows
  - DialogFooter with flex-col for full-width buttons in modals
  - Assessment pages use E2E_TEST_MODE to bypass screen recording in headless tests

- **Gotchas:**
  - Screen recording guard modals can't be tested in E2E mode (bypassed by design)
  - Voice conversation requires real audio support, headless browsers show "Not supported"
  - Assessment flow redirects based on current stage, so direct page access may redirect

- **Visual verification:**
  - Screenshot captured in `screenshots/issue-131-chat-page.png`
  - Note: Recording guard modals bypassed in E2E mode, voice UI requires audio support