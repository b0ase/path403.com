#!/bin/bash

# b0ase.com Health Check Script
# Comprehensive automated health check for the b0ase.com project
# Usage: bash .claude/skills/health-check/scripts/check.sh [--quick]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Quick mode flag
QUICK_MODE=false
if [[ "$1" == "--quick" ]]; then
  QUICK_MODE=true
fi

# Report variables
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# Array to store failures
declare -a FAILURES
declare -a WARNINGS

# Helper functions
print_header() {
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

run_check() {
  local name="$1"
  local command="$2"
  local severity="${3:-error}" # error or warning

  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  echo -n "  Checking $name... "

  if eval "$command" >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    return 0
  else
    if [[ "$severity" == "warning" ]]; then
      echo -e "${YELLOW}⚠${NC}"
      WARNINGS+=("$name")
      WARNING_CHECKS=$((WARNING_CHECKS + 1))
    else
      echo -e "${RED}✗${NC}"
      FAILURES+=("$name")
      FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
    return 1
  fi
}

# Start health check
print_header "b0ase.com Health Check"
echo "Started at: $(date)"
if $QUICK_MODE; then
  echo -e "${YELLOW}Running in QUICK mode (subset of checks)${NC}"
fi

# 1. Security Checks
print_header "1. Security Checks"

# Check for pnpm (required for audit)
if command -v pnpm &> /dev/null; then
  echo "  Running pnpm audit..."

  # Run audit and capture output
  if pnpm audit --audit-level=high > /tmp/health-check-audit.log 2>&1; then
    echo -e "  ${GREEN}✓${NC} No high/critical vulnerabilities found"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
  else
    # Check if there are actual vulnerabilities or just warnings
    if grep -q "found 0 vulnerabilities" /tmp/health-check-audit.log; then
      echo -e "  ${GREEN}✓${NC} No vulnerabilities found"
      PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
      echo -e "  ${RED}✗${NC} High/critical vulnerabilities found"
      FAILURES+=("Security vulnerabilities detected")
      FAILED_CHECKS=$((FAILED_CHECKS + 1))

      # Show summary
      grep -E "(high|critical)" /tmp/health-check-audit.log | head -5
    fi
  fi
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
else
  echo -e "  ${YELLOW}⚠${NC} pnpm not found, skipping audit"
  WARNING_CHECKS=$((WARNING_CHECKS + 1))
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
fi

# Check for secrets in code (common patterns)
run_check "no hardcoded API keys" "! grep -r -E 'sk_live_|pk_live_|api[_-]?key.*=.*[\"'\''][A-Za-z0-9]{20}' app/ lib/ --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' 2>/dev/null"

# Check for .env file (should not be committed)
run_check ".env not in git" "! git ls-files | grep -q '^\.env$'" "warning"

# Check if security scan script exists and run it
if [[ -f ".claude/skills/security-check/scripts/scan.sh" ]]; then
  run_check "security scan passes" "bash .claude/skills/security-check/scripts/scan.sh . --silent"
fi

# 2. Code Quality Checks
if ! $QUICK_MODE; then
  print_header "2. Code Quality Checks"

  # Check for package-lock.json (should use pnpm)
  run_check "no package-lock.json" "! test -f package-lock.json"

  # Check for pnpm-lock.yaml
  run_check "pnpm-lock.yaml exists" "test -f pnpm-lock.yaml"

  # TypeScript strict mode check
  if [[ -f "tsconfig.json" ]]; then
    run_check "TypeScript strict mode" "grep -q '\"strict\".*:.*true' tsconfig.json"
  fi

  # Check for console.log in source files
  run_check "no console.log in app/" "! grep -r 'console\.log' app/ --include='*.ts' --include='*.tsx' 2>/dev/null" "warning"

  # Run standards audit if available
  if [[ -f ".claude/skills/b0ase-standards/scripts/audit.sh" ]]; then
    run_check "standards audit passes" "bash .claude/skills/b0ase-standards/scripts/audit.sh . --silent"
  fi
fi

# 3. Build & Type Checks
print_header "3. Build & Type Checks"

# Check if node_modules exists
if [[ ! -d "node_modules" ]]; then
  echo -e "  ${YELLOW}⚠${NC} node_modules not found, running pnpm install..."
  pnpm install
fi

# TypeScript type check
if command -v tsc &> /dev/null && [[ -f "tsconfig.json" ]]; then
  run_check "TypeScript type check" "npx tsc --noEmit"
else
  echo -e "  ${YELLOW}⚠${NC} TypeScript not configured, skipping type check"
fi

# Build check (only in full mode, can be slow)
if ! $QUICK_MODE; then
  if grep -q '"build"' package.json 2>/dev/null; then
    echo "  Running build (this may take a while)..."
    if pnpm build > /tmp/health-check-build.log 2>&1; then
      echo -e "  ${GREEN}✓${NC} Build successful"
      PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
      echo -e "  ${RED}✗${NC} Build failed"
      FAILURES+=("Build failed")
      FAILED_CHECKS=$((FAILED_CHECKS + 1))
      echo "  Last 10 lines of build output:"
      tail -10 /tmp/health-check-build.log | sed 's/^/    /'
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  fi
fi

# 4. Test Checks
if ! $QUICK_MODE; then
  print_header "4. Test Checks"

  if grep -q '"test"' package.json 2>/dev/null; then
    echo "  Running tests..."
    if pnpm test > /tmp/health-check-test.log 2>&1; then
      echo -e "  ${GREEN}✓${NC} All tests passed"
      PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
      echo -e "  ${YELLOW}⚠${NC} Some tests failed"
      WARNINGS+=("Test failures")
      WARNING_CHECKS=$((WARNING_CHECKS + 1))
      echo "  Last 10 lines of test output:"
      tail -10 /tmp/health-check-test.log | sed 's/^/    /'
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  else
    echo -e "  ${YELLOW}⚠${NC} No test script found in package.json"
  fi
fi

# 5. Documentation Checks
if ! $QUICK_MODE; then
  print_header "5. Documentation Checks"

  run_check "README.md exists" "test -f README.md"
  run_check "CLAUDE.md exists" "test -f CLAUDE.md"
  run_check ".env.example exists" "test -f .env.example" "warning"

  # Check if README was updated recently (within 90 days)
  if [[ -f "README.md" ]]; then
    readme_age=$(( ($(date +%s) - $(stat -f %m README.md 2>/dev/null || stat -c %Y README.md)) / 86400 ))
    if [[ $readme_age -lt 90 ]]; then
      run_check "README.md updated recently" "true"
    else
      run_check "README.md updated recently (<90 days)" "false" "warning"
    fi
  fi
fi

# 6. Environment Checks
print_header "6. Environment Checks"

# Check for required environment variables
if [[ -f ".env.example" ]]; then
  echo "  Checking environment variables..."
  missing_vars=0
  while IFS= read -r line; do
    if [[ $line =~ ^([A-Z_]+)= ]]; then
      var_name="${BASH_REMATCH[1]}"
      if [[ -z "${!var_name}" ]] && ! grep -q "^${var_name}=" .env 2>/dev/null; then
        if [[ $missing_vars -eq 0 ]]; then
          echo -e "  ${YELLOW}⚠${NC} Missing environment variables:"
        fi
        echo "    - $var_name"
        missing_vars=$((missing_vars + 1))
      fi
    fi
  done < .env.example

  if [[ $missing_vars -eq 0 ]]; then
    echo -e "  ${GREEN}✓${NC} All required environment variables set"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
  else
    WARNINGS+=("$missing_vars environment variables not set")
    WARNING_CHECKS=$((WARNING_CHECKS + 1))
  fi
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
fi

# 7. Git Checks
print_header "7. Git Checks"

run_check "clean working directory" "test -z \"\$(git status --porcelain)\"" "warning"
run_check "on a git branch" "git rev-parse --abbrev-ref HEAD >/dev/null 2>&1"

# Summary
print_header "Health Check Summary"

echo ""
echo "  Total Checks: $TOTAL_CHECKS"
echo -e "  ${GREEN}Passed: $PASSED_CHECKS${NC}"
if [[ $WARNING_CHECKS -gt 0 ]]; then
  echo -e "  ${YELLOW}Warnings: $WARNING_CHECKS${NC}"
fi
if [[ $FAILED_CHECKS -gt 0 ]]; then
  echo -e "  ${RED}Failed: $FAILED_CHECKS${NC}"
fi

# List failures
if [[ ${#FAILURES[@]} -gt 0 ]]; then
  echo ""
  echo -e "${RED}Failed Checks:${NC}"
  for failure in "${FAILURES[@]}"; do
    echo -e "  ${RED}✗${NC} $failure"
  done
fi

# List warnings
if [[ ${#WARNINGS[@]} -gt 0 ]]; then
  echo ""
  echo -e "${YELLOW}Warnings:${NC}"
  for warning in "${WARNINGS[@]}"; do
    echo -e "  ${YELLOW}⚠${NC} $warning"
  done
fi

echo ""
echo "Completed at: $(date)"
echo ""

# Exit code
if [[ $FAILED_CHECKS -gt 0 ]]; then
  echo -e "${RED}❌ Health check FAILED${NC}"
  echo ""
  exit 1
elif [[ $WARNING_CHECKS -gt 0 ]]; then
  echo -e "${YELLOW}⚠️  Health check passed with WARNINGS${NC}"
  echo ""
  exit 0
else
  echo -e "${GREEN}✅ Health check PASSED${NC}"
  echo ""
  exit 0
fi
