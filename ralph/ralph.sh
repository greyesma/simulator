#!/bin/bash
set -e

# Use Max subscription, not API credits
unset ANTHROPIC_API_KEY

# Configuration
LABEL="${RALPH_LABEL:-task}"
MAX_ITERATIONS="${1:-10}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

echo "🚀 Ralph starting (max $MAX_ITERATIONS iterations, label: $LABEL)"

for i in $(seq 1 $MAX_ITERATIONS); do
  # Fetch oldest open issue with label
  ISSUE=$(gh issue list --label "$LABEL" --state open --json number,title,body --limit 1 | jq '.[0] // empty')

  # If no issues, we're done
  if [ -z "$ISSUE" ]; then
    echo "✅ All tasks complete!"
    exit 0
  fi

  ISSUE_NUM=$(echo "$ISSUE" | jq -r '.number')
  ISSUE_TITLE=$(echo "$ISSUE" | jq -r '.title')
  ISSUE_BODY=$(echo "$ISSUE" | jq -r '.body')

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔄 Iteration $i: Issue #$ISSUE_NUM - $ISSUE_TITLE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # Build the prompt with context
  PROMPT="$(cat "$SCRIPT_DIR/prompt.md")

## Current Task
**Issue #$ISSUE_NUM**: $ISSUE_TITLE

$ISSUE_BODY

## Previous Learnings
$(cat "$SCRIPT_DIR/progress.md" 2>/dev/null || echo 'No previous learnings yet.')"

  # Spawn Claude with context
  claude --dangerously-skip-permissions -p "$PROMPT"

  echo ""
  echo "✅ Iteration $i complete"
  sleep 2
done

echo ""
echo "⚠️ Max iterations ($MAX_ITERATIONS) reached."
echo "Check ralph/progress.md for status."
exit 1
