#!/bin/bash
# Complete guide creation orchestrator

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SKIP_IMAGES=false
LOCAL_ONLY=false

# Parse arguments
CODE_PATTERN="$1"
GUIDE_TITLE="$2"
NOTION_PAGE_ID="$3"

# Parse flags
for arg in "$@"; do
  case $arg in
    --no-images)
      SKIP_IMAGES=true
      shift
      ;;
    --local-only)
      LOCAL_ONLY=true
      shift
      ;;
  esac
done

if [[ -z "$CODE_PATTERN" ]] || [[ -z "$GUIDE_TITLE" ]]; then
  echo -e "${RED}Error: Missing required arguments${NC}"
  echo "Usage: create.sh <code-pattern> \"Guide Title\" [notion-page-id] [--no-images] [--local-only]"
  echo ""
  echo "Examples:"
  echo "  create.sh \"src/auth/**/*.ts\" \"Auth Guide\" \"page-id\""
  echo "  create.sh \"src/**/*.ts\" \"Complete Guide\" --no-images"
  echo "  create.sh \"lib/**/*.js\" \"Library Docs\" --local-only"
  exit 1
fi

if [[ -z "$NOTION_PAGE_ID" ]] && [[ "$LOCAL_ONLY" == "false" ]]; then
  echo -e "${YELLOW}Warning: No Notion page ID provided${NC}"
  echo "  Guide will be created locally only"
  echo "  Use --local-only to suppress this warning"
  LOCAL_ONLY=true
fi

# Check required API keys
if [[ -z "$ANTHROPIC_API_KEY" ]]; then
  echo -e "${RED}Error: ANTHROPIC_API_KEY not set${NC}"
  exit 1
fi

if [[ "$SKIP_IMAGES" == "false" ]] && [[ -z "$GEMINI_API_KEY" ]]; then
  echo -e "${YELLOW}Warning: GEMINI_API_KEY not set${NC}"
  echo "  Skipping image generation"
  SKIP_IMAGES=true
fi

if [[ "$LOCAL_ONLY" == "false" ]] && [[ -z "$NOTION_API_KEY" ]]; then
  echo -e "${YELLOW}Warning: NOTION_API_KEY not set${NC}"
  echo "  Will create guide locally only"
  LOCAL_ONLY=true
fi

echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║    Guide Writer Agent - Complete Pipeline     ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Pattern: ${GREEN}$CODE_PATTERN${NC}"
echo -e "Title: ${GREEN}$GUIDE_TITLE${NC}"
if [[ "$LOCAL_ONLY" == "false" ]]; then
  echo -e "Notion: ${GREEN}$NOTION_PAGE_ID${NC}"
else
  echo -e "Mode: ${YELLOW}Local only${NC}"
fi
echo ""

# Get skills directory
SKILLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Step 1: Generate Guide
echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 1/5:${NC} Analyzing codebase and generating guide"
echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
echo ""

GUIDE_META=$(bash "$SKILLS_DIR/write-guide-from-codebase/scripts/generate.sh" \
  "$CODE_PATTERN" \
  "$GUIDE_TITLE")

GUIDE_PATH=$(echo "$GUIDE_META" | jq -r '.guidePath')
DIAGRAM_COUNT=$(echo "$GUIDE_META" | jq -r '.diagramCount')
WORD_COUNT=$(echo "$GUIDE_META" | jq -r '.wordCount')

echo ""
echo -e "${GREEN}✓ Guide created${NC}"
echo -e "  Path: $GUIDE_PATH"
echo -e "  Words: $WORD_COUNT"
echo -e "  Diagrams: $DIAGRAM_COUNT"
echo ""

# Initialize arrays
IMAGES=()
DARK_IMAGES=()

# Step 2: Generate Images
if [[ "$SKIP_IMAGES" == "false" ]]; then
  echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}Step 2/5:${NC} Generating hero image"
  echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
  echo ""

  HERO_PROMPT="${HERO_IMAGE_PROMPT:-Professional technical documentation hero image for \"$GUIDE_TITLE\" - modern, clean, tech-focused}"

  HERO_META=$(bash "$SKILLS_DIR/nano-banana/scripts/generate.sh" "$HERO_PROMPT")
  HERO_PATH=$(echo "$HERO_META" | jq -r '.imagePath')
  IMAGES+=("$HERO_PATH")

  echo ""
  echo -e "${GREEN}✓ Hero image created${NC}"
  echo -e "  Path: $HERO_PATH"
  echo ""

  # Step 3: Create Dark Variants
  echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}Step 3/5:${NC} Creating dark mode variants"
  echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
  echo ""

  for img in "${IMAGES[@]}"; do
    echo -e "Inverting: $(basename "$img")"
    DARK_META=$(bash "$SKILLS_DIR/invert-image/scripts/invert.sh" "$img")
    DARK_PATH=$(echo "$DARK_META" | jq -r '.darkPath')
    DARK_IMAGES+=("$DARK_PATH")
  done

  echo ""
  echo -e "${GREEN}✓ Dark variants created${NC}"
  echo -e "  Count: ${#DARK_IMAGES[@]}"
  echo ""
else
  echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
  echo -e "${YELLOW}Step 2-3/5: Skipped (--no-images)${NC}"
  echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
  echo ""
fi

# Step 4: Upload to Notion
if [[ "$LOCAL_ONLY" == "false" ]]; then
  echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}Step 4/5:${NC} Uploading to Notion"
  echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
  echo ""

  # Upload light images
  for img in "${IMAGES[@]}"; do
    echo -e "Uploading: $(basename "$img")"
    bash "$SKILLS_DIR/upload-image-to-notion/scripts/upload.sh" \
      "$img" \
      "$NOTION_PAGE_ID" \
      "$(basename "$img" .png) (light theme)" \
      > /dev/null
  done

  # Upload dark images
  for img in "${DARK_IMAGES[@]}"; do
    echo -e "Uploading: $(basename "$img")"
    bash "$SKILLS_DIR/upload-image-to-notion/scripts/upload.sh" \
      "$img" \
      "$NOTION_PAGE_ID" \
      "$(basename "$img" .png) (dark theme)" \
      > /dev/null
  done

  echo ""
  echo -e "${GREEN}✓ Images uploaded to Notion${NC}"
  echo ""
else
  echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
  echo -e "${YELLOW}Step 4/5: Skipped (--local-only)${NC}"
  echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
  echo ""
fi

# Step 5: Finalize
echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 5/5:${NC} Finalizing"
echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
echo ""

# Build metadata
METADATA="{
  \"success\": true,
  \"guidePath\": \"$GUIDE_PATH\",
  \"guideTitle\": \"$GUIDE_TITLE\",
  \"wordCount\": $WORD_COUNT,
  \"diagramCount\": $DIAGRAM_COUNT,
  \"imagesGenerated\": ${#IMAGES[@]},
  \"darkVariants\": ${#DARK_IMAGES[@]}"

if [[ "$LOCAL_ONLY" == "false" ]]; then
  NOTION_URL="https://notion.so/$(echo "$NOTION_PAGE_ID" | tr -d '-')"
  METADATA="$METADATA,
  \"notionUrl\": \"$NOTION_URL\",
  \"notionPageId\": \"$NOTION_PAGE_ID\""
fi

METADATA="$METADATA,
  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
}"

# Save metadata
METADATA_PATH="$(dirname "$GUIDE_PATH")/$(basename "$GUIDE_PATH" .md)-metadata.json"
echo "$METADATA" | jq . > "$METADATA_PATH"

echo ""
echo "$METADATA" | jq .
echo ""

# Success summary
echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║            ${GREEN}✓ Pipeline Complete${CYAN}                  ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}📄 Guide:${NC} $GUIDE_PATH"
echo -e "${GREEN}📊 Metadata:${NC} $METADATA_PATH"

if [[ ${#IMAGES[@]} -gt 0 ]]; then
  echo -e "${GREEN}🖼  Images:${NC} ${#IMAGES[@]} generated, ${#DARK_IMAGES[@]} dark variants"
fi

if [[ "$LOCAL_ONLY" == "false" ]]; then
  echo -e "${GREEN}🌐 Notion:${NC} $NOTION_URL"
  echo ""
  echo -e "${CYAN}View your guide:${NC} $NOTION_URL"
else
  echo ""
  echo -e "${YELLOW}Guide created locally only${NC}"
fi

echo ""

exit 0
