# The X Protocol: Identity, Payment, and Conditions via DNS

**x401 / x402 / x403 — Three Subdomains for Any Website on Earth**

*Version 0.1 — February 12, 2026*
*Author: b0ase*

---

## Abstract

Every website needs three things it cannot currently provide: verified identity, native payment, and programmable conditions. Today, these require integrating third-party SDKs, managing API keys, handling compliance, and maintaining infrastructure.

The X Protocol proposes a different approach: **three standardised subdomains** — `x401`, `x402`, and `x403` — that any domain owner can activate by adding DNS records. No SDK. No API key. No code changes. Three CNAME records and your website has identity verification, content payment, and programmable conditions — all anchored to the Bitcoin blockchain.

This is the MX record model applied to the programmable web. Email didn't ask you to move to a new platform. It gave you a DNS record that connected your domain to the global mail network. The X Protocol does the same for identity, money, and logic.

---

## The Problem

### Websites Are Incomplete Machines

A modern website can serve content, but it cannot:

1. **Verify who is visiting** without trusting a third-party identity provider (Google, Facebook, Auth0) that can revoke access at any time
2. **Accept payment natively** without integrating Stripe, PayPal, or a crypto wallet SDK — each with its own terms, fees, and compliance burden
3. **Enforce conditions programmatically** without building custom middleware for access control, licensing, time-locks, geographic restrictions, or multi-party approvals

These three capabilities — identity, payment, conditions — are bolted on as afterthoughts. Every site re-implements them differently. There is no standard.

### The DNS Precedent

Email solved a similar problem thirty years ago. Before MX records, sending a message to someone on a different server required knowing their server's IP address. MX records created a universal lookup: "I want to send mail to user@domain.com" → DNS resolves the mail server → mail is delivered.

The sender doesn't need to know anything about the recipient's infrastructure. The DNS record IS the integration.

**The X Protocol applies this pattern to three new capabilities.**

---

## The Solution: Three Subdomains

### x401 — Identity

```
x401.example.com → CNAME → path401.com
```

**What it provides:**
- OAuth verification (Google, Twitter, GitHub, Microsoft, Apple, LinkedIn)
- $401 identity strand minting (on-chain proof of account ownership)
- Key chain management (root key, strand binding, attestation)
- Identity strength scoring (number of strands, attestation depth)
- Verification API: `GET x401.example.com/verify?handle=@user`

**What the site owner gets:**
- Know who your users are, cryptographically
- No identity database to maintain — proofs live on-chain
- Users bring their own identity (self-sovereign)
- Revenue share on strand mints originating from your domain

**What the user gets:**
- One identity across every x401-enabled site
- Strands minted on one site are valid everywhere
- No new password, no new account — just their key chain

### x402 — Payment

```
x402.example.com → CNAME → path402.com
```

**What it provides:**
- Content paywalling (any URL on the parent domain)
- Micropayments (as low as 1 satoshi)
- Token-gated access (hold $402 tokens to unlock content)
- Revenue distribution (automatic splits between creator, platform, protocol)
- Payment API: `POST x402.example.com/pay?resource=/premium-article`

**What the site owner gets:**
- Monetise any page, any asset, any API endpoint
- No payment processor integration — settlement via BSV (cheapest), or routed from ETH/SOL/Base
- Automatic revenue splits configured via x403 conditions
- Real-time earnings dashboard

**What the user gets:**
- Pay once, access everywhere (token-based, not session-based)
- Tokens are tradeable — sell access you no longer need
- Cross-site purchasing power (tokens work on any x402-enabled site)

### x403 — Conditions

```
x403.example.com → CNAME → path403.com
```

**What it provides:**
- Programmable access rules ("if identity has 3+ strands AND holds 100 $402 tokens → grant premium access")
- Time-locks ("content unlocks on March 1st 2026")
- Geographic conditions ("available in UK and EU only")
- Multi-party approvals ("requires 2 of 3 signers")
- Revenue conditions ("author gets 70%, platform gets 20%, protocol gets 10%")
- Conditions API: `GET x403.example.com/evaluate?rule=premium-access&user=0x...`

**What the site owner gets:**
- Business logic without backend code
- Composable rules that reference x401 (identity) and x402 (payment) state
- Auditable conditions — every evaluation is recorded
- Dynamic pricing, tiered access, loyalty rewards — all declarative

**What the user gets:**
- Transparent rules — can see exactly what's required before paying
- Conditions are on-chain and can't be changed retroactively
- Composable across sites (a condition on Site A can reference state on Site B)

---

## How It Works

### Step 1: Domain Owner Adds DNS Records

```dns
; Identity layer
x401.example.com.    CNAME    path401.com.

; Payment layer
x402.example.com.    CNAME    path402.com.

; Conditions layer
x403.example.com.    CNAME    path403.com.

; Discovery (optional but recommended)
_x-protocol.example.com.    TXT    "v=xp1; x401=1; x402=1; x403=1"
```

Total setup time: 2 minutes. Zero code changes.

### Step 2: Protocol Infrastructure Handles Requests

When a user visits `x402.example.com/pay?resource=/premium-article`:

1. DNS resolves `x402.example.com` → `path402.com` (via CNAME)
2. path402.com receives the request with the `Host: x402.example.com` header
3. Protocol extracts the parent domain (`example.com`) from the subdomain
4. Looks up the domain's configuration (pricing rules, revenue splits, conditions)
5. Processes the payment, records the transaction on-chain
6. Returns an access token to the user
7. User presents access token to `example.com/premium-article`
8. Site verifies token via `x402.example.com/verify?token=...`

### Step 3: Verification Is Permissionless

Any party can verify any claim:

```bash
# Verify an identity
curl x401.example.com/verify?handle=@alice

# Check payment status
curl x402.example.com/status?resource=/article&holder=0x...

# Evaluate a condition
curl x403.example.com/evaluate?rule=premium&user=0x...
```

No API key required. Verification is a public read operation. The blockchain is the source of truth.

### Step 4: Discovery

Other sites and AI agents discover X Protocol support via:

1. **DNS TXT record**: `_x-protocol.example.com` announces which layers are active
2. **Well-known endpoint**: `example.com/.well-known/x-protocol.json` provides configuration
3. **HTML meta tags**: `<link rel="x402" href="x402.example.com">` enables browser-native detection
4. **AI plugin manifest**: `example.com/.well-known/ai-plugin.json` references X Protocol endpoints

---

## The Economic Model

### Who Pays What

| Action | Cost | Who Pays | Who Earns |
|--------|------|----------|-----------|
| Mint identity strand | 1 penny | User | Site owner (referral) + Protocol |
| Access paywalled content | Variable (1 sat minimum) | User | Creator + Site owner + Protocol |
| Evaluate condition | Free | Nobody | Funded by payment layer |
| Run indexer node | Infrastructure costs | Node operator | $401/$402 PoW rewards |

### Revenue Flow

```
User pays 1 penny for content on example.com
        │
        ├── 70% → Content creator (configurable via x403)
        ├── 20% → example.com (domain owner referral)
        └── 10% → Protocol (indexer rewards, infrastructure)
```

Splits are configurable per domain via x403 conditions. The protocol take is transparent and on-chain.

### The Flywheel

1. Site owner adds three DNS records → site now has identity + payment + conditions
2. Users mint identity strands → each strand strengthens the network
3. Content gets paywalled → revenue flows to creators
4. Revenue attracts more creators → more content gets paywalled
5. More paywalled content → more users need x402 tokens
6. More token demand → higher token price → more miners index
7. More indexers → faster verification → better UX
8. Better UX → more site owners add DNS records

**The DNS record is the activation energy. Everything else is flywheel.**

---

## Cross-Chain Architecture

The X Protocol is chain-agnostic at the user layer and BSV-anchored at the settlement layer.

### User-Facing (Any Chain)

Users can interact with X Protocol using wallets from:
- **BSV** (native, cheapest settlement)
- **Ethereum** (via x402 bridge)
- **Solana** (via x402 bridge)
- **Base** (via x402 bridge)

### Settlement (BSV)

All proofs are permanently inscribed on BSV because:
- Lowest transaction fees (< 0.01 cent per inscription)
- Unbounded block size (no congestion, no fee spikes)
- Proof-of-work security (immutable once confirmed)
- SPV-friendly (lightweight verification without full node)

### Bridge Mechanics

```
User on Ethereum wants to pay for content:

1. User signs payment with ETH wallet
2. x402.example.com receives signed payment
3. Payment is verified on Ethereum
4. Proof is inscribed on BSV (permanent record)
5. Settlement occurs on cheapest available chain (usually BSV)
6. Access token issued to user
```

The user never needs to touch BSV directly. They pay with whatever chain they're on. Settlement routes to the cheapest option automatically.

---

## Security Model

### What's On-Chain (Trustless)

- Identity inscriptions (SHA-256 proofs of OAuth verification)
- Payment records (transaction hashes, amounts, recipients)
- Condition evaluations (rule + inputs + result, permanently recorded)
- Key operations (rotations, revocations, delegations)

### What's Off-Chain (Trust Required)

- OAuth token verification (depends on Google/Twitter/GitHub being honest)
- DNS resolution (depends on DNS infrastructure — DNSSEC recommended)
- CNAME routing (depends on protocol infrastructure uptime)
- Content delivery (the actual paywalled content lives on the site owner's servers)

### Trust Minimisation Roadmap

| Component | Today | Goal |
|-----------|-------|------|
| Identity attestation | b0ase.com signs | User self-signs with own key |
| Payment processing | path402.com routes | Peer-to-peer via overlay network |
| Condition evaluation | path403.com computes | Any indexer can evaluate |
| DNS resolution | Standard DNS | DNSSEC + on-chain DNS (DNS-DEX) |

### The Minimum Guarantee

If the protocol infrastructure disappears tomorrow:
- All identity proofs survive on-chain (BSV)
- All payment records survive on-chain
- All condition evaluations survive on-chain
- Domain owners still own their domains
- Users still hold their keys

**The protocol is a convenience layer over permanent proofs. Remove the convenience and the proofs remain.**

---

## Comparison to Existing Approaches

### vs. OAuth / OpenID Connect

OAuth proves you control an account on someone else's server. X Protocol (x401) inscribes that proof on-chain permanently. The OAuth provider can revoke your token; they can't revoke your inscription.

### vs. Stripe / PayPal

Stripe processes payments and takes 2.9% + 30 cents. X Protocol (x402) processes micropayments from 1 satoshi with fees under 0.01 cent. Stripe can freeze your account; x402 tokens are bearer instruments — nobody can freeze them.

### vs. Smart Contracts (Ethereum)

Ethereum smart contracts are powerful but expensive ($5-50 per transaction in gas fees). X Protocol (x403) evaluates conditions off-chain and inscribes proofs on-chain for under 0.01 cent. Complex logic doesn't require complex gas.

### vs. Cloudflare Access / Auth0

These are proprietary access control layers. X Protocol conditions are portable, composable, and transparent. A condition created on one site can reference state from any other x401/x402/x403-enabled site.

### vs. Web3 Login (MetaMask, WalletConnect)

Web3 login proves you hold a private key. X Protocol (x401) proves you hold a key AND links it to verified real-world accounts (Google, Twitter, GitHub). The key alone isn't identity — the chain of attestations is.

---

## Implementation: DNS-DEX as the Registry

DNS-DEX (dns-dex.com) serves as the domain registry for the X Protocol:

1. **Domain inscription**: Site owners inscribe their domain on BSV via DNS-DEX
2. **Subdomain activation**: DNS-DEX manages x401/x402/x403 CNAME records
3. **Configuration storage**: Revenue splits, pricing rules, and conditions stored on-chain
4. **Discovery index**: DNS-DEX maintains a searchable index of all X Protocol-enabled domains

```
dns-dex.com/register
  → Inscribe example.com on BSV
  → Configure x401 (identity rules)
  → Configure x402 (pricing, splits)
  → Configure x403 (access conditions)
  → Auto-generate DNS records
  → Domain is now X Protocol-enabled
```

DNS-DEX is to the X Protocol what a domain registrar is to the web: the place you go to set up your domain's protocol participation.

---

## The Three Overlays

Each protocol layer is served by a specialised overlay network of indexers:

### $401 Overlay — Identity Indexers

- Index identity inscriptions on BSV
- Serve verification queries ("is @alice verified?")
- Track key rotations and revocations
- Earn $401 tokens via Proof of Work

### $402 Overlay — Payment Indexers

- Index token transfers and content access records
- Serve content to paying users
- Track market listings and prices
- Earn $402 tokens via Proof of Work (PoW20 HTM)

### $403 Overlay — Conditions Evaluators

- Evaluate condition rules against on-chain state
- Cache evaluation results for fast lookups
- Track condition updates and versioning
- Earn $403 tokens via Proof of Work

**A single node can participate in all three overlays**, earning tokens from each based on the work it performs. This is the hybrid mining model: one binary, three reward streams, specialised work modules.

---

## Adoption Path

### Phase 1: Protocol Sites (Now)

- path401.com, path402.com, path403.com serve as reference implementations
- b0ase.com ecosystem sites activate x401/x402/x403
- DNS-DEX provides domain registration and configuration

### Phase 2: Developer Adoption

- npm package: `npm install x-protocol`
- One-line integration: `<script src="x402.example.com/embed.js"></script>`
- WordPress plugin, Shopify app, Ghost integration
- MCP server for AI agent integration (already built for $402)

### Phase 3: DNS Provider Integration

- Cloudflare, Vercel, Namecheap offer "Enable X Protocol" toggle
- Adding three DNS records becomes a single checkbox
- Protocol reaches millions of domains overnight

### Phase 4: Browser Native

- Browsers detect `x402` meta tags and show native payment UI
- Identity verification happens silently via x401
- Conditions are evaluated before page load
- The protocol becomes invisible — it just works

---

## Token Summary

| Token | Purpose | Supply | Mining |
|-------|---------|--------|--------|
| $401 | Identity indexing rewards | TBD | PoW (identity work) |
| $402 | Payment indexing rewards | 21,000,000 | PoW20 HTM (deployed) |
| $403 | Conditions evaluation rewards | TBD | PoW (conditions work) |

All three tokens are earned through useful work, not purchased. The work is indexing, serving, and verifying — the actual infrastructure that makes the protocol function.

---

## Conclusion

The web is missing three primitives: identity, payment, and conditions. Every site implements them differently, poorly, or not at all.

The X Protocol proposes that these primitives should be as easy to add as email. Three DNS records. Three subdomains. Three overlays.

```
x401 — Who are you?
x402 — What will you pay?
x403 — What are the rules?
```

Every question the web needs to answer. Every answer anchored to the blockchain. Every proof permanent.

The DNS record is the activation energy. The flywheel does the rest.

---

## References

- HTTP 401 Unauthorized — RFC 7235
- HTTP 402 Payment Required — RFC 7231
- HTTP 403 Forbidden — RFC 7231
- BSV-21 Token Standard — https://docs.1satordinals.com/bsv21
- PoW20 Hash-to-Mint — BRC-114
- DNS-DEX — https://dns-dex.com
- path401.com — https://path401.com
- path402.com — https://path402.com
- X Protocol MCP Server — PATH402.com

---

*This document is inscribed on-chain. Every revision is a new inscription. The version history is permanent.*

*Open BSV License v4. February 2026.*
