/**
 * Test Mocks
 *
 * Re-exports all mock utilities for convenient imports.
 *
 * @example
 * import {
 *   createMockMediaRecorder,
 *   createMockGeminiSession,
 *   createMockPrismaClient,
 * } from "@/test/mocks";
 *
 * @see Issue #98: REF-008
 */

// Media mocks
export {
  createMockMediaRecorder,
  createMockAudioContext,
  createMockMediaStream,
  createMockMediaStreamTrack,
  createMockAudioNode,
  createMockAnalyserNode,
  createMockGainNode,
  setupMediaMocks,
  teardownMediaMocks,
  type MockMediaRecorder,
  type MockAudioContext,
  type MockMediaStream,
  type MockMediaStreamTrack,
  type MockAudioNode,
  type MockAnalyserNode,
  type MockGainNode,
  type MediaMocksState,
} from "./media";

// Gemini mocks
export {
  createMockGeminiSession,
  createMockGeminiResponse,
  MockGeminiSession,
  type MockGeminiSessionInterface,
  type MockGeminiSessionOptions,
  type MockGeminiResponseOptions,
  type GeminiMessage,
  type GeminiCandidate,
  type GeminiUsageMetadata,
  type GeminiResponse,
} from "./gemini";

// Prisma mocks
export {
  createMockPrismaClient,
  MockPrismaClient,
  type MockPrismaModel,
  type MockPrismaClientInterface,
} from "./prisma";
