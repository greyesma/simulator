#!/bin/bash
# E2E Test Helpers
# Common utilities for agent-browser based E2E tests

# Configuration
export BASE_URL="${BASE_URL:-http://localhost:3000}"
export SCREENSHOT_DIR="./tests/e2e/screenshots"
export TEST_SESSION="${TEST_SESSION:-e2e-test-$$}"

# Test user credentials (use unique email per test run to avoid conflicts)
export TEST_USER_EMAIL="${TEST_USER_EMAIL:-e2e-test-$(date +%s)@example.com}"
export TEST_USER_PASSWORD="${TEST_USER_PASSWORD:-testpassword123}"
export TEST_USER_NAME="${TEST_USER_NAME:-E2E Test User}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Track test results
TESTS_PASSED=0
TESTS_FAILED=0
FAILED_TESTS=""

# Log functions
log_info() {
  echo -e "${YELLOW}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[PASS]${NC} $1"
  ((TESTS_PASSED++))
}

log_error() {
  echo -e "${RED}[FAIL]${NC} $1"
  ((TESTS_FAILED++))
  FAILED_TESTS="$FAILED_TESTS\n  - $1"
}

# Screenshot helper
take_screenshot() {
  local name="$1"
  mkdir -p "$SCREENSHOT_DIR"
  agent-browser screenshot "$SCREENSHOT_DIR/${name}.png" --session "$TEST_SESSION" --full 2>/dev/null
}

# Wait for element with timeout
wait_for() {
  local selector="$1"
  local timeout="${2:-10000}"
  agent-browser wait "$selector" --session "$TEST_SESSION" 2>/dev/null
  return $?
}

# Check if element is visible
is_visible() {
  local selector="$1"
  agent-browser is visible "$selector" --session "$TEST_SESSION" 2>/dev/null
  return $?
}

# Get text from element
get_text() {
  local selector="$1"
  agent-browser get text "$selector" --session "$TEST_SESSION" 2>/dev/null
}

# Open URL
open_url() {
  local url="$1"
  agent-browser open "$url" --session "$TEST_SESSION" 2>/dev/null
  sleep 1  # Give page time to load
}

# Fill form field
fill_field() {
  local selector="$1"
  local value="$2"
  agent-browser fill "$selector" "$value" --session "$TEST_SESSION" 2>/dev/null
}

# Click element
click() {
  local selector="$1"
  agent-browser click "$selector" --session "$TEST_SESSION" 2>/dev/null
}

# Type text (without clearing)
type_text() {
  local selector="$1"
  local value="$2"
  agent-browser type "$selector" "$value" --session "$TEST_SESSION" 2>/dev/null
}

# Press key
press_key() {
  local key="$1"
  agent-browser press "$key" --session "$TEST_SESSION" 2>/dev/null
}

# Get current URL
get_url() {
  agent-browser get url --session "$TEST_SESSION" 2>/dev/null
}

# Get page title
get_title() {
  agent-browser get title --session "$TEST_SESSION" 2>/dev/null
}

# Check if text exists on page
has_text() {
  local text="$1"
  local html=$(agent-browser eval "document.body.innerText" --session "$TEST_SESSION" 2>/dev/null)
  echo "$html" | grep -q "$text"
  return $?
}

# Close browser
close_browser() {
  agent-browser close --session "$TEST_SESSION" 2>/dev/null
}

# Assert function - check condition and log result
assert() {
  local condition="$1"
  local message="$2"
  local screenshot_name="$3"

  if eval "$condition"; then
    log_success "$message"
    return 0
  else
    log_error "$message"
    if [ -n "$screenshot_name" ]; then
      take_screenshot "FAIL-$screenshot_name"
    fi
    return 1
  fi
}

# Print test summary
print_summary() {
  echo ""
  echo "=================================="
  echo "        TEST SUMMARY"
  echo "=================================="
  echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
  echo -e "Failed: ${RED}$TESTS_FAILED${NC}"

  if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "\nFailed tests:${FAILED_TESTS}"
    return 1
  else
    echo -e "\n${GREEN}All tests passed!${NC}"
    return 0
  fi
}

# Cleanup function
cleanup() {
  log_info "Cleaning up..."
  close_browser
}

# Set trap for cleanup
trap cleanup EXIT
