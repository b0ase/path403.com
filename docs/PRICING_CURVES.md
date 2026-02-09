# $402 Pricing Curves Library

**Version**: 1.0.0
**Last Updated**: February 3, 2026

## Overview

This document provides a library of pricing curves for $402 token issuers. When creating a new `$path` token, issuers select a pricing model that determines how the entry price changes over time.

**The curve is the economic constitution of your token.**

---

## Quick Reference

| Model | Formula | Direction | Best For |
|-------|---------|-----------|----------|
| `sqrt_decay` (investment) | `base / √(treasury + 1)` | Price ↑ as treasury ↓ | Equity, crowdfunding |
| `sqrt_decay` (content) | `base / √(supply + 1)` | Price ↓ as supply ↑ | Premium content, APIs |
| `fixed` | `base` | Constant | Simple paywalls |
| `linear` | `base - (supply × rate)` | Linear decrease | Promotional |
| `linear_increase` | `base + (supply × rate)` | Linear increase | Scarcity-driven |
| `exponential` | `base × decay^supply` | Exponential decay | Early-adopter bonus |
| `bonding_curve` | `reserve / supply` | AMM-style | Liquid markets |

---

## sqrt_decay (Default)

The recommended default for most $402 tokens. Uses square root decay for smooth, fair price transitions.

### Investment Variant (Treasury-Based)

**Use case**: Equity tokens, crowdfunding, investment vehicles

**Behavior**: Price INCREASES as treasury depletes. Early buyers are rewarded.

```
price = base / √(treasury_remaining + 1)
```

**Configuration**:
```json
{
  "pricing": {
    "model": "sqrt_decay",
    "variant": "investment",
    "base": 100000000,
    "treasury_initial": 500000000
  }
}
```

**Price Schedule Example** (base = 223,610 sats):

| Treasury | Price (sats) | % Sold |
|----------|-------------|--------|
| 500,000,000 | 10 | 0% |
| 400,000,000 | 11 | 20% |
| 100,000,000 | 22 | 80% |
| 10,000,000 | 71 | 98% |
| 1,000,000 | 224 | 99.8% |
| 1,000 | 7,072 | 99.9998% |

**Why it works**: Early believers take on risk when the token is unproven. They're rewarded with more tokens per unit spent. Latecomers pay more but benefit from validation.

### Content Variant (Supply-Based)

**Use case**: Premium articles, API access, digital content

**Behavior**: Price DECREASES as supply grows. Early buyers pay for time advantage.

```
price = base / √(supply + 1)
```

**Configuration**:
```json
{
  "pricing": {
    "model": "sqrt_decay",
    "variant": "content",
    "base": 10000,
    "supply_initial": 0
  }
}
```

**Price Schedule Example** (base = 10,000 sats):

| Supply | Price (sats) | % Drop |
|--------|-------------|--------|
| 0 | 10,000 | 0% |
| 9 | 3,162 | 68% |
| 99 | 1,000 | 90% |
| 999 | 316 | 97% |
| 9,999 | 100 | 99% |

**Why it works**: First readers pay a premium for exclusive early access. As content proves popular, price drops to increase accessibility. Viral content eventually becomes cheap.

---

## fixed

Simplest model. Constant price regardless of supply or time.

**Use case**: Standard paywalls, subscription-like access

**Behavior**: Price never changes.

```
price = base
```

**Configuration**:
```json
{
  "pricing": {
    "model": "fixed",
    "price": 500
  }
}
```

**Example**: Blog posts at 500 sats each, forever.

**When to use**:
- You want predictable pricing
- Content value doesn't change over time
- Simplicity is more important than incentive alignment

**When NOT to use**:
- You want to reward early adopters
- Content has time-sensitive value
- You want viral discovery incentives

---

## linear

Price changes at a constant rate per token.

### Linear Decrease

**Use case**: Promotional launches, clearance sales

```
price = base - (supply × rate)
// Floors at minimum_price
```

**Configuration**:
```json
{
  "pricing": {
    "model": "linear",
    "direction": "decrease",
    "base": 10000,
    "rate": 10,
    "minimum": 100
  }
}
```

**Price Schedule** (base=10,000, rate=10, min=100):

| Supply | Price (sats) |
|--------|-------------|
| 0 | 10,000 |
| 100 | 9,000 |
| 500 | 5,000 |
| 900 | 1,000 |
| 990+ | 100 (floor) |

### Linear Increase

**Use case**: Scarcity-driven, limited editions

```
price = base + (supply × rate)
```

**Configuration**:
```json
{
  "pricing": {
    "model": "linear",
    "direction": "increase",
    "base": 1000,
    "rate": 50,
    "maximum": 100000
  }
}
```

**Price Schedule** (base=1,000, rate=50):

| Supply | Price (sats) |
|--------|-------------|
| 0 | 1,000 |
| 100 | 6,000 |
| 500 | 26,000 |
| 1,000 | 51,000 |

---

## exponential

Dramatic price changes. Use carefully.

### Exponential Decay

**Use case**: Flash sales, extreme early-adopter rewards

```
price = base × (decay_rate ^ supply)
```

**Configuration**:
```json
{
  "pricing": {
    "model": "exponential",
    "direction": "decay",
    "base": 100000,
    "decay_rate": 0.99,
    "minimum": 100
  }
}
```

**Price Schedule** (base=100,000, decay=0.99):

| Supply | Price (sats) |
|--------|-------------|
| 0 | 100,000 |
| 50 | 60,577 |
| 100 | 36,603 |
| 200 | 13,398 |
| 500 | 657 |
| 1,000 | 100 (floor) |

### Exponential Growth

**Use case**: Extreme scarcity, auction-like dynamics

```
price = base × (growth_rate ^ supply)
```

**Configuration**:
```json
{
  "pricing": {
    "model": "exponential",
    "direction": "growth",
    "base": 100,
    "growth_rate": 1.01,
    "maximum": 1000000
  }
}
```

---

## bonding_curve

AMM-style pricing based on reserve ratio. Creates a liquid market.

**Use case**: Trading pairs, liquid tokens, continuous markets

```
price = reserve_balance / token_supply
```

**Configuration**:
```json
{
  "pricing": {
    "model": "bonding_curve",
    "reserve_ratio": 500000,
    "curve_type": "linear"
  }
}
```

**Key properties**:
- Buyers add to reserve, increasing price
- Sellers remove from reserve, decreasing price
- Always liquid (no order book needed)
- Price discovery is automatic

**Variants**:
- `linear` - Simple reserve/supply ratio
- `polynomial` - Steeper curves for more aggressive pricing
- `sigmoid` - S-curve with soft caps

---

## Choosing a Curve

### Decision Framework

```
Q: Do you want early buyers rewarded?
├── YES → sqrt_decay or exponential
│   └── Q: How dramatically?
│       ├── Moderate → sqrt_decay
│       └── Dramatic → exponential
└── NO → fixed or linear

Q: Is your content time-sensitive?
├── YES → sqrt_decay (content variant)
└── NO → fixed

Q: Do you need ongoing liquidity?
├── YES → bonding_curve
└── NO → Any curve

Q: Is this equity/investment?
├── YES → sqrt_decay (investment variant)
└── NO → Content curves
```

### Recommended by Use Case

| Use Case | Recommended Curve |
|----------|------------------|
| **Equity/Crowdfunding** | sqrt_decay (investment) |
| **Premium Content** | sqrt_decay (content) |
| **API Credits** | fixed or linear |
| **Blog Paywall** | fixed (500 sats) |
| **NFT Collection** | linear_increase |
| **Flash Sale** | exponential decay |
| **Trading Token** | bonding_curve |
| **Membership** | fixed |

---

## HTTP 402 Headers

When serving a 402 response, include the pricing model:

```http
HTTP/1.1 402 Payment Required
X-$402-Version: 2.0.0
X-$402-Price: 4500
X-$402-Token: $example.com/$blog
X-$402-Model: sqrt_decay
X-$402-Treasury: 499000000
```

The `X-$402-Model` header tells clients which curve is in use.

---

## Discovery Document

Pricing details in `/.well-known/$402.json`:

```json
{
  "$402_version": "2.0.0",
  "root": {
    "path": "$example.com",
    "pricing": {
      "model": "sqrt_decay",
      "variant": "investment",
      "base": 100000000,
      "treasury_initial": 500000000,
      "treasury_remaining": 423000000
    }
  }
}
```

---

## Implementation Notes

### Calculating Price

TypeScript implementation:

```typescript
interface PricingConfig {
  model: 'sqrt_decay' | 'fixed' | 'linear' | 'exponential' | 'bonding_curve';
  base: number;
  variant?: 'investment' | 'content';
  treasury?: number;
  supply?: number;
  rate?: number;
  minimum?: number;
  maximum?: number;
}

function calculatePrice(config: PricingConfig): number {
  switch (config.model) {
    case 'sqrt_decay':
      const denominator = config.variant === 'investment'
        ? config.treasury! + 1
        : config.supply! + 1;
      return Math.ceil(config.base / Math.sqrt(denominator));

    case 'fixed':
      return config.base;

    case 'linear':
      const price = config.base - (config.supply! * (config.rate || 0));
      return Math.max(price, config.minimum || 1);

    case 'exponential':
      const exp = config.base * Math.pow(config.rate || 0.99, config.supply!);
      return Math.max(Math.ceil(exp), config.minimum || 1);

    case 'bonding_curve':
      return Math.ceil(config.base / (config.supply! + 1));

    default:
      return config.base;
  }
}
```

### Updating After Purchase

After each purchase:
1. Decrement treasury (investment variant) OR increment supply (content variant)
2. Recalculate price
3. Update discovery document
4. Broadcast new price to stakers

---

## Custom Curves

Issuers can define custom curves using the formula field:

```json
{
  "pricing": {
    "model": "custom",
    "formula": "base * (1 + log(supply + 1))",
    "base": 1000,
    "variables": {
      "supply": "current_supply"
    }
  }
}
```

**Supported functions**: `sqrt`, `log`, `exp`, `pow`, `sin`, `cos`, `floor`, `ceil`

**Custom curves require validation** to ensure:
- Price is always positive
- Formula is deterministic
- No division by zero possible

---

## Migration Between Curves

To change a curve after launch:

1. **Snapshot** current holdings
2. **Announce** new curve with effective date
3. **Calculate** fair value adjustment
4. **Deploy** new pricing parameters
5. **Grandfather** existing holders if needed

**Note**: Changing curves after launch affects trust. Do it sparingly and transparently.

---

## References

- [PROTOCOL_VISION.md](PROTOCOL_VISION.md) - Canonical $402 protocol
- [$402-STANDARD.md]($402-STANDARD.md) - HTTP 402 implementation spec
- [lib/pricing.ts](../lib/pricing.ts) - Reference implementation

---

*The $402 Pricing Curves Library is maintained by the PATH402.com community.*
