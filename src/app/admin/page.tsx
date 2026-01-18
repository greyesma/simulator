import { db } from "@/server/db";
import Link from "next/link";
import { getAnalytics } from "@/lib/analytics";
import { AnalyticsDashboard } from "./analytics-dashboard";

export default async function AdminDashboard() {
  // Fetch analytics data with 30-day default
  const [analyticsData, scenarioCount, recentAssessments] = await Promise.all([
    getAnalytics("last30days"),
    db.scenario.count(),
    db.assessment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        scenario: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>

      {/* Analytics Dashboard */}
      <section className="mb-12">
        <AnalyticsDashboard initialData={analyticsData} />
      </section>

      {/* Quick Actions */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-bold">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/scenarios/new"
            className="border-2 border-foreground bg-foreground px-6 py-3 font-semibold text-background hover:border-secondary hover:bg-secondary hover:text-secondary-foreground"
          >
            Create Scenario
          </Link>
          <Link
            href="/admin/scenarios"
            className="border-2 border-foreground bg-background px-6 py-3 font-semibold text-foreground hover:bg-muted"
          >
            Manage Scenarios ({scenarioCount})
          </Link>
          <Link
            href="/admin/users"
            className="border-2 border-foreground bg-background px-6 py-3 font-semibold text-foreground hover:bg-muted"
          >
            Manage Users
          </Link>
        </div>
      </section>

      {/* Recent Assessments */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Recent Assessments</h2>
          <Link
            href="/admin/assessments"
            className="border-b-2 border-secondary font-mono text-sm text-foreground hover:text-secondary"
          >
            View All
          </Link>
        </div>
        <div className="border-2 border-border">
          {recentAssessments.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No assessments yet
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="p-4 text-left font-mono text-xs text-muted-foreground">
                    USER
                  </th>
                  <th className="p-4 text-left font-mono text-xs text-muted-foreground">
                    SCENARIO
                  </th>
                  <th className="p-4 text-left font-mono text-xs text-muted-foreground">
                    STATUS
                  </th>
                  <th className="p-4 text-left font-mono text-xs text-muted-foreground">
                    DATE
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentAssessments.map((assessment) => (
                  <tr key={assessment.id} className="border-b border-border">
                    <td className="p-4">
                      <p className="font-semibold">
                        {assessment.user.name || "Anonymous"}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {assessment.user.email}
                      </p>
                    </td>
                    <td className="p-4 font-mono text-sm">
                      {assessment.scenario.name}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 font-mono text-xs ${
                          assessment.status === "COMPLETED"
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {assessment.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-sm text-muted-foreground">
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(assessment.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
