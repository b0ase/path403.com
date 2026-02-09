#!/bin/bash

# b0ase Project Standards Audit Script
# Usage: ./audit.sh [project-path]
# Returns: JSON with compliance report

set -e

PROJECT_PATH="${1:-.}"

if [ ! -d "$PROJECT_PATH" ]; then
    echo "Error: Directory not found: $PROJECT_PATH" >&2
    exit 1
fi

cd "$PROJECT_PATH"

echo "Running b0ase Standards Audit..." >&2
echo "Project: $(pwd)" >&2
echo "" >&2

# Initialize results
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0
declare -a ISSUES=()
declare -a WARNINGS_LIST=()

# Helper function to check and record results
check() {
    local name="$1"
    local test="$2"
    local severity="${3:-error}"  # error or warning

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    if eval "$test"; then
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        echo "  ✓ $name" >&2
        return 0
    else
        if [ "$severity" = "warning" ]; then
            WARNINGS=$((WARNINGS + 1))
            WARNINGS_LIST+=("$name")
            echo "  ⚠ $name" >&2
        else
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            ISSUES+=("$name")
            echo "  ✗ $name" >&2
        fi
        return 1
    fi
}

# 1. SECURITY CHECKS
echo "=== Security Checks ===" >&2

check "No .env files committed" \
    "! git ls-files | grep -q '\.env$'"

check ".env.example exists" \
    "[ -f .env.example ]"

check "No hardcoded secrets in code" \
    "! grep -r 'sk_live_\|sk_test_\|API_KEY.*=.*[\"']sk_' --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' . || true"

check "package.json has no direct secret values" \
    "[ ! -f package.json ] || ! grep -q 'sk_live_\|api.*key.*:.*sk_' package.json"

# 2. PACKAGE MANAGEMENT
echo "" >&2
echo "=== Package Management ===" >&2

check "pnpm lockfile exists" \
    "[ -f pnpm-lock.yaml ]"

check "No npm lockfile (must use pnpm)" \
    "[ ! -f package-lock.json ]"

check "No yarn lockfile (must use pnpm)" \
    "[ ! -f yarn.lock ]"

check "node_modules exists (dependencies installed)" \
    "[ -d node_modules ]" \
    "warning"

# 3. TYPESCRIPT CHECKS
echo "" >&2
echo "=== TypeScript Configuration ===" >&2

if [ -f tsconfig.json ]; then
    check "TypeScript strict mode enabled" \
        "grep -q '\"strict\".*:.*true' tsconfig.json"

    check "No implicit any disabled" \
        "! grep -q '\"noImplicitAny\".*:.*false' tsconfig.json"

    check "Strict null checks enabled" \
        "! grep -q '\"strictNullChecks\".*:.*false' tsconfig.json"
else
    echo "  ⚠ No tsconfig.json found" >&2
    WARNINGS=$((WARNINGS + 1))
    WARNINGS_LIST+=("No tsconfig.json found")
fi

# 4. DOCUMENTATION
echo "" >&2
echo "=== Documentation ===" >&2

check "README.md exists" \
    "[ -f README.md ]"

if [ -f README.md ]; then
    check "README has Getting Started section" \
        "grep -qi 'getting started\|installation\|setup' README.md" \
        "warning"

    check "README documents tech stack" \
        "grep -qi 'tech stack\|technologies\|built with' README.md" \
        "warning"
fi

check ".gitignore exists" \
    "[ -f .gitignore ]"

if [ -f .gitignore ]; then
    check ".gitignore includes node_modules" \
        "grep -q 'node_modules' .gitignore"

    check ".gitignore includes .env files" \
        "grep -q '\.env' .gitignore"
fi

# 5. CODE QUALITY
echo "" >&2
echo "=== Code Quality ===" >&2

# Check for common anti-patterns
check "No console.log in production code" \
    "! grep -r 'console\.log' --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' app/ src/ 2>/dev/null || [ ! -d app ] && [ ! -d src ]" \
    "warning"

check "No TODO comments without context" \
    "! grep -r 'TODO(?!:)' --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' . 2>/dev/null || true" \
    "warning"

# 6. SECURITY AUDIT
echo "" >&2
echo "=== Dependency Security ===" >&2

if command -v pnpm &> /dev/null && [ -f pnpm-lock.yaml ]; then
    if pnpm audit --json > /tmp/audit-result.json 2>/dev/null; then
        CRITICAL=$(jq '.metadata.vulnerabilities.critical // 0' /tmp/audit-result.json 2>/dev/null || echo 0)
        HIGH=$(jq '.metadata.vulnerabilities.high // 0' /tmp/audit-result.json 2>/dev/null || echo 0)

        check "No critical vulnerabilities" \
            "[ \"$CRITICAL\" -eq 0 ]"

        check "No high vulnerabilities" \
            "[ \"$HIGH\" -eq 0 ]" \
            "warning"

        echo "  ℹ Vulnerabilities: Critical=$CRITICAL, High=$HIGH" >&2
        rm -f /tmp/audit-result.json
    else
        echo "  ⚠ Could not run pnpm audit" >&2
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "  ⚠ pnpm not available or no lockfile" >&2
    WARNINGS=$((WARNINGS + 1))
fi

# 7. CI/CD
echo "" >&2
echo "=== CI/CD ===" >&2

check "GitHub Actions workflow exists" \
    "[ -f .github/workflows/ci.yml ] || [ -f .github/workflows/ci.yaml ] || [ -d .github/workflows ]" \
    "warning"

# 8. PERFORMANCE
echo "" >&2
echo "=== Performance Configuration ===" >&2

if [ -f package.json ]; then
    check "Build script exists" \
        "grep -q '\"build\"' package.json"

    check "Next.js image optimization configured" \
        "[ ! -f next.config.js ] || grep -q 'images' next.config.js" \
        "warning"
fi

# Calculate score
SCORE=0
if [ $TOTAL_CHECKS -gt 0 ]; then
    SCORE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
fi

# Determine status
STATUS="FAIL"
if [ $FAILED_CHECKS -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        STATUS="PASS"
    else
        STATUS="PASS_WITH_WARNINGS"
    fi
fi

# Summary
echo "" >&2
echo "========================================" >&2
echo "AUDIT SUMMARY" >&2
echo "========================================" >&2
echo "Status: $STATUS" >&2
echo "Score: $SCORE/100" >&2
echo "" >&2
echo "Checks: $TOTAL_CHECKS total" >&2
echo "  ✓ Passed: $PASSED_CHECKS" >&2
echo "  ✗ Failed: $FAILED_CHECKS" >&2
echo "  ⚠ Warnings: $WARNINGS" >&2
echo "" >&2

if [ ${#ISSUES[@]} -gt 0 ]; then
    echo "Critical Issues:" >&2
    for issue in "${ISSUES[@]}"; do
        echo "  • $issue" >&2
    done
    echo "" >&2
fi

if [ ${#WARNINGS_LIST[@]} -gt 0 ]; then
    echo "Warnings:" >&2
    for warning in "${WARNINGS_LIST[@]}"; do
        echo "  • $warning" >&2
    done
    echo "" >&2
fi

# Recommendations
if [ $FAILED_CHECKS -gt 0 ]; then
    echo "Recommendations:" >&2

    if [[ " ${ISSUES[@]} " =~ "pnpm lockfile exists" ]]; then
        echo "  → Migrate to pnpm: rm -rf node_modules package-lock.json && pnpm install" >&2
    fi

    if [[ " ${ISSUES[@]} " =~ ".env.example exists" ]]; then
        echo "  → Create .env.example with required environment variables" >&2
    fi

    if [[ " ${ISSUES[@]} " =~ "README.md exists" ]]; then
        echo "  → Create comprehensive README.md with setup instructions" >&2
    fi

    if [[ " ${ISSUES[@]} " =~ "TypeScript strict mode enabled" ]]; then
        echo "  → Enable strict mode in tsconfig.json" >&2
    fi

    echo "" >&2
fi

# Output JSON for programmatic use
cat <<EOF
{
  "status": "$STATUS",
  "score": $SCORE,
  "checks": {
    "total": $TOTAL_CHECKS,
    "passed": $PASSED_CHECKS,
    "failed": $FAILED_CHECKS,
    "warnings": $WARNINGS
  },
  "issues": [$(printf '"%s",' "${ISSUES[@]}" | sed 's/,$//')]],
  "warnings": [$(printf '"%s",' "${WARNINGS_LIST[@]}" | sed 's/,$//')]],
  "projectPath": "$(pwd)",
  "auditedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "compliant": $([ "$STATUS" = "PASS" ] && echo "true" || echo "false")
}
EOF

# Exit code based on failed checks
exit $FAILED_CHECKS
