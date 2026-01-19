// Candidate utilities - archetype-weights, candidate-search, cv-parser, embeddings, entity-extraction, feedback-parsing, seniority-thresholds

// archetype-weights exports (DimensionScoreInput defined here - canonical source)
export * from "./archetype-weights";

// candidate-search exports
export * from "./candidate-search";

// cv-parser exports - note: SeniorityLevel is also available from @/types
// We exclude the re-exports from @/types to avoid conflicts with seniority-thresholds
export {
  workExperienceSchema,
  educationSchema,
  skillSchema,
  certificationSchema,
  languageSchema,
  parsedProfileSchema,
  type WorkExperience,
  type Education,
  type Skill,
  type Certification,
  type Language,
  type ParsedProfile,
  formatProfileForPrompt,
  profileToPrismaJson,
  profileFromPrismaJson,
  fetchCvContent,
  parseCv,
} from "./cv-parser";

// embeddings exports
export * from "./embeddings";

// entity-extraction exports
export * from "./entity-extraction";

// feedback-parsing exports
export * from "./feedback-parsing";

// seniority-thresholds exports (SeniorityLevel defined here - uppercase variant for filtering)
// Note: This SeniorityLevel ("JUNIOR" | "MID" | "SENIOR") is different from @/types SeniorityLevel
// which uses lowercase and has more levels. Consumers should be aware of which variant they need.
// We exclude DimensionScoreInput since archetype-weights already exports it
export {
  type SeniorityLevel,
  type ArchetypeKeyDimensions,
  type ThresholdCheckResult,
  type FilterResult,
  SENIORITY_THRESHOLDS,
  ARCHETYPE_KEY_DIMENSIONS,
  getKeyDimensionsForArchetype,
  meetsThreshold,
  filterCandidatesBySeniority,
  getSeniorityDisplayName,
  getAllSeniorityLevels,
  verifyKeyDimensionsAlignment,
} from "./seniority-thresholds";
