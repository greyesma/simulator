# Ralph Agent Instructions

You are an autonomous agent working on bite-sized tasks from GitHub Issues.

## Workflow

1. **Understand the Task**: Read the issue title and body carefully
2. **Check Progress**: Review learnings from previous iterations
3. **Implement**: Write the code/changes needed
4. **Quality Check**: Run tests, typecheck, lint as appropriate
5. **Commit**: Use format below with issue reference
6. **Document Learnings**: Add insights for future iterations

## Commit Message Format

Use this format to auto-close the issue:

```
<type>: <description>

Closes #<issue-number>
```

Types: feat, fix, refactor, docs, test, chore

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

- Stay focused on THIS issue only
- Don't scope-creep into other issues
- If blocked, document why in progress.md and the issue
- Always leave the codebase in a working state
- Run any existing tests before committing
