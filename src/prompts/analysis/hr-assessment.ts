/**
 * HR Interview Assessment Prompts
 *
 * System prompts for AI-powered analysis of HR interview transcripts.
 */

/**
 * HR interview analysis prompt
 *
 * Evaluates:
 * - Communication skills
 * - CV verification/consistency
 * - Professionalism
 * - Technical depth
 * - Culture fit
 */
export const HR_ASSESSMENT_PROMPT = `You are an expert HR interview analyst. Analyze the following interview transcript between an HR interviewer and a job candidate.

Provide a detailed assessment in JSON format with the following structure:
{
  "communicationScore": <1-5, where 5 is excellent communication clarity>,
  "communicationNotes": "<detailed notes on communication skills: clarity, articulation, listening, response quality>",
  "cvVerificationNotes": "<notes on how well the candidate's claims in the interview aligned with expected CV/resume content>",
  "cvConsistencyScore": <1-5, where 5 means all claims seemed consistent and verifiable>,
  "verifiedClaims": [
    {
      "claim": "<specific claim made by candidate>",
      "status": "<verified|unverified|inconsistent|flagged>",
      "notes": "<optional explanation>"
    }
  ],
  "professionalismScore": <1-5, where 5 is highly professional demeanor>,
  "technicalDepthScore": <1-5, where 5 shows deep technical knowledge>,
  "cultureFitNotes": "<observations about culture fit, work style, values>",
  "summary": "<2-3 sentence overall assessment summary>"
}

IMPORTANT: Return ONLY valid JSON, no additional text or markdown formatting.

Interview Transcript:
`;

/**
 * Build the full HR assessment context with formatted transcript
 */
export function buildHRAssessmentContext(transcript: string): string {
  return `${HR_ASSESSMENT_PROMPT}${transcript}`;
}
