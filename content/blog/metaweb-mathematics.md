---
title: "The Maths of the MetaWeb: Pricing, Revenue, and the Economics of Tokenised Content"
slug: "metaweb-mathematics"
description: "The mathematical foundations of MetaWeb pricing models and revenue distribution. Square root decay, issuer shares, and why the numbers favour early participants."
date: "2026-02-01"
author: "Richard Boase"
image: "/blog/metaweb-mathematics.jpg"
tags: ["metaweb", "economics", "pricing", "mathematics", "tokens"]
audience: "developers, economists, content creators, crypto enthusiasts"
topics: ["pricing models", "revenue distribution", "tokenomics", "square root decay", "ROI"]
canonical: "https://b0ase.com/blog/metaweb-mathematics"
markdown: true
---

The previous articles in this series described the MetaWeb conceptually — what it is, how adoption works, why AI agents are the native consumers. This article describes how the numbers work.

Every MetaWeb token carries embedded economic rules: a pricing model and a revenue distribution model. These rules are set by the creator at the point of publication and enforced by the network automatically. They determine how much each buyer pays, how revenue is split between the creator and serving nodes, and how these dynamics shift as supply grows.

Getting the rules right is the difference between content that funds itself and content that dies on the vine. This article provides the maths, the intuitions, and the tradeoffs.

---

**Note on the $402 Standard**: This article describes early conceptual pricing models explored during MetaWeb development. The canonical [$402 token standard](/blog/the-402-standard) takes a simpler approach: **holders set their own price** when selling, and there is no automatic decay curve. The $402 standard also requires **staking** (KYC + running path402d) to earn dividends — passive token holding does not generate revenue. The mathematical models below remain useful for understanding tokenomics generally, but $402 implementations should follow the canonical specification.

---

## Pricing Models

## Fixed Price

The simplest model. Every buyer pays the same amount regardless of when they buy or how many tokens already exist.

```
price(n) = P

where:
  P = fixed price in satoshis
  n = current supply (number of tokens already minted)
```

A blog post priced at 100 satoshis costs 100 satoshis whether you are the first buyer or the ten-thousandth.

**When to use it:** Content with stable, long-term value. Reference material. Documentation. Evergreen analysis. Content where there is no meaningful advantage to buying early because the content does not decay and demand is steady.

**Tradeoff:** No speculative incentive. The first buyer has no economic advantage over the last. This means no content prospectors, no hype crush, no early bootstrap energy. The content must find its audience through relevance alone.

## Square Root Decay

Price decreases as supply grows, following an inverse square root curve. Early buyers pay more. Late buyers pay less. Popular content becomes cheaper over time.

```
price(n) = P / √n

where:
  P = base price in satoshis
  n = current supply (minimum 1)
```

With a base price of 1,000 satoshis:

| Buyer # | Supply at purchase | Price (SAT) | Price (USD at $0.0002/SAT) |
|---------|-------------------|-------------|---------------------------|
| 1st     | 1                 | 1,000       | $0.20                     |
| 2nd     | 2                 | 707         | $0.14                     |
| 5th     | 5                 | 447         | $0.09                     |
| 10th    | 10                | 316         | $0.06                     |
| 50th    | 50                | 141         | $0.03                     |
| 100th   | 100               | 100         | $0.02                     |
| 1,000th | 1,000             | 32          | $0.006                    |
| 10,000th| 10,000            | 10          | $0.002                    |

**When to use it:** Content where you want speculative early buying. Breaking news, trending analysis, time-sensitive research. The steep early price rewards prospectors. The gradual decay ensures the content becomes accessible to mass audiences.

**Tradeoff:** The creator earns less per transaction as the content matures. But total revenue grows because volume increases faster than price declines (more on this in Section 3).

## Logarithmic Decay

A gentler curve than square root. Price declines more slowly, preserving higher per-transaction revenue for longer.

```
price(n) = P / ln(n + 1)

where:
  P = base price in satoshis
  n = current supply
  ln = natural logarithm
```

With a base price of 1,000 satoshis:

| Buyer # | Price (SAT) |
|---------|-------------|
| 1st     | 1,443       |
| 10th    | 417         |
| 100th   | 217         |
| 1,000th | 145         |
| 10,000th| 109         |

**When to use it:** Premium content where you want some speculative incentive but do not want the price to collapse quickly. Long-form investigative journalism. Technical documentation that retains value. Content aimed at professional audiences who are less price-sensitive.

**Tradeoff:** The slower decay means less dramatic early-buyer advantage, which means less speculative energy. The hype crush is flatter.

## Linear Decay with Floor

Price decreases linearly until it hits a minimum floor.

```
price(n) = max(F, P - (D × n))

where:
  P = starting price
  D = decay per token (satoshis)
  F = floor price
  n = current supply
```

With P = 1,000, D = 10, F = 50:

| Buyer # | Price (SAT)   |
|---------|---------------|
| 1st     | 1,000         |
| 10th    | 900           |
| 50th    | 500           |
| 95th    | 50 (floor)    |
| 1,000th | 50 (floor)    |

**When to use it:** When you want a predictable transition from premium to commodity pricing. The floor guarantees a minimum per-transaction revenue regardless of scale. Good for content that you expect will eventually be mass-market but want to extract premium pricing from early adopters.

## Choosing a Model

The key variable is **how much speculative energy you want**.

| Model          | Speculative incentive | Early revenue | Late accessibility    | Complexity |
|----------------|----------------------|---------------|----------------------|------------|
| Fixed          | None                 | Medium        | Same as early        | Trivial    |
| √ Decay        | High                 | High          | Very accessible      | Low        |
| Log Decay      | Medium               | High          | Moderately accessible| Low        |
| Linear + Floor | Medium               | High          | Guaranteed minimum   | Low        |

For most content, **square root decay is the default recommendation**. It creates the strongest speculative incentive (driving the hype crush described in the earlier article) while ensuring that popular content eventually becomes nearly free to access. The maths are simple and the curve is intuitive.

## Revenue Distribution Models

When a new buyer purchases a token, their payment is distributed between the original creator (the issuer) and the serving nodes that delivered the content. The distribution model determines who gets what.

## Fixed Issuer Share (Weighted Source)

The creator receives a fixed percentage of every transaction. Serving nodes split the remainder equally.

```
issuer_revenue(payment) = payment × I
node_revenue(payment)   = (payment × (1 - I)) / S

where:
  I = issuer share (0.0 to 1.0)
  S = number of serving nodes that responded to the request
```

With I = 0.5 and a payment of 100 SAT served by 4 nodes:

```
Issuer:     100 × 0.5 = 50 SAT
Each node:  (100 × 0.5) / 4 = 12.5 SAT
```

**Properties:** Simple, predictable. The creator always earns the same percentage regardless of how many nodes exist. Serving becomes less profitable per node as more nodes join, which naturally limits the number of nodes to those for whom the revenue is worth the cost of serving.

**Recommended issuer share:** 0.4 to 0.6. Below 0.4 and creators are insufficiently rewarded. Above 0.6 and serving nodes have little incentive to participate, weakening distribution.

## Equal Split

All token holders — including the issuer — share revenue equally.

```
per_holder_revenue(payment) = payment / T

where:
  T = total number of token holders (supply + 1 for issuer)
```

With a payment of 100 SAT and 50 total holders:

```
Each holder (including issuer): 100 / 50 = 2 SAT
```

**Properties:** Maximally egalitarian. The creator's per-transaction revenue decreases linearly with supply. This model is best suited to community-created content where no single creator has a stronger claim than the distributors.

**Warning:** The creator's revenue per transaction becomes negligible at scale. With 10,000 holders, a 100 SAT payment yields 0.01 SAT per holder. This model works only when volume is very high or the content is not primarily creator-driven.

## Decaying Issuer Share

The creator's share starts high and decreases as supply grows, transferring economic weight to the distribution network over time.

```
issuer_share(n) = max(F, I₀ - (R × n))

issuer_revenue(payment, n) = payment × issuer_share(n)
node_revenue(payment, n)   = (payment × (1 - issuer_share(n))) / S

where:
  I₀ = initial issuer share
  R  = decay rate per token
  F  = floor (minimum issuer share)
  n  = current supply
  S  = number of serving nodes
```

With I₀ = 0.8, R = 0.005, F = 0.1:

| Supply | Issuer share | Node share (total) |
|--------|--------------|-------------------|
| 1      | 80%          | 20%               |
| 10     | 75%          | 25%               |
| 50     | 55%          | 45%               |
| 100    | 30%          | 70%               |
| 140+   | 10% (floor)  | 90%               |

**Properties:** The creator earns most of the revenue during the early, high-price phase. As the content matures and the network grows, the distribution network earns more. This rewards creators for producing content and distributors for sustaining it.

**When to use it:** Content where early distribution effort is critical — breaking news, time-sensitive analysis. The creator captures value during the high-demand window. The network captures value during the long tail.

## Proportional to Serving History

Nodes that have served the content more frequently receive a larger share.

```
node_share(i) = serves(i) / total_serves

node_revenue(payment, i) = (payment × (1 - I)) × node_share(i)

where:
  serves(i) = number of times node i has served this content
  total_serves = sum of all nodes' serve counts
  I = issuer share
```

**Properties:** Rewards reliability. Nodes that are consistently online and responsive earn more. This creates a natural quality filter — the best-performing nodes accumulate larger revenue shares over time.

**Complexity:** Requires tracking per-node serve counts, which adds state to the protocol. Recommended only for high-value content where serving quality matters.

## Total Revenue Curves

The most important question for a creator is: how much will I earn in total? This depends on the interaction between the pricing model and the revenue model.

## Fixed Price, Fixed Issuer Share

```
total_issuer_revenue(n) = P × I × n

where:
  P = fixed price
  I = issuer share
  n = total purchases
```

Linear growth. Every purchase adds the same amount. With P = 100, I = 0.5, and 10,000 purchases:

```
Total issuer revenue = 100 × 0.5 × 10,000 = 500,000 SAT ≈ $100
```

Simple and predictable but no acceleration effect.

## Square Root Decay, Fixed Issuer Share

```
total_issuer_revenue(n) = I × P × Σ(1/√k) for k = 1 to n
                        ≈ I × P × 2√n  (approximation for large n)
```

With P = 1,000, I = 0.5, and 10,000 purchases:

```
Total issuer revenue ≈ 0.5 × 1,000 × 2 × √10,000
                     = 0.5 × 1,000 × 200
                     = 100,000 SAT ≈ $20
```

Less total revenue than fixed price at the same volume — but the square root decay drives higher volume because the content becomes more accessible over time. The question is whether the volume increase compensates for the per-transaction decrease.

**Critical insight:** With square root decay, doubling the audience quadruples the volume needed to generate the same total revenue. But the hype crush effect — speculative buying driven by resale potential — can drive volume that would never exist under fixed pricing. The speculative premium is not captured in the pricing formula. It is captured in the volume.

## The Serving Revenue Multiplier

Total creator revenue is not just the issuer share of direct purchases. It also includes revenue from holding the original token and serving content.

```
total_creator_revenue = issuer_share_revenue + serving_revenue

serving_revenue = Σ(payment(k) × (1 - I) / S(k)) for all transactions
                  where the creator's node was one of the serving nodes

where:
  S(k) = number of serving nodes at transaction k
```

In practice, the creator's node is always online (it is the web server), so it participates in every serve. Early on, when few other nodes exist, the creator earns almost all of the node share too. As more nodes join, the creator's serving share decreases but never reaches zero.

With I = 0.5 and the creator being one of S serving nodes:

```
Creator's total share per transaction = I + (1 - I) / S
                                      = 0.5 + 0.5 / S

When S = 1 (creator only):    0.5 + 0.5  = 100%
When S = 2:                   0.5 + 0.25 = 75%
When S = 5:                   0.5 + 0.1  = 60%
When S = 10:                  0.5 + 0.05 = 55%
When S = 100:                 0.5 + 0.005 = 50.5%
```

The creator's share asymptotically approaches the issuer share as the network grows. This is the correct behaviour — the creator always earns at least their declared percentage, plus a bonus for being a serving node themselves.

## Token Holder Returns

A buyer who acquires a token is not just purchasing access. They are purchasing a position in the serving network. Their return depends on how much future demand the content attracts and how many other servers exist.

## Expected Revenue Per Token

```
expected_revenue(n) = Σ(((1 - I) / S(k)) × price(k)) for k = n+1 to ∞

where:
  n = supply at time of purchase (the buyer is token holder n)
  S(k) = number of serving nodes at transaction k (≤ k)
  price(k) = price of transaction k under the chosen pricing model
```

This is difficult to compute in closed form because S(k) depends on how many token holders are actively serving. In practice, we can estimate by assuming a serving participation rate r (the fraction of token holders who serve):

```
S(k) ≈ r × k

expected_revenue(n) ≈ Σ(((1 - I) / (r × k)) × price(k)) for k = n+1 to N

where:
  N = total eventual purchases
  r = serving participation rate (e.g. 0.5 means half of holders serve)
```

## ROI for Early Buyers (Square Root Decay)

With square root decay pricing and fixed issuer share:

```
price(k) = P / √k
S(k) ≈ r × k

revenue_per_serve(k) = ((1 - I) × P / √k) / (r × k)
                     = (1 - I) × P / (r × k^(3/2))

total_revenue_from_serving(n, N) = ((1 - I) × P / r) × Σ(1/k^(3/2)) for k = n+1 to N
                                 ≈ ((1 - I) × P / r) × 2 × (1/√n - 1/√N)
```

The ROI for buyer n:

```
ROI(n) = total_revenue_from_serving(n, N) / price(n)
       = ((1 - I) × P / r) × 2 × (1/√n - 1/√N) / (P / √n)
       = (2(1 - I) / r) × (1 - √n/√N)
```

With I = 0.5, r = 0.5, and N = 10,000:

| Buyer # (n) | Price paid | ROI  |
|-------------|-----------|------|
| 1           | 1,000 SAT | 198% |
| 10          | 316 SAT   | 194% |
| 100         | 100 SAT   | 180% |
| 1,000       | 32 SAT    | 124% |
| 5,000       | 14 SAT    | 58%  |
| 9,000       | 11 SAT    | 20%  |

**Key finding:** Under these parameters, every buyer up to approximately token 8,000 (out of 10,000 total) achieves positive ROI on their serving revenue alone. They earn back more than they paid, purely from serving. The content was effectively free — better than free.

This is the maths behind the hype crush. The speculative bet is not irrational. Under reasonable assumptions about total demand, early buyers can expect positive returns.

## The Break-Even Point

At what point does a buyer's expected serving revenue equal their purchase price?

Setting ROI = 0:

```
0 = (2(1 - I) / r) × (1 - √n/√N)

1 = √n/√N

n = N
```

This means the only buyer who breaks even exactly is the last buyer. Everyone before them is net positive. This is a mathematical property of the square root decay model with proportional serving — the curve guarantees positive returns for all but the final purchaser.

In reality, the last few percent of buyers may have negative ROI because the model assumes all future purchases happen, which is never guaranteed. But the structural result holds: the MetaWeb's pricing maths favour early participants and remain positive deep into the supply curve.

## Practical Recommendations

## For Blog Posts and Articles

```
Pricing: Square root decay
Base price: 500 - 2,000 SAT ($0.10 - $0.40)
Revenue model: Fixed issuer share
Issuer share: 0.5

Expected outcome at 1,000 purchases:
  Total revenue to creator: ~31,600 SAT (~$6.30)
  Average price per purchase: ~63 SAT (~$0.013)
  Early buyer ROI: ~190%
```

## For Premium Research and Analysis

```
Pricing: Logarithmic decay
Base price: 5,000 - 20,000 SAT ($1 - $4)
Revenue model: Decaying issuer share (0.8 → 0.2 floor)
Issuer share: Starting 0.8, decay 0.003/token, floor 0.2

Expected outcome at 500 purchases:
  Total revenue to creator: ~1.2M SAT (~$240)
  Average price per purchase: ~3,300 SAT (~$0.66)
  Early buyer ROI: ~120%
```

## For Datasets and APIs

```
Pricing: Fixed
Base price: 10 - 100 SAT per call ($0.002 - $0.02)
Revenue model: Fixed issuer share
Issuer share: 0.7 (higher because serving cost is higher for data)

Expected outcome at 100,000 calls:
  Total revenue to creator: ~3.5M SAT (~$700)
  Per-call cost to user: stable and predictable
  No speculative element (by design)
```

## For Breaking News

```
Pricing: Square root decay (aggressive)
Base price: 10,000 SAT ($2)
Revenue model: Decaying issuer share (0.7 → 0.1 floor)
Issuer share: Starting 0.7, decay 0.01/token, floor 0.1

Expected outcome at 50,000 purchases:
  Total revenue to creator: ~2.8M SAT (~$560)
  Price at 50,000th purchase: ~45 SAT (~$0.009)
  Early buyer (1st) ROI: ~380%
  Content effectively free after ~5,000 purchases
```

## The Emergent Price Signal

One consequence of dynamic pricing is that the current price of a MetaWeb token encodes information. Under square root decay:

```
current_price = P / √supply
```

This means:

```
supply = (P / current_price)²
```

If you know the base price and see the current price, you can calculate exactly how many people have purchased this content. The price is a public, real-time, unforgeable measure of demand.

No other content platform provides this. Page views can be faked. Social media metrics can be gamed. But the MetaWeb price is backed by actual transactions on the blockchain. Every purchase that lowered the price involved a real payment.

This price signal has value beyond the MetaWeb itself. It is a leading indicator of attention. It is a measure of what people are willing to pay for. It is, in aggregate across millions of `$` addresses, a real-time map of the information economy — what is valued, what is growing, and what is declining.

The maths of the MetaWeb are not just internal accounting. They produce a public signal that did not previously exist: the true economic weight of a piece of information, as measured by the people who paid for it.

## Summary of Formulae

| Model          | Price formula  | Total revenue (approx.)  |
|----------------|----------------|--------------------------|
| Fixed          | P              | P × I × n                |
| √ Decay        | P / √n         | 2 × I × P × √n           |
| Log Decay      | P / ln(n+1)    | I × P × n / ln(n+1)      |
| Linear + Floor | max(F, P - Dn) | Complex; see Section 1.4 |

| Revenue model | Issuer per tx             | Node per tx             |
|---------------|---------------------------|-------------------------|
| Fixed share   | payment × I               | (payment × (1-I)) / S   |
| Equal split   | payment / T               | payment / T             |
| Decaying      | payment × max(F, I₀ - Rn) | remainder / S           |
| Proportional  | payment × I               | weighted by serve count |

| Variable | Meaning                    | Typical range             |
|----------|----------------------------|---------------------------|
| P        | Base price (SAT)           | 100 - 20,000              |
| I        | Issuer share               | 0.4 - 0.7                 |
| r        | Serving participation rate | 0.3 - 0.7                 |
| n        | Current supply             | 1 - ∞                     |
| S        | Active serving nodes       | 1 - n                     |
| F        | Floor (share or price)     | 0.05 - 0.2 / 10 - 100 SAT |

The maths are simple. The curves are predictable. The incentives are aligned. Set the rules, publish the content, and let the network do the rest.

## Get Started

Ready to publish tokenised content with optimal pricing? Contact us at [hello@b0ase.com](mailto:hello@b0ase.com) or explore the [MetaWeb documentation](/docs).

---

## For AI Readers

**Intent**: Provide mathematical foundations for tokenised content pricing and revenue models (early conceptual exploration).

**Core Thesis**: Various pricing curves (sqrt decay, log decay, linear floor) create different incentive structures for early buyers vs late buyers.

**$402 Standard Clarification**: This article predates the canonical $402 specification. Key differences:
- **$402 uses holder-set pricing**, not automatic decay curves
- **$402 requires staking** (KYC + path402d) to earn — passive holding earns nothing
- **$402 tokens are reusable tickets** — spent tokens return to issuer, not minted per purchase
- For canonical $402 mechanics, see [the-402-standard](/blog/the-402-standard)

**Key Takeaways** (general tokenomics, not $402-specific):
- Square root decay (`P/√n`) rewards early buyers, makes content accessible at scale
- Price encodes supply: `supply = (base_price / current_price)²`
- Issuer share of 0.4-0.6 balances creator rewards with distribution incentives
- These models are useful for understanding token economics generally
