# Feature Card Image Position Skill

Adjusts the vertical position of images in the landing page feature card carousel.

## When to Use

Use this skill when a blog post or featured item's image is positioned incorrectly in the feature card (usually too low, cutting off the important part of the image).

## How It Works

The feature card uses `object-cover` with custom `object-position` values to control which part of the image is visible. The positioning is determined by matching the image filename in `app/page.tsx`.

## Usage

1. Find the blog post's image URL in its frontmatter (e.g., `image: /images/blog/example.png`)
2. Add a new condition to the image className in `app/page.tsx` around line 993
3. Use `object-[center_XX%]` where XX is the percentage from top (lower = show more top)

## Position Values

- `object-top` - Shows top of image (default)
- `object-center` - Shows center (50%)
- `object-[center_25%]` - Shows upper portion (25% from top)
- `object-[center_30%]` - Shows upper-middle (30% from top)
- `object-[center_40%]` - Shows middle-upper (40% from top)
- `object-[center_50%]` - Shows center (same as object-center)

## Example

To add positioning for an image named `my-blog-post.png`:

```tsx
: currentFeatured.image?.includes('my-blog-post')
  ? 'object-[center_30%]'
```

## File Location

The image positioning logic is in:
- `app/page.tsx` - Desktop feature card (around line 993)
- Search for `object-cover group-hover/image:scale-105`

## Current Custom Positions

| Image Pattern | Position | Reason |
|---------------|----------|--------|
| `kintsugi` | 50% | Center the gold repair imagery |
| `money-button-banner` | 40% | Show button prominently |
| `hyper-founder` | 35% | Show face/upper body |
| `shannon-pentester` | 15% | Show top of security graphics |
| `blueprint-of-the-bitcoin-corporation` | 30% | Show diagram properly |
| `gold-vs-digital` | 30% | Show gold/digital comparison properly |
