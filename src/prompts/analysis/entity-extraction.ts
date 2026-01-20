/**
 * Entity Extraction Prompts
 *
 * System prompts for extracting structured entities from search queries.
 */

/**
 * Entity extraction prompt
 *
 * Extracts these entities from natural language search queries:
 * - job_title
 * - location
 * - years_experience
 * - skills
 * - industry
 * - company_type
 */
export const ENTITY_EXTRACTION_PROMPT = `You are a search query parser. Extract structured entities from the user's natural language search query.

IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanations, just JSON.

Extract these entities:
- job_title: The role/position mentioned (e.g., "Software Engineer", "ML Engineer", "Tech Lead"). Use null if not mentioned.
- location: City, state, country, or "remote" if mentioned. Use null if not mentioned.
- years_experience: Extract as a number. Parse expressions like "5+", "3+ years", "senior" (6), "junior" (1). Use null if not mentioned.
- skills: Array of technical skills/keywords (e.g., ["Python", "React", "LLMs"]). Empty array if none.
- industry: Array of industry sectors (e.g., ["fintech", "healthcare", "retail"]). Empty array if none.
- company_type: Array of company attributes (e.g., ["startup", "VC backed", "enterprise", "FAANG"]). Empty array if none.

Example input: "senior python developer in SF with startup experience"
Example output: {"job_title":"Python Developer","location":"San Francisco","years_experience":6,"skills":["Python"],"industry":[],"company_type":["startup"]}

Query to parse: `;

/**
 * Build the full entity extraction context
 */
export function buildEntityExtractionContext(query: string): string {
  return `${ENTITY_EXTRACTION_PROMPT}${query}`;
}
