#!/bin/bash

# Kintsugi Model Selection Script
# Usage: bash set-model.sh [provider]
#
# Providers: anthropic, kimi, gemini, deepseek, openai

set -e

PROVIDER="${1:-}"
API_URL="${KINTSUGI_API_URL:-http://localhost:3000}/api/kintsugi/model"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

if [ -z "$PROVIDER" ]; then
  # No provider specified - show current and available
  echo -e "${BLUE}Fetching current Kintsugi model configuration...${NC}"
  curl -s "$API_URL" | jq '.'
  echo ""
  echo -e "${YELLOW}Usage: bash set-model.sh <provider>${NC}"
  echo "Available providers: anthropic, kimi, gemini, deepseek, openai"
  exit 0
fi

# Validate provider
case "$PROVIDER" in
  anthropic|kimi|gemini|deepseek|openai)
    ;;
  *)
    echo "Error: Invalid provider '$PROVIDER'"
    echo "Valid providers: anthropic, kimi, gemini, deepseek, openai"
    exit 1
    ;;
esac

echo -e "${BLUE}Setting Kintsugi provider to: $PROVIDER${NC}"

RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"provider\": \"$PROVIDER\"}")

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo -e "${GREEN}Success!${NC}"
  echo "$RESPONSE" | jq '.'
else
  echo "Error setting provider:"
  echo "$RESPONSE" | jq '.'
  exit 1
fi
