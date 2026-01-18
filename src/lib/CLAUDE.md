# src/lib - Utilities

56 files organized by domain: AI/Gemini, External Services, Recording, ML/Search.

## Gemini Gotchas

- Transcription MUST be enabled server-side in ephemeral token config (see `gemini.ts:45`)
- Use `Modality.AUDIO` import, not string "AUDIO"
- For text chat, `systemInstruction` not supported - use first message pair instead
- Models: `gemini-3-flash-preview` (text), `gemini-2.5-flash-native-audio-latest` (voice)

## Prisma JSON

Always double-cast: `data as unknown as Type` (read) and `as unknown as Prisma.InputJsonValue` (write).

## pgvector

Must use raw SQL (`$executeRaw`, `$queryRaw`) - Prisma ORM doesn't support vector ops.

## Testing

- Define mocks INSIDE `vi.mock()` factory (Vitest hoisting)
- MediaRecorder doesn't exist in Node.js - mock it
- jsdom File/Blob `arrayBuffer()` hangs with large files
