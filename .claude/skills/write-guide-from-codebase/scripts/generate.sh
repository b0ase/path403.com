#!/bin/bash
# Generate technical guide from codebase analysis

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAX_FILES="${GUIDE_MAX_FILES:-50}"
MAX_TOKENS="${GUIDE_MAX_TOKENS:-8000}"
OUTPUT_DIR="${GUIDE_OUTPUT_DIR:-.}"

# Parse arguments
CODE_PATTERN="$1"
GUIDE_TITLE="$2"

if [[ -z "$CODE_PATTERN" ]] || [[ -z "$GUIDE_TITLE" ]]; then
  echo -e "${RED}Error: Missing required arguments${NC}"
  echo "Usage: generate.sh <code-pattern> \"Guide Title\""
  echo ""
  echo "Examples:"
  echo "  generate.sh \"src/auth/**/*.ts\" \"Authentication Guide\""
  echo "  generate.sh \"lib/**/*.js\" \"Library Documentation\""
  exit 1
fi

# Check API key
if [[ -z "$ANTHROPIC_API_KEY" ]]; then
  echo -e "${RED}Error: ANTHROPIC_API_KEY not set${NC}"
  echo "Export your API key:"
  echo "  export ANTHROPIC_API_KEY=\"sk-ant-xxx\""
  exit 1
fi

echo -e "${BLUE}=== Guide Generator ===${NC}"
echo -e "Pattern: ${GREEN}$CODE_PATTERN${NC}"
echo -e "Title: ${GREEN}$GUIDE_TITLE${NC}"
echo ""

# Find matching files
echo -e "${BLUE}Step 1/4:${NC} Finding files..."
FILES=$(find . -path "$CODE_PATTERN" -type f 2>/dev/null | head -n "$MAX_FILES")
FILE_COUNT=$(echo "$FILES" | wc -l | tr -d ' ')

if [[ $FILE_COUNT -eq 0 ]]; then
  echo -e "${RED}Error: No files matched pattern${NC}"
  exit 1
fi

echo -e "${GREEN}✓${NC} Found $FILE_COUNT files"

# Check file count
if [[ $FILE_COUNT -gt $MAX_FILES ]]; then
  echo -e "${YELLOW}Warning: Limited to $MAX_FILES files${NC}"
  echo "  Increase with: export GUIDE_MAX_FILES=100"
fi

# Build context from files
echo -e "\n${BLUE}Step 2/4:${NC} Reading code..."
CODE_CONTEXT=""
TOTAL_SIZE=0

while IFS= read -r file; do
  if [[ -f "$file" ]]; then
    FILE_SIZE=$(wc -c < "$file" | tr -d ' ')
    TOTAL_SIZE=$((TOTAL_SIZE + FILE_SIZE))

    # Add file to context
    CODE_CONTEXT="$CODE_CONTEXT

## File: $file
\`\`\`
$(cat "$file")
\`\`\`"
  fi
done <<< "$FILES"

echo -e "${GREEN}✓${NC} Read $(echo "$TOTAL_SIZE" | numfmt --to=iec-i --suffix=B 2>/dev/null || echo "$TOTAL_SIZE bytes")"

# Warn if context is large
if [[ $TOTAL_SIZE -gt 100000 ]]; then
  echo -e "${YELLOW}Warning: Large codebase may exceed context${NC}"
  echo "  Consider narrowing the pattern or splitting into sections"
fi

# Generate guide using Claude
echo -e "\n${BLUE}Step 3/4:${NC} Analyzing and writing guide..."

PROMPT="You are a technical writer creating a comprehensive tutorial guide.

Analyze the following codebase section and write a detailed guide titled \"$GUIDE_TITLE\".

The guide should include:
- **Overview**: Purpose and high-level architecture
- **Architecture**: Component relationships and design patterns
- **Implementation**: Step-by-step walkthrough with code examples
- **Code Examples**: Annotated snippets explaining key concepts
- **Diagrams**: Mermaid diagrams for complex flows
- **Best Practices**: What's done well and why
- **Common Pitfalls**: What to avoid and why
- **Next Steps**: How to extend or modify

Write in markdown format, suitable for technical documentation.
Be comprehensive but clear. Explain the \"why\" not just the \"what\".

Codebase:
$CODE_CONTEXT"

# Create temp file for prompt
TEMP_PROMPT=$(mktemp)
echo "$PROMPT" > "$TEMP_PROMPT"

# Call Claude API
RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d "{
    \"model\": \"claude-sonnet-4-5-20250929\",
    \"max_tokens\": $MAX_TOKENS,
    \"messages\": [{
      \"role\": \"user\",
      \"content\": $(cat "$TEMP_PROMPT" | jq -Rs .)
    }]
  }")

rm "$TEMP_PROMPT"

# Extract content from response
GUIDE_CONTENT=$(echo "$RESPONSE" | jq -r '.content[0].text' 2>/dev/null)

if [[ -z "$GUIDE_CONTENT" ]] || [[ "$GUIDE_CONTENT" == "null" ]]; then
  echo -e "${RED}Error: Failed to generate guide${NC}"
  echo "Response: $RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓${NC} Guide generated ($(echo "$GUIDE_CONTENT" | wc -w | tr -d ' ') words)"

# Save guide to file
echo -e "\n${BLUE}Step 4/4:${NC} Saving guide..."

FILENAME=$(echo "$GUIDE_TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-').md
OUTPUT_PATH="$OUTPUT_DIR/$FILENAME"

echo "$GUIDE_CONTENT" > "$OUTPUT_PATH"

echo -e "${GREEN}✓${NC} Saved to: $OUTPUT_PATH"

# Extract diagram count
DIAGRAM_COUNT=$(echo "$GUIDE_CONTENT" | grep -c '```mermaid' || echo "0")

# Output metadata as JSON
echo ""
echo "{
  \"success\": true,
  \"guidePath\": \"$OUTPUT_PATH\",
  \"title\": \"$GUIDE_TITLE\",
  \"filesAnalyzed\": $FILE_COUNT,
  \"wordCount\": $(echo "$GUIDE_CONTENT" | wc -w | tr -d ' '),
  \"diagramCount\": $DIAGRAM_COUNT
}"

echo ""
echo -e "${GREEN}🎉 Guide generated successfully!${NC}"
echo -e "   View at: ${BLUE}$OUTPUT_PATH${NC}"

if [[ $DIAGRAM_COUNT -gt 0 ]]; then
  echo -e "   Diagrams: ${YELLOW}$DIAGRAM_COUNT mermaid diagrams${NC}"
  echo -e "   Tip: Use nano-banana skill to convert diagrams to images"
fi

exit 0
