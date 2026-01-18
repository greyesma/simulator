# Skillvee Simulator

## What

Developer assessment platform simulating a realistic "day at work." Candidates experience HR interview → manager kickoff → coding task → PR defense, all via AI-powered conversations while screen is recorded.

**Stack:** Next.js 15, React, Supabase (Postgres + Auth + Storage), Vercel, Gemini Live (voice), Gemini Flash (text)

## Why

Assesses HOW developers work, not just WHAT they produce: communication, AI leverage, problem-solving, collaboration, code quality, time management.

## Key Directories

- `src/app/` - Pages and API routes (Next.js app router)
- `src/components/` - React components (Neo-brutalist design)
- `src/hooks/` - Voice conversation and recording hooks
- `src/lib/` - Utilities (Gemini, storage, analytics, etc.)
- `src/prompts/` - AI prompt templates by domain
- `prisma/` - Database schema
- `tests/` - E2E tests with agent-browser
- `ralph/` - Autonomous GitHub Issues runner

Each has its own CLAUDE.md with specific patterns and gotchas.

## How

**Design:** Neo-brutalist - 0px radius, no shadows, 2px black borders, gold (#f7da50). See `.claude/skills/frontend-design/SKILL.md`.

**Key docs:**
- `docs/prd.md` - PRD summary
- `ralph/progress.md` - Learnings from 83+ issues

## CLIs

`vercel` and `supabase` CLIs are installed and linked.

## Skills

- `frontend-design` - Neo-brutalist UI (auto-activates)
- `prd` - Generate PRDs
- `ralph` - Autonomous issue runner
- `react-best-practices` - Performance optimization
