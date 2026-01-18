"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  Search,
  X,
} from "lucide-react";
import type { AssessmentStatus, AssessmentLogEventType } from "@prisma/client";

// Serialized types from server (dates as strings)
interface SerializedLog {
  id: string;
  eventType: AssessmentLogEventType;
  timestamp: string;
  durationMs: number | null;
  metadata: unknown;
}

interface SerializedApiCall {
  id: string;
  requestTimestamp: string;
  responseTimestamp: string | null;
  durationMs: number | null;
  modelVersion: string;
  statusCode: number | null;
  errorMessage: string | null;
  promptTokens: number | null;
  responseTokens: number | null;
}

interface SerializedAssessment {
  id: string;
  userId: string;
  scenarioId: string;
  status: AssessmentStatus;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  scenario: {
    id: string;
    name: string;
  };
  logs: SerializedLog[];
  apiCalls: SerializedApiCall[];
}

interface Stats {
  total: number;
  completed: number;
  failed: number;
  successRate: number;
  avgDurationMs: number | null;
}

interface AssessmentsClientProps {
  assessments: SerializedAssessment[];
  stats: Stats;
}

type DateRange = "24h" | "7d" | "30d" | "all";

const STATUS_OPTIONS: AssessmentStatus[] = [
  "HR_INTERVIEW",
  "ONBOARDING",
  "WORKING",
  "FINAL_DEFENSE",
  "PROCESSING",
  "COMPLETED",
];

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.round((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function hasError(assessment: SerializedAssessment): boolean {
  return assessment.logs.some((log) => log.eventType === "ERROR");
}

export function AssessmentsClient({
  assessments,
  stats,
}: AssessmentsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AssessmentStatus | "all">(
    "all"
  );
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter assessments based on criteria
  const filteredAssessments = useMemo(() => {
    return assessments.filter((assessment) => {
      // Search filter (name, email, or assessment ID)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = assessment.user.name?.toLowerCase().includes(query);
        const matchesEmail = assessment.user.email
          ?.toLowerCase()
          .includes(query);
        const matchesId = assessment.id.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesId) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all" && assessment.status !== statusFilter) {
        return false;
      }

      // Date range filter
      if (dateRange !== "all") {
        const createdAt = new Date(assessment.createdAt);
        const now = new Date();
        const hoursDiff =
          (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

        if (dateRange === "24h" && hoursDiff > 24) return false;
        if (dateRange === "7d" && hoursDiff > 24 * 7) return false;
        if (dateRange === "30d" && hoursDiff > 24 * 30) return false;
      }

      return true;
    });
  }, [assessments, searchQuery, statusFilter, dateRange]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold">Assessment Diagnostics</h1>

      {/* Aggregate Stats */}
      <div
        className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4"
        data-testid="stats-grid"
      >
        <StatCard label="TOTAL ASSESSMENTS" value={stats.total} />
        <StatCard
          label="SUCCESS RATE"
          value={`${stats.successRate}%`}
          highlight={stats.successRate >= 80}
        />
        <StatCard
          label="AVG DURATION"
          value={
            stats.avgDurationMs ? formatDuration(stats.avgDurationMs) : "-"
          }
        />
        <StatCard
          label="FAILED"
          value={stats.failed}
          error={stats.failed > 0}
        />
      </div>

      {/* Filters */}
      <div
        className="mb-6 flex flex-wrap items-center gap-4"
        data-testid="filters"
      >
        {/* Search */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-2 border-border bg-background py-2 pl-10 pr-10 font-mono text-sm focus:border-foreground focus:outline-none"
            data-testid="search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as AssessmentStatus | "all")
          }
          className="border-2 border-border bg-background px-3 py-2 font-mono text-sm focus:border-foreground focus:outline-none"
          data-testid="status-filter"
        >
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status.replace(/_/g, " ")}
            </option>
          ))}
        </select>

        {/* Date Range Filter */}
        <div className="flex gap-1" data-testid="date-range-filter">
          {DATE_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setDateRange(option.value)}
              className={`border-2 px-3 py-2 font-mono text-xs ${
                dateRange === option.value
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:border-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="mb-4 font-mono text-sm text-muted-foreground">
        Showing {filteredAssessments.length} of {assessments.length} assessments
      </p>

      {/* Assessments Table */}
      <div className="border-2 border-border" data-testid="assessments-table">
        {filteredAssessments.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No assessments found matching your criteria
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="w-8 p-4"></th>
                <th className="p-4 text-left font-mono text-xs text-muted-foreground">
                  CANDIDATE
                </th>
                <th className="p-4 text-left font-mono text-xs text-muted-foreground">
                  STATUS
                </th>
                <th className="p-4 text-left font-mono text-xs text-muted-foreground">
                  CREATED
                </th>
                <th className="p-4 text-left font-mono text-xs text-muted-foreground">
                  DURATION
                </th>
                <th className="p-4 text-left font-mono text-xs text-muted-foreground">
                  ERRORS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAssessments.map((assessment) => (
                <AssessmentRow
                  key={assessment.id}
                  assessment={assessment}
                  isExpanded={expandedId === assessment.id}
                  onToggle={() => toggleExpand(assessment.id)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
  error,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  error?: boolean;
}) {
  return (
    <div
      className={`border-2 p-4 ${
        error ? "border-red-500 bg-red-50 dark:bg-red-950" : "border-border"
      }`}
    >
      <p className="mb-2 font-mono text-xs text-muted-foreground">{label}</p>
      <p
        className={`text-2xl font-bold ${
          error
            ? "text-red-600 dark:text-red-400"
            : highlight
              ? "text-secondary"
              : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function AssessmentRow({
  assessment,
  isExpanded,
  onToggle,
}: {
  assessment: SerializedAssessment;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const hasErrors = hasError(assessment);
  const duration =
    assessment.completedAt && assessment.startedAt
      ? new Date(assessment.completedAt).getTime() -
        new Date(assessment.startedAt).getTime()
      : null;

  return (
    <>
      <tr
        className={`hover:bg-muted/30 cursor-pointer border-b border-border ${
          isExpanded ? "bg-muted/20" : ""
        }`}
        onClick={onToggle}
        data-testid={`assessment-row-${assessment.id}`}
      >
        <td className="p-4">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </td>
        <td className="p-4">
          <p className="font-semibold">{assessment.user.name || "Anonymous"}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {assessment.user.email || "No email"}
          </p>
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
          {formatDate(assessment.createdAt)}
        </td>
        <td className="p-4 font-mono text-sm">
          {duration ? formatDuration(duration) : "-"}
        </td>
        <td className="p-4">
          {hasErrors ? (
            <span className="inline-flex items-center gap-1 bg-red-100 px-2 py-1 font-mono text-xs text-red-600 dark:bg-red-900 dark:text-red-400">
              <AlertCircle className="h-3 w-3" />
              ERROR
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} className="border-b-2 border-border p-0">
            <AssessmentDetails assessment={assessment} />
          </td>
        </tr>
      )}
    </>
  );
}

function AssessmentDetails({
  assessment,
}: {
  assessment: SerializedAssessment;
}) {
  return (
    <div className="bg-muted/10 p-6" data-testid={`details-${assessment.id}`}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Assessment Info */}
        <div>
          <h4 className="mb-3 font-mono text-xs text-muted-foreground">
            ASSESSMENT INFO
          </h4>
          <div className="space-y-2 font-mono text-sm">
            <p>
              <span className="text-muted-foreground">ID:</span> {assessment.id}
            </p>
            <p>
              <span className="text-muted-foreground">Scenario:</span>{" "}
              {assessment.scenario.name}
            </p>
            <p>
              <span className="text-muted-foreground">Started:</span>{" "}
              {formatDate(assessment.startedAt)}
            </p>
            {assessment.completedAt && (
              <p>
                <span className="text-muted-foreground">Completed:</span>{" "}
                {formatDate(assessment.completedAt)}
              </p>
            )}
          </div>
          {/* View Timeline Link */}
          <Link
            href={`/admin/assessments/${assessment.id}`}
            className="mt-4 inline-flex items-center gap-2 border-2 border-foreground bg-foreground px-4 py-2 font-mono text-xs text-background hover:bg-background hover:text-foreground"
            data-testid={`view-timeline-${assessment.id}`}
          >
            <ExternalLink className="h-3 w-3" />
            View Full Timeline
          </Link>
        </div>

        {/* Event Logs */}
        <div>
          <h4 className="mb-3 font-mono text-xs text-muted-foreground">
            EVENT LOG ({assessment.logs.length} events)
          </h4>
          {assessment.logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events recorded</p>
          ) : (
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {assessment.logs.map((log) => (
                <LogEntry key={log.id} log={log} />
              ))}
            </div>
          )}
        </div>

        {/* API Calls */}
        <div className="md:col-span-2">
          <h4 className="mb-3 font-mono text-xs text-muted-foreground">
            API CALLS ({assessment.apiCalls.length} calls)
          </h4>
          {assessment.apiCalls.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No API calls recorded
            </p>
          ) : (
            <div className="border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="p-2 text-left font-mono text-xs text-muted-foreground">
                      TIME
                    </th>
                    <th className="p-2 text-left font-mono text-xs text-muted-foreground">
                      MODEL
                    </th>
                    <th className="p-2 text-left font-mono text-xs text-muted-foreground">
                      DURATION
                    </th>
                    <th className="p-2 text-left font-mono text-xs text-muted-foreground">
                      TOKENS
                    </th>
                    <th className="p-2 text-left font-mono text-xs text-muted-foreground">
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {assessment.apiCalls.map((call) => (
                    <ApiCallRow key={call.id} call={call} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LogEntry({ log }: { log: SerializedLog }) {
  const isError = log.eventType === "ERROR";

  return (
    <div
      className={`flex items-center gap-2 px-2 py-1 font-mono text-xs ${
        isError
          ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          : ""
      }`}
    >
      <Clock className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground">
        {new Date(log.timestamp).toLocaleTimeString()}
      </span>
      <span
        className={`px-1 ${
          isError
            ? "bg-red-200 dark:bg-red-800"
            : log.eventType === "COMPLETED"
              ? "bg-secondary"
              : "bg-muted"
        }`}
      >
        {log.eventType}
      </span>
      {log.durationMs && (
        <span className="text-muted-foreground">
          +{formatDuration(log.durationMs)}
        </span>
      )}
    </div>
  );
}

function ApiCallRow({ call }: { call: SerializedApiCall }) {
  const hasError = call.errorMessage !== null;
  const totalTokens = (call.promptTokens ?? 0) + (call.responseTokens ?? 0);

  return (
    <tr
      className={`border-b border-border ${
        hasError ? "bg-red-50 dark:bg-red-950/30" : ""
      }`}
    >
      <td className="p-2 font-mono text-xs text-muted-foreground">
        {new Date(call.requestTimestamp).toLocaleTimeString()}
      </td>
      <td className="p-2 font-mono text-xs">{call.modelVersion}</td>
      <td className="p-2 font-mono text-xs">
        {call.durationMs ? formatDuration(call.durationMs) : "-"}
      </td>
      <td className="p-2 font-mono text-xs">
        {totalTokens > 0 ? totalTokens.toLocaleString() : "-"}
      </td>
      <td className="p-2">
        {hasError ? (
          <span
            className="text-xs text-red-600 dark:text-red-400"
            title={call.errorMessage ?? undefined}
          >
            <AlertCircle className="inline h-4 w-4" /> Error
          </span>
        ) : (
          <span className="text-xs text-green-600 dark:text-green-400">
            <CheckCircle2 className="inline h-4 w-4" />{" "}
            {call.statusCode ?? "OK"}
          </span>
        )}
      </td>
    </tr>
  );
}
