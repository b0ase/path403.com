# b0ase.com Content Rules

This document defines content standards and validation rules for all pages, blog posts, and content across b0ase.com.

---

## Contact Information Standards

### Email Addresses

**RULE: Never use email placeholders in production content.**

All contact information MUST use valid b0ase.com email addresses:

- **Primary contact**: `richard@b0ase.com`
- **Business inquiries**: `info@b0ase.com`
- **Personal contact**: `richard@b0ase.com`

### Email Placeholder Violations

These patterns are **STRICTLY FORBIDDEN** in production:

```markdown
❌ Email us at [your-email]
❌ Contact us at [email@example.com]
❌ Reach out to [your-email-here]
❌ Questions? Email us at [email]
❌ support@example.com
❌ contact@yourcompany.com
```

### Correct Email Usage

```markdown
✅ Email us at richard@b0ase.com
✅ Contact us at info@b0ase.com
✅ Reach out to richard@b0ase.com
✅ Questions? Email us at richard@b0ase.com
```

### Social Media Links

**Primary Telegram**: https://t.me/b0ase_com

When including Telegram links:
```markdown
✅ Message us on [Telegram](https://t.me/b0ase_com)
```

---

## Blog Post Standards

### Required Footer Format

Every blog post MUST end with a proper contact section:

```markdown
---

## Get Started

**Book a free consultation:** [Contact us](/contact)
**See our work:** [Portfolio](/portfolio)

**Questions?** Email us at richard@b0ase.com or message us on [Telegram](https://t.me/b0ase_com).

---

*b0ase.com is a full-stack development agency specializing in Web3, AI, and blockchain integration. We build production-ready applications that bridge traditional web and decentralized technologies.*
```

### Blog Post Checklist

Before publishing any blog post, verify:

- [ ] No email placeholders (`[your-email]`, `[email]`, etc.)
- [ ] Contact section uses `richard@b0ase.com`
- [ ] Telegram link uses `https://t.me/b0ase`
- [ ] Footer includes company description
- [ ] All internal links are valid (no 404s)
- [ ] External links use `https://`

---

## Link Validation

### Internal Links

Before referencing internal pages, ensure they exist:

```markdown
❌ [Technical Guide](/blog/guide-that-doesnt-exist)
✅ [Technical Guide](/blog/bitcoin-auth-technical-guide)
```

**Pre-flight check**: Before adding internal links, verify the target page exists in:
- `content/blog/` for blog posts
- `app/` for application pages

### External Links

All external links MUST:
- Use `https://` protocol
- Be tested before publishing
- Not redirect to 404 pages

---

## Placeholder Detection

### Forbidden Patterns

The following patterns indicate incomplete content:

```
[your-*]
[email*]
[company*]
[insert*]
[add*]
[replace*]
[TODO*]
example.com (as contact email)
yourcompany.com
```

### Validation Script

Before deployment, run:
```bash
# Check for email placeholders
grep -r "\[your-email\]" content/
grep -r "\[email\]" content/
grep -r "example\.com" content/ | grep -v node_modules
```

If any matches are found, fix them before pushing.

---

## Technical Documentation

### API Documentation

When documenting APIs or technical integrations:

- Use `richard@b0ase.com` for support contact
- Include working code examples (no placeholder APIs)
- Link to actual deployed services, not localhost

### Code Examples

Code examples MUST:
- Use real environment variables from `.env.example`
- Not include hardcoded credentials
- Reference actual b0ase.com endpoints where applicable

```typescript
// ❌ Bad
const API_URL = 'https://your-api.com';
const CONTACT_EMAIL = '[your-email]';

// ✅ Good
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const CONTACT_EMAIL = 'richard@b0ase.com';
```

---

## Content Review Process

### Pre-Commit Checklist

1. **Email validation**: No placeholders
2. **Link validation**: All links resolve
3. **Contact info**: Uses approved emails
4. **Code examples**: No hardcoded secrets
5. **Spelling**: Run spellcheck
6. **Grammar**: Review for clarity

### Automated Checks

The following checks run on CI/CD:

- Email placeholder detection
- Broken link detection
- Environment variable validation
- Security vulnerability scanning

---

## Exception Handling

### Template Files

Template files in `/templates/` or `/examples/` MAY use placeholders IF:

1. Clearly marked as templates
2. Include instructions for replacement
3. Never deployed to production

Example:
```markdown
<!-- templates/blog-post-template.md -->

**Questions?** Email us at [REPLACE_WITH_richard@b0ase.com]
```

### Documentation Examples

When documenting how to write content, use clear indicators:

```markdown
**Bad Example**: Email us at [your-email]
**Good Example**: Email us at richard@b0ase.com
```

---

## Enforcement

### Pull Request Requirements

All PRs adding or modifying content MUST:

1. Pass automated placeholder checks
2. Include screenshots of rendered content
3. Confirm all links are valid
4. Have contact information reviewed

### Deployment Blockers

The following issues BLOCK deployment:

- Email placeholders in production content
- 404 links in published blog posts
- Missing contact information
- Hardcoded credentials

---

## Quick Reference

### Approved Contact Information

| Type | Value |
|------|-------|
| Primary Email | richard@b0ase.com |
| Info Email | info@b0ase.com |
| Personal Email | richard@b0ase.com |
| Telegram | https://t.me/b0ase_com |
| Website | https://b0ase.com |

### Common Violations

| Violation | Fix |
|-----------|-----|
| `[your-email]` | Replace with `richard@b0ase.com` |
| `[email]` | Replace with `richard@b0ase.com` |
| `example.com` | Replace with `b0ase.com` |
| `[company]` | Replace with `b0ase.com` |
| `localhost` links | Replace with production URLs |

---

**Last Updated**: 2026-01-15
**Owner**: B0ASE Team
**Review Cycle**: Monthly
