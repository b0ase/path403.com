---
name: nano-banana
description: Generate high-quality images using Google's Gemini AI. Perfect for creating visuals for documentation, social media, and content.
allowed-tools:
  - Bash
---

# Nano Banana - AI Image Generation

Generate production-quality images using Google's Gemini 2.0 Flash model. Create hero images, diagrams, illustrations, and visual content on demand.

## When to Use

Trigger this skill when:
- **Documentation visuals** - "Generate a hero image for this guide"
- **Social media content** - "Create an image for this blog post"
- **Diagram visualization** - "Convert this mermaid diagram to an image"
- **Presentation graphics** - "Make an illustration showing this concept"
- **Marketing materials** - "Generate a feature showcase image"

**Keywords**: generate image, create visual, make illustration, AI image, diagram to image

## What It Does

### 1. AI Image Generation

Uses Gemini 2.0 Flash to create:
- **Technical diagrams** - Architecture, flows, systems
- **Hero images** - Documentation headers, blog covers
- **Illustrations** - Concepts, ideas, processes
- **Icons and graphics** - UI elements, badges
- **Marketing visuals** - Features, benefits, CTAs

### 2. Smart Optimization

Automatically:
- Optimizes for technical/documentation use cases
- Maintains consistent style
- Generates high-resolution output
- Saves in web-friendly formats

### 3. Composition-Ready

Outputs are designed for:
- Dark mode conversion (use with invert-image)
- Notion uploads (use with upload-image-to-notion)
- Documentation sites
- Social media platforms

## Usage

### Generate Single Image

```bash
# Technical diagram
bash ~/.claude/skills/nano-banana/scripts/generate.sh \
  "Architecture diagram showing microservices with API gateway"

# Hero image
bash ~/.claude/skills/nano-banana/scripts/generate.sh \
  "Modern technical documentation hero image for authentication guide"

# Illustration
bash ~/.claude/skills/nano-banana/scripts/generate.sh \
  "Developer working with AI agents in clean workspace"
```

### Through Claude

Just describe what you need:

```
"Generate a hero image for the authentication guide"
"Create a diagram showing the payment flow"
"Make an illustration of the component architecture"
```

## What You Get

### Output Files

- **PNG format** - High quality, web-optimized
- **Filename**: `generated-{timestamp}.png`
- **Location**: Current directory or `$IMAGE_OUTPUT_DIR`
- **Resolution**: 1024x1024 (configurable)

### Metadata

JSON output with:
```json
{
  "success": true,
  "imagePath": "./generated-1234567890.png",
  "prompt": "Original prompt text",
  "model": "gemini-2.0-flash-exp",
  "timestamp": "2026-01-16T12:00:00Z"
}
```

## Configuration

### Environment Variables

```bash
# Required
export GEMINI_API_KEY="your-key-here"

# Optional
export IMAGE_OUTPUT_DIR="./images"
export IMAGE_RESOLUTION="1024x1024"
export IMAGE_STYLE="technical"  # technical, illustration, photo
```

### Custom Styles

Set default style preferences:

```bash
# Technical/documentation style (default)
export IMAGE_STYLE="technical"

# Illustration style
export IMAGE_STYLE="illustration"

# Photorealistic
export IMAGE_STYLE="photo"
```

## Examples

### Example 1: Documentation Hero

**Prompt:**
```bash
bash generate.sh "Modern technical documentation hero image - \
  authentication system with secure elements, blue and white theme"
```

**Output:**
- Professional hero image
- 1024x1024 PNG
- Tech-focused aesthetic
- Ready for docs site

### Example 2: Architecture Diagram

**Prompt:**
```bash
bash generate.sh "System architecture diagram showing: \
  React frontend → API Gateway → Microservices → PostgreSQL database"
```

**Output:**
- Clean architecture visual
- Professional diagram style
- Clear component relationships
- Ready for presentations

### Example 3: Social Media Graphic

**Prompt:**
```bash
bash generate.sh "Feature announcement graphic: \
  'AI-Powered Documentation' with modern tech aesthetic"
```

**Output:**
- Eye-catching social visual
- Professional design
- Clear messaging
- Ready for Twitter/LinkedIn

## Advanced Features

### Prompt Engineering

The skill automatically enhances prompts for better results:

**Your prompt:**
```
"authentication flow"
```

**Enhanced prompt:**
```
"Professional technical diagram of authentication flow with clean
design, modern aesthetic, suitable for documentation"
```

### Batch Generation

Generate multiple related images:

```bash
# Generate a series
for concept in "login" "signup" "reset-password"; do
  bash generate.sh "User flow diagram for $concept process"
done
```

### Composition Pipeline

Combine with other skills:

```bash
# Generate → Invert → Upload to Notion
IMAGE=$(bash generate.sh "Auth flow diagram")
DARK=$(bash ../invert-image/scripts/invert.sh "$IMAGE")
bash ../upload-image-to-notion/scripts/upload.sh "$IMAGE" "$PAGE_ID"
bash ../upload-image-to-notion/scripts/upload.sh "$DARK" "$PAGE_ID"
```

## Integration

### With Documentation Sites

```bash
# Generate hero image for new guide
bash generate.sh "Hero image for $GUIDE_TITLE" > metadata.json
IMAGE_PATH=$(jq -r '.imagePath' metadata.json)

# Add to markdown frontmatter
echo "image: $IMAGE_PATH" >> guide.md
```

### With CI/CD

Auto-generate images on docs changes:

```yaml
# .github/workflows/docs.yml
- name: Generate Images
  env:
    GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
  run: |
    bash ~/.claude/skills/nano-banana/scripts/generate.sh \
      "Hero image for updated guide"
```

### With Other Skills

Part of the guide-writer pipeline:

```bash
# Full guide creation flow
bash write-guide-from-codebase/scripts/generate.sh "src/**/*.ts" "Guide" > guide_meta.json
bash nano-banana/scripts/generate.sh "Hero image for guide" > image_meta.json
bash invert-image/scripts/invert.sh "$(jq -r '.imagePath' image_meta.json)"
```

## When NOT to Use

**Don't use this skill for:**
- ❌ **Screenshot needs** - Use actual screenshots
- ❌ **Product photos** - Use real photography
- ❌ **Legal/medical diagrams** - Requires accuracy
- ❌ **Brand assets** - Use professional designers
- ❌ **Complex data viz** - Use charting libraries

**Use instead:**
- Screenshots → Browser dev tools, screenshot tools
- Product photos → Professional photography
- Legal diagrams → Manual creation with review
- Branding → Hire designers
- Data viz → Chart.js, D3.js, Plotly

## Troubleshooting

### API Key Error

**Problem:** `Error: GEMINI_API_KEY not set`

**Solution:**
```bash
# Get key from https://makersuite.google.com/app/apikey
export GEMINI_API_KEY="your-key-here"

# Or add to ~/.bashrc
echo 'export GEMINI_API_KEY="your-key-here"' >> ~/.bashrc
```

### Generation Failed

**Problem:** Image generation returns error

**Solution:**
- Check API quota/limits
- Simplify prompt (may be too complex)
- Try again (API may be temporarily down)
- Check Gemini service status

### Poor Quality Output

**Problem:** Generated image doesn't match expectations

**Solution:**
- Be more specific in prompt
- Add style descriptors ("professional", "clean", "modern")
- Specify colors/theme
- Try multiple generations
- Enhance prompt with technical terms

## Technical Details

### How It Works

1. **Prompt Enhancement** - Optimizes user prompt for better results
2. **API Call** - Sends request to Gemini 2.0 Flash
3. **Image Extraction** - Decodes base64 response
4. **File Save** - Writes PNG to disk
5. **Metadata** - Returns JSON with paths and info

### Performance

- **Generation time**: ~3-8 seconds
- **Resolution**: 1024x1024 (default)
- **Format**: PNG
- **Size**: ~500KB-2MB per image

### Cost Estimation

Gemini 2.0 Flash pricing (as of Jan 2026):
- **Per image**: ~$0.001-0.002
- **Monthly (100 images)**: ~$0.10-0.20
- **Monthly (1000 images)**: ~$1-2

Very affordable for documentation use cases.

### Model Details

- **Model**: gemini-2.0-flash-exp
- **Capabilities**: Text-to-image generation
- **Strengths**: Fast, cost-effective, good for diagrams
- **Limitations**: Not photorealistic, best for illustrations

## Quality Standards

Generated images should:
- ✅ Match the prompt description
- ✅ Be professional and polished
- ✅ Work well in documentation context
- ✅ Be readable at various sizes
- ✅ Complement text content
- ✅ Be accessible (consider contrast)

## Future Enhancements

Planned features:
- [ ] Custom resolution support
- [ ] Style presets (minimalist, detailed, corporate)
- [ ] Batch generation with templates
- [ ] Auto-captioning
- [ ] SVG output for diagrams
- [ ] Integration with design systems

## Reference

- **Script**: `scripts/generate.sh`
- **Dependencies**: Gemini API, curl, jq
- **Output**: PNG images
- **Performance**: ~3-8 seconds per image

---

**Questions?** See the main skills README or contact richard@b0ase.com
