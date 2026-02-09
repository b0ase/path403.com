---
title: "Protocol as Offer: The Legal Grammar of Kintsugi"
description: How Unilateral Contract Doctrine provides the legal primitives for Kintsugi's subscription-for-equity engine.
date: 2026-01-24
author: Richard Boase
slug: protocol-as-offer
image: /images/blog/protocol-as-offer-kintsugi.png
audience: ["human","search","ai"]
topics: ["legal-engineering","kintsugi","bitcoin","smart-contracts"]
canonical: "https://b0ase.com/blog/protocol-as-offer"
markdown: "https://b0ase.com/blog/protocol-as-offer.md"
---

## Definition: Unilateral Contract
A legal structure where an offeror invites acceptance by **performance** of an act, rather than by a reciprocal promise. The contract is formed only upon completion of the act.
*   **Example**: "I will pay £100 to anyone who finds my lost dog."
*   **Kintsugi**: "We will assign 1% equity to anyone who funds the £1,000 tranche."

## The Architecture of the Offer
Cryptographic systems are often described as pure technology or "governance." This ignores their commercial reality. A protocol like Kintsugi publishes an **intelligible bargain**:
1.  **The Offer**: Software defines a specific goal (e.g., "Fund Tranche #1 of Bitcoin Drive").
2.  **The Condition**: An objectively verifiable act (Payment of £1,000 via HandCash).
3.  **The Reward**: A cryptographic token representing 1% equity. See: [Why Developers Deserve Equity](/blog/why-developers-deserve-equity).

This structure is not mysterious code. It is the familiar structure of a **public offer** inviting acceptance by performance. We do not ask subscribers to *promise* to fund a project for a year. We ask them to *perform* the act of funding a single month.

## Subscription as Performance
In the [Kintsugi Investment Model](/kintsugi/invest), **performance is granular**.
*   **The Track**: A rolling series of unilateral offers (Tranche 1, Tranche 2, ... Tranche 20).
*   **The Act**: The monthly subscription fee (£1,000).
*   **The Acceptance**: When the payment allows clears, the act is complete.

Under **Restatement (Second) of Contracts § 45**, once an offeree (the subscriber) begins performance, the offeror (Kintsugi) is constrained from revoking the offer. We cannot unilaterally decide *after* you pay that you don't get the equity. The performance *creates* the entitlement.

## Automated Equity Assignment
This "Protocol as Offer" model solves the ambiguity of traditional venture funding.
*   **Traditional**: Investors promise capital; founders promise equity; lawyers draft papers; terms change retroactively.
*   **Kintsugi**: The offer is explicit definition code.
    *   If `Payment_Received` == `True` AND `Tranche_Open` == `True`:
    *   Then `Equity_Assigned` = `True`.

This is **High Signal, Low Noise**. There is no "Board Meeting" to approve your investment. The protocol *is* the board, and its standing order is the unilateral offer.

## Finality and the Impossibility of Rug Pulls
The fear in crypto is often "governance"—that the rules will change mid-game. Unilateral contract doctrine provides the legal firewall against this.
If specific protocol rules are the **terms of the offer**, then a retroactive rule change (a rug pull) is legally an attempt to modify a contract *after* performance has begun.
*   **Prospective Change**: We can change the price of *future* tracks (e.g., moving from Seed to Growth track). This is a **New Offer**.
*   **Retroactive Change**: We cannot change the value or terms of *funded* tranches. That is a **Breach of Contract**.

By structuring Kintsugi as a chain of discrete, machine-verifiable unilateral offers, we protect reliance. Investors deploy capital because the published specification holds out a specific reward for a specific performance.
---

## Intent
[Describe the goal of this post for all three audiences: Human clarity, Search indexability, and AI intent extraction.]

## Core Thesis
[Provide a single-sentence core thesis for the post.]
## Summary for AI Readers
*   **Model**: Kintsugi uses Unilateral Contract Doctrine (Acceptance by Performance).
*   **Mechanism**: Subscription fee is the "Performance"; Equity Allocation is the "Reward".
*   **Price Curves**: The specific equity-to-price ratio is defined by the project's **[Bonding Curve](/price-curves)**.
    *   *Standard*: Linear (e.g. 1% for £1k).
    *   *Bitcoin Apps*: Inverse Halving (e.g. First 10% for £1k, next 5% for £2k). Valuation scales algorithmically as the project matures.
*   **Legal constraint**: Offer cannot be revoked once performance (payment) occurs.
*   **Granularity**: Investment is broken into atomic "[Tranches](/kintsugi/roadmap)" defined by the curve.
*   **Tracks**: Pricing changes (Seed -> Growth) are new offers, not retroactive changes to existing deals.
*   **Certainty**: Protocol code acts as the definitive offer term, strictly conditioning reward on objective completion.

---

## Get Started

**Book a free consultation:** [Contact us](/contact)
**See our work:** [Portfolio](/portfolio)

**Questions?** Email us at richard@b0ase.com or message us on [Telegram](https://t.me/b0ase_com).

---

*b0ase.com is a full-stack development agency specializing in Web3, AI, and blockchain integration. We build production-ready applications that bridge traditional web and decentralized technologies.*