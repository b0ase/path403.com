#!/bin/bash
# Generate images using Gemini AI

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
OUTPUT_DIR="${IMAGE_OUTPUT_DIR:-.}"
RESOLUTION="${IMAGE_RESOLUTION:-1024x1024}"
STYLE="${IMAGE_STYLE:-technical}"

# Parse arguments
PROMPT="$*"

if [[ -z "$PROMPT" ]]; then
  echo -e "${RED}Error: No prompt provided${NC}"
  echo "Usage: generate.sh <image description>"
  echo ""
  echo "Examples:"
  echo "  generate.sh \"Technical architecture diagram\""
  echo "  generate.sh \"Hero image for authentication guide\""
  exit 1
fi

# Check API key
if [[ -z "$GEMINI_API_KEY" ]]; then
  echo -e "${RED}Error: GEMINI_API_KEY not set${NC}"
  echo "Get your key from: https://makersuite.google.com/app/apikey"
  echo "Then export it:"
  echo "  export GEMINI_API_KEY=\"your-key-here\""
  exit 1
fi

echo -e "${BLUE}=== Nano Banana Image Generator ===${NC}"
echo -e "Prompt: ${GREEN}$PROMPT${NC}"
echo -e "Style: ${YELLOW}$STYLE${NC}"
echo ""

# Enhance prompt based on style
case "$STYLE" in
  technical)
    ENHANCED_PROMPT="Professional technical diagram or illustration: $PROMPT. Clean design, modern aesthetic, suitable for documentation and technical content."
    ;;
  illustration)
    ENHANCED_PROMPT="High-quality illustration: $PROMPT. Modern, clean, professional style suitable for content and presentations."
    ;;
  photo)
    ENHANCED_PROMPT="Photorealistic image: $PROMPT. Professional, high-quality, suitable for marketing and content."
    ;;
  *)
    ENHANCED_PROMPT="$PROMPT"
    ;;
esac

echo -e "${BLUE}Generating image...${NC}"

# Call Gemini API
RESPONSE=$(curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=$GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -d "{
    \"contents\": [{
      \"parts\": [{
        \"text\": \"Generate a high-quality image: $ENHANCED_PROMPT\"
      }]
    }],
    \"generationConfig\": {
      \"temperature\": 0.9,
      \"topK\": 40,
      \"topP\": 0.95
    }
  }")

# Check for errors
if echo "$RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
  echo -e "${RED}Error: API request failed${NC}"
  echo "$RESPONSE" | jq -r '.error.message'
  exit 1
fi

# Extract image data
IMAGE_DATA=$(echo "$RESPONSE" | jq -r '.candidates[0].content.parts[0].inlineData.data' 2>/dev/null)

if [[ -z "$IMAGE_DATA" ]] || [[ "$IMAGE_DATA" == "null" ]]; then
  # Fallback: try alternative response format
  IMAGE_DATA=$(echo "$RESPONSE" | jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data' 2>/dev/null | head -1)
fi

if [[ -z "$IMAGE_DATA" ]] || [[ "$IMAGE_DATA" == "null" ]]; then
  echo -e "${RED}Error: No image data in response${NC}"
  echo "This might be because:"
  echo "  - Gemini doesn't support image generation in your region"
  echo "  - The prompt violates content policies"
  echo "  - API quota exceeded"
  echo ""
  echo "Response:"
  echo "$RESPONSE" | jq .
  exit 1
fi

# Save image
TIMESTAMP=$(date +%s)
FILENAME="generated-$TIMESTAMP.png"
OUTPUT_PATH="$OUTPUT_DIR/$FILENAME"

# Decode base64 and save
echo "$IMAGE_DATA" | base64 -d > "$OUTPUT_PATH"

if [[ ! -f "$OUTPUT_PATH" ]]; then
  echo -e "${RED}Error: Failed to save image${NC}"
  exit 1
fi

FILE_SIZE=$(wc -c < "$OUTPUT_PATH" | tr -d ' ')
READABLE_SIZE=$(echo "$FILE_SIZE" | numfmt --to=iec-i --suffix=B 2>/dev/null || echo "$FILE_SIZE bytes")

echo -e "${GREEN}✓ Image generated successfully${NC}"
echo -e "  Path: ${BLUE}$OUTPUT_PATH${NC}"
echo -e "  Size: $READABLE_SIZE"

# Output metadata as JSON
echo ""
echo "{
  \"success\": true,
  \"imagePath\": \"$OUTPUT_PATH\",
  \"prompt\": \"$PROMPT\",
  \"enhancedPrompt\": \"$ENHANCED_PROMPT\",
  \"model\": \"gemini-2.0-flash-exp\",
  \"style\": \"$STYLE\",
  \"resolution\": \"$RESOLUTION\",
  \"fileSize\": $FILE_SIZE,
  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
}"

exit 0
