# $pathd Specification

> A tiny daemon that lets private networks price access to files.

## Overview

`$pathd` is the minimal daemon that makes the $PATH protocol real. It sits on a node, intercepts HTTP requests to `$PATH` addresses, returns HTTP 402 Payment Required, accepts payment, and serves content — while tracking who served whom so money can flow.

## Position in the Stack

```
$PATH protocol (the idea)
├── $402 spec (the HTTP response format)
├── $pathd (the daemon — any machine can run it)    ← YOU ARE HERE
├── path402-mcp-server (the agent tool — any AI can use it)
└── b0ase.com/exchange (the hosted marketplace — easy mode)
```

## Mental Model

Think of `$pathd` as:

```
nginx + a wallet + a price curve + a tiny ledger
```

It does NOT:
- crawl
- index
- moderate
- host UIs
- manage identities
- decide legality
- optimise discovery

Those are someone else's problems later.

---

## Core Responsibilities (only 5)

### 1. HTTP Interceptor

The daemon listens on a local port:

```
127.0.0.1:4020
```

It proxies requests to actual content only if paid.

**Flow:**
```
Incoming request: GET /$blog/$my-post
If unpaid → return: HTTP/1.1 402 Payment Required
Include pricing metadata (see below)
```

### 2. Price Resolver

For every `$PATH`, the daemon must answer:

- base price
- current price (after decay)
- currency (SATs)
- issuer cut
- serving cut

No global oracle. No magic. Pricing data comes from:
- a local config file, or
- a contract embedded in the content itself

Example:
```json
{
  "path": "/$blog/$my-post",
  "base_price": 5,
  "curve": "sqrt_decay",
  "issued": 42,
  "issuer_share": 0.2,
  "server_share": 0.8
}
```

If the daemon can't price it, it refuses to serve it.

### 3. Wallet (bare minimum)

The daemon needs:
- a keypair
- the ability to receive SATs
- the ability to send SATs

That's it. No exchange integration, no fiat onramps, no recovery UX, no seed phrase coaching.

Inside a Tailnet, keys can be provisioned by policy, ephemeral, or rotated.

### 4. Payment Verifier

When a client wants content:

1. Client pays to the invoice/address supplied in the 402
2. Client retries request with proof (txid + signature)
3. Daemon verifies: payment amount, path correctness, freshness
4. If valid → serve content
5. If not → reject

### 5. Serving Ledger (tiny, local)

Each daemon tracks:
- what it served
- when
- to whom
- for which path

This enables:
- revenue splitting
- issuer payouts
- optional staking logic later

**Important:** No global state required. This can be:
- append-only log
- SQLite
- flat file

You're not building a bank.

---

## Wire Protocol

### 402 Response (unpaid request)

```http
HTTP/1.1 402 Payment Required
Content-Type: application/json
X-Path-Protocol: 1.0

{
  "path": "/$blog/$my-post",
  "price": 5,
  "currency": "SAT",
  "curve": "sqrt_decay",
  "supply": 42,
  "pay_to": "bsv:1abc...",
  "nonce": "xyz123",
  "expires": 1700000000,
  "issuer_share": 0.2,
  "server_share": 0.8
}
```

### Paid Request (with proof)

```http
GET /$blog/$my-post HTTP/1.1
Host: node.tailnet
X-Path-Payment: txid=abc123def...
X-Path-Signature: sig=...
X-Path-Nonce: xyz123
```

### Success Response

```http
HTTP/1.1 200 OK
Content-Type: text/markdown
X-Path-Token: eyJ...
X-Path-Served-By: alice-node-1

[content bytes]
```

The `X-Path-Token` is a JWT or similar that grants the buyer serving rights.

---

## Configuration File

`$pathd.yaml` — Minimal daemon configuration:

```yaml
# ----------------------------
# Node identity & wallet
# ----------------------------

node:
  name: alice-node-1
  listen: 127.0.0.1:4020

wallet:
  chain: BSV
  key_source: file
  key_file: /var/lib/pathd/keys/node.key
  receive_address: 1AliceBSVAddress...
  min_confirmations: 0

# ----------------------------
# Pricing defaults
# ----------------------------

pricing:
  currency: SAT
  default_curve: sqrt_decay
  issuer_share: 0.20
  server_share: 0.80

# ----------------------------
# Paths served by this node
# ----------------------------

paths:
  - path: "/$blog/$my-post"
    description: "Essay: Every URL Is a $PATH"
    content:
      type: file
      location: /var/lib/pathd/content/my-post.md
      sha256: 9f86d081884c7d659a2feaa0c55ad015...
    pricing:
      base_price: 5
      curve: sqrt_decay
      max_supply: null
    issuer:
      name: Richard Boase
      payout_address: 1BobAddr...
    permissions:
      resell: true
      rehost: true

# ----------------------------
# Serving & payout rules
# ----------------------------

serving:
  ledger: /var/lib/pathd/ledger.db
  payout_interval: 60s
  allow_third_party_serving: true

# ----------------------------
# Security & limits
# ----------------------------

limits:
  max_request_size: 100MB
  rate_limit: 100
  payment_timeout: 30s

logging:
  level: info
  file: /var/log/pathd/pathd.log
```

---

## Pricing Curves

### sqrt_decay (default, recommended)

```
price = base_price / sqrt(supply + 1)
```

Under this curve, every buyer except the last achieves positive ROI from serving revenue. This is a mathematical property, not a marketing claim.

### fixed

```
price = base_price
```

Same price for everyone.

### log_decay

```
price = base_price / log(supply + 2)
```

Gentler price decrease.

### linear_floor

```
price = max(floor_price, base_price - (supply * decay_rate))
```

Linear decrease to a minimum.

---

## Revenue Split

When content is served:

1. **Issuer share** (e.g., 20%) goes to the content creator
2. **Server share** (e.g., 80%) goes to whoever served it

If the buyer later serves to someone else, THEY get the server share for that transaction.

This creates a natural distribution network where serving is profitable.

---

## Content Storage (v0)

Absolutely minimal approach:

- content lives as a file on disk
- or a blob embedded in the daemon config
- referenced by path
- optionally hashed for integrity

No IPFS. No cloud. No redundancy logic.

**Why?** Because distribution emerges from serving, not from storage tech.

---

## What $pathd Does NOT Do

To keep scope minimal:

- ❌ No discovery
- ❌ No search
- ❌ No UI
- ❌ No rankings
- ❌ No moderation
- ❌ No token exchanges
- ❌ No KYC
- ❌ No dividends
- ❌ No "platform logic"

Those belong to separate daemons, separate contracts, separate businesses.

---

## The Litmus Test

If `$pathd` can do this, it's done:

> Two nodes in a Tailnet. One hosts content behind $PATH. The other pays, receives it, then serves it to a third. All payments settle automatically.

Everything else is garnish.

---

## Implementation Size

Roughly:
- 1 HTTP server
- 1 wallet lib
- 1 pricing function
- 1 payment verifier
- 1 log

This is:
- weeks, not months
- auditable
- forkable
- boring (good)

---

## Related Components

| Component | Purpose |
|-----------|---------|
| `$pathd` | The daemon (this spec) |
| `$402` | The HTTP response format |
| `path402-mcp-server` | AI agent tools |
| `b0ase.com/exchange` | Hosted marketplace |
| Tailscale/Headscale | Network layer (optional but recommended) |

---

## License

MIT
