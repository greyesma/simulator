-- ============================================================================
-- RLS Policies for Video Assessment Tables
-- US-002: Create Assessment Database Schema
-- ============================================================================

-- Enable Row Level Security on the video assessment tables
ALTER TABLE "VideoAssessment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DimensionScore" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VideoAssessmentSummary" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VideoAssessment Policies
-- ============================================================================

-- Candidates can view their own assessments
CREATE POLICY "candidates_view_own_assessments"
ON "VideoAssessment"
FOR SELECT
TO authenticated
USING (
  "candidateId" = auth.uid()::text
);

-- Hiring managers (admins) can view all completed assessments
CREATE POLICY "hiring_managers_view_completed_assessments"
ON "VideoAssessment"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid()::text
    AND role = 'ADMIN'
  )
  AND status = 'COMPLETED'
);

-- System can create assessments (for API routes)
CREATE POLICY "system_create_assessments"
ON "VideoAssessment"
FOR INSERT
TO service_role
WITH CHECK (true);

-- System can update assessments (for processing)
CREATE POLICY "system_update_assessments"
ON "VideoAssessment"
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- DimensionScore Policies
-- ============================================================================

-- Candidates can view scores for their own assessments
CREATE POLICY "candidates_view_own_scores"
ON "DimensionScore"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "VideoAssessment"
    WHERE id = "DimensionScore"."assessmentId"
    AND "candidateId" = auth.uid()::text
  )
);

-- Hiring managers can view scores for completed assessments
CREATE POLICY "hiring_managers_view_completed_scores"
ON "DimensionScore"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid()::text
    AND role = 'ADMIN'
  )
  AND EXISTS (
    SELECT 1 FROM "VideoAssessment"
    WHERE id = "DimensionScore"."assessmentId"
    AND status = 'COMPLETED'
  )
);

-- System can manage scores
CREATE POLICY "system_manage_scores"
ON "DimensionScore"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- VideoAssessmentSummary Policies
-- ============================================================================

-- Candidates can view summaries for their own assessments
CREATE POLICY "candidates_view_own_summaries"
ON "VideoAssessmentSummary"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "VideoAssessment"
    WHERE id = "VideoAssessmentSummary"."assessmentId"
    AND "candidateId" = auth.uid()::text
  )
);

-- Hiring managers can view summaries for completed assessments
CREATE POLICY "hiring_managers_view_completed_summaries"
ON "VideoAssessmentSummary"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid()::text
    AND role = 'ADMIN'
  )
  AND EXISTS (
    SELECT 1 FROM "VideoAssessment"
    WHERE id = "VideoAssessmentSummary"."assessmentId"
    AND status = 'COMPLETED'
  )
);

-- System can manage summaries
CREATE POLICY "system_manage_summaries"
ON "VideoAssessmentSummary"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
