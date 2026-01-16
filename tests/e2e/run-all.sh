#!/bin/bash
# E2E Test Runner
# Runs all E2E tests and reports results

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════╗"
echo "║      SKILLVEE E2E TEST SUITE             ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
export BASE_URL

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
FAILED_TEST_NAMES=""

# Test files to run (in order)
TEST_FILES=(
  "create-account.sh"
  "login.sh"
  "logout.sh"
  "assessment-start.sh"
  "coworker-directory.sh"
)

# Check if server is running
check_server() {
  echo -e "${YELLOW}Checking if server is running at $BASE_URL...${NC}"
  if curl -s --head "$BASE_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}Server is running${NC}"
    return 0
  else
    echo -e "${RED}Server is not running at $BASE_URL${NC}"
    echo "Please start the dev server with: npm run dev"
    return 1
  fi
}

# Run a single test
run_test() {
  local test_file="$1"
  local test_name="${test_file%.sh}"

  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Running: $test_name${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  ((TOTAL_TESTS++))

  # Create unique session for this test
  export TEST_SESSION="e2e-$test_name-$$"

  if bash "$SCRIPT_DIR/$test_file"; then
    echo -e "${GREEN}✓ $test_name passed${NC}"
    ((PASSED_TESTS++))
    return 0
  else
    echo -e "${RED}✗ $test_name failed${NC}"
    ((FAILED_TESTS++))
    FAILED_TEST_NAMES="$FAILED_TEST_NAMES\n  - $test_name"
    return 1
  fi
}

# Main execution
main() {
  # Check server first
  if ! check_server; then
    exit 1
  fi

  # Create screenshots directory
  mkdir -p "$SCRIPT_DIR/screenshots"

  # Run all tests
  for test_file in "${TEST_FILES[@]}"; do
    if [ -f "$SCRIPT_DIR/$test_file" ]; then
      run_test "$test_file" || true
    else
      echo -e "${YELLOW}Warning: Test file not found: $test_file${NC}"
    fi
  done

  # Print final summary
  echo ""
  echo -e "${BLUE}╔══════════════════════════════════════════╗"
  echo -e "║           FINAL TEST SUMMARY             ║"
  echo -e "╚══════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "Total tests: $TOTAL_TESTS"
  echo -e "Passed:      ${GREEN}$PASSED_TESTS${NC}"
  echo -e "Failed:      ${RED}$FAILED_TESTS${NC}"

  if [ $FAILED_TESTS -gt 0 ]; then
    echo -e "\n${RED}Failed tests:${NC}${FAILED_TEST_NAMES}"
    echo ""
    echo -e "${RED}E2E tests failed${NC}"
    exit 1
  else
    echo ""
    echo -e "${GREEN}All E2E tests passed!${NC}"
    exit 0
  fi
}

# Handle arguments
case "${1:-}" in
  --help|-h)
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --help, -h     Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  BASE_URL       Server URL (default: http://localhost:3000)"
    echo ""
    echo "Test files:"
    for test in "${TEST_FILES[@]}"; do
      echo "  - ${test%.sh}"
    done
    exit 0
    ;;
  *)
    main
    ;;
esac
