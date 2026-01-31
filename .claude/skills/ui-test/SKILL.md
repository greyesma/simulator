---
name: ui-test
description: Generate UI variations for a route. Use when user says "/ui-test [url]" or wants to explore different UI designs for a page.
user-invocable: true
---

# UI Test Skill

Generate 10 UI variations for any app route to help the user explore different design approaches.

## Your Job

1. Receive a route URL from the user (e.g., `http://localhost:3001/recruiter/dashboard`)
2. Read the current page's code to understand its structure and data
3. Clear any existing test files in `src/app/ui-tester/current-test/`
4. Generate 10 diverse UI variations with mock data
5. Tell the user to view at `http://localhost:3001/ui-tester`

**Do NOT implement the final UI. Just create variations for the user to review.**

## Workflow

```
1. Parse route → find source files
2. Read page.tsx and client.tsx to understand:
   - Data structure (props, types)
   - Current UI components used
   - Key sections/features
3. Search shadcn registry for relevant components
4. Optionally search Magic UI for tasteful accents (use sparingly)
5. Clear current-test/ folder
6. Generate files:
   - mock-data.ts (realistic mock data matching real structure)
   - v1.tsx through v10.tsx (10 different UI approaches)
   - versions.ts (exports all versions)
7. Tell user to visit /ui-tester
```

## File Structure

All generated files go in `src/app/ui-tester/current-test/`:

```
src/app/ui-tester/
├── page.tsx              # PERMANENT (already exists)
└── current-test/
    ├── mock-data.ts      # Generated - shared mock data
    ├── versions.ts       # Generated - exports version array
    ├── v1.tsx            # Generated - version 1
    ├── v2.tsx            # Generated - version 2
    └── ...v10.tsx
```

## Version Guidelines

Create 10 DISTINCT variations. Each version should:
- Use existing shadcn components from `@/components/ui/`
- Follow the project's blue (#237CF1) primary color theme
- Be a complete, working UI (not a skeleton)
- Use the shared mock data

## Component Discovery

### Shadcn (primary)
Search the shadcn registry for base components:
- Use `mcp__shadcn__search_items_in_registries` for component ideas
- Use `mcp__shadcn__get_item_examples_from_registries` for usage patterns
- Check existing components in `src/components/ui/`

### Magic UI (use sparingly)
For tasteful animated accents, search Magic UI:
- `getLayout` - bento-grid, dock, file-tree
- `getMotion` - blur-fade, scroll-progress, number-ticker
- `getButtons` - shimmer-button, shiny-button
- `getEffects` - animated-beam, border-beam, shine-border
- `getBackgrounds` - flickering-grid, retro-grid

**Important:** Use Magic UI animations sparingly and only when they add value:
- Good: number-ticker for stats, blur-fade for page entry, shimmer on primary CTA
- Bad: animations on everything, distracting effects, gratuitous motion

Most variations (7-8) should be clean shadcn-based designs. Only 2-3 versions should explore tasteful Magic UI enhancements.

## Iteration Support

When user gives feedback and asks for more versions:
1. Create new files (v11.tsx, v12.tsx, etc.)
2. Update versions.ts to include new imports and exports
3. Can also edit existing version files based on specific feedback

## Applying Final Version

When user picks a final version:
1. Copy the chosen version's code to the real route's client component
2. Adapt imports:
   - Remove mock-data imports
   - Add real data as props
   - Update any hardcoded values
3. Delete all files in `current-test/` folder

## Pre-Generation Checklist

Before generating versions, verify:
- [ ] Found and read the source page files
- [ ] Understood the data structure and props
- [ ] Cleared current-test/ folder
- [ ] Searched shadcn for relevant components

## Post-Generation Checklist

After generating all files:
- [ ] Created mock-data.ts with realistic data
- [ ] Created 10 version files (v1.tsx - v10.tsx)
- [ ] Created versions.ts exporting all versions
- [ ] Each version uses the shared mock data
- [ ] Each version is a distinct UI approach
- [ ] Told user to visit http://localhost:3001/ui-tester
