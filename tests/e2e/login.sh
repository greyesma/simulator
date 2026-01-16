#!/bin/bash
# E2E Test: Login Flow
# Tests the sign-in functionality

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/helpers.sh"

echo ""
echo "=================================="
echo "  TEST: Login Flow"
echo "=================================="
echo ""

# First, create an account to test login with
TEST_EMAIL="e2e-login-$(date +%s)@example.com"

log_info "Setting up: Creating test account with email: $TEST_EMAIL"

# Create account first
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

# Now test login
log_info "Navigating to sign-in page..."
open_url "$BASE_URL/sign-in"
sleep 2

# Step 1: Verify sign-in page loaded
log_info "Verifying sign-in page loaded..."
wait_for "#email" 5000

if is_visible "#email" && is_visible "#password"; then
  log_success "Sign-in page loaded with email and password fields"
else
  log_error "Sign-in page did not load correctly"
  take_screenshot "login-page-not-loaded"
fi

# Step 2: Fill in login form
log_info "Filling in login form..."

fill_field "#email" "$TEST_EMAIL"
sleep 0.5

fill_field "#password" "$TEST_USER_PASSWORD"
sleep 0.5

take_screenshot "login-form-filled"

# Step 3: Submit the form
log_info "Submitting login form..."
click "button[type='submit']"
sleep 3

# Step 4: Check for successful login (redirect to home or callback URL)
current_url=$(get_url)
log_info "Current URL after login: $current_url"

if echo "$current_url" | grep -qE "^${BASE_URL}/?$"; then
  log_success "Login successful - redirected to home page"
elif echo "$current_url" | grep -q "profile"; then
  log_success "Login successful - redirected to profile page"
elif echo "$current_url" | grep -q "sign-in"; then
  # Still on sign-in page - check for error
  take_screenshot "login-failed"

  error_msg=$(agent-browser eval "document.querySelector('.border-destructive')?.innerText || ''" --session "$TEST_SESSION" 2>/dev/null)
  if [ -n "$error_msg" ]; then
    log_error "Login failed with error: $error_msg"
  else
    log_error "Login failed - still on sign-in page"
  fi
else
  log_success "Login successful - redirected to: $current_url"
fi

take_screenshot "login-result"

# Print summary
print_summary
