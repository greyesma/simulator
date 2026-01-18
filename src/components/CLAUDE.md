# src/components - React Components

25 components following Neo-brutalist design. See `.claude/skills/frontend-design/SKILL.md` for full rules.

## Design Quick Reference

0px radius, no shadows, 2px black borders, gold (#f7da50) accent, DM Sans + Space Mono fonts.

## Server/Client Split

Server components fetch data and pass serialized (JSON-safe) props to client components. Prisma Dates need serialization.

## Gotchas

- `useSearchParams()` requires Suspense boundary
- Use `e.stopPropagation()` on nested click handlers
- `redirect()` from next/navigation throws (not returns)
