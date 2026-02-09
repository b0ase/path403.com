# b0ase.com Systems Overview

**Last Updated:** 2026-01-18

---

## Three Interconnected Systems

### 1. Verification System ✅ **LIVE**

**What:** Verify repository ownership via GitHub OAuth

**Status:** Deployed (just fixed OAuth token storage)

**How it works:**
- User connects GitHub account → stores OAuth token
- User claims repo → API checks GitHub permissions
- If user has push/admin access → ✅ **VERIFIED_OWNER**
- Verification inscribed in database + future on-chain proof

**Current Issue:**
- bitcoin-file-utility showing "unverified" because OAuth token wasn't stored
- **Fix deployed** - user needs to reconnect GitHub to get token

**Next:** User disconnects/reconnects GitHub → Re-claims repo → Should show verified

---

### 2. Minting Contracts System 📄 **DESIGNED**

**What:** Inscribe pricing curves, milestones, and legal contracts on-chain at token mint

**Status:** Fully designed, not built yet

**How it works:**
1. Choose project type (AI Content, Software Dev, Marketing, etc.)
2. Customize milestones with deliverables and timelines
3. Configure pricing contract (bonding curve inscribed as legal agreement)
4. Add legal contracts (ToS, service agreements, NDAs, regulatory forms)
5. Mint → Everything inscribed on-chain in one multi-inscription bundle

**Result:**
- Token buyers see exact pricing formula (immutable)
- Capital raised per milestone (not all upfront)
- Community votes on milestone completion
- Tokens unlock as deliverables complete
- Legal protection (all contracts on-chain)

**Files:**
- `/docs/MINTING_CONTRACTS_ARCHITECTURE.md` - 12,000+ word spec
- `/docs/MINTING_CONTRACTS_SUMMARY.md` - Executive summary
- `/docs/sql/minting_contracts_schema.sql` - Database schema (9 new tables)

**Next:** Await approval to build (7-week implementation or 2-week MVP)

---

### 3. Contract Marketplace Protocol 🤝 **DESIGNED**

**What:** Decentralized job board where contracts are inscribed on-chain and AI agents match work

**Status:** Fully designed, not built yet

**How it works:**
1. **b0ase publishes OFFER contracts** - "I will build X for Y BSV" (markdown inscription)
2. **Clients publish PROBLEM contracts** - "I need X solved" (markdown inscription)
3. **AI crawlers index blockchain** - Parse contracts, extract skills/budget/timeline
4. **AI matches problems to offers** - Notify both parties of high-confidence matches
5. **Parties sign on-chain** - ACCEPTANCE_CONTRACT references both inscriptions
6. **Work delivered with proof** - COMPLETION_CONTRACT inscribed with deliverables
7. **Payment flows directly** - BSV transfer (or token vesting via Minting Contracts)

**Benefits:**
- **No middleman** (no Upwork fees, no platform lock-in)
- **AI-powered discovery** (search engines find your offers automatically)
- **Transparent history** (all contracts and reviews on-chain)
- **Verifiable delivery** (completion proof inscribed)
- **Token integration** (pay in tokens instead of BSV, align incentives)

**Files:**
- `/docs/CONTRACT_MARKETPLACE_ARCHITECTURE.md` - Complete spec with examples

**Use Cases:**
- b0ase finds work automatically (AIs match our offers to client problems)
- Express client problems FOR them (draft contract, they confirm)
- Build problem templates (guided wizard for non-technical clients)
- Pay providers in tokens (vested over milestones, becomes stakeholder)

**Next:** Await approval to build

---

## How They Connect

### Scenario 1: Token-Funded Development

```
1. AI Forge has a problem (UX redesign needed)

2. AI Forge publishes PROBLEM_CONTRACT on-chain
   - "Need UX overhaul, willing to pay 20 BSV or equivalent tokens"

3. AI crawler finds b0ase OFFER_CONTRACT
   - Skills match (UX, Next.js, React)
   - Budget fits (15-25 BSV range)
   - Portfolio relevant (past UX work)
   - Notifies both parties

4. b0ase submits PROPOSAL_CONTRACT
   - Detailed approach to solving problem
   - Portfolio proof (on-chain inscriptions)
   - Timeline and pricing

5. AI Forge creates MINTING_CONTRACT for their project token
   - Total supply: 1,000,000 AIFORGE
   - Milestone 1: UX Research (100k tokens, 7 days)
   - Milestone 2: Design (200k tokens, 14 days)
   - Milestone 3: Implementation (300k tokens, 28 days)
   - Pricing: Bonding curve (0.0001 → 0.001 BSV per token)

6. AI Forge accepts b0ase proposal with token payment
   - Instead of 20 BSV, b0ase gets 600k AIFORGE tokens
   - Tokens vest as milestones complete
   - b0ase becomes stakeholder in AI Forge success

7. b0ase completes work
   - Inscribes COMPLETION_CONTRACT with proof
   - Milestones verified → Tokens unlock
   - AI Forge inscribes REVIEW_CONTRACT (5-star rating)

8. b0ase now holds AIFORGE tokens
   - Can sell on bonding curve
   - Or hold as product improves (token value increases)
   - Incentive alignment (better UX = more users = token demand)
```

**Result:** b0ase gets paid, becomes stakeholder, AI Forge gets work done without upfront capital.

---

### Scenario 2: Service Marketplace

```
1. b0ase publishes 10 OFFER_CONTRACTs
   - AI Content Engine setup (25 BSV)
   - Software Development (0.5 BSV/day)
   - Marketing Automation (20 BSV)
   - Website Design (15 BSV)
   - SEO Optimization (10 BSV)
   - ... and more

2. AI crawlers index all offers
   - Extract skills, pricing, portfolio
   - Make searchable by AI engines

3. Client searches "AI content business setup"
   - AI finds b0ase OFFER_CONTRACT
   - Shows in search results with verification badge
   - Client sees: ✅ verified_github_@b0ase
   - Portfolio inscriptions linked

4. Client contacts b0ase
   - Either via PROBLEM_CONTRACT response
   - Or direct contact (email, Twitter, etc.)

5. Traditional contract flow OR on-chain flow
   - On-chain: Full contract inscriptions (transparent, verifiable)
   - Traditional: Email agreement, then inscribe completion proof

6. Work completed
   - Inscribe COMPLETION_CONTRACT
   - Client inscribes REVIEW_CONTRACT
   - b0ase reputation grows on-chain
```

**Result:** b0ase gets discovered by AI search engines, builds on-chain reputation.

---

### Scenario 3: Express Client Problems

```
1. b0ase observes AI Forge struggling with UX

2. b0ase drafts PROBLEM_CONTRACT on their behalf
   - "AI Forge needs UX redesign"
   - Based on product analysis and user feedback
   - Detailed problem statement
   - Suggested budget and timeline

3. b0ase inscribes draft contract
   - Marked as "Drafted by b0ase on behalf of AI Forge"
   - Not binding until AI Forge confirms

4. b0ase sends to AI Forge
   - "I noticed you're having UX issues. I drafted this
      problem statement. Does this match your needs?"

5. If AI Forge agrees:
   - They inscribe ACCEPTANCE_CONTRACT confirming the problem
   - b0ase already has PROPOSAL_CONTRACT ready
   - Work begins immediately

6. If AI Forge wants changes:
   - They fork the contract, modify, and inscribe their version
   - b0ase updates PROPOSAL_CONTRACT accordingly
```

**Result:** b0ase proactively identifies client problems, offers solutions, closes deals faster.

---

## Current State

### ✅ What's Working

- **Basic repo tokenization** (can mint BSV-21 tokens)
- **GitHub verification** (just fixed - needs user to reconnect)
- **Token deployment** (inscribes token on BSV blockchain)
- **Repo claiming** (ownership verification)

### 🚧 What's In Progress

- **Verification badge display** (deployed but needs token refresh)
- **OAuth token storage** (fixed, awaiting user reconnect)

### 📋 What's Designed But Not Built

- **Minting Contracts** (milestone-based releases, pricing contracts)
- **Contract Marketplace** (on-chain job board, AI matching)
- **Legal contract inscription** (ToS, agreements, forms)
- **Token sale UI** (bonding curves, money button)
- **Milestone tracking** (deliverable verification, community voting)
- **AI agent assistance** (contract creation helper)

---

## Decision Points

### Priority 1: Fix Verification (Most Urgent)

**Status:** Fix deployed, needs user action

**Action needed:**
1. User disconnects GitHub at /user/account?tab=connections
2. User reconnects GitHub (stores OAuth token properly)
3. User re-claims bitcoin-file-utility
4. Should now show ✅ VERIFIED_OWNER

**Time:** User can do this now (< 5 minutes)

---

### Priority 2: Choose Next Build

**Option A: Minting Contracts (7 weeks or 2-week MVP)**
- Build milestone-based token releases
- Inscribe pricing contracts on-chain
- Add legal contract templates
- Create multi-step minting wizard
- Implement bonding curve pricing
- Add milestone completion tracking

**Option B: Contract Marketplace (6-8 weeks)**
- Build contract inscription system
- Create markdown editor for contracts
- Implement AI indexing/matching
- Build contract browsing UI
- Add notification system
- Create payment tracking

**Option C: Quick Wins First (1-2 weeks)**
- Improve basic token minting UX
- Add simple pricing options (fixed price)
- Build basic token sale page (no bonding curves)
- Clean up verification UI
- Then revisit big systems

---

### Priority 3: Integration Strategy

**Sequential:**
1. Build Minting Contracts first
2. Then add Contract Marketplace
3. Connect them (token-paid work)

**Parallel:**
1. Build both simultaneously (if have multiple devs)
2. Integrate at the end

**Hybrid:**
1. Build MVPs of both
2. Test with real projects
3. Iterate based on usage
4. Full implementation after validation

---

## Recommendations

### Immediate (Today):

1. **User: Reconnect GitHub** to fix verification
   - Disconnect at /user/account?tab=connections
   - Reconnect (stores OAuth token)
   - Re-claim bitcoin-file-utility
   - Verify it shows ✅ VERIFIED_OWNER

2. **Developer: Monitor reconnect**
   - Check if OAuth token gets stored
   - Check if verification works on re-claim
   - Fix any issues that arise

### Short-term (This Week):

1. **Decide on next build:**
   - Minting Contracts?
   - Contract Marketplace?
   - Quick wins?

2. **If Minting Contracts:**
   - Run database migrations
   - Build first 2 steps of wizard (project type selection + milestone customization)
   - Test with bitcoin-file-utility

3. **If Contract Marketplace:**
   - Build contract markdown editor
   - Implement inscription logic
   - Test with 1 OFFER_CONTRACT from b0ase

4. **If Quick Wins:**
   - Improve token minting UX
   - Add basic pricing (fixed price)
   - Build simple token sale page

### Long-term (Next Month):

1. **Get 1-2 projects live** with whichever system we build
2. **Collect real user feedback**
3. **Iterate based on actual usage**
4. **Scale to more users**

---

## Files & Documentation

All design docs committed to repo:

```
docs/
├── MINTING_CONTRACTS_ARCHITECTURE.md    (12,000+ words)
├── MINTING_CONTRACTS_SUMMARY.md         (executive summary)
├── CONTRACT_MARKETPLACE_ARCHITECTURE.md (10,000+ words)
├── SYSTEMS_OVERVIEW.md                  (this file)
└── sql/
    └── minting_contracts_schema.sql     (database schema)
```

**Next:** Your decision on what to build first.
