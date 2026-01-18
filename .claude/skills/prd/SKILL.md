---
name: prd
description: Generate Product Requirements Documents (PRDs) for new features. Use when user wants to plan a feature, create requirements, or says "create a PRD", "plan feature", "write requirements".
user-invocable: true
---

# PRD Generator Skill

Generate Product Requirements Documents (PRDs) for new features that can be converted into GitHub Issues for Ralph to execute.

## Your Job

1. Receive a feature description from the user
2. Ask 3-5 clarifying questions with lettered options
3. Generate a structured PRD and save to `tasks/prd-[feature-name].md`

**Do NOT start implementing. Just create the PRD.**

## Clarifying Questions

Ask about:

- Problem/Goal: What problem does this solve?
- Core Functionality: What's the minimum viable feature?
- Scope: What's explicitly out of scope?
- Success Criteria: How do we know it works?

Format questions with lettered options for quick responses:

```
1. What's the primary goal?
   A) Improve user experience
   B) Add new capability
   C) Fix existing limitation
   D) Other (please specify)

2. Who is the target user?
   A) End users
   B) Administrators
   C) Developers
   D) All of the above
```

User can respond with "1A, 2C, 3B" etc.

## PRD Structure

```markdown
# PRD: [Feature Name]

## Overview

Brief description of the feature and the problem it solves.

## Goals

- Specific, measurable goal 1
- Specific, measurable goal 2

## User Stories

### US-001: [Story Title]

**Description**: As a [user type], I want [feature] so that [benefit].

**Acceptance Criteria**:

- [ ] Specific, verifiable criterion
- [ ] Another verifiable criterion
- [ ] Tests pass (if applicable)

### US-002: [Story Title]

...

## Functional Requirements

1. The system shall [specific requirement]
2. The system shall [specific requirement]

## Non-Goals

- Explicitly out of scope item 1
- Explicitly out of scope item 2

## Technical Considerations

- Any constraints or dependencies
- Integration points

## Success Metrics

- How we measure success
```

## Story Sizing Rules

**Critical**: Each story must be completable in ONE Ralph iteration (one Claude context window).

**Right-sized stories**:

- Add a database column with migration
- Create a single UI component
- Add one API endpoint
- Update server logic for one feature

**Too large (split these)**:

- "Build the entire dashboard"
- "Add authentication system"
- "Refactor the API layer"

## Writing Standards

Write for clarity - assume the reader is a junior developer or AI:

- Be explicit and unambiguous
- Number requirements for easy reference
- Use concrete examples
- Avoid vague criteria like "works correctly" or "good UX"

**Good acceptance criteria**:

- "Add status column to tasks table with default 'pending'"
- "Button displays 'Submit' text and is disabled when form is invalid"
- "API returns 404 when resource not found"

**Bad acceptance criteria**:

- "Works correctly"
- "Handles edge cases"
- "Good user experience"

## Output

- **Format**: Markdown
- **Location**: `tasks/` directory (create if needed)
- **Filename**: `prd-[feature-name].md` (kebab-case)

## Pre-Save Checklist

Before saving the PRD, verify:

- [ ] Asked clarifying questions with lettered options
- [ ] Incorporated user's answers
- [ ] User stories are small enough for one iteration
- [ ] Functional requirements are numbered
- [ ] Non-goals clearly define boundaries
- [ ] Acceptance criteria are verifiable, not vague
- [ ] File saved to `tasks/prd-[feature-name].md`
