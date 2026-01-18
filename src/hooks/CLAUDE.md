# src/hooks - Voice & Recording Hooks

5 hooks: use-voice-conversation, use-coworker-voice, use-defense-call, use-manager-kickoff, use-screen-recording.

## Voice Patterns

- AudioContext requires user interaction to resume from suspended state
- Use `sessionConnected` flag in callbacks - refs can be stale in closures
- Track MediaStream "ended" event to detect when user stops sharing
- Audio: 16kHz input (to Gemini), 24kHz output (from Gemini)

## Cleanup

Always stop MediaStream tracks and close WebSocket connections in useEffect cleanup.
