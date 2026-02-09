#!/bin/bash

# Batch Blog Post Formatter
# Formats all blog posts in a directory
# Usage: bash batch-format.sh <directory> [--dry-run]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get directory
DIR="${1:-content/blog}"
DRY_RUN=""

# Check for dry-run flag
if [[ "$2" == "--dry-run" ]]; then
  DRY_RUN="--dry-run"
  echo -e "${YELLOW}Running in DRY RUN mode - no files will be modified${NC}"
  echo ""
fi

# Validate directory
if [[ ! -d "$DIR" ]]; then
  echo -e "${RED}Error: Directory not found: $DIR${NC}"
  exit 1
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Count files
TOTAL=$(find "$DIR" -name "*.md" -type f | wc -l | tr -d ' ')
CURRENT=0
SUCCESS=0
FAILED=0

echo -e "${BLUE}Formatting $TOTAL blog posts in $DIR${NC}"
echo ""

# Process each markdown file
for file in "$DIR"/*.md; do
  if [[ -f "$file" ]]; then
    CURRENT=$((CURRENT + 1))
    filename=$(basename "$file")

    echo -e "${BLUE}[$CURRENT/$TOTAL]${NC} Processing: $filename"

    if bash "$SCRIPT_DIR/format.sh" "$file" $DRY_RUN > /dev/null 2>&1; then
      echo -e "  ${GREEN}✓${NC} Formatted successfully"
      SUCCESS=$((SUCCESS + 1))
    else
      echo -e "  ${RED}✗${NC} Formatting failed"
      FAILED=$((FAILED + 1))
    fi

    echo ""
  fi
done

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Batch Formatting Complete${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Total files: $TOTAL"
echo -e "  ${GREEN}Success: $SUCCESS${NC}"
if [[ $FAILED -gt 0 ]]; then
  echo -e "  ${RED}Failed: $FAILED${NC}"
fi
echo ""

if [[ -n "$DRY_RUN" ]]; then
  echo -e "${YELLOW}This was a dry run - no files were modified${NC}"
  echo "Run without --dry-run to apply changes"
  echo ""
fi

if [[ $FAILED -gt 0 ]]; then
  exit 1
else
  exit 0
fi
