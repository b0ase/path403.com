# b0ase.com - Unified Product Requirements Document

**Version**: 1.0
**Last Updated**: 2026-01-31
**Status**: Active Development

---

## Executive Summary

**b0ase.com** is a venture studio platform that uses AI agents to build, repair, and tokenize companies. The core value proposition: transform broken projects into investable, legal companies with working products, cap tables, and tradeable tokens.

**One-liner**: "AI agents that build companies, not just code."

---

## Product Vision

### The Problem

1. **Abandoned projects** - Millions of unfinished projects on GitHub rot because founders ran out of time/money
2. **Fragmented tools** - Building a company requires 20+ disconnected services
3. **Illiquid ownership** - Early supporters can't invest until Series A

### The Solution

An AI-powered venture studio where:
- **Agents manage everything** - Projects, contracts, tokens, workflows
- **Kintsugi repairs broken projects** - AI analyzes, plans, funds, builds
- **Tokens enable early investment** - Supporters become investors from day one
- **Everything inscribes on-chain** - Immutable proof of work, ownership, agreements

---

## Architecture Hierarchy

```
AGENTS (Top Level - Autonomous AI)
   ↓
PROJECTS (What agents work on)
   ↓
├── CONTRACTS (Legal agreements, inscribed on-chain)
├── TOKENS (Ownership, tradeable on BSV-20)
├── WORKFLOWS (Multi-stage pipelines)
└── TASKS (Scheduled, triggered, or manual)
```

**Key principle**: Agents are first-class citizens. Everything else is subordinate.

---

## Core Products

### 1. Agent System (~92% Complete)

Autonomous AI agents that manage projects, execute tasks, and inscribe work on-chain.

**Capabilities**:
- Chat interface with streaming responses
- Scheduled tasks (cron-based)
- Project linking with read/write permissions
- BSV blockchain inscriptions
- Multi-provider AI (Anthropic, OpenAI, Perplexity)

**Task Types**: `tweet`, `blog`, `analysis`, `webhook`, `ai_generate`, `inscription`, `custom`

**Status**: Core infrastructure complete. Needs automation engine for triggered workflows.

**Spec**: [AGENT_SYSTEM_SPEC.md](AGENT_SYSTEM_SPEC.md)

---

### 2. Kintsugi Repair Engine (~60% Complete)

AI that resurrects abandoned projects into working companies.

**Process**:
1. **Analyze** - AI scans project, identifies what's broken
2. **Plan** - Generate repair proposal with milestones
3. **Fund** - Crowdfund tranches via token pre-sales
4. **Build** - Match developers, execute repairs
5. **Ship** - Deploy working product with legal structure

**Output**: Complete company with:
- Working product
- Legal entity (UK Ltd or US LLC)
- Cap table with token-based ownership
- BSV-20 tokens for trading
- Investor dashboard

**Status**: Chat UI complete. Repair workflow partially implemented.

**Spec**: [KINTSUGI_ARCHITECTURE.md](KINTSUGI_ARCHITECTURE.md)

---

### 3. Pipeline System (~70% Complete)

7-stage client workflow from discovery to post-launch.

**Stages**:
1. Discovery - Requirements gathering
2. Specification - Technical spec, user stories
3. Design - UI/UX, wireframes, prototypes
4. Development - Build sprints, code review
5. Testing - QA, user acceptance
6. Deployment - Infrastructure, launch
7. Post-Launch - Support, iterations

**Features**:
- Stage-specific AI agents
- Milestone payments
- Feature funding marketplace
- Client portal with progress tracking

**Status**: UI complete. Payment triggers need wiring.

**Spec**: [PIPELINE_SYSTEM_SPEC.md](PIPELINE_SYSTEM_SPEC.md)

---

### 4. Token Architecture (Designed, ~30% Implemented)

Investment model using BSV-20 tokens.

**Token Bundle**: Investors receive proportional allocations in ALL b0ase tokens:
- BOASE (platform)
- KINTSUGI (repair engine)
- DIVVY (dividend distribution)
- bSheets (spreadsheet tool)
- bOS (operating system)
- bWriter (content tool)

**Mechanics**:
- 100B standardized supply per token
- Bonding curve pricing
- Tranche-based funding
- Dividend distribution to holders

**Status**: Token creation works. Dividends calculate but don't execute payments.

**Spec**: [TOKEN_ARCHITECTURE.md](TOKEN_ARCHITECTURE.md)

---

### 5. Contract Marketplace (Designed, ~10% Implemented)

AI-searchable contract marketplace on BSV blockchain.

**Contract Types**:
- `OFFER_CONTRACT` - Service providers list capabilities
- `PROBLEM_CONTRACT` - Clients describe needs
- `AGREEMENT_CONTRACT` - Matched deal terms
- `COMPLETION_CONTRACT` - Verified deliverables

**Features**:
- Markdown-based format
- On-chain inscription
- AI matching (problem → solution)
- Verification system

**Status**: Architecture designed. Awaiting implementation.

**Spec**: [CONTRACT_MARKETPLACE_ARCHITECTURE.md](CONTRACT_MARKETPLACE_ARCHITECTURE.md)

---

## Payment Infrastructure

### Current State

| Component | UI | Backend | Execution |
|-----------|-----|---------|-----------|
| MoneyButtons | ✅ | ✅ | ❌ Not wired |
| ScrollPay | ✅ | ✅ | ❌ Not wired |
| Dividends | ✅ | ✅ | ❌ DB only |
| HandCash | ✅ | ✅ | ✅ Works |
| Registry | ✅ | ✅ | ✅ Works |

### Critical Gaps

1. **MoneyButton UI** doesn't call payment API
2. **Dividends** calculate but don't execute
3. **No automation engine** - cron/triggers missing
4. **Disconnect** between UI clicks and on-chain events

### Fix Priority

1. Wire MoneyButton → payment API (quick win)
2. Connect dividends → HandCash execution (high impact)
3. Build automation engine (cron + triggers)
4. Unify button clicks with on-chain inscriptions

**Details**: [MASTER_PLAN.md](MASTER_PLAN.md)

---

## Database Schema

**183+ Prisma models** covering:

| Domain | Key Models |
|--------|------------|
| Agents | Agent, AgentTask, AgentProject, AgentConversation |
| Projects | Project, ProjectMilestone, ProjectDeliverable |
| Contracts | Contract, ContractTemplate, ContractSignature |
| Tokens | Token, TokenHolder, TokenTransaction |
| Users | User, Account, Session, Subscription |
| Payments | Payment, Invoice, Escrow, Dividend |
| Content | Post, BlogPost, ContentPiece |

**Access**: Self-hosted Supabase on Hetzner (NOT cloud)

```bash
ssh hetzner "docker exec supabase-db psql -U postgres -d postgres -c 'YOUR SQL'"
```

---

## API Structure

**500+ routes** organized by domain:

```
/api/agents/          - Agent CRUD, chat, tasks, inscriptions
/api/projects/        - Project management
/api/contracts/       - Contract generation, signing
/api/tokens/          - Token operations
/api/payments/        - Payment processing
/api/auth/            - Multi-provider authentication
/api/blog/            - Content management
/api/marketplace/     - Service listings
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.1.0 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + Framer Motion |
| Database | PostgreSQL via Prisma |
| Auth | Supabase Auth + OAuth + Wallets |
| Blockchain | BSV (primary) + Ethereum + Solana |
| Payments | HandCash + Stripe + PayPal |
| AI | Anthropic + OpenAI + Perplexity |
| Hosting | Vercel (app) + Hetzner (infra) |

---

## User Personas

### 1. Founder (Primary)

**Goal**: Turn idea into funded company
**Journey**: Submit project → Get repair plan → Raise funds → Ship product
**Value**: Saves months of fragmented work

### 2. Investor

**Goal**: Back early-stage projects with liquidity
**Journey**: Browse projects → Buy tokens → Track progress → Trade or hold
**Value**: Earlier access than traditional VC

### 3. Developer

**Goal**: Get paid for building
**Journey**: List services → Match with projects → Complete milestones → Receive BSV
**Value**: Guaranteed escrow, clear scope

### 4. Agency Client

**Goal**: Get custom software built
**Journey**: Submit brief → Approve spec → Track progress → Launch
**Value**: Transparent pipeline, AI assistance

---

## Success Metrics

### North Star

- **Companies launched** (end-to-end: idea → tradeable token)

### Leading Indicators

| Metric | Target |
|--------|--------|
| Agent tasks executed/week | 1000+ |
| Projects in pipeline | 50+ active |
| Token transactions/day | 100+ |
| Developer matches/week | 20+ |

### Health Metrics

| Metric | Target |
|--------|--------|
| API uptime | 99.9% |
| Payment success rate | 98%+ |
| Average task completion | <5 min |

---

## Implementation Phases

### Phase 1: Wire Payments (Current)

- [ ] Connect MoneyButton UI to payment API
- [ ] Execute dividends via HandCash
- [ ] Add payment confirmation callbacks
- [ ] Test end-to-end flows

### Phase 2: Automation Engine

- [ ] Cron scheduler for agent tasks
- [ ] Event triggers (on payment, on inscription)
- [ ] Webhook integrations
- [ ] Task queue with retry logic

### Phase 3: Contract Marketplace

- [ ] Implement OFFER_CONTRACT inscriptions
- [ ] Build AI matching service
- [ ] Create contract negotiation UI
- [ ] Deploy verification system

### Phase 4: Kintsugi Complete

- [ ] Automated project analysis
- [ ] Repair proposal generation
- [ ] Tranche-based funding UI
- [ ] Developer matching algorithm

### Phase 5: Scale

- [ ] Multi-chain deployment (Stacks)
- [ ] Mobile app
- [ ] API for third-party integrations
- [ ] White-label for other studios

---

## Dependencies Between Systems

```
Agent System ──────────┐
                       ▼
Kintsugi ──────────► Pipeline ──────────► Contracts
                       │                      │
                       ▼                      ▼
                   Payments ◄──────────── Tokens
                       │
                       ▼
                   HandCash (execution)
```

**Critical path**: Payment execution must work before anything else scales.

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [AGENT_SYSTEM_SPEC.md](AGENT_SYSTEM_SPEC.md) | Agent technical spec |
| [PIPELINE_SYSTEM_SPEC.md](PIPELINE_SYSTEM_SPEC.md) | Pipeline workflow spec |
| [TOKEN_ARCHITECTURE.md](TOKEN_ARCHITECTURE.md) | Token economics |
| [KINTSUGI_ARCHITECTURE.md](KINTSUGI_ARCHITECTURE.md) | Repair engine design |
| [MASTER_PLAN.md](MASTER_PLAN.md) | Payment gap analysis |
| [CODEBASE_MAP.md](CODEBASE_MAP.md) | File navigation |
| [CLAUDE.md](../CLAUDE.md) | Development rules |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-01-31 | Initial unified PRD created from fragmented docs |

---

**Questions?** See [CLAUDE.md](../CLAUDE.md) or email richard@b0ase.com
