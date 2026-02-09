"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function ContractsArchitecture() {
  const [expandedSection, setExpandedSection] = useState<string | null>("overview");

  const sections = [
    {
      id: "overview",
      title: "System Overview",
      content: `
# Contract Marketplace - System Overview

**Status:** Phase 1 Implementation (MVP)
**Priority:** HIGH - Core business function
**Timeline:** 2-3 weeks for MVP, 6-8 weeks for full system

## What We're Building

A decentralized contract marketplace where:
1. **b0ase publishes OFFER_CONTRACTs** (all services as on-chain markdown)
2. **Clients can browse contracts** (AI-indexed, searchable)
3. **Work happens with BSV payment** (direct, no middleman)
4. **Completion is proven on-chain** (verifiable delivery)

## Why This Matters

- **AI Discovery**: Search engines can find our services automatically
- **On-Chain Reputation**: All work history verifiable on blockchain
- **No Platform Fees**: Direct BSV payment, no Upwork/Fiverr fees
- **BSV-Native Business**: Positions us as BSV-first service provider
- **Transparent Pricing**: All contracts public, pricing clear

## Current Status

- ✅ All services documented (120+ services from /pricing)
- ✅ Architecture designed (see /docs)
- ⏳ **IN PROGRESS**: Creating markdown contracts
- ⏳ **IN PROGRESS**: Building /contracts page
- ⏳ **PENDING**: Inscription logic
- ⏳ **PENDING**: AI indexing
      `
    },
    {
      id: "design-questions",
      title: "Design Questions & Decisions",
      content: `
# Design Questions

## Q1: Inscription Strategy

**Question:** Should we inscribe ALL contracts immediately, or start with featured services?

**Options:**
- A) **Inscribe everything now** (~120+ services)
  - Pros: Complete marketplace immediately
  - Cons: High upfront cost (~6-12 BSV for all inscriptions)
  - Time: 1-2 days to generate all markdown + inscribe

- B) **Inscribe featured services first** (~20 core services)
  - Pros: Lower cost (~1-2 BSV), faster launch
  - Cons: Incomplete marketplace
  - Time: 4-6 hours

- C) **Inscribe on demand** (when client interested)
  - Pros: Minimal upfront cost
  - Cons: Slow, reactive not proactive
  - Time: As needed

**RECOMMENDATION:** Option B - Inscribe 20 core BSV-native services first
**DECISION:** [AWAITING USER INPUT]

---

## Q2: BSV-Only vs Multi-Chain

**Question:** Build for BSV only, or support other chains?

**Options:**
- A) **BSV Only** (recommended by user)
  - Pros: Simple, focused, low overhead
  - Cons: Limits potential clients
  - Implementation: Single inscription method

- B) **BSV + EVM** (Ethereum, Polygon, etc.)
  - Pros: Broader market
  - Cons: Complex, expensive, dilutes BSV focus
  - Implementation: Multiple inscription methods

**RECOMMENDATION:** Option A - BSV ONLY
**DECISION:** ✅ BSV ONLY (confirmed by user)

---

## Q3: Pricing Strategy

**Question:** How should contracts express pricing?

**Options:**
- A) **Fixed BSV prices** (convert GBP to BSV)
  - Pros: Simple, blockchain-native
  - Cons: BSV volatility affects pricing
  - Example: "£500 → ~2.5 BSV at current rate"

- B) **Dual pricing** (GBP + BSV equivalent)
  - Pros: Clear value, flexible payment
  - Cons: Requires rate updates
  - Example: "£500 (≈2.5 BSV)"

- C) **BSV only** (no GBP)
  - Pros: Fully blockchain-native
  - Cons: Harder for non-crypto clients to understand
  - Example: "2.5 BSV"

**RECOMMENDATION:** Option B - Dual pricing for MVP, migrate to Option A long-term
**DECISION:** [AWAITING USER INPUT]

---

## Q4: Contract Update Strategy

**Question:** How do we handle price changes or service updates?

**Options:**
- A) **Immutable contracts** (never change)
  - Pros: True blockchain philosophy
  - Cons: Need new inscription for every update
  - Implementation: Version history (v1, v2, v3...)

- B) **Pointer system** (contract points to latest version)
  - Pros: Single source of truth
  - Cons: Requires off-chain database
  - Implementation: Database stores current_inscription_id

- C) **Expiring contracts** (valid until date)
  - Pros: Natural refresh cycle
  - Cons: Need to re-inscribe periodically
  - Implementation: Each contract has valid_until field

**RECOMMENDATION:** Option C - Contracts valid for 6-12 months, then re-inscribe with updates
**DECISION:** [AWAITING USER INPUT]

---

## Q5: Portfolio Proof Strategy

**Question:** How do we prove past work in contracts?

**Options:**
- A) **Link to inscriptions** (case studies on-chain)
  - Pros: Fully verifiable
  - Cons: Need to inscribe portfolio pieces
  - Implementation: Inscribe case studies, link in contracts

- B) **Link to website** (portfolio on b0ase.com)
  - Pros: Easy, flexible, free
  - Cons: Centralized, not verifiable
  - Implementation: Just link to /work URL

- C) **Hybrid** (inscribe summaries, link to full work)
  - Pros: Balance of verification + cost
  - Cons: More complex
  - Implementation: Inscribe project summary, link to GitHub/website for details

**RECOMMENDATION:** Option C - Hybrid approach
**DECISION:** [AWAITING USER INPUT]

---

## Q6: Client Discovery Strategy

**Question:** How will clients find our contracts?

**Options:**
- A) **Wait for AI crawlers** (organic discovery)
  - Pros: Automated, scalable
  - Cons: Slow, uncertain
  - Timeline: Months to years

- B) **Manual outreach** (email contracts to clients)
  - Pros: Fast, targeted
  - Cons: Labor intensive
  - Timeline: Immediate

- C) **Build directory** (b0ase-hosted contract explorer)
  - Pros: Controlled discovery, immediate
  - Cons: Centralized
  - Timeline: 1-2 weeks

- D) **All of the above**
  - Pros: Maximum reach
  - Cons: More work
  - Timeline: Ongoing

**RECOMMENDATION:** Option D - Start with B+C while A develops
**DECISION:** [AWAITING USER INPUT]
      `
    },
    {
      id: "implementation-plan",
      title: "Implementation Plan",
      content: `
# Implementation Roadmap

## Phase 1: MVP (Week 1-2) 🚀

**Goal:** Get 20 core contracts live and browsable

### Week 1: Contract Generation
- ✅ Day 1-2: Generate markdown for 20 core services
  - Focus on BSV-native services
  - Web development, token deployment, AI agents
  - Include portfolio links

- ⏳ Day 3-4: Create /contracts page UI
  - List all contracts
  - Filter by category
  - Search functionality
  - View markdown contracts

- ⏳ Day 5: Testing & refinement
  - Review all contracts
  - Fix formatting
  - Add missing details

### Week 2: Inscription & Launch
- Day 1-2: Build inscription logic
  - Connect to BSV network
  - Batch inscription tool
  - Track inscription IDs in database

- Day 3: Inscribe 20 core contracts
  - Estimate: 0.05 BSV per contract = ~1 BSV total
  - Store inscription IDs
  - Update contracts page with inscription links

- Day 4-5: Launch & promotion
  - Announce on Twitter/social
  - Email to existing clients
  - Post in BSV communities
  - Add to b0ase.com homepage

**Deliverables:**
- 20 contracts inscribed on BSV
- /contracts page live
- Markdown files in /contracts/*.md
- Database tracking inscriptions

---

## Phase 2: Full Marketplace (Week 3-6)

**Goal:** Complete contract system with client submissions

### Week 3: Client Tools
- PROBLEM_CONTRACT submission form
- Template-based contract creation
- AI-assisted contract generation

### Week 4: Matching System
- AI crawler for BSV blockchain
  - Scan for CONTRACT: prefix inscriptions
  - Parse markdown contracts
  - Index in database

- Matching algorithm
  - Skills matching
  - Budget matching
  - Timeline matching

- Notification system
  - Email when matches found
  - Dashboard notifications

### Week 5: Workflow Tools
- PROPOSAL_CONTRACT submission
- ACCEPTANCE_CONTRACT signing
- COMPLETION_CONTRACT proof submission
- REVIEW_CONTRACT ratings

### Week 6: Advanced Features
- Token payment integration
  - Pay in tokens instead of BSV
  - Vesting schedules

- Community features
  - Public contract browsing
  - Provider ratings
  - Dispute resolution

**Deliverables:**
- Full contract lifecycle
- AI matching system
- Client self-service tools
- Token payment option

---

## Phase 3: Scale & Integrate (Week 7+)

**Goal:** Integrate with Minting Contracts, scale to 100+ contracts

### Integration Tasks
- Link to Minting Contracts system
  - Work funded by milestone-based tokens
  - Provider becomes stakeholder

- Dashboard improvements
  - Contract analytics
  - Revenue tracking
  - Client management

- AI enhancements
  - Better matching
  - Contract suggestions
  - Pricing optimization

### Scaling
- Inscribe all 120+ services
- Add more BSV-specific services
  - 1Sat Ordinals development
  - BSV-20 token services
  - HandCash/Yours integrations
  - BSV infrastructure

- International expansion
  - Multi-language contracts
  - Regional pricing
  - Local payment methods
      `
    },
    {
      id: "bsv-focus",
      title: "BSV-Native Services",
      content: `
# BSV-Native Service Offerings

## Core BSV Services to Inscribe First

These are the services we should prioritize for inscription because they're
either BSV-specific or highly relevant to the BSV ecosystem.

### 1. BSV Token Services ⭐ **PRIORITY**

- **BSV-20 Token Deployment** (£800)
  - 1Sat Ordinals token creation
  - Token icon inscription
  - Metadata setup
  - Initial distribution

- **BSV-21 Token Deployment** (£1,000)
  - Advanced token features
  - Bonding curves
  - Royalties
  - Multi-sig

- **Tokenomics Design** (£300)
  - Supply planning
  - Distribution strategy
  - Pricing models
  - Utility design

- **Token Website** (£400)
  - Token landing page
  - HandCash/Yours integration
  - Buy/sell interface
  - Analytics dashboard

### 2. HandCash/Yours Integration ⭐ **HIGH PRIORITY**

- **Wallet Integration** (£300)
  - HandCash SDK setup
  - Yours wallet connect
  - Payment flows
  - Receipt generation

- **Money Button** (£200)
  - Instant payment UI
  - Amount calculation
  - Success/failure handling

- **Payment Gateway** (£500)
  - Accept BSV payments
  - Conversion tracking
  - Invoice generation
  - Webhook setup

### 3. BSV Infrastructure

- **1Sat Ordinals Development** (£1,500+)
  - Custom ordinal inscriptions
  - Collection management
  - Metadata standards
  - Marketplace integration

- **BSV Node Setup** (£400)
  - Full node deployment
  - Monitoring setup
  - Backup systems
  - API endpoint

- **BSV Explorer** (£2,000+)
  - Custom block explorer
  - Transaction tracking
  - Address monitoring
  - API development

### 4. BSV Data Services

- **Blockchain Inscription** (£50-500)
  - Document inscription
  - Image inscription
  - Contract inscription
  - Proof of existence

- **Data Anchoring** (£200)
  - Hash anchoring
  - Merkle tree creation
  - Verification system

- **BSV Analytics** (£800)
  - Transaction analysis
  - Wallet tracking
  - Volume reporting
  - Custom metrics

### 5. BSV-Powered AI Services

- **AI Agent with BSV Payment** (£1,200)
  - AI agent that accepts BSV
  - Per-use microtransactions
  - Usage tracking
  - Revenue reporting

- **Content Generation with Proof** (£500)
  - AI-generated content
  - Content hash inscribed
  - Proof of creation
  - Copyright protection

### 6. BSV DApp Development

- **BSV Web3 App** (£3,000+)
  - Full-stack BSV app
  - Wallet connection
  - Smart features
  - On-chain data

- **NFT Platform (BSV)** (£2,500+)
  - 1Sat Ordinals NFTs
  - Marketplace
  - Royalty system
  - Collection tools

- **DAO Tools (BSV)** (£2,000+)
  - Governance system
  - Voting mechanisms
  - Treasury management
  - Proposal system

### 7. BSV Consulting

- **BSV Strategy** (£150/hour)
  - Tokenomics planning
  - Technical architecture
  - Launch strategy
  - Marketing roadmap

- **BSV Technical Audit** (£500+)
  - Code review
  - Security check
  - Optimization
  - Best practices

---

## New BSV Services to Add

Services we should create specifically for the BSV ecosystem:

1. **Ordinal Collection Launch** (£2,500)
   - 10,000 generative ordinals
   - Rarity system
   - Mint website
   - Community tools

2. **BSV Payment Processor** (£1,500)
   - Accept BSV in e-commerce
   - Real-time conversion
   - Accounting integration
   - Tax reporting

3. **Blockchain Notary** (£100/document)
   - Legal document inscription
   - Timestamp proof
   - Verification system
   - Certificate generation

4. **BSV-Powered Marketplace** (£3,500+)
   - Peer-to-peer marketplace
   - BSV escrow
   - Reputation system
   - Dispute resolution

5. **Micropayment System** (£1,000)
   - Per-use payments
   - Content monetization
   - Subscription alternative
   - Low-fee processing

---

## Marketing Angle

**Position as "BSV-First Service Provider"**

All contracts should emphasize:
- ✅ Native BSV implementation
- ✅ Inscriptions for proof/transparency
- ✅ Microtransaction-friendly
- ✅ HandCash/Yours integration included
- ✅ On-chain delivery proof

**Example Contract Hook:**
"We build on BSV because it's the only blockchain that can handle real-world data
and microtransactions at scale. Every project includes on-chain proof of delivery."
      `
    },
    {
      id: "contract-format",
      title: "Contract Markdown Format",
      content: `
# Standard Contract Format

All contracts should follow this structure for consistency and AI parseability.

\`\`\`markdown
---
type: OFFER_CONTRACT
provider: b0ase.com
provider_verification: verified_github_@b0ase
service_category: blockchain
subcategory: token_deployment
skills: ["BSV", "1Sat Ordinals", "JavaScript", "TypeScript"]
budget_min: 800
budget_max: 1200
budget_currency: GBP
timeline_min_days: 3
timeline_max_days: 7
payment_methods: ["BSV", "GBP", "USD"]
available: true
featured: true
inscription_id: [TO_BE_INSCRIBED]
contract_hash: [AUTO_GENERATED]
created: 2026-01-18
valid_until: 2026-12-31
---

# BSV-20 Token Deployment

**Deploy your token on Bitcoin SV using 1Sat Ordinals**

---

## What's Included

- Token contract deployment on BSV blockchain
- Custom token icon (PNG, inscribed on-chain)
- Initial token distribution setup
- Token metadata configuration
- HandCash wallet integration
- Yours wallet integration
- Testing on mainnet
- 30 days of support

---

## Deliverables

1. **Deployed Token**
   - Token ID (inscription txid)
   - Symbol (3-6 characters)
   - Total supply configured
   - Icon inscribed

2. **Integration Code**
   - JavaScript SDK examples
   - React component library
   - API endpoints
   - Documentation

3. **Admin Panel**
   - Token distribution interface
   - Holder analytics
   - Transaction monitoring
   - Export tools

4. **Documentation**
   - Setup guide
   - API reference
   - Integration examples
   - Troubleshooting

---

## Timeline

**3-7 days** from contract signature to mainnet deployment

- Day 1: Token design finalized, icon created
- Day 2-3: Smart contract deployment and testing
- Day 4-5: Integration code and admin panel
- Day 6-7: Documentation, testing, handoff

Rush delivery available (+50% fee): 24-48 hours

---

## Pricing

**£800 fixed price**

Includes:
- Token deployment
- Icon design and inscription
- Integration code
- Admin panel
- Documentation
- 30 days support

**Payment terms:**
- 50% upfront (£400) - locks in delivery slot
- 50% on delivery (£400) - after successful deployment

**Payment methods:**
- BSV (preferred - 10% discount → £720 total)
- Bank transfer (GBP)
- PayPal (USD equivalent)
- Cryptocurrency (BTC, ETH converted to BSV)

**BSV payment address:** [TO_BE_ADDED]

---

## Requirements from Client

- Token name and symbol (e.g., "ProjectToken" / "PROJ")
- Total supply (recommended: 1M - 100M)
- Icon concept (or we can design one)
- Initial distribution addresses (optional)
- Preferred wallet (HandCash, Yours, custom)

---

## Tech Stack

- BSV blockchain (mainnet)
- 1Sat Ordinals protocol (BSV-20)
- JavaScript/TypeScript
- React (for admin panel)
- Next.js (optional, for token website)

---

## Why BSV?

We build exclusively on BSV because:
- ✅ **Lowest fees** - Deploy tokens for pennies, not hundreds of dollars
- ✅ **Scalability** - Handles millions of transactions
- ✅ **Data capacity** - Can inscribe full contract text on-chain
- ✅ **Micropayments** - Enable per-use payments, not just large transfers
- ✅ **Real Bitcoin** - Original Bitcoin protocol, not a fork

Every token we deploy includes on-chain proof of creation and can be verified
on the BSV blockchain forever.

---

## Portfolio

### Previous BSV Token Deployments

1. **b0ase Platform Token** (B0ASE)
   - 1M supply
   - Bonding curve pricing
   - [Inscription: txid_example1]

2. **Client Project** (REPO)
   - GitHub repo tokenization
   - Milestone-based releases
   - [Inscription: txid_example2]

3. **NFT Collection** (ORDNFT)
   - 10,000 generative ordinals
   - Rarity system
   - [Inscription: txid_example3]

View full portfolio: https://b0ase.com/work

---

## How to Accept This Contract

### Option 1: Direct Acceptance
1. Email richard@b0ase.com with:
   - Token name, symbol, supply
   - Icon concept (if you have one)
   - Preferred timeline
2. We'll send invoice for 50% deposit
3. Work starts within 24 hours of payment

### Option 2: On-Chain Acceptance
1. Create ACCEPTANCE_CONTRACT inscription
2. Reference this contract ID: [inscription_id]
3. Send 50% payment to BSV address
4. Work starts automatically

---

## Contact

- **Website:** https://b0ase.com
- **Email:** richard@b0ase.com
- **GitHub:** @b0ase (verified)
- **Twitter:** @b0ase
- **HandCash:** $b0ase

---

## Terms & Conditions

- All code delivered is open source (MIT License)
- Refund policy: 100% refund if we fail to deploy within 14 days
- Guarantee: Token will be deployed successfully or full refund
- Support: 30 days of bug fixes and questions included
- Liability: Limited to contract value (£800)
- Governing law: England and Wales

---

**Contract Hash:** [AUTO_GENERATED_SHA256]
**Inscription Date:** [AUTO_FILLED_ON_INSCRIPTION]
**Valid Until:** 2026-12-31
**Version:** 1.0
\`\`\`

---

## Field Explanations

### Frontmatter (YAML)
- **type**: Always OFFER_CONTRACT for service offerings
- **provider**: Company name
- **provider_verification**: Verified handle (GitHub, etc.)
- **service_category**: Main category (blockchain, web, ai, etc.)
- **skills**: Array of required skills for AI matching
- **budget_min/max**: Price range in specified currency
- **timeline**: Days from start to delivery
- **payment_methods**: Accepted payment types
- **available**: Boolean, can clients accept this now?
- **featured**: Should this appear in featured listings?
- **inscription_id**: Filled after inscription
- **valid_until**: When contract expires

### Sections
1. **Title**: Service name, clear and searchable
2. **What's Included**: Bullet list of deliverables
3. **Timeline**: Clear milestones with dates
4. **Pricing**: Transparent pricing with payment terms
5. **Requirements**: What client needs to provide
6. **Tech Stack**: Technologies used
7. **Why BSV**: Our value proposition
8. **Portfolio**: Proof of past work
9. **How to Accept**: Clear call to action
10. **Terms**: Legal protection
      `
    },
    {
      id: "dashboard-integration",
      title: "Dashboard Integration Plan",
      content: `
# Dashboard Integration

## Philosophy

**The /dashboard is the nerve center of b0ase.com platform development.**

All complex features should have dashboard counterparts for:
- Architecture planning
- Configuration
- Monitoring
- Analytics
- Admin tools

---

## Contract System Dashboard

### /dashboard/contracts

**Overview Screen**
- Total contracts inscribed
- Active vs expired contracts
- Inscription costs (total spent on inscriptions)
- Response rate (how many PROBLEM_CONTRACTs we've responded to)
- Conversion rate (PROPOSAL → ACCEPTANCE)

**Metrics**
- Views per contract
- BSV earned through contracts
- Average project value
- Client acquisition cost
- Most popular services

---

### /dashboard/contracts/manage

**Contract Management**
- List all contracts (inscribed + draft)
- Edit draft contracts
- Inscribe new contracts
- Archive expired contracts
- Batch operations

**Actions**
- Create new contract
- Update existing (creates new version)
- Set expiry dates
- Mark as featured
- Disable/enable

---

### /dashboard/contracts/inscribe

**Inscription Tool**
- Select contracts to inscribe
- Preview markdown
- Estimate cost (BSV)
- Batch inscription
- Track inscription status
- Store inscription IDs

**Inscription Queue**
- Pending inscriptions
- In-progress (waiting for confirmation)
- Completed (with TX links)
- Failed (with error messages)

---

### /dashboard/contracts/analytics

**Performance Metrics**
- Which contracts get most views?
- Which convert to actual projects?
- BSV revenue per contract
- Client geography
- Referral sources

**Charts**
- Views over time
- Conversion funnel
- Revenue by service category
- Client acquisition timeline

---

### /dashboard/contracts/clients

**Client Management**
- All clients who've accepted contracts
- Project status tracking
- Communication history
- Payment status
- Reviews/ratings

**Client Profiles**
- Contact info
- Projects completed
- Total value
- Communication preferences
- Notes

---

### /dashboard/contracts/architecture

**This Page** - Architecture planning and design decisions

**Sections:**
- System overview
- Design questions
- Implementation plan
- BSV-native services
- Contract format standards
- Dashboard integration plan

---

## Future Dashboard Pages

As platform grows, add:

### /dashboard/minting-contracts
- Manage milestone-based token contracts
- Track token sales
- Monitor milestone completion
- Handle community votes

### /dashboard/ai-agents
- Manage AI crawlers
- Configure matching algorithm
- Review suggested matches
- Adjust matching weights

### /dashboard/inscriptions
- All inscriptions made by b0ase
- Inscription history
- Cost tracking
- Analytics

### /dashboard/clients/lifecycle
- Client journey mapping
- Onboarding status
- Project pipeline
- Retention metrics

### /dashboard/revenue
- BSV income tracking
- Conversion from GBP
- Project profitability
- Revenue forecasting

---

## Why Dashboard-Centric Approach?

1. **Visibility**: See system health at a glance
2. **Control**: Manage complex features without code
3. **Documentation**: Architecture docs live in dashboard
4. **Iteration**: Easy to experiment and refine
5. **Training**: New team members can understand system through dashboard

**Principle**: If it's complex enough to need planning, it needs a dashboard page.
      `
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 border-b border-zinc-900 pb-8">
          <h1 className="text-5xl font-bold uppercase tracking-tighter mb-4">
            CONTRACT MARKETPLACE
          </h1>
          <p className="text-sm text-zinc-500 uppercase tracking-widest font-mono">
            Architecture · Planning · Design Decisions
          </p>
          <div className="mt-6 flex gap-4 text-xs font-mono">
            <span className="px-3 py-1 bg-green-900/20 border border-green-900 text-green-500 uppercase">
              Phase 1: MVP
            </span>
            <span className="px-3 py-1 bg-yellow-900/20 border border-yellow-900 text-yellow-500 uppercase">
              2-3 Weeks Timeline
            </span>
            <span className="px-3 py-1 bg-blue-900/20 border border-blue-900 text-blue-500 uppercase">
              BSV-Only
            </span>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="mb-8 p-6 border border-zinc-900 bg-zinc-950/50">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4 font-mono">
            Table of Contents
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setExpandedSection(section.id)}
                className={`text-left px-4 py-2 text-sm font-mono border transition-all ${
                  expandedSection === section.id
                    ? 'border-white bg-white text-black'
                    : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        {sections.map((section) => (
          <motion.div
            key={section.id}
            initial={false}
            animate={{
              height: expandedSection === section.id ? 'auto' : 0,
              opacity: expandedSection === section.id ? 1 : 0
            }}
            className="overflow-hidden"
          >
            {expandedSection === section.id && (
              <div className="mb-8 p-8 border border-zinc-900 bg-zinc-950/30">
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-zinc-300">
                    {section.content}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {/* Action Items */}
        <div className="mt-12 p-8 border border-yellow-900 bg-yellow-950/10">
          <h2 className="text-lg font-bold uppercase mb-6 text-yellow-500 font-mono">
            Immediate Actions Required
          </h2>
          <div className="space-y-4 text-sm font-mono">
            <div className="flex items-start gap-4">
              <span className="text-yellow-500 mt-1">[ ]</span>
              <div>
                <strong className="text-white">DECISION 1:</strong>
                <span className="text-zinc-400"> Inscription strategy - All contracts or featured 20?</span>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-green-500 mt-1">[✓]</span>
              <div>
                <strong className="text-white">DECISION 2:</strong>
                <span className="text-zinc-400"> BSV-only confirmed</span>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-yellow-500 mt-1">[ ]</span>
              <div>
                <strong className="text-white">DECISION 3:</strong>
                <span className="text-zinc-400"> Pricing strategy - Fixed BSV vs Dual pricing?</span>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-yellow-500 mt-1">[ ]</span>
              <div>
                <strong className="text-white">DECISION 4:</strong>
                <span className="text-zinc-400"> Contract update strategy - Expiring contracts?</span>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-yellow-500 mt-1">[ ]</span>
              <div>
                <strong className="text-white">DECISION 5:</strong>
                <span className="text-zinc-400"> Portfolio proof - Inscribe case studies?</span>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-yellow-500 mt-1">[ ]</span>
              <div>
                <strong className="text-white">DECISION 6:</strong>
                <span className="text-zinc-400"> Client discovery - Build directory first?</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-zinc-900 text-center text-xs text-zinc-600 font-mono">
          <p>This page lives in /dashboard for high-level platform planning</p>
          <p className="mt-2">All complex features should have dashboard counterparts</p>
        </div>
      </div>
    </div>
  );
}
