---
name: invert-image
description: Create dark mode variants of images automatically. Inverts colors while preserving readability and visual quality.
allowed-tools:
  - Bash
---

# Invert Image - Dark Mode Converter

Automatically create dark mode variants of images by intelligently inverting colors, adjusting brightness, and optimizing for readability on dark backgrounds.

## When to Use

Trigger this skill when:
- **Dark mode support** - "Create dark mode version of this image"
- **Documentation theming** - "Make a dark variant for the docs"
- **Notion uploads** - "Generate light and dark versions"
- **Multi-theme sites** - "Convert images for dark theme"
- **Accessibility** - "Optimize image for dark backgrounds"

**Keywords**: dark mode, invert image, dark variant, theme conversion, night mode

## What It Does

### 1. Intelligent Inversion

Converts images for dark mode by:
- **Color inversion** - Inverts RGB values
- **Alpha preservation** - Maintains transparency
- **Brightness adjustment** - Slight darkening for dark backgrounds
- **Saturation boost** - Compensates for inversion
- **Contrast optimization** - Ensures readability

### 2. Quality Preservation

Maintains image quality:
- No generation artifacts
- Preserves sharpness
- Maintains aspect ratio
- Retains metadata when possible
- Lossless processing

### 3. Composition-Ready

Outputs work seamlessly with:
- Documentation sites
- Notion pages
- MDX/Markdown content
- Theme-aware applications
- CSS `prefers-color-scheme` media queries

## Usage

### Convert Single Image

```bash
# Basic conversion
bash ~/.claude/skills/invert-image/scripts/invert.sh image.png

# With custom output
bash ~/.claude/skills/invert-image/scripts/invert.sh image.png --output dark-image.png

# Batch conversion
for img in images/*.png; do
  bash invert.sh "$img"
done
```

### Through Claude

Just describe what you need:

```
"Create a dark mode version of hero-image.png"
"Invert this diagram for dark theme"
"Make dark variants of all guide images"
```

## What You Get

### Output Files

- **Filename pattern**: `{original-name}-dark.{ext}`
- **Location**: Same directory as source image
- **Format**: Matches source (PNG, JPG, WebP)
- **Quality**: Same as source, lossless

### Examples

```bash
# Input: hero-image.png
# Output: hero-image-dark.png

# Input: diagram.jpg
# Output: diagram-dark.jpg

# Input: screenshot.webp
# Output: screenshot-dark.webp
```

### Metadata

JSON output with:
```json
{
  "success": true,
  "originalPath": "./hero-image.png",
  "darkPath": "./hero-image-dark.png",
  "fileSize": 1234567,
  "format": "png"
}
```

## Configuration

### Environment Variables

```bash
# Output directory (default: same as input)
export DARK_IMAGE_OUTPUT_DIR="./images/dark"

# Brightness adjustment (default: 0.9, range: 0.1-1.0)
export DARK_BRIGHTNESS="0.85"

# Saturation boost (default: 1.1, range: 1.0-2.0)
export DARK_SATURATION="1.15"
```

### Advanced Options

Fine-tune the conversion:

```bash
# Subtle conversion
export DARK_BRIGHTNESS="0.95"
export DARK_SATURATION="1.05"

# Aggressive conversion
export DARK_BRIGHTNESS="0.80"
export DARK_SATURATION="1.20"
```

## Examples

### Example 1: Documentation Hero Images

**Input:** Clean hero image with light background

```bash
bash invert.sh docs-hero.png
```

**Output:**
- Inverted colors for dark background
- Readable text elements
- Preserved logo clarity
- Professional appearance

### Example 2: Technical Diagrams

**Input:** Architecture diagram with light theme

```bash
bash invert.sh architecture-diagram.png
```

**Output:**
- Inverted diagram colors
- Maintained line clarity
- Readable labels
- Dark theme compatible

### Example 3: Screenshots

**Input:** UI screenshot with light interface

```bash
bash invert.sh ui-screenshot.png
```

**Output:**
- Inverted UI colors
- Preserved contrast
- Readable text
- Natural dark theme appearance

## Advanced Features

### Batch Processing

Convert entire directories:

```bash
# All images in directory
for img in docs/images/*.png; do
  bash invert.sh "$img"
done

# With parallel processing
find docs/images -name "*.png" -print0 | \
  xargs -0 -P 4 -I {} bash invert.sh {}
```

### Integration with Build Pipeline

```bash
# package.json scripts
{
  "scripts": {
    "images:dark": "bash generate-dark-variants.sh",
    "build": "npm run images:dark && next build"
  }
}
```

### Selective Conversion

Only convert images that need it:

```bash
#!/bin/bash
# generate-dark-variants.sh

for img in public/images/*.png; do
  dark_img="${img%.png}-dark.png"
  if [[ ! -f "$dark_img" ]] || [[ "$img" -nt "$dark_img" ]]; then
    bash invert.sh "$img"
  fi
done
```

## Integration

### With Documentation Sites

```markdown
<!-- Markdown with theme-aware images -->
![Hero Image](./hero-image.png#light)
![Hero Image](./hero-image-dark.png#dark)
```

Or using HTML:

```html
<picture>
  <source srcset="hero-image-dark.png" media="(prefers-color-scheme: dark)">
  <img src="hero-image.png" alt="Hero">
</picture>
```

### With Notion

Upload both variants:

```bash
# Generate dark variant
IMAGE_PATH="hero.png"
bash invert.sh "$IMAGE_PATH"

# Upload both
bash upload-image-to-notion.sh "$IMAGE_PATH" "$PAGE_ID"
bash upload-image-to-notion.sh "${IMAGE_PATH%.png}-dark.png" "$PAGE_ID"
```

### With CI/CD

Auto-generate dark variants on changes:

```yaml
# .github/workflows/images.yml
- name: Generate Dark Variants
  run: |
    for img in docs/images/*.png; do
      bash ~/.claude/skills/invert-image/scripts/invert.sh "$img"
    done

    git add docs/images/*-dark.png
    git commit -m "chore: update dark mode images" || true
```

## When NOT to Use

**Don't use this skill for:**
- ❌ **Photos with people** - Looks unnatural
- ❌ **Brand logos** - May violate brand guidelines
- ❌ **Complex color palettes** - Simple inversion insufficient
- ❌ **Already dark images** - Double inversion breaks them
- ❌ **Screenshots of dark UIs** - Already dark

**Use instead:**
- Photos → Manual dark mode design
- Logos → Use provided dark variants
- Complex images → Custom dark mode design
- Dark images → Leave as-is or lighten
- Dark screenshots → Leave as-is

## Troubleshooting

### Image Looks Wrong

**Problem:** Dark variant has poor contrast or unreadable elements

**Solution:**
```bash
# Adjust brightness and saturation
export DARK_BRIGHTNESS="0.85"
export DARK_SATURATION="1.2"
bash invert.sh image.png

# Or manually edit in image editor
```

### Text Not Readable

**Problem:** Text in image is hard to read after inversion

**Solution:**
- Add text as HTML overlay instead of in image
- Use SVG for diagrams with text
- Manually create dark variant
- Increase contrast in source image

### File Size Issues

**Problem:** Dark variant is larger than original

**Solution:**
```bash
# Optimize after conversion
bash invert.sh image.png
pngcrush hero-image-dark.png hero-image-dark-optimized.png
```

## Technical Details

### How It Works

1. **Load Image** - Read source file with ImageMagick/sharp
2. **Invert Colors** - Apply color negation (preserve alpha)
3. **Adjust Brightness** - Darken by 10% (default)
4. **Boost Saturation** - Increase by 10% (default)
5. **Save Output** - Write to `-dark` variant
6. **Metadata** - Return JSON with paths

### Performance

- **Small images** (<1MB): ~0.5 seconds
- **Medium images** (1-5MB): ~1-2 seconds
- **Large images** (5-20MB): ~3-5 seconds
- **Batch processing**: Parallel execution supported

### Processing Quality

- **Algorithm**: RGB inversion with HSL adjustments
- **Color space**: sRGB
- **Bit depth**: Preserved from source
- **Compression**: Lossless PNG, quality 90 JPG

### Dependencies

The script supports multiple image processors (in order of preference):
1. **ImageMagick** - Full-featured, widely available
2. **GraphicsMagick** - Faster alternative to ImageMagick
3. **sharp (Node.js)** - Fastest, requires Node
4. **Python PIL** - Python-based fallback

Auto-detects available processor.

## Quality Standards

Dark variants should:
- ✅ Be readable on dark backgrounds
- ✅ Maintain visual hierarchy
- ✅ Preserve important details
- ✅ Look professional, not jarring
- ✅ Match site's dark theme aesthetic
- ✅ Be accessible (WCAG contrast)

## Future Enhancements

Planned features:
- [ ] Smart selective inversion (preserve brand colors)
- [ ] Region-based inversion (invert only certain areas)
- [ ] Color palette preservation
- [ ] Automatic contrast enhancement
- [ ] SVG support
- [ ] Batch optimization

## Reference

- **Script**: `scripts/invert.sh`
- **Dependencies**: ImageMagick, GraphicsMagick, or sharp
- **Output**: `-dark` variants of images
- **Performance**: ~1 second per image

---

**Questions?** See the main skills README or contact richard@b0ase.com
