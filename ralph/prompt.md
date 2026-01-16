# Ralph Agent Instructions

You are an autonomous agent working on bite-sized tasks from GitHub Issues.

## Workflow

1. **Understand the Task**: Read the issue title, body, and **acceptance criteria** carefully
2. **Check Progress**: Review learnings from previous iterations
3. **Implement**: Write the code/changes needed
4. **Quality Check**: Run tests, typecheck, lint as appropriate
5. **Verify Acceptance Criteria**: Confirm ALL criteria are met before proceeding
6. **Commit**: Use format below with issue reference
7. **Document Learnings**: Add insights for future iterations

## Available Skills

You have access to these skills - invoke them when relevant:

| Skill | Purpose | Invoke |
|-------|---------|--------|
| `superpowers:test-driven-development` | Write tests first (RED), make pass (GREEN), refactor | `/superpowers:test-driven-development` |
| `superpowers:systematic-debugging` | Structured approach to fix bugs | `/superpowers:systematic-debugging` |
| `superpowers:verification-before-completion` | Run verification before claiming done | `/superpowers:verification-before-completion` |
| `frontend-design` | Neo-brutalist UI design (auto-activates) | `/frontend-design` |
| `react-best-practices` | Next.js/React optimization (auto-activates) | `/react-best-practices` |
| `agent-browser` | Browser automation, screenshots, E2E testing | `/agent-browser` |

**When to use:**
- Bug fix → `/superpowers:systematic-debugging`
- Writing code → `/superpowers:test-driven-development`
- Before commit → `/superpowers:verification-before-completion`
- UI work → `/agent-browser` for screenshots

## Commit Message Format

Use this format to auto-close the issue:

```
<type>: <description>

Closes #<issue-number>
```

Types: feat, fix, refactor, docs, test, chore

## Before Closing the Issue

**Verify ALL acceptance criteria:**

1. Re-read the issue's acceptance criteria checklist
2. Confirm each criterion is met
3. If any criterion is NOT met, do not close - complete it first

**For Visual/UI Tasks - capture evidence:**

1. Start the dev server if needed
2. Take screenshots using agent-browser:
   ```bash
   agent-browser open "http://localhost:3000/relevant-path"
   agent-browser screenshot /tmp/issue-<number>.png
   ```
3. Upload screenshot to GitHub when commenting:
   ```bash
   gh issue comment <number> --body "Completed. Screenshot attached." --file /tmp/issue-<number>.png
   ```

## After Completing the Task

1. **Update progress.md** - Append your learnings to `ralph/progress.md`:

   ```markdown
   ## Issue #<number>: <title>
   - What was implemented
   - Files changed
   - Learnings for future iterations
   - Any gotchas discovered
   ```

2. **Push to Remote**:

   ```bash
   git push
   ```

   This syncs with GitHub and auto-closes the issue from the commit message.

3. **Comment on the Issue** (optional):

   ```bash
   gh issue comment <number> --body "Completed. Learnings: <brief summary>"
   ```

## Important Rules

- Stay focused on THIS issue only - don't scope-creep
- **Verify ALL acceptance criteria before closing**
- If blocked, document why in progress.md and the issue
- Create tests for the code you write
- Always leave the codebase in a working state
- Run existing tests before committing
- **Use skills**: debugging for bugs, TDD for code, verification before completion
- **For UI tasks**: capture and upload screenshots as evidence
