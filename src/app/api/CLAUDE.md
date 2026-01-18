# src/app/api - API Routes

38 routes across 16 endpoints following Next.js 15 app router.

## Rules

- ONLY export HTTP methods - move constants/helpers to `src/lib/`
- Params are async: `const { id } = await params`
- Ephemeral token routes must enable transcription server-side (see `src/lib/gemini.ts`)

## Route Groups

- **Assessment flow:** interview/, kickoff/, call/, chat/, defense/, assessment/
- **Admin:** admin/\* (protected by `requireAdmin()`)

## Gotchas

- GitHub API can't DELETE PRs - use PATCH with `state: "closed"`
- Test redirects/notFound by mocking next/navigation and expecting throws
