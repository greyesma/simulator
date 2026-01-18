import { requireAdmin } from "@/lib/admin";
import { db } from "@/server/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ScenarioDetailClient } from "./client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ScenarioDetailPage({ params }: PageProps) {
  // Ensure only admins can access
  await requireAdmin();

  const { id } = await params;

  // Fetch the scenario with coworkers
  const scenario = await db.scenario.findUnique({
    where: { id },
    include: {
      coworkers: {
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: { assessments: true },
      },
    },
  });

  if (!scenario) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link
          href="/admin/scenarios"
          className="font-mono text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to Scenarios
        </Link>
      </nav>

      {/* Header */}
      <header className="mb-8 flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-3xl font-bold">{scenario.name}</h1>
            <span
              className={`border px-2 py-0.5 font-mono text-xs ${
                scenario.isPublished
                  ? "border-green-600 bg-green-50 text-green-700"
                  : "border-muted-foreground text-muted-foreground"
              }`}
            >
              {scenario.isPublished ? "Published" : "Draft"}
            </span>
          </div>
          <p className="mb-1 text-lg text-muted-foreground">
            {scenario.companyName}
          </p>
          <p className="font-mono text-sm text-muted-foreground">
            {scenario._count.assessments} assessments | Created{" "}
            {new Date(scenario.createdAt).toLocaleDateString()}
          </p>
        </div>
      </header>

      {/* Client component for interactive features */}
      <ScenarioDetailClient scenario={scenario} />
    </div>
  );
}
