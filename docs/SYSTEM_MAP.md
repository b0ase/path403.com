# b0ase.com System Map

**Last Updated**: 2026-01-19

> **Security Note**: SSH access requires key-based authentication only. Server IP is documented here for operational purposes - security relies on proper SSH configuration, not obscurity.

> **📚 Part of the documentation hierarchy** - See [DOC_INDEX.md](DOC_INDEX.md) for all documentation.
>
> **👈 Back to main guide** - See [../CLAUDE.md](../CLAUDE.md) for overall project instructions.

## Infrastructure

### Production Server - Hetzner
- **IP**: REDACTED_HOST
- **SSH Access**: `ssh hetzner` (uses ~/.ssh/hetzner key)
- **SSH Config**: Defined in ~/.ssh/config
- **Services Running**: Supabase stack in Docker

### Database - PostgreSQL (Self-Hosted Supabase)
- **Type**: Self-hosted Supabase stack (NOT cloud supabase.com)
- **Container**: `supabase-db`
- **Access**: `ssh hetzner "docker exec supabase-db psql -U postgres -d postgres"`
- **Port**: 54322 (mapped to host)
- **Database Name**: `postgres` (default) and `b0ase` for blog content
- **Studio**: Access via SSH tunnel or direct if exposed

### Key Tables
- `blog_posts` - Database-stored blog content (some posts here, not in markdown)
  - Fields: slug, title, content, tags, status, published_at
  - Used for dynamically generated/managed posts
- Static blog posts also exist as markdown in `content/blog/*.md`

## Content Architecture

### Blog Posts - TWO SOURCES
1. **Markdown Files** (`content/blog/*.md`)
   - Static posts with frontmatter
   - Rendered by Next.js at build time
   - 27+ posts currently

2. **Database Posts** (PostgreSQL `blog_posts` table)
   - Dynamically managed content
   - Example: "building-ai-agents-that-actually-work"
   - Rendered from database at request time
   - Allows for programmatic generation/editing

### Blog Rendering Logic (`app/blog/[slug]/page.tsx`)
1. Try database first (line 52)
2. Fallback to static markdown (line 195)
3. This is why some posts exist only in DB

## File Structure

### Key Directories
```
/content/blog/          - Markdown blog posts
/app/blog/              - Blog rendering pages
/lib/blog.ts            - Blog metadata and utilities
/lib/contexts/          - React contexts (consolidated)
/lib/database/          - Shared database pool
/lib/integrations/      - Shared API clients (Twitter, etc)
/components/            - React components (flat structure)
/.claude/skills/        - Custom skills (blog-formatter, security-check, etc)
```

### Important Files
- `lib/blog.ts` - Static blog post definitions
- `app/blog/[slug]/page.tsx` - Blog rendering with DB fallback
- `lib/database/pool.ts` - Shared PostgreSQL connection pool
- `lib/integrations/twitter.ts` - Shared Twitter API client

## Environment Variables

### Local (.env.local)
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `TWITTER_*` - Twitter API credentials
- `HANDCASH_*` - HandCash wallet credentials
- `GITHUB_*` - GitHub OAuth credentials

### Production (Vercel)
Same variables set in Vercel dashboard

## Deployment

### Automatic Deployment
- **Trigger**: Push to `main` branch
- **Platform**: Vercel
- **Build**: Next.js production build
- **Static Generation**: 569 pages pre-rendered

### Manual Access
```bash
# SSH to Hetzner
ssh hetzner

# Query database
ssh hetzner "docker exec supabase-db psql -U postgres -d postgres -c 'SELECT * FROM blog_posts;'"

# Check containers
ssh hetzner "docker ps"
```

## Known Issues & Patterns

### Blog Formatting
- Well-formatted example: "building-ai-agents-that-actually-work" (database)
- Issues: Some markdown posts lack proper spacing after headings
- Solution: blog-formatter skill ensures spacing

### Code Organization
- ✅ Database pools: Consolidated to `lib/database/pool.ts`
- ✅ Twitter client: Consolidated to `lib/integrations/twitter.ts`
- ✅ Contexts: Consolidated to `lib/contexts/`
- ⚠️ Components: Still flat directory (57+ files)
- ⚠️ lib/data.ts: Massive file (2,044 lines) needs breaking up

## Access Patterns

### When Working on Blog
1. Check if post exists in database first
2. Fall back to markdown files
3. Use SSH + Docker to query DB when needed
4. Markdown posts use blog-formatter skill for consistency

### When Making Code Changes
1. Always use pnpm (never npm/yarn)
2. Run security-check before committing sensitive code
3. Use shared modules (database/pool.ts, integrations/*.ts)
4. Build succeeds = good to push

## Quick Commands Reference

```bash
# Blog database query
ssh hetzner "docker exec supabase-db psql -U postgres -d postgres -c \"SELECT title, slug FROM blog_posts;\""

# Export blog post
ssh hetzner "docker exec supabase-db psql -U postgres -d postgres -t -c \"SELECT content FROM blog_posts WHERE slug = 'post-slug';\"" > output.md

# Check Docker services
ssh hetzner "docker ps"

# Local development
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm test         # Run tests

# Git workflow
git add .
git commit -m "message"
git push          # Auto-deploys to Vercel
```

## Architecture Decisions

### Why Database + Markdown?
- **Database**: Allows programmatic blog post generation (AI-written content, bulk imports)
- **Markdown**: Traditional blog post workflow, git-tracked, easy to edit
- **Both**: Flexibility for different content workflows

### Why Supabase on Hetzner?
- Cost optimization (cheaper than hosted Supabase)
- Full control over infrastructure
- Direct PostgreSQL access

### Why Shared Modules?
- Prevents connection pool exhaustion
- Consistent configuration
- Single source of truth

## System State (Current)

- ✅ 27+ markdown blog posts
- ✅ Database blog posts (unknown count, need to query)
- ✅ Shared database pool implemented
- ✅ Shared Twitter client implemented
- ✅ Contexts consolidated
- ✅ Blog-formatter with auto-spacing
- ⚠️ Some blog posts need formatting fixes
- ⚠️ Components directory needs organization
- ⚠️ lib/data.ts needs breaking up

## Never Forget

1. **SSH access exists** - Always check Hetzner first for database queries
2. **Blog posts have TWO sources** - Database AND markdown
3. **Well-formatted example** - "building-ai-agents-that-actually-work" in database
4. **Shared modules exist** - Use them, don't recreate pools/clients
5. **pnpm only** - Never use npm or yarn
6. **Security check** - Run before committing auth/payment code
