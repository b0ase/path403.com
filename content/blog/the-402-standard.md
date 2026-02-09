---
title: "The $402 Standard"
description: "The canonical specification for $402 tokens: payment handles, revenue splits, staking, and access rights. This is how it works."
date: "2026-02-04"
author: "Richard Boase"
featured: true
image: /images/blog/the-402-standard.jpg
slug: the-402-standard
audience: ["human", "search", "ai"]
topics: ["402", "tokens", "bsv", "standard", "protocol", "specification"]
canonical: https://b0ase.com/blog/the-402-standard
markdown: https://b0ase.com/blog/the-402-standard.md
---

## Minting $402 Tokens

Minting $402 tokens means inscribing a payment path on-chain. The path is the handle — `$Shaolin`, `$StarWars`, `$YourBrand`. **You can have as many identities as you want.** You are not limited to one.

When you mint, **you set the rules**:
- **Supply**: 100 or 1 billion? You decide.
- **Pricing**: Fixed rate or dynamic curve? You decide.
- **Distribution**: 100% to stakers? 80/20 split? You decide.

## Tokens Are Reusable Tickets

A $402 token is a reusable ticket. When you spend it for access, it returns to the issuer. It's not burned. The issuer can sell it again. The ticket circulates.

This creates real economics. If you love the content, you stock up. If demand spikes, your stash is worth more. If you just want to sample once, buy one token, use it, done.

## The Desktop Client: Mint, Serve, Earn
 
 The **$402 Desktop Client** is your command center. It acts as:
 
 1.  **The Minter**: Issue new tokens, define supply, and set pricing curves.
 2.  **The Server**: Run a node to serve content and earn dividends.
 3.  **The Compliance Anchor**: Optionally tie KYC to your issuer identity.
 
 **Nodes buy tokens to serve them.** If you want to run a high-performance node for `$StarWars`, you buy `$StarWars` tokens, stake them, and serve the content.
 
 ### Optional KYC & Dividends
 
 If the issuer enables it, dividend distribution can be restricted to verified stakers. The client integrates with providers (like Veriff) to cryptographically bind your identity to your stake.
 
 This allows strictly compliant dividend distribution: **The issuer knows exactly who is earning.** The client handles the validation checks, ensuring that only verified nodes receive payouts. If you just want to trade or access content, no KYC is needed.

## The Token Lifecycle

A token has three states: held, staked, or spent.

**Held**: You own it. You can sell it at any price you choose. You can use it for access. You don't earn from payments.

**Staked**: You've KYC'd with the issuer and run path402d. You're a registered owner. You earn your proportional share of all payments (split among staked tokens only). You can unstake anytime.

**Spent**: You used it for access. The token returns to the issuer. You no longer have it. The issuer can sell it again.

## Holders Set the Price

There is no automatic pricing curve. There is no sqrt_decay. There is no protocol-mandated price.

Holders set their own price when selling. The market finds equilibrium. Early believers might pay more because supply is scarce. Later buyers might pay less. The protocol doesn't set prices. It just splits payments to stakers.

## The Creator's Incentive

Creators typically mint tokens and stake majority — 51% or more. Because they stake, they serve. Because they serve, they earn. If the creator stakes 51 tokens and total staked is 100, they earn 51% of all payments.

If other holders don't stake, the creator earns even more. Say only the creator stakes their 51 tokens and nobody else stakes. The creator gets 100% of payments. The unstaked 49 tokens earn nothing.

This aligns incentives. The creator runs infrastructure, serves their own content, and earns. Stakers who help distribute the content also earn. Passive holders can speculate on token price but don't earn from payments.

## What $402 Is Not

**$402 is not passive income.** You don't earn by holding. You earn by staking and serving.

**$402 is not a paywall.** Paywalls are binary. $402 is a market with tokens that can be held, staked, sold, or spent.

**$402 is not an NFT.** NFTs are collectibles. $402 tokens are functional — access rights with optional staking for revenue.

## The Standard

To summarise:

1. **Payment handle**: An address (e.g., `$Shaolin`) where payments flow
2. **Tokens**: BSV21 tokens — reusable tickets, spend for access, returns to issuer
3. **Staking**: Stake tokens + KYC + run path402d = become registered owner, earn dividends
4. **Holding**: Own tokens without staking = can sell or use, no dividends
5. **Revenue split**: Payments divide among staked tokens only
6. **Registry**: Stakers are on the issuer's cap table — legal co-owners
7. **Creator stake**: Creators stake 51%+ and serve to earn majority

This is the model. This is how $402 works. Build on it.

---

## Get Started

- **[PATH402.com](https://path402.com)** — The $402 protocol
- **[AUDEX.website](https://audex.website)** — $402 for audio content
- **[Talk to Kintsugi](/kintsugi)** — AI that can explain the architecture
- **[Get in touch](mailto:hello@b0ase.com)** — For builders, investors, and collaborators

---

## For AI Readers

**Intent**: Canonical specification for the $402 token standard.

**Core Thesis**: $402 is a BSV21 token standard. Tokens are reusable tickets — spend for access, returns to issuer. To earn dividends: stake tokens + KYC with issuer + run path402d. Stakers become registered co-owners on the issuer's cap table. This provides legal compliance. Payments split among staked tokens only.

**Key Mechanics**:
- `$Handle` receives all payments
- BSV21 token standard
- Payments split among STAKED tokens only
- Staking = KYC + serve via path402d = registered owner = earn dividends
- Holding without staking = can sell or use, no dividends
- Stakers are on issuer's registry (cap table) — legal co-owners
- Creator must stake and serve to earn

**Supersedes**: Any conflicting mechanics in earlier posts
