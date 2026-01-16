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
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Analytics Dashboard */}
      <section className="mb-12">
        <AnalyticsDashboard initialData={analyticsData} />
      </section>

      {/* Quick Actions */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/scenarios/new"
            className="bg-foreground text-background px-6 py-3 font-semibold border-2 border-foreground hover:bg-secondary hover:text-secondary-foreground hover:border-secondary"
          >
            Create Scenario
          </Link>
          <Link
            href="/admin/scenarios"
            className="bg-background text-foreground px-6 py-3 font-semibold border-2 border-foreground hover:bg-muted"
          >
            Manage Scenarios ({scenarioCount})
          </Link>
          <Link
            href="/admin/users"
            className="bg-background text-foreground px-6 py-3 font-semibold border-2 border-foreground hover:bg-muted"
          >
            Manage Users
          </Link>
        </div>
      </section>

      {/* Recent Assessments */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Assessments</h2>
          <Link
            href="/admin/assessments"
            className="font-mono text-sm text-foreground hover:text-secondary border-b-2 border-secondary"
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
                  <th className="text-left p-4 font-mono text-xs text-muted-foreground">
                    USER
                  </th>
                  <th className="text-left p-4 font-mono text-xs text-muted-foreground">
                    SCENARIO
                  </th>
                  <th className="text-left p-4 font-mono text-xs text-muted-foreground">
                    STATUS
                  </th>
                  <th className="text-left p-4 font-mono text-xs text-muted-foreground">
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
                        className={`font-mono text-xs px-2 py-1 ${
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
