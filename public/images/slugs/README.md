# Slug Images

Standardized location for all project slug/poster images.

## Convention

```
/images/slugs/{project-slug}.{jpg|png}
```

The filename MUST match the project's `slug` field exactly from `lib/data.ts`.

## Examples

| Project Slug | Slug Image |
|--------------|------------|
| `vexvoid-com` | `/images/slugs/vexvoid-com.png` |
| `osinka-kalaso` | `/images/slugs/osinka-kalaso.png` |
| `bitcoin-writer` | `/images/slugs/bitcoin-writer.png` |

## Adding New Slugs

1. Get the exact `slug` from `lib/data.ts`
2. Create image at `/public/images/slugs/{slug}.{ext}`
3. Add entry to `projectVideos` in `/app/websites/page.tsx`

## Why This Structure?

- **Predictable**: Know exactly where any slug image is
- **Consistent**: Same pattern for all projects
- **Maintainable**: Easy to audit, update, or automate
