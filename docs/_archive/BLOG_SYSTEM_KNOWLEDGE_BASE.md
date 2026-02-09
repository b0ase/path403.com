# Blog System Knowledge Base - b0ase.com

**Last Updated:** 2026-01-16
**Status:** Partially implemented, needs integration

---

## Executive Summary

b0ase.com has a **partially-built autonomous blogging system** with:
- ✅ AI-powered blog generation (Google Gemini)
- ✅ Content ideas bucket
- ✅ Social media posting automation
- ✅ Status tracking dashboard
- ✅ Cron job infrastructure
- ⚠️ Hybrid storage (markdown files + database) - needs unification
- ⚠️ Manual steps still required
- ❌ Not yet fully autonomous

**Goal:** Complete the system to become **100% autonomous** - from idea collection to blog publishing to social distribution, with zero manual intervention.

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTONOMOUS BLOGGING SYSTEM                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  CONTENT IDEAS   │─────▶│  BLOG GENERATION │─────▶│  SOCIAL POSTING  │
│     BUCKET       │      │    (AI-Powered)   │      │   (Automated)    │
└──────────────────┘      └──────────────────┘      └──────────────────┘
        │                          │                          │
        ▼                          ▼                          ▼
  Manual/Scraper          Google Gemini 2.5           Twitter/X Queue
   content_ideas            blog_posts DB              post_queue DB
        │                          │                          │
        ▼                          ▼                          ▼
  Daily Cron Job          Status Tracking            Scheduled Posts
   (Picks unused)          (Dashboard)               (Cron execution)
```

---

## 1. Content Ideas Bucket System

### Purpose
Collect links, articles, tweets, repos, and manual ideas that inspire blog posts.

### Database Table: `content_ideas`
```sql
CREATE TABLE content_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  url TEXT,                    -- Source URL (optional for manual)
  title TEXT NOT NULL,         -- Idea title/summary
  source_type TEXT,            -- 'article', 'tweet', 'repo', 'manual'
  tags TEXT[],                 -- Context tags for AI
  notes TEXT,                  -- Additional context
  used BOOLEAN DEFAULT FALSE,  -- Marked true after blog generation
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_ideas_used ON content_ideas(user_id, used);
CREATE INDEX idx_content_ideas_source ON content_ideas(source_type);
```

### API Routes

**`POST /api/content-ideas`** - Add new idea
```typescript
// Body
{
  url?: string,
  title: string,
  source_type: 'article' | 'tweet' | 'repo' | 'manual',
  tags?: string[],
  notes?: string
}
```

**`GET /api/content-ideas`** - Fetch ideas
```typescript
// Query params
?used=false          // Filter unused ideas
&source_type=article // Filter by source
```

**`PATCH /api/content-ideas/[id]`** - Mark as used
```typescript
// Body
{
  used: true
}
```

**`DELETE /api/content-ideas/[id]`** - Remove idea

### Admin Interface
- **Location:** `/admin/content`
- **Features:**
  - Add ideas manually via form
  - View all ideas (used/unused)
  - Tag ideas for context
  - Add notes for AI guidance

### Current Status
✅ **Working:** Database, API, admin UI
⚠️ **Missing:** Automated idea scraping from RSS feeds, Twitter, GitHub trending

---

## 2. AI-Powered Blog Generation System

### Purpose
Generate high-quality blog posts from content ideas using Google Gemini AI.

### AI Model
- **Model:** Google Gemini 2.5 Flash
- **API Key:** `GOOGLE_AI_API_KEY` (from .env)
- **Why Gemini:** Free tier, JSON schema support, fast generation

### Generation Process

**`POST /api/blog/generate`** - Generate blog post
```typescript
// Body
{
  contentIdeaId: string  // UUID of content idea
}

// Process:
1. Fetch content idea from database
2. Build AI prompt with title, tags, notes, URL
3. Call Gemini with JSON schema (title, excerpt, content, tags)
4. Parse JSON response
5. Insert into blog_posts table (status: 'draft')
6. Mark content idea as used
7. Return generated post
```

**AI Prompt Structure:**
```
You are a professional technical writer for b0ase.com.

Content Idea:
- Title: {title}
- Tags: {tags}
- Notes: {notes}
- Source: {url}

Generate a comprehensive blog post (1500-2500 words) that:
- Educates developers/entrepreneurs
- Uses real examples and code snippets
- Includes actionable takeaways
- Matches b0ase.com voice (technical, practical, no fluff)

Return as JSON: { title, excerpt, content, tags }
```

### Database Table: `blog_posts`
```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id),
  category_id UUID REFERENCES blog_categories(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,          -- URL-friendly slug
  excerpt TEXT,                       -- SEO description (150-160 chars)
  content TEXT NOT NULL,              -- Markdown content body
  tags TEXT[],                        -- Array of tags
  status TEXT DEFAULT 'draft',        -- 'draft' | 'published'
  published_at TIMESTAMPTZ,           -- When post went live
  allow_comments BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_tags ON blog_posts USING GIN(tags);
```

### API Routes

**`GET /api/blog/list`** - List published posts
```typescript
// Returns all posts with status='published'
// Ordered by published_at DESC
```

**`GET /api/blog/[slug]`** - Fetch single post (not yet implemented)

**`PATCH /api/blog/[slug]/publish`** - Publish post (not yet implemented)

### Current Status
✅ **Working:** AI generation, database storage, API endpoint
⚠️ **Manual:** Posts stay in 'draft' status, need manual publishing
❌ **Missing:** Auto-publishing, markdown file export, SEO optimization

---

## 3. Blog Post Status Tracking System

### Purpose
Track blog posts through workflow: draft → queued → formatted → live

### Database Table: `blog_post_status`
```sql
CREATE TABLE blog_post_status (
  slug TEXT PRIMARY KEY,              -- Unique slug identifier
  queued BOOLEAN DEFAULT FALSE,       -- Ready for review/publishing
  live BOOLEAN DEFAULT FALSE,         -- Published and visible
  formatted BOOLEAN DEFAULT FALSE,    -- Formatting/spacing corrected
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_blog_post_status_timestamp
BEFORE UPDATE ON blog_post_status
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### API Routes

**`GET /api/dashboard/blog`** - List all blog posts
```typescript
// Aggregates:
// - Markdown files from content/blog/
// - Database posts from blog_posts table
// - Status from blog_post_status table

// Returns:
{
  posts: [{
    slug: string,
    title: string,
    date: string,
    source: 'markdown' | 'database' | 'both',
    queued: boolean,
    live: boolean,
    formatted: boolean
  }],
  stats: {
    total: number,
    queued: number,
    live: number,
    formatted: number
  }
}
```

**`PATCH /api/dashboard/blog/[slug]/status`** - Update status
```typescript
// Body
{
  queued?: boolean,
  live?: boolean,
  formatted?: boolean
}
```

**`POST /api/dashboard/blog/[slug]/format`** - Format markdown
```typescript
// Process:
1. Read markdown file from content/blog/[slug].md
2. Fix spacing around headings (## Heading needs blank lines)
3. Populate missing frontmatter (author, date, etc.)
4. Write back to file
5. Mark formatted=true in blog_post_status
```

**`POST /api/dashboard/blog/setup`** - Initialize database
```typescript
// Creates blog_post_status table if not exists
// Sets up RLS policies
// Creates triggers
```

### Dashboard Interface
- **Location:** `/dashboard/blog`
- **Features:**
  - View all posts (markdown + database)
  - Toggle queued/live/formatted status
  - Format posts with one click
  - Stats overview
  - Source tracking (where post came from)

### Current Status
✅ **Working:** Dashboard, status tracking, format API
⚠️ **Manual:** All status changes require clicking buttons
❌ **Missing:** Auto-formatting on generation, auto-publishing workflow

---

## 4. Markdown Files Storage

### Location
`/content/blog/` - 27 markdown files with YAML frontmatter

### File Structure
```yaml
---
title: "Blog Post Title"
date: 2026-01-16
author: B0ASE Team
category: Technology
tags: [AI, Agents, Enterprise]
excerpt: "Brief description for SEO and preview"
readingTime: "12 minutes"
featured: false
---

# Blog Post Title

Content goes here in markdown format...
```

### Index Generator Script
**`/scripts/generate-blog-index.ts`**
```typescript
// Reads all .md files in content/blog/
// Parses YAML frontmatter
// Generates TypeScript array in lib/blog.ts
// Usage: ts-node scripts/generate-blog-index.ts
```

### Blog Library
**`/lib/blog.ts`**
```typescript
// Static blogPosts[] array (30+ posts)
// Helper functions:
// - getBlogPost(slug): Find post by slug
// - getFeaturedPosts(): Get featured posts
// - getPostsByTag(tag): Filter by tag
```

### Current Status
✅ **Working:** 27 formatted markdown files, rendering on site
⚠️ **Problem:** Duplicate system - some posts in DB, some in markdown
❌ **Missing:** Auto-export from database to markdown, sync mechanism

---

## 5. Hybrid Storage Problem

### The Issue
Posts exist in **two places** causing confusion:

1. **Database (`blog_posts`)** - AI-generated posts
2. **Markdown files (`content/blog/`)** - Manual posts

### Why This is a Problem
- ❌ No single source of truth
- ❌ Database posts invisible until exported to markdown
- ❌ Markdown posts not tracked in database
- ❌ Status tracking inconsistent
- ❌ Cron jobs can't auto-publish database posts

### The Solution (To Be Implemented)
**Option A: Database as Source of Truth**
- All posts stored in `blog_posts` table
- Markdown files generated on-demand for Git history
- Blog page reads from database directly
- Vercel edge cache handles performance

**Option B: Markdown as Source of Truth**
- Database only for generation
- Auto-export to markdown immediately after generation
- Database tracks status only (not content)
- Git remains authoritative

**Recommended: Option B** (simpler, keeps Git history, no DB dependency on frontend)

---

## 6. Social Media Integration

### Purpose
Automatically post new blog posts to Twitter/X after publishing.

### Database Tables

**`social_accounts`**
```sql
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site TEXT NOT NULL,              -- 'b0ase.com', 'tokeniser.app'
  platform TEXT NOT NULL,          -- 'twitter', 'linkedin', etc.
  handle TEXT NOT NULL,            -- '@b0ase', '@b0ase_com'
  profile_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`post_queue`**
```sql
CREATE TABLE post_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  social_account_id UUID REFERENCES social_accounts(id),
  content_idea_id UUID REFERENCES content_ideas(id),
  post_content TEXT NOT NULL,      -- Tweet text (with link)
  status TEXT DEFAULT 'queued',    -- 'queued' | 'posted' | 'failed'
  scheduled_for TIMESTAMPTZ,       -- When to post (optional)
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`posted_content`**
```sql
CREATE TABLE posted_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  social_account_id UUID REFERENCES social_accounts(id),
  content_idea_id UUID REFERENCES content_ideas(id),
  post_content TEXT NOT NULL,
  post_url TEXT,                   -- URL to live tweet
  platform_post_id TEXT,           -- Twitter status ID
  posted_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Routes

**`GET /api/cron/queue`** - View queued posts
```typescript
// Query: ?account_id=uuid
// Returns: { queued: [...], posted: [...] }
```

**`POST /api/cron/post-next`** - Post next item from queue
```typescript
// Protected by CRON_SECRET
// Process:
1. Fetch oldest queued item
2. Post to Twitter API
3. Move to posted_content table
4. Delete from post_queue
```

**`DELETE /api/cron/queue/[id]`** - Remove from queue

### Tweet Format
```
🚀 {blog_title}

{blog_url}

#{tags} #b0ase #webdev
```

### Current Status
✅ **Working:** Queue system, Twitter posting, archive
⚠️ **Manual:** Posts must be added to queue manually
❌ **Missing:** Auto-add new blogs to queue after publishing

---

## 7. Cron Job Automation

### Purpose
Run scheduled tasks for blog generation and social posting.

### Environment Variable
```bash
CRON_SECRET=generate-secure-secret-for-cron-authentication
```

### Cron Routes

**`POST /api/cron/blog-post`** - Daily blog generation
```typescript
// Protected by CRON_SECRET in Authorization header
// Schedule: Daily at 8:00 AM (configure in Vercel)
// Process:
1. Fetch unused content ideas (used=false)
2. Pick one idea randomly or by priority
3. Call /api/blog/generate with contentIdeaId
4. Mark idea as used
5. Add generated post to social queue
6. Log results
```

**`POST /api/cron/twitter-post`** - Queue tweet from idea
```typescript
// Protected by CRON_SECRET
// Schedule: Multiple times daily (2x per day)
// Process:
1. Fetch unused 'tweet' type content ideas
2. Format tweet: "🚀 {title}\n\n{url}\n\n#b0ase"
3. Add to post_queue for @b0ase account
4. Mark idea as used
```

**`POST /api/cron/post-next`** - Post from queue
```typescript
// Protected by CRON_SECRET
// Schedule: Every 4 hours
// Process:
1. Get next queued post
2. Call Twitter API to post
3. Archive in posted_content
4. Remove from queue
```

### Vercel Cron Configuration
**`/vercel.json`** (needs to be created)
```json
{
  "crons": [
    {
      "path": "/api/cron/blog-post",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/cron/twitter-post",
      "schedule": "0 10,14 * * *"
    },
    {
      "path": "/api/cron/post-next",
      "schedule": "0 */4 * * *"
    }
  ]
}
```

### Current Status
✅ **Working:** Cron routes exist, authentication in place
⚠️ **Not Scheduled:** No vercel.json configuration
❌ **Missing:** Error handling, retry logic, monitoring

---

## 8. Content Assets System

### Purpose
Store images, videos, and documents for blog posts.

### Database Table: `content_assets`
```sql
CREATE TABLE content_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,         -- Path in Supabase Storage
  file_size BIGINT,
  mime_type TEXT,
  asset_type TEXT,                 -- 'image', 'video', 'audio', 'document'
  title TEXT,
  description TEXT,
  tags TEXT[],
  project_id UUID,
  metadata JSONB,                  -- Width, height, duration, etc.
  status TEXT DEFAULT 'active',    -- 'active' | 'archived'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Routes

**`POST /api/content-assets/upload`** - Upload file
```typescript
// Body: multipart/form-data
// Max size: 5GB
// Process:
1. Validate file type/size
2. Upload to Supabase Storage bucket: content-assets
3. Create database record with public URL
4. Return asset metadata
```

**`GET /api/content-assets`** - List assets
```typescript
// Query: ?type=image&status=active
// Returns: Array of asset objects
```

**`PATCH /api/content-assets/[id]`** - Update metadata

**`DELETE /api/content-assets/[id]`** - Delete asset
```typescript
// Process:
1. Delete from Supabase Storage
2. Delete database record
```

### Current Status
✅ **Working:** Upload, storage, metadata tracking
⚠️ **Unused:** Not integrated with blog generation yet
❌ **Missing:** AI image generation, auto-featured images for posts

---

## 9. Blog Display Frontend

### Blog List Page
**`/app/blog/page.tsx`**
- Grid layout of blog post cards
- Filtering by category/tags
- Search functionality
- Featured posts section

### Blog Post Page
**`/app/blog/[slug]/page.tsx`**
- Renders markdown content with ReactMarkdown
- Displays frontmatter metadata
- Social share buttons
- Related posts section
- Comments (if enabled)
- View counter (updates on view)

### Current Status
✅ **Working:** Display, rendering, SEO metadata
⚠️ **Hybrid:** Reads from both markdown files and database
❌ **Missing:** Unified content source

---

## 10. Blog Categories System

### Database Table: `blog_categories`
```sql
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default categories
INSERT INTO blog_categories (name, slug, description) VALUES
('Technology', 'technology', 'Tech tutorials, frameworks, tools'),
('Business', 'business', 'Entrepreneurship, strategy, growth'),
('Tutorial', 'tutorial', 'Step-by-step guides and how-tos'),
('Product', 'product', 'Product updates and feature releases'),
('Innovation', 'innovation', 'Emerging tech and future trends');
```

### Current Status
✅ **Created:** Database table exists
⚠️ **Unused:** Not enforced in blog generation
❌ **Missing:** Category filtering on frontend

---

## Summary of Current State

### What's Working ✅
1. Content ideas bucket (manual entry)
2. AI blog generation (Google Gemini)
3. Database storage for posts
4. Status tracking dashboard
5. Social media queue system
6. Twitter posting automation (manual trigger)
7. Markdown file rendering
8. Blog display frontend

### What Needs Connecting ⚠️
1. **Database → Markdown export** - Auto-export generated posts to `content/blog/`
2. **Auto-publishing** - Move posts from draft to published automatically
3. **Cron scheduling** - Set up Vercel cron jobs
4. **Social auto-queue** - Add new blogs to post queue automatically
5. **Unified storage** - Decide single source of truth (DB or markdown)

### What's Missing ❌
1. **Idea scraping** - Automated content idea collection (RSS, Twitter, GitHub)
2. **SEO optimization** - Meta tags, OpenGraph, schema markup
3. **Featured images** - AI-generated images for posts
4. **Email notifications** - Alert on new post published
5. **Analytics tracking** - View counts, engagement metrics
6. **Error handling** - Retry logic, monitoring, alerts
7. **Content review** - Optional human review before publishing
8. **Multi-author support** - Author profiles, bios, avatars

---

## File Paths Reference

### API Routes
- `/app/api/blog/generate/route.ts` - AI blog generation
- `/app/api/blog/list/route.ts` - List published posts
- `/app/api/content-ideas/route.ts` - Content bucket CRUD
- `/app/api/content-ideas/[id]/route.ts` - Individual idea management
- `/app/api/dashboard/blog/route.ts` - Dashboard data aggregation
- `/app/api/dashboard/blog/[slug]/status/route.ts` - Update post status
- `/app/api/dashboard/blog/[slug]/format/route.ts` - Format markdown
- `/app/api/dashboard/blog/setup/route.ts` - Database initialization
- `/app/api/content-assets/route.ts` - Asset management
- `/app/api/content-assets/upload/route.ts` - File uploads
- `/app/api/cron/blog-post/route.ts` - Blog generation cron
- `/app/api/cron/twitter-post/route.ts` - Twitter queue cron
- `/app/api/cron/post-next/route.ts` - Social posting cron
- `/app/api/cron/queue/route.ts` - View queue
- `/app/api/cron/queue/[id]/route.ts` - Queue item management

### Dashboard Pages
- `/app/dashboard/blog/page.tsx` - Blog management interface
- `/app/admin/content/page.tsx` - Content ideas bucket UI

### Frontend Pages
- `/app/blog/page.tsx` - Blog list
- `/app/blog/[slug]/page.tsx` - Blog post display

### Utilities
- `/lib/blog.ts` - Blog post helpers
- `/scripts/generate-blog-index.ts` - Markdown index generator
- `/fetch-blog-post.js` - Database query script

### Content
- `/content/blog/` - 27 markdown files

### Database Tables
- `content_ideas` - Content bucket
- `blog_posts` - Generated posts
- `blog_post_status` - Status tracking
- `blog_categories` - Post categories
- `content_assets` - Media files
- `social_accounts` - Social profiles
- `post_queue` - Scheduled posts
- `posted_content` - Posted archive

---

## Next Steps

See `/docs/BLOG_SYSTEM_IMPLEMENTATION_PLAN.md` for detailed implementation roadmap.
