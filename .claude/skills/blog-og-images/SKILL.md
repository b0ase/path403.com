# Blog OG Images

Ensure blog post images work correctly for Open Graph (social sharing previews).

## THE RULES (READ THIS FIRST)

### 1. Image Location

**Images MUST be in `/public/blog/`** — NOT `/public/images/blog/`

```bash
# ✓ CORRECT
public/blog/my-image.png

# ✗ WRONG
public/images/blog/my-image.png
```

### 2. Image Format

**Use `.png` or `.jpg` ONLY** — NOT `.avif`, `.webp`, `.gif`

Social media crawlers (WhatsApp, Twitter, Facebook, LinkedIn) don't reliably support:
- `.avif` — Not supported by most crawlers
- `.webp` — Partial support, inconsistent
- `.gif` — May work but not recommended for OG

```bash
# ✓ CORRECT
image.png
image.jpg
image.jpeg

# ✗ WRONG
image.avif
image.webp
```

### 3. Frontmatter Path

**Path should be `/blog/filename.png`** — starts with `/blog/`

```yaml
# ✓ CORRECT
image: /blog/my-post-image.png

# ✗ WRONG
image: /images/blog/my-post-image.png
image: /public/blog/my-post-image.png
image: blog/my-post-image.png
```

### 4. Working Example

From `anatomy-of-a-bitcoin-empire.md`:

```yaml
---
title: "Anatomy of an Empire"
image: /blog/anatomy-empire.png
---
```

File location: `/public/blog/anatomy-empire.png`

## Adding a New Blog Image

### Step 1: Prepare the Image

If you have an `.avif` or `.webp`, convert to PNG:

```bash
# Convert avif to png
sips -s format png input.avif --out public/blog/output.png

# Convert webp to png
sips -s format png input.webp --out public/blog/output.png

# Convert jpg (just copy, jpg is fine)
cp input.jpg public/blog/output.jpg
```

### Step 2: Place in Correct Directory

```bash
cp your-image.png /Volumes/2026/Projects/b0ase.com/public/blog/
```

### Step 3: Update Frontmatter

```yaml
---
image: /blog/your-image.png
---
```

### Step 4: Update Blog Registry

In `lib/blog.ts`:

```typescript
{
    slug: 'your-post',
    // ... other fields
    image: '/blog/your-image.png'  // Same path as frontmatter
}
```

## Validation Script

Run this to check all blog posts have valid OG images:

```bash
bash .claude/skills/blog-og-images/scripts/validate.sh
```

## Quick Fix Script

If you have images in the wrong location or format:

```bash
bash .claude/skills/blog-og-images/scripts/fix.sh content/blog/your-post.md
```

## Why This Matters

1. **Social crawlers are dumb** — They don't follow redirects, don't support modern formats, and cache aggressively
2. **WhatsApp is especially strict** — Requires `www.` prefix and `.png`/`.jpg` only
3. **First impressions** — A broken preview means fewer clicks

## Checklist Before Publishing

- [ ] Image is in `/public/blog/` directory
- [ ] Image is `.png` or `.jpg` format
- [ ] Frontmatter uses `/blog/filename.png` path
- [ ] `lib/blog.ts` registry matches frontmatter path
- [ ] Image dimensions are at least 1200x630 (recommended OG size)

## Reference

Working posts to copy:
- `content/blog/anatomy-of-a-bitcoin-empire.md` → `/blog/anatomy-empire.png`
- `content/blog/blueprint-of-the-bitcoin-corporation.md` → `/blog/blueprint-of-the-bitcoin-corporation.png`

The OG metadata is generated in `app/blog/[slug]/page.tsx` in the `generateMetadata()` function.
