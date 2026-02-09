#!/bin/bash

# Blog Post Validator (Third Audience Standard)
# Validates blog posts against b0ase.com standards
# Usage: bash validate.sh <file.md> [--verbose] [--quiet]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Flags
VERBOSE=false
QUIET=false

# Parse arguments
FILES=()
for arg in "$@"; do
  case $arg in
    --verbose) VERBOSE=true ;;
    --quiet) QUIET=true ;;
    *) FILES+=("$arg") ;;
  esac
done

if [[ ${#FILES[@]} -eq 0 ]]; then
  echo -e "${RED}Error: No files specified${NC}"
  exit 1
fi

log() { if $VERBOSE; then echo -e "${BLUE}[INFO]${NC} $1"; fi; }
success() { if ! $QUIET; then echo -e "${GREEN}[PASS]${NC} $1"; fi; }
error() { echo -e "${RED}[FAIL]${NC} $1"; exit_code=1; }

exit_code=0

for FILE in "${FILES[@]}"; do
  log "Validating $FILE..."
  
  if [[ ! -f "$FILE" ]]; then
    error "File not found: $FILE"
    continue
  fi

  CONTENT=$(cat "$FILE")

  # 1. Check Frontmatter
  if [[ ! "$CONTENT" =~ ^--- ]]; then
    error "$FILE: Missing frontmatter"
  fi

  # 2. Check Required Third Audience Fields
  required_fields=("title" "description" "date" "author" "slug" "audience" "topics" "canonical" "markdown")
  for field in "${required_fields[@]}"; do
    if ! grep -q "^$field:" "$FILE"; then
      error "$FILE: Missing required field '$field'"
    fi
  done

  # 3. Check Mandatory Sections
  # Human content comes first, AI metadata at the end
  if ! grep -q "## Get Started" "$FILE"; then
    error "$FILE: Missing mandatory section '## Get Started'"
  fi
  if ! grep -q "## For AI Readers" "$FILE"; then
    error "$FILE: Missing mandatory section '## For AI Readers' (should be at end of post)"
  fi

  # 4. Check H2-Only Policy (no H1 or H3 in body)
  # Extract body (everything after second ---)
  BODY=$(echo "$CONTENT" | sed '1,2d' | sed -n '/---/,$p' | sed '1d')
  
  if echo "$BODY" | grep -q "^# "; then
    error "$FILE: Body contains H1 heading (only allowed in frontmatter)"
  fi
  if echo "$BODY" | grep -q "^###"; then
    error "$FILE: Body contains H3+ heading (only H2 allowed)"
  fi

  # 5. Check placeholder emails
  if echo "$CONTENT" | grep -q "\[your-email\]\|\[email\]\|example\.com\|yourcompany\.com"; then
    error "$FILE: Contains email placeholders"
  fi

  if [[ $exit_code -eq 0 ]]; then
    success "$FILE"
  fi
done

exit $exit_code
