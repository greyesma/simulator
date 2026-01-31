-- RF-002: Database schema changes for recruiter-focused flow
-- This migration:
-- 1. Adds RECRUITER role to UserRole enum
-- 2. Simplifies AssessmentStatus to WELCOME, WORKING, COMPLETED
-- 3. Adds createdById to Scenario for recruiter ownership
-- 4. Removes CV fields from User and Assessment
-- 5. Removes HRInterviewAssessment model
--
-- NOTE: This migration has been applied manually via prisma db execute.
-- The migration was marked as applied using: npx prisma migrate resolve --applied

-- Step 1: Add RECRUITER to UserRole enum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'RECRUITER';

-- Step 2: Map old AssessmentStatus values to new ones before changing the enum
-- HR_INTERVIEW, ONBOARDING -> WELCOME (mapped to WORKING in actual execution)
-- WORKING -> WORKING
-- FINAL_DEFENSE, PROCESSING, COMPLETED -> COMPLETED

-- Create new enum type
CREATE TYPE "AssessmentStatus_new" AS ENUM ('WELCOME', 'WORKING', 'COMPLETED');

-- Update the Assessment table: map old values to new
UPDATE "Assessment" SET status = 'WORKING' WHERE status IN ('HR_INTERVIEW', 'ONBOARDING');
UPDATE "Assessment" SET status = 'COMPLETED' WHERE status IN ('FINAL_DEFENSE', 'PROCESSING');
-- WORKING stays as WORKING, COMPLETED stays as COMPLETED (no action needed for these)

-- Alter the column to use the new enum type
ALTER TABLE "Assessment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Assessment"
  ALTER COLUMN "status" TYPE "AssessmentStatus_new"
  USING "status"::text::"AssessmentStatus_new";
ALTER TABLE "Assessment" ALTER COLUMN "status" SET DEFAULT 'WELCOME';

-- Drop old enum and rename new
DROP TYPE "AssessmentStatus";
ALTER TYPE "AssessmentStatus_new" RENAME TO "AssessmentStatus";

-- Step 3: Add createdById to Scenario
ALTER TABLE "Scenario" ADD COLUMN IF NOT EXISTS "createdById" TEXT;
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 4: Remove CV fields from User
ALTER TABLE "User" DROP COLUMN IF EXISTS "cvUrl";
ALTER TABLE "User" DROP COLUMN IF EXISTS "parsedProfile";

-- Step 5: Remove CV fields from Assessment
ALTER TABLE "Assessment" DROP COLUMN IF EXISTS "cvUrl";
ALTER TABLE "Assessment" DROP COLUMN IF EXISTS "parsedProfile";

-- Step 6: Remove HRInterviewAssessment table
DROP TABLE IF EXISTS "HRInterviewAssessment";
