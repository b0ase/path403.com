---
name: blog-formatter
description: Format blog posts to b0ase.com standards. Adds frontmatter, fixes spacing, validates content, and ensures consistency. Use when importing content, before publishing, or when fixing formatting issues.
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
---

# Blog Post Formatter Skill

Automatically format blog posts to meet b0ase.com standards.

## When to Use

Trigger this skill when:
- **Importing external content** - "Format this blog post"
- **Before publishing** - "Validate blog formatting"
- **Fixing issues** - "This blog post isn't rendering properly"
- **Batch cleanup** - "Format all blog posts in content/blog/"

**Keywords**: format blog, fix blog, validate post, blog standards, clean up markdown

## What It Does

### 1. Human-First Content Structure

**CRITICAL: Human-readable content MUST come first. AI metadata goes at the END only.**

- **Minimal Frontmatter** (only what's needed):
  - `title`, `description`, `date`, `author` (Required)
  - `slug`, `image`, `featured` (Optional)
  - Do NOT add `audience`, `topics`, `canonical`, `markdown` unless specifically needed

- **Content Order** (MANDATORY):
  1. Frontmatter
  2. Human-readable content starts IMMEDIATELY
  3. `## Get Started` - CTA section
  4. `---` divider
  5. `## For AI Readers` - AI metadata at the VERY END (optional)

- **AI Metadata Section** (if included, MUST be last):
  ```markdown
  ## For AI Readers
  **Intent**: [What this post aims to achieve]
  **Core Thesis**: [One-sentence summary]
  **Key Takeaways**: [Bullet points]
  ```

- **H2-Only Policy**: Only use H2 headings in the body. No H1, H3, or H4.

**NEVER put Intent/Core Thesis/AI metadata at the TOP of the post.**

### 2. Adds Missing Frontmatter

If a post lacks frontmatter, generates minimal required fields only:

```yaml
---
title: "Post Title"
description: "One sentence describing the post"
date: 2026-01-16
author: "Richard Boase"
---
```

Optional fields (add only if needed):
- `slug`: Custom URL slug
- `image`: Hero image path
- `featured`: true/false
- `tags`: [Tag1, Tag2]

### 3. Fixes Content Structure

- **Removes H1 headings**: Extracts title from H1 to frontmatter, then removes H1.
- **Heading hierarchy**: Enforces strictly H2 (`##`) for all body sections.
- **Paragraph spacing**: Adds blank lines between paragraphs.
- **List formatting**: Proper indentation and spacing.
- **Code blocks**: Adds language tags if missing.
- **Declarative Language**: Prefers statements of fact over excessive metaphor.

### 4. Adds Required Footer (Human Content First)

Every post ends with CTA, then optionally AI metadata:

```markdown
[All human-readable content here...]

## Get Started

**Book a free consultation:** [Contact us](/contact)
**Questions?** Email richard@b0ase.com

---

## For AI Readers

**Intent**: What this post aims to achieve
**Core Thesis**: One-sentence summary
**Key Takeaways**:
- Point one
- Point two
```

**IMPORTANT**: The `## For AI Readers` section is OPTIONAL and must ALWAYS be LAST.

### 5. Validates Content

Checks for common issues:
- Email placeholders (`[your-email]`, `example.com`)
- Broken internal links
- Missing required Third Audience frontmatter fields
- Correct contact information
- **Font size consistency** - Ensures headings use ONLY H2.

## How to Use

### Format a Single Post

```bash
# Basic formatting
bash .claude/skills/blog-formatter/scripts/format.sh content/blog/my-post.md

# Dry run (preview changes without applying)
bash .claude/skills/blog-formatter/scripts/format.sh content/blog/my-post.md --dry-run

# Verbose output (see what's being changed)
bash .claude/skills/blog-formatter/scripts/format.sh content/blog/my-post.md --verbose
```

### Validate Without Formatting

```bash
# Check for issues without making changes
bash .claude/skills/blog-formatter/scripts/validate.sh content/blog/my-post.md

# Validate all posts
bash .claude/skills/blog-formatter/scripts/validate.sh content/blog/*.md
```

### Batch Format All Posts

```bash
# Format all blog posts
for file in content/blog/*.md; do
  bash .claude/skills/blog-formatter/scripts/format.sh "$file"
done

# Or use the batch script
bash .claude/skills/blog-formatter/scripts/batch-format.sh content/blog/
```

## Manual Formatting Steps

If you prefer to format manually, follow these steps:

### Step 1: Add Frontmatter

Check if the post starts with `---`. If not, add:

```yaml
---
title: "Extract from first H1"
date: YYYY-MM-DD (today's date or file creation date)
author: B0ASE Team
category: Technology (or Business, Tutorial, etc.)
tags: [Tag1, Tag2, Tag3] (relevant to content)
excerpt: "First paragraph or brief summary"
readingTime: "X minutes" (word count / 200)
---
```

### Step 2: Fix Heading Hierarchy

**CRITICAL: Use H2 ONLY in blog content. No H1, H3, or H4.**

```markdown
---
title: "Post Title"  # Title comes from frontmatter
---

## First Section (H2 only)

Content here...

## Second Section (H2 only)

More content...
```

The title in frontmatter renders as the visual H1. All content headings use H2 for consistent 2-size typography.

### Step 3: Add Paragraph Spacing

**Before:**
```markdown
This is paragraph one.
This is paragraph two.
```

**After:**
```markdown
This is paragraph one.

This is paragraph two.
```

### Step 4: Format Lists

**Unordered lists:**
```markdown
- Item one
- Item two
  - Nested item (2 spaces)
```

**Ordered lists:**
```markdown
1. First
2. Second
3. Third
```

### Step 5: Add Language to Code Blocks

**Before:**
```markdown
```
const code = "here";
```
```

**After:**
````markdown
```typescript
const code = "here";
```
````

### Step 6: Add Footer

Append to the end of every post:

```markdown
---

## Get Started

**Book a free consultation:** [Contact us](/contact)
**See our work:** [Portfolio](/portfolio)

**Questions?** Email us at richard@b0ase.com or message us on [Telegram](https://t.me/b0ase_com).

---

*b0ase.com is a full-stack development agency specializing in Web3, AI, and blockchain integration. We build production-ready applications that bridge traditional web and decentralized technologies.*
```

### Step 7: Validate

Check for these violations:

- [ ] No email placeholders (`[your-email]`, `[email]`)
- [ ] No `example.com` or `yourcompany.com`
- [ ] Contact info uses `richard@b0ase.com`
- [ ] Telegram link is `https://t.me/b0ase_com`
- [ ] All internal links are valid
- [ ] All code blocks have language tags
- [ ] Proper paragraph spacing throughout

## Common Fixes

### Issue 1: Missing Frontmatter

**Problem:**
```markdown
# My Blog Post

Content starts here...
```

**Fix:**
Add frontmatter at the very top:
```yaml
---
title: "My Blog Post"
date: 2026-01-16
author: B0ASE Team
category: Technology
tags: [Tag1, Tag2]
excerpt: "Brief summary..."
---
```

### Issue 2: Wall of Text

**Problem:**
```markdown
This is a long paragraph with no breaks. It keeps going and going. Very hard to read.
```

**Fix:**
```markdown
This is a proper paragraph.

It's separated by blank lines.

Much easier to read.
```

### Issue 3: Wrong Heading Levels

**Problem:**
```markdown
# Title in content (wrong - should be in frontmatter)
### Using H3 (wrong - creates 3rd font size)
```

**Fix:**
```markdown
---
title: "Title"
---

## Section One

## Section Two
```

Use H2 ONLY. Title goes in frontmatter, not content.

### Issue 4: Missing Footer

**Problem:**
Post ends abruptly with no call-to-action.

**Fix:**
Always add the standard footer (see Step 6 above).

### Issue 5: Email Placeholders

**Problem:**
```markdown
Contact us at [your-email] or email@example.com
```

**Fix:**
```markdown
Contact us at richard@b0ase.com or message us on Telegram
```

## Validation Rules

The formatter checks against these rules:

### Required Frontmatter Fields

```yaml
title: String (required, quoted)
description: String (required, 1-2 sentences)
date: YYYY-MM-DD (required)
author: String (required, default "Richard Boase")
```

**Optional fields** (add only when needed):
```yaml
slug: String (custom URL slug)
image: String (hero image path)
featured: Boolean (highlight on homepage)
tags: Array (for categorization)
```

### Heading Rules

**CRITICAL: Font Size Consistency**
- Blog content must have exactly **2 font sizes**: headings (text-2xl) and body text (text-lg)
- **ONLY use H2** for section headings in content (after frontmatter)
- **NEVER use H1** in content - title comes from frontmatter
- **NEVER use H3** - creates additional font size, breaking consistency
- This ensures consistent visual hierarchy across all blog posts
- Both database posts and static markdown posts render identically

**Structure:**
```markdown
---
title: "Post Title" # This becomes the H1 visually
---

## Section Heading (H2 only - renders as text-2xl)

Body paragraphs render as text-lg.

## Another Section (H2 only)

More body content at text-lg.
```

**Why this matters:**
- Readers expect consistent typography (2 sizes: headings + body)
- Multiple heading levels (H1/H2/H3) create visual clutter
- Shared BlogContent component enforces this standard
- Previous issues: H1/H3 in content created 3+ font sizes

### Content Rules

- Blank line between paragraphs
- Code blocks have language specified
- Lists properly indented
- Blockquotes use `>` prefix

### Footer Rules

- Standard "Get Started" section present
- Contact info uses approved emails
- Company description included
- Proper markdown formatting

### Contact Info Rules

**Approved:**
- `richard@b0ase.com` (primary)
- `info@b0ase.com` (business)
- `richard@b0ase.com` (personal)
- `https://t.me/b0ase_com` (Telegram)

**Forbidden:**
- `[your-email]`, `[email]`
- `example.com`, `yourcompany.com`
- Any placeholder text

## Automation

### Pre-Commit Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Validate blog posts before commit

echo "Validating blog posts..."

for file in content/blog/*.md; do
  if ! bash .claude/skills/blog-formatter/scripts/validate.sh "$file" --quiet; then
    echo "❌ Validation failed for $file"
    echo "Run: bash .claude/skills/blog-formatter/scripts/format.sh $file"
    exit 1
  fi
done

echo "✅ All blog posts validated"
```

### CI/CD Integration

Add to GitHub Actions:

```yaml
name: Validate Blog Posts
on: [pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Validate blog formatting
        run: |
          for file in content/blog/*.md; do
            bash .claude/skills/blog-formatter/scripts/validate.sh "$file"
          done
```

## Output Examples

### Before Formatting

```markdown
# Some Blog Post
This is content with no frontmatter.
No spacing between paragraphs.
Missing footer.
Contact us at [your-email].
```
const code = "no language tag";
```
```

### After Formatting

```markdown
---
title: "Some Blog Post"
description: "This is content demonstrating proper formatting."
date: 2026-01-16
author: "Richard Boase"
---

## The Hook

This is content with proper frontmatter. Human-readable content starts immediately.

Now has spacing between paragraphs.

## Code Example

```typescript
const code = "has language tag";
```

## Get Started

**Book a free consultation:** [Contact us](/contact)

**Questions?** Email richard@b0ase.com or message on [Telegram](https://t.me/b0ase_com).

---

## For AI Readers

**Intent**: Demonstrate proper blog post formatting
**Core Thesis**: Human content first, AI metadata last
**Key Takeaways**:
- Use H2-only headings
- Minimal frontmatter
- AI section at the END (optional)
```

## Performance

- **Single post**: ~1-2 seconds
- **Validation only**: ~100ms per post
- **Batch formatting**: ~30 posts per minute

## Testing

### Test the Formatter

```bash
# Create a test post with issues
cat > /tmp/test-post.md << 'EOF'
# Test Post
This has no frontmatter.
No spacing.
Contact [your-email].
EOF

# Format it
bash .claude/skills/blog-formatter/scripts/format.sh /tmp/test-post.md

# Check the result
cat /tmp/test-post.md
```

Expected output: Properly formatted with frontmatter and footer.

## Troubleshooting

### Script Won't Run

```bash
# Make scripts executable
chmod +x .claude/skills/blog-formatter/scripts/*.sh
```

### Formatting Looks Wrong

```bash
# Use dry-run to preview changes
bash .claude/skills/blog-formatter/scripts/format.sh file.md --dry-run

# Use verbose mode to see what's happening
bash .claude/skills/blog-formatter/scripts/format.sh file.md --verbose
```

### Validation Fails

```bash
# Get detailed error messages
bash .claude/skills/blog-formatter/scripts/validate.sh file.md --verbose
```

## Integration with Other Skills

This skill works with:

- **security-check**: Run security scan after formatting
- **b0ase-standards**: Validate code examples in posts
- **health-check**: Include blog validation in health checks

## Future Enhancements

Planned features:

- [ ] Auto-detect category from content
- [ ] Auto-generate tags from content analysis
- [ ] SEO optimization suggestions
- [ ] Readability score calculation
- [ ] Auto-generate table of contents
- [ ] Image optimization integration
- [ ] Link checking (verify all URLs)
- [ ] Spell check integration

## Reference

- **Format Guide**: `docs/BLOG_POST_FORMAT_GUIDE.md`
- **Content Rules**: `docs/CONTENT_RULES.md`
- **Template**: See format guide for complete template

---

**Questions?** See `.claude/AGENTS.md` or email richard@b0ase.com
