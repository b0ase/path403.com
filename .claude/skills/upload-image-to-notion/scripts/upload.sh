#!/bin/bash
# Upload images to Notion pages

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
IMAGE_PATH="$1"
PAGE_ID="$2"
CAPTION="${3:-}"

if [[ -z "$IMAGE_PATH" ]] || [[ -z "$PAGE_ID" ]]; then
  echo -e "${RED}Error: Missing required arguments${NC}"
  echo "Usage: upload.sh <image-path> <notion-page-id> [caption]"
  echo ""
  echo "Examples:"
  echo "  upload.sh hero.png abc123-def456-ghi789"
  echo "  upload.sh diagram.png PAGE_ID \"Architecture diagram\""
  exit 1
fi

# Check if file exists
if [[ ! -f "$IMAGE_PATH" ]]; then
  echo -e "${RED}Error: File not found: $IMAGE_PATH${NC}"
  exit 1
fi

# Check API key
if [[ -z "$NOTION_API_KEY" ]]; then
  echo -e "${RED}Error: NOTION_API_KEY not set${NC}"
  echo "Get your integration token from:"
  echo "  https://www.notion.so/my-integrations"
  echo ""
  echo "Then export it:"
  echo "  export NOTION_API_KEY=\"secret_xxx\""
  exit 1
fi

echo -e "${BLUE}=== Upload Image to Notion ===${NC}"
echo -e "Image: ${GREEN}$IMAGE_PATH${NC}"
echo -e "Page: ${YELLOW}$PAGE_ID${NC}"
if [[ -n "$CAPTION" ]]; then
  echo -e "Caption: $CAPTION"
fi
echo ""

# Get file info
FILE_SIZE=$(wc -c < "$IMAGE_PATH" | tr -d ' ')
READABLE_SIZE=$(echo "$FILE_SIZE" | numfmt --to=iec-i --suffix=B 2>/dev/null || echo "$FILE_SIZE bytes")
MIME_TYPE="image/$(echo "$IMAGE_PATH" | sed 's/.*\.//')"

# Warn if file is large
if [[ $FILE_SIZE -gt 5000000 ]]; then
  echo -e "${YELLOW}Warning: Image is large ($READABLE_SIZE)${NC}"
  echo "  Notion API may reject files > 5MB"
  echo "  Consider optimizing the image first"
  echo ""
fi

echo -e "${BLUE}Step 1/3:${NC} Encoding image..."

# Convert to base64
BASE64_DATA=$(base64 < "$IMAGE_PATH" | tr -d '\n')
DATA_URL="data:$MIME_TYPE;base64,$BASE64_DATA"

echo -e "${GREEN}✓${NC} Encoded ($READABLE_SIZE)"

# Create image block
echo -e "\n${BLUE}Step 2/3:${NC} Creating image block..."

# Build caption if provided
CAPTION_JSON="[]"
if [[ -n "$CAPTION" ]]; then
  CAPTION_JSON="[{\"type\": \"text\", \"text\": {\"content\": \"$CAPTION\"}}]"
fi

# Make API request
RESPONSE=$(curl -s -X PATCH "https://api.notion.com/v1/blocks/$PAGE_ID/children" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Notion-Version: 2022-06-28" \
  -d "{
    \"children\": [{
      \"type\": \"image\",
      \"image\": {
        \"type\": \"external\",
        \"external\": {
          \"url\": \"$DATA_URL\"
        },
        \"caption\": $CAPTION_JSON
      }
    }]
  }")

# Check for errors
if echo "$RESPONSE" | jq -e '.object == "error"' > /dev/null 2>&1; then
  echo -e "${RED}Error: Upload failed${NC}"
  ERROR_MSG=$(echo "$RESPONSE" | jq -r '.message')
  ERROR_CODE=$(echo "$RESPONSE" | jq -r '.code')
  echo "  Code: $ERROR_CODE"
  echo "  Message: $ERROR_MSG"
  echo ""

  case "$ERROR_CODE" in
    "unauthorized")
      echo "Solution: Check your NOTION_API_KEY"
      echo "  1. Verify the key is correct"
      echo "  2. Check integration has access to this page"
      echo "  3. Share page with integration in Notion"
      ;;
    "object_not_found")
      echo "Solution: Page not found"
      echo "  1. Verify page ID is correct"
      echo "  2. Check integration has access"
      echo "  3. Share page with integration"
      ;;
    "rate_limited")
      echo "Solution: Rate limited"
      echo "  1. Wait a moment and try again"
      echo "  2. Add delays between uploads"
      ;;
    "validation_error")
      echo "Solution: File may be too large"
      echo "  1. Optimize image (resize/compress)"
      echo "  2. Try smaller file"
      ;;
  esac

  exit 1
fi

# Extract block ID
BLOCK_ID=$(echo "$RESPONSE" | jq -r '.results[0].id' 2>/dev/null)

if [[ -z "$BLOCK_ID" ]] || [[ "$BLOCK_ID" == "null" ]]; then
  echo -e "${RED}Error: No block ID in response${NC}"
  echo "Response: $RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓${NC} Image block created"

# Verify upload
echo -e "\n${BLUE}Step 3/3:${NC} Verifying upload..."

BLOCK_INFO=$(curl -s -X GET "https://api.notion.com/v1/blocks/$BLOCK_ID" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28")

BLOCK_TYPE=$(echo "$BLOCK_INFO" | jq -r '.type')

if [[ "$BLOCK_TYPE" != "image" ]]; then
  echo -e "${YELLOW}Warning: Block type is $BLOCK_TYPE (expected image)${NC}"
else
  echo -e "${GREEN}✓${NC} Upload verified"
fi

# Output metadata as JSON
echo ""
echo "{
  \"success\": true,
  \"blockId\": \"$BLOCK_ID\",
  \"pageId\": \"$PAGE_ID\",
  \"imagePath\": \"$IMAGE_PATH\",
  \"fileSize\": $FILE_SIZE,
  \"caption\": \"$CAPTION\",
  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
}"

echo ""
echo -e "${GREEN}🎉 Image uploaded successfully!${NC}"
echo -e "   Block ID: ${BLUE}$BLOCK_ID${NC}"
echo -e "   View in Notion: https://notion.so/$PAGE_ID"

exit 0
