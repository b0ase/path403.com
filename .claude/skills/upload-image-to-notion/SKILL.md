---
name: upload-image-to-notion
description: Upload images to Notion pages and databases. Integrates with Notion API for automated content management.
allowed-tools:
  - Bash
---

# Upload Image to Notion

Automatically upload images to Notion pages and databases through the Notion API. Perfect for documentation workflows, guide publishing, and content management automation.

## When to Use

Trigger this skill when:
- **Publishing guides** - "Upload this image to the Notion page"
- **Documentation automation** - "Add images to the guide database"
- **Content workflows** - "Upload hero images to Notion"
- **Multi-platform publishing** - "Sync images to Notion docs"
- **Team collaboration** - "Share visual assets in Notion"

**Keywords**: upload to notion, add image to notion, notion image, publish to notion

## What It Does

### 1. Image Upload

Uploads images to Notion:
- **Direct upload** - To specific pages by ID
- **Database entries** - To database rows/cards
- **Multiple formats** - PNG, JPG, WebP, GIF
- **Base64 encoding** - Handles API limitations
- **Batch processing** - Multiple images at once

### 2. Smart Placement

Intelligently places images:
- **Append to page** - Adds to end of page
- **Insert at position** - Places at specific location
- **Gallery blocks** - Creates image galleries
- **Callouts** - Images with context
- **Captions** - Automatic or custom captions

### 3. Metadata Tracking

Returns upload information:
- Page/block IDs
- Upload timestamps
- File sizes
- Success status
- Error details

## Usage

### Upload Single Image

```bash
# Basic upload to page
bash ~/.claude/skills/upload-image-to-notion/scripts/upload.sh \
  image.png \
  abc123-def456-ghi789

# With caption
bash upload.sh image.png PAGE_ID "Architecture diagram"

# With custom placement
bash upload.sh image.png PAGE_ID --position 0
```

### Through Claude

Just describe what you need:

```
"Upload hero-image.png to the authentication guide in Notion"
"Add this diagram to the Notion page"
"Upload both light and dark variants to the guide"
```

## What You Get

### Successful Upload

Image block added to Notion page with:
- **Viewable image** - Displays in Notion
- **Original quality** - No compression loss
- **Proper sizing** - Responsive in Notion
- **Metadata** - Upload info and timestamps

### JSON Response

```json
{
  "success": true,
  "blockId": "abc123-def456-ghi789",
  "pageId": "page-id-here",
  "imagePath": "./hero-image.png",
  "fileSize": 1234567,
  "timestamp": "2026-01-16T12:00:00Z"
}
```

## Configuration

### Environment Variables

```bash
# Required
export NOTION_API_KEY="secret_xxx"

# Optional
export NOTION_DEFAULT_PAGE_ID="page-id-here"
export NOTION_UPLOAD_CAPTION="true"  # Auto-generate captions
```

### Getting Your Notion API Key

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Name it (e.g., "Claude Skills")
4. Select capabilities: Read content, Update content, Insert content
5. Copy the Internal Integration Token

### Granting Page Access

The integration needs access to specific pages:

1. Open the Notion page
2. Click "..." menu → "Add connections"
3. Select your integration
4. Repeat for each page/database you want to access

## Examples

### Example 1: Documentation Guide

Upload hero image to guide:

```bash
# Generate image
bash nano-banana/scripts/generate.sh "Auth guide hero" > meta.json
IMAGE=$(jq -r '.imagePath' meta.json)

# Upload to Notion
bash upload-image-to-notion/scripts/upload.sh "$IMAGE" "$GUIDE_PAGE_ID"
```

### Example 2: Light + Dark Variants

Upload both theme variants:

```bash
# Generate and invert
IMAGE="hero.png"
bash invert-image/scripts/invert.sh "$IMAGE"

# Upload both
bash upload.sh "$IMAGE" "$PAGE_ID" "Hero image (light theme)"
bash upload.sh "${IMAGE%.png}-dark.png" "$PAGE_ID" "Hero image (dark theme)"
```

### Example 3: Batch Upload

Upload entire image directory:

```bash
#!/bin/bash
PAGE_ID="your-page-id"

for img in images/*.png; do
  echo "Uploading $img..."
  bash upload.sh "$img" "$PAGE_ID"
done
```

### Example 4: Automated Publishing

Complete guide publishing workflow:

```bash
# Generate guide
bash write-guide-from-codebase/scripts/generate.sh "src/**/*.ts" "Guide"

# Generate hero image
bash nano-banana/scripts/generate.sh "Hero for guide"

# Create dark variant
bash invert-image/scripts/invert.sh "generated-*.png"

# Create Notion page
PAGE_ID=$(create-notion-page.sh "Guide Title")

# Upload images
for img in generated-*.png; do
  bash upload.sh "$img" "$PAGE_ID"
done
```

## Advanced Features

### Custom Captions

Add descriptive captions:

```bash
bash upload.sh diagram.png "$PAGE_ID" "System architecture showing microservices"
```

### Position Control

Insert at specific position:

```bash
# Insert at top of page
bash upload.sh logo.png "$PAGE_ID" --position 0

# Insert after introduction
bash upload.sh diagram.png "$PAGE_ID" --after BLOCK_ID
```

### Gallery Creation

Upload multiple images as gallery:

```bash
bash upload.sh --gallery "$PAGE_ID" image1.png image2.png image3.png
```

### Database Integration

Upload to database entries:

```bash
# Upload to database row
bash upload.sh thumbnail.png "$DATABASE_ID" --row "$ROW_ID"
```

## Integration

### With CI/CD

Auto-upload docs on deploy:

```yaml
# .github/workflows/docs.yml
- name: Upload to Notion
  env:
    NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
  run: |
    for img in docs/images/*.png; do
      bash ~/.claude/skills/upload-image-to-notion/scripts/upload.sh \
        "$img" "$NOTION_PAGE_ID"
    done
```

### With Documentation Sites

Sync images between docs site and Notion:

```bash
# sync-to-notion.sh
#!/bin/bash

for img in public/images/*.png; do
  # Check if already uploaded (implement caching)
  if ! already_uploaded "$img"; then
    bash upload.sh "$img" "$NOTION_PAGE_ID"
  fi
done
```

### With Guide Writer

Part of complete guide creation:

```bash
# Create guide → images → upload
bash guide-writer-agent.sh "src/auth/**/*.ts" "Auth Guide" "$NOTION_PAGE_ID"
```

## When NOT to Use

**Don't use this skill for:**
- ❌ **Large image libraries** - Notion has storage limits
- ❌ **High-frequency uploads** - API rate limits
- ❌ **Temporary images** - Better suited for docs sites
- ❌ **Image hosting** - Use CDN instead
- ❌ **Public galleries** - Use dedicated image hosts

**Use instead:**
- Large libraries → Cloudinary, Imgix, S3
- High frequency → CDN with Notion embeds
- Temporary → Local preview only
- Hosting → CDN → embed in Notion
- Public galleries → Imgur, Flickr → embed

## Troubleshooting

### Authentication Error

**Problem:** `Unauthorized - check your integration token`

**Solution:**
```bash
# Verify API key is set
echo $NOTION_API_KEY

# Re-export if needed
export NOTION_API_KEY="secret_xxx"

# Check integration has access to page
# (Share page with integration in Notion UI)
```

### Page Not Found

**Problem:** `Could not find page with ID: xxx`

**Solution:**
- Verify page ID is correct (36 characters with dashes)
- Check integration has access to page
- Share page with integration in Notion settings

### File Size Error

**Problem:** `File too large for inline data`

**Solution:**
```bash
# Optimize image first
mogrify -resize 2048x2048\> -quality 85 image.jpg

# Then upload
bash upload.sh image.jpg "$PAGE_ID"
```

### Rate Limit Error

**Problem:** `Rate limited - too many requests`

**Solution:**
```bash
# Add delays between uploads
for img in *.png; do
  bash upload.sh "$img" "$PAGE_ID"
  sleep 1  # Wait 1 second between uploads
done
```

## Technical Details

### How It Works

1. **Read Image** - Load file from disk
2. **Base64 Encode** - Convert to data URL
3. **API Call** - POST to Notion blocks API
4. **Block Creation** - Create image block
5. **Verification** - Confirm upload success
6. **Metadata** - Return block and upload info

### Performance

- **Small images** (<1MB): ~2-3 seconds
- **Medium images** (1-5MB): ~4-6 seconds
- **Large images** (5-20MB): ~10-15 seconds
- **Batch uploads**: Sequential with delays

### API Limitations

- **Max file size**: ~5MB per image (base64 encoded)
- **Rate limits**: 3 requests per second
- **Page size**: No hard limit, but large pages slow down
- **Concurrent uploads**: Not recommended

### Data URL Format

Images are encoded as:
```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...
```

### Alternative Approaches

For large images or high volume:
1. Upload to S3/Cloudinary first
2. Use external URL in Notion
3. Avoids size limits and rate limits

## Quality Standards

Uploaded images should:
- ✅ Be optimized for web (< 2MB)
- ✅ Have descriptive captions
- ✅ Be relevant to page content
- ✅ Maintain quality after upload
- ✅ Load quickly in Notion
- ✅ Be organized logically

## Future Enhancements

Planned features:
- [ ] External URL support (S3/CDN)
- [ ] Image optimization pre-upload
- [ ] Duplicate detection
- [ ] Gallery block creation
- [ ] Callout integration
- [ ] Automatic captioning with AI

## Reference

- **Script**: `scripts/upload.sh`
- **Dependencies**: Notion API, curl, jq, base64
- **Output**: Image blocks in Notion pages
- **Performance**: ~3-5 seconds per image

---

**Questions?** See the main skills README or contact richard@b0ase.com
