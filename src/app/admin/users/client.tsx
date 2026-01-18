"use client";

import { useState, useMemo } from "react";
import { Search, X, User, Shield, Calendar, FileText } from "lucide-react";
import type { UserRole } from "@prisma/client";

// Serialized types from server (dates as strings)
interface SerializedUser {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  assessmentCount: number;
}

interface Stats {
  total: number;
  admins: number;
  withAssessments: number;
  totalAssessments: number;
}

interface UsersClientProps {
  users: SerializedUser[];
  stats: Stats;
}

type DateRange = "24h" | "7d" | "30d" | "all";

const ROLE_OPTIONS: UserRole[] = ["USER", "ADMIN"];

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

export function UsersClient({ users, stats }: UsersClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");

  // Filter users based on criteria
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter (name or email)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = user.name?.toLowerCase().includes(query);
        const matchesEmail = user.email?.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail) {
          return false;
        }
      }

      // Role filter
      if (roleFilter !== "all" && user.role !== roleFilter) {
        return false;
      }

      // Date range filter (member since)
      if (dateRange !== "all") {
        const createdAt = new Date(user.createdAt);
        const now = new Date();
        const hoursDiff =
          (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

        if (dateRange === "24h" && hoursDiff > 24) return false;
        if (dateRange === "7d" && hoursDiff > 24 * 7) return false;
        if (dateRange === "30d" && hoursDiff > 24 * 30) return false;
      }

      return true;
    });
  }, [users, searchQuery, roleFilter, dateRange]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold">Users</h1>

      {/* Aggregate Stats */}
      <div
        className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4"
        data-testid="stats-grid"
      >
        <StatCard label="TOTAL USERS" value={stats.total} icon={User} />
        <StatCard label="ADMINS" value={stats.admins} icon={Shield} highlight />
        <StatCard
          label="WITH ASSESSMENTS"
          value={stats.withAssessments}
          icon={FileText}
        />
        <StatCard
          label="TOTAL ASSESSMENTS"
          value={stats.totalAssessments}
          icon={Calendar}
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
            placeholder="Search by name or email..."
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

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
          className="border-2 border-border bg-background px-3 py-2 font-mono text-sm focus:border-foreground focus:outline-none"
          data-testid="role-filter"
        >
          <option value="all">All Roles</option>
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {role}
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
        Showing {filteredUsers.length} of {users.length} users
      </p>

      {/* Users Table */}
      <div className="border-2 border-border" data-testid="users-table">
        {filteredUsers.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No users found matching your criteria
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="p-4 text-left font-mono text-xs text-muted-foreground">
                  USER
                </th>
                <th className="p-4 text-left font-mono text-xs text-muted-foreground">
                  ROLE
                </th>
                <th className="p-4 text-left font-mono text-xs text-muted-foreground">
                  MEMBER SINCE
                </th>
                <th className="p-4 text-left font-mono text-xs text-muted-foreground">
                  ASSESSMENTS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <UserRow key={user.id} user={user} />
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
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}) {
  return (
    <div className="border-2 border-border p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <p className="font-mono text-xs text-muted-foreground">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${highlight ? "text-secondary" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function UserRow({ user }: { user: SerializedUser }) {
  return (
    <tr
      className="hover:bg-muted/30 border-b border-border"
      data-testid={`user-row-${user.id}`}
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-secondary">
            <span className="font-bold text-secondary-foreground">
              {getInitials(user.name, user.email)}
            </span>
          </div>
          <div>
            <p className="font-semibold">{user.name || "Anonymous"}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {user.email || "No email"}
            </p>
          </div>
        </div>
      </td>
      <td className="p-4">
        <span
          className={`px-2 py-1 font-mono text-xs ${
            user.role === "ADMIN"
              ? "bg-secondary text-secondary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {user.role}
        </span>
      </td>
      <td className="p-4 font-mono text-sm text-muted-foreground">
        {formatDate(user.createdAt)}
      </td>
      <td className="p-4">
        <span
          className={`font-mono text-sm ${
            user.assessmentCount > 0 ? "font-bold" : "text-muted-foreground"
          }`}
        >
          {user.assessmentCount}
        </span>
      </td>
    </tr>
  );
}

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  if (email) {
    const localPart = email.split("@")[0];
    return localPart.substring(0, 2).toUpperCase();
  }
  return "??";
}
