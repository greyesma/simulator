#!/bin/bash
# E2E Test: Create Account Flow
# Tests the sign-up functionality

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/helpers.sh"

echo ""
echo "=================================="
echo "  TEST: Create Account Flow"
echo "=================================="
echo ""

# Use unique email for this test
TEST_EMAIL="e2e-create-$(date +%s)@example.com"

log_info "Starting create account test with email: $TEST_EMAIL"

# Step 1: Navigate to sign-up page
log_info "Navigating to sign-up page..."
open_url "$BASE_URL/sign-up"
sleep 2

# Step 2: Verify sign-up page loaded
log_info "Verifying sign-up page loaded..."
wait_for "h1" 5000

page_title=$(get_title)
if echo "$page_title" | grep -qi "skillvee"; then
  log_success "Sign-up page loaded correctly"
else
  log_error "Sign-up page did not load (title: $page_title)"
  take_screenshot "create-account-page-not-loaded"
fi

# Step 3: Fill in the sign-up form
log_info "Filling in sign-up form..."

# Fill name (optional field)
fill_field "#name" "$TEST_USER_NAME"
sleep 0.5

# Fill email
fill_field "#email" "$TEST_EMAIL"
sleep 0.5

# Fill password
fill_field "#password" "$TEST_USER_PASSWORD"
sleep 0.5

# Fill confirm password
fill_field "#confirmPassword" "$TEST_USER_PASSWORD"
sleep 0.5

take_screenshot "create-account-form-filled"

# Step 4: Submit the form
log_info "Submitting sign-up form..."
click "button[type='submit']"
sleep 3

# Step 5: Check for success (redirect to home or profile)
current_url=$(get_url)
log_info "Current URL after submit: $current_url"

# After successful registration, user should be redirected to home page
if echo "$current_url" | grep -qE "^${BASE_URL}/?$"; then
  log_success "Account created and redirected to home page"
elif echo "$current_url" | grep -q "profile"; then
  log_success "Account created and redirected to profile page"
elif echo "$current_url" | grep -q "sign-up"; then
  # Still on sign-up page - check for error
  take_screenshot "create-account-still-on-signup"

  # Check if there's an error message (e.g., email already exists)
  if agent-browser eval "document.querySelector('.border-destructive')?.innerText || ''" --session "$TEST_SESSION" 2>/dev/null | grep -q .; then
    error_msg=$(agent-browser eval "document.querySelector('.border-destructive')?.innerText || 'Unknown error'" --session "$TEST_SESSION" 2>/dev/null)
    log_error "Account creation failed with error: $error_msg"
  else
    log_error "Account creation failed - still on sign-up page"
  fi
else
  log_success "Account created - redirected to: $current_url"
fi

take_screenshot "create-account-result"

# Print summary
print_summary
