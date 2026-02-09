# PATH402.com Business Model

## Executive Summary

PATH402.com is the **notary layer** for the x402 payment protocol ecosystem. We capture, verify, inscribe, and settle HTTP 402 payments across all chains, with permanent proof on BSV.

## The Opportunity

Coinbase's x402 protocol (launched May 2025) has processed 100M+ payments across Base, Solana, and other chains. However:

1. **No permanent record** - L2 transactions aren't truly settled
2. **Scaling limits** - Base/Solana have throughput ceilings
3. **Rising fees** - Congestion increases costs
4. **No universal ledger** - Fragmented across chains

**PATH402.com solves this** by becoming the universal notary and settlement layer.

## Business Model

### Revenue Streams

```
┌─────────────────────────────────────────────────────────────┐
│                    Revenue Architecture                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. INSCRIPTION FEES                                         │
│     Every x402 payment → BSV inscription                    │
│     Fee: 500 sats (~$0.00025)                               │
│     Margin: ~400% over BSV tx cost                          │
│                                                              │
│  2. SETTLEMENT FEES                                          │
│     Payments settling ON BSV                                 │
│     Fee: 0.1% of transaction value                          │
│                                                              │
│  3. VERIFICATION FEES                                        │
│     Multi-chain payment verification                         │
│     Fee: 200 sats per verification                          │
│                                                              │
│  4. ROUTING FEES                                             │
│     Cross-chain payment routing                              │
│     Fee: 0.05% of routed value                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Revenue Projections

| Monthly Volume | Inscription | Settlement (0.1%) | Verification | Total Revenue |
|----------------|-------------|-------------------|--------------|---------------|
| 1M tx | $250 | $1,000 | $100 | $1,350 |
| 10M tx | $2,500 | $10,000 | $1,000 | $13,500 |
| 100M tx | $25,000 | $100,000 | $10,000 | $135,000 |
| 1B tx | $250,000 | $1,000,000 | $100,000 | $1,350,000 |

At scale (1B tx/month): **$16.2M annual revenue**

## Token Economics

### The PATH402.com Token

- **Symbol**: PATH402.com (on-chain BSV-20)
- **Total Supply**: 1,000,000,000
- **Treasury**: 500,000,000 (for sale via sqrt_decay curve)
- **Protocol**: BSV-20

### Two-Tier System

```
┌─────────────────────────────────────────────────────────────┐
│                     TOKEN TIERS                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  TIER 1: BEARER INSTRUMENT                                  │
│  ─────────────────────────                                  │
│  • Buy, hold, transfer freely                               │
│  • No KYC required                                          │
│  • Trade on any exchange/OTC                                │
│  • No dividends, no voting                                  │
│  • Pure bearer asset                                        │
│                                                              │
│  TIER 2: REGISTERED SHAREHOLDER                             │
│  ───────────────────────────────                            │
│  • Complete KYC verification                                │
│  • Stake tokens on PATH402.com                              │
│  • Receive quarterly dividends                              │
│  • Voting rights on protocol changes                        │
│  • Access to shareholder communications                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Dividend Distribution

```
Quarterly Protocol Revenue
          │
          ▼
    ┌─────────────┐
    │  Revenue    │
    │  Pool       │
    └─────┬───────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌───────┐  ┌───────────┐
│ 30%   │  │ 70%       │
│ Ops   │  │ Dividends │
└───────┘  └─────┬─────┘
                 │
                 ▼
    ┌────────────────────┐
    │ Pro-rata to staked │
    │ token holders with │
    │ completed KYC      │
    └────────────────────┘
```

**Example**:
- Q1 Revenue: $100,000
- Operating costs: $30,000 (30%)
- Dividend pool: $70,000 (70%)
- Total staked (KYC'd): 10,000,000 tokens
- Dividend per token: $0.007

### Shareholder Rights

| Right | Tier 1 (Bearer) | Tier 2 (Registered) |
|-------|-----------------|---------------------|
| Own tokens | ✓ | ✓ |
| Transfer freely | ✓ | ✓ |
| Receive dividends | ✗ | ✓ |
| Vote on proposals | ✗ | ✓ |
| Attend meetings | ✗ | ✓ |
| Financial reports | ✗ | ✓ |

## Capital Strategy

### Fundraising via Token Sale

```
┌─────────────────────────────────────────────────────────────┐
│                    SQRT_DECAY TOKEN SALE                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Formula: price = 100,000,000 / sqrt(remaining + 1)        │
│                                                              │
│  Early buyers (500M remaining): ~4,472 sats/token          │
│  Mid buyers (250M remaining):   ~6,325 sats/token          │
│  Late buyers (100M remaining):  ~10,000 sats/token         │
│                                                              │
│  If all 500M sold:                                          │
│  Total raised: ~$760,000 (at $45/BSV)                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Use of Funds

| Allocation | Percentage | Amount (if $500K raised) |
|------------|------------|--------------------------|
| Development | 40% | $200,000 |
| Marketing | 30% | $150,000 |
| Operations | 15% | $75,000 |
| Legal/Compliance | 10% | $50,000 |
| Reserve | 5% | $25,000 |

## Competitive Advantage

### vs. Coinbase Facilitator

| Feature | Coinbase | PATH402.com |
|---------|----------|-------------|
| Chains supported | Base, Solana | Base, Solana, BSV, ETH, + more |
| Settlement finality | L2 (not final) | BSV (true finality) |
| Permanent record | No | Yes (BSV inscription) |
| Fees | 0 (subsidized) | 0.1% (sustainable) |
| Scaling | Limited | Unlimited (BSV) |
| Token/Equity | No | Yes (PATH402.com) |

### The Endgame

```
Phase 1: Compatibility
├── Implement x402 spec exactly
├── Support Base, Solana verification
└── Launch inscription service

Phase 2: Adoption
├── Market to x402 developers
├── Offer cheaper settlement on BSV
└── Build inscription volume

Phase 3: Dominance
├── As other chains congest, BSV becomes default
├── All x402 traffic flows through PATH402
└── Revenue scales with ecosystem

Phase 4: Standard
├── PATH402 becomes THE x402 facilitator
├── BSV becomes THE settlement layer
└── Protocol revenue funds ongoing development
```

## Legal Structure

### Token Classification

- **Tier 1 (Bearer)**: Utility token / bearer instrument
- **Tier 2 (Registered)**: Security token / equity equivalent

### KYC Requirements (Tier 2)

- Government ID verification
- Proof of address
- AML/CFT screening
- Accredited investor status (if required by jurisdiction)

### Jurisdiction

- Company: [TBD - likely Switzerland or Singapore]
- Token: BSV blockchain (decentralized)
- Dividends: Paid in BSV or stablecoin

## Summary

PATH402.com is building the **universal notary layer** for HTTP 402 payments:

1. **x402 compatible** - Works with existing ecosystem
2. **Multi-chain** - Verify payments on any chain
3. **Permanent record** - Inscribe on BSV forever
4. **Cheapest settlement** - BSV as final layer
5. **Tokenized equity** - Shareholders earn dividends

> "Every x402 payment. Verified. Inscribed. Forever."

---

*This document is for informational purposes. Consult legal counsel before participating in token sales.*
