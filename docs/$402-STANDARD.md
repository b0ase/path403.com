# The $402 Standard

**Version**: 3.1.0 (BRC-Aligned)
**Status**: Living Document
**Reference Implementation**: [PATH402.com](https://path402.com)
**Canonical Vision**: [PROTOCOL_VISION.md](PROTOCOL_VISION.md)
**BRC Alignment**: [BRC_ALIGNMENT.md](BRC_ALIGNMENT.md)

## Abstract

The $402 standard defines a protocol for tokenized attention markets and content serving, strictly built upon the Bitcoin SV BRC ecosystem. It enables:

1.  **Content Tokenization**: Turn URL paths into shareholder businesses using **BRC-105** payment challenges.
2.  **Authenticated Sessions**: Secure, peer-to-peer data exchange using **BRC-103/104**.
3.  **Decentralized Discovery**: Topic-based state discovery using **BRC-22/24** overlays.
4.  **Operator Incentives (EARN)**: A unique Proof-of-Serve layer for ensuring network quality.

## Core Concepts

### 1. The UX Convention: `$path`

To users, the protocol presents as a URL convention:

```
$example.com                    → Site-level entity
$example.com/$blog              → Blog section entity
```

**Note**: This `$` prefix is a **non-normative UX convention** for humans. The underlying technical mechanism is the standard HTTP 402 handshake (BRC-105).

### 2. The Wallet Interface (BRC-100)

Applications accessing $402 content interact with wallets via the **BRC-100** standard (Vendor-neutral Wallet-to-Application Interface). This handles identity, signing, and transaction creation.

---

## Payments (BRC-105)

When a client requests paid content, the server MUST return an HTTP 402 response conforming to **BRC-105**.

### The Handshake

**1. Client Request**
```http
GET /premium-content HTTP/1.1
Host: example.com
Accept: application/json
```

**2. Server Challenge (HTTP 402)**
The server returns `402 Payment Required` with `BRC-105` specific headers/body defining the payment terms.

```http
HTTP/1.1 402 Payment Required
Content-Type: application/json
x-bsv-payment-amount: 5000
x-bsv-payment-destination: 1BrbnQon4uZPSxNwt19ozwtgHPDbgvaeD1
x-bsv-payment-desc: "Access to premium blog post"
```

*Note: Servers MAY support legacy BRC-41 headers for backward compatibility, but BRC-105 is normative.*

### Payment Instruments

The "ticket" for access can be any spendable instrument validated by the server, including:
*   BSV Satoshis (standard)
*   **$402 Tokens** (BSV-21 PoW20)
*   Access Tokens (minted by the creator)

The server defines accepted instruments in the 402 response capabilities.

---

## Authentication (BRC-103/104)

For high-value content, subscriptions, or "Proof of Serve" validation, mutual authentication is REQUIRED.

1.  **BRC-103**: Defines the peer-to-peer mutual authentication handshake and certificate exchange.
2.  **BRC-104**: Maps this handshake onto HTTP.

### Session Establishment

Clients MUST establish a session via `/.well-known/auth` before accessing high-security $paths.

```http
POST /.well-known/auth HTTP/1.1
Content-Type: application/bsv-auth-request
...
```

This ensures "paid" implies "paid + authenticated," preventing replay attacks and ambiguous identity.

---

## Discovery & State (BRC-22/24 Overlays)

$path state (pricing, ownership, hierarchy) is indexed via **Overlay Networks**.

### Indexing (BRC-22)
Nodes accept and validate topic-relevant UTXO state via authenticated `/submit` endpoints. This allows the network to track the "Shareholder Register" for any given $path.

### Lookup (BRC-24)
Clients query state via authenticated `/lookup`.
*   **Paid Lookup**: Discovery endpoints MAY themselves be paywalled (using BRC-105) to prevent spam and fund infrastructure.

---

## Operator Incentives: EARN (PoW20)

This layer is **additive** to the BRC stack. It incentivizes operators to run reliable infrastructure.

### The Problem
BRC-22/24 define *how* to exchange state, but not *why* an operator should remain online and honest.

### The Solution: Proof of Serve
Operators (Facilitators) earn reputation and revenue shares by:
1.  **Serving Content**: Successfully identifying and serving assets.
2.  **Validating Payments**: Running BRC-105 verification.
3.  **Indexing State**: Providing accurate BRC-24 lookups.

*This mechanism will be proposed as a standalone BRC candidate.*

---

## $402 Token Details (The Asset)

"The Token" refers to **$402**, a PoW20 Hash-to-Mint token on BSV-21 (BRC-114 Proof of Indexing).

*   **Supply**: 21,000,000 (mirrors Bitcoin exactly)
*   **Decimals**: 8 (same as Bitcoin satoshis)
*   **Distribution**: 100% mined, 0% pre-mine, 50 tokens per mint, halving every 210,000 mints
*   **Utility**: Stake $402 + complete $401 KYC to earn 100% of serving revenue (proportional to stake)

*Note: The legacy $PATH402 BSV-20 equity token (1B supply) has been deprecated. $402 is the only protocol token.*

---

## Security Considerations

### 0-Conf Policy
"Transaction arrives" does NOT automatically mean "Valid". Facilitators MUST enforce a 0-conf risk policy:
*   **Micro-payments (<$1)**: Accept on mempool arrival (instant).
*   **Macro-payments (>$10)**: Require 1 confirmation or trusted BRC-103 peer channel.
*   **Double-Spend Detection**: Facilitators MUST monitor mempool for replacement attempts.

### Domain Verification
Issuers MUST bind their Identity to their `$path` using the procedures defined in BRC-103 (Identity) and Domain Keys.

---

## Reference Implementations

| Component | specification | Role |
|-----------|---------------|------|
| **Wallet** | BRC-100 | Manage keys, sign txs |
| **Auth** | BRC-103/104 | Establish trust |
| **Payment** | BRC-105 | Monetize endpoints |
| **Index** | BRC-22/24 | Discover state |
| **Client** | path402d | Reference BRC-100 Application |

---

*This standard complies with the Bitcoin SV Technical Standards Committee recommendations.*
