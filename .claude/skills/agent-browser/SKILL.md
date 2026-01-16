---
name: agent-browser
description: Browser automation and visual testing using agent-browser CLI. Use this skill for E2E testing, taking screenshots, interacting with web pages, and visual regression testing.
---

# Agent-Browser Skill

Headless browser automation CLI for visual testing, E2E testing, and web interactions.

## Prerequisites

Installed globally via `npm install -g agent-browser` with Chromium downloaded via `agent-browser install`.

## Core Commands

### Navigation & Screenshots
```bash
# Open a URL
agent-browser open "https://example.com"

# Take screenshot
agent-browser screenshot ./screenshots/page.png

# Save as PDF
agent-browser pdf ./output.pdf

# Get accessibility tree (best for AI understanding)
agent-browser snapshot
```

### Interactions
```bash
# Click element (use @ref from snapshot, or CSS selector)
agent-browser click "@ref123"
agent-browser click "button.submit"

# Type into input
agent-browser type "input[name=email]" "user@example.com"

# Fill (clears first)
agent-browser fill "#search" "query text"

# Select dropdown
agent-browser select "#country" "US"

# Check/uncheck
agent-browser check "#terms"
agent-browser uncheck "#newsletter"

# Wait for element or time
agent-browser wait "#loading"
agent-browser wait 2000
```

### Get Information
```bash
agent-browser get text ".message"
agent-browser get html "#content"
agent-browser get value "input#email"
agent-browser get attr "href" "a.link"
agent-browser get title
agent-browser get url
```

### Check State
```bash
agent-browser is visible ".modal"
agent-browser is enabled "button.submit"
agent-browser is checked "#remember-me"
```

## Visual Testing Workflow

1. **Capture baseline screenshots** before changes:
   ```bash
   agent-browser open "http://localhost:3000"
   agent-browser screenshot ./baseline/home.png
   ```

2. **After changes, capture new screenshots**:
   ```bash
   agent-browser open "http://localhost:3000"
   agent-browser screenshot ./current/home.png
   ```

3. **Compare visually** or use image diff tools

## E2E Test Example

```bash
# Login flow test
agent-browser open "http://localhost:3000/login"
agent-browser fill "#email" "test@example.com"
agent-browser fill "#password" "password123"
agent-browser click "button[type=submit]"
agent-browser wait ".dashboard"
agent-browser screenshot ./tests/login-success.png
```

## Tips

- Use `snapshot` to get accessibility tree with element references (@ref) - more reliable than CSS selectors
- Screenshots help verify visual state during automated tests
- Chain commands in shell scripts for full test flows
- Use `--session` flag for isolated browser instances
