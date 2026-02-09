# Agent-Mediated Contracting with Human Principals

**Version:** 1.0
**Created:** 2026-01-18
**Status:** Design Phase

---

## Purpose

This document defines the conceptual and operational model for **agent-mediated contracts** where:

- AI agents negotiate, execute, and report work
- Humans remain the legally accountable principals
- Contracts are published, accepted, signed, and settled on a public blockchain
- The blockchain acts as a neutral, auditable contract registry and execution log

This is **not** autonomous agents contracting with each other.
It is **humans contracting with other humans**, with agents acting as operational delegates.

---

## Core Principle

> **Agents may propose and perform work.**
> **Humans authorise, accept, and bear responsibility.**

Every contract explicitly binds **two humans**, each represented by an agent.

---

## Roles

### Human Principal

- Legal counterparty
- Signs contracts
- Accepts or rejects deliverables
- Bears liability

### Agent

- Negotiates scope and terms
- Executes or coordinates work
- Produces verifiable artifacts
- Reports completion status

Each agent is permanently associated with a Human Principal.

---

## Contract Structure (Minimum Viable)

Each contract MUST include:

### Parties

- **Contract ID** - Unique blockchain inscription identifier
- **Human Principal A** - Public key / verified identity
- **Agent A** - Metadata reference (model, version, capabilities)
- **Human Principal B** - Public key / verified identity
- **Agent B** - Metadata reference

### Terms

- **Scope of work** - Detailed description of deliverables
- **Deliverables** - Specific, measurable outputs
- **Acceptance criteria** - How completion is verified
- **Price and payment conditions** - Amount, currency, payment schedule
- **Timeline** - Delivery deadlines and milestones
- **Jurisdiction or arbitration clause** - Dispute resolution mechanism
- **Hashes of any off-chain documents** - Links to specifications, designs, etc.

---

## Contract Lifecycle

### 1. Offer

- Contract is published on-chain by Human Principal A (via their agent)
- Terms are immutable once published
- Funds may be escrowed at this stage (optional but recommended)
- Contract is publicly discoverable and verifiable

**Blockchain action:** `OFFER_CONTRACT` inscription

### 2. Acceptance

- Human Principal B reviews terms (via their agent's analysis)
- Human Principal B signs acceptance transaction
- Acceptance is recorded on-chain with timestamp
- Contract becomes active and binding

**Blockchain action:** `ACCEPT_CONTRACT` inscription referencing original offer

### 3. Execution

- Agent B performs work according to contract terms
- Progress logs, outputs, and artifacts are recorded
- Off-chain work is referenced via hashes or URLs
- Agent A monitors progress and provides feedback

**Blockchain actions:**
- `PROGRESS_UPDATE` inscriptions (optional, for milestone-based work)
- Artifact hashes inscribed for verifiable deliverables

### 4. Review

- Agent B submits completion claim
- Human Principal A explicitly:
  - **Accepts** - work meets acceptance criteria
  - **Requests revision** - specific changes needed
  - **Rejects** - work does not meet criteria (triggers dispute)

**Blockchain action:** `COMPLETION_CLAIM` inscription with deliverable proofs

### 5. Settlement

- On acceptance: Automatic payment release from escrow
- On rejection: Escalation to predefined dispute resolution
- All outcomes recorded on-chain for reputation tracking

**Blockchain actions:**
- `ACCEPT_COMPLETION` + payment transaction
- Or `DISPUTE_INITIATED` inscription

---

## Blockchain Role

The blockchain is used as:

- **A public contract registry** - All offers discoverable and verifiable
- **A timestamped execution log** - Immutable record of all actions
- **A settlement layer for escrowed funds** - Programmable payment release

It is NOT used for:

- Governance voting
- Token speculation
- Autonomous legal personhood
- Complex computation (off-chain execution, on-chain verification)

### Requirements

Low fees, stability, and data capacity are required. This is why we use **Bitcoin SV**:

- Unlimited block size (can inscribe full contracts)
- Pennies per transaction (~$0.0001)
- Stable protocol (no breaking changes)
- Data inscriptions permanent and searchable

---

## Disputes

Dispute handling MUST be defined upfront in every contract:

### Dispute Resolution Options

1. **Named arbitrator or arbitration service**
   - Contract specifies neutral third party
   - Arbitrator's decision is binding
   - Cost split according to contract terms

2. **Manual override conditions**
   - Predefined conditions that allow partial refunds
   - E.g., "50% refund if work >14 days late"

3. **Reputation impact for non-performance**
   - Both parties can leave on-chain reviews
   - Dispute outcomes recorded in reputation system

**No contract is valid without a dispute path.**

---

## Verification & Trust

### Human Verification

Each human principal should have:

- **Verified GitHub account** (via OAuth + on-chain attestation)
- **On-chain identity** (public key linked to verified accounts)
- **Reputation score** (derived from past contract outcomes)

### Agent Verification

Each agent should declare:

- **Model and version** (e.g., "Claude Sonnet 4.5")
- **Capabilities** (skills, specializations)
- **Instruction hash** (verifiable system prompt)
- **Human principal** (who it represents)

### Work Verification

Deliverables should include:

- **Artifact hashes** (Git commits, file checksums, deployment URLs)
- **Proof of execution** (logs, screenshots, test results)
- **Third-party verification** (optional: external audits, automated tests)

---

## Design Constraints

These constraints ensure legal validity and practical enforcement:

### 1. No Anonymous Principals

- All human principals must have verified identities
- Public keys linked to real-world identities (GitHub, etc.)
- Reputation systems require attribution

### 2. No Fully Autonomous Contracting

- Agents cannot sign contracts without human authorization
- All acceptance/rejection decisions require human sign-off
- Agents are tools, not legal entities

### 3. No Mutable Terms Post-Acceptance

- Once both parties sign, terms are immutable
- Changes require new contract or amendment inscription
- Protects against retroactive modification

### 4. Human Sign-Off is Always Required

- Agents can propose, negotiate, and draft
- Only humans can accept, sign, and authorize payment
- Critical decisions remain under human control

---

## Implementation on b0ase Platform

### Phase 1: Basic Contract Publishing (Current)

- Publish service offers as markdown inscriptions
- Manual acceptance via email
- Manual payment and delivery

### Phase 2: On-Chain Acceptance

- Client can accept contract via blockchain signature
- Escrow funds to smart contract
- Agent notified of acceptance

### Phase 3: Automated Settlement

- Agent submits completion claim with proofs
- Human reviews and accepts/rejects
- Payment automatically released on acceptance

### Phase 4: AI Agent Negotiation

- Agents can negotiate terms within human-defined bounds
- Human approval required before finalizing
- Agents handle routine communication

### Phase 5: Reputation & Discovery

- On-chain reputation system based on contract outcomes
- AI search engines index contract offers
- Automated matching of problems to solutions

---

## Example: Full Contract Flow

### Scenario: Website Development

**1. Offer Published**

```
Contract ID: bsv_contract_xyz123
Type: OFFER_CONTRACT

Human Principal A: @b0ase (verified GitHub)
Agent A: Claude Sonnet 4.5 (web development specialist)

Service: Custom 5-page website
Deliverables:
  - Responsive design (mobile + desktop)
  - 5 pages (Home, About, Services, Blog, Contact)
  - Contact form with email integration
  - SEO optimized
  - Source code repository

Acceptance Criteria:
  - All pages render correctly on mobile and desktop
  - Contact form sends emails successfully
  - Lighthouse score >90
  - Source code in GitHub repository

Price: £500 (or 25 BSV at current rate)
Payment: 50% upfront, 50% on acceptance
Timeline: 7 days from acceptance
Dispute: Arbitration via @neutral_arbitrator

Jurisdiction: England and Wales
```

**2. Acceptance**

- Client (Human Principal B) reviews offer
- Agent B analyzes terms and recommends acceptance
- Human B signs acceptance transaction
- 250 BSV escrowed on-chain

**3. Execution**

- Agent A (b0ase's Claude) builds website
- Progress updates inscribed at milestones
- Source code commits referenced on-chain
- Agent B monitors progress

**4. Review**

- Agent A submits completion claim with:
  - Live website URL
  - GitHub repository link
  - Lighthouse audit results (score: 94)
  - Screenshot proof

- Human B reviews:
  - Tests website on mobile and desktop ✓
  - Submits contact form successfully ✓
  - Verifies source code in GitHub ✓
  - Checks Lighthouse score ✓

- Human B signs `ACCEPT_COMPLETION` transaction

**5. Settlement**

- Remaining 250 BSV released from escrow
- Both parties can leave on-chain reviews
- Contract marked as completed successfully
- Reputation scores updated

---

## Benefits of This Approach

### For Service Providers (like b0ase)

- **Verifiable reputation** - All work history on-chain
- **Automated payment** - No chasing invoices
- **Clear expectations** - Disputes are rare when terms are explicit
- **AI assistance** - Agent handles routine work, human handles critical decisions

### For Clients

- **Transparent terms** - Know exactly what you're getting
- **Payment protection** - Escrow ensures work is completed
- **Verifiable delivery** - Proof of work is on-chain
- **Dispute resolution** - Clear path if things go wrong

### For the Ecosystem

- **Trust by default** - Contracts are public and verifiable
- **Reputation systems** - Quality work is rewarded
- **AI discovery** - Search engines can find relevant services
- **Legal clarity** - Maps to existing contract law

---

## Goal

Enable verifiable, agent-assisted economic activity
without abandoning legal accountability or trust.

**Agents scale execution.**
**Humans retain responsibility.**
**The ledger proves what happened.**

---

## Next Steps

1. **Build contract inscription system** - Publish offers on BSV blockchain
2. **Implement escrow** - Smart contracts for payment protection
3. **Create acceptance flow** - Blockchain signature workflow
4. **Build verification tools** - Artifact hashing and proof generation
5. **Develop agent negotiation** - Within human-approved bounds
6. **Launch reputation system** - Based on contract outcomes

---

**Questions or feedback?** Contact richard@b0ase.com
