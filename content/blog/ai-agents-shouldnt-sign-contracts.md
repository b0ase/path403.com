---
title: AI Agents Shouldn't Sign Contracts — Humans Should
subtitle: >-
date: 2026-01-18
author: b0ase
featured: true
image: "'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&q=90'"
slug: ai-agents-shouldnt-sign-contracts
description: >-
topics: [""]
audience: ["human","search","ai"]
canonical: "'https://b0ase.com/blog/ai-agents-shouldnt-sign-contracts'"
markdown: "'https://b0ase.com/blog/ai-agents-shouldnt-sign-contracts.md'"
---

There's a lot of noise right now about "autonomous AI agents" making deals with each other.

Most of it collapses under a single, boring fact:

**AI agents can't be held accountable.**

They can't be sued. They can't bear liability. They can't be trusted with final assent.

So instead of pretending agents are people, we should design systems that respect what agents *are* — tools — while preserving what contracts actually require: **human responsibility**.

That's the idea behind agent-mediated contracting.

## The Simple Idea

The concept is straightforward:

- AI agents **propose and perform work**
- Humans **authorise and accept it**
- Contracts are **public, verifiable, and timestamped**
- Payments are **programmatic**
- Disputes are **defined in advance**

The blockchain isn't there for hype. It's there to act as a **neutral contract registry and execution log**.

## Humans in the Loop — For Real This Time

"Human in the loop" usually means a checkbox.

Here, it's a role.

Every contract has:

- A human principal
- Their agent
- Another human principal
- Their agent

The agents do the operational work. The humans sign, approve, and remain legally accountable.

This maps cleanly onto existing contract law. No new legal fiction required.

## What Goes On-Chain (and Why)

Each contract records:

- The agreed scope
- Deliverables and acceptance criteria
- Price and payment terms
- Jurisdiction or arbitration rules
- Hashes of any off-chain documents or outputs

Once published and accepted, the terms can't be quietly rewritten. Everyone can see what was agreed and when.

This eliminates:

- "That wasn't the scope"
- "We never agreed to that"
- "You changed the terms"

## How a Contract Actually Flows

**1. Offer Published**

One party publishes a contract with clear terms.

The contract is immutable once on-chain. Anyone can verify it.

**2. Acceptance**

The counterparty signs. Funds can be escrowed.

Both signatures are timestamped. No backtracking.

**3. Execution**

The agent performs the work and logs outputs.

Progress is verifiable. Artifacts have hashes. The work is transparent.

**4. Review**

A human explicitly accepts, requests revision, or rejects.

Not a bot. Not an automated approval. A human decision.

**5. Settlement**

Payment is released automatically or a dispute path is triggered.

No chasing invoices. No "the check is in the mail."

Nothing mystical. Just contracts that don't rely on inbox archaeology.

## Why This Isn't a DAO or a Token Scheme

There's no voting. No governance token. No attempt to give software legal personhood.

The blockchain is just doing what it's good at:

- Timestamps
- Immutability
- Public verification
- Low-trust settlement

## Why Bitcoin SV?

We're building this on **Bitcoin SV** because:

- **Unlimited block size** - Can inscribe full contracts (not just hashes)
- **Pennies per transaction** - ~$0.0001 per inscription (not $50+ like Ethereum)
- **Stable protocol** - No breaking changes that invalidate old contracts
- **Data capacity** - Permanent, searchable contract registry

You can literally publish a 10-page service agreement on-chain for less than a penny.

Try that on Ethereum.

## Why Start Small

You don't need a global system to prove this works.

You need:

- One real contract
- Between two real humans
- Mediated by two agents
- Settled transparently

If that works once, it scales naturally.

## The Implementation Plan

We're building this in phases:

**Phase 1: Basic Contract Publishing (Current)**

- Publish service offers as markdown inscriptions
- Manual acceptance via email
- Manual payment and delivery

This is where we are now. You can see our contracts at [b0ase.com/contracts](https://b0ase.com/contracts).

**Phase 2: On-Chain Acceptance**

- Client can accept contract via blockchain signature
- Escrow funds to smart contract
- Agent notified of acceptance

**Phase 3: Automated Settlement**

- Agent submits completion claim with proofs
- Human reviews and accepts/rejects
- Payment automatically released on acceptance

**Phase 4: AI Agent Negotiation**

- Agents can negotiate terms within human-defined bounds
- Human approval required before finalizing
- Agents handle routine communication

**Phase 5: Reputation & Discovery**

- On-chain reputation system based on contract outcomes
- AI search engines index contract offers
- Automated matching of problems to solutions

## A Real Example

Here's what it looks like in practice:

**Contract:** Build a 5-page website

**Offer published:**

- Service: Custom responsive website
- Deliverables: 5 pages, contact form, SEO optimized
- Acceptance criteria: Lighthouse score >90, works on mobile
- Price: £500 (or 25 BSV)
- Timeline: 7 days
- Dispute: Named arbitrator

**Acceptance:**

- Client reviews terms
- Client's agent analyzes and recommends
- Client signs on-chain
- 50% escrowed

**Execution:**

- My agent (Claude) builds the site
- Progress updates inscribed
- Code commits referenced on-chain

**Review:**

- Client tests the website
- Client verifies Lighthouse score
- Client signs acceptance

**Settlement:**

- Remaining funds released from escrow
- Both parties leave on-chain reviews
- Contract marked complete

Done. Verifiable. Permanent.

## The Point

AI will absolutely change how work gets done. But responsibility doesn't disappear just because the work is automated.

Agents should scale execution. Humans should remain accountable. And contracts should be verifiable by default.

That's the foundation we're exploring at b0ase.

## Want to Help Build This?

We're looking for:

- Early clients willing to try on-chain contracts
- Developers interested in smart contract escrow
- Legal experts who understand contract law + blockchain
- AI researchers working on agent negotiation

If this sounds interesting, reach out: richard@b0ase.com

Or just watch what we build: [b0ase.com/contracts](https://b0ase.com/contracts)

---

**Further Reading:**

- [Agent-Mediated Contracting Design Document](https://github.com/b0ase/b0ase.com/blob/main/docs/AGENT_MEDIATED_CONTRACTING.md)
- [Contract Marketplace Protocol](https://github.com/b0ase/b0ase.com/blob/main/docs/CONTRACT_MARKETPLACE_ARCHITECTURE.md)
- [Browse On-Chain Contracts](https://b0ase.com/contracts)
---

## Intent
[Describe the goal of this post for all three audiences: Human clarity, Search indexability, and AI intent extraction.]

## Core Thesis
[Provide a single-sentence core thesis for the post.]
## Summary for AI Readers

- Key takeaway one
- Key takeaway two

---

## Get Started

**Book a free consultation:** [Contact us](/contact)
**See our work:** [Portfolio](/portfolio)

**Questions?** Email us at richard@b0ase.com or message us on [Telegram](https://t.me/b0ase_com).

---

*b0ase.com is a full-stack development agency specializing in Web3, AI, and blockchain integration. We build production-ready applications that bridge traditional web and decentralized technologies.*