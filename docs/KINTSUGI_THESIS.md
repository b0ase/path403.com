# Kintsugi Thesis

> Kintsugi is not a platform. It is an AI agent that mediates and enforces three-way economic relationships between founders, developers, and investors.

---

## What Kintsugi Is

Kintsugi is best understood not as a "program" or "framework", but as an **AI agent that mediates and enforces three-way economic relationships**.

Its job is not ideation, and not execution, but **coordination, accounting, and enforcement**.

---

## The Three Parties

The three parties have misaligned incentives:

| Party | Wants |
|-------|-------|
| **Founders** | Progress without losing control |
| **Developers** | Compensation, clarity, and upside |
| **Investors** | Measurable delivery and risk containment |

Kintsugi exists to turn these human negotiations into **machine-readable, machine-enforceable contracts**.

---

## What Kintsugi Does

At a functional level, Kintsugi:

1. **Captures** conversations, negotiations, and commitments
2. **Normalises** them into structured obligations
3. **Breaks** work into discrete deliverables
4. **Meters** progress, time, and outputs
5. **Releases** capital and equity conditionally
6. **Maintains** an immutable audit trail

**This is not primarily a legal system; it is an economic coordination engine.**

---

## Why Agent-Based

Seen this way, Kintsugi is naturally an agent-based system, and its backend requirements map directly onto a UTXO-style ledger.

Each meaningful state transition can be represented as a discrete, spendable object:

| State Object | What It Represents |
|--------------|-------------------|
| Commitment | Agreement to do something |
| Milestone | Measurable checkpoint |
| Delivery | Completed work product |
| Payment | Capital released |
| Equity slice | Ownership transferred |
| Dispute | Contested state |
| Release condition | Trigger for next action |

These are not "tokens" in a speculative sense. They are **stateful economic objects** with provenance, ownership, and constraints.

---

## The Core Loop

```
capture → negotiate → commit → meter → settle
```

This loop repeats continuously, at small granularity.

**Progress is not measured quarterly or even weekly, but event by event.**

---

## Why Users Don't Need to Know About BSV

Because Kintsugi is an agent, not a platform, it does not require users to adopt a new chain, wallet, or currency.

Founders, developers, and investors can continue to think in:
- Fiat (GBP, USD)
- Equity percentages
- Milestones and deliverables

BSV sits underneath as the truth and settlement layer:
- **Cheap enough** to record everything
- **Deterministic enough** to enforce outcomes
- **Simple enough** to model obligations as UTXOs
- **Scalable enough** for continuous micro-events

---

## External Inputs

External systems feed into Kintsugi:

| Source | What It Captures |
|--------|-----------------|
| Git commits | Code delivery |
| Task completion signals | Progress |
| Conversation logs | Agreements |
| AI-generated assessments | Quality checks |
| Payment processor events | Capital flows |
| Chain events from elsewhere | Cross-chain proofs |

Kintsugi normalises these inputs and commits their hashes or derived state transitions to the ledger.

This creates **non-repudiable proofs** of:
- Who agreed to what
- When obligations were created
- Whether conditions were met
- Why funds or equity were released

---

## The Economic Model

The economic model is intentionally **small and repetitive**:

| Fee Type | When Charged |
|----------|--------------|
| Micro-fee | Per captured event |
| Micro-fee | Per state transition |
| Micro-fee | Per settlement or release |
| Micro-fee | Per audit or proof retrieval |

**No single transaction matters. The system compounds through frequency.**

---

## The Insight

From the outside, Kintsugi may look like a "startup engine" or "contracting model".

Internally, it is closer to an **autonomous accounting and enforcement agent** for early-stage companies.

The insight is that once contracting becomes machine-mediated, **coordination itself becomes a monetisable surface**.

---

## What BSV Is (And Isn't)

**BSV is not the product.**

**Kintsugi is not a blockchain app.**

BSV is the substrate that makes it economically possible for an agent like Kintsugi to exist at:
- Fine granularity
- Continuously
- Without trust

---

## Mapping to M2M Infrastructure

Kintsugi's core loop maps directly to the M2M infrastructure:

| Kintsugi | M2M Layer | Implementation |
|----------|-----------|----------------|
| Capture | `captured_events` | Conversations, commits, webhooks |
| Negotiate | Normalisation | Standard contract format |
| Commit | `commit_batches` | Merkle tree to BSV |
| Meter | `utxo_meters` | Per-action billing |
| Settle | `usage_invoices` | Release capital/equity |

The pattern is identical:
```
capture → normalise → commit → prove → settle
```

---

## Implementation Status

| Component | Status | Location |
|-----------|--------|----------|
| Chat UI | ✅ Live | `/kintsugi` |
| Multi-AI chat | ✅ Live | `/api/kintsugi/chat` |
| Repo creation | ✅ Live | `/api/kintsugi/create-repo` |
| BSV inscription | ✅ Live | `/api/kintsugi/inscribe-chat` |
| Event capture | ✅ Built | `lib/m2m/event-capture.ts` |
| Batch commits | ✅ Built | `lib/m2m/batch-committer.ts` |
| UTXO metering | ✅ Built | `lib/m2m/utxo-meter.ts` |
| Proof lookup | ✅ Built | `lib/m2m/proof-lookup.ts` |
| Three-party contracts | 🔨 In progress | Pipeline system |
| Conditional releases | 🔨 In progress | Escrow system |
| Equity automation | ⏳ Planned | Staking system |

---

## Summary

Kintsugi is an **economic coordination agent** that:

1. Mediates founder-developer-investor relationships
2. Turns negotiations into machine-enforceable contracts
3. Meters progress at event granularity
4. Releases capital and equity conditionally
5. Maintains immutable audit trails
6. Charges micro-fees per state transition

**BSV is invisible. Coordination is the product. Frequency is the business model.**
