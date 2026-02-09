#!/bin/bash
# Fix blog post OG image issues

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo "Usage: $0 <blog-post.md>"
    exit 1
fi

BLOG_FILE="$1"
PUBLIC_BLOG="/Volumes/2026/Projects/b0ase.com/public/blog"
PUBLIC_IMAGES_BLOG="/Volumes/2026/Projects/b0ase.com/public/images/blog"

if [ ! -f "$BLOG_FILE" ]; then
    echo -e "${RED}File not found: $BLOG_FILE${NC}"
    exit 1
fi

# Extract image from frontmatter
image=$(grep -E "^image:" "$BLOG_FILE" | head -1 | sed 's/image: *//' | tr -d '"' | tr -d "'")

if [ -z "$image" ]; then
    echo -e "${YELLOW}No image specified in $BLOG_FILE${NC}"
    exit 0
fi

echo "Current image path: $image"

# Get just the filename
filename=$(basename "$image")
name="${filename%.*}"
ext="${filename##*.}"

# Find the source file
source_file=""
for dir in "$PUBLIC_BLOG" "$PUBLIC_IMAGES_BLOG"; do
    for try_ext in png jpg jpeg avif webp; do
        if [ -f "$dir/$name.$try_ext" ]; then
            source_file="$dir/$name.$try_ext"
            break 2
        fi
    done
done

if [ -z "$source_file" ]; then
    echo -e "${RED}Could not find source image for: $filename${NC}"
    echo "Searched in: $PUBLIC_BLOG, $PUBLIC_IMAGES_BLOG"
    exit 1
fi

echo "Found source: $source_file"

# Determine target
target_ext="$ext"
if [[ "$ext" =~ ^(avif|webp)$ ]]; then
    target_ext="png"
    echo "Converting $ext to png for OG compatibility..."
fi

target_file="$PUBLIC_BLOG/$name.$target_ext"

# Convert/copy if needed
if [ "$source_file" != "$target_file" ]; then
    if [[ "$ext" =~ ^(avif|webp)$ ]]; then
        sips -s format png "$source_file" --out "$target_file"
        echo -e "${GREEN}Converted to: $target_file${NC}"
    else
        cp "$source_file" "$target_file"
        echo -e "${GREEN}Copied to: $target_file${NC}"
    fi
fi

# Update frontmatter
new_path="/blog/$name.$target_ext"
if [ "$image" != "$new_path" ]; then
    # Use sed to update the image path
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|^image:.*|image: $new_path|" "$BLOG_FILE"
    else
        sed -i "s|^image:.*|image: $new_path|" "$BLOG_FILE"
    fi
    echo -e "${GREEN}Updated frontmatter: image: $new_path${NC}"
fi

echo ""
echo -e "${GREEN}Done! Don't forget to update lib/blog.ts if needed.${NC}"
