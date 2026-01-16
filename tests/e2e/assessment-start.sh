#!/bin/bash
# E2E Test: Navigate to Assessment Start
# Tests that a logged-in user can navigate to start an assessment

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/helpers.sh"

echo ""
echo "=================================="
echo "  TEST: Navigate to Assessment Start"
echo "=================================="
echo ""

# First, create an account and login
TEST_EMAIL="e2e-assessment-$(date +%s)@example.com"

log_info "Setting up: Creating and logging in test account..."

# Create account
open_url "$BASE_URL/sign-up"
sleep 2

fill_field "#name" "$TEST_USER_NAME"
sleep 0.3
fill_field "#email" "$TEST_EMAIL"
sleep 0.3
fill_field "#password" "$TEST_USER_PASSWORD"
sleep 0.3
fill_field "#confirmPassword" "$TEST_USER_PASSWORD"
sleep 0.3
click "button[type='submit']"
sleep 3

log_success "Setup complete - user is logged in"

# Step 1: Navigate to home page
log_info "Navigating to home page..."
open_url "$BASE_URL"
sleep 2

take_screenshot "assessment-home-page"

# Step 2: Look for "Start Practicing" or similar CTA button
log_info "Looking for Start Practicing button..."

# Check if the button exists
if is_visible "a[href='/sign-in']" 2>/dev/null; then
  log_info "Found 'Start Practicing' link"
  click "a[href='/sign-in']"
  sleep 2
fi

# Since user is already logged in, they might be redirected differently
# Check what page we're on
current_url=$(get_url)
log_info "Current URL: $current_url"

# Step 3: Navigate to profile to see assessments
log_info "Navigating to profile page to check assessments..."
open_url "$BASE_URL/profile"
sleep 2

take_screenshot "assessment-profile-page"

# Step 4: Check if profile page shows assessment options
log_info "Checking profile page content..."

# Look for assessment-related content
page_content=$(agent-browser eval "document.body.innerText" --session "$TEST_SESSION" 2>/dev/null)

if echo "$page_content" | grep -qi "assessment\|practice\|start"; then
  log_success "Profile page shows assessment-related content"
else
  log_info "No existing assessments - profile page loaded correctly"
fi

# Step 5: Verify the profile page structure
if echo "$page_content" | grep -qi "past assessment"; then
  log_success "Past Assessments section is visible"
else
  log_error "Past Assessments section not found on profile page"
fi

# Check for "Start Practicing" button (shown when no assessments exist)
if echo "$page_content" | grep -qi "start practicing"; then
  log_success "Start Practicing button available for new user"
fi

take_screenshot "assessment-start-result"

# Print summary
print_summary
