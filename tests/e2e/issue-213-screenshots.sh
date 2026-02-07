#!/bin/bash
# Issue #213 Screenshots - Dark Slack-inspired theme verification
# Takes multiple screenshots showing the dark theme implementation

set -e

# Get the absolute path to the project directory
PROJECT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT_DIR"

source "tests/e2e/helpers.sh"

# Override screenshot directory to use main screenshots folder with absolute path
export SCREENSHOT_DIR="$PROJECT_DIR/screenshots"

# Use actual test user credentials as specified
export TEST_USER_EMAIL="user@test.com"
export TEST_USER_PASSWORD="testpassword123"

# Use unique session ID for this screenshot capture
export TEST_SESSION="issue-213-screenshots-$$"

log_info "Starting Issue #213 dark theme screenshot capture..."

# 1. Navigate to the work page
log_info "Opening work page URL..."
open_url "$BASE_URL/assessments/test-assessment-chat/work"

# Wait for the page to load and check if we need to login
sleep 2

# Check if we're redirected to login page
current_url=$(get_url)
if [[ "$current_url" == *"/auth/signin"* ]]; then
    log_info "Login required, signing in with test credentials..."

    # Fill login form
    fill_field "input[name='email']" "$TEST_USER_EMAIL"
    fill_field "input[name='password']" "$TEST_USER_PASSWORD"

    # Click sign in button
    click "button[type='submit']"

    # Wait for login to complete and redirect to work page
    sleep 3

    # Verify we're now on the work page
    current_url=$(get_url)
    if [[ "$current_url" != *"/work"* ]]; then
        log_error "Login failed or incorrect redirect"
        exit 1
    fi

    log_success "Login successful, now on work page"
else
    log_info "Already authenticated, proceeding with screenshots"
fi

# Wait for chat interface to load
wait_for "[data-testid='chat-interface']" 10000 || wait_for ".flex.h-full" 5000

# 2. Take overall dark theme interface screenshot
log_info "Taking overall dark theme interface screenshot..."
take_screenshot "issue-213-verification-1"

# 3. Click on a coworker to show selected state with blue border
log_info "Selecting a coworker to show blue border indicator..."

# Try to click on the first coworker in the list
click "button:has-text('Sarah Chen')" || click ".space-y-1 button:first-child" || click "[role='button']:first-child"
sleep 1

# Take screenshot showing selected coworker state
log_info "Taking screenshot of selected coworker with blue border..."
take_screenshot "issue-213-verification-2"

# 4. Try to click on another coworker to show different selected states
log_info "Selecting different coworker to show variation..."
click "button:has-text('Marcus Rodriguez')" || click ".space-y-1 button:nth-child(2)" || click "[role='button']:nth-child(2)"
sleep 1

# Take another screenshot with different selection
log_info "Taking screenshot with different coworker selected..."
take_screenshot "issue-213-verification-3"

# 5. Take a screenshot focusing on message bubbles and input area
log_info "Taking screenshot of message area and input styling..."
take_screenshot "issue-213-verification-4"

# 6. Try to interact with the chat to show more UI elements
log_info "Attempting to interact with chat input..."
if is_visible "textarea" || is_visible "input[type='text']:not([name='email']):not([name='password'])"; then
    # Click in chat input area to focus it
    click "textarea" || click "input[type='text']:not([name='email']):not([name='password'])"
    sleep 0.5

    # Type a test message to show input styling
    type_text "textarea" "Test message to verify dark theme input styling" || type_text "input[type='text']:not([name='email']):not([name='password'])" "Test message"
    sleep 1

    # Take screenshot showing focused input
    log_info "Taking screenshot with focused input area..."
    take_screenshot "issue-213-verification-5"
fi

log_success "Screenshots completed successfully!"
log_info "Screenshots saved to: $SCREENSHOT_DIR/"
log_info "Files created:"
log_info "  - issue-213-verification-1.png (Overall interface)"
log_info "  - issue-213-verification-2.png (Selected coworker #1)"
log_info "  - issue-213-verification-3.png (Selected coworker #2)"
log_info "  - issue-213-verification-4.png (Message area)"
log_info "  - issue-213-verification-5.png (Input area focused)"

print_summary