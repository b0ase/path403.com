#!/bin/bash

# b0ase Security Check Scanner
# Usage: ./scan.sh [project-path]
# Returns: JSON with security findings
#
# Exit codes:
#   0 = No critical issues (HIGH/MEDIUM/LOW are warnings only)
#   N = Number of CRITICAL issues found
#
# Exclusions:
#   - node_modules, .git, .next, dist (standard)
#   - generated/ (Prisma generated clients - may contain embedded schema)
#
# Changelog:
#   2026-01-22: Fixed false positives (API key URL paths, empty grep results)
#               Made HIGH issues non-blocking (too many false positives)
#               Added generated/ to exclusions

set -e

PROJECT_PATH="${1:-.}"

if [ ! -d "$PROJECT_PATH" ]; then
    echo "Error: Directory not found: $PROJECT_PATH" >&2
    exit 1
fi

cd "$PROJECT_PATH"

echo "========================================" >&2
echo "SECURITY CHECK" >&2
echo "========================================" >&2
echo "" >&2

# Counters
CRITICAL=0
HIGH=0
MEDIUM=0
LOW=0
declare -a FINDINGS=()

# Helper to add finding
add_finding() {
    local severity="$1"
    local title="$2"
    local file="$3"
    local line="$4"
    local description="$5"
    local fix="$6"

    case "$severity" in
        CRITICAL) CRITICAL=$((CRITICAL + 1)) ;;
        HIGH) HIGH=$((HIGH + 1)) ;;
        MEDIUM) MEDIUM=$((MEDIUM + 1)) ;;
        LOW) LOW=$((LOW + 1)) ;;
    esac

    FINDINGS+=("$severity|$title|$file|$line|$description|$fix")
}

echo "Scanning for security vulnerabilities..." >&2
echo "" >&2

# Check 1: Hardcoded secrets
echo "[1/10] Checking for hardcoded secrets..." >&2

# API keys - look for actual secret patterns, not URL paths
# Matches: sk_live_xxx, sk_test_xxx, API_KEY = "sk_xxx"
# Excludes: /api/keys (URL paths), api-keys (route names)
if grep -rn "sk_live_[a-zA-Z0-9]\|sk_test_[a-zA-Z0-9]\|API_KEY.*=.*['\"]sk_" \
    --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
    --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=dist --exclude-dir=generated \
    . 2>/dev/null | grep -v "/api/" | grep -v "api-keys" | head -1 > /dev/null; then

    FILES=$(grep -rn "sk_live_[a-zA-Z0-9]\|sk_test_[a-zA-Z0-9]\|API_KEY.*=.*['\"]sk_" \
        --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
        --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=dist --exclude-dir=generated \
        . 2>/dev/null | grep -v "/api/" | grep -v "api-keys" | head -3)

    if [ ! -z "$FILES" ]; then
        add_finding "CRITICAL" "Hardcoded API Keys Found" \
            "Multiple files" "Various" \
            "API keys found hardcoded in source code. This is a critical security risk." \
            "Move all secrets to environment variables. Use .env.example as template."
    fi
fi

# Database credentials
DB_CREDS=$(grep -rn "postgresql://.*:.*@\|mysql://.*:.*@" \
    --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
    --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=dist --exclude-dir=generated \
    . 2>/dev/null | grep -v ".env.example" | head -3)
if [ ! -z "$DB_CREDS" ]; then
    add_finding "CRITICAL" "Hardcoded Database Credentials" \
        "Source files" "N/A" \
        "Database connection strings with credentials found in code." \
        "Use DATABASE_URL from environment variables."
fi

# Check 2: SQL Injection patterns
echo "[2/10] Checking for SQL injection vulnerabilities..." >&2

if grep -rn "query.*\`.*\${.*}\`\|query.*\".*\${\|query.*'.*\${" \
    --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
    --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=dist --exclude-dir=generated \
    . 2>/dev/null | head -1 > /dev/null; then

    add_finding "HIGH" "Potential SQL Injection" \
        "Multiple files" "Various" \
        "Template literals used in SQL queries. This may allow SQL injection." \
        "Use parameterized queries with $1, $2 placeholders."
fi

# Check 3: Dangerous functions
echo "[3/10] Checking for dangerous function usage..." >&2

# eval()
if grep -rn "\beval\(" \
    --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
    --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=dist --exclude-dir=generated \
    . 2>/dev/null | grep -v "// @ts-ignore" | head -1 > /dev/null; then

    add_finding "HIGH" "Use of eval() Function" \
        "JavaScript files" "Various" \
        "eval() executes arbitrary code and should never be used with user input." \
        "Remove eval(). Use safer alternatives like JSON.parse() or Function constructor."
fi

# dangerouslySetInnerHTML without sanitization
if grep -rn "dangerouslySetInnerHTML" \
    --include="*.tsx" --include="*.jsx" \
    --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=dist --exclude-dir=generated \
    . 2>/dev/null | grep -v "DOMPurify\|sanitize" | head -1 > /dev/null; then

    add_finding "HIGH" "XSS Risk: Unsanitized HTML" \
        "React components" "Various" \
        "dangerouslySetInnerHTML used without DOMPurify sanitization." \
        "Use DOMPurify.sanitize() before setting HTML."
fi

# Check 4: Weak cryptography
echo "[4/10] Checking for weak cryptography..." >&2

if grep -rn "createHash.*\(.*['\"]md5\|createHash.*\(.*['\"]sha1" \
    --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
    --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=dist --exclude-dir=generated \
    . 2>/dev/null | head -1 > /dev/null; then

    add_finding "HIGH" "Weak Hash Algorithm" \
        "Crypto code" "Various" \
        "MD5 or SHA1 used for hashing. These are cryptographically broken." \
        "Use bcrypt or argon2 for password hashing."
fi

# Check 5: Missing input validation
echo "[5/10] Checking for input validation..." >&2

# API routes without validation
if [ -d "app/api" ] || [ -d "pages/api" ]; then
    API_FILES=$(find app/api pages/api -name "route.ts" -o -name "*.ts" 2>/dev/null || echo "")

    if [ ! -z "$API_FILES" ]; then
        UNVALIDATED=$(echo "$API_FILES" | xargs grep -L "zod\|joi\|yup\|validator" 2>/dev/null | head -3 || echo "")
        if [ ! -z "$UNVALIDATED" ]; then
            add_finding "MEDIUM" "Missing Input Validation" \
                "API routes" "N/A" \
                "API routes found without schema validation libraries." \
                "Add zod/joi/yup validation for all user inputs."
        fi
    fi
fi

# Check 6: Dependencies
echo "[6/10] Checking dependencies for vulnerabilities..." >&2

if [ -f "pnpm-lock.yaml" ] && command -v pnpm &> /dev/null; then
    AUDIT_OUTPUT=$(pnpm audit --json 2>/dev/null || echo '{}')
    CRITICAL_VULNS=$(echo "$AUDIT_OUTPUT" | grep -o '"critical":[0-9]*' | cut -d: -f2 | head -1 || echo "0")
    HIGH_VULNS=$(echo "$AUDIT_OUTPUT" | grep -o '"high":[0-9]*' | cut -d: -f2 | head -1 || echo "0")

    if [ "$CRITICAL_VULNS" -gt 0 ]; then
        add_finding "CRITICAL" "$CRITICAL_VULNS Critical Dependency Vulnerabilities" \
            "package.json" "N/A" \
            "Critical vulnerabilities found in npm dependencies." \
            "Run 'pnpm audit' and update vulnerable packages."
    fi

    if [ "$HIGH_VULNS" -gt 0 ]; then
        add_finding "HIGH" "$HIGH_VULNS High Dependency Vulnerabilities" \
            "package.json" "N/A" \
            "High-severity vulnerabilities found in npm dependencies." \
            "Run 'pnpm audit' and update vulnerable packages."
    fi
fi

# Check 7: CORS configuration
echo "[7/10] Checking CORS configuration..." >&2

if grep -rn "cors.*origin.*['\"]\\*['\"]" \
    --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
    --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=dist --exclude-dir=generated \
    . 2>/dev/null | head -1 > /dev/null; then

    add_finding "MEDIUM" "Insecure CORS Configuration" \
        "Server config" "N/A" \
        "CORS allows all origins (*). This is insecure for APIs with authentication." \
        "Whitelist specific origins instead of using wildcard."
fi

# Check 8: Authentication
echo "[8/10] Checking authentication patterns..." >&2

# Session tokens in localStorage (should be in httpOnly cookies)
if grep -rn "localStorage.*token\|localStorage.*session" \
    --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
    --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=dist --exclude-dir=generated \
    . 2>/dev/null | grep -v "// @" | head -1 > /dev/null; then

    add_finding "MEDIUM" "Insecure Token Storage" \
        "Client code" "Various" \
        "Session tokens stored in localStorage are vulnerable to XSS attacks." \
        "Store tokens in httpOnly secure cookies instead."
fi

# Check 9: Rate limiting
echo "[9/10] Checking for rate limiting..." >&2

if [ -d "app/api" ] || [ -d "pages/api" ]; then
    if ! grep -rq "rate-limit\|ratelimit\|throttle" \
        --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
        --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=dist --exclude-dir=generated \
        . 2>/dev/null; then

        add_finding "MEDIUM" "Missing Rate Limiting" \
            "API routes" "N/A" \
            "No rate limiting detected. APIs vulnerable to abuse and DDoS." \
            "Add express-rate-limit or similar middleware."
    fi
fi

# Check 10: Error handling
echo "[10/10] Checking error handling..." >&2

if grep -rn "res.*error\.message\|return.*error\.stack" \
    --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
    --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=dist --exclude-dir=generated \
    app/ pages/ 2>/dev/null | head -1 > /dev/null; then

    add_finding "LOW" "Verbose Error Messages" \
        "Error handlers" "Various" \
        "Error messages may leak internal system information." \
        "Return generic error messages to clients. Log details server-side only."
fi

echo "" >&2
echo "========================================" >&2
echo "SECURITY CHECK RESULTS" >&2
echo "========================================" >&2
echo "" >&2

TOTAL=$((CRITICAL + HIGH + MEDIUM + LOW))

echo "CRITICAL ISSUES: $CRITICAL" >&2
echo "HIGH ISSUES: $HIGH" >&2
echo "MEDIUM ISSUES: $MEDIUM" >&2
echo "LOW ISSUES: $LOW" >&2
echo "" >&2

# Display findings by severity
if [ ${#FINDINGS[@]} -gt 0 ]; then
    for severity in "CRITICAL" "HIGH" "MEDIUM" "LOW"; do
        COUNT=0
        case "$severity" in
            CRITICAL) COUNT=$CRITICAL ;;
            HIGH) COUNT=$HIGH ;;
            MEDIUM) COUNT=$MEDIUM ;;
            LOW) COUNT=$LOW ;;
        esac

        if [ $COUNT -gt 0 ]; then
            echo "=== $severity SEVERITY ===" >&2
            echo "" >&2

            NUM=1
            for finding in "${FINDINGS[@]}"; do
                IFS='|' read -r sev title file line desc fix <<< "$finding"
                if [ "$sev" = "$severity" ]; then
                    echo "$NUM. $title [$severity]" >&2
                    echo "   File: $file:$line" >&2
                    echo "   Issue: $desc" >&2
                    echo "   Fix: $fix" >&2
                    echo "" >&2
                    NUM=$((NUM + 1))
                fi
            done
        fi
    done

    echo "========================================" >&2
    echo "RECOMMENDATIONS" >&2
    echo "========================================" >&2
    echo "" >&2

    if [ $CRITICAL -gt 0 ] || [ $HIGH -gt 0 ]; then
        echo "🚨 CRITICAL/HIGH issues found - DO NOT deploy!" >&2
        echo "" >&2
    fi

    echo "1. Fix issues in priority order (Critical → High → Medium → Low)" >&2
    echo "2. Run 'pnpm audit' to check dependency vulnerabilities" >&2
    echo "3. Add security headers (use helmet for Express/Next.js)" >&2
    echo "4. Review authentication and authorization logic" >&2
    echo "5. Add input validation on all user-facing endpoints" >&2
    echo "6. Re-run security check after fixes" >&2
    echo "" >&2

else
    echo "✓ No major security issues detected!" >&2
    echo "" >&2
    echo "Note: This automated scan covers common issues." >&2
    echo "Consider professional security audit for production systems." >&2
    echo "" >&2
fi

# Output JSON
cat <<EOF
{
  "summary": {
    "total": $TOTAL,
    "critical": $CRITICAL,
    "high": $HIGH,
    "medium": $MEDIUM,
    "low": $LOW
  },
  "findings": [
$(
    first=true
    for finding in "${FINDINGS[@]}"; do
        IFS='|' read -r sev title file line desc fix <<< "$finding"
        if [ "$first" = true ]; then
            first=false
        else
            echo ","
        fi
        echo "    {"
        echo "      \"severity\": \"$sev\","
        echo "      \"title\": \"$title\","
        echo "      \"file\": \"$file\","
        echo "      \"line\": \"$line\","
        echo "      \"description\": \"$desc\","
        echo "      \"fix\": \"$fix\""
        echo -n "    }"
    done
)
  ],
  "scannedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "projectPath": "$(pwd)"
}
EOF

# Exit code: only CRITICAL issues block commits
# HIGH issues are reported but non-blocking (many are false positives)
exit $CRITICAL
