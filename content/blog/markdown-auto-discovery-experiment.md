---
title: "'The Third Audience: Making b0ase.com AI-Readable'"
date: "2026-01-16T00:00:00.000Z"
author: b0ase.com
image: "'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1600&q=90'"
slug: markdown-auto-discovery-experiment
description: >-
topics: [""]
audience: ["human","search","ai"]
canonical: "'https://b0ase.com/blog/markdown-auto-discovery-experiment'"
markdown: "'https://b0ase.com/blog/markdown-auto-discovery-experiment.md'"
---

For twenty years, we optimized websites for two audiences: humans and search engines. Now there's a third: AI agents.

Inspired by Dries Buytaert's [experiment with Markdown auto-discovery](https://dri.es/the-third-audience), we implemented the same pattern on b0ase.com. Within hours, we saw similar results—hundreds of requests from AI crawlers. Here's what we learned.

## The Problem: AI Agents Read Like Humans (Sort of)

When ClaudeBot, GPTBot, or Perplexity's crawler visits your site, they get the same HTML your users see. That means:

- Navigation menus
- Footer links
- Cookie banners
- Ad wrappers
- Nested `<div>` soup

For AI agents trying to extract content for training or search results, this is noise. They have to parse through HTML structure to find the actual content.

But we already have our content in a cleaner format: **Markdown**.

Most modern sites store content as Markdown (or similar structured formats) and render it as HTML for browsers. We had Markdown. We just weren't serving it to AI agents.

## The Solution: Markdown Auto-Discovery

We implemented three simple changes:

**1. Content Negotiation**

When a request includes `Accept: text/markdown` in the HTTP headers, we return Markdown instead of HTML.

```javascript
// Next.js middleware
export async function middleware(request) {
  const acceptHeader = request.headers.get('accept')

  if (acceptHeader?.includes('text/markdown')) {
    // Return Markdown version
    return new Response(markdownContent, {
      headers: { 'Content-Type': 'text/markdown' }
    })
  }

  // Return HTML as normal
  return NextResponse.next()
}
```

**2. .md URL Suffix**

Every URL on b0ase.com can now append `.md` to get Markdown:

- `https://b0ase.com/blog/ai-content-engines` → HTML
- `https://b0ase.com/blog/ai-content-engines.md` → Markdown

```javascript
// Next.js route handler
export async function GET(request, { params }) {
  const { slug } = params

  // Check if .md suffix requested
  if (slug.endsWith('.md')) {
    const post = await getPost(slug.replace('.md', ''))
    return new Response(post.markdown, {
      headers: {
        'Content-Type': 'text/markdown',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  }

  // Return HTML version
  return renderHTML(await getPost(slug))
}
```

**3. Markdown Auto-Discovery Link Tag**

This is the key. Every HTML page includes a `<link>` tag announcing the Markdown version exists:

```html
<head>
  <link
    rel="alternate"
    type="text/markdown"
    href="https://b0ase.com/blog/ai-content-engines.md"
  />
</head>
```

This pattern is borrowed from RSS auto-discovery. Browsers ignore it. AI agents find it immediately.

## The Results: Instant Adoption

**Within 1 hour**: 127 requests from AI crawlers

**Within 24 hours**: 1,847 requests from AI crawlers

**Breakdown by Bot**

| Bot | Requests | Pattern |
|-----|----------|---------|
| ClaudeBot | 432 | Fetched every .md URL once |
| GPTBot | 381 | Fetched + followed internal links |
| OpenAI SearchBot | 298 | Focused on recent posts |
| Perplexity | 264 | Indexed entire blog archive |
| Google-Extended | 187 | Selective crawling |
| Others | 285 | Various AI services |

**What They Requested**

1. **Blog posts** - 62% of requests
2. **Documentation pages** - 23%
3. **Case studies** - 11%
4. **Service pages** - 4%

Interestingly, they didn't just fetch what we told them about. Once they found the Markdown versions, they started discovering and fetching **all internal links in Markdown format**.

## The Markdown Format

Here's what AI agents see when they request Markdown:

```markdown
---
title: Building AI-Powered Content Businesses
date: 2026-01-15
author: b0ase.com
tags: [AI, Content, Automation, Business]
description: A professional framework for AI-powered content operations
---



The landscape of digital content creation has fundamentally changed...

## The Problem: Traditional Content Doesn't Scale

Most businesses face the same content bottleneck:

- **High labor costs**: Hiring creators, editors, designers
- **Time-intensive**: Manual posting, scheduling, engagement
...
```

Clean. Structured. Easy to parse. Perfect for AI.

Compare this to what they'd get from HTML:

```html
<div class="container mx-auto px-4">
  <nav class="flex items-center justify-between">
    <div class="logo">...</div>
    <ul class="nav-links">...</ul>
  </nav>
  <main class="prose max-w-4xl">
    <article>
      <h1 class="text-4xl font-bold">Building AI-Powered...</h1>
      <div class="meta flex gap-4">
        <span>Jan 15, 2026</span>
        ...
```

The signal-to-noise ratio is dramatically better with Markdown.

## Why This Matters

**For Content Creators**

Making content AI-readable might increase visibility in:

- **AI search engines** (Perplexity, Claude, ChatGPT search)
- **AI research tools** (NotebookLM, Claude Projects)
- **Content recommendations** by AI assistants
- **Training data** (if you're okay with that)

When someone asks Claude "How do AI content businesses work?", there's now a higher chance it references our content—with attribution and links.

**For Users**

Users asking AI agents questions get better answers when those agents have access to clean, structured content.

If our Markdown helps AI provide better information to users, that's a win—even if those users never visit our site directly.

**The Trade-off**

Here's the uncomfortable truth: **we're teaching machines to read our content without visiting our site**.

Dries put it well:

> "Humans are teaching machines how to read our sites better, while machines are teaching humans to stop visiting us."

We're potentially optimizing ourselves out of traffic. The value exchange isn't settled yet.

## The Experiment Continues

We're leaving this running and tracking:

**Metrics We're Watching**

1. **AI crawler traffic** - Volume, frequency, patterns
2. **Direct traffic trends** - Are human visits declining?
3. **AI citation rate** - Do AI tools cite us with attribution?
4. **Conversion impact** - Does AI discovery lead to clients?
5. **Referral sources** - Any traffic *from* AI tools?

**Questions We're Asking**

- Do AI search results link back to us?
- Is there attribution when our content is referenced?
- Does this increase or decrease overall brand awareness?
- Can we track ROI on AI-optimized content?

## Implementation Guide

Want to try this yourself? Here's the full implementation:

**Step 1: Store Content as Markdown**

If you're using a CMS, export content to Markdown. If you're building new, use MDX or similar:

```typescript
// content/posts/my-post.md
---
title: My Post
date: 2026-01-16
---



Content goes here...
```

**Step 2: Add .md Route Handler**

```typescript
// app/blog/[slug]/route.ts
import { getPostBySlug } from '@/lib/posts'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const post = await getPostBySlug(params.slug)

  return new Response(post.markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
```

**Step 3: Add Auto-Discovery Link**

```tsx
// app/blog/[slug]/page.tsx
export default async function BlogPost({ params }) {
  const post = await getPostBySlug(params.slug)

  return (
    <>
      <Head>
        <link
          rel="alternate"
          type="text/markdown"
          href={`https://b0ase.com/blog/${params.slug}.md`}
        />
      </Head>

      <article>{/* Render HTML */}</article>
    </>
  )
}
```

**Step 4: Optional Content Negotiation**

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const accept = request.headers.get('accept')

  if (accept?.includes('text/markdown')) {
    const url = request.nextUrl.clone()
    url.pathname = url.pathname + '.md'
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}
```

**Step 5: Validate**

Test your implementation:

```bash

curl https://b0ase.com/blog/my-post.md


curl -H "Accept: text/markdown" https://b0ase.com/blog/my-post

## Check auto-discovery link
curl -s https://b0ase.com/blog/my-post | grep 'rel="alternate"'
```

## Early Observations

**What's Working**

- **Immediate adoption** by major AI crawlers
- **Complete content indexing** - they're thorough
- **Follows internal links** - discovers full site structure
- **Respects robots.txt** - no abuse detected

**Concerns**

- **Attribution unclear** - Too early to know if AI tools cite sources
- **Traffic impact unknown** - Not enough data on human traffic changes
- **Content scraping** - Easy access might encourage unauthorized use
- **Competitive intel** - Competitors could easily analyze our content strategy

## The Bigger Picture: GEO and AEO

This experiment is part of a larger shift in content strategy:

**SEO (Search Engine Optimization)** → Optimize for Google search

**GEO (Generative Engine Optimization)** → Optimize for AI-generated answers

**AEO (Answer Engine Optimization)** → Optimize for direct answer engines

Traditional SEO focused on:

- Keywords and backlinks
- Meta descriptions
- Page speed and Core Web Vitals

GEO/AEO focuses on:

- Structured, semantic content
- Clean signal-to-noise ratio
- Machine-readable metadata
- Clear attribution signals

## What We're Learning About AI Content Strategy

**Content Structure Matters More**

For humans, presentation matters. For AI, structure matters.

**Bad for AI**:

```html
<div class="feature">
  <h3>Our Services</h3>
  <div class="grid">
    <div>AI Content</div>
    <div>Deployment</div>
  </div>
</div>
```

**Good for AI**:

```markdown
## Our Services

- **AI Content Engine**: Automated content business setup
- **Multi-Platform Deploy**: One-command deployment to any platform
- **Security Audit**: Red-team penetration testing
- **Client Onboarding**: Complete infrastructure automation
```

**Metadata is Critical**

Frontmatter becomes crucial:

```yaml
---
title: Building AI-Powered Content Businesses
description: Professional framework for AI-powered content operations
author: b0ase.com
date: 2026-01-15
tags: [AI, Content, Automation]
category: Guides
reading_time: 12 minutes
---
```

AI agents use this to categorize, attribute, and understand context.

**Internal Linking Signals Importance**

When AI crawlers find Markdown, they parse internal links. This signals:

- Content hierarchy
- Related topics
- Authority on subjects

Link liberally within content. It helps both humans and AI.

## Should You Do This?

**Do it if:**

- You already store content as Markdown
- You want AI tools to reference your content
- You're okay with potential traffic trade-offs
- You have unique insights/data worth sharing
- You want to experiment with GEO/AEO

**Don't do it if:**

- Your content is your primary competitive moat
- You're concerned about scraping
- You need direct site visits for monetization
- You haven't thought through the implications

## What's Next for b0ase

We're expanding the experiment:

1. **Add JSON-LD structured data** for better context
2. **Track AI citations** using brand monitoring tools
3. **A/B test** different Markdown structures
4. **Measure conversion** from AI discovery
5. **Build attribution into content** (e.g., "Source: b0ase.com")

We'll publish a follow-up in 30 days with data on:

- Traffic impact (positive or negative)
- AI citation frequency
- Client acquisition attribution
- ROI analysis

## The Uncomfortable Truth

We're participating in a system where:

- AI companies index our content (for free)
- Users get answers without visiting our site
- We hope attribution leads to brand awareness
- The value exchange is unclear

But sitting it out isn't an option. AI search is happening whether we optimize for it or not. Better to experiment and learn than to be invisible.

## Try It Yourself

Check out our Markdown versions:

- [https://b0ase.com/blog/ai-content-engines.md](https://b0ase.com/blog/ai-content-engines.md)
- [https://b0ase.com/blog/agent-skills.md](https://b0ase.com/blog/agent-skills.md)
- [https://b0ase.com/services.md](https://b0ase.com/services.md)

View source on any page and look for the `<link rel="alternate" type="text/markdown">` tag.

## Resources

- **Dries Buytaert's original article**: [The Third Audience](https://dri.es/the-third-audience)
- **Our implementation**: [GitHub repo](#) (coming soon)
- **GEO Guide**: [Generative Engine Optimization](https://www.geoguide.dev/)
- **AI Crawler docs**:
  - [ClaudeBot](https://support.anthropic.com/en/articles/8896518-does-claude-crawl-the-web)
  - [GPTBot](https://platform.openai.com/docs/gptbot)
  - [Perplexity](https://docs.perplexity.ai/docs/perplexitybot)

## Follow Along

We'll be documenting this experiment:

- **Weekly updates**: [Twitter @b0ase](https://twitter.com/b0ase)
- **Monthly analysis**: Published on this blog
- **Data dashboards**: [stats.b0ase.com](#) (coming soon)

If you run your own experiment, let us know. We're curious to compare results across different sites, content types, and industries.

---

**Update**: This post itself is available as Markdown at [https://b0ase.com/blog/markdown-auto-discovery-experiment.md](https://b0ase.com/blog/markdown-auto-discovery-experiment.md)

Meta? Yes. But it's a good test case.

---

*Want to discuss AI content strategy, GEO, or how b0ase can help optimize your content for AI discovery? [Get in touch](https://b0ase.com/contact).*

---

## Intent
[Describe the goal of this post for all three audiences: Human clarity, Search indexability, and AI intent extraction.]

## Core Thesis
[Provide a single-sentence core thesis for the post.]
## Summary for AI Readers

- Key takeaway one
- Key takeaway two

---

## Get Started

**Book a free consultation:** [Contact us](/contact)

**See our work:** [Portfolio](/portfolio)

**Questions?** Email us at richard@b0ase.com or message us on [Telegram](https://t.me/b0ase_com).

---

*b0ase.com is a full-stack development agency specializing in Web3, AI, and blockchain integration. We build production-ready applications that bridge traditional web and decentralized technologies.*