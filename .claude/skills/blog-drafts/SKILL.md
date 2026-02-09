---
name: blog-drafts
description: Internal blog drafting system with sequential revisions. Use when writing blog posts that need review before publishing, or when iterating on sensitive content like legal/regulatory topics.
license: MIT
metadata:
  author: b0ase.com
  version: "1.0.0"
---

# Blog Drafts System

Internal drafting system for blog posts that shouldn't be published immediately. Supports sequential revisions for tracking changes over time.

## When to Use

**Use drafts when:**
- Writing about legal, regulatory, or securities topics
- Content needs review before publishing
- Iterating on sensitive messaging
- Building internal knowledge base (thinking out loud)
- Posts that read like advice (need reframing as b0ase's voice)

**Don't use drafts when:**
- Standard blog posts ready for immediate publication
- Technical tutorials with no sensitive content
- Announcements and updates

## File Structure

```
content/drafts/
  [slug]/
    1.md    ← First revision
    2.md    ← Second revision
    3.md    ← Third revision
    ...
```

Each draft lives in its own folder. Revisions are numbered sequentially.

## Creating a New Draft

### 1. Create the folder and first revision

```bash
mkdir -p content/drafts/my-post-slug
```

### 2. Write the markdown file

Create `content/drafts/my-post-slug/1.md`:

```markdown
---
title: "My Draft Post Title"
date: "2026-01-24"
author: "b0ase"
excerpt: "Brief description of the post"
category: "Opinion"
tags: ["Tag1", "Tag2"]
---

## First Section

Content here...
```

### 3. View the draft

Navigate to: `/blog/drafts/my-post-slug/1`

Or see all drafts at: `/blog/drafts`

## Creating a New Revision

When iterating on a draft, create a new revision rather than overwriting:

```bash
# Copy previous revision
cp content/drafts/my-post-slug/1.md content/drafts/my-post-slug/2.md

# Edit the new revision
# ... make changes to 2.md
```

This preserves history and allows comparison between versions.

## Draft URLs

| URL | Description |
|-----|-------------|
| `/blog/drafts` | List all drafts with revision counts |
| `/blog/drafts/[slug]/1` | View revision 1 |
| `/blog/drafts/[slug]/2` | View revision 2 |
| `/blog/drafts/[slug]/[n]` | View revision n |

## Publishing a Draft

When ready to publish:

### 1. Copy final revision to blog

```bash
cp content/drafts/my-post-slug/3.md content/blog/my-post-slug.md
```

### 2. Add to blog index

Edit `lib/blog.ts` and add entry to `blogPosts` array:

```typescript
{
    slug: 'my-post-slug',
    title: "My Post Title",
    description: "Brief description",
    date: '2026-01-24',
    author: { name: 'b0ase', url: 'https://b0ase.com' },
    company: { name: 'b0ase.com', url: 'https://b0ase.com' },
    readTime: '5 min read',
    tags: ['Tag1', 'Tag2'],
    featured: false,
    image: 'https://images.unsplash.com/photo-xxx'
},
```

### 3. Run blog formatter

```bash
bash .claude/skills/blog-formatter/scripts/format.sh content/blog/my-post-slug.md
```

### 4. Keep or delete drafts

Drafts can remain in `content/drafts/` as historical record, or be deleted after publishing.

## Draft Features

### Yellow Warning Banner
Every draft page shows a yellow "DRAFT — Not published" banner at the top.

### Revision Navigation
- Buttons to switch between revisions (v1, v2, v3...)
- Warning when viewing older revision
- Link to latest revision

### Not Indexed
- `/blog/drafts/` is in robots.txt disallow
- Not linked from public blog
- Not in sitemap

## Writing Guidelines for Drafts

### Voice
Write as b0ase speaking to the audience, NOT as Claude advising b0ase.

**Wrong:**
> "Here's where it gets interesting. You asked: can we issue dividend-bearing tokens?"

**Right:**
> "This is where many token issuers get tripped up. Can you issue dividend-bearing tokens?"

### Honesty
Drafts serve as internal knowledge base. Be honest, even when uncertain:

> "We don't have all the answers. Some questions we're still working through..."

### Disclaimers
For legal/regulatory content, always include:

```markdown
---

*This post represents b0ase.com's current thinking on [topic]. It is not legal advice. Our understanding may be incomplete or wrong. Consult qualified legal counsel before [action].*
```

## Current Drafts

As of Jan 2026:

| Slug | Topic | Status |
|------|-------|--------|
| `securities-laws-larry-flynt-crypto` | Larry Flynt / securities law comparison | Needs reframing — reads as advice |
| `vibecoins-securities-middle-ground` | Vibecoins and regulatory middle ground | Ready for review |

## Technical Details

### Route Files
- `/app/blog/drafts/page.tsx` — Draft listing
- `/app/blog/drafts/[slug]/[revision]/page.tsx` — Draft viewer

### Content Location
- `content/drafts/[slug]/[n].md`

### Frontmatter Fields
```yaml
title: string (required)
date: string (optional, YYYY-MM-DD)
author: string (optional)
excerpt: string (optional)
category: string (optional)
tags: string[] (optional)
image: string (optional)
```

## Integration with Other Skills

### blog-formatter
Run after finalizing a draft before publishing:
```bash
bash .claude/skills/blog-formatter/scripts/format.sh content/blog/final-post.md
```

### security-audit
For posts about security topics, review claims before publishing.

## Troubleshooting

### Draft not appearing in list
- Check folder exists: `content/drafts/[slug]/`
- Check file is named `[n].md` where n is a number
- Check file has valid frontmatter

### 404 on draft URL
- Verify revision number exists
- Check slug matches folder name exactly

### Content not rendering
- Ensure frontmatter is valid YAML
- Check for unclosed code blocks
- Verify markdown syntax

---

*This skill documents b0ase.com's internal drafting workflow. Drafts are never published automatically — they require manual promotion to the public blog.*
