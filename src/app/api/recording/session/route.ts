import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { supabaseAdmin } from "@/lib/external";
import { STORAGE_BUCKETS } from "@/lib/external";
import {
  analyzeSegmentScreenshots,
  buildSegmentAnalysisData,
} from "@/lib/analysis";
import { isE2ETestMode } from "@/lib/core";

/**
 * Trigger incremental analysis for a completed segment
 * Runs asynchronously to not block the response
 */
async function triggerIncrementalAnalysis(
  segmentId: string,
  screenshotPaths: string[],
  startTime: Date,
  endTime: Date
): Promise<void> {
  try {
    if (screenshotPaths.length === 0) {
      console.log(`Segment ${segmentId}: No screenshots to analyze`);
      return;
    }

    // Generate signed URLs for screenshots
    const screenshotUrls = await Promise.all(
      screenshotPaths.map(async (path) => {
        const { data } = await supabaseAdmin.storage
          .from(STORAGE_BUCKETS.SCREENSHOTS)
          .createSignedUrl(path, 60 * 60); // 1 hour expiry
        return data?.signedUrl || null;
      })
    );

    const validUrls = screenshotUrls.filter(
      (url): url is string => url !== null
    );

    if (validUrls.length === 0) {
      console.warn(`Segment ${segmentId}: No valid screenshot URLs`);
      return;
    }

    // Calculate duration
    const durationSeconds = Math.round(
      (endTime.getTime() - startTime.getTime()) / 1000
    );

    // Analyze screenshots
    const analysis = await analyzeSegmentScreenshots(
      validUrls,
      startTime,
      durationSeconds
    );

    // Save to database
    const analysisData = buildSegmentAnalysisData(
      segmentId,
      analysis,
      validUrls.length
    );

    await db.segmentAnalysis.upsert({
      where: { segmentId },
      create: analysisData,
      update: {
        ...analysisData,
        updatedAt: new Date(),
      },
    });

    console.log(
      `Segment ${segmentId}: Analysis complete (${validUrls.length} screenshots)`
    );
  } catch (error) {
    console.error(`Failed to analyze segment ${segmentId}:`, error);
    // Don't throw - this is a background task
  }
}

// POST /api/recording/session - Start or update a recording segment
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assessmentId, action, segmentId, chunkPath, screenshotPath, testMode } = body;

    if (!assessmentId || !action) {
      return NextResponse.json(
        { error: "Missing required fields: assessmentId, action" },
        { status: 400 }
      );
    }

    // Reject testMode requests if not in development mode (double-gate safety)
    if (testMode && !isE2ETestMode()) {
      return NextResponse.json(
        { error: "Test mode is only available in development environment" },
        { status: 403 }
      );
    }

    // Verify the assessment belongs to the user
    const assessment = await db.assessment.findFirst({
      where: {
        id: assessmentId,
        userId: session.user.id,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const recordingId = `${assessmentId}-screen`;

    // Ensure recording exists
    await db.recording.upsert({
      where: { id: recordingId },
      create: {
        id: recordingId,
        assessmentId,
        type: "screen",
        storageUrl: "",
        startTime: new Date(),
      },
      update: {},
    });

    switch (action) {
      case "start": {
        // Wrap all segment operations in a transaction for atomicity
        // This ensures segment indices are always sequential with no gaps
        // and prevents race conditions between concurrent requests
        const segmentResult = await db.$transaction(async (tx) => {
          // Mark any existing "recording" segments as interrupted
          await tx.recordingSegment.updateMany({
            where: {
              recordingId,
              status: "recording",
            },
            data: {
              status: "interrupted",
              endTime: new Date(),
            },
          });

          // Get the next segment index
          const lastSegment = await tx.recordingSegment.findFirst({
            where: { recordingId },
            orderBy: { segmentIndex: "desc" },
          });
          const nextIndex = (lastSegment?.segmentIndex ?? -1) + 1;

          // In test mode, create a completed segment with empty paths
          // This allows downstream code that expects segments to work
          if (testMode) {
            const testSegment = await tx.recordingSegment.create({
              data: {
                recordingId,
                segmentIndex: nextIndex,
                startTime: new Date(),
                endTime: new Date(),
                status: "completed",
                chunkPaths: [],
                screenshotPaths: [],
              },
            });

            return {
              success: true,
              segmentId: testSegment.id,
              segmentIndex: testSegment.segmentIndex,
              testMode: true,
            };
          }

          // Create a new segment
          const newSegment = await tx.recordingSegment.create({
            data: {
              recordingId,
              segmentIndex: nextIndex,
              startTime: new Date(),
              status: "recording",
              chunkPaths: [],
              screenshotPaths: [],
            },
          });

          return {
            success: true,
            segmentId: newSegment.id,
            segmentIndex: newSegment.segmentIndex,
          };
        });

        return NextResponse.json(segmentResult);
      }

      case "addChunk": {
        if (!segmentId || !chunkPath) {
          return NextResponse.json(
            { error: "segmentId and chunkPath required for addChunk" },
            { status: 400 }
          );
        }

        const segment = await db.recordingSegment.findUnique({
          where: { id: segmentId },
        });

        if (!segment) {
          return NextResponse.json(
            { error: "Segment not found" },
            { status: 404 }
          );
        }

        await db.recordingSegment.update({
          where: { id: segmentId },
          data: {
            chunkPaths: [...segment.chunkPaths, chunkPath],
          },
        });

        return NextResponse.json({ success: true });
      }

      case "addScreenshot": {
        if (!segmentId || !screenshotPath) {
          return NextResponse.json(
            {
              error: "segmentId and screenshotPath required for addScreenshot",
            },
            { status: 400 }
          );
        }

        const segment = await db.recordingSegment.findUnique({
          where: { id: segmentId },
        });

        if (!segment) {
          return NextResponse.json(
            { error: "Segment not found" },
            { status: 404 }
          );
        }

        await db.recordingSegment.update({
          where: { id: segmentId },
          data: {
            screenshotPaths: [...segment.screenshotPaths, screenshotPath],
          },
        });

        return NextResponse.json({ success: true });
      }

      case "complete": {
        if (!segmentId) {
          return NextResponse.json(
            { error: "segmentId required for complete" },
            { status: 400 }
          );
        }

        // Get segment to access screenshot paths for analysis
        const segmentToComplete = await db.recordingSegment.findUnique({
          where: { id: segmentId },
        });

        if (!segmentToComplete) {
          return NextResponse.json(
            { error: "Segment not found" },
            { status: 404 }
          );
        }

        const endTime = new Date();

        await db.recordingSegment.update({
          where: { id: segmentId },
          data: {
            status: "completed",
            endTime,
          },
        });

        // Update recording end time
        await db.recording.update({
          where: { id: recordingId },
          data: { endTime },
        });

        // Trigger incremental analysis asynchronously (don't await)
        // This allows the response to return immediately while analysis runs
        triggerIncrementalAnalysis(
          segmentId,
          segmentToComplete.screenshotPaths,
          segmentToComplete.startTime,
          endTime
        ).catch((error) => {
          console.error("Background analysis failed:", error);
        });

        return NextResponse.json({
          success: true,
          analysisTriggered: segmentToComplete.screenshotPaths.length > 0,
        });
      }

      case "interrupt": {
        if (!segmentId) {
          return NextResponse.json(
            { error: "segmentId required for interrupt" },
            { status: 400 }
          );
        }

        await db.recordingSegment.update({
          where: { id: segmentId },
          data: {
            status: "interrupted",
            endTime: new Date(),
          },
        });

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Recording session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/recording/session - Get current recording session status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get("assessmentId");

    if (!assessmentId) {
      return NextResponse.json(
        { error: "assessmentId is required" },
        { status: 400 }
      );
    }

    // Verify the assessment belongs to the user
    const assessment = await db.assessment.findFirst({
      where: {
        id: assessmentId,
        userId: session.user.id,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    const recordingId = `${assessmentId}-screen`;

    // Get the recording with all segments
    const recording = await db.recording.findUnique({
      where: { id: recordingId },
      include: {
        segments: {
          orderBy: { segmentIndex: "asc" },
        },
      },
    });

    if (!recording) {
      return NextResponse.json({
        hasRecording: false,
        activeSegment: null,
        segments: [],
        totalChunks: 0,
        totalScreenshots: 0,
      });
    }

    // Find active segment (status = "recording")
    const activeSegment = recording.segments.find(
      (s) => s.status === "recording"
    );

    // Calculate totals
    const totalChunks = recording.segments.reduce(
      (acc, s) => acc + s.chunkPaths.length,
      0
    );
    const totalScreenshots = recording.segments.reduce(
      (acc, s) => acc + s.screenshotPaths.length,
      0
    );

    return NextResponse.json({
      hasRecording: true,
      recordingId: recording.id,
      startTime: recording.startTime,
      endTime: recording.endTime,
      activeSegment: activeSegment
        ? {
            id: activeSegment.id,
            segmentIndex: activeSegment.segmentIndex,
            startTime: activeSegment.startTime,
            chunkCount: activeSegment.chunkPaths.length,
            screenshotCount: activeSegment.screenshotPaths.length,
          }
        : null,
      segments: recording.segments.map((s) => ({
        id: s.id,
        segmentIndex: s.segmentIndex,
        status: s.status,
        startTime: s.startTime,
        endTime: s.endTime,
        chunkCount: s.chunkPaths.length,
        screenshotCount: s.screenshotPaths.length,
      })),
      totalChunks,
      totalScreenshots,
    });
  } catch (error) {
    console.error("Recording session fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
