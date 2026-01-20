// Candidate utilities - archetype-weights, candidate-search, cv-parser, embeddings, entity-extraction, feedback-parsing, seniority-thresholds

// archetype-weights exports (DimensionScoreInput defined here - canonical source)
export * from "./archetype-weights";

// candidate-search exports
export * from "./candidate-search";

// cv-parser exports
// Note: SeniorityLevel re-exported here is FilterSeniorityLevel from @/types
// For the full SeniorityLevel with all levels, import directly from @/types
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

// seniority-thresholds exports
// SeniorityLevel here is FilterSeniorityLevel ("JUNIOR" | "MID" | "SENIOR") from @/types
// Used for candidate filtering thresholds
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
