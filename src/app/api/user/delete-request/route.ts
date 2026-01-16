import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";

/**
 * POST /api/user/delete-request
 * Request deletion of user data (GDPR compliance)
 */
export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if deletion was already requested
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        dataDeleteRequestedAt: true,
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

    if (user.dataDeleteRequestedAt) {
      return NextResponse.json({
        success: true,
        message: "Data deletion request already submitted",
        requestedAt: user.dataDeleteRequestedAt,
        status: "pending",
      });
    }

    // Record the deletion request
    const updated = await db.user.update({
      where: { id: session.user.id },
      data: { dataDeleteRequestedAt: new Date() },
    });

    // In a production system, this would:
    // 1. Queue an async job to process the deletion
    // 2. Send a confirmation email
    // 3. Delete data after a grace period (e.g., 30 days)

    return NextResponse.json({
      success: true,
      message:
        "Data deletion request submitted. Your data will be deleted within 30 days.",
      requestedAt: updated.dataDeleteRequestedAt,
      status: "pending",
    });
  } catch (error) {
    console.error("Error processing deletion request:", error);
    return NextResponse.json(
      { error: "Failed to process deletion request" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/delete-request
 * Check status of data deletion request
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        dataDeleteRequestedAt: true,
        deletedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.deletedAt) {
      return NextResponse.json({
        status: "deleted",
        deletedAt: user.deletedAt,
      });
    }

    if (user.dataDeleteRequestedAt) {
      return NextResponse.json({
        status: "pending",
        requestedAt: user.dataDeleteRequestedAt,
      });
    }

    return NextResponse.json({
      status: "none",
      message: "No deletion request on file",
    });
  } catch (error) {
    console.error("Error checking deletion status:", error);
    return NextResponse.json(
      { error: "Failed to check deletion status" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/delete-request
 * Cancel a pending data deletion request
 */
export async function DELETE() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        dataDeleteRequestedAt: true,
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

    if (!user.dataDeleteRequestedAt) {
      return NextResponse.json(
        { error: "No deletion request to cancel" },
        { status: 400 }
      );
    }

    // Cancel the deletion request
    await db.user.update({
      where: { id: session.user.id },
      data: { dataDeleteRequestedAt: null },
    });

    return NextResponse.json({
      success: true,
      message: "Data deletion request cancelled",
    });
  } catch (error) {
    console.error("Error cancelling deletion request:", error);
    return NextResponse.json(
      { error: "Failed to cancel deletion request" },
      { status: 500 }
    );
  }
}
