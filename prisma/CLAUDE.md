# prisma - Database Schema

Supabase Postgres with Prisma ORM. pgvector for semantic search.

## JSON Fields

Double-cast always: `as unknown as Type` (read), `as unknown as Prisma.InputJsonValue` (write).
For null: use `Prisma.JsonNull` (value import, not type).

## pgvector

Schema: `Unsupported("vector(768)")`. Must use raw SQL for all vector operations.

## Patterns

- Use `upsert` for idempotent operations
- Cascade deletes handle related records automatically
- Clear `.next/` cache after schema changes

## 8 Assessment Dimensions

COMMUNICATION, PROBLEM_SOLVING, TECHNICAL_KNOWLEDGE, COLLABORATION, ADAPTABILITY, LEADERSHIP, CREATIVITY, TIME_MANAGEMENT
