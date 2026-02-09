# Blog Post Formatting Guide

## Required Format for All Blog Posts

Every blog post MUST follow this exact structure for proper rendering on b0ase.com.

---

## 1. Frontmatter (Required)

**ALL blog posts MUST start with YAML frontmatter** enclosed in triple dashes (`---`).

### Correct Format

```markdown
---
title: "Your Blog Post Title"
date: 2026-01-16
author: B0ASE Team
category: Technology
tags: [Tag1, Tag2, Tag3]
excerpt: "A brief 1-2 sentence summary of the post that appears in previews and social media shares."
---

# Your Blog Post Title

First paragraph starts here...
```

### Frontmatter Fields

| Field | Required | Format | Example |
|-------|----------|--------|---------|
| `title` | ✅ Yes | String in quotes | `"Bitcoin Authentication Guide"` |
| `date` | ✅ Yes | YYYY-MM-DD | `2026-01-16` |
| `author` | ✅ Yes | String | `B0ASE Team` or `Richard Smith` |
| `category` | ✅ Yes | String | `Technology`, `Business`, `Tutorial` |
| `tags` | ✅ Yes | Array | `[Bitcoin, Web3, Security]` |
| `excerpt` | ✅ Yes | String in quotes | `"Brief summary..."` |
| `readingTime` | ⚪ Optional | String | `"8 minutes"` |

---

## 2. Content Structure

### Heading Hierarchy

**HOUSE STYLE RULE: Only use ## headings in blog post body**

```markdown
# Main Title (H1) - Only use ONCE at the top

## Major Section (H2)

## Another Section (H2)

**Bold for subsection titles** within paragraphs
```

**IMPORTANT:** Do NOT use ### (H3) headings. This is a strict house style rule.
- ✅ Use ## for all section headings
- ✅ Use **bold text** for subsection titles within sections
- ❌ Never use ### headings
- ❌ Never use #### headings

**Why:** This creates a clean visual hierarchy with only 2 text sizes:
- Section titles (##): Large, bold
- Content (paragraphs): Normal size

**Example:**
```markdown
## The Solution

**Step One** - Do this first thing.

**Step Two** - Then do this second thing.

Text continues here...
```

### Paragraphs

- Leave a blank line between paragraphs
- Keep paragraphs focused (3-5 sentences max)
- Use proper sentence case and punctuation

**Bad** (no spacing):
```markdown
This is paragraph one.
This is paragraph two.
```

**Good** (proper spacing):
```markdown
This is paragraph one.

This is paragraph two.
```

### Lists

**Unordered lists:**
```markdown
- First item
- Second item
- Third item
  - Nested item (2 spaces indent)
```

**Ordered lists:**
```markdown
1. First step
2. Second step
3. Third step
```

### Code Blocks

**Inline code:** Use backticks `like this`

**Code blocks:** Use triple backticks with language

````markdown
```typescript
const hello = "world";
console.log(hello);
```
````

**Supported languages:**
- `typescript` / `ts`
- `javascript` / `js`
- `bash` / `sh`
- `python` / `py`
- `sql`
- `json`
- `yaml`

### Blockquotes

```markdown
> This is a quoted section. Use for important callouts or quotes.
```

### Horizontal Rules

```markdown
---
```

Use `---` on its own line to create visual separation between major sections.

---

## 3. Links and Images

### Internal Links

```markdown
[Link text](/blog/other-post)
[Contact page](/contact)
```

### External Links

```markdown
[External site](https://example.com)
```

### Images

```markdown
![Alt text describing the image](/images/filename.png)
```

---

## 4. Footer (Required)

Every blog post MUST end with this footer:

```markdown
---

## Get Started

**Book a free consultation:** [Contact us](/contact)
**See our work:** [Portfolio](/portfolio)

**Questions?** Email us at richard@b0ase.com or message us on [Telegram](https://t.me/b0ase_com).

---

*b0ase.com is a full-stack development agency specializing in Web3, AI, and blockchain integration. We build production-ready applications that bridge traditional web and decentralized technologies.*
```

---

## 5. Common Formatting Issues

### Issue 1: Missing Frontmatter

**Problem:**
```markdown
# My Blog Post

Content starts here...
```

**Fix:**
```markdown
---
title: "My Blog Post"
date: 2026-01-16
author: B0ASE Team
category: Technology
tags: [Web3, Development]
excerpt: "Brief description of the post."
---

# My Blog Post

Content starts here...
```

### Issue 2: No Paragraph Breaks

**Problem:**
```markdown
This is a long wall of text with no breaks. It keeps going and going without any whitespace. This makes it hard to read and looks unprofessional. The reader gets fatigued quickly.
```

**Fix:**
```markdown
This is properly formatted text with paragraph breaks.

Each paragraph is separated by a blank line. This makes the content more scannable and easier to digest.

Readers appreciate clear structure and whitespace.
```

### Issue 3: Using H3 Headings (House Style Violation)

**Problem:**
```markdown
# Title
## Section
### Subsection (H3 - NOT ALLOWED)
```

**Fix:**
```markdown
# Title

## Section One (H2)

**Subsection** - Use bold text for sub-points within sections.

## Section Two (H2)

**Another Point** - Bold inline, not H3 headings.
```

### Issue 4: Code Without Language

**Problem:**
````markdown
```
const code = "no highlighting";
```
````

**Fix:**
````markdown
```typescript
const code = "proper highlighting";
```
````

---

## 6. Complete Template

Save this as a starting point for all blog posts:

```markdown
---
title: "Your Descriptive Title Here"
date: 2026-01-16
author: B0ASE Team
category: Technology
tags: [Tag1, Tag2, Tag3]
excerpt: "A compelling 1-2 sentence summary that makes people want to read more."
readingTime: "X minutes"
---

# Your Descriptive Title Here

Opening paragraph that hooks the reader. Explain what this post is about and why they should care.

## Section One

Content for the first major section.

**Key Point** - Use bold for sub-points, not H3 headings.

More detailed content here.

## Section Two

Content for the second major section.

**Key Points:**

- Point one
- Point two
- Point three

**Code Example:**

```typescript
// Illustrative code example
const example = "with proper syntax highlighting";
```

## Section Three

Final section with conclusions or next steps.

---

## Get Started

**Book a free consultation:** [Contact us](/contact)
**See our work:** [Portfolio](/portfolio)

**Questions?** Email us at richard@b0ase.com or message us on [Telegram](https://t.me/b0ase_com).

---

*b0ase.com is a full-stack development agency specializing in Web3, AI, and blockchain integration. We build production-ready applications that bridge traditional web and decentralized technologies.*
```

---

## 7. Validation Checklist

Before publishing, verify:

- [ ] Frontmatter present with all required fields
- [ ] Title is quoted in frontmatter
- [ ] Date format is YYYY-MM-DD
- [ ] Tags are in array format `[Tag1, Tag2]`
- [ ] Excerpt is quoted and concise
- [ ] H1 used only once (main title in frontmatter)
- [ ] Only H2 (##) headings used in content body (NO H3)
- [ ] Paragraphs separated by blank lines
- [ ] Code blocks have language specified
- [ ] All links are valid (no 404s)
- [ ] Footer section included
- [ ] Contact info uses richard@b0ase.com
- [ ] No email placeholders (`[your-email]`, etc.)

---

## 8. Testing Locally

After writing your post:

1. **Start dev server:**
   ```bash
   pnpm dev
   ```

2. **View your post:**
   ```
   http://localhost:3000/blog/your-post-slug
   ```

3. **Check formatting:**
   - Title renders correctly
   - Headings have proper hierarchy
   - Code blocks have syntax highlighting
   - Links work
   - Images load
   - Footer appears

4. **Fix any issues** before committing

---

## 9. Common Categories

Use these standard categories:

- **Technology** - Technical tutorials, guides, deep dives
- **Business** - Business strategy, growth, operations
- **Tutorial** - Step-by-step how-to guides
- **Case Study** - Client work, project showcases
- **Insights** - Industry analysis, trends, opinions
- **Updates** - Company news, product updates
- **Web3** - Blockchain, crypto, decentralized tech
- **AI** - Artificial intelligence, machine learning, agents

---

## 10. Common Tags

Pick 3-7 relevant tags:

**Technology:**
- Bitcoin, Ethereum, Solana, BSV
- Next.js, React, TypeScript, Node.js
- Authentication, Security, Payments

**Topics:**
- Web3, Blockchain, DeFi, NFTs
- AI, Machine Learning, Agents, Automation
- SaaS, Development, Deployment

**Skills:**
- Tutorial, Guide, Technical, Advanced
- Business, Strategy, Operations
- Quick Start, Deep Dive

---

## Examples of Well-Formatted Posts

### Good Example: Technical Post

File: `content/blog/bitcoin-auth-technical-guide.md`

```markdown
---
title: "Bitcoin Authentication: Technical Integration Guide"
date: 2026-01-15
author: B0ASE Team
category: Technology
tags: [Bitcoin, Authentication, Security, Web3, Technical, BSV, Cryptography]
excerpt: "A comprehensive technical guide to integrating Bitcoin-based authentication into your application."
---

# Bitcoin Authentication: Technical Integration Guide

This guide walks you through integrating Bitcoin authentication...

## Understanding the Cryptographic Foundation

Bitcoin authentication leverages ECDSA...

**The Four Key Components:**

1. Private key
2. Public key
3. Signature
4. Address

Each component plays a specific role...
```

**Why it's good:**
- ✅ Complete frontmatter
- ✅ Clear title and excerpt
- ✅ Logical heading hierarchy
- ✅ Proper paragraph breaks
- ✅ Descriptive tags

### Bad Example: Missing Frontmatter

File: `content/blog/100x-business-with-ai-agents.md`

```markdown
# 100x a Business with AI Agents

**Author:** Vasuman ([@vasuman](https://x.com/vasuman))
**Company:** [Varick Agents](https://varickagents.com) - $3M ARR

---

AI Agents are not magic...
```

**Why it's bad:**
- ❌ No frontmatter
- ❌ Metadata in markdown body
- ❌ No structured title/date/tags
- ❌ Won't render properly in blog listing
- ❌ No SEO metadata

**Fix:**
```markdown
---
title: "100x a Business with AI Agents"
date: 2026-01-12
author: Vasuman
category: Business
tags: [AI, Agents, Business, Automation, Enterprise]
excerpt: "Lessons from building production AI agents at $3M ARR. What works, what doesn't, and how to deploy agents that actually deliver value."
---

# 100x a Business with AI Agents

*By Vasuman ([@vasuman](https://x.com/vasuman)), Founder of [Varick Agents](https://varickagents.com) - $3M ARR*

AI Agents are not magic...
```

---

## Summary

**Every blog post needs:**

1. ✅ YAML frontmatter with required fields
2. ✅ Proper heading hierarchy (H1 → H2 → H3)
3. ✅ Paragraph spacing (blank lines between paragraphs)
4. ✅ Code blocks with language specification
5. ✅ Required footer with contact info
6. ✅ No email placeholders

**Reference this guide when creating any new blog post.**

**Template location:** Use the template in Section 6 above.

---

**Last Updated:** January 16, 2026
**Maintained By:** b0ase.com team
**Questions:** richard@b0ase.com
