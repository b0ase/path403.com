# Bot API Specification

**Version**: 1.0.0
**Date**: February 3, 2026
**Status**: Draft

## Overview

This document specifies the bot-friendly APIs for participating in the $402 speculative content market. Bots are first-class participants—they can scan, sample, buy, hold, and resell content tokens faster than humans.

## Design Principles

1. **Speed first** — Bots need sub-100ms responses
2. **Bulk operations** — Scan hundreds of inscriptions per request
3. **Streaming** — Real-time events, not polling
4. **Stateless auth** — Signature-based, no sessions
5. **Agenda filtering** — Filter by worldview alignment

## Authentication

### Signature-Based Auth

All authenticated requests require a wallet signature:

```http
POST /api/v1/buy
Authorization: $402-Sig <pubkey>:<signature>:<timestamp>
Content-Type: application/json
```

Signature format:
```
message = HTTP_METHOD + PATH + TIMESTAMP + BODY_HASH
signature = sign(message, private_key)
```

### Example (Node.js)

```javascript
const crypto = require('crypto');
const bsv = require('bsv');

function signRequest(method, path, body, privateKey) {
  const timestamp = Date.now();
  const bodyHash = crypto.createHash('sha256')
    .update(JSON.stringify(body))
    .digest('hex');

  const message = `${method}${path}${timestamp}${bodyHash}`;
  const signature = bsv.Message.sign(message, privateKey);
  const pubkey = privateKey.toPublicKey().toString();

  return {
    header: `$402-Sig ${pubkey}:${signature}:${timestamp}`,
    timestamp
  };
}
```

## Discovery APIs

### Scan New Inscriptions

```http
GET /api/v1/inscriptions/new
  ?since={timestamp}
  &limit={100}
  &agenda[]={libertarian}
  &agenda[]={crypto-bullish}
  &topics[]={bitcoin}
  &min_controversy={50}
  &language={en}
```

**Response:**
```json
{
  "inscriptions": [
    {
      "inscription_id": "abc123...",
      "path": "$example.com/$blog/$btc-prediction",
      "created_at": "2026-02-03T12:00:00Z",
      "metadata": {
        "title": "BTC $500k by 2027",
        "description": "Analysis based on...",
        "author": "$satoshi",
        "tags": ["bitcoin", "prediction"]
      },
      "signals": {
        "agenda": ["crypto-bullish"],
        "sentiment": "bullish",
        "controversy": 75
      },
      "pricing": {
        "model": "sqrt_decay",
        "current_price_sats": 4850,
        "base": 5000,
        "supply_sold": 150,
        "velocity_1h": 45
      },
      "sample_url": "/api/v1/sample/abc123..."
    }
  ],
  "cursor": "next_page_token",
  "total_new": 1547
}
```

### Bulk Sample

```http
POST /api/v1/sample/bulk
Content-Type: application/json

{
  "inscription_ids": [
    "abc123...",
    "def456...",
    "ghi789..."
  ],
  "preview_percentage": 15
}
```

**Response:**
```json
{
  "samples": [
    {
      "inscription_id": "abc123...",
      "path": "$example.com/$blog/$btc-prediction",
      "preview": "# BTC $500k by 2027\n\nBased on my analysis...",
      "preview_percentage": 15,
      "full_size_bytes": 4500,
      "content_type": "text/markdown",
      "metadata": { ... },
      "signals": { ... },
      "pricing": { ... }
    }
  ],
  "failed": []
}
```

### Trending Feed

```http
GET /api/v1/trending
  ?timeframe={1h|24h|7d}
  &agenda[]={libertarian}
  &sort={velocity|volume|price_change}
  &limit={50}
```

**Response:**
```json
{
  "trending": [
    {
      "inscription_id": "abc123...",
      "path": "$example.com/$blog/$btc-prediction",
      "metrics": {
        "purchases_1h": 245,
        "volume_sats_1h": 1250000,
        "price_change_1h_pct": 12.5,
        "unique_buyers_1h": 89
      },
      "current_price_sats": 4850,
      "agenda_match_score": 0.92
    }
  ]
}
```

## Trading APIs

### Buy Tokens

```http
POST /api/v1/buy
Authorization: $402-Sig <pubkey>:<signature>:<timestamp>
Content-Type: application/json

{
  "inscription_id": "abc123...",
  "amount_tokens": 1000,
  "max_price_sats": 5000,
  "slippage_bps": 100
}
```

**Response:**
```json
{
  "success": true,
  "tx_id": "bsv:xyz789...",
  "tokens_acquired": 1000,
  "total_cost_sats": 4850000,
  "avg_price_sats": 4850,
  "new_balance": 1000,
  "new_supply_sold": 1150,
  "new_price_sats": 4720
}
```

### Bulk Buy

```http
POST /api/v1/buy/bulk
Authorization: $402-Sig <pubkey>:<signature>:<timestamp>
Content-Type: application/json

{
  "orders": [
    {
      "inscription_id": "abc123...",
      "amount_tokens": 1000,
      "max_price_sats": 5000
    },
    {
      "inscription_id": "def456...",
      "amount_tokens": 500,
      "max_price_sats": 2000
    }
  ],
  "total_budget_sats": 10000000,
  "fail_strategy": "partial"
}
```

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "inscription_id": "abc123...",
      "status": "filled",
      "tokens_acquired": 1000,
      "cost_sats": 4850000
    },
    {
      "inscription_id": "def456...",
      "status": "filled",
      "tokens_acquired": 500,
      "cost_sats": 950000
    }
  ],
  "total_spent_sats": 5800000,
  "remaining_budget_sats": 4200000
}
```

### Sell Tokens

```http
POST /api/v1/sell
Authorization: $402-Sig <pubkey>:<signature>:<timestamp>
Content-Type: application/json

{
  "inscription_id": "abc123...",
  "amount_tokens": 500,
  "min_price_sats": 4000
}
```

**Response:**
```json
{
  "success": true,
  "tx_id": "bsv:sell123...",
  "tokens_sold": 500,
  "total_received_sats": 2100000,
  "avg_price_sats": 4200,
  "remaining_balance": 500
}
```

### List Orders (Order Book)

```http
GET /api/v1/orderbook/{inscription_id}
```

**Response:**
```json
{
  "inscription_id": "abc123...",
  "bids": [
    { "price_sats": 4200, "amount": 5000, "total_sats": 21000000 },
    { "price_sats": 4100, "amount": 10000, "total_sats": 41000000 }
  ],
  "asks": [
    { "price_sats": 4500, "amount": 2000, "total_sats": 9000000 },
    { "price_sats": 4600, "amount": 8000, "total_sats": 36800000 }
  ],
  "spread_sats": 300,
  "spread_pct": 6.67
}
```

## Portfolio APIs

### Get Holdings

```http
GET /api/v1/holdings
Authorization: $402-Sig <pubkey>:<signature>:<timestamp>
  ?include_pricing={true}
  &include_pnl={true}
```

**Response:**
```json
{
  "holdings": [
    {
      "inscription_id": "abc123...",
      "path": "$example.com/$blog/$btc-prediction",
      "balance": 1000,
      "avg_cost_sats": 4850,
      "current_price_sats": 5200,
      "unrealized_pnl_sats": 350000,
      "unrealized_pnl_pct": 7.2,
      "agenda": ["crypto-bullish"]
    }
  ],
  "total_value_sats": 5200000,
  "total_cost_sats": 4850000,
  "total_pnl_sats": 350000,
  "total_pnl_pct": 7.2
}
```

### Portfolio Performance

```http
GET /api/v1/portfolio/performance
Authorization: $402-Sig <pubkey>:<signature>:<timestamp>
  ?timeframe={24h|7d|30d|all}
```

**Response:**
```json
{
  "timeframe": "7d",
  "starting_value_sats": 10000000,
  "ending_value_sats": 12500000,
  "pnl_sats": 2500000,
  "pnl_pct": 25.0,
  "best_performer": {
    "path": "$example.com/$blog/$btc-prediction",
    "pnl_pct": 45.0
  },
  "worst_performer": {
    "path": "$example.com/$news/$bear-case",
    "pnl_pct": -12.0
  },
  "by_agenda": {
    "crypto-bullish": { "allocation_pct": 60, "pnl_pct": 30 },
    "libertarian": { "allocation_pct": 40, "pnl_pct": 15 }
  }
}
```

## Streaming APIs

### WebSocket Events

```javascript
const ws = new WebSocket("wss://pathd.example.com/v1/stream");

// Subscribe to events
ws.send(JSON.stringify({
  "action": "subscribe",
  "channels": [
    "inscriptions:new",
    "inscriptions:trending",
    "trades:abc123...",
    "agenda:crypto-bullish"
  ],
  "filters": {
    "min_controversy": 50,
    "languages": ["en"]
  }
}));

// Receive events
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case "inscription:new":
      // New content inscribed
      handleNewInscription(data);
      break;

    case "trade:executed":
      // Someone bought/sold
      handleTrade(data);
      break;

    case "price:changed":
      // Price moved significantly
      handlePriceChange(data);
      break;

    case "trending:alert":
      // High velocity detected
      handleTrendingAlert(data);
      break;
  }
};
```

### Event Types

| Event | Description | Fields |
|-------|-------------|--------|
| `inscription:new` | New content inscribed | `path`, `metadata`, `signals`, `pricing` |
| `trade:executed` | Buy/sell completed | `path`, `side`, `amount`, `price`, `buyer/seller` |
| `price:changed` | >5% price move | `path`, `old_price`, `new_price`, `change_pct` |
| `trending:alert` | High purchase velocity | `path`, `velocity`, `unique_buyers` |
| `agenda:match` | Content matches subscribed agenda | `path`, `match_score`, `signals` |

## Usage Access APIs (v0)

These endpoints provide **usage-based access** for dynamic streams (video feeds, APIs, compute).
They are **session-based** (require `x-wallet-handle`) rather than `$402-Sig` auth.

### Get Current Access Window

```http
GET /api/tokens/{address}/stream
x-wallet-handle: alice
```

**Response:**
```json
{
  "token": {
    "address": "$alice",
    "access_mode": "usage"
  },
  "active": false,
  "expires_at": null,
  "total_paid_sats": 0,
  "usage_pricing": {
    "unit_ms": 1000,
    "price_sats_per_unit": 100,
    "min_payment_sats": 100,
    "max_payment_sats": 100000,
    "grace_ms": 5000,
    "prepay_ms": 60000,
    "payment_address": "1ISSUER...",
    "accepted_networks": ["bsv"]
  }
}
```

### Pay to Extend Access Window

```http
POST /api/tokens/{address}/stream
x-wallet-handle: alice
Content-Type: application/json

{
  "payment_tx_id": "bsv_txid..."
}
```

**Success Response:**
```json
{
  "success": true,
  "token": {
    "address": "$alice",
    "access_mode": "usage"
  },
  "paid_sats": 500,
  "grant_ms": 5000,
  "expires_at": "2026-02-03T22:10:00.000Z",
  "usage_pricing": {
    "unit_ms": 1000,
    "price_sats_per_unit": 100,
    "accepted_networks": ["bsv"]
  },
  "grace_ms": 5000
}
```

**Notes**
- If `access_mode` is `token` or `hybrid`, the caller must hold the token.
- `payment_tx_id` is validated on-chain against the issuer’s payment address.
- `402` is returned when payment is missing or token ownership is required.

## Analytics APIs

### Content Performance

```http
GET /api/v1/analytics/content/{inscription_id}
  ?timeframe={24h}
```

**Response:**
```json
{
  "inscription_id": "abc123...",
  "timeframe": "24h",
  "metrics": {
    "views": 5420,
    "samples": 1250,
    "purchases": 89,
    "unique_buyers": 67,
    "conversion_rate_pct": 7.1,
    "volume_sats": 4250000,
    "price_high_sats": 5500,
    "price_low_sats": 4200,
    "price_current_sats": 5100
  },
  "buyer_demographics": {
    "by_agenda": {
      "crypto-bullish": 45,
      "libertarian": 30,
      "unknown": 14
    }
  }
}
```

### Agenda Heatmap

```http
GET /api/v1/analytics/agenda-heatmap
  ?timeframe={7d}
```

**Response:**
```json
{
  "timeframe": "7d",
  "agendas": [
    {
      "agenda": "crypto-bullish",
      "total_volume_sats": 125000000,
      "total_inscriptions": 450,
      "avg_price_sats": 3500,
      "top_paths": [
        "$example.com/$blog/$btc-prediction",
        "$news.com/$crypto/$eth-analysis"
      ]
    },
    {
      "agenda": "climate-action",
      "total_volume_sats": 45000000,
      "total_inscriptions": 180,
      "avg_price_sats": 2800,
      "top_paths": [ ... ]
    }
  ]
}
```

## Rate Limits

| Endpoint Type | Rate Limit | Burst |
|---------------|------------|-------|
| Discovery (GET) | 100/min | 20 |
| Samples | 500/min | 50 |
| Trading (POST) | 30/min | 10 |
| Streaming | 5 connections | - |
| Analytics | 60/min | 10 |

Higher limits for staked nodes.

## Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| `E_INSUFFICIENT_FUNDS` | Not enough sats | Deposit more |
| `E_SLIPPAGE_EXCEEDED` | Price moved too much | Retry with higher slippage |
| `E_INSCRIPTION_NOT_FOUND` | Invalid inscription ID | Check ID |
| `E_RATE_LIMITED` | Too many requests | Backoff |
| `E_INVALID_SIGNATURE` | Auth failed | Re-sign request |
| `E_AGENDA_MISMATCH` | Content doesn't match filter | Expected behavior |

## Bot Strategy Examples

### Early Bird Strategy

Buy new inscriptions within 60 seconds of creation:

```python
async def early_bird_strategy(ws):
    async for event in ws:
        if event["type"] == "inscription:new":
            # Check agenda alignment
            if matches_my_agenda(event["signals"]["agenda"]):
                # Check sample quality
                sample = await get_sample(event["inscription_id"])
                if quality_score(sample) > 0.7:
                    # Buy immediately
                    await buy(
                        inscription_id=event["inscription_id"],
                        amount=1000,
                        max_price=event["pricing"]["current_price_sats"] * 1.1
                    )
```

### Momentum Strategy

Buy when velocity exceeds threshold:

```python
async def momentum_strategy(ws):
    async for event in ws:
        if event["type"] == "trending:alert":
            if event["velocity"] > 10:  # 10+ purchases/hour
                # Check if price still reasonable
                current = await get_pricing(event["inscription_id"])
                if current["price_sats"] < current["base"] * 0.8:
                    # Still early, buy
                    await buy(
                        inscription_id=event["inscription_id"],
                        amount=500
                    )
```

### Agenda Dominance Strategy

Systematically buy content aligned with agenda:

```python
async def agenda_dominance_strategy():
    # Scan all new content matching our agenda
    inscriptions = await scan_new(
        agenda=["our-worldview"],
        since=one_hour_ago,
        min_controversy=30  # Want engaging content
    )

    # Rank by potential reach
    ranked = sorted(inscriptions, key=lambda x: x["controversy"] * x["author_reach"])

    # Buy top 10
    for inscription in ranked[:10]:
        await buy(
            inscription_id=inscription["inscription_id"],
            amount=2000  # Enough to be a significant holder
        )
```

### Hostile Takeover Strategy (Censorship Defense)

Race to acquire 51%+ of threatening content to control/embargo:

```python
async def hostile_takeover_strategy(ws):
    async for event in ws:
        if event["type"] == "inscription:new":
            # Check if content is THREATENING to our agenda
            if threatens_our_agenda(event["signals"], event["sample"]):
                # Calculate cost to acquire 51%
                supply = event["supply"]["total"]
                target = int(supply * 0.51)
                cost = estimate_cost(event["pricing"], target)

                if cost < MAX_SUPPRESSION_BUDGET:
                    # Race to acquire control
                    await buy(
                        inscription_id=event["inscription_id"],
                        amount=target,
                        max_price=cost * 1.5,  # Willing to overpay
                        urgency="high"
                    )

                    # If successful, embargo
                    if await check_stake(event["inscription_id"]) >= 0.51:
                        await vote_embargo(event["inscription_id"])
```

### Content Preservation Strategy (Counter-Censorship)

Prevent hostile takeovers by buying before suppressors:

```python
async def preservation_strategy(ws):
    async for event in ws:
        if event["type"] == "trade:executed":
            # Detect aggressive accumulation (possible takeover)
            if event["amount"] > 10000 and event["side"] == "buy":
                accumulator = event["buyer"]

                # Check if accumulator is a known suppressor
                if is_hostile_actor(accumulator):
                    # Counter-buy to prevent 51% control
                    current_stake = await get_stake(event["inscription_id"], accumulator)
                    if current_stake > 0.3:  # They're getting close
                        # Buy enough to block majority
                        blocking_amount = int(event["supply"]["total"] * 0.2)
                        await buy(
                            inscription_id=event["inscription_id"],
                            amount=blocking_amount
                        )
```

### Narrative Distribution Strategy (Propaganda Spread)

Sell your content to opposing camps to spread your narrative:

```python
async def narrative_distribution_strategy():
    # Find our content that opposing agendas haven't bought yet
    our_content = await get_holdings(agenda=["our-worldview"])

    for content in our_content:
        # Check who's buying
        buyers = await get_buyer_demographics(content["inscription_id"])

        # Find underrepresented opposing agendas
        for opposing_agenda in OPPOSING_AGENDAS:
            if buyers.get(opposing_agenda, 0) < TARGET_PENETRATION:
                # Lower the price or promote to attract them
                # (They buy our propaganda = they become informed by our narrative)
                await promote_to_agenda(
                    inscription_id=content["inscription_id"],
                    target_agenda=opposing_agenda
                )
```

---

## SDKs

### JavaScript/TypeScript

```bash
npm install @path402/bot-sdk
```

```typescript
import { Path402Bot } from '@path402/bot-sdk';

const bot = new Path402Bot({
  privateKey: process.env.BSV_PRIVATE_KEY,
  nodeUrl: 'https://pathd.example.com'
});

// Subscribe to new inscriptions
bot.on('inscription:new', async (inscription) => {
  if (bot.matchesAgenda(inscription, ['crypto-bullish'])) {
    await bot.buy(inscription.id, { amount: 1000 });
  }
});

// Start listening
await bot.connect();
```

### Python

```bash
pip install path402-bot
```

```python
from path402_bot import Bot

bot = Bot(
    private_key=os.environ['BSV_PRIVATE_KEY'],
    node_url='https://pathd.example.com'
)

@bot.on('inscription:new')
async def handle_new(inscription):
    if inscription.matches_agenda(['crypto-bullish']):
        await bot.buy(inscription.id, amount=1000)

bot.run()
```

---

## Related Documents

- [CONTENT_INSCRIPTION_SPEC.md](CONTENT_INSCRIPTION_SPEC.md) - How to inscribe content
- [PATHD_ARCHITECTURE.md](PATHD_ARCHITECTURE.md) - Node architecture
- [TREE_MODEL.md](TREE_MODEL.md) - The 6 rules

---

**Last Updated**: February 3, 2026
