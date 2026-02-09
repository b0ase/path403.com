# Documentation Audit Report

**Date**: 2026-01-19
**Audited**: 206 markdown files across project
**Total Tokens**: ~2.47M

---

## Executive Summary

This comprehensive audit identified **significant documentation fragmentation**, with 15+ root-level docs that should be consolidated, 21 archived docs (8 should be deleted), and multiple competing/outdated plans. The codebase has grown 37% in the past week with minimal doc cleanup.

### Key Findings

| Category | Count | Issues |
|----------|-------|--------|
| Root-level docs | 15 | 10 should move to /docs |
| /docs directory | 66 | 12 should be archived |
| /docs/_archive | 21 | 8 can be deleted |
| Contract templates | 20 | 3 redundant, pricing outdated |
| Blog posts | 34 | All active |
| Portfolio READMEs | 26 | Misplaced in /public |
| Skill docs | 12 | All active |

---

## Critical Loose Ends

### 1. Authentication System Conflicts

**Problem**: Multiple competing auth documentation
- `HANDOFF_AUTH_SIMPLIFICATION.md` proposes complete rewrite → NOT IMPLEMENTED
- `AUTH-SYSTEM.md` documents current system → ACTIVE
- Reality: Using `unified_users` + `user_identities` pattern

**Resolution**: Delete HANDOFF_AUTH_SIMPLIFICATION.md or clearly mark as "PROPOSED - NOT IMPLEMENTED"

### 2. Token Systems Fragmentation

**Problem**: 4 different token systems identified in kintsugi-claude.md
1. `token_balances` table (original)
2. `user_token_balances` table (multi-token, NEW)
3. `cap_table_shareholders` (investor registry)
4. `venture_tokens` (portfolio tokens)

**Status**: Multi-token system now deployed (Jan 19), but documentation doesn't reflect consolidation.

**Resolution**: Update TOKEN_REGISTRY documentation to reflect unified system.

### 3. Repository Tokenization - 15% Complete

**Problem**: Two docs cover overlapping scope
- `REPO_TOKENIZATION_ROADMAP.md` - Main roadmap
- `GITHUB_OAUTH_GAPS.md` - Lists missing OAuth integration

**Missing Implementation**:
- [ ] GitHub OAuth scope expansion (repo access)
- [ ] Real repository data fetching
- [ ] Token storage in database
- [ ] On-chain minting (BSV-21)
- [ ] Verification badge system

**Resolution**: Merge into single `/docs/roadmaps/repo-tokenization.md`

### 4. Marketing Plans - 0% Executed

**Problem**: Comprehensive plans with no execution
- `MARKETING_PLAN.md` (792 lines)
- `VOLUMEMAXXING_STRATEGY.md` (761 lines)

**Missing**:
- Email infrastructure not built
- No outreach executed
- No tracking implemented
- £2,697/mo budget not allocated

**Resolution**: Move to `/docs/marketing/`, add "STATUS: PLANNED" header

### 5. Database Documentation Redundancy

**Problem**: 3 docs cover same consolidation
- `DATABASE_CONSOLIDATION_GUIDE.md` (plan)
- `DATABASE_CONSOLIDATION_COMPLETE.md` (summary)
- `FINAL_DATABASE_CONSOLIDATION_SUMMARY.md` (duplicate summary)

**Resolution**: Keep one summary, archive others

### 6. Studio/Video Fixes - Duplicated

**Problem**: Same fix documented twice
- `PRODUCTION_VIDEO_FIX.md`
- `STUDIO_FIX_SUMMARY.md`

**Status**: Fix is complete.

**Resolution**: Archive both to `/docs/_archive/studio-video-fix-2026-01/`

### 7. Contract Templates - Pricing Issues

**Problem**:
- Payment structure inconsistent (some 50/50, should be 33/33/34)
- BSV conversion rates hardcoded and outdated
- 3 redundant contracts (token-website, tokenomics-design, website-redesign)

**Resolution**: Update all contracts, merge redundant ones

### 8. Missing Security Fixes

**Documented but unfixed**:
- Hardcoded ADMIN_EMAIL in `/middleware.ts`
- BOARDROOM_BOT_API_KEY exposure risk
- Rate limiting not fully implemented

**Resolved**:
- ~~Hardcoded credentials in `/app/api/central-automation/route.ts`~~ (route deleted, Oracle server deprecated)

**Resolution**: Create SECURITY_REMEDIATION_CHECKLIST.md

---

## Implementation Status Matrix

### Features Fully Implemented (100%)

| Feature | Documentation | Last Updated |
|---------|--------------|--------------|
| Multi-provider Auth | AUTH-SYSTEM.md | Jan 2026 |
| Blog System | BLOG_POST_FORMAT_GUIDE.md | Jan 2026 |
| Developer Marketplace | CODEBASE_MAP.md | Jan 2026 |
| Notion Integration | NOTION_INTEGRATION.md | Current |
| Video Upload | VIDEO_UPLOAD_SYSTEM_COMPLETE.md | Complete |
| Role System | ROLE_SYSTEM.md | Current |

### Features Partially Implemented (25-75%)

| Feature | Status | Missing |
|---------|--------|---------|
| Repository Tokenization | 15% | OAuth scopes, real data, minting |
| Investor Onboarding | 70% | Admin dashboard, email notifications |
| Multi-token Accounts | 90% | Admin confirmation UI |
| Boardroom Voting | 80% | Phantom wallet display fix |
| Performance Optimization | 60% | Bundle splitting, lazy loading |

### Features Planned Only (0%)

| Feature | Documentation | Est. Effort |
|---------|--------------|-------------|
| Marketing Execution | MARKETING_PLAN.md | 4-8 weeks |
| Auto-Book System | AUTO_BOOK_QUEUE_SYSTEM.md | 5 weeks |
| Minting Contracts | MINTING_CONTRACTS_ARCHITECTURE.md | 7 weeks |
| Contract Marketplace | CONTRACT_MARKETPLACE_ARCHITECTURE.md | 6-8 weeks |
| Restaurant Voice AI | RESTAURANT_VOICE_AGENT_PLAN.md | 4 weeks |

---

## Immediate Actions Required

### 1. DELETE (8 files)

```
docs/_archive/AUTO_DEPLOY_TEST.md
docs/_archive/VERCEL_TEST.md
docs/_archive/richard.md
docs/_archive/logout.md
docs/_archive/SESSION_SUMMARY.md
docs/_archive/TODO.md
docs/_archive/agency-outreach-tracker.md
docs/_archive/BITCOIN_EMAIL_TODO.md
```

### 2. ARCHIVE (12 files)

Move to `docs/_archive/`:
```
HANDOFF_2026-01-15.md
HANDOFF_AUTH_SIMPLIFICATION.md
PRODUCTION_VIDEO_FIX.md
STUDIO_FIX_SUMMARY.md
notes-to-do.md
docs/BLOG_SYSTEM_IMPLEMENTATION_PLAN.md
docs/BLOG_SYSTEM_KNOWLEDGE_BASE.md
docs/STUDIO_VIDEO_FIX.md
docs/DISCORD_CONNECTION_FIX.md
docs/SIMPLE_AUTH_TESTING.md
docs/NINJAPUNKGIRLS_WEBSITE_ADDITION.md
docs/PROJECTS_SETUP.md (or mark as REFERENCE)
```

### 3. MOVE TO /docs (10 files)

```
GITHUB_OAUTH_GAPS.md → docs/technical/github-oauth-gaps.md
MARKETING_PLAN.md → docs/marketing/strategy.md
VOLUMEMAXXING_STRATEGY.md → docs/marketing/volumemaxxing.md
REPO_TOKENIZATION_ROADMAP.md → docs/roadmaps/repo-tokenization.md
RESTAURANT_VOICE_AGENT_PLAN.md → docs/business/restaurant-voice-ai.md
SECURITY_QUICK_REF.md → merge into SECURITY_AUDIT.md
kintsugi-claude.md → docs/technical/kintsugi-repair-2026-01.md
notes-consolidated.md → docs/ROADMAP.md (consolidate)
public/INTERNAL_API_DESIGN.md → docs/api/INTERNAL_API_DESIGN.md
public/MPC_DESIGN.md → docs/architecture/MPC_DESIGN.md
```

### 4. MERGE (3 sets)

```
# Database consolidation (keep one)
DATABASE_CONSOLIDATION_COMPLETE.md ← FINAL_DATABASE_CONSOLIDATION_SUMMARY.md

# Security (combine)
SECURITY_AUDIT.md ← SECURITY_QUICK_REF.md

# GitHub/Repo tokenization (combine)
docs/roadmaps/repo-tokenization.md ← GITHUB_OAUTH_GAPS.md + REPO_TOKENIZATION_ROADMAP.md
```

### 5. RESTORE FROM ARCHIVE (5 files)

```
docs/_archive/Overview.md → docs/PLATFORM_OVERVIEW.md
docs/_archive/B0ASE_COMPREHENSIVE_ANALYSIS.md → docs/COMPREHENSIVE_GUIDE.md
docs/_archive/CLAUDE_OPTIMISATION_GUIDE.md → docs/OPTIMIZATION_STRATEGY.md
docs/_archive/PERFORMANCE_OPTIMIZATION.md → docs/PERFORMANCE_GUIDE.md
docs/_archive/PERFORMANCE_OPTIMIZATION_GUIDE.md → merge with above
```

### 6. UPDATE (20+ files)

All contract templates need:
- Payment structure: 50/50 → 33/33/34
- Remove hardcoded BSV amounts
- Update tech stack versions
- WCAG 2.1 → WCAG 2.2

---

## Documentation Health Score

| Metric | Score | Notes |
|--------|-------|-------|
| Coverage | 95% | Excellent - most systems documented |
| Organization | 60% | Poor - fragmented across root/docs |
| Currency | 65% | Many docs lack dates |
| Consistency | 50% | No standard format/headers |
| Maintenance | 40% | Completed plans not archived |
| **Overall** | **62%** | Needs consolidation |

---

## Proposed New Structure

```
/docs
├── DOC_INDEX.md (master index)
├── CODEBASE_MAP.md (auto-generated)
├── SYSTEM_MAP.md (infrastructure)
│
├── /api
│   ├── INTERNAL_API_DESIGN.md
│   └── v1/README.md
│
├── /architecture
│   ├── AUTH-SYSTEM.md
│   ├── MPC_DESIGN.md
│   ├── MINTING_CONTRACTS_ARCHITECTURE.md
│   └── CONTRACT_MARKETPLACE_ARCHITECTURE.md
│
├── /guides
│   ├── DEPLOYMENT_GUIDE.md
│   ├── TESTING_GUIDE.md
│   ├── PERFORMANCE.md
│   ├── BLOG_POST_FORMAT_GUIDE.md
│   └── page-style-guide.md
│
├── /marketing
│   ├── strategy.md
│   └── volumemaxxing.md
│
├── /roadmaps
│   ├── repo-tokenization.md
│   ├── CHECKLIST.md
│   └── DEVELOPER_ONBOARDING_PLAN.md
│
├── /security
│   ├── SECURITY_AUDIT.md
│   ├── SECURITY_FINDINGS.md
│   └── TRAIL_OF_BITS_ANALYSIS.md
│
├── /setup
│   ├── ENVIRONMENT_VARIABLES.md
│   ├── DISCORD_OAUTH_SETUP.md
│   ├── GITHUB_OAUTH_SETUP.md
│   └── TWITTER_SETUP.md
│
├── /technical
│   ├── kintsugi-repair-2026-01.md
│   ├── DATABASE_MIGRATION_MANUAL.md
│   └── COMPONENT_SPLITTING_GUIDE.md
│
└── /_archive
    └── (completed/obsolete docs)
```

---

## Next Steps

1. **Immediate** (Today):
   - Delete 8 obsolete archived files
   - Move 10 root-level docs to /docs
   - Archive 12 completed/outdated docs

2. **This Week**:
   - Update all contract templates
   - Consolidate duplicate docs
   - Add status headers to all planning docs
   - Restore 5 valuable archived docs

3. **This Month**:
   - Implement proposed directory structure
   - Add frontmatter to all docs (status, date, category)
   - Create quarterly review schedule
   - Update DOC_INDEX.md to reflect new structure

---

## Appendix: Full File List

### Root-Level Docs (15)
1. CLAUDE.md - KEEP (core reference)
2. GITHUB_OAUTH_GAPS.md - MOVE
3. HANDOFF_2026-01-15.md - ARCHIVE
4. HANDOFF_AUTH_SIMPLIFICATION.md - DELETE
5. MARKETING_PLAN.md - MOVE
6. PRODUCTION_VIDEO_FIX.md - ARCHIVE
7. REPO_TOKENIZATION_ROADMAP.md - MOVE
8. RESTAURANT_VOICE_AGENT_PLAN.md - MOVE
9. SECURITY_AUDIT.md - KEEP
10. SECURITY_QUICK_REF.md - MERGE
11. STUDIO_FIX_SUMMARY.md - ARCHIVE
12. VOLUMEMAXXING_STRATEGY.md - MOVE
13. kintsugi-claude.md - MOVE
14. notes-consolidated.md - CONSOLIDATE
15. notes-to-do.md - DELETE

### Implementation Priority Queue

Based on documentation analysis, the following features need attention:

**P0 - Critical**:
- Security hardcoded credentials fix
- Rate limiting implementation

**P1 - High**:
- Repository tokenization OAuth (enables main feature)
- Admin confirmation UI for purchases
- Boardroom Phantom wallet fix

**P2 - Medium**:
- Marketing infrastructure
- Auto-book system
- Performance optimization

**P3 - Low**:
- Restaurant voice AI
- Minting contracts
- Contract marketplace

---

*Generated by Documentation Audit - 2026-01-19*
