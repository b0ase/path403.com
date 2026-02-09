# Documentation Index - b0ase.com

**Last Updated**: 2026-01-23
**Total Docs**: ~105 (65 in /docs, 35 in subdirectories, 12 skills)
**Health Score**: 80% (post-consolidation)

This is the master index for ALL documentation. If you're looking for something, start here.

---

## Quick Navigation

**I need to...**

| Task | Document |
|------|----------|
| **Understand the full product** | `docs/UNIFIED_PRD.md` |
| **Understand Kintsugi deeply** | `docs/KINTSUGI_THESIS.md` |
| **Understand BSV strategy** | `docs/BSV_STRATEGIC_THESIS.md` |
| Start working | `CLAUDE.md` (root) |
| Access database/servers | `docs/SYSTEM_MAP.md` |
| Navigate codebase | `docs/CODEBASE_MAP.md` |
| Deploy to production | `docs/DEPLOYMENT_GUIDE.md` |
| Fix security issues | `docs/security/SECURITY_FINDINGS.md` |
| Understand auth | `docs/AUTH-SYSTEM.md` |
| **Build an AI agent** | `docs/AGENTS_QUICK_START.md` |
| **Agent API reference** | `docs/AGENTS_API_REFERENCE.md` |
| Format a blog post | `.claude/skills/blog-formatter/SKILL.md` |
| Backup/restore database | `docs/DATABASE_BACKUP.md` |
| Check what's planned | `docs/ROADMAP.md` |
| Review loose ends | `docs/DOCUMENTATION_AUDIT_2026-01-19.md` |
| **See recent changes** | `docs/CHANGELOG_2026-01.md` |

---

## Documentation Structure

```
b0ase.com/
├── CLAUDE.md (START HERE - Agent instructions)
│
├── docs/
│   ├── DOC_INDEX.md (This file)
│   ├── CODEBASE_MAP.md (Auto-generated file map)
│   ├── SYSTEM_MAP.md (Infrastructure access)
│   ├── ROADMAP.md (Project checklist)
│   │
│   ├── /api
│   │   └── INTERNAL_API_DESIGN.md
│   │
│   ├── /architecture
│   │   ├── MPC_DESIGN.md
│   │   ├── MINTING_CONTRACTS_ARCHITECTURE.md
│   │   └── CONTRACT_MARKETPLACE_ARCHITECTURE.md
│   │
│   ├── /business
│   │   └── restaurant-voice-ai.md
│   │
│   ├── CHANGELOG_2026-01.md (Monthly changes)
│   │
│   ├── /guides
│   │   ├── DEPLOYMENT_GUIDE.md
│   │   ├── TESTING_GUIDE.md
│   │   ├── BLOG_POST_FORMAT_GUIDE.md
│   │   └── page-style-guide.md
│   │
│   ├── /marketing
│   │   ├── strategy.md (was MARKETING_PLAN.md)
│   │   └── volumemaxxing.md
│   │
│   ├── /roadmaps
│   │   ├── repo-tokenization.md
│   │   └── DEVELOPER_ONBOARDING_PLAN.md
│   │
│   ├── /security
│   │   ├── SECURITY_AUDIT.md
│   │   ├── SECURITY_QUICK_REF.md
│   │   ├── SECURITY_FINDINGS.md
│   │   └── TRAIL_OF_BITS_ANALYSIS.md
│   │
│   ├── /technical
│   │   ├── kintsugi-repair-2026-01.md
│   │   ├── github-oauth-gaps.md
│   │   └── COMPONENT_SPLITTING_GUIDE.md
│   │
│   └── /_archive (Historical docs)
│
└── .claude/skills/ (12 skills with SKILL.md each)
```

---

## Core Documentation

### 1. CLAUDE.md (Root)
**Purpose**: Main instructions for AI agents and developers
**Topics**: Package management (pnpm), security checks, blog formatting rules, code standards
**When to read**: ALWAYS - before doing ANY work

### 2. docs/SYSTEM_MAP.md
**Purpose**: Infrastructure access and database queries
**Topics**: Hetzner server, SSH commands, PostgreSQL, blog architecture
**When to read**: When accessing infrastructure or database

### 3. docs/CODEBASE_MAP.md
**Purpose**: Complete file-by-file codebase documentation
**Topics**: Architecture diagrams, module guides, data flows
**Last Updated**: 2026-01-18 (1,252 files, 2.47M tokens)
**When to read**: When navigating unfamiliar code

### 4. docs/ROADMAP.md
**Purpose**: Project checklist and feature tracking
**Topics**: Completed features, in-progress work, planned items
**When to read**: To understand project priorities

---

## Agent System Documentation

The Agent System enables creating autonomous AI agents with scheduled tasks, project linking, and BSV blockchain inscriptions.

| File | Purpose | Status |
|------|---------|--------|
| `AGENTS_QUICK_START.md` | 5-minute getting started guide | **Active** |
| `AGENTS_API_REFERENCE.md` | Complete API documentation (13 routes) | **Active** |
| `AGENT_SYSTEM_SPEC.md` | Technical architecture specification (1,590 lines) | **Active** |

**Implementation Status**: ~92% complete

**Key Features**:
- Agent chat with streaming (Claude/GPT)
- Scheduled tasks (7 task types with cron)
- Project linking with permissions
- BSV blockchain inscriptions
- Performance analytics

**Quick Start**: See `docs/AGENTS_QUICK_START.md`

---

## Documentation by Category

### Security (docs/security/)

| File | Purpose | Status |
|------|---------|--------|
| SECURITY_AUDIT.md | Full security assessment | Active |
| SECURITY_QUICK_REF.md | Quick reference for common issues | Active |
| SECURITY_FINDINGS.md | Scan results and remediation | Updated 2026-01-17 |
| TRAIL_OF_BITS_ANALYSIS.md | External security analysis | Reference |

**Outstanding Issues**:
- Rate limiting not fully implemented
- BOARDROOM_BOT_API_KEY exposure risk

### Architecture (docs/architecture/)

| File | Purpose | Status |
|------|---------|--------|
| MPC_DESIGN.md | Multi-party computation design | Planning |
| MINTING_CONTRACTS_ARCHITECTURE.md | Token minting system (12k+ words) | Design Complete |
| CONTRACT_MARKETPLACE_ARCHITECTURE.md | Decentralized job board (10k+ words) | Design Complete |

### Roadmaps (docs/roadmaps/)

| File | Purpose | Status |
|------|---------|--------|
| repo-tokenization.md | Repository tokenization plan | 15% implemented |
| DEVELOPER_ONBOARDING_PLAN.md | Developer marketplace improvements | Planning |

### Marketing (docs/marketing/)

| File | Purpose | Status |
|------|---------|--------|
| strategy.md | Comprehensive marketing plan | 0% executed |
| volumemaxxing.md | High-volume cold outreach | 0% executed |

### Technical (docs/technical/)

| File | Purpose | Status |
|------|---------|--------|
| kintsugi-repair-2026-01.md | Codebase repair plan | 80% complete |
| github-oauth-gaps.md | GitHub OAuth integration gaps | 30% complete |
| COMPONENT_SPLITTING_GUIDE.md | Component refactoring guide | Reference |

### Business Plans (docs/business/)

| File | Purpose | Status |
|------|---------|--------|
| restaurant-voice-ai.md | Voice AI for restaurants | 0% (planning only) |

### API Documentation (docs/api/)

| File | Purpose | Status |
|------|---------|--------|
| INTERNAL_API_DESIGN.md | Internal LLM-friendly API design | Planning |

---

## Operational Guides

### Deployment & Infrastructure (docs/)
- `DEPLOYMENT_GUIDE.md` - Production deployment procedures
- `ENVIRONMENT_VARIABLES.md` - Required environment variables
- `MONITORING_GUIDE.md` - Production monitoring
- `ADMIN-OPERATIONS.md` - Admin tasks

### Authentication (docs/)
- `AUTH-SYSTEM.md` - Complete auth architecture (6,733 lines)
- `AUTH_TROUBLESHOOTING.md` - Common auth issues

### Database (docs/)
- See `docs/_archive/` for historical migration and setup docs (consolidated)

### Development (docs/)
- `TESTING_GUIDE.md` - Testing procedures
- `ROUTING_GUIDE.md` - Next.js routing patterns
- `PERFORMANCE.md` - Performance optimization

### Content (docs/)
- `BLOG_POST_FORMAT_GUIDE.md` - Blog formatting (H2-only rule)
- `CONTENT_RULES.md` - Content guidelines
- `page-style-guide.md` - Page design standards

---

## Skills Documentation

12 Claude skills available in `.claude/skills/`:

| Skill | Purpose | Trigger |
|-------|---------|---------|
| blog-formatter | Format blog posts | "Format blog post" |
| security-check | Red-team security analysis | "Security check" |
| b0ase-standards | Code quality audit | "Check standards" |
| health-check | System health verification | "Health check" |
| multi-deploy | Multi-platform deployment | "Deploy to..." |
| client-onboarding | Client project setup | "Onboard client" |
| ai-content-engine | AI content infrastructure | "Content engine" |
| guide-writer-agent | Technical guide generation | "Write guide" |
| nano-banana | Image generation (Gemini) | "Generate image" |
| upload-image-to-notion | Notion image uploads | "Upload to Notion" |
| invert-image | Dark mode image variants | "Invert image" |
| write-guide-from-codebase | Docs from code | "Generate docs" |

---

## Implementation Status

### Fully Implemented (100%)
- Multi-provider authentication (10 providers)
- Blog system (hybrid DB + markdown)
- Developer marketplace (117 services)
- Notion integration
- Video upload system
- Role system (8 roles)

### Partially Implemented (25-75%)
- Repository tokenization (15%)
- Investor onboarding (70%)
- Multi-token accounts (90%)
- Boardroom voting (80%)
- **Contract pipeline (60%)** - Templates, signing, inscription working; needs database integration

### Planned Only (0%)
- Marketing execution
- Auto-book system
- Minting contracts
- Restaurant voice AI

---

## Recent Changes (2026-01-23)

### Contract Pipeline System (New)
- `lib/contracts/` - Complete contract pipeline for gigs
  - `types.ts` - Contract, template, signature types
  - `templates.ts` - 7 templates for pipeline phases
  - `generator.ts` - Contract generation/signing
  - `kintsugi-integration.ts` - Project repo integration
- `app/apply/[gigId]/page.tsx` - Gig application form
- `app/sign/[contractId]/page.tsx` - Multi-party signing
- `app/api/apply/route.ts` - Application endpoint
- `app/api/contracts/sign/route.ts` - Signing with BSV inscription

### Page Layout Standardization
- `app/projects/page.tsx` - New projects listing (portfolio + database)
- `app/site-index/page.tsx` - Public site index with 7 categories
- `app/careers/page.tsx` - Refactored to match /agents style

### Documentation Updates
- `docs/page-style-guide.md` - Added icon header pattern
- `docs/CHANGELOG_2026-01.md` - Monthly changelog (new)

See `docs/CHANGELOG_2026-01.md` for full January 2026 changes.

---

## Changes (2026-01-19)

### Deleted (Obsolete)
- `b0ase_map.txt` - Replaced by CODEBASE_MAP.md
- 7 obsolete archived docs (tests, session notes)

### Moved to /docs
- `MARKETING_PLAN.md` → `docs/marketing/strategy.md`
- `VOLUMEMAXXING_STRATEGY.md` → `docs/marketing/volumemaxxing.md`
- `REPO_TOKENIZATION_ROADMAP.md` → `docs/roadmaps/repo-tokenization.md`
- `kintsugi-claude.md` → `docs/technical/kintsugi-repair-2026-01.md`
- `SECURITY_*.md` → `docs/security/`
- `public/MPC_DESIGN.md` → `docs/architecture/`
- `public/INTERNAL_API_DESIGN.md` → `docs/api/`

### Added
- `docs/DOCUMENTATION_AUDIT_2026-01-19.md` - Comprehensive audit
- `app/tools/cartographer/page.tsx` - Cartographer tool page

---

## Known Loose Ends

See `docs/DOCUMENTATION_AUDIT_2026-01-19.md` for complete analysis.

**Critical**:
1. Security hardcoded credentials (needs fix)
2. Rate limiting implementation (needs implementation)

**High Priority**:
3. Repository tokenization OAuth scopes (15% complete)
4. Admin UI for purchase confirmation (needs building)
5. Boardroom Phantom wallet display fix

**Medium Priority**:
6. Marketing infrastructure (0% executed)
7. Contract template pricing updates
8. Performance optimization (lazy loading, code splitting)

---

## Documentation Standards

### File Naming
- `*_GUIDE.md` - How to do something
- `*_SPEC.md` - Technical specifications
- `*_SUMMARY.md` - Completion summaries
- `*_SETUP.md` - Initial configuration
- `*_ARCHITECTURE.md` - System design

### Where to Put Docs
- **Root**: Only `CLAUDE.md`
- **docs/**: All operational docs
- **docs/[category]/**: Organized by topic
- **docs/_archive/**: Historical only
- **.claude/skills/**: Skill documentation

### When Creating Docs
1. Check this index - don't duplicate
2. Add to appropriate subdirectory
3. Update this index
4. Add status header (ACTIVE/PLANNED/COMPLETE)

---

## Maintenance Schedule

**Weekly**:
- Review docs for outdated info
- Update implementation status

**Monthly**:
- Full documentation audit
- Archive completed plans
- Update CODEBASE_MAP.md

**Quarterly**:
- Comprehensive review
- Consolidate redundant docs
- Update DOC_INDEX.md structure

---

**Questions?** Check this index first, then `CLAUDE.md`, then `docs/SYSTEM_MAP.md`.
