import { requireAdmin } from "@/lib/core";
import { db } from "@/server/db";
import Link from "next/link";

export default async function ScenariosPage() {
  // Ensure only admins can access
  await requireAdmin();

  // Fetch all scenarios
  const scenarios = await db.scenario.findMany({
    include: {
      _count: {
        select: { coworkers: true, assessments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Scenarios</h1>
          <p className="text-muted-foreground">
            Manage assessment scenarios for candidates
          </p>
        </div>
        <Link
          href="/admin/scenarios/builder"
          className="hover:bg-secondary/80 border-2 border-foreground bg-secondary px-6 py-3 font-bold text-secondary-foreground"
        >
          Create with AI
        </Link>
      </header>

      {scenarios.length === 0 ? (
        <div className="border-2 border-foreground p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border-2 border-foreground bg-muted">
            <span className="text-2xl">?</span>
          </div>
          <h2 className="mb-2 text-xl font-bold">No scenarios yet</h2>
          <p className="mb-6 text-muted-foreground">
            Create your first scenario using the AI-powered builder
          </p>
          <Link
            href="/admin/scenarios/builder"
            className="inline-block border-2 border-foreground bg-foreground px-6 py-3 font-bold text-background hover:bg-secondary hover:text-secondary-foreground"
          >
            Create Scenario
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {scenarios.map((scenario) => (
            <Link
              key={scenario.id}
              href={`/admin/scenarios/${scenario.id}`}
              className="block border-2 border-foreground bg-background p-6 transition-colors hover:bg-muted"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h2 className="text-xl font-bold">{scenario.name}</h2>
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
                  <p className="mb-2 text-sm text-muted-foreground">
                    {scenario.companyName}
                  </p>
                  <p className="mb-4 line-clamp-2 text-sm">
                    {scenario.taskDescription}
                  </p>
                  <div className="flex items-center gap-4 font-mono text-sm text-muted-foreground">
                    <span>{scenario._count.coworkers} coworkers</span>
                    <span>|</span>
                    <span>{scenario._count.assessments} assessments</span>
                    <span>|</span>
                    <span>
                      Created{" "}
                      {new Date(scenario.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {scenario.techStack.length > 0 && (
                    <div className="flex flex-wrap justify-end gap-1">
                      {scenario.techStack.slice(0, 4).map((tech, i) => (
                        <span
                          key={i}
                          className="border border-foreground bg-muted px-2 py-0.5 font-mono text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                      {scenario.techStack.length > 4 && (
                        <span className="px-2 py-0.5 font-mono text-xs text-muted-foreground">
                          +{scenario.techStack.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
