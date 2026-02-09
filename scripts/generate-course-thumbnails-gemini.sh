#!/bin/bash

# ============================================
# Course Thumbnail Generator (Gemini)
# Auto-retries on quota errors
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="$PROJECT_DIR/public/images/courses"
NANO_BANANA="$HOME/.claude/skills/nano-banana/scripts/generate.sh"

# Load API key from .env.local
if [ -f "$PROJECT_DIR/.env.local" ]; then
  export GEMINI_API_KEY=$(grep "GEMINI_API_KEY" "$PROJECT_DIR/.env.local" | cut -d'"' -f2)
fi

if [ -z "$GEMINI_API_KEY" ]; then
  echo "❌ Error: GEMINI_API_KEY not found in .env.local"
  exit 1
fi

# Thumbnails to generate
declare -A THUMBNAILS=(
  ["pre-commit-cicd"]="YouTube course thumbnail for Pre-commit Hooks and CI/CD automation tutorial. Dark tech aesthetic with purple and green neon glow on black background. Terminal window showing git hooks, GitHub Actions workflow visible. Modern professional developer course style. Bold typography. Cinematic lighting. 16:9 aspect ratio."
  ["nextjs-apps"]="YouTube course thumbnail for Building Next.js Apps tutorial. Dark tech aesthetic with white and blue neon accents. Next.js triangle logo prominent. Code editor with React components visible. Server and client components imagery. Modern professional developer course. Bold typography. 16:9 aspect ratio."
  ["ai-agents"]="YouTube course thumbnail for Building AI Agents tutorial. Dark tech aesthetic with orange and purple neon glow. Robot/AI brain imagery. Neural network visualization. Claude/GPT integration symbols. Autonomous agent workflow. Modern professional developer course. Bold typography. 16:9 aspect ratio."
  ["full-stack"]="YouTube course thumbnail for Full Stack Kintsugi Development tutorial. Dark tech aesthetic with red and amber/gold neon glow. Complete stack visualization: frontend, API, database, blockchain. Kintsugi gold repair aesthetic. Professional developer course. Bold typography. 16:9 aspect ratio."
)

# Retry settings
MAX_RETRIES=5
RETRY_DELAY=60  # seconds

echo "🎨 Course Thumbnail Generator (Gemini)"
echo "========================================"
echo "Output: $OUTPUT_DIR"
echo ""

generate_thumbnail() {
  local name=$1
  local prompt=$2
  local output_file="$OUTPUT_DIR/${name}.png"
  local attempt=1

  echo "📸 Generating: ${name}.png"

  while [ $attempt -le $MAX_RETRIES ]; do
    echo "   Attempt $attempt/$MAX_RETRIES..."

    # Change to output directory and generate
    cd "$OUTPUT_DIR"

    # Run nano-banana and capture output
    if OUTPUT=$("$NANO_BANANA" "$prompt" 2>&1); then
      # Check if image was created
      GENERATED_FILE=$(echo "$OUTPUT" | grep -o 'generated-[0-9]*.png' | head -1)

      if [ -n "$GENERATED_FILE" ] && [ -f "$OUTPUT_DIR/$GENERATED_FILE" ]; then
        # Rename to target filename
        mv "$OUTPUT_DIR/$GENERATED_FILE" "$output_file"
        echo "   ✅ Success! Saved as ${name}.png"
        return 0
      fi
    fi

    # Check for quota error
    if echo "$OUTPUT" | grep -q "quota\|Quota\|rate.limit\|exceeded"; then
      echo "   ⏳ Quota exceeded. Waiting ${RETRY_DELAY}s before retry..."
      sleep $RETRY_DELAY
      # Increase delay for next attempt
      RETRY_DELAY=$((RETRY_DELAY * 2))
    else
      echo "   ⚠️ Generation failed: $(echo "$OUTPUT" | tail -1)"
      sleep 5
    fi

    attempt=$((attempt + 1))
  done

  echo "   ❌ Failed after $MAX_RETRIES attempts"
  return 1
}

# Track results
SUCCESS=0
FAILED=0

for name in "${!THUMBNAILS[@]}"; do
  output_file="$OUTPUT_DIR/${name}.png"

  # Skip if high-quality image already exists (> 100KB suggests real image, not placeholder)
  if [ -f "$output_file" ]; then
    size=$(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file" 2>/dev/null)
    if [ "$size" -gt 100000 ]; then
      echo "⏭️  Skipping ${name}.png (already exists, ${size} bytes)"
      continue
    fi
  fi

  if generate_thumbnail "$name" "${THUMBNAILS[$name]}"; then
    SUCCESS=$((SUCCESS + 1))
  else
    FAILED=$((FAILED + 1))
  fi

  echo ""

  # Small delay between requests
  sleep 2
done

echo "========================================"
echo "✨ Complete!"
echo "   ✅ Success: $SUCCESS"
echo "   ❌ Failed: $FAILED"
echo ""

if [ $FAILED -gt 0 ]; then
  echo "💡 Tip: Re-run this script later when Gemini quota resets."
  echo "   Quota typically resets at midnight Pacific time."
fi
