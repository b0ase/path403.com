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

## Revenue Streams

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

## Revenue Projections

| Monthly Volume | Inscription | Settlement (0.1%) | Verification | Total Revenue |
|----------------|-------------|-------------------|--------------|---------------|
| 1M tx | $250 | $1,000 | $100 | $1,350 |
| 10M tx | $2,500 | $10,000 | $1,000 | $13,500 |
| 100M tx | $25,000 | $100,000 | $10,000 | $135,000 |
| 1B tx | $250,000 | $1,000,000 | $100,000 | $1,350,000 |

At scale (1B tx/month): **$16.2M annual revenue**

## The Token: $402

One token. Simple.

- **$402** is a PoW mining token on BSV (21M supply, 100% mined, no pre-mine)
- Run the path402 client → earn $402 by mining
- Mining uses a Hash-to-Mint (HTM) sCrypt smart contract with Proof-of-Indexing
- Nodes buy content tokens they want to serve (like BitTorrent)
- Nodes earn from serving content they've bought

See [HTM_TOKEN.md](HTM_TOKEN.md) for the full mining token spec.

### Node Economics

| Cost | Typical |
|------|---------|
| VPS hosting | ~$5-20/month |
| BSV transaction fees | ~0.5 sat/byte |
| Bandwidth | Variable (content serving) |
| Electricity (PoW) | Negligible (CPU mining) |

| Revenue Stream | Currency |
|---------------|----------|
| Mining $402 | $402 tokens → sell for BSV |
| Content serving | BSV (via ticket resale) |
| Content trading | BSV |
| Market making | BSV (arbitrage) |

## Competitive Advantage

### vs. Coinbase Facilitator

| Feature | Coinbase | PATH402.com |
|---------|----------|-------------|
| Chains supported | Base, Solana | Base, Solana, BSV, ETH, + more |
| Settlement finality | L2 (not final) | BSV (true finality) |
| Permanent record | No | Yes (BSV inscription) |
| Fees | 0 (subsidized) | 0.1% (sustainable) |
| Scaling | Limited | Unlimited (BSV) |
| Mining token | No | Yes ($402) |

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

## Summary

PATH402.com is building the **universal notary layer** for HTTP 402 payments:

1. **x402 compatible** - Works with existing ecosystem
2. **Multi-chain** - Verify payments on any chain
3. **Permanent record** - Inscribe on BSV forever
4. **Cheapest settlement** - BSV as final layer
5. **One token ($402)** - Mine by running the client

> "Every x402 payment. Verified. Inscribed. Forever."

---

**Last Updated**: February 9, 2026
