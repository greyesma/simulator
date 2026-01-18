# PRD: Skillvee Developer Assessment Simulator

## Overview

A simulation-based platform that assesses software developer skills through realistic work scenarios. Candidates experience a full "day at work" - from HR interview through task completion and PR defense - while the platform captures their process via screen recording and AI-powered conversations.

The MVP is developer-focused (B2C): developers practice real-world scenarios, receive comprehensive skill assessments, and improve their abilities. B2B monetization (companies paying to assess/discover talent) comes later.

**Core insight**: The platform assesses HOW developers work, not just WHAT they produce. Communication, AI leverage, problem-solving approach, and cross-functional collaboration are evaluated alongside code quality.

## Goals

- Enable developers to practice realistic work simulations (not algorithm puzzles)
- Provide comprehensive skill assessment across 8 categories
- Capture the full process via screen recording for behavioral analysis
- Deliver actionable feedback with specific improvement recommendations
- Create a "so good they tell others" experience for organic growth

## User Stories

### Phase 1: Foundation

#### US-001: Landing Page

**Description**: As a visitor, I want to see a compelling landing page so that I understand the product and can start practicing.

**Acceptance Criteria**:

- [ ] Neo-brutalist design (sharp corners, black/white/gold, DM Sans + Space Mono)
- [ ] Clear value proposition ("Practice a Real Scenario")
- [ ] Primary CTA button leads to sign-up/login
- [ ] Responsive on mobile (for discovery), but assessment is desktop-only
- [ ] Page loads in under 2 seconds

---

#### US-002: Authentication

**Description**: As a user, I want to sign up and log in so that I can access assessments and save my progress.

**Acceptance Criteria**:

- [ ] Google OAuth login works
- [ ] Email + password registration works
- [ ] Email + password login works
- [ ] Session persists across browser refreshes
- [ ] User record created in Supabase with role field
- [ ] Port auth patterns from existing Skillvee codebase

---

#### US-003: User Profile & Data Model

**Description**: As a developer, I want my profile and assessment data stored so that I can track my progress over time.

**Acceptance Criteria**:

- [ ] User table with: id, email, name, role, created_at
- [ ] Assessment table linked to user
- [ ] CV/resume storage (Supabase storage)
- [ ] Basic profile page showing past assessments

---

### Phase 2: HR Interview

#### US-004: CV Upload

**Description**: As a candidate, I want to upload my CV so that the HR interviewer can reference it.

**Acceptance Criteria**:

- [ ] File upload accepts PDF and common document formats
- [ ] File stored in Supabase storage
- [ ] File size limit enforced (e.g., 10MB)
- [ ] Upload progress indicator shown
- [ ] Uploaded file accessible for Gemini context

---

#### US-005: HR Interview Voice Conversation

**Description**: As a candidate, I want to have a voice conversation with an AI HR interviewer so that I can demonstrate my communication skills and verify my CV experience.

**Acceptance Criteria**:

- [ ] Gemini Live integration for voice conversation
- [ ] HR persona with specific system prompt (verify CV claims)
- [ ] 20-minute expected duration (no hard cutoff)
- [ ] Microphone permission requested and handled gracefully
- [ ] Conversation transcript saved for assessment
- [ ] Browser support: Chrome, Firefox, Safari

---

#### US-006: HR Interview Assessment Data

**Description**: As the system, I want to capture HR interview signals so that I can include them in the final assessment.

**Acceptance Criteria**:

- [ ] Communication clarity scored
- [ ] CV verification notes captured
- [ ] Conversation transcript stored
- [ ] Timestamps for analytics

---

### Phase 3: Onboarding Transition

#### US-007: Congratulations Screen

**Description**: As a candidate who passed the HR screen, I want to see a celebratory moment so that I feel accomplished before starting work.

**Acceptance Criteria**:

- [ ] "Congratulations, you got the job!" message displayed
- [ ] Neo-brutalist design with gold accent
- [ ] Transition animation (sharp, not smooth per design system)
- [ ] Auto-advance or button to continue

---

#### US-008: Welcome Message from Manager

**Description**: As a new "employee," I want to receive a welcome message from my manager so that I understand the simulation is beginning.

**Acceptance Criteria**:

- [ ] Slack-like DM interface appears
- [ ] Message from manager persona with welcome text
- [ ] Manager suggests scheduling a kickoff call
- [ ] Links/mentions the repo for the task
- [ ] Neo-brutalist chat UI styling

---

### Phase 4: Slack-like Interface

#### US-009: Coworker Directory

**Description**: As a candidate, I want to see a list of available coworkers so that I know who I can contact for help.

**Acceptance Criteria**:

- [ ] Sidebar shows 3-4 coworkers (Manager, PM, Senior Dev, etc.)
- [ ] Each shows name, role, and avatar/icon
- [ ] All show as "available" (always online)
- [ ] Click to open chat or start call

---

#### US-010: Text Chat with Coworkers

**Description**: As a candidate, I want to text chat with coworkers so that I can ask quick questions asynchronously.

**Acceptance Criteria**:

- [ ] Chat interface per coworker
- [ ] Messages sent to Gemini Flash with coworker persona + knowledge
- [ ] Responses appear in chat thread
- [ ] Chat history persists across page reloads
- [ ] Timestamps on messages
- [ ] Chat history saved for assessment

---

#### US-011: Voice Call with Coworkers

**Description**: As a candidate, I want to voice call coworkers so that I can have in-depth discussions.

**Acceptance Criteria**:

- [ ] "Call" button initiates Gemini Live session
- [ ] Coworker persona and knowledge injected into system prompt
- [ ] Conversation flows naturally with voice
- [ ] Call can be ended by user
- [ ] Transcript saved for assessment
- [ ] Memory of prior chats/calls available to coworker

---

#### US-012: Coworker Persona System

**Description**: As a coworker AI, I want to have a distinct persona and knowledge so that I provide realistic, role-appropriate responses.

**Acceptance Criteria**:

- [ ] Each coworker has: name, role, personality style, specific knowledge
- [ ] Knowledge includes things candidate must discover by asking
- [ ] Coworker answers fully when asked the right question
- [ ] Persona style affects communication (formal PM vs. casual dev)
- [ ] Configured per scenario in database

---

#### US-013: Coworker Memory Across Conversations

**Description**: As a candidate, I want coworkers to remember our previous conversations so that I don't have to repeat context.

**Acceptance Criteria**:

- [ ] Conversation history summarized and included in coworker context
- [ ] Manager remembers kickoff call during final defense
- [ ] Memory persists within the assessment session
- [ ] Works for both text chat and voice calls

---

### Phase 5: Screen Recording & Work Phase

#### US-014: Screen Recording Permission

**Description**: As a candidate, I want to grant screen recording permission so that my work process can be captured.

**Acceptance Criteria**:

- [ ] Browser screen share permission requested
- [ ] Clear explanation of why recording is needed
- [ ] Permission status tracked in state
- [ ] Graceful handling if permission denied
- [ ] Re-prompt if screen share stops mid-assessment

---

#### US-015: Continuous Screen Recording

**Description**: As the system, I want to continuously record the candidate's screen so that I can analyze their work process.

**Acceptance Criteria**:

- [ ] Recording starts after permission granted
- [ ] Compressed video stored (not raw frames)
- [ ] Periodic screenshots captured for key moment analysis
- [ ] Recording continues across page reloads (re-prompt for permission)
- [ ] Storage in Supabase or cloud storage

---

#### US-016: Screen Recording Robustness

**Description**: As a candidate, I want screen recording to handle interruptions gracefully so that my assessment isn't ruined by technical issues.

**Acceptance Criteria**:

- [ ] Detects when screen share stops
- [ ] Blocks further progress until re-shared
- [ ] Prompts user to re-enable
- [ ] Session persists indefinitely (can close laptop, come back)
- [ ] Recording segments are stitched for analysis

---

#### US-017: Incremental Recording Analysis

**Description**: As the system, I want to analyze screen recordings incrementally so that insights are available for assessment.

**Acceptance Criteria**:

- [ ] Recording processed in chunks (every X minutes)
- [ ] Gemini Pro analyzes screenshots/video segments
- [ ] Extracts: activity timeline, tool usage, stuck moments
- [ ] Analysis results stored for final assessment aggregation

---

### Phase 6: Manager Kickoff & Final Calls

#### US-018: Manager Kickoff Call

**Description**: As a candidate, I want to have a kickoff call with my manager so that I understand the task.

**Acceptance Criteria**:

- [ ] Gemini Live call with manager persona
- [ ] Manager gives vague task description (realistic ambiguity)
- [ ] Candidate can ask clarifying questions
- [ ] Call transcript saved
- [ ] After call, candidate has enough context to start (or should ask coworkers)

---

#### US-019: Ping Manager When Done

**Description**: As a candidate, I want to notify my manager when I've completed the task so that we can schedule the final review.

**Acceptance Criteria**:

- [ ] "I'm done" message or button in manager chat
- [ ] Prompts for PR link
- [ ] Triggers transition to final defense phase
- [ ] Time tracked (how long the assessment took)

---

#### US-020: Final Defense Call

**Description**: As a candidate, I want to have a final call with my manager to defend my PR so that I can explain my decisions.

**Acceptance Criteria**:

- [ ] Gemini Live call with manager persona
- [ ] Manager has context: PR link, conversation history, (partial) screen analysis
- [ ] Candidate walks through their solution
- [ ] Manager asks probing questions about decisions
- [ ] Assessment being finalized during this call
- [ ] Call transcript saved

---

### Phase 7: GitHub Integration

#### US-021: Scenario Repo Access

**Description**: As a candidate, I want access to the task repo so that I can work on the code.

**Acceptance Criteria**:

- [ ] Public GitHub repo URL provided in manager message
- [ ] Repo has 50+ files (realistic codebase)
- [ ] Existing issues, docs, and past PRs for context
- [ ] Existing tests that shouldn't break
- [ ] README with setup instructions

---

#### US-022: PR Submission

**Description**: As a candidate, I want to submit my PR link so that my work can be evaluated.

**Acceptance Criteria**:

- [ ] Text input for PR URL
- [ ] Basic validation (is it a GitHub PR URL?)
- [ ] PR URL stored with assessment
- [ ] Link accessible for AI code review

---

#### US-023: PR Cleanup

**Description**: As the system, I want to delete submitted PRs after assessment so that scenarios aren't leaked.

**Acceptance Criteria**:

- [ ] GitHub API integration to close/delete PR
- [ ] Triggered after assessment report sent
- [ ] Graceful handling if deletion fails
- [ ] PR content preserved in our system for historical reference

---

#### US-024: Automated Test Verification

**Description**: As the system, I want to run CI tests on the PR so that code quality can be assessed.

**Acceptance Criteria**:

- [ ] CI runs on PR (GitHub Actions)
- [ ] Test pass/fail status captured
- [ ] Test results included in assessment
- [ ] Candidate expected to add their own tests (also evaluated)

---

#### US-025: AI Code Review

**Description**: As the system, I want AI to review the PR code so that quality and patterns can be assessed.

**Acceptance Criteria**:

- [ ] Gemini analyzes PR diff
- [ ] Evaluates: code quality, patterns, security, maintainability
- [ ] Identifies strengths and areas for improvement
- [ ] Results fed into final assessment

---

### Phase 8: Assessment & Reporting

#### US-026: Assessment Data Aggregation

**Description**: As the system, I want to aggregate all assessment signals so that a comprehensive report can be generated.

**Acceptance Criteria**:

- [ ] Collects: HR interview, chat transcripts, call transcripts, screen analysis, PR review, test results, timing data
- [ ] Scores 8 skill categories: Communication, Problem Decomposition, AI Leverage, Code Quality, XFN Collaboration, Time Management, Technical Decision-Making, Presentation
- [ ] Generates narrative feedback
- [ ] Creates actionable recommendations

---

#### US-027: Assessment Report Generation

**Description**: As a candidate, I want to receive a detailed assessment report so that I know my strengths and areas to improve.

**Acceptance Criteria**:

- [ ] Skill breakdown with scores per category
- [ ] Narrative feedback explaining scores
- [ ] Specific recommendations for improvement
- [ ] Generated by Gemini Pro with all context
- [ ] Stored in database linked to assessment

---

#### US-028: Summary Page While Processing

**Description**: As a candidate, I want to see a summary while waiting for my report so that I know the assessment is processing.

**Acceptance Criteria**:

- [ ] Shows after final defense call ends
- [ ] Displays quick stats: time spent, coworkers contacted, etc.
- [ ] Indicates full report coming via email
- [ ] Neo-brutalist design

---

#### US-029: Email Report Delivery

**Description**: As a candidate, I want to receive my assessment report via email so that I can review it when ready.

**Acceptance Criteria**:

- [ ] Email sent when report is ready
- [ ] Link to view full report in app
- [ ] Basic summary in email body
- [ ] Transactional email service (Resend, SendGrid, etc.)

---

#### US-030: Assessment History

**Description**: As a candidate, I want to see my past assessments so that I can track improvement over time.

**Acceptance Criteria**:

- [ ] List of past attempts
- [ ] Each shows date, time spent, overall score/summary
- [ ] Can view full report for any past attempt
- [ ] Shows improvement trends if multiple attempts

---

### Phase 9: Admin Panel

#### US-031: Admin Access Control

**Description**: As an admin, I want role-protected access to the admin panel so that only authorized users can create scenarios.

**Acceptance Criteria**:

- [ ] Admin role in user table
- [ ] Admin routes protected by role check
- [ ] Non-admins redirected to main app
- [ ] Admin nav visible only to admins

---

#### US-032: Conversational Scenario Builder

**Description**: As an admin, I want to create scenarios through conversation so that I can easily define new assessments.

**Acceptance Criteria**:

- [ ] Chat interface with AI (Gemini)
- [ ] AI asks clarifying questions about the scenario
- [ ] Collects: company name, lore, task description, tech stack
- [ ] Collects: coworker personas, their knowledge, communication styles
- [ ] Previews scenario before saving

---

#### US-033: Scenario Data Model

**Description**: As the system, I want a robust data model for scenarios so that all scenario components are properly stored.

**Acceptance Criteria**:

- [ ] Scenario table: id, name, company_name, company_description, task_description, repo_url, tech_stack
- [ ] Coworker table: id, scenario_id, name, role, persona_style, knowledge (JSON)
- [ ] Relationships properly defined
- [ ] Created scenarios can be edited

---

#### US-034: Scenario Preview & Testing

**Description**: As an admin, I want to preview and test a scenario so that I can verify it works before publishing.

**Acceptance Criteria**:

- [ ] "Preview" mode runs through scenario as candidate would
- [ ] Can test coworker conversations
- [ ] Can verify repo access
- [ ] Scenario marked as draft until published

---

### Phase 10: Infrastructure & Polish

#### US-035: Error Handling & Recovery

**Description**: As a candidate, I want graceful error handling so that technical issues don't ruin my assessment.

**Acceptance Criteria**:

- [ ] Gemini API failures show retry option
- [ ] Voice fails gracefully to text-only
- [ ] Progress saved for session recovery
- [ ] Clear error messages with recovery options
- [ ] Session persists across browser restarts

---

#### US-036: Basic Analytics

**Description**: As a product owner, I want basic analytics so that I understand usage patterns.

**Acceptance Criteria**:

- [ ] Track: signups, assessment starts, completions
- [ ] Track: time spent per phase
- [ ] Basic dashboard or log output
- [ ] Privacy-respecting (no PII in analytics)

---

#### US-037: Privacy & Consent

**Description**: As a candidate, I want clear consent flows so that I understand what data is collected.

**Acceptance Criteria**:

- [ ] Consent screen before assessment starts
- [ ] Explains: screen recording, voice recording, CV storage
- [ ] User must accept to proceed
- [ ] Privacy policy page
- [ ] User can request data deletion

---

#### US-038: Data Deletion

**Description**: As a candidate, I want to delete my data so that I control my information.

**Acceptance Criteria**:

- [ ] Delete account option in settings
- [ ] Deletes: profile, assessments, recordings, CV
- [ ] Confirmation required
- [ ] Soft delete with grace period or hard delete

---

## Functional Requirements

1. The system shall authenticate users via Google OAuth or email/password
2. The system shall conduct a 20-minute HR interview via Gemini Live voice
3. The system shall display a Slack-like interface for coworker communication
4. The system shall support text chat (Gemini Flash) and voice calls (Gemini Live) with coworkers
5. The system shall maintain conversation memory across all coworker interactions within an assessment
6. The system shall record the user's screen throughout the work phase
7. The system shall block progress if screen sharing is stopped
8. The system shall analyze screen recordings incrementally during the session
9. The system shall accept a GitHub PR URL as the final deliverable
10. The system shall run CI tests and AI code review on submitted PRs
11. The system shall generate assessment reports covering 8 skill categories
12. The system shall send assessment reports via email
13. The system shall track assessment time without displaying it to the user
14. The system shall allow unlimited assessment retries with history tracking
15. The system shall delete submitted PRs after assessment completion
16. The system shall provide an admin panel for conversational scenario creation
17. The system shall enforce role-based access for admin features

## Non-Goals

- Mobile assessment support (landing page only is responsive)
- Real-time coworker awareness of candidate's screen (coworkers only know what candidate tells them)
- Hard time limits or blocking failures during assessment
- Public profiles or shareable certifications (future feature)
- Multiple scenarios at launch (one scenario for MVP)
- Internationalization (English only)
- Strict anti-cheating measures (trust-based for B2C)
- Company/B2B features (post-MVP)
- Scenario selection UI (auto-start single scenario)

## Technical Considerations

### Stack

- **Frontend**: Next.js + React
- **Backend**: Next.js API routes (Node)
- **Database**: Supabase Postgres
- **Auth**: NextAuth with Supabase adapter (port from Skillvee)
- **Hosting**: Vercel
- **AI**: Gemini Live (voice), Gemini Flash (text chat), Gemini Pro (analysis)
- **Storage**: Supabase Storage (CVs, recordings)
- **Email**: Transactional email service (Resend/SendGrid)

### Code Reuse

- Port Gemini Live client from existing Skillvee codebase
- Port auth configuration from existing Skillvee codebase
- Use existing neo-brutalist design system

### Key Technical Challenges

1. **Screen recording persistence**: Must handle page reloads, laptop sleep, reconnection
2. **Coworker memory**: Summarizing and injecting conversation history into AI context
3. **Recording analysis**: Processing video/screenshots with Gemini efficiently
4. **Real-time voice**: Gemini Live connection stability over 1-2 hour sessions
5. **PR cleanup**: GitHub API integration for automated PR deletion

### Browser Support

- Chrome, Firefox, Safari
- Screen recording APIs have varying support; may need polyfills/fallbacks

## Success Metrics

1. **Assessment completion rate**: >70% of users who start complete the full assessment
2. **Time to complete**: Average 1-2 hours (task sized for this with AI assistance)
3. **User satisfaction**: Qualitative feedback indicates experience feels realistic and valuable
4. **Organic growth**: Users mention/recommend the platform without prompting
5. **Report usefulness**: Users report assessment feedback is actionable

## Appendix: Skill Assessment Categories

| Category                  | What it measures                                      |
| ------------------------- | ----------------------------------------------------- |
| Communication             | Asking good questions, clarity in calls, articulation |
| Problem Decomposition     | Breaking down the task, planning approach             |
| AI Leverage               | Frequency, quality of prompting, appropriate reliance |
| Code Quality              | Clean, tested, maintainable, secure code              |
| XFN Collaboration         | Engaging the right coworkers, gathering context       |
| Time Management           | Pacing, prioritization, efficiency                    |
| Technical Decision-Making | Architecture choices, tradeoffs                       |
| Presentation/Defense      | Explaining decisions in final meeting                 |
