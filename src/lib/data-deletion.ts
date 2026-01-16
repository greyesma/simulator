import { db } from "@/server/db";
import { supabaseAdmin } from "./supabase";
import { STORAGE_BUCKETS } from "./storage";

/**
 * Result of a data deletion operation
 */
export interface DeletionResult {
  success: boolean;
  deletedItems: {
    assessments: number;
    conversations: number;
    recordings: number;
    recordingSegments: number;
    hrAssessments: number;
    storageFiles: number;
  };
  errors: string[];
}

/**
 * Extract storage path from a full Supabase URL or return the path as-is
 */
function extractStoragePath(urlOrPath: string): string {
  // If it's a full URL, extract the path after the bucket name
  if (urlOrPath.startsWith("http")) {
    try {
      const url = new URL(urlOrPath);
      // Supabase URLs look like: .../storage/v1/object/public/bucket-name/path
      const pathParts = url.pathname.split("/");
      const bucketIndex = pathParts.findIndex(
        (p) =>
          p === STORAGE_BUCKETS.RESUMES ||
          p === STORAGE_BUCKETS.RECORDINGS ||
          p === STORAGE_BUCKETS.SCREENSHOTS
      );
      if (bucketIndex !== -1) {
        return pathParts.slice(bucketIndex + 1).join("/");
      }
    } catch {
      // If URL parsing fails, return as-is
    }
  }
  return urlOrPath;
}

/**
 * Delete files from Supabase storage
 * @param bucket - The storage bucket name
 * @param paths - Array of file paths to delete
 * @returns Number of successfully deleted files
 */
async function deleteStorageFiles(
  bucket: string,
  paths: string[]
): Promise<{ deleted: number; errors: string[] }> {
  if (paths.length === 0) {
    return { deleted: 0, errors: [] };
  }

  const errors: string[] = [];
  let deleted = 0;

  // Supabase storage remove accepts an array of paths
  const cleanPaths = paths.map(extractStoragePath).filter(Boolean);

  if (cleanPaths.length === 0) {
    return { deleted: 0, errors: [] };
  }

  const { error } = await supabaseAdmin.storage.from(bucket).remove(cleanPaths);

  if (error) {
    errors.push(`Failed to delete files from ${bucket}: ${error.message}`);
  } else {
    deleted = cleanPaths.length;
  }

  return { deleted, errors };
}

/**
 * Collect all storage file paths associated with a user's assessments
 */
async function collectUserStorageFiles(userId: string): Promise<{
  resumePaths: string[];
  recordingPaths: string[];
  screenshotPaths: string[];
}> {
  const assessments = await db.assessment.findMany({
    where: { userId },
    select: {
      cvUrl: true,
      recordings: {
        select: {
          storageUrl: true,
          segments: {
            select: {
              chunkPaths: true,
              screenshotPaths: true,
            },
          },
        },
      },
    },
  });

  const resumePaths: string[] = [];
  const recordingPaths: string[] = [];
  const screenshotPaths: string[] = [];

  for (const assessment of assessments) {
    // Collect CV URLs
    if (assessment.cvUrl) {
      resumePaths.push(assessment.cvUrl);
    }

    // Collect recording storage URLs and segment paths
    for (const recording of assessment.recordings) {
      if (recording.storageUrl) {
        recordingPaths.push(recording.storageUrl);
      }

      for (const segment of recording.segments) {
        recordingPaths.push(...segment.chunkPaths);
        screenshotPaths.push(...segment.screenshotPaths);
      }
    }
  }

  return { resumePaths, recordingPaths, screenshotPaths };
}

/**
 * Delete all user data (soft delete user, hard delete associated data)
 *
 * This implements a "soft delete" pattern:
 * - User record is marked with deletedAt timestamp (preserves ID for audit)
 * - All associated data is hard deleted (assessments, recordings, files)
 *
 * @param userId - The user ID to delete data for
 * @returns DeletionResult with counts of deleted items
 */
export async function deleteUserData(userId: string): Promise<DeletionResult> {
  const result: DeletionResult = {
    success: false,
    deletedItems: {
      assessments: 0,
      conversations: 0,
      recordings: 0,
      recordingSegments: 0,
      hrAssessments: 0,
      storageFiles: 0,
    },
    errors: [],
  };

  try {
    // Step 1: Collect all storage file paths before deleting database records
    const { resumePaths, recordingPaths, screenshotPaths } =
      await collectUserStorageFiles(userId);

    // Step 2: Delete storage files from Supabase
    const resumeResult = await deleteStorageFiles(
      STORAGE_BUCKETS.RESUMES,
      resumePaths
    );
    result.deletedItems.storageFiles += resumeResult.deleted;
    result.errors.push(...resumeResult.errors);

    const recordingResult = await deleteStorageFiles(
      STORAGE_BUCKETS.RECORDINGS,
      recordingPaths
    );
    result.deletedItems.storageFiles += recordingResult.deleted;
    result.errors.push(...recordingResult.errors);

    const screenshotResult = await deleteStorageFiles(
      STORAGE_BUCKETS.SCREENSHOTS,
      screenshotPaths
    );
    result.deletedItems.storageFiles += screenshotResult.deleted;
    result.errors.push(...screenshotResult.errors);

    // Step 3: Delete database records using Prisma transactions
    // Due to cascade deletes, deleting assessments will also delete:
    // - Conversations (onDelete: Cascade)
    // - Recordings (onDelete: Cascade) -> RecordingSegments (onDelete: Cascade)
    // - HRInterviewAssessment (onDelete: Cascade)

    // First, get counts for reporting
    const assessmentCount = await db.assessment.count({
      where: { userId },
    });

    const conversationCount = await db.conversation.count({
      where: { assessment: { userId } },
    });

    const recordingCount = await db.recording.count({
      where: { assessment: { userId } },
    });

    const segmentCount = await db.recordingSegment.count({
      where: { recording: { assessment: { userId } } },
    });

    const hrAssessmentCount = await db.hRInterviewAssessment.count({
      where: { assessment: { userId } },
    });

    // Delete all assessments (cascades to related records)
    await db.assessment.deleteMany({
      where: { userId },
    });

    result.deletedItems.assessments = assessmentCount;
    result.deletedItems.conversations = conversationCount;
    result.deletedItems.recordings = recordingCount;
    result.deletedItems.recordingSegments = segmentCount;
    result.deletedItems.hrAssessments = hrAssessmentCount;

    // Step 4: Soft delete the user (set deletedAt, clear personal data)
    await db.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        // Clear personal data while keeping the record for audit trail
        name: null,
        email: null,
        image: null,
        password: null,
        emailVerified: null,
      },
    });

    result.success = true;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error during deletion";
    result.errors.push(message);
    console.error("Error deleting user data:", error);
  }

  return result;
}

/**
 * Check if a deletion request has passed the grace period
 * Default grace period is 30 days
 *
 * @param requestedAt - When the deletion was requested
 * @param gracePeriodDays - Grace period in days (default: 30)
 * @returns true if grace period has passed
 */
export function hasGracePeriodPassed(
  requestedAt: Date,
  gracePeriodDays = 30
): boolean {
  const gracePeriodMs = gracePeriodDays * 24 * 60 * 60 * 1000;
  const now = new Date();
  return now.getTime() - requestedAt.getTime() >= gracePeriodMs;
}

/**
 * Process immediate data deletion (no grace period wait)
 * This is used when a user confirms they want immediate deletion
 *
 * @param userId - The user ID to delete
 * @returns DeletionResult
 */
export async function processImmediateDeletion(
  userId: string
): Promise<DeletionResult> {
  return deleteUserData(userId);
}
