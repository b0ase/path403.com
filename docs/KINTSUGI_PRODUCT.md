# Kintsugi - Product Specification

**Last Updated:** January 24, 2026
**Status:** IN DEVELOPMENT (~60% complete)
**Owner:** b0ase.com Ltd

---

## The Elevator Pitch

> **Kintsugi is an AI engine that repairs broken software projects.**
>
> Like the Japanese art of repairing pottery with gold, Kintsugi fills the cracks in abandoned codebases with capital (from investors) and skilled hands (from developers), transforming broken projects into investable assets.

---

## The Vision: Internet Capital Markets

b0ase.com isn't just a platform - it's infrastructure for **internet-native capital markets**:

| Traditional Markets | Internet Capital Markets |
|---------------------|--------------------------|
| Accredited investors only | Certified investors (self-cert + KYC) |
| Paper share certificates | Tokenized equity (BSV-20) |
| Broker/dealer intermediaries | Direct platform access |
| Quarterly statements | Real-time portfolio dashboard |
| Wire transfers | Crypto + card payments |
| Cap table in spreadsheets | Cap table on-chain |
| Exit via M&A/IPO only | Trade tokens anytime |
| Geographic restrictions | Global by default |

**Kintsugi builds the companies. AI agents do the work. 24/7.**

---

## The Problem

**Millions of software projects are abandoned every year:**

- Solo founders run out of time or money
- Side projects never reach completion
- Startups pivot, leaving codebases orphaned
- Open source projects lose maintainers
- MVPs sit unfinished in GitHub graveyards

These projects have value - architecture, code, ideas - but lack the resources to reach completion.

**Traditional solutions fail:**

| Approach | Problem |
|----------|---------|
| Hire developers | Expensive, hard to find good talent |
| Find a co-founder | Takes months, equity dilution |
| Outsource | Quality issues, communication overhead |
| Abandon | Wasted effort, lost opportunity |

---

## The Solution: Kintsugi

Kintsugi is an **AI-powered project repair engine** that:

1. **Analyzes** broken projects to understand what's missing
2. **Plans** repairs as fundable tranches tied to GitHub issues
3. **Matches** developers with the skills to complete each tranche
4. **Manages** the repair process with AI agents
5. **Tokenizes** the result so investors can participate in the upside

```
┌─────────────────────────────────────────────────────────────────┐
│                        KINTSUGI ENGINE                          │
│                                                                 │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐      │
│  │ BROKEN  │ → │ ANALYZE │ → │  FUND   │ → │ REPAIR  │ → ✓   │
│  │ PROJECT │    │ & PLAN  │    │TRANCHES │    │ & SHIP  │      │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘      │
│       ↑              │              │              │            │
│       │         AI Agent       Investors      Developers        │
│       │                                                         │
│       └─── Founder submits project ────────────────────────────┘
└─────────────────────────────────────────────────────────────────┘
```

---

## How It Works

### Step 1: Project Submission

Founder connects their GitHub repository to Kintsugi:

```
Founder: "I have a half-built SaaS app. I got to 60%
         complete but ran out of runway. Can you help?"

Kintsugi: "I'll analyze your codebase and create a
          repair plan with fundable milestones."
```

### Step 2: AI Analysis

Kintsugi's AI agents analyze the codebase:

- **Architecture review** - What's the tech stack? What's built?
- **Gap analysis** - What's missing? What's broken?
- **Effort estimation** - How much work to complete each piece?
- **Skill matching** - What developer skills are needed?

### Step 3: Tranche Creation

The repair plan is broken into **10 fundable tranches**:

| Tranche | Focus | Funding Target | Status |
|---------|-------|----------------|--------|
| 1. Foundation | Core infrastructure | £5,000 | Open |
| 2. Authentication | User auth system | £3,000 | Open |
| 3. Core Features | Main functionality | £8,000 | Open |
| 4. Integration | Third-party APIs | £4,000 | Locked |
| 5. Polish | UI/UX improvements | £3,000 | Locked |
| ... | ... | ... | ... |
| 10. Launch | Go-to-market | £5,000 | Locked |

Each tranche is linked to specific GitHub issues.

### Step 4: Investor Funding

Investors browse projects and fund tranches:

```
Investor: "I want to invest £1,000 in the Authentication
          tranche of ProjectX."

Kintsugi: "You'll receive 1,000 $PROJECTX tokens when
          the tranche completes. These represent 0.5%
          of the project."
```

### Step 5: Developer Matching

Kintsugi matches developers to issues:

```
Developer: "I'm a Node.js expert looking for paid work."

Kintsugi: "ProjectX needs authentication work. The tranche
          is funded. You'll earn £2,500 + 500 $PROJECTX
          tokens for completing these 5 issues."
```

### Step 6: AI-Assisted Repair

Developers work with AI agents:

- **Code generation** - AI writes boilerplate, developer reviews
- **Testing** - AI generates test cases
- **Documentation** - AI creates docs from code
- **Code review** - AI catches issues before merge

### Step 7: Completion & Distribution

When a tranche completes:

1. GitHub issues are closed
2. Investor tokens are released from escrow
3. Developer payment is processed
4. Project moves to next tranche

### Step 8: Launch & Beyond

Completed projects:

- Launch to market
- Generate revenue
- Distribute dividends to token holders
- Continue development with new tranches

---

## The Kintsugi Advantage

### For Founders

| Benefit | Description |
|---------|-------------|
| **No upfront cost** | Investors fund the work |
| **Keep control** | You retain majority equity |
| **Quality developers** | Vetted by Kintsugi |
| **AI acceleration** | 10x faster development |
| **Token upside** | Your tokens appreciate with success |

### For Investors

| Benefit | Description |
|---------|-------------|
| **Fractional investment** | Invest from £100 |
| **Transparent progress** | GitHub issues = milestones |
| **Diversification** | Invest across many projects |
| **Token liquidity** | Trade tokens on BSV exchanges |
| **Early access** | Fund projects before they're valuable |

### For Developers

| Benefit | Description |
|---------|-------------|
| **Paid work** | Earn money for completing issues |
| **Token upside** | Earn project tokens as bonus |
| **AI assistance** | Work faster with AI agents |
| **Flexible hours** | Work on your schedule |
| **Portfolio building** | Ship real products |

---

## Technical Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────────┐
│  KINTSUGI ENGINE                                                │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  CHAT INTERFACE  │  │   AI PROVIDER    │                    │
│  │  └── Discovery   │  │  └── Claude      │                    │
│  │  └── Planning    │  │  └── Gemini      │                    │
│  │  └── Support     │  │  └── Deepseek    │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  GITHUB SYNC     │  │  TOKEN MINTING   │                    │
│  │  └── Issues      │  │  └── BSV-20      │                    │
│  │  └── Repos       │  │  └── Inscriptions│                    │
│  │  └── PRs         │  │  └── Multisig    │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  TRANCHE SYSTEM  │  │  PAYMENT RAILS   │                    │
│  │  └── Funding     │  │  └── Stripe      │                    │
│  │  └── Escrow      │  │  └── PayPal      │                    │
│  │  └── Distribution│  │  └── BSV         │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  AGENT SYSTEM    │  │  CONTRACT GEN    │                    │
│  │  └── Schedulers  │  │  └── Templates   │                    │
│  │  └── Tasks       │  │  └── Signing     │                    │
│  │  └── Memory      │  │  └── Inscription │                    │
│  └──────────────────┘  └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

### Key Files

| Component | Location |
|-----------|----------|
| Chat Interface | `app/kintsugi/page.tsx` |
| AI Provider | `lib/ai-providers/` |
| GitHub Sync | `scripts/sync-github-issues.ts` |
| Tranche System | `lib/funding-tranches.ts` |
| Agent System | `lib/agent-executor.ts` |
| Contract Gen | `lib/contracts/` |
| Token Minting | `lib/blockchain/` |

---

## Test Cases: Our Own Projects

Kintsugi is being built by repairing our own projects:

### Test Case 1: NPG (Ninja Punk Girls)

| Field | Value |
|-------|-------|
| **Status** | ~40% complete |
| **Token** | $NPG |
| **Problem** | NFT gaming platform stalled |
| **Kintsugi Plan** | 10 tranches to completion |

### Test Case 2: bCorp Products

| Field | Value |
|-------|-------|
| **Status** | Various stages |
| **Token** | TBD |
| **Problem** | Open source, needs maintenance |
| **Kintsugi Plan** | AI-assisted maintenance |

### Test Case 3: b0ase.com Platform

| Field | Value |
|-------|-------|
| **Status** | ~70% complete |
| **Token** | $BOASE |
| **Problem** | Platform is the product |
| **Kintsugi Plan** | Self-repairing system |

**The pitch:** If Kintsugi can repair these, it can repair anything.

---

## Revenue Model

### Platform Revenue Streams

| Stream | Description | Margin |
|--------|-------------|--------|
| **Platform Fee** | 5% of tranche funding | 100% |
| **Marketplace Cut** | 10% of developer payments | 100% |
| **Token Allocation** | 1-5% of project tokens | Variable |
| **Automation Packages** | Monthly subscriptions | 80% |
| **Enterprise Services** | Custom implementations | 60% |

### Pricing Tiers

| Tier | Price | Included |
|------|-------|----------|
| **Starter** | Free | 1 project, basic AI |
| **Professional** | £597/mo | 5 projects, priority AI, GitHub sync |
| **Enterprise** | £1,497/mo | Unlimited, dedicated support, custom agents |

---

## Competitive Landscape

| Competitor | What They Do | Kintsugi Difference |
|------------|--------------|---------------------|
| **Upwork/Fiverr** | Developer marketplace | We add AI + tokenization |
| **GitHub Sponsors** | Fund open source | We fund specific outcomes |
| **Gitcoin** | Crypto bounties | We provide full project repair |
| **AI Coding Tools** | Code generation | We provide full lifecycle |

**Kintsugi = AI + Marketplace + Tokenization + Project Management**

---

## Traction & Metrics

### Current State (January 2026)

| Metric | Value |
|--------|-------|
| Projects in Pipeline | 69 |
| Total Tranches Created | 690 |
| GitHub Issues Synced | 304 |
| Developer Services Listed | 117 |
| Agent System Completion | 92% |
| Platform Users | ~50 |

### Target Metrics (Month 18)

| Metric | Target |
|--------|--------|
| Monthly Recurring Revenue | £50,000 |
| Projects Completed | 20 |
| Active Investors | 500 |
| Active Developers | 100 |
| Total Funding Processed | £500,000 |

---

## Roadmap

### Phase 1: Foundation (Complete)

- [x] Platform infrastructure
- [x] Multi-provider auth
- [x] Agent system (92%)
- [x] Developer marketplace
- [x] Tranche system
- [x] GitHub sync

### Phase 2: Investment (In Progress)

- [x] Investor onboarding
- [x] KYC/AML (Veriff)
- [x] Self-certification
- [ ] Payment processing (Stripe Connect)
- [ ] Token minting automation

### Phase 3: Repair Engine (Q1 2026)

- [ ] AI codebase analysis
- [ ] Automated tranche creation
- [ ] Developer matching
- [ ] AI-assisted development
- [ ] Progress tracking

### Phase 4: Scale (Q2-Q3 2026)

- [ ] External project submissions
- [ ] Enterprise customers
- [ ] Token exchange listings
- [ ] International expansion

---

## The Ask

**We're raising £50K-100K to:**

1. Complete Kintsugi repair engine (£20K)
2. First 10 external projects (£30K)
3. Marketing & developer acquisition (£25K)
4. Operational runway (£25K)

**Valuation:** £600K-800K pre-money
**Structure:** SAFE or convertible note
**SEIS/EIS:** Eligible for UK tax relief

---

## Why Now?

1. **AI is ready** - Claude, GPT-4, Gemini can genuinely write code
2. **Tokenization is proven** - BSV-20 provides cheap, scalable tokens
3. **Developer shortage** - 4M unfilled developer jobs globally
4. **Capital seeking yield** - Investors want alternative assets
5. **Project graveyard growing** - More abandoned code than ever

**The window is open. Kintsugi is the tool to climb through it.**

---

## Contact

| | |
|---|---|
| **Founder** | Richard Boase |
| **Experience** | 8+ years, 50+ apps shipped, 1.2M+ lines of code |
| **Expertise** | Full-stack (React/Next.js/Node), Blockchain (BSV/ETH), AI/ML |
| **Email** | richard@b0ase.com |
| **Platform** | https://b0ase.com |
| **LinkedIn** | https://linkedin.com/in/richardboase |
| **GitHub** | https://github.com/b0ase |

---

## Document References

| Document | Purpose |
|----------|---------|
| `CORPORATE_STRUCTURE.md` | Legal entities |
| `TOKEN_ARCHITECTURE.md` | Token system design |
| `FUNDING_STRATEGY.md` | Investment terms |
| `OPERATIONAL_COSTS.md` | Burn rate & runway |
| `INVESTMENT_PIPELINE.md` | Tranche mechanics |

---

**"Broken software, repaired with gold."**
