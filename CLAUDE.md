# Claude Agent Guide - b0ase.com Project

> **📚 Looking for specific documentation?** See [docs/DOC_INDEX.md](docs/DOC_INDEX.md) for the master documentation index.
>
> **🏗️ Need infrastructure access?** See [docs/SYSTEM_MAP.md](docs/SYSTEM_MAP.md) for server details, database queries, and SSH commands.

## The Big Picture: Kintsugi Philosophy

**b0ase creates Kintsugi. Kintsugi creates the businesses.**

```
$BOASE (Studio) → $KINTSUGI (AI Engine) → Products
```

### Core Mental Model

**$ = Directory in Global Filesystem**
- `$PRAWNHUB` is a path lookup in a global database
- Token holders = endpoints in that directory with tradeable positions
- This IS the global namespace that BSV needs

**Token Naming Convention**
- `$b*` (lowercase 'b' after $) = bApps ecosystem (`$bMail`, `$bDrive`, `$bSearch`)
- `$NPG*` = NPG ecosystem properties
- `$TOKEN` (no 'b') = Standalone venture (`$MONEYBUTTON`, `$DNSDEX`)

**Infrastructure Stack**
- `$bDNS` = Name resolution (phone book: `$TOKEN` → address)
- `$bSearch` = Global indexer (Google: discovery, canonical state)
- These solve BSV's missing global state machine problem

**The Kintsugi Metaphor**
- Broken pottery = 50+ scattered project fragments
- Gold lacquer = Investor funding + AI orchestration
- Repaired vessel = Coherent, sellable products
- Visible seams = Token structure showing how pieces connect

**See**: `docs/TOKEN_ARCHITECTURE.md` for full details

---

## Project Overview

**b0ase.com** is a full-stack Next.js venture studio platform combining creative services, blockchain functionality, content management, and AI-powered tools.

**Stack**: Next.js 16.1.0 (App Router), TypeScript, React 18.3, Supabase (Auth + PostgreSQL), Prisma ORM, Tailwind CSS, Framer Motion, Three.js

**Architecture**: Monolithic Next.js app with 500+ API routes, 100+ database models, multi-provider auth, hybrid on/off-chain token system

**Major Modules** (as of Jan 2026):
- **Agent System**: Autonomous AI agents with scheduled tasks, project linking, and BSV blockchain inscriptions (~92% complete)
- **Developer/Agent Marketplace**: Contract-based service marketplace with Stripe/PayPal escrow, milestone tracking, and BSV inscription (117 services)
- **Blockchain Contracts**: Multi-chain contract pages (GBP, BSV, ETH, SOL) with real-time crypto pricing conversion
- **Repository Tokenization**: Transform GitHub repos into tradeable BSV-20 tokens with 3-tier verification
- **Claude Skills System**: 12 automated development skills (security, content, deployment) with pre-commit integration
- **Hybrid Blog System**: Static markdown + AI-generated database posts with strict H2-only formatting
- **Contract Pipeline** (New): Gig applications with contract generation, multi-party signing, and BSV inscription (~60% complete)

**Recent Growth** (Jan 14-23, 2026):
- +335 files (+37%), +793k tokens (+45%)
- 200+ commits implementing marketplace, contracts, and tokenization systems
- Complete rewrite of blog formatting (175 commits over 4 days)
- Contract pipeline system with 7 templates and on-chain inscription
- New pages: `/projects`, `/site-index`, `/apply/[gigId]`, `/sign/[contractId]`

## Critical Rules

### 1. Blog Post Formatting (PREVENTS RECURRING ISSUES)

**ALWAYS use only H2 headings in blog content, NEVER H1 or H3**

```markdown
# ✓ CORRECT
---
title: "Post Title"
---

## Section Heading (H2 only)

Body content here.

## Another Section (H2 only)

More body content.

# ✗ WRONG
---
title: "Post Title"
---

# Big Heading (H1)        ← Creates 3rd font size
## Section
### Subsection (H3)        ← Creates 4th font size
```

**Why**: Blog posts must have exactly **2 font sizes**:
- Headings: `text-2xl` (H2 only)
- Body: `text-lg` (paragraphs, lists, etc.)

**How it works**:
- Post title comes from frontmatter (rendered as page H1)
- Content headings use H2 only (rendered at text-2xl)
- Shared `BlogContent` component (components/blog/BlogContent.tsx) enforces this
- Using H1/H3 in content breaks visual consistency

**When writing blog posts**:
1. Read `.claude/skills/blog-formatter/SKILL.md` first
2. Use only H2 (`##`) for all section headings in content
3. Run blog-formatter skill after writing: `bash .claude/skills/blog-formatter/scripts/format.sh content/blog/post-name.md`
4. Verify rendering at http://localhost:3000/blog/post-slug

**Blog post structure** (human content first, AI metadata last):
```markdown
---
title: "Post Title"
description: "..."
date: "YYYY-MM-DD"
author: "Richard Boase"
---

[HUMAN-READABLE CONTENT STARTS IMMEDIATELY]

## First Section
Content...

## Get Started
CTA and contact info...

---

## For AI Readers
**Intent**: [What this post aims to achieve]
**Core Thesis**: [One-sentence summary]
**Key Takeaways**: [Bullet points for AI extraction]
```

**NEVER put Intent/Core Thesis/AI metadata at the TOP of the post.** Humans read first, AI metadata goes at the very end after the CTA.

**This is rule #1 because it's a recurring issue that wastes time every time a new blog post is written.**

### 2. Package Management

**ALWAYS use pnpm, NEVER npm or yarn**

```bash
# ✓ CORRECT
pnpm install
pnpm add package-name
pnpm run build

# ✗ WRONG
npm install
yarn add package-name
```

**Why**: Project uses pnpm-lock.yaml. Using npm creates package-lock.json conflicts.

### 3. Database is SELF-HOSTED (NOT Supabase Cloud)

**NEVER use supabase.com dashboard. Database runs on Hetzner server.**

```bash
# ✓ CORRECT - Run SQL via SSH
ssh hetzner "docker exec supabase-db psql -U postgres -d postgres -c 'YOUR SQL HERE'"

# ✓ CORRECT - Interactive psql session
ssh hetzner "docker exec -it supabase-db psql -U postgres -d postgres"

# ✓ CORRECT - Run migration file
ssh hetzner "docker exec supabase-db psql -U postgres -d postgres" < database/migrations/your-migration.sql

# ✗ WRONG - Never do this
open "https://supabase.com/dashboard/..."
npx supabase db push  # Won't work - no cloud connection
```

**Why**: This is a self-hosted Supabase stack on Hetzner, not Supabase cloud. The API URL `api.b0ase.com` is a custom domain pointing to the self-hosted instance. All database operations must go through SSH.

**Quick reference**:
- SSH alias: `ssh hetzner`
- Container: `supabase-db`
- Database: `postgres`
- User: `postgres`

### 4. Security Before Commits

**ALWAYS run security check before committing code**

```bash
# Run automatically via pre-commit hook
git commit -m "message"

# Or run manually
bash .claude/skills/security-check/scripts/scan.sh .
```

**Why**: Catches vulnerabilities (SQL injection, XSS, secrets) before they reach production.

### 5. Code Standards Compliance

**Review against b0ase standards before deployment**

```bash
bash .claude/skills/b0ase-standards/scripts/audit.sh .
```

**Required checks**:
- No secrets in code
- pnpm usage (not npm)
- TypeScript strict mode enabled
- Input validation on API routes
- Security headers configured

### 6. Pre-Deployment Checklist

Before pushing to production:

- [ ] Run security check
- [ ] Run standards audit
- [ ] Tests pass (pnpm test)
- [ ] Build succeeds (pnpm build)
- [ ] No console.logs in production code
- [ ] .env.example updated if new variables added
- [ ] Database migrations tested
- [ ] Supabase migrations applied

## Agent System Development

The Agent System enables creating autonomous AI agents. See full documentation:
- **Quick Start**: [docs/AGENTS_QUICK_START.md](docs/AGENTS_QUICK_START.md)
- **API Reference**: [docs/AGENTS_API_REFERENCE.md](docs/AGENTS_API_REFERENCE.md)
- **Technical Spec**: [docs/AGENT_SYSTEM_SPEC.md](docs/AGENT_SYSTEM_SPEC.md)

### Quick Reference

**Create an agent:**
```bash
POST /api/agents/create
{ "name": "My Agent", "role": "developer" }
```

**Chat with agent (streaming):**
```bash
POST /api/agents/[id]/chat
{ "message": "Hello!" }
```

**Add scheduled task:**
```bash
POST /api/agents/[id]/tasks
{
  "task_name": "Daily Tweet",
  "task_type": "tweet",
  "cron_expression": "0 9 * * *",
  "task_config": { "topic": "AI trends" }
}
```

**Task types**: `tweet`, `blog`, `analysis`, `webhook`, `ai_generate`, `inscription`, `custom`

**Link project:**
```bash
POST /api/agents/[id]/projects
{ "project_id": "uuid", "can_read": true, "can_write": false }
```

**Create inscription:**
```bash
POST /api/agents/[id]/inscriptions
{ "content": "Content to inscribe on BSV blockchain" }
```

### Key Files

| File | Purpose |
|------|---------|
| `lib/agent-executor.ts` | Task execution engine |
| `lib/agent-inscription.ts` | BSV inscription service |
| `app/api/agents/` | All agent API routes |
| `app/dashboard/agents/` | Agent management UI |

## Available b0ase Skills

Seven custom skills are available in `.claude/skills/`:

### 1. Security Check (`security-check`)

**Purpose**: Red-team penetration testing before commits

**Use when**:
- Before committing authentication code
- Before deploying to production
- Handling user input, payments, or sensitive data
- Building APIs or webhooks
- Modifying authorization logic

**Triggers**:
- "Run security check"
- "Check for vulnerabilities"
- "Pen test this code"
- "Red team review"

**What it checks**:
- OWASP Top 10 vulnerabilities
- SQL injection patterns
- XSS vulnerabilities
- Hardcoded secrets
- Authentication/authorization flaws
- Input validation gaps
- Dependency vulnerabilities

**Usage**:
```bash
# Automated scan
bash .claude/skills/security-check/scripts/scan.sh .

# Manual review
Read .claude/skills/security-check/SKILL.md
```

**Output**: JSON report with CRITICAL/HIGH/MEDIUM/LOW severity issues

### 2. Health Check (`health-check`)

**Purpose**: Comprehensive health check for security, code quality, documentation, performance, and infrastructure

**Use when**:
- Weekly health checks (every Monday)
- Before major releases
- After incidents
- Onboarding new team members
- Security or compliance reviews

**Triggers**:
- "Run health check"
- "System check"
- "Run periodic check"
- "Verify b0ase health"

**What it checks**:
- Security vulnerabilities (pnpm audit)
- Code standards compliance
- Build and type check
- Hardcoded secrets scan
- Test suite execution
- Database connectivity
- Environment variables

**Usage**:
```bash
# Full health check
bash .claude/skills/health-check/scripts/check.sh

# Quick check (subset)
bash .claude/skills/health-check/scripts/check.sh --quick
```

**Output**: Comprehensive report with pass/warn/fail status for all checks

### 3. b0ase Project Standards (`b0ase-standards`)

**Purpose**: Enforce coding standards and best practices

**Use when**:
- Setting up new features
- Reviewing code before deployment
- Onboarding new developers
- Refactoring existing code

**Triggers**:
- "Check b0ase standards"
- "Audit code quality"
- "Review compliance"

**What it checks**:
- **Security**: No secrets, proper auth, input validation
- **Package Management**: pnpm usage, no npm/yarn locks
- **TypeScript**: Strict mode, no `any` types
- **Documentation**: README, .env.example complete
- **Performance**: Bundle size, image optimization
- **Code Quality**: No console.logs, proper error handling

**Usage**:
```bash
# Run audit
bash .claude/skills/b0ase-standards/scripts/audit.sh .
```

**Output**: Compliance score, failed checks, recommendations

### 4. Multi-Platform Deploy (`multi-deploy`)

**Purpose**: Deploy to multiple platforms with automatic framework detection

**Use when**:
- Deploying to production
- Creating staging environments
- Testing deployments
- Platform migration

**Supported platforms**:
- Vercel (Next.js, React, Static) ← Current production
- Netlify (Jamstack, Functions)
- Railway (Full-stack, Databases)
- Fly.io (Global Edge)
- Render (Web Services)
- Cloudflare Pages (Edge Functions)

**Triggers**:
- "Deploy to Vercel"
- "Push to production"
- "Deploy this app"

**Usage**:
```bash
# Auto-detect platform
bash .claude/skills/multi-deploy/scripts/deploy.sh . auto

# Specific platform
bash .claude/skills/multi-deploy/scripts/deploy.sh . vercel
```

### 5. AI Content Engine (`ai-content-engine`)

**Purpose**: Set up AI-powered content business infrastructure with automation pipelines

**Use when**:
- Building AI content automation systems
- Setting up multi-platform content distribution
- Implementing AI-powered workflows
- Creating content generation pipelines

**Triggers**:
- "Set up AI content engine"
- "Build content automation"
- "Create AI content system"

**What it provides**:
- Content generation pipelines (AI agents)
- Multi-platform distribution automation
- Analytics and tracking setup
- Monetization integration
- Quality control workflows

**Usage**:
```bash
# Set up AI content engine
bash .claude/skills/ai-content-engine/scripts/setup.sh
```

**Output**: Complete AI content business infrastructure

### 6. Client Onboarding (`client-onboarding`)

**Purpose**: Complete client onboarding workflow (contracts, repos, credentials, kickoff)

**Use when**:
- Onboarding new clients
- Starting new projects
- Setting up client infrastructure
- Project handoff

**Triggers**:
- "Onboard new client"
- "Set up client project"
- "Start new client engagement"

**What it does**:
- Generate contracts and agreements
- Set up repositories and access
- Configure credentials and environments
- Schedule kickoff meetings
- Create project documentation
- Set up communication channels

**Usage**:
```bash
# Run client onboarding
bash .claude/skills/client-onboarding/scripts/onboard.sh
```

**Output**: Complete client onboarding package with all setup complete

### 7. Ralph Wiggum (`ralph-wiggum`)

**Purpose**: Autonomous loop for long-running, iterative tasks

**Use when**:
- Batch deploying tools across multiple projects
- Tasks requiring iteration until tests pass
- Greenfield projects you can walk away from
- Any well-defined task with clear completion criteria

**Triggers**:
- "Run ralph loop"
- "Start autonomous loop"
- "Ralph wiggum this task"
- "Keep iterating until done"

**How it works**:
Ralph is a self-referential loop that keeps re-feeding the same prompt until completion. Claude works → tries to exit → hook blocks → re-feeds prompt → repeat.

**Usage**:
```bash
# External bash loop (simplest)
echo "Build REST API with tests. Output DONE when complete." > task.md
bash .claude/skills/ralph-wiggum/scripts/ralph.sh task.md 20

# Or use commands within Claude Code session:
/ralph-loop "Your task" --max-iterations 20 --completion-promise "DONE"
/cancel-ralph  # To stop
```

**Best practices**:
- Always use `--max-iterations` as safety limit
- Include clear completion criteria in prompt
- Use `<promise>DONE</promise>` pattern for completion signals
- Start small (5-10 iterations) to test prompts

**WARNING**: Without limits, Claude will burn through tokens indefinitely.

**References**:
- Original: https://ghuntley.com/ralph/
- Official plugin: https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum

## Pre-Commit Workflow

A pre-commit hook is installed at `.git/hooks/pre-commit` that runs:

1. **Security Scan** - Catches CRITICAL vulnerabilities (blocking)
2. **Standards Audit** - Ensures compliance (non-blocking, warnings only)
3. **TypeScript Check** - Type errors (non-blocking, warnings only)
4. **Secrets Check** - Scans for credentials in new/modified lines (blocking)

**Blocking vs Non-blocking:**
- CRITICAL security issues and secrets → commit blocked
- HIGH security issues, TypeScript errors, standards → warnings only

This prevents pre-existing codebase issues from blocking unrelated commits while still catching new security problems.

**To bypass** (emergency only):
```bash
git commit --no-verify -m "message"
```

**But you should fix the issues instead.**

## Periodic Health Checklist

Run weekly or before major releases:

### Security Health

- [ ] `pnpm audit` shows no CRITICAL or HIGH vulnerabilities
- [ ] Security scan passes (bash .claude/skills/security-check/scripts/scan.sh .)
- [ ] No secrets in code or git history
- [ ] All API routes have input validation
- [ ] Authentication checks on sensitive endpoints
- [ ] CORS configured (no wildcard *)
- [ ] Rate limiting on public APIs
- [ ] Session tokens in httpOnly cookies

### Code Quality Health

- [ ] Standards audit passes (bash .claude/skills/b0ase-standards/scripts/audit.sh .)
- [ ] TypeScript strict mode enabled
- [ ] No `any` types in new code
- [ ] Tests passing (pnpm test)
- [ ] Build succeeds (pnpm build)
- [ ] No console.logs in app/ or lib/
- [ ] Error handling on all async operations

### Documentation Health

- [ ] README.md up to date
- [ ] .env.example includes all required variables
- [ ] API routes documented (OpenAPI comments)
- [ ] New features have usage docs
- [ ] Database schema documented (Prisma comments)
- [ ] Deployment guide current

### Performance Health

- [ ] Bundle size analyzed (pnpm build)
- [ ] Images optimized (pnpm run optimize:images)
- [ ] Videos optimized (pnpm run optimize:videos)
- [ ] Database queries use indexes
- [ ] No N+1 query patterns
- [ ] API responses cached where appropriate
- [ ] Static assets have long cache headers

### Infrastructure Health

- [ ] Database backups working (Supabase dashboard)
- [ ] Environment variables set in Vercel
- [ ] DNS records correct
- [ ] SSL certificates valid
- [ ] Error tracking configured (check Vercel logs)
- [ ] Monitoring alerts active
- [ ] Prisma migrations applied
- [ ] Supabase functions deployed

## Common Tasks

### Adding a New API Route

1. Create route file: `app/api/[name]/route.ts`
2. Add input validation with Zod
3. Implement authentication check
4. Add error handling
5. **Run security check** on new file
6. Test with Postman/curl
7. Document in API docs

**Security checklist for APIs**:
- [ ] Input validation (Zod schema)
- [ ] Authentication required
- [ ] Authorization (user owns resource)
- [ ] Rate limiting applied
- [ ] Error messages don't leak internals
- [ ] CORS headers appropriate

### Modifying Authentication

**CRITICAL: Always run security check**

1. Make changes to auth logic
2. **Run security scan**: `bash .claude/skills/security-check/scripts/scan.sh .`
3. Test auth flows manually
4. Verify session management
5. Check token expiry
6. Test logout behavior
7. Verify password reset flow

**Never commit auth changes without security scan passing.**

### Adding Dependencies

1. Check if already installed: `pnpm list | grep package-name`
2. Add with pnpm: `pnpm add package-name`
3. **Run pnpm audit**: Check for vulnerabilities
4. Update .env.example if needed
5. Document usage in code comments
6. Commit pnpm-lock.yaml changes

### Database Changes

1. Modify schema: `prisma/schema.prisma`
2. Generate migration: `npx prisma migrate dev --name description`
3. Review generated SQL
4. Test migration locally
5. Update seed scripts if needed
6. Deploy to Supabase: `supabase db push`
7. Document schema changes

### Environment Variables

**NEVER commit secrets to git**

1. Add to `.env.local` (gitignored)
2. Add example to `.env.example` (committed)
3. Add to Vercel environment variables
4. Document in README or relevant docs
5. Use in code via `process.env.VAR_NAME`

**Security check will catch secrets in code.**

## Project-Specific Rules

### 1. Authentication

**Multi-provider**: OAuth (Google, GitHub) + Wallets (MetaMask, Phantom, HandCash)

**Implementation**: `lib/auth/` and `app/api/auth/`

**Session management**: Supabase Auth + custom JWT

**Rules**:
- ALWAYS check authentication on API routes
- NEVER trust client-side role checks
- Use middleware for protected routes
- Token refresh handled automatically

### 2. Database (Prisma + Supabase)

**Schema**: 100+ models in `prisma/schema.prisma`

**Migrations**: `prisma/migrations/`

**Rules**:
- NEVER run `prisma db push` in production (use migrations)
- ALWAYS add indexes for frequently queried fields
- Use transactions for multi-table updates
- Soft delete (isDeleted flag) not hard delete

### 3. API Routes (500+ routes)

**Structure**: `app/api/`

**Authentication**: Most routes require auth

**Rules**:
- Input validation with Zod
- Error handling with try/catch
- Rate limiting on public endpoints
- CORS headers only for known origins
- Return proper HTTP status codes

### 4. Blockchain Integration

**Chains**: BSV, Ethereum, Solana

**Wallets**: MetaMask, Phantom, HandCash

**Implementation**: `lib/blockchain/`

**Rules**:
- NEVER store private keys server-side
- Validate all blockchain addresses
- Handle gas/fee estimation errors
- Implement transaction retry logic
- Monitor blockchain confirmations

### 5. Payment Processing

**Structure**: 1/3-1/3-1/3 split with 25% margin protection

**Implementation**: `lib/pricing/`

**Rules**:
- NEVER trust client-side price calculations
- Fetch prices from database server-side
- Validate payment amounts server-side
- Log all payment transactions
- Handle payment failures gracefully

## Deployment

**Production**: Vercel (https://b0ase.com)

**Staging**: Vercel preview deployments

**Process**:
1. Push to branch → Vercel preview deploy
2. Test preview deployment
3. Merge to main → Production deploy
4. Monitor error logs post-deploy

**Automatic deployments**: Yes, on push to main

**Environment**: Set in Vercel dashboard

## Monitoring & Debugging

### Logs

```bash
# View Vercel logs
vercel logs

# Local development logs
pnpm dev
```

### Error Tracking

- Vercel error logs
- Supabase logs
- Browser console (development)

### Performance

- Vercel Analytics
- Next.js build analysis
- Lighthouse scores

## Common Issues & Solutions

### Issue: pnpm install fails

**Solution**: Remove node_modules and reinstall
```bash
rm -rf node_modules
pnpm install
```

### Issue: Prisma client out of sync

**Solution**: Regenerate client
```bash
npx prisma generate
```

### Issue: Build fails on Vercel

**Checklist**:
- [ ] All environment variables set
- [ ] pnpm-lock.yaml committed
- [ ] TypeScript errors resolved
- [ ] Database accessible from Vercel
- [ ] Build command correct in vercel.json

### Issue: Authentication not working

**Checklist**:
- [ ] Supabase URL and key in environment
- [ ] Callback URLs configured in Supabase
- [ ] OAuth providers configured
- [ ] Session cookies enabled
- [ ] CORS headers set

### Issue: Database connection fails

**Checklist**:
- [ ] DATABASE_URL correct in .env
- [ ] Prisma client generated
- [ ] Database accessible from deployment
- [ ] Connection pooling configured
- [ ] SSL mode set correctly

## Testing

### Unit Tests

```bash
pnpm test
```

### E2E Tests

```bash
pnpm test:e2e
```

### Manual Testing Checklist

Before deploying:

- [ ] Authentication flows (login, logout, signup)
- [ ] Payment processing
- [ ] API endpoints
- [ ] File uploads
- [ ] Blockchain transactions
- [ ] Real-time features (if applicable)
- [ ] Mobile responsiveness

## Documentation

**Main docs**: `docs/` directory

**API docs**: OpenAPI comments in route files

**Database schema**: Prisma schema comments

**Architecture**: `docs/CODEBASE_MAP.md`

**Security audit**: `SECURITY_AUDIT.md`

**Marketing**: `MARKETING_PLAN.md`

## Getting Help

### Internal Resources

1. Check `.claude/AGENTS.md` for codebase overview
2. Review `docs/` for detailed documentation
3. Check this file (CLAUDE.md) for rules and workflows

### External Resources

- Next.js docs: https://nextjs.org/docs
- Prisma docs: https://www.prisma.io/docs
- Supabase docs: https://supabase.com/docs
- Vercel docs: https://vercel.com/docs

## Summary: Key Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Production build
pnpm test                   # Run tests

# Quality Checks
bash .claude/skills/security-check/scripts/scan.sh .    # Security scan
bash .claude/skills/b0ase-standards/scripts/audit.sh .  # Standards audit
pnpm audit                  # Dependency vulnerabilities

# Database
npx prisma migrate dev      # Create migration
npx prisma generate         # Regenerate client
npx prisma studio           # Database GUI

# Deployment
git push                    # Auto-deploy to Vercel (if main branch)
vercel deploy               # Manual deploy
vercel logs                 # View deployment logs

# Optimization
pnpm run optimize:images    # Optimize images
pnpm run optimize:videos    # Optimize videos
```

## MoneyButtons (moneybutton.store)

**MoneyButton.store** is where we sell custom MoneyButtons for brands, products, handles, stores, and ideas.

**Key Pages**:
- `/moneybuttons` - Interactive MoneyButtons showcase (based on `/buttons`)
- `/portfolio/moneybutton-store` - MoneyButton portfolio page
- `/tools/scrollpay` - ScrollPay integration demo

**MoneyButton Concept**:
- Every button on b0ase.com is a "MoneyButton" - a tradeable token on the Bitcoin blockchain
- Users can get their own MoneyButtons for their brand/product/handle
- MoneyButtons enable micropayments, micro-equity, and token-based transactions
- Reference MoneyButtons naturally in blog posts as the standard way to transact

**Blog Integration**:
- When writing about payments, transactions, or buttons, reference MoneyButtons naturally
- Examples: "Click the MoneyButton to invest", "Every scroll triggers a MoneyButton", "Get your own MoneyButton"

**External Domain**: https://moneybutton.store (sales and custom orders)

---

## Critical Reminders

1. ✅ **ALWAYS use pnpm** (never npm or yarn)
2. ✅ **ALWAYS run security check** before committing auth/payment code
3. ✅ **NEVER commit secrets** to git
4. ✅ **ALWAYS validate input** on API routes
5. ✅ **ALWAYS check authentication** on protected routes
6. ✅ **RUN pre-commit checks** before pushing
7. ✅ **UPDATE .env.example** when adding variables
8. ✅ **TEST thoroughly** before deploying to production

---

**Last Updated**: 2026-01-23
**Maintained By**: b0ase team
**Questions**: Check `.claude/AGENTS.md` or documentation
