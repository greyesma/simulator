#!/bin/bash
# E2E Test: Logout Flow
# Tests the sign-out functionality

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/helpers.sh"

echo ""
echo "=================================="
echo "  TEST: Logout Flow"
echo "=================================="
echo ""

# First, create an account and login
TEST_EMAIL="e2e-logout-$(date +%s)@example.com"

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

# Verify logged in
current_url=$(get_url)
if ! echo "$current_url" | grep -qE "(^${BASE_URL}/?$|profile)"; then
  log_error "Setup failed - could not log in"
  print_summary
  exit 1
fi

log_success "Setup complete - user is logged in"

# Step 1: Navigate to settings page where logout might be
log_info "Navigating to settings page..."
open_url "$BASE_URL/settings"
sleep 2

take_screenshot "logout-before"

# Step 2: Trigger logout via the signout API endpoint
log_info "Triggering logout..."
open_url "$BASE_URL/api/auth/signout"
sleep 2

# NextAuth shows a confirmation page, click the sign out button if present
if is_visible "button[type='submit']" 2>/dev/null; then
  log_info "Clicking sign out confirmation button..."
  click "button[type='submit']"
  sleep 2
fi

take_screenshot "logout-after-signout"

# Step 3: Verify user is logged out by trying to access protected page
log_info "Verifying logout by accessing protected page..."
open_url "$BASE_URL/profile"
sleep 2

current_url=$(get_url)
log_info "Current URL after accessing profile: $current_url"

if echo "$current_url" | grep -q "sign-in"; then
  log_success "Logout successful - redirected to sign-in when accessing protected page"
else
  # Check if still on profile (meaning still logged in)
  if echo "$current_url" | grep -q "profile"; then
    log_error "Logout failed - still able to access profile page"
  else
    log_success "Logout successful - redirected to: $current_url"
  fi
fi

take_screenshot "logout-verification"

# Print summary
print_summary
