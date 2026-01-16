import { env } from "@/lib/env";

/**
 * Parses a GitHub PR URL to extract owner, repo, and pull number
 * Returns null if the URL doesn't match GitHub PR format
 */
export function parseGitHubPrUrl(url: string): {
  owner: string;
  repo: string;
  pullNumber: number;
} | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("github.com")) {
      return null;
    }

    // Match: /owner/repo/pull/123
    const match = parsed.pathname.match(/^\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
    if (!match) {
      return null;
    }

    return {
      owner: match[1],
      repo: match[2],
      pullNumber: parseInt(match[3], 10),
    };
  } catch {
    return null;
  }
}

/**
 * PR content snapshot for historical reference
 */
export interface PrSnapshot {
  url: string;
  provider: "github" | "gitlab" | "bitbucket" | "unknown";
  fetchedAt: string;
  // GitHub-specific fields
  title?: string;
  body?: string;
  state?: string;
  headRef?: string;
  baseRef?: string;
  createdAt?: string;
  updatedAt?: string;
  commits?: number;
  additions?: number;
  deletions?: number;
  changedFiles?: number;
  author?: string;
  // Diff content
  diff?: string;
  // Error info if fetch failed
  fetchError?: string;
}

/**
 * Fetches PR content from GitHub for historical preservation
 * Returns a snapshot of the PR data before deletion
 */
export async function fetchGitHubPrContent(prUrl: string): Promise<PrSnapshot> {
  const snapshot: PrSnapshot = {
    url: prUrl,
    provider: "github",
    fetchedAt: new Date().toISOString(),
  };

  const parsed = parseGitHubPrUrl(prUrl);
  if (!parsed) {
    return {
      ...snapshot,
      provider: "unknown",
      fetchError: "Not a valid GitHub PR URL",
    };
  }

  const token = env.GITHUB_TOKEN;
  if (!token) {
    return {
      ...snapshot,
      fetchError: "GITHUB_TOKEN not configured - cannot fetch PR content",
    };
  }

  const { owner, repo, pullNumber } = parsed;

  try {
    // Fetch PR metadata
    const prResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!prResponse.ok) {
      return {
        ...snapshot,
        fetchError: `GitHub API error: ${prResponse.status} ${prResponse.statusText}`,
      };
    }

    const prData = await prResponse.json();

    // Fetch diff content
    const diffResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3.diff",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    let diff: string | undefined;
    if (diffResponse.ok) {
      diff = await diffResponse.text();
      // Truncate very large diffs (limit to ~500KB)
      if (diff.length > 500000) {
        diff = diff.substring(0, 500000) + "\n\n[DIFF TRUNCATED - original was " + diff.length + " bytes]";
      }
    }

    return {
      ...snapshot,
      title: prData.title,
      body: prData.body,
      state: prData.state,
      headRef: prData.head?.ref,
      baseRef: prData.base?.ref,
      createdAt: prData.created_at,
      updatedAt: prData.updated_at,
      commits: prData.commits,
      additions: prData.additions,
      deletions: prData.deletions,
      changedFiles: prData.changed_files,
      author: prData.user?.login,
      diff,
    };
  } catch (error) {
    return {
      ...snapshot,
      fetchError: error instanceof Error ? error.message : "Unknown error fetching PR",
    };
  }
}

/**
 * Result of PR cleanup operation
 */
export interface PrCleanupResult {
  success: boolean;
  action: "closed" | "none" | "error";
  message: string;
  prSnapshot?: PrSnapshot;
}

/**
 * Closes a GitHub PR
 * Note: GitHub doesn't allow PR deletion via API, only closing
 * Branch deletion could be added if needed
 */
export async function closeGitHubPr(prUrl: string): Promise<PrCleanupResult> {
  const parsed = parseGitHubPrUrl(prUrl);
  if (!parsed) {
    return {
      success: false,
      action: "none",
      message: "Not a GitHub PR URL - only GitHub PRs can be closed",
    };
  }

  const token = env.GITHUB_TOKEN;
  if (!token) {
    return {
      success: false,
      action: "error",
      message: "GITHUB_TOKEN not configured - cannot close PR",
    };
  }

  const { owner, repo, pullNumber } = parsed;

  try {
    // First, fetch the PR content for historical preservation
    const prSnapshot = await fetchGitHubPrContent(prUrl);

    // Close the PR by updating its state
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state: "closed",
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        action: "error",
        message: `GitHub API error: ${response.status} ${response.statusText}${errorData.message ? ` - ${errorData.message}` : ""}`,
        prSnapshot,
      };
    }

    return {
      success: true,
      action: "closed",
      message: `Successfully closed PR #${pullNumber} in ${owner}/${repo}`,
      prSnapshot,
    };
  } catch (error) {
    return {
      success: false,
      action: "error",
      message: error instanceof Error ? error.message : "Unknown error closing PR",
    };
  }
}

/**
 * Main function to clean up a PR after assessment
 * 1. Fetches PR content for historical reference
 * 2. Closes the PR (GitHub only - can't delete via API)
 * Returns snapshot for storage regardless of close success
 */
export async function cleanupPrAfterAssessment(prUrl: string): Promise<PrCleanupResult> {
  // Determine provider
  if (prUrl.includes("github.com")) {
    return closeGitHubPr(prUrl);
  }

  // For non-GitHub PRs, just fetch what we can for the snapshot
  // GitLab and Bitbucket would need their own API integrations
  return {
    success: true,
    action: "none",
    message: "Non-GitHub PR - cleanup not supported, content snapshot not available",
    prSnapshot: {
      url: prUrl,
      provider: prUrl.includes("gitlab") ? "gitlab" : prUrl.includes("bitbucket") ? "bitbucket" : "unknown",
      fetchedAt: new Date().toISOString(),
      fetchError: "Only GitHub PR cleanup is currently supported",
    },
  };
}

// ============================================================================
// CI/CD Status Types
// ============================================================================

/**
 * Status of a single check run (e.g., a test job)
 */
export interface CheckRun {
  id: number;
  name: string;
  status: "queued" | "in_progress" | "completed";
  conclusion: "success" | "failure" | "cancelled" | "skipped" | "neutral" | "timed_out" | "action_required" | null;
  startedAt?: string;
  completedAt?: string;
  htmlUrl?: string;
  output?: {
    title?: string;
    summary?: string;
    text?: string;
  };
}

/**
 * Combined CI status for a PR
 */
export interface PrCiStatus {
  prUrl: string;
  fetchedAt: string;
  overallStatus: "pending" | "success" | "failure" | "unknown";
  checksCount: number;
  checksCompleted: number;
  checksPassed: number;
  checksFailed: number;
  checks: CheckRun[];
  // Test-specific information (extracted from check outputs)
  testResults?: {
    totalTests?: number;
    passedTests?: number;
    failedTests?: number;
    skippedTests?: number;
    testSummary?: string;
  };
  fetchError?: string;
}

/**
 * Fetches the CI check status for a GitHub PR
 * Uses the GitHub Checks API to get check run status
 */
export async function fetchPrCiStatus(prUrl: string): Promise<PrCiStatus> {
  const status: PrCiStatus = {
    prUrl,
    fetchedAt: new Date().toISOString(),
    overallStatus: "unknown",
    checksCount: 0,
    checksCompleted: 0,
    checksPassed: 0,
    checksFailed: 0,
    checks: [],
  };

  const parsed = parseGitHubPrUrl(prUrl);
  if (!parsed) {
    return {
      ...status,
      fetchError: "Not a valid GitHub PR URL",
    };
  }

  const token = env.GITHUB_TOKEN;
  if (!token) {
    return {
      ...status,
      fetchError: "GITHUB_TOKEN not configured - cannot fetch CI status",
    };
  }

  const { owner, repo, pullNumber } = parsed;

  try {
    // First, get the PR to find the head SHA
    const prResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!prResponse.ok) {
      return {
        ...status,
        fetchError: `GitHub API error: ${prResponse.status} ${prResponse.statusText}`,
      };
    }

    const prData = await prResponse.json();
    const headSha = prData.head?.sha;

    if (!headSha) {
      return {
        ...status,
        fetchError: "Could not determine PR head commit SHA",
      };
    }

    // Fetch check runs for the head commit
    const checksResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${headSha}/check-runs`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!checksResponse.ok) {
      return {
        ...status,
        fetchError: `GitHub Checks API error: ${checksResponse.status} ${checksResponse.statusText}`,
      };
    }

    const checksData = await checksResponse.json();
    const checkRuns: CheckRun[] = (checksData.check_runs || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (run: any) => ({
        id: run.id,
        name: run.name,
        status: run.status,
        conclusion: run.conclusion,
        startedAt: run.started_at,
        completedAt: run.completed_at,
        htmlUrl: run.html_url,
        output: run.output
          ? {
              title: run.output.title,
              summary: run.output.summary,
              text: run.output.text,
            }
          : undefined,
      })
    );

    // Calculate summary statistics
    const checksCount = checkRuns.length;
    const checksCompleted = checkRuns.filter(
      (r) => r.status === "completed"
    ).length;
    const checksPassed = checkRuns.filter(
      (r) => r.status === "completed" && r.conclusion === "success"
    ).length;
    const checksFailed = checkRuns.filter(
      (r) =>
        r.status === "completed" &&
        (r.conclusion === "failure" || r.conclusion === "timed_out")
    ).length;

    // Determine overall status
    let overallStatus: PrCiStatus["overallStatus"] = "unknown";
    if (checksCount === 0) {
      overallStatus = "unknown";
    } else if (checksCompleted < checksCount) {
      overallStatus = "pending";
    } else if (checksFailed > 0) {
      overallStatus = "failure";
    } else if (checksPassed === checksCount) {
      overallStatus = "success";
    }

    // Extract test results from check outputs (if available)
    let testResults: PrCiStatus["testResults"] | undefined;
    const testCheck = checkRuns.find(
      (r) =>
        r.name.toLowerCase().includes("test") ||
        r.name.toLowerCase().includes("ci")
    );
    if (testCheck?.output?.summary) {
      // Try to parse test counts from the summary
      const summary = testCheck.output.summary;
      const passedMatch = summary.match(/(\d+)\s*(?:passed|✓)/i);
      const failedMatch = summary.match(/(\d+)\s*(?:failed|✗)/i);
      const skippedMatch = summary.match(/(\d+)\s*(?:skipped|⊘)/i);
      const totalMatch = summary.match(/(\d+)\s*(?:total|tests?)/i);

      if (passedMatch || failedMatch || totalMatch) {
        testResults = {
          passedTests: passedMatch ? parseInt(passedMatch[1], 10) : undefined,
          failedTests: failedMatch ? parseInt(failedMatch[1], 10) : undefined,
          skippedTests: skippedMatch ? parseInt(skippedMatch[1], 10) : undefined,
          totalTests: totalMatch ? parseInt(totalMatch[1], 10) : undefined,
          testSummary: summary.substring(0, 500), // Limit summary length
        };
      }
    }

    return {
      ...status,
      overallStatus,
      checksCount,
      checksCompleted,
      checksPassed,
      checksFailed,
      checks: checkRuns,
      testResults,
    };
  } catch (error) {
    return {
      ...status,
      fetchError:
        error instanceof Error ? error.message : "Unknown error fetching CI status",
    };
  }
}

/**
 * Formats CI status for inclusion in prompts/reports
 */
export function formatCiStatusForPrompt(ciStatus: PrCiStatus): string {
  if (ciStatus.fetchError) {
    return `CI Status: Unable to fetch (${ciStatus.fetchError})`;
  }

  if (ciStatus.checksCount === 0) {
    return "CI Status: No CI checks found for this PR";
  }

  let result = `CI Status: ${ciStatus.overallStatus.toUpperCase()}\n`;
  result += `- Checks: ${ciStatus.checksCompleted}/${ciStatus.checksCount} completed\n`;
  result += `- Passed: ${ciStatus.checksPassed}, Failed: ${ciStatus.checksFailed}\n`;

  if (ciStatus.testResults) {
    const tr = ciStatus.testResults;
    result += `\nTest Results:\n`;
    if (tr.totalTests !== undefined) {
      result += `- Total: ${tr.totalTests} tests\n`;
    }
    if (tr.passedTests !== undefined) {
      result += `- Passed: ${tr.passedTests}\n`;
    }
    if (tr.failedTests !== undefined && tr.failedTests > 0) {
      result += `- Failed: ${tr.failedTests}\n`;
    }
    if (tr.skippedTests !== undefined && tr.skippedTests > 0) {
      result += `- Skipped: ${tr.skippedTests}\n`;
    }
  }

  // List failed checks
  const failedChecks = ciStatus.checks.filter(
    (c) =>
      c.status === "completed" &&
      (c.conclusion === "failure" || c.conclusion === "timed_out")
  );
  if (failedChecks.length > 0) {
    result += `\nFailed Checks:\n`;
    failedChecks.forEach((check) => {
      result += `- ${check.name}: ${check.conclusion}\n`;
    });
  }

  return result;
}
