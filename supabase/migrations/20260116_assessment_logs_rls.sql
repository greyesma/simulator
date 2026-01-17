-- ============================================================================
-- RLS Policies for Assessment Logs Tables
-- US-016: Create Assessment Logs Database Schema
-- ============================================================================

-- Enable Row Level Security on the assessment logs tables
ALTER TABLE "AssessmentLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AssessmentApiCall" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- AssessmentLog Policies
-- Only admins can view logs
-- ============================================================================

-- Admins can view all logs
CREATE POLICY "admins_view_logs"
ON "AssessmentLog"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid()::text
    AND role = 'ADMIN'
  )
);

-- System can create logs (for API routes)
CREATE POLICY "system_create_logs"
ON "AssessmentLog"
FOR INSERT
TO service_role
WITH CHECK (true);

-- System can update logs
CREATE POLICY "system_update_logs"
ON "AssessmentLog"
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- System can delete logs
CREATE POLICY "system_delete_logs"
ON "AssessmentLog"
FOR DELETE
TO service_role
USING (true);

-- ============================================================================
-- AssessmentApiCall Policies
-- Only admins can view API call records
-- ============================================================================

-- Admins can view all API call records
CREATE POLICY "admins_view_api_calls"
ON "AssessmentApiCall"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid()::text
    AND role = 'ADMIN'
  )
);

-- System can create API call records (for API routes)
CREATE POLICY "system_create_api_calls"
ON "AssessmentApiCall"
FOR INSERT
TO service_role
WITH CHECK (true);

-- System can update API call records
CREATE POLICY "system_update_api_calls"
ON "AssessmentApiCall"
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- System can delete API call records
CREATE POLICY "system_delete_api_calls"
ON "AssessmentApiCall"
FOR DELETE
TO service_role
USING (true);
