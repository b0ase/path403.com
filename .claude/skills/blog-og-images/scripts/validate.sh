#!/bin/bash
# Validate blog post OG images

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BLOG_DIR="${1:-content/blog}"
PUBLIC_BLOG="/Volumes/2026/Projects/b0ase.com/public/blog"

echo "Validating blog OG images..."
echo ""

errors=0
warnings=0

for file in "$BLOG_DIR"/*.md; do
    [ -f "$file" ] || continue

    filename=$(basename "$file")

    # Extract image from frontmatter
    image=$(grep -E "^image:" "$file" | head -1 | sed 's/image: *//' | tr -d '"' | tr -d "'")

    if [ -z "$image" ]; then
        echo -e "${YELLOW}[WARN]${NC} $filename: No image specified"
        ((warnings++))
        continue
    fi

    # Check path format
    if [[ ! "$image" =~ ^/blog/ ]]; then
        echo -e "${RED}[FAIL]${NC} $filename: Image path must start with /blog/ (got: $image)"
        ((errors++))
        continue
    fi

    # Check file extension
    ext="${image##*.}"
    if [[ ! "$ext" =~ ^(png|jpg|jpeg)$ ]]; then
        echo -e "${RED}[FAIL]${NC} $filename: Image must be .png, .jpg, or .jpeg (got: .$ext)"
        ((errors++))
        continue
    fi

    # Check file exists
    image_path="$PUBLIC_BLOG/$(basename "$image")"
    if [ ! -f "$image_path" ]; then
        echo -e "${RED}[FAIL]${NC} $filename: Image file not found: $image_path"
        ((errors++))
        continue
    fi

    echo -e "${GREEN}[OK]${NC} $filename: $image"
done

echo ""
echo "================================"
if [ $errors -gt 0 ]; then
    echo -e "${RED}$errors error(s), $warnings warning(s)${NC}"
    exit 1
else
    echo -e "${GREEN}All images valid! ($warnings warning(s))${NC}"
    exit 0
fi
