/**
 * Prisma Mocks
 *
 * Provides mock implementations for Prisma Client.
 * Use these mocks when testing components that interact with the database.
 *
 * @see Issue #98: REF-008
 */

import { vi } from "vitest";

/**
 * Common Prisma model methods.
 */
export interface MockPrismaModel {
  findUnique: ReturnType<typeof vi.fn>;
  findFirst: ReturnType<typeof vi.fn>;
  findMany: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  createMany: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  updateMany: ReturnType<typeof vi.fn>;
  upsert: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  deleteMany: ReturnType<typeof vi.fn>;
  count: ReturnType<typeof vi.fn>;
  aggregate: ReturnType<typeof vi.fn>;
}

/**
 * Creates a mock Prisma model with all standard methods.
 */
function createMockPrismaModel(): MockPrismaModel {
  return {
    findUnique: vi.fn().mockResolvedValue(null),
    findFirst: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({}),
    createMany: vi.fn().mockResolvedValue({ count: 0 }),
    update: vi.fn().mockResolvedValue({}),
    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    upsert: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    count: vi.fn().mockResolvedValue(0),
    aggregate: vi.fn().mockResolvedValue({}),
  };
}

/**
 * Mock Prisma Client interface.
 */
export interface MockPrismaClientInterface {
  user: MockPrismaModel;
  assessment: MockPrismaModel;
  scenario: MockPrismaModel;
  coworker: MockPrismaModel;
  conversation: MockPrismaModel;
  recording: MockPrismaModel;
  recordingSegment: MockPrismaModel;
  segmentAnalysis: MockPrismaModel;
  videoAssessment: MockPrismaModel;
  dimensionScore: MockPrismaModel;
  videoAssessmentSummary: MockPrismaModel;
  assessmentLog: MockPrismaModel;
  assessmentApiCall: MockPrismaModel;
  videoAssessmentLog: MockPrismaModel;
  videoAssessmentApiCall: MockPrismaModel;
  candidateEmbedding: MockPrismaModel;
  account: MockPrismaModel;
  session: MockPrismaModel;
  verificationToken: MockPrismaModel;
  $connect: ReturnType<typeof vi.fn>;
  $disconnect: ReturnType<typeof vi.fn>;
  $transaction: ReturnType<typeof vi.fn>;
  $queryRaw: ReturnType<typeof vi.fn>;
  $executeRaw: ReturnType<typeof vi.fn>;
}

/**
 * Creates a mock Prisma Client with all models.
 *
 * @example
 * const prisma = createMockPrismaClient();
 * prisma.user.findUnique.mockResolvedValue({ id: "123", name: "Test" });
 */
export function createMockPrismaClient(): MockPrismaClientInterface {
  const client: MockPrismaClientInterface = {
    user: createMockPrismaModel(),
    assessment: createMockPrismaModel(),
    scenario: createMockPrismaModel(),
    coworker: createMockPrismaModel(),
    conversation: createMockPrismaModel(),
    recording: createMockPrismaModel(),
    recordingSegment: createMockPrismaModel(),
    segmentAnalysis: createMockPrismaModel(),
    videoAssessment: createMockPrismaModel(),
    dimensionScore: createMockPrismaModel(),
    videoAssessmentSummary: createMockPrismaModel(),
    assessmentLog: createMockPrismaModel(),
    assessmentApiCall: createMockPrismaModel(),
    videoAssessmentLog: createMockPrismaModel(),
    videoAssessmentApiCall: createMockPrismaModel(),
    candidateEmbedding: createMockPrismaModel(),
    account: createMockPrismaModel(),
    session: createMockPrismaModel(),
    verificationToken: createMockPrismaModel(),
    $connect: vi.fn().mockResolvedValue(undefined),
    $disconnect: vi.fn().mockResolvedValue(undefined),
    $transaction: vi.fn().mockImplementation(async (callback) => {
      if (typeof callback === "function") {
        return callback(client);
      }
      return Promise.all(callback);
    }),
    $queryRaw: vi.fn().mockResolvedValue([]),
    $executeRaw: vi.fn().mockResolvedValue(0),
  };

  return client;
}

/**
 * Full-featured mock Prisma Client class for advanced testing scenarios.
 *
 * @example
 * const prisma = new MockPrismaClient();
 * prisma.user.findUnique.mockResolvedValue({ id: "123", name: "Test" });
 * const user = await prisma.user.findUnique({ where: { id: "123" } });
 */
export class MockPrismaClient implements MockPrismaClientInterface {
  public user: MockPrismaModel;
  public assessment: MockPrismaModel;
  public scenario: MockPrismaModel;
  public coworker: MockPrismaModel;
  public conversation: MockPrismaModel;
  public recording: MockPrismaModel;
  public recordingSegment: MockPrismaModel;
  public segmentAnalysis: MockPrismaModel;
  public videoAssessment: MockPrismaModel;
  public dimensionScore: MockPrismaModel;
  public videoAssessmentSummary: MockPrismaModel;
  public assessmentLog: MockPrismaModel;
  public assessmentApiCall: MockPrismaModel;
  public videoAssessmentLog: MockPrismaModel;
  public videoAssessmentApiCall: MockPrismaModel;
  public candidateEmbedding: MockPrismaModel;
  public account: MockPrismaModel;
  public session: MockPrismaModel;
  public verificationToken: MockPrismaModel;
  public $connect: ReturnType<typeof vi.fn>;
  public $disconnect: ReturnType<typeof vi.fn>;
  public $transaction: ReturnType<typeof vi.fn>;
  public $queryRaw: ReturnType<typeof vi.fn>;
  public $executeRaw: ReturnType<typeof vi.fn>;

  constructor() {
    this.user = createMockPrismaModel();
    this.assessment = createMockPrismaModel();
    this.scenario = createMockPrismaModel();
    this.coworker = createMockPrismaModel();
    this.conversation = createMockPrismaModel();
    this.recording = createMockPrismaModel();
    this.recordingSegment = createMockPrismaModel();
    this.segmentAnalysis = createMockPrismaModel();
    this.videoAssessment = createMockPrismaModel();
    this.dimensionScore = createMockPrismaModel();
    this.videoAssessmentSummary = createMockPrismaModel();
    this.assessmentLog = createMockPrismaModel();
    this.assessmentApiCall = createMockPrismaModel();
    this.videoAssessmentLog = createMockPrismaModel();
    this.videoAssessmentApiCall = createMockPrismaModel();
    this.candidateEmbedding = createMockPrismaModel();
    this.account = createMockPrismaModel();
    this.session = createMockPrismaModel();
    this.verificationToken = createMockPrismaModel();
    this.$connect = vi.fn().mockResolvedValue(undefined);
    this.$disconnect = vi.fn().mockResolvedValue(undefined);
    this.$transaction = vi.fn().mockImplementation(async (callback) => {
      if (typeof callback === "function") {
        return callback(this);
      }
      return Promise.all(callback);
    });
    this.$queryRaw = vi.fn().mockResolvedValue([]);
    this.$executeRaw = vi.fn().mockResolvedValue(0);
  }

  /**
   * Resets all model mocks.
   */
  reset(): void {
    const models = [
      this.user,
      this.assessment,
      this.scenario,
      this.coworker,
      this.conversation,
      this.recording,
      this.recordingSegment,
      this.segmentAnalysis,
      this.videoAssessment,
      this.dimensionScore,
      this.videoAssessmentSummary,
      this.assessmentLog,
      this.assessmentApiCall,
      this.videoAssessmentLog,
      this.videoAssessmentApiCall,
      this.candidateEmbedding,
      this.account,
      this.session,
      this.verificationToken,
    ];

    for (const model of models) {
      Object.values(model).forEach((method) => {
        if (typeof method === "function" && "mockClear" in method) {
          method.mockClear();
        }
      });
    }

    this.$connect.mockClear();
    this.$disconnect.mockClear();
    this.$transaction.mockClear();
    this.$queryRaw.mockClear();
    this.$executeRaw.mockClear();
  }
}
