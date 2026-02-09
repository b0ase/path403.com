# Content Inscription Specification

**Version**: 1.0.0
**Date**: February 3, 2026
**Status**: Draft

## Overview

This document specifies how creators inscribe **access tokens** (leaves) onto the $402 tree. Each inscription creates a tradeable bearer share representing **access rights**, not necessarily the content itself. The content can be a live stream, a dynamic API, or an off-chain feed that changes over time.

**Pointer-first principle:** inscriptions are **pointers + policy**, not content blobs. Embedding data on-chain is optional and only used when you explicitly want immutable content.

## Inscription Format

### Minimal Inscription (Pointer-Only, Recommended)

```json
{
  "p": "$402",
  "op": "inscribe",
  "path": "$example.com/$blog/$my-article",
  "parent": "$example.com/$blog",
  "class": "access",
  "access_mode": "hybrid",
  "access_url": "https://example.com/blog/my-article",
  "pricing": {
    "model": "sqrt_decay",
    "base": 1000
  }
}
```

### Full Inscription (Pointer-Only + Metadata)

```json
{
  "p": "$402",
  "version": "1.0",
  "op": "inscribe",
  "path": "$example.com/$blog/$my-article",
  "parent": "$example.com/$blog",
  "parent_share_bps": 5000,

  "class": "access",
  "access_url": "https://example.com/blog/my-article",

  "metadata": {
    "title": "My Article Title",
    "description": "One-line summary for bots",
    "author": "$author.handle",
    "created_at": "2026-02-03T12:00:00Z",
    "tags": ["economics", "bitcoin", "prediction"],
    "language": "en"
  },

  "pricing": {
    "model": "sqrt_decay",
    "base": 1000,
    "floor": 10,
    "ceiling": 100000
  },

  "usage_pricing": {
    "enabled": true,
    "unit_ms": 1000,
    "price_sats_per_unit": 100,
    "prepay_ms": 60000,
    "grace_ms": 2000,
    "min_payment_sats": 100
  },

  "supply": {
    "total": 1000000,
    "available": 500000,
    "parent_allocation": 500000
  },

  "signals": {
    "agenda": ["libertarian", "pro-crypto"],
    "sentiment": "bullish",
    "topics": ["monetary-policy", "defi"]
  }
}
```

## Field Reference

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `p` | string | Protocol identifier: `"$402"` |
| `op` | string | Operation: `"inscribe"` |
| `path` | string | Full $path including domain |
| `parent` | string | Parent $path (receives 50%) |
| `class` | string | `"access"` for pointer-only tokens (default) |
| `pricing` | object | Pricing curve definition |

### Access URL (Pointer-Only)

| Field | Type | Description |
|-------|------|-------------|
| `access_url` | string | URL where the content is served |

### Access Mode (Optional)

| Field | Type | Description |
|-------|------|-------------|
| `access_mode` | string | `token`, `usage`, `hybrid`, or `public` |

### On-Chain Content Object (Optional, $402-containers)

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | MIME type: `text/markdown`, `text/plain`, `application/json`, `image/png` |
| `encoding` | string | Character encoding: `utf-8`, `base64` |
| `data` | string | The content itself |
| `hash` | string | `sha256:` prefixed hash for verification |
| `size_bytes` | number | Content size |

### Metadata Object (Bot-Critical)

| Field | Type | Description | Bot Use |
|-------|------|-------------|---------|
| `title` | string | Human title | Display |
| `description` | string | One-line summary | Fast scan |
| `author` | string | Creator $handle | Reputation check |
| `created_at` | string | ISO 8601 timestamp | Freshness |
| `tags` | array | Topic tags | Filtering |
| `language` | string | ISO 639-1 code | Market targeting |

### Signals Object (Speculation-Critical)

| Field | Type | Description | Bot Use |
|-------|------|-------------|---------|
| `agenda` | array | Self-declared bias | Agenda matching |
| `sentiment` | string | `bullish`, `bearish`, `neutral` | Market signal |
| `topics` | array | Detailed topic taxonomy | Deep filtering |
| `controversy` | number | 0-100 controversy score | Viral potential |
| `exclusivity` | string | `public`, `limited`, `exclusive` | Scarcity signal |

## Content Types (Optional)

If you are using **pointer-only access tokens** (`class: "access"` + `access_url`), you can ignore this section. These content objects are only required when you choose the `$402-containers` extension to embed data on-chain.

### Text Content

```json
{
  "content": {
    "type": "text/markdown",
    "encoding": "utf-8",
    "data": "# Article\n\nContent here..."
  }
}
```

### Structured Data

```json
{
  "content": {
    "type": "application/json",
    "encoding": "utf-8",
    "data": "{\"predictions\": [{\"asset\": \"BTC\", \"target\": 150000}]}"
  }
}
```

### Binary/Media (Base64)

```json
{
  "content": {
    "type": "image/png",
    "encoding": "base64",
    "data": "iVBORw0KGgo...",
    "hash": "sha256:def456..."
  }
}
```

### Reference (Off-Chain Content)

```json
{
  "content": {
    "type": "reference",
    "url": "ipfs://Qm...",
    "hash": "sha256:ghi789...",
    "size_bytes": 15000000
  }
}
```

## Usage Pricing (Streaming / Metered Access)

Usage pricing is **separate** from the token price. Tokens confer access rights; usage pricing charges for **consumption over time**. This enables both ultra-high-frequency services (e.g. electricity metering) and long-window services (e.g. hourly live streams).

```json
{
  "usage_pricing": {
    "enabled": true,
    "unit_ms": 10,
    "price_sats_per_unit": 1,
    "prepay_ms": 5000,
    "grace_ms": 500,
    "min_payment_sats": 10,
    "max_payment_sats": 1000000,
    "accepted_networks": ["bsv"]
  }
}
```

**Notes:**
- `unit_ms` defines the billing resolution (10ms, 1s, 1h, etc.)
- `price_sats_per_unit` defines the price per unit
- `prepay_ms` caps how far ahead a client can prepay
- `grace_ms` allows a short delay before cutting access
- This does **not** mint/burn tokens by default

## Pricing Strategies

### For Speculation

```json
{
  "pricing": {
    "model": "sqrt_decay",
    "base": 10000,
    "floor": 100
  }
}
```
- High base = early buyers get massive advantage
- Low floor = late mass adoption still possible

### For Viral Content

```json
{
  "pricing": {
    "model": "sqrt_decay",
    "base": 100,
    "floor": 1
  }
}
```
- Low base = accessible to many
- Price drops fast = mass distribution

### For Premium/Exclusive

```json
{
  "pricing": {
    "model": "fixed",
    "price": 50000
  }
}
```
- Fixed high price = no speculation, pure access

### For Predictions/Research

```json
{
  "pricing": {
    "model": "sqrt_decay",
    "base": 100000,
    "variable": "treasury_remaining"
  }
}
```
- Investment variant: price rises as treasury depletes
- Rewards early believers in the prediction

## One-Click Inscription Flow

### CLI Tool

```bash
# Install
npm install -g $402-inscribe

# Inscribe content
$402-inscribe \
  --path "$myblog.com/$articles/$prediction-btc-2027" \
  --file ./my-article.md \
  --base-price 5000 \
  --tags "bitcoin,prediction,2027" \
  --agenda "crypto-bullish"
```

### API Endpoint

```http
POST /api/inscribe
Content-Type: application/json
Authorization: Bearer <wallet-signature>

{
  "path": "$myblog.com/$articles/$prediction-btc-2027",
  "content": "# My Prediction\n\nBTC will reach...",
  "content_type": "text/markdown",
  "pricing": {
    "model": "sqrt_decay",
    "base": 5000
  },
  "metadata": {
    "title": "BTC 2027 Prediction",
    "tags": ["bitcoin", "prediction"],
    "agenda": ["crypto-bullish"]
  }
}
```

### Response

```json
{
  "success": true,
  "inscription_id": "abc123def456...",
  "path": "$myblog.com/$articles/$prediction-btc-2027",
  "tx_id": "bsv:xyz789...",
  "initial_price_sats": 5000,
  "tokens_available": 500000,
  "parent_allocation": 500000,
  "sample_url": "https://myblog.com/api/$402/sample/prediction-btc-2027"
}
```

## Sample Endpoint (Critical for Bots)

Every inscription SHOULD expose a free sample endpoint:

```http
GET /$402/sample/{path}
```

Returns truncated content for bot evaluation:

```json
{
  "path": "$myblog.com/$articles/$prediction-btc-2027",
  "inscription_id": "abc123...",
  "metadata": {
    "title": "BTC 2027 Prediction",
    "description": "Analysis predicting BTC at $500k by 2027",
    "author": "$satoshi",
    "created_at": "2026-02-03T12:00:00Z",
    "tags": ["bitcoin", "prediction"],
    "agenda": ["crypto-bullish"]
  },
  "sample": {
    "preview": "# BTC 2027 Prediction\n\nBased on my analysis of...",
    "preview_percentage": 10,
    "full_size_bytes": 4500
  },
  "pricing": {
    "model": "sqrt_decay",
    "current_price_sats": 4850,
    "supply_sold": 150,
    "supply_remaining": 499850
  },
  "signals": {
    "agenda": ["crypto-bullish"],
    "sentiment": "bullish",
    "controversy": 75
  }
}
```

## Verification

### Content Hash Verification

```python
import hashlib

# Verify content matches declared hash
content_bytes = inscription["content"]["data"].encode("utf-8")
computed_hash = "sha256:" + hashlib.sha256(content_bytes).hexdigest()
assert computed_hash == inscription["content"]["hash"]
```

### Parent Chain Verification

```python
# Verify parent exists and path is valid child
parent_inscription = fetch_inscription(inscription["parent"])
assert inscription["path"].startswith(parent_inscription["path"])
```

### Pricing Verification

```python
# Verify current price matches curve
from math import sqrt

base = inscription["pricing"]["base"]
supply = inscription["supply"]["total"] - inscription["supply"]["available"]
expected_price = base / sqrt(supply + 1)
assert abs(current_price - expected_price) < 1  # Within 1 sat
```

## Events

Inscriptions emit events for bot monitoring:

| Event | Description | Bot Action |
|-------|-------------|------------|
| `inscribed` | New content created | Evaluate + maybe buy |
| `purchased` | Someone bought tokens | Re-evaluate demand |
| `price_changed` | Price moved significantly | Arbitrage opportunity |
| `trending` | High purchase velocity | FOMO signal |

### WebSocket Feed

```javascript
const ws = new WebSocket("wss://pathd.example.com/events");

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "inscribed") {
    // New content - evaluate immediately
    evaluateAndMaybeBuy(data.path, data.metadata, data.signals);
  }

  if (data.type === "trending") {
    // High velocity - consider buying before price rises
    urgentBuy(data.path);
  }
};
```

## Token Control & Governance

### Control Thresholds

| Stake | Power | Use Case |
|-------|-------|----------|
| <50% | Access only | Normal user, can read content |
| **51%** | Majority control | Vote on serving policy, embargo |
| **67%** | Supermajority | Change pricing, access rules |
| **100%** | Complete control | Name any price, or refuse to serve |

### The Hostile Takeover Dynamic

Content creates a race between:
- **Distributors** — Want content to spread (sell to many)
- **Suppressors** — Want content to disappear (buy to 51%+)

```
Damaging article inscribed
         │
         ▼
Threatened party detects it
         │
         ▼
Race to 51% begins
         │
    ┌────┴────┐
    │         │
    ▼         ▼
SUPPRESSOR   PRESERVERS
WINS         WIN
    │         │
    ▼         ▼
Embargo      Wide
Content      Distribution
```

### Governance Operations

**Vote to Embargo (51%+ required)**:
```json
{
  "p": "$402",
  "op": "governance",
  "action": "embargo",
  "inscription_id": "abc123...",
  "reason": "Defamatory content",
  "votes_for_bps": 5500,
  "effective_at": "2026-02-03T12:00:00Z"
}
```

**Change Pricing (67%+ required)**:
```json
{
  "p": "$402",
  "op": "governance",
  "action": "set_price",
  "inscription_id": "abc123...",
  "new_pricing": {
    "model": "fixed",
    "price": 1000000000
  },
  "votes_for_bps": 7500
}
```

**Permanent Seal (100% required)**:
```json
{
  "p": "$402",
  "op": "governance",
  "action": "seal",
  "inscription_id": "abc123...",
  "policy": "never_serve",
  "owner": "1ABC...xyz"
}
```

### The Censorship Transparency

Unlike traditional censorship (invisible), $402 censorship is:

| Traditional | $402 |
|-------------|------|
| Content disappears | Content exists, serving blocked |
| No one knows why | On-chain embargo vote visible |
| Unknown actor | Buyers on record |
| No recourse | Counter-buyers can bid |

**The inscription is permanent. Only serving is controlled.**

Anyone can see:
- The original content (it's inscribed forever)
- Who bought it up (on-chain record)
- Why it was embargoed (governance inscription)
- How much they paid (transaction history)

### The Economics of Suppression

Suppressing content is **expensive**:

```
Content inscribed at base price 1000 sats
Supply: 1,000,000 tokens

To acquire 51% (510,000 tokens):
  First 100,000 tokens:  avg 950 sats  = 95,000,000 sats
  Next 200,000 tokens:   avg 800 sats  = 160,000,000 sats
  Next 210,000 tokens:   avg 650 sats  = 136,500,000 sats
  Total cost: ~391,500,000 sats (~$40,000 at 10k sats/$)

And the original writer got paid for every token sold.
```

**Suppression funds the creator.** The threatened party enriches the person they're trying to silence.

### Counter-Takeover Mechanics

If content is being accumulated by a hostile actor:

```http
POST /api/v1/alert/takeover
Content-Type: application/json

{
  "inscription_id": "abc123...",
  "accumulator": "1HOSTILE...",
  "current_stake_pct": 35,
  "velocity": "aggressive",
  "estimated_51_time_minutes": 15
}
```

Preservers can:
1. **Counter-buy** — Race to block 51%
2. **Fork** — Create a new inscription with same content
3. **Mirror** — Other nodes can cache and serve regardless

## Best Practices

### For Content Creators

1. **Declare your agenda** — Bots filter by agenda, hidden bias = less discovery
2. **Write clear descriptions** — Bots scan descriptions, not full content
3. **Tag accurately** — Wrong tags = wrong audience = no demand
4. **Price for your goal** — High base for speculation, low base for distribution
5. **Understand the game** — Your content may be bought by opponents to suppress OR supporters to spread

### The Narrative Game

**You SELL propaganda, not buy it.**

```
Goal: Spread your worldview
Method: Sell content to opposing camps
Effect: They PAY to become informed by YOUR narrative

Christians sell to Muslims  → Muslims buy → Muslims read Christian perspective
Muslims sell to Christians  → Christians buy → Christians read Islamic perspective

The buyer funds the narrative they're consuming.
The seller wins by DISTRIBUTING widely.
```

**Why opponents buy a little of each other's content:**
- Intelligence gathering (what are they saying?)
- Not enough to empower (minimal purchase)
- Monitoring, not adopting

### For Nodes

1. **Expose sample endpoints** — Bots need to evaluate before buying
2. **Stream events** — Real-time feeds attract bot traffic
3. **Cache aggressively** — Bots query frequently
4. **Rate limit fairly** — Don't block legitimate speculation

### For Bots

1. **Scan samples first** — Don't buy blind
2. **Check agenda alignment** — Only buy what serves your narrative
3. **Monitor velocity** — High purchase rate = rising price
4. **Diversify** — Spread across multiple agendas to hedge

---

## Related Documents

- [TREE_MODEL.md](TREE_MODEL.md) - The 6 rules of the $402 tree
- [PRICING_CURVES.md](PRICING_CURVES.md) - sqrt_decay and other models
- [BOT_API_SPEC.md](BOT_API_SPEC.md) - Full bot API reference

---

**Last Updated**: February 3, 2026
