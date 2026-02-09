# The $402 Tree Model

**Version**: 1.0.0
**Date**: February 3, 2026

## The Six Rules

### 1. $addresses are paths

Every URL segment after a `$` creates an independent token market.

```
$example.com           → Root (the business)
$example.com/$projects → Branch (a division)
$example.com/$alpha    → Leaf (a product)
```

Each is a separate market with its own tokens, price curve, and shareholders.

### 2. Revenue flows upward

When a leaf sells, 50% goes to its holders, 50% goes to the parent. The parent takes its cut and passes 50% up again. **Every sale anywhere in the tree pays the root.**

```
User pays $example.com/$blog/$premium
    │
    ├─► 50% to $example.com/$blog/$premium holders
    │
    └─► 50% to $example.com/$blog (parent)
          │
          ├─► 50% of that to $example.com/$blog holders
          │
          └─► 50% of that to $example.com (root)
```

### 3. Branches don't dilute

Creating `$example.com/$exchange` doesn't affect `$example.com/$projects` holders. New branches are **additive**. The pie grows; existing slices stay the same size.

```
$example.com
├── $example.com/$projects  ← 50% owned by root
└── $example.com/$exchange  ← 50% owned by root (NEW, doesn't dilute $projects)
```

### 4. Roots are index funds

Holding the root means earning from **every branch and leaf beneath it** — including branches you didn't create and don't manage. The more the tree grows, the more the root earns.

```
$example.com shareholders receive:
  → Direct entry fees to $example.com
  → 50% of $example.com/$blog fees
  → 25% of $example.com/$blog/$premium fees (50% of 50%)
  → Revenue from ANY future branch or leaf
```

### 5. Demand is curation

No one needs to judge content quality. If people buy it, holders earn and serve it. If no one buys it, it economically disappears. **The price signal is the quality signal.**

```
Popular content:
  → High demand → High revenue → Holders serve it → Content thrives

Unpopular content:
  → Low demand → Low revenue → No incentive to serve → Content fades
```

### 6. Early discovery pays

`sqrt_decay` pricing rewards those who find valuable content before the market does. **Curation becomes profitable rather than altruistic.**

```
First buyer:  1000 tokens for 100 sats
10th buyer:   316 tokens for 100 sats
100th buyer:  100 tokens for 100 sats

Early buyers can resell to latecomers at profit.
```

## Summary

The tree **prunes itself**, **funds itself**, and **grows itself**. The protocol just enforces the 50% rule at each hop.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   $example.com (ROOT)                                           │
│   │                                                             │
│   ├── $example.com/$blog (BRANCH)                               │
│   │   ├── $example.com/$blog/$news (LEAF)                       │
│   │   └── $example.com/$blog/$opinion (LEAF)                    │
│   │                                                             │
│   ├── $example.com/$api (BRANCH)                                │
│   │   ├── $example.com/$api/$v1 (LEAF)                          │
│   │   └── $example.com/$api/$v2 (LEAF)                          │
│   │                                                             │
│   └── $example.com/$premium (BRANCH)                            │
│       └── ... (future leaves)                                   │
│                                                                 │
│   Revenue at ANY node flows UP to the root.                     │
│   Each node is independently tradeable.                         │
│   The tree grows without diluting existing holders.             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Related Documents

- [PROTOCOL_VISION.md](PROTOCOL_VISION.md) - Full protocol specification
- [PRICING_CURVES.md](PRICING_CURVES.md) - sqrt_decay and other pricing models
- [PATHD_ARCHITECTURE.md](PATHD_ARCHITECTURE.md) - Network infrastructure

---

**Last Updated**: February 3, 2026
