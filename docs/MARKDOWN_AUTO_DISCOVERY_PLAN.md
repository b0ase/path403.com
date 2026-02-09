# Markdown Auto-Discovery Implementation Plan for b0ase.com

**Status**: PLANNED (0% implemented)
**Last Updated**: 2026-01-19

---

## Executive Summary

Implement Markdown auto-discovery on b0ase.com to optimize for AI search engines and crawlers. Based on Dries Buytaert's successful experiment, we expect hundreds of AI crawler requests within hours of deployment.

**Goals**:
1. Make b0ase.com content AI-readable
2. Increase visibility in AI search results
3. Track attribution and ROI
4. Experiment with GEO (Generative Engine Optimization)

**Timeline**: 2-3 days for implementation, 30-day experiment

## Background: Why This Matters

### The Third Audience

For 20 years, we optimized for:
1. **Humans** (UX, design, readability)
2. **Search Engines** (SEO, meta tags, sitemaps)

Now there's a third:
3. **AI Agents** (ClaudeBot, GPTBot, Perplexity, etc.)

### Current Problem

When AI crawlers visit b0ase.com, they get HTML with:
- Navigation menus
- Footer links
- Cookie banners
- Wrapper divs
- Low signal-to-noise ratio

Our content already exists as Markdown in our CMS. We're just not serving it to AI agents.

### Expected Results

Based on Dries' experiment:
- **1 hour**: ~100-200 requests from AI crawlers
- **24 hours**: ~1,500-2,000 requests
- **Major crawlers**: ClaudeBot, GPTBot, OpenAI SearchBot, Perplexity

## Implementation Approach

### Three-Part System

1. **Content Negotiation**: Respond with Markdown when `Accept: text/markdown` header present
2. **.md URL Suffix**: Allow appending `.md` to any URL
3. **Auto-Discovery**: Add `<link rel="alternate">` tag to announce Markdown version

## Technical Implementation

### Assuming b0ase.com Stack

**Framework**: Next.js 14 (App Router)
**Content**: Markdown files or CMS
**Hosting**: Vercel

### Step 1: Content Negotiation Middleware

```typescript
// middleware.ts
import { NextResponse, NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const acceptHeader = request.headers.get('accept')

  // If requesting Markdown, rewrite to .md route
  if (acceptHeader?.includes('text/markdown')) {
    const url = request.nextUrl.clone()

    // Don't rewrite if already .md
    if (!url.pathname.endsWith('.md')) {
      url.pathname = url.pathname + '.md'
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/blog/:path*',
    '/services/:path*',
    '/case-studies/:path*',
    '/docs/:path*'
  ]
}
```

### Step 2: .md Route Handlers

#### For Blog Posts

```typescript
// app/blog/[slug]/route.ts
import { getPostBySlug } from '@/lib/posts'
import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  // Handle .md suffix
  const slug = params.slug.endsWith('.md')
    ? params.slug.slice(0, -3)
    : params.slug

  const post = await getPostBySlug(slug)

  if (!post) {
    return new Response('Not found', { status: 404 })
  }

  // Generate Markdown with frontmatter
  const markdown = `---
title: ${post.title}
date: ${post.date}
author: ${post.author}
tags: [${post.tags.join(', ')}]
description: ${post.description}
url: https://b0ase.com/blog/${slug}
---

${post.content}
`

  return new Response(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*', // Allow AI crawlers
    }
  })
}
```

#### For Service Pages

```typescript
// app/services/[slug]/route.ts
import { getServiceBySlug } from '@/lib/services'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug.replace('.md', '')
  const service = await getServiceBySlug(slug)

  if (!service) {
    return new Response('Not found', { status: 404 })
  }

  const markdown = `---
title: ${service.title}
type: service
category: ${service.category}
url: https://b0ase.com/services/${slug}
---

# ${service.title}

${service.description}

## What We Provide

${service.features.map(f => `- ${f}`).join('\n')}

## Pricing

${service.pricing}

## Contact

Ready to get started? [Contact us](https://b0ase.com/contact)
`

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}
```

### Step 3: Auto-Discovery Link Tags

Add to HTML pages:

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)

  return {
    title: post.title,
    description: post.description,
    alternates: {
      types: {
        'text/markdown': `https://b0ase.com/blog/${params.slug}.md`
      }
    },
    // Standard meta tags...
  }
}

export default async function BlogPost({ params }) {
  const post = await getPostBySlug(params.slug)

  return (
    <>
      {/* Auto-discovery link (alternative approach if Metadata doesn't work) */}
      <link
        rel="alternate"
        type="text/markdown"
        href={`https://b0ase.com/blog/${params.slug}.md`}
      />

      <article>
        {/* Render HTML */}
      </article>
    </>
  )
}
```

### Step 4: robots.txt Configuration

Allow AI crawlers:

```
# robots.txt
User-agent: ClaudeBot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: OpenAI-SearchBot
Allow: /

User-agent: Google-Extended
Allow: /

# Allow Markdown requests
User-agent: *
Allow: /*.md$

# Sitemap
Sitemap: https://b0ase.com/sitemap.xml
Sitemap: https://b0ase.com/sitemap-markdown.xml
```

### Step 5: Markdown Sitemap

Create dedicated sitemap for Markdown URLs:

```typescript
// app/sitemap-markdown.xml/route.ts
import { getAllPosts } from '@/lib/posts'
import { getAllServices } from '@/lib/services'

export async function GET() {
  const posts = await getAllPosts()
  const services = await getAllServices()

  const urls = [
    ...posts.map(p => ({
      url: `https://b0ase.com/blog/${p.slug}.md`,
      lastModified: p.updatedAt || p.publishedAt,
      changeFrequency: 'weekly',
      priority: 0.8
    })),
    ...services.map(s => ({
      url: `https://b0ase.com/services/${s.slug}.md`,
      lastModified: s.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7
    }))
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ url, lastModified, changeFrequency, priority }) => `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date(lastModified).toISOString()}</lastmod>
    <changefreq>${changeFrequency}</changefreq>
    <priority>${priority}</priority>
  </url>
`).join('')}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}
```

## Content Optimization for AI

### Enhanced Frontmatter

```yaml
---
title: Building AI-Powered Content Businesses
description: Professional framework for AI-powered content operations
author: b0ase.com
date: 2026-01-15
updated: 2026-01-16
tags: [AI, Content, Automation, Business]
category: Guides
type: blog-post
reading_time: 12 minutes
toc: true
related:
  - ai-content-engines
  - agent-skills
canonical_url: https://b0ase.com/blog/ai-content-businesses
---
```

### Structured Content

```markdown
# Building AI-Powered Content Businesses

> **Summary**: This guide explains how to build scalable AI-powered content operations for businesses.

## Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Implementation](#implementation)

## The Problem

Traditional content creation doesn't scale...

### Challenges

1. **High labor costs** - Hiring creators, editors
2. **Time-intensive** - Manual work
3. **Inconsistent output** - Varies with energy

## The Solution

AI content infrastructure automates...

### Our Approach

We build **AI Content Engines** that:
- Research content topics
- Generate high-quality content
- Distribute across platforms
- Track performance

[Learn more about our AI Content Engine service](/services/ai-content-engine)

---

*Questions? [Contact b0ase.com](https://b0ase.com/contact)*
```

### Internal Linking

Liberal internal linking helps AI understand relationships:

```markdown
Our [AI Content Engine](/services/ai-content-engine) integrates with
[multi-platform deployment](/services/deployment) and follows our
[coding standards](/docs/standards).

Related articles:
- [Agent Skills for AI Development](/blog/agent-skills)
- [Security Check Automation](/blog/security-automation)
```

## Tracking and Analytics

### 1. Server-Side Logging

```typescript
// middleware.ts - Track AI crawler requests
export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || ''
  const acceptHeader = request.headers.get('accept') || ''

  // Detect AI crawlers
  const aiCrawlers = [
    'ClaudeBot',
    'GPTBot',
    'OpenAI-SearchBot',
    'PerplexityBot',
    'Google-Extended',
    'anthropic-ai',
    'ChatGPT'
  ]

  const isAICrawler = aiCrawlers.some(bot => userAgent.includes(bot))
  const requestsMarkdown = acceptHeader.includes('text/markdown')

  if (isAICrawler || requestsMarkdown) {
    // Log to analytics
    trackAICrawler({
      bot: userAgent,
      path: request.nextUrl.pathname,
      timestamp: new Date(),
      acceptHeader,
      referer: request.headers.get('referer')
    })
  }

  // Continue with content negotiation...
}
```

### 2. Analytics Dashboard

Track metrics:
- **AI crawler traffic** (volume, bot types, paths)
- **Human traffic trends** (compare before/after)
- **Conversion attribution** (referrals from AI tools)
- **Citation frequency** (mentions in AI responses)

### 3. Brand Monitoring

Use tools to track AI citations:
- Google Alerts for "b0ase.com"
- Perplexity search for brand mentions
- Claude/ChatGPT response monitoring
- Manual testing with AI search queries

## Testing Checklist

Before deployment:

### Local Testing

```bash
# Test .md suffix
curl http://localhost:3000/blog/test-post.md

# Test content negotiation
curl -H "Accept: text/markdown" http://localhost:3000/blog/test-post

# Test auto-discovery
curl -s http://localhost:3000/blog/test-post | grep 'rel="alternate"'
```

### Production Testing

```bash
# Verify .md URLs work
curl https://b0ase.com/blog/ai-content-engines.md

# Check content negotiation
curl -H "Accept: text/markdown" https://b0ase.com/blog/ai-content-engines

# Verify auto-discovery link
curl -s https://b0ase.com/blog/ai-content-engines | \
  grep 'type="text/markdown"'
```

### Validation

- [ ] All blog posts return valid Markdown
- [ ] Frontmatter includes required fields
- [ ] Internal links preserved in Markdown
- [ ] Images have alt text
- [ ] No HTML in Markdown output
- [ ] Cache headers set correctly
- [ ] robots.txt allows AI crawlers
- [ ] Sitemap includes .md URLs

## Experiment Metrics

### Week 1 Metrics

Track daily:
- AI crawler requests (count, bot types)
- .md URL requests vs regular requests
- Top requested content
- Error rates

### Month 1 Metrics

Track weekly:
- Human traffic trends (up/down?)
- Direct traffic vs organic
- Time on site changes
- Bounce rate changes
- Conversion rate impact

### Attribution Tracking

Monitor:
- AI tool citations (search b0ase.com in Perplexity, Claude, ChatGPT)
- Referral traffic from AI tools
- Brand searches (Google Trends for "b0ase")
- Client mentions of AI discovery

## Risks and Mitigations

### Risk 1: Decreased Human Traffic

**Mitigation**:
- Track closely in first 30 days
- Can disable if traffic drops significantly
- Focus on conversion quality over quantity

### Risk 2: Content Scraping

**Mitigation**:
- Include copyright notice in Markdown
- Add "Source: b0ase.com" attribution line
- Monitor unauthorized use
- Can restrict via robots.txt if abused

### Risk 3: No Attribution from AI Tools

**Mitigation**:
- Track citation frequency
- Test manually with AI searches
- Optimize content for attribution
- Include clear brand signals

### Risk 4: SEO Impact

**Mitigation**:
- Canonical URLs in Markdown frontmatter
- Keep HTML as primary version
- Monitor Google Search Console
- Can add noindex to .md URLs if needed

## Content Strategy Adjustments

### 1. Optimize for AI Consumption

**Structure**:
- Clear hierarchical headings
- Bullet points over paragraphs
- Define key terms
- Include examples

**Metadata**:
- Comprehensive frontmatter
- Explicit topic tags
- Related content links
- Author attribution

### 2. Attribution Signals

Add to all Markdown:

```markdown
---
source: b0ase.com
canonical_url: https://b0ase.com/blog/post-slug
author: b0ase.com
attribution_required: true
---

# Article Title

[Article content...]

---

**Source**: [b0ase.com](https://b0ase.com) | Professional AI and deployment services

*Found this useful? [Work with us](https://b0ase.com/contact)*
```

### 3. Internal Link Structure

Create strong internal link graph:
- Service pages link to case studies
- Blog posts link to services
- Documentation links to examples
- Create topic clusters

## Rollout Plan

### Phase 1: Pilot (Week 1)

- [ ] Implement on `/blog` section only
- [ ] Test with 5-10 recent posts
- [ ] Monitor AI crawler activity
- [ ] Validate Markdown quality
- [ ] Fix any issues

### Phase 2: Expand (Week 2)

- [ ] Add `/services` pages
- [ ] Add `/case-studies` section
- [ ] Add `/docs` if applicable
- [ ] Create Markdown sitemap
- [ ] Submit to search engines

### Phase 3: Optimize (Weeks 3-4)

- [ ] Analyze top-requested content
- [ ] Optimize frontmatter based on data
- [ ] Improve internal linking
- [ ] Add attribution signals
- [ ] A/B test content structures

### Phase 4: Report (Day 30)

- [ ] Publish results blog post
- [ ] Share data (traffic, attribution, ROI)
- [ ] Decide on permanent implementation
- [ ] Plan next experiments

## Success Criteria

### Quantitative

- [ ] 500+ AI crawler requests in first 24 hours
- [ ] 5+ different AI bots accessing content
- [ ] <5% decrease in human traffic (or increase)
- [ ] 3+ citations found in AI responses
- [ ] 1+ client acquisition attributed to AI discovery

### Qualitative

- [ ] Markdown validates correctly
- [ ] Content reads well in Markdown
- [ ] No technical errors or issues
- [ ] Positive or neutral SEO impact
- [ ] Learning and insights gained

## Documentation

Create documentation:
- [ ] Developer guide for adding Markdown support
- [ ] Content guidelines for AI optimization
- [ ] Analytics tracking guide
- [ ] Troubleshooting common issues

## Future Experiments

Based on initial results:

### Experiment 2: JSON-LD Structured Data

Add comprehensive structured data:
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "...",
  "author": { "@type": "Organization", "name": "b0ase.com" },
  "publisher": {...},
  "datePublished": "...",
  "description": "..."
}
```

### Experiment 3: Alternative Formats

Test other AI-friendly formats:
- JSON (structured content)
- Plain text (ultra-clean)
- XML (semantic markup)

### Experiment 4: AI-Specific Content

Create content specifically for AI consumption:
- FAQ pages in Q&A format
- Technical specifications as structured data
- API docs in OpenAPI format

## Resources

- **Dries' Article**: https://dri.es/the-third-audience
- **Markdown Spec**: https://commonmark.org/
- **Next.js Metadata**: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- **AI Crawler Docs**:
  - ClaudeBot: https://support.anthropic.com/en/articles/8896518
  - GPTBot: https://platform.openai.com/docs/gptbot
  - PerplexityBot: https://docs.perplexity.ai/docs/perplexitybot

## Conclusion

Markdown auto-discovery is a low-risk, high-potential experiment for b0ase.com. With 2-3 days of implementation, we'll have:
- AI-optimized content delivery
- Data on AI crawler behavior
- Insights into GEO/AEO effectiveness
- Foundation for future AI content strategy

Expected outcome: Hundreds of AI crawler requests within hours, potential increase in brand visibility through AI search, and valuable data on the "third audience" phenomenon.

**Next Step**: Implement Phase 1 pilot on `/blog` section.
