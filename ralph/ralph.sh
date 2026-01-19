#!/bin/bash

# Use Max subscription, not API credits
unset ANTHROPIC_API_KEY

# Configuration
POLL_INTERVAL="${RALPH_POLL_INTERVAL:-60}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

echo "🚀 Ralph starting (continuous mode, poll interval: ${POLL_INTERVAL}s)"
echo "   Press Ctrl+C to stop"

ITERATION=0

while true; do
  # Fetch highest priority open issue (P0 > P1 > P2 > no priority), oldest first
  ISSUE=$(gh issue list --state open --json number,title,body,labels --limit 100 | jq '
    map(. + {
      priority_order: (
        .labels | map(.name) |
        if any(. == "P0") then 0
        elif any(. == "P1") then 1
        elif any(. == "P2") then 2
        else 999
        end
      )
    }) | sort_by(.priority_order, .number) | .[0] // empty
  ')

  # If no issues, wait and poll again
  if [ -z "$ISSUE" ]; then
    echo "💤 No tasks found. Waiting ${POLL_INTERVAL}s... ($(date '+%H:%M:%S'))"
    sleep "$POLL_INTERVAL"
    continue
  fi

  ITERATION=$((ITERATION + 1))
  ISSUE_NUM=$(echo "$ISSUE" | jq -r '.number')
  ISSUE_TITLE=$(echo "$ISSUE" | jq -r '.title')
  ISSUE_BODY=$(echo "$ISSUE" | jq -r '.body')

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔄 Iteration $ITERATION: Issue #$ISSUE_NUM - $ISSUE_TITLE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # Build the prompt
  PROMPT="$(cat "$SCRIPT_DIR/prompt.md")

## Current Task
**Issue #$ISSUE_NUM**: $ISSUE_TITLE

$ISSUE_BODY

## Previous Learnings
Read \`ralph/progress.md\` for learnings from previous iterations."

  # Run Claude - || true ensures crashes don't kill the loop
  LOG_FILE="/tmp/ralph-iteration-$ITERATION.log"
  claude --dangerously-skip-permissions --verbose -p "$PROMPT" 2>&1 | tee "$LOG_FILE" || true

  echo ""
  echo "📝 Log saved to: $LOG_FILE"

  # Check if issue is now closed (source of truth)
  ISSUE_STATE=$(gh issue view "$ISSUE_NUM" --json state -q '.state' 2>/dev/null || echo "UNKNOWN")
  if [ "$ISSUE_STATE" = "CLOSED" ]; then
    echo "✅ Issue #$ISSUE_NUM closed successfully"
  else
    echo "⚠️  Issue #$ISSUE_NUM still open - will retry next run"
  fi

  sleep 2
done
