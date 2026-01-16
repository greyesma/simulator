import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { processImmediateDeletion } from "@/lib/data-deletion";

/**
 * POST /api/user/delete
 * Execute immediate account deletion
 *
 * Requires confirmation in request body:
 * { "confirm": "DELETE MY ACCOUNT" }
 *
 * This performs:
 * - Soft delete of user record (marks deletedAt, clears personal data)
 * - Hard delete of all assessments, recordings, conversations
 * - Deletion of files from Supabase storage (CVs, recordings, screenshots)
 */
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Parse and validate confirmation
    const body = await request.json();
    const { confirm } = body;

    if (confirm !== "DELETE MY ACCOUNT") {
      return NextResponse.json(
        {
          error: "Confirmation required",
          message:
            'Please confirm deletion by sending { "confirm": "DELETE MY ACCOUNT" }',
        },
        { status: 400 }
      );
    }

    // Check user exists and isn't already deleted
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        deletedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.deletedAt) {
      return NextResponse.json(
        { error: "Account has already been deleted" },
        { status: 400 }
      );
    }

    // Execute deletion
    const result = await processImmediateDeletion(session.user.id);

    if (!result.success) {
      console.error("Deletion errors:", result.errors);
      return NextResponse.json(
        {
          error: "Deletion partially failed",
          message: "Some data may not have been deleted. Please contact support.",
          details: result.errors,
          deletedItems: result.deletedItems,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your account and all associated data have been deleted.",
      deletedItems: result.deletedItems,
    });
  } catch (error) {
    console.error("Error executing deletion:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
