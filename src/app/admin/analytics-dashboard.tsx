"use client";

import { useEffect, useState, useCallback } from "react";
import type { AnalyticsData, TimePeriod, DailyCount } from "@/lib/analytics";

interface AnalyticsDashboardProps {
  initialData: AnalyticsData;
}

export function AnalyticsDashboard({ initialData }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData>(initialData);
  const [period, setPeriod] = useState<TimePeriod>(initialData.period);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalytics = useCallback(async (newPeriod: TimePeriod) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?period=${newPeriod}`);
      if (response.ok) {
        const newData = await response.json();
        setData(newData);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (period !== initialData.period) {
      fetchAnalytics(period);
    }
  }, [period, initialData.period, fetchAnalytics]);

  return (
    <div className={isLoading ? "opacity-60 pointer-events-none" : ""}>
      {/* Period Selector */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold">Analytics</h2>
        <div className="flex gap-2">
          {(
            [
              { value: "today", label: "Today" },
              { value: "last7days", label: "7 Days" },
              { value: "last30days", label: "30 Days" },
              { value: "last90days", label: "90 Days" },
              { value: "all", label: "All Time" },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              onClick={() => setPeriod(option.value)}
              className={`font-mono text-xs px-3 py-1 border-2 ${
                period === option.value
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-foreground border-border hover:border-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard
          label="SIGNUPS"
          value={data.overview.totalUsers}
          highlight={false}
        />
        <StatCard
          label="ASSESSMENTS"
          value={data.overview.totalAssessments}
          highlight={false}
        />
        <StatCard
          label="COMPLETED"
          value={data.overview.completedAssessments}
          highlight={true}
        />
        <StatCard
          label="COMPLETION RATE"
          value={`${data.overview.completionRate}%`}
          highlight={false}
        />
        <StatCard
          label="AVG TIME"
          value={
            data.overview.avgCompletionTimeMinutes
              ? `${data.overview.avgCompletionTimeMinutes}m`
              : "-"
          }
          highlight={false}
        />
      </div>

      {/* Trends Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <TrendChart
          title="Signups"
          data={data.trends.signups}
          color="bg-foreground"
        />
        <TrendChart
          title="Assessment Starts"
          data={data.trends.assessmentStarts}
          color="bg-foreground"
        />
        <TrendChart
          title="Completions"
          data={data.trends.assessmentCompletions}
          color="bg-secondary"
        />
      </div>

      {/* Phase Durations and Funnel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Phase Durations */}
        <div className="border-2 border-border p-6">
          <h3 className="font-mono text-xs text-muted-foreground mb-4">
            TIME PER PHASE
          </h3>
          {data.phaseDurations.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="space-y-4">
              {data.phaseDurations.map((phase) => (
                <div key={phase.phase}>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-sm">{phase.phase}</span>
                    <span className="font-mono text-sm">
                      {phase.avgDurationMinutes}m avg
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Min: {phase.minDurationMinutes}m</span>
                    <span>|</span>
                    <span>Max: {phase.maxDurationMinutes}m</span>
                    <span>|</span>
                    <span>n={phase.sampleSize}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completion Funnel */}
        <div className="border-2 border-border p-6">
          <h3 className="font-mono text-xs text-muted-foreground mb-4">
            COMPLETION FUNNEL
          </h3>
          {data.completionFunnel.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {data.completionFunnel.map((step, index) => (
                <FunnelStep
                  key={step.step}
                  step={step.step}
                  count={step.count}
                  percentage={step.percentage}
                  dropoffRate={step.dropoffRate}
                  isFirst={index === 0}
                  isLast={index === data.completionFunnel.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Distribution */}
      <div className="border-2 border-border p-6">
        <h3 className="font-mono text-xs text-muted-foreground mb-4">
          STATUS DISTRIBUTION
        </h3>
        <div className="flex gap-2 h-8">
          {data.statusDistribution.map((status) => (
            <div
              key={status.status}
              className={`relative h-full ${
                status.status === "COMPLETED" ? "bg-secondary" : "bg-muted"
              }`}
              style={{
                width: `${Math.max(status.percentage, 2)}%`,
                minWidth: status.count > 0 ? "40px" : "0px",
              }}
              title={`${status.status}: ${status.count} (${status.percentage}%)`}
            >
              {status.percentage >= 10 && (
                <span className="absolute inset-0 flex items-center justify-center font-mono text-xs">
                  {status.count}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          {data.statusDistribution.map((status) => (
            <div key={status.status} className="flex items-center gap-2">
              <div
                className={`w-3 h-3 ${
                  status.status === "COMPLETED" ? "bg-secondary" : "bg-muted"
                }`}
              />
              <span className="font-mono text-xs">
                {status.status.replace(/_/g, " ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight: boolean;
}) {
  return (
    <div className="border-2 border-border p-4">
      <p className="font-mono text-xs text-muted-foreground mb-2">{label}</p>
      <p
        className={`text-2xl font-bold ${highlight ? "text-secondary" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function TrendChart({
  title,
  data,
  color,
}: {
  title: string;
  data: DailyCount[];
  color: string;
}) {
  // Only show last 7 days for readability
  const recentData = data.slice(-7);
  const maxCount = Math.max(...recentData.map((d) => d.count), 1);
  const total = recentData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="border-2 border-border p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-mono text-xs text-muted-foreground">{title}</h4>
        <span className="font-bold text-lg">{total}</span>
      </div>
      <div className="flex items-end gap-1 h-16">
        {recentData.map((day) => (
          <div
            key={day.date}
            className="flex-1 flex flex-col items-center gap-1"
          >
            <div
              className={`w-full ${color}`}
              style={{
                height: `${Math.max((day.count / maxCount) * 100, 4)}%`,
                minHeight: day.count > 0 ? "4px" : "2px",
                opacity: day.count > 0 ? 1 : 0.2,
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="font-mono text-xs text-muted-foreground">
          {recentData[0]?.date.slice(5) || ""}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {recentData[recentData.length - 1]?.date.slice(5) || ""}
        </span>
      </div>
    </div>
  );
}

function FunnelStep({
  step,
  count,
  percentage,
  dropoffRate,
  isFirst,
  isLast,
}: {
  step: string;
  count: number;
  percentage: number;
  dropoffRate: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`h-6 ${isLast ? "bg-secondary" : "bg-muted"}`}
        style={{ width: `${Math.max(percentage, 10)}%` }}
      />
      <div className="flex-1 flex items-center justify-between">
        <span className="font-semibold text-sm">{step}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{count}</span>
          {!isFirst && dropoffRate > 0 && (
            <span className="font-mono text-xs text-muted-foreground">
              (-{dropoffRate}%)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
