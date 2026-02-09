#!/bin/bash
# Create dark mode variants of images

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
OUTPUT_DIR="${DARK_IMAGE_OUTPUT_DIR:-}"
BRIGHTNESS="${DARK_BRIGHTNESS:-0.9}"
SATURATION="${DARK_SATURATION:-1.1}"

# Parse arguments
INPUT_PATH="$1"
OUTPUT_PATH="$2"

if [[ -z "$INPUT_PATH" ]]; then
  echo -e "${RED}Error: No input file specified${NC}"
  echo "Usage: invert.sh <input-image> [output-image]"
  echo ""
  echo "Examples:"
  echo "  invert.sh hero.png"
  echo "  invert.sh hero.png dark-hero.png"
  exit 1
fi

# Check if file exists
if [[ ! -f "$INPUT_PATH" ]]; then
  echo -e "${RED}Error: File not found: $INPUT_PATH${NC}"
  exit 1
fi

# Determine output path
if [[ -z "$OUTPUT_PATH" ]]; then
  # Generate automatic output name
  DIR=$(dirname "$INPUT_PATH")
  BASENAME=$(basename "$INPUT_PATH")
  NAME="${BASENAME%.*}"
  EXT="${BASENAME##*.}"

  if [[ -n "$OUTPUT_DIR" ]]; then
    mkdir -p "$OUTPUT_DIR"
    OUTPUT_PATH="$OUTPUT_DIR/${NAME}-dark.${EXT}"
  else
    OUTPUT_PATH="$DIR/${NAME}-dark.${EXT}"
  fi
fi

echo -e "${BLUE}=== Invert Image for Dark Mode ===${NC}"
echo -e "Input: ${GREEN}$INPUT_PATH${NC}"
echo -e "Output: ${GREEN}$OUTPUT_PATH${NC}"
echo ""

# Detect available image processor
PROCESSOR=""

if command -v magick &> /dev/null; then
  PROCESSOR="imagemagick"
  echo -e "Using: ${BLUE}ImageMagick${NC}"
elif command -v gm &> /dev/null; then
  PROCESSOR="graphicsmagick"
  echo -e "Using: ${BLUE}GraphicsMagick${NC}"
elif command -v node &> /dev/null && node -e "require('sharp')" 2>/dev/null; then
  PROCESSOR="sharp"
  echo -e "Using: ${BLUE}sharp (Node.js)${NC}"
elif command -v python3 &> /dev/null && python3 -c "from PIL import Image" 2>/dev/null; then
  PROCESSOR="python"
  echo -e "Using: ${BLUE}Python PIL${NC}"
else
  echo -e "${RED}Error: No image processor found${NC}"
  echo "Install one of:"
  echo "  - ImageMagick: brew install imagemagick"
  echo "  - GraphicsMagick: brew install graphicsmagick"
  echo "  - sharp: npm install -g sharp-cli"
  echo "  - Python PIL: pip3 install Pillow"
  exit 1
fi

echo -e "Processing..."

# Process image based on available tool
case "$PROCESSOR" in
  imagemagick)
    magick "$INPUT_PATH" \
      -negate \
      -modulate "$((BRIGHTNESS * 100)),$((SATURATION * 100))" \
      "$OUTPUT_PATH"
    ;;

  graphicsmagick)
    gm convert "$INPUT_PATH" \
      -negate \
      -modulate "$((BRIGHTNESS * 100)),$((SATURATION * 100))" \
      "$OUTPUT_PATH"
    ;;

  sharp)
    node -e "
      const sharp = require('sharp');
      sharp('$INPUT_PATH')
        .negate({ alpha: false })
        .modulate({
          brightness: $BRIGHTNESS,
          saturation: $SATURATION
        })
        .toFile('$OUTPUT_PATH');
    "
    ;;

  python)
    python3 -c "
from PIL import Image, ImageEnhance, ImageOps
import sys

# Load image
img = Image.open('$INPUT_PATH')

# Convert to RGB if necessary (preserving alpha if present)
if img.mode == 'RGBA':
    alpha = img.split()[3]
    rgb = img.convert('RGB')
    rgb = ImageOps.invert(rgb)
    rgb.putalpha(alpha)
    inverted = rgb
else:
    inverted = ImageOps.invert(img.convert('RGB'))

# Adjust brightness
enhancer = ImageEnhance.Brightness(inverted)
inverted = enhancer.enhance($BRIGHTNESS)

# Adjust saturation
enhancer = ImageEnhance.Color(inverted)
inverted = enhancer.enhance($SATURATION)

# Save
inverted.save('$OUTPUT_PATH')
"
    ;;
esac

if [[ ! -f "$OUTPUT_PATH" ]]; then
  echo -e "${RED}Error: Failed to create dark variant${NC}"
  exit 1
fi

# Get file sizes
INPUT_SIZE=$(wc -c < "$INPUT_PATH" | tr -d ' ')
OUTPUT_SIZE=$(wc -c < "$OUTPUT_PATH" | tr -d ' ')

INPUT_READABLE=$(echo "$INPUT_SIZE" | numfmt --to=iec-i --suffix=B 2>/dev/null || echo "$INPUT_SIZE bytes")
OUTPUT_READABLE=$(echo "$OUTPUT_SIZE" | numfmt --to=iec-i --suffix=B 2>/dev/null || echo "$OUTPUT_SIZE bytes")

echo -e "${GREEN}✓ Dark variant created${NC}"
echo -e "  Original: $INPUT_READABLE"
echo -e "  Dark: $OUTPUT_READABLE"

# Get image format
FORMAT="${INPUT_PATH##*.}"

# Output metadata as JSON
echo ""
echo "{
  \"success\": true,
  \"originalPath\": \"$INPUT_PATH\",
  \"darkPath\": \"$OUTPUT_PATH\",
  \"originalSize\": $INPUT_SIZE,
  \"darkSize\": $OUTPUT_SIZE,
  \"format\": \"$FORMAT\",
  \"processor\": \"$PROCESSOR\",
  \"brightness\": $BRIGHTNESS,
  \"saturation\": $SATURATION
}"

exit 0
