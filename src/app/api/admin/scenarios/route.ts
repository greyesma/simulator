import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/server/db";

interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string;
}

/**
 * GET /api/admin/scenarios
 * List all scenarios (admin only)
 */
export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as SessionUser;
  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  const scenarios = await db.scenario.findMany({
    include: {
      _count: {
        select: { coworkers: true, assessments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ scenarios });
}

/**
 * POST /api/admin/scenarios
 * Create a new scenario (admin only)
 */
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as SessionUser;
  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const {
    name,
    companyName,
    companyDescription,
    taskDescription,
    repoUrl,
    techStack,
    isPublished,
  } = body;

  // Validate required fields
  if (
    !name ||
    !companyName ||
    !companyDescription ||
    !taskDescription ||
    !repoUrl
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Validate techStack is an array
  if (techStack !== undefined && !Array.isArray(techStack)) {
    return NextResponse.json(
      { error: "techStack must be an array" },
      { status: 400 }
    );
  }

  const scenario = await db.scenario.create({
    data: {
      name,
      companyName,
      companyDescription,
      taskDescription,
      repoUrl,
      techStack: techStack || [],
      isPublished: isPublished ?? false,
    },
  });

  return NextResponse.json({ scenario }, { status: 201 });
}
