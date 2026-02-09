# Changelog - January 2026

This document tracks significant changes to b0ase.com during January 2026.

---

## 2026-01-23

### Contract Pipeline System (New)

Complete contract pipeline for gigs with on-chain inscription:

**Files Created:**
- `lib/contracts/types.ts` - Type definitions for contracts, templates, signatures
- `lib/contracts/templates.ts` - 7 contract templates for pipeline phases
- `lib/contracts/generator.ts` - Contract generation and signing functions
- `lib/contracts/kintsugi-integration.ts` - Kintsugi project repo integration
- `lib/contracts/index.ts` - Module exports
- `app/apply/[gigId]/page.tsx` - Gig application form
- `app/api/apply/route.ts` - Application API endpoint
- `app/sign/[contractId]/page.tsx` - Multi-party contract signing page
- `app/api/contracts/sign/route.ts` - Signing API with BSV inscription

**Features:**
- 7 contract templates covering Discovery, Design, Development, Marketing, Operations phases
- Multi-party signatures (email verification or wallet: BSV/ETH/SOL)
- Automatic BSV blockchain inscription as 1Sat Ordinals when fully signed
- Kintsugi integration for deliverable tracking and project repos
- Flexible payment terms (any currency: GBP, USD, ETH, SOL, BTC, BSV, USDC, MNEE)

**Files Updated:**
- `lib/bsv-inscription.ts` - Added `inscribePipelineContract()` and supporting functions
- `app/gigs/layout.tsx` - Updated description for flexible payment terms
- `app/gigs/page.tsx`, `app/gigs/offered/page.tsx`, `app/gigs/wanted/page.tsx` - Payment: Any Currency

### Page Layout Standardization

Updated pages to follow `/agents` style pattern with icon headers:

**Files Created:**
- `app/projects/page.tsx` - New projects listing page with:
  - Portfolio projects from `lib/data.ts`
  - Database projects from Supabase
  - Filtering by status (Live, Demo, Concept, etc.)
  - Stats bar showing project counts
  - CTA section

- `app/site-index/page.tsx` - New public site index with:
  - All public pages organized by category (7 categories)
  - Search functionality
  - Expandable category sections
  - Quick links section
  - Protected pages excluded

**Files Updated:**
- `app/careers/page.tsx` - Refactored to match `/agents` layout:
  - Removed `max-w-6xl mx-auto` container
  - Added icon header with `FaBriefcase`
  - Full-width `px-4 md:px-8` padding
  - Apply buttons now link to `/apply/${careerId}`

- `docs/page-style-guide.md` - Added:
  - "Page Header with Icon (Recommended)" pattern with full code example
  - Key header elements documentation
  - Updated reference pages list

### Course Thumbnail Images (Module 5-6)

Generated placeholder images for courses page (Gemini quota exhausted):

| Image | Course | Status |
|-------|--------|--------|
| `pre-commit-cicd.png` | Pre-commit Hooks & CI/CD | Placeholder |
| `nextjs-apps.png` | Building Next.js Apps | Placeholder |
| `ai-agents.png` | Building AI Agents | Placeholder |
| `full-stack.png` | Full Kintsugi Stack | Placeholder |

**Scripts created:**
- `scripts/generate-course-placeholders.mjs` - Creates SVG-based placeholder thumbnails
- `scripts/generate-course-thumbnails-gemini.sh` - Auto-retry script for AI generation

**To replace with AI-generated images:**
```bash
# When Gemini quota resets (usually midnight Pacific):
bash scripts/generate-course-thumbnails-gemini.sh
```

### Documentation

- Updated `docs/page-style-guide.md` with icon header pattern
- Created this changelog (`docs/CHANGELOG_2026-01.md`)

---

## 2026-01-22

### Gigs Board System (New)

- Created `/gigs` - Main gigs board page
- Created `/gigs/offered` - Jobs offered by b0ase
- Created `/gigs/wanted` - Work wanted by contractors
- Gigs categorized by type: Development, Design, Marketing, Content

### Founders Page

- Created `/founders` page with founder network concept
- KYC verification discussion (not implemented)

---

## 2026-01-21

### Exchange Page Updates

- Added developers tab to `/exchange`
- Token marketplace improvements

### Database Backup System

- Implemented automated database backup cron
- Supabase backup integration

---

## 2026-01-20

### ContentCard Improvements

- Fixed margin issues on ContentCard components
- Standardized card spacing

### Developers Page

- Enhanced `/developers` page layout
- Improved developer profile cards

---

## 2026-01-19

### Documentation Audit

- Comprehensive documentation audit (`docs/DOCUMENTATION_AUDIT_2026-01-19.md`)
- Created `docs/DOC_INDEX.md` master index
- Moved and consolidated docs into proper directories
- Archived obsolete documentation

### Mint Page Updates

- Updated `/mint` page functionality
- Token minting improvements

---

## Reference: Page Style Pattern

Standard page header with icon (as used in `/agents`, `/careers`, `/projects`, `/site-index`):

```tsx
<motion.div className="mb-12 border-b border-gray-800 pb-8">
  <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
    <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800 self-start">
      <FaIcon className="text-4xl md:text-6xl text-white" />
    </div>
    <div className="flex items-end gap-4">
      <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
        PAGE TITLE
      </h1>
      <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
        SUBTITLE
      </div>
    </div>
  </div>
  {/* Description and CTAs */}
</motion.div>
```

Key rules:
- Full-width: `px-4 md:px-8` (no max-w-*)
- Icon box: `bg-gray-900/50 p-4 md:p-6 border border-gray-800`
- Title: `text-4xl md:text-6xl font-bold tracking-tighter`
- Subtitle: `text-xs text-gray-500 font-mono uppercase tracking-widest`

See `docs/page-style-guide.md` for complete documentation.

---

## Public Pages Added This Month

| Path | Description | Date |
|------|-------------|------|
| `/projects` | Projects listing page | 2026-01-23 |
| `/site-index` | Public site index/sitemap | 2026-01-23 |
| `/apply/[gigId]` | Gig application form | 2026-01-23 |
| `/sign/[contractId]` | Contract signing page | 2026-01-23 |
| `/gigs` | Gigs board | 2026-01-22 |
| `/gigs/offered` | Jobs offered | 2026-01-22 |
| `/gigs/wanted` | Work wanted | 2026-01-22 |
| `/founders` | Founders network | 2026-01-22 |

---

## API Routes Added This Month

| Route | Method | Description | Date |
|-------|--------|-------------|------|
| `/api/apply` | POST | Submit gig application | 2026-01-23 |
| `/api/contracts/sign` | POST | Sign contract, trigger inscription | 2026-01-23 |

---

*Last updated: 2026-01-23*
