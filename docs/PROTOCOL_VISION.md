# The $402 Protocol Vision

## BRC Alignment (BSV Stack)

The BSV ecosystem already defines core plumbing that Path402 can build on:

- **BRC‑100**: wallet → app interface (identity, signing, tx handling)
- **BRC‑103/104**: mutual auth + HTTP transport (`/.well-known/auth`, `x-bsv-auth`)
- **BRC‑105**: HTTP 402 paywall + payment proof (preferred for BSV)
- **BRC‑22/24**: overlay submit/lookup for indexed state

Path402’s **EARN / PoW20** layer is additive and not defined by existing BRCs yet.

## Step 1: The Bearer Share Model

### The Blockchain as a Directory

The blockchain serves as a **canonical reference directory** where:
- Domain names are anchored inside inscriptions
- Tokens represent URLs
- Ownership is provable and transferable

### The Old Micropayment Model

Traditional micropayments assumed:
- Fixed price per page view (e.g., 1p per view)
- No tokenomics
- Pay → Access → Done
- No secondary market, no incentive alignment

**Problem:** No reason to be early. No reason to pay more than you must. No network effect.

### The New Model: Tokenomics

Tokens issued for content access come in different flavours:

| Type | Description | Value |
|------|-------------|-------|
| **Receipts** | Proof of payment | Boring but useful |
| **Tickets** | Entry pass | Not much different from receipts |
| **Bearer Shares** | Ownership stake in access rights | Very interesting and valuable |

**The $402 protocol focuses exclusively on the Bearer Share model.**

### The Bearer Share Model

**Core mechanics:**

1. **User visits a website** - They know they will receive bearer shares
2. **Early visitors get disproportionately more** - The pricing curve rewards early adopters
3. **Users are prepared to pay** - Because the incentive is aligned
4. **They receive new information** - Content they could not access before
5. **Bearer shares act as entry tickets** - They can sell them to others

**Why this works:**

```
Early visitor pays X → Receives Y tokens (large amount)
Later visitor pays X → Receives Z tokens (smaller amount, Z < Y)

Early visitor can sell tokens to later visitors at profit
OR hold tokens for continued access
OR stake tokens for protocol revenue share
```

**The key insight:** Users are incentivized to discover and pay for content early because:
- They get more tokens per unit spent
- They can resell access to latecomers
- They become stakeholders, not just consumers

### Value Proposition

| Stakeholder | Old Model | Bearer Share Model |
|-------------|-----------|-------------------|
| **Creator** | Sells access once | Sells access + creates secondary market |
| **Early User** | Pays, gets access | Pays, gets access + tradeable asset |
| **Late User** | Pays same price | Pays more OR buys from early users |
| **Network** | No effect | Viral incentive to discover content early |

### What $402 Defines

The $402 protocol specifies:
1. How HTTP 402 responses signal priced content
2. How `$addresses` map to URLs (`$domain.com/$path`)
3. How pricing curves work (sqrt_decay for bearer share model)
4. How tokens are issued and transferred
5. How access is granted based on token holdings

**$402 is not a token. It is a protocol specification.**

---

## Step 2: Compliance and Dividends

### The Recursive Revenue Model

When a new user pays for access:

```
Entry Fee Paid
     │
     ├──► Split among current shareholders (dividends)
     │
     └──► New user receives bearer shares
              │
              └──► Entitled to proportion of future entry fees
```

**This is recursive.** Each new entrant funds the existing shareholders, then becomes a shareholder themselves.

### The Compliance Problem

A site cannot legally:
- Offer securities
- Pay dividends to anonymous holders

**Therefore:** Every site using the bearer share model must implement compliance.

### The Staking Mechanism

To receive dividends, token holders must **stake** their shares at the site.

**Staking requirements:**
1. Hold bearer shares (tokens)
2. Present KYC documents to the site or a KYC provider (e.g., Veriff)
3. Pass identity verification
4. Register on the site's **Registry of Members**

**Once staked:**
- User receives dividends from entry fee revenue
- Dividends distributed via cron jobs / indexing service
- Payments are regular and proportional to staked amount

### The Registry of Members

Every compliant site maintains a registry:

| Field | Description |
|-------|-------------|
| Public Address | One per user (derived from wallet) |
| Handle | User identifier (e.g., HandCash $handle) |
| KYC Status | Verified / Unverified |
| Staked Balance | Tokens committed to dividend pool |
| Unstaked Balance | Tokens held but not earning dividends |

### User Flow

**Entry and Access:**
1. User connects wallet (HandCash with $ prefix)
2. User signs to prove identity
3. User gains entry to gated content
4. User receives bearer shares to their public address

**Staking for Dividends:**
1. User requests to stake tokens
2. User completes KYC (Veriff or similar)
3. User added to Registry of Members
4. Staked tokens earn proportional dividends

**Withdrawal and Sale:**
1. User can withdraw bearer tokens at any time
2. User can sell tokens on open market
3. **No notification to site required**
4. Registry remains unchanged until new holder stakes

### Registry Updates

The Registry of Members only changes when:
- A **different user** arrives with the same tokens
- That user requests to **stake** those tokens
- That user provides **KYC**
- The registry updates to reflect new ownership

**Bearer tokens are bearer instruments.** The site doesn't track transfers. It only tracks who has staked and passed KYC.

### Implementation Requirements

For a site to be $402 compliant with dividends:

| Requirement | Purpose |
|-------------|---------|
| Registry of Members | Track KYC'd stakers |
| KYC Integration | Verify identity (Veriff, Jumio, etc.) |
| Indexing Service | Track on-chain token movements |
| Cron Jobs | Regular dividend distribution |
| Public Address Derivation | One address per user |
| Staking Interface | Stake/unstake UI |
| Dividend Claiming | Payout mechanism |

### Two Tiers of Token Holders

| Tier | KYC | Dividends | Can Trade |
|------|-----|-----------|-----------|
| **Tier 1: Bearer** | No | No | Yes |
| **Tier 2: Staker** | Yes | Yes | Yes |

Anyone can hold and trade bearer shares. Only KYC'd stakers receive dividends.

---

## Step 3: Pricing Curves as Protocol Primitives

### The Curve-Agnostic Principle

$402 does not mandate a single pricing model. It defines **how to express** a pricing model, allowing issuers to choose the economics that fit their use case.

Like HTTP has `Content-Type` headers that specify format without mandating one format, $402 has pricing model definitions that specify economics without mandating one model.

### What a Pricing Curve Defines

Every $402 token must declare its pricing curve. A curve definition includes:

| Parameter | Purpose | Required |
|-----------|---------|----------|
| `model` | Formula type identifier | Yes |
| `formula` | Human-readable formula | Yes |
| `direction` | How price changes | Yes |
| `base` | Starting constant | Model-dependent |
| `variable` | What drives price | Model-dependent |
| `floor` | Minimum price | Optional |
| `ceiling` | Maximum price | Optional |
| `parameters` | Model-specific values | Model-dependent |

### Standard Curve Models

The $402 protocol defines these standard models (implementations SHOULD support at minimum `sqrt_decay` and `fixed`):

#### 1. sqrt_decay (Default)

Price changes based on square root of supply or treasury.

**Investment variant** (early buyers get cheap tokens):
```json
{
  "model": "sqrt_decay",
  "formula": "base / sqrt(treasury_remaining + 1)",
  "direction": "price_increases_as_treasury_depletes",
  "base": 100000000,
  "variable": "treasury_remaining"
}
```

| Treasury Remaining | Price (sats) |
|-------------------|--------------|
| 500,000,000 | 4 |
| 100,000,000 | 10 |
| 10,000,000 | 32 |
| 1,000,000 | 100 |

**Content variant** (early buyers pay premium for time advantage):
```json
{
  "model": "sqrt_decay",
  "formula": "base / sqrt(supply + 1)",
  "direction": "price_decreases_as_supply_grows",
  "base": 10000,
  "variable": "supply"
}
```

| Supply | Price (sats) |
|--------|--------------|
| 0 | 10,000 |
| 99 | 1,000 |
| 9,999 | 100 |

#### 2. fixed

Constant price regardless of supply.

```json
{
  "model": "fixed",
  "formula": "price",
  "direction": "constant",
  "price": 1000
}
```

Use cases: Simple paywalls, subscriptions, stable-priced access.

#### 3. linear

Price changes linearly with supply or treasury.

```json
{
  "model": "linear",
  "formula": "base + (slope * supply)",
  "direction": "price_increases_with_supply",
  "base": 100,
  "slope": 1
}
```

#### 4. exponential

Price changes exponentially.

```json
{
  "model": "exponential",
  "formula": "base * (multiplier ^ supply)",
  "direction": "price_increases_exponentially",
  "base": 100,
  "multiplier": 1.01
}
```

#### 5. bonding_curve

AMM-style bonding curve with reserve.

```json
{
  "model": "bonding_curve",
  "formula": "reserve / (supply * reserve_ratio)",
  "direction": "price_follows_reserve",
  "reserve_ratio": 0.5
}
```

### Custom Curves

Implementations MAY support custom curve definitions:

```json
{
  "model": "custom",
  "formula": "base * log(supply + 1) / sqrt(time_elapsed + 1)",
  "variables": ["supply", "time_elapsed"],
  "base": 1000
}
```

Custom curves require:
- Parseable formula
- Declared variables
- Deterministic evaluation (same inputs = same price)

### Protocol Headers

When a server returns HTTP 402, it includes curve information:

```http
HTTP/1.1 402 Payment Required
X-$402-Price: 4500
X-$402-Model: sqrt_decay
X-$402-Formula: base / sqrt(treasury_remaining + 1)
X-$402-Base: 100000000
X-$402-Treasury-Remaining: 499000000
X-$402-Token: $example.com/$content
```

### Discovery Document

The `/.well-known/$402.json` endpoint exposes full curve definitions:

```json
{
  "$402_version": "1.0.0",
  "tokens": [
    {
      "address": "$example.com/$content",
      "pricing": {
        "model": "sqrt_decay",
        "formula": "base / sqrt(treasury_remaining + 1)",
        "direction": "price_increases_as_treasury_depletes",
        "base": 100000000,
        "variable": "treasury_remaining",
        "current_value": 499000000,
        "current_price": 4472
      }
    }
  ]
}
```

### Why Curves Matter

Different curves serve different purposes:

| Curve | Best For | Incentive Structure |
|-------|----------|---------------------|
| sqrt_decay (investment) | Fundraising, equity | Early believers rewarded |
| sqrt_decay (content) | Premium content | Early access premium, late mass access |
| fixed | Utilities, APIs | Predictable pricing |
| linear | Gradual scarcity | Steady appreciation |
| exponential | Extreme scarcity | FOMO, speculation |
| bonding_curve | Liquidity pools | Market-making |

The curve is the economic constitution of the token. It determines who wins, when, and by how much.

---

## Step 4: Paths as Economic Entities

### The Core Concept

Every URL path can become a tokenized economic entity. The `$` prefix signifies: "this path is a shareholder business."

```
$example.com                    → Site-level entity
$example.com/$blog              → Blog section entity
$example.com/$blog/$premium     → Premium content entity
$example.com/$api               → API access entity
```

### What a $path Represents

Each `$path` is:

| Property | Description |
|----------|-------------|
| Token | A tradeable bearer share |
| Inscription | Anchored on blockchain with unique ID |
| Pricing curve | Determines cost of entry |
| Registry | List of shareholders |
| Access right | Holders can access that path |
| Revenue stream | Entry fees flow to shareholders |

### The Inscription

When an issuer creates a `$path`, they inscribe:

```json
{
  "p": "$402",
  "op": "create",
  "path": "$example.com/$blog",
  "pricing": {
    "model": "sqrt_decay",
    "base": 100000000
  },
  "class": "access",
  "supply": 1000000000
}
```

This inscription is the **genesis** of that path's token.

### Access Control (MVP)

For the MVP, access is server-gated:

```
1. User requests: GET example.com/blog/premium
2. Server checks: Does user hold $example.com/$blog/$premium?
3. Registry lookup: Query by ordinal ID or handle
4. If holder → Serve content
5. If not → Return 402 Payment Required
```

No encryption keys in tokens. The server holds content and checks the registry.

### Token Classes

| Class | Content Location | Access Method |
|-------|------------------|---------------|
| `access` | Server | Server checks registry, serves content |
| `container` | Inside inscription | Read the token itself |
| `key` | (Future) Encrypted | Trustless decryption |

For MVP, focus on `access` class.

### Why Paths Matter

Paths enable granular monetization:

| Path | What It Sells |
|------|---------------|
| `$news.com` | Site membership |
| `$news.com/$politics` | Politics section |
| `$news.com/$politics/$analysis` | Deep analysis |
| `$api.com/$v1` | API v1 access |
| `$api.com/$v2` | API v2 access |

Each path has independent:
- Price
- Supply
- Shareholders
- Revenue

### The Name

```
$402 = Dollar sign + HTTP 402

$ = Path prefix (this path is an economic entity)
402 = Payment Required (the HTTP response code)

PATH402 = Paths as 402-enabled entities
```

---

## Step 5: Hierarchical Ownership

### The Domain as a Business

A domain is not just a collection of paths - it's a **business** with a corporate structure:

```
$example.com                      ← The business (root)
├── $example.com/$blog            ← Department (branch)
│   ├── $example.com/$blog/$news  ← Product (leaf)
│   └── $example.com/$blog/$opinion
├── $example.com/$api             ← Department (branch)
│   ├── $example.com/$api/$v1     ← Product (leaf)
│   └── $example.com/$api/$v2
└── $example.com/$premium         ← Department (branch)
```

### Parent Ownership Rule

**When a child path token is created, 50% of the supply goes to its parent.**

```
$example.com/$blog created with 1,000,000 tokens:
  → 500,000 go to $example.com (parent)
  → 500,000 available for sale
```

This continues up the tree:

```
$example.com/$blog/$premium created with 1,000,000 tokens:
  → 500,000 go to $example.com/$blog (parent)
  → 500,000 available for sale

But $example.com/$blog is 50% owned by $example.com, so:
  → 250,000 effectively belong to $example.com (root)
```

### Revenue Flow

Entry fees flow UP the hierarchy:

```
User pays to access $example.com/$blog/$premium
  │
  ├──► 50% to $example.com/$blog/$premium shareholders
  │
  └──► 50% to $example.com/$blog (parent)
        │
        ├──► 50% of that to $example.com/$blog shareholders
        │
        └──► 50% of that to $example.com (grandparent)
```

### Root Access

A majority shareholder in the root has **access to everything underneath**.

```
CEO owns 51% of $example.com
  → Has root access to entire tree
  → Can access $example.com/$blog without buying blog tokens
  → Can access $example.com/$api/$v2 without buying API tokens
```

**Access inheritance:** If you own enough of a parent, you inherit access to its children.

### The Corporate Analogy

| Path Level | Corporate Equivalent |
|------------|---------------------|
| `$example.com` | Holding company |
| `$example.com/$blog` | Subsidiary |
| `$example.com/$blog/$premium` | Product line |
| Root shareholder | CEO / Board |
| Branch shareholder | Division head |
| Leaf shareholder | Customer / User |

### Delegation

Parents can sell access to branches without selling the root:

```
$news.com (owner: News Corp)
├── $news.com/$politics (sold to users)
├── $news.com/$sports (sold to users)
└── $news.com/$finance (sold to users)

News Corp retains 50% of each section automatically.
Users buy into sections, not the whole company.
News Corp earns from ALL sections via parent ownership.
```

### Inscription Format

Child tokens declare their parent:

```json
{
  "p": "$402",
  "op": "create",
  "path": "$example.com/$blog/$premium",
  "parent": "$example.com/$blog",
  "parent_share_bps": 5000,
  "pricing": {
    "model": "sqrt_decay",
    "base": 10000000
  }
}
```

### Access Rules

| Condition | Access Granted |
|-----------|----------------|
| Hold `$path` token | Access to `$path` |
| Hold >50% of parent | Access to all children |
| Hold >50% of root | Access to entire tree |

### Why 50%?

- **Issuer retains control** - Parent always has majority influence over children
- **Subsidiaries can operate** - 50% available for child's own shareholders
- **Revenue alignment** - Parent benefits from child success
- **Prevents hostile takeover** - Can't buy a leaf and bypass the root

The 50% is a default. Issuers MAY specify different `parent_share_bps` values.

### The Tree as Cap Table

```
$example.com
├── Total supply: 1,000,000,000
├── Shareholders:
│   ├── Founder: 400,000,000 (40%)
│   ├── Investors: 300,000,000 (30%)
│   └── Public: 300,000,000 (30%)
│
├── $example.com/$blog
│   ├── Total supply: 100,000,000
│   ├── Owned by parent: 50,000,000 (50%)
│   └── Public: 50,000,000 (50%)
│
└── $example.com/$api
    ├── Total supply: 500,000,000
    ├── Owned by parent: 250,000,000 (50%)
    └── Public: 250,000,000 (50%)
```

The Founder with 40% of root effectively owns:
- 40% of `$example.com`
- 20% of `$example.com/$blog` (40% of parent's 50%)
- 20% of `$example.com/$api` (40% of parent's 50%)

---

## Step 6: Extensibility and Incremental Trees

### The Extensible Standard

$402 is designed as a **core + extensions** architecture:

**Core Spec (Required):**
```json
{
  "p": "$402",
  "version": "1.0",
  "path": "$example.com",
  "pricing": {
    "model": "fixed",
    "price": 1000
  }
}
```

Minimum requirements:
- Protocol identifier (`"p": "$402"`)
- Version
- Path declaration
- Pricing (at minimum, a fixed price)

**Everything else is an extension.**

### Standard Extensions

| Extension | What It Adds | Required By |
|-----------|--------------|-------------|
| `$402-curves` | sqrt_decay, linear, exponential, bonding | Sites with dynamic pricing |
| `$402-compliance` | KYC, staking, dividends, registry | Sites paying dividends |
| `$402-hierarchy` | Parent/child relationships, revenue flow | Multi-path sites |
| `$402-containers` | Data embedded in inscriptions | On-chain content |
| `$402-usage` | Metered access pricing (time/window) | Live streams, APIs, utilities |
| `$402-keys` | Encryption, key encapsulation | Private/encrypted content |
| `$402-governance` | Voting rights, proposals | DAOs, community sites |

### Declaring Extensions

```json
{
  "p": "$402",
  "version": "1.0",
  "extensions": ["$402-curves", "$402-hierarchy", "$402-compliance"],
  "path": "$example.com/$blog",
  "parent": "$example.com",
  "parent_share_bps": 5000,
  "pricing": {
    "model": "sqrt_decay",
    "base": 100000000
  },
  "compliance": {
    "kyc_required_for_dividends": true,
    "registry_public": true
  }
}
```

### Incremental Tree Building

The path tree is **not declared all at once**. Each path is a separate inscription:

```
Time 0: Inscribe $example.com (root)
        → Inscription ID: abc123

Time 1: Inscribe $example.com/$blog
        → Inscription ID: def456
        → Declares parent: abc123

Time 2: Inscribe $example.com/$api
        → Inscription ID: ghi789
        → Declares parent: abc123

Time 3: Inscribe $example.com/$blog/$premium
        → Inscription ID: jkl012
        → Declares parent: def456
```

**The tree emerges from linked inscriptions:**

```
abc123: $example.com
├── def456: $example.com/$blog
│   └── jkl012: $example.com/$blog/$premium
└── ghi789: $example.com/$api
```

### Why Incremental?

| Benefit | Explanation |
|---------|-------------|
| No upfront planning | Add paths as your site grows |
| Independent inscriptions | Each path has its own blockchain record |
| Flexible timing | Create children years after parent |
| Verifiable lineage | Parent reference is on-chain |
| Permissionless branching | Anyone holding parent tokens could create children (if allowed) |

### Child Creation Rules

Who can create a child path?

| Rule | Who Can Create Children |
|------|------------------------|
| `open` | Anyone (permissionless) |
| `parent_majority` | >50% holders of parent |
| `parent_owner` | Original inscriber of parent |
| `whitelist` | Specific addresses |

```json
{
  "p": "$402",
  "path": "$example.com",
  "child_creation": "parent_majority"
}
```

### Version Compatibility

```
$402 v1.0 → Core spec
$402 v1.1 → Core + curves
$402 v1.2 → Core + curves + hierarchy
$402 v2.0 → Breaking changes (new epoch)
```

Implementations MUST support core spec. Extensions are opt-in.

### Discovery

Servers expose their $402 configuration at `/.well-known/$402.json`:

```json
{
  "$402_version": "1.0",
  "extensions": ["$402-curves", "$402-hierarchy"],
  "root": {
    "path": "$example.com",
    "inscription_id": "abc123"
  },
  "children": [
    {
      "path": "$example.com/$blog",
      "inscription_id": "def456",
      "parent_inscription": "abc123"
    }
  ]
}
```

### The Simplest Valid $402 Token

A fixed-price paywall with no extensions:

```json
{
  "p": "$402",
  "version": "1.0",
  "path": "$myblog.com",
  "pricing": {
    "model": "fixed",
    "price": 500
  }
}
```

That's it. 4 fields. A complete $402-compliant token.

Everything else—curves, hierarchy, compliance, encryption—is built on top.

### Usage Pricing (Metered Access)

Usage pricing is **independent** from the token price. Tokens confer access rights and ownership; usage pricing charges for **time-based consumption** (e.g., $0.00001 per 100ms, $100 per hour).

```json
{
  "usage_pricing": {
    "enabled": true,
    "unit_ms": 1000,
    "price_sats_per_unit": 100,
    "prepay_ms": 60000,
    "grace_ms": 2000,
    "accepted_networks": ["bsv"]
  }
}
```

---

## Step 7: Staking Partners and Network Incentives

### The Infrastructure Problem

Every $402 domain needs infrastructure:
- An **indexer** to track token transfers on-chain
- A **registry** to serve current shareholder state
- **APIs** for wallets and agents to query balances

Who pays for this? Who runs it?

### The Partnership Model

Stakers are not just passive dividend recipients. They are **partners** in the domain business.

**Staker Commitments:**

| Commitment | Purpose |
|------------|---------|
| Lock tokens | Align long-term incentives |
| Run indexer | Track domain's token movements |
| Maintain registry | Serve shareholder data |
| Index child paths | Discover new inscriptions in the tree |

**Staker Rewards:**

| Revenue Source | Description |
|----------------|-------------|
| Entry fees | Share of new token purchases |
| Child path fees | Share when new paths are created under the domain |
| API fees | Revenue from serving registry queries |
| Dividends | Proportional share of all domain revenue |

### How It Works

```
1. User stakes tokens for $example.com
   │
   ├── Tokens locked (cannot sell while staked)
   ├── User runs indexer for $example.com tree
   │   ├── Watches treasury address
   │   ├── Parses BSV-20 transfers
   │   ├── Tracks child path inscriptions
   │   └── Updates registry database
   │
   └── User receives revenue:
       ├── 70% of entry fees (split among stakers)
       ├── Share of child path creation fees
       └── API access fees from third parties
```

### Staker Requirements

To become a staking partner:

```json
{
  "p": "$402",
  "op": "stake",
  "path": "$example.com",
  "amount": 1000000,
  "commitment": {
    "indexer_endpoint": "https://my-indexer.com/api",
    "uptime_sla": 0.99,
    "retention_days": 365
  }
}
```

| Requirement | Purpose |
|-------------|---------|
| Minimum stake | Skin in the game |
| Indexer endpoint | Prove you're running infrastructure |
| Uptime SLA | Commitment to availability |
| KYC (for dividends) | Compliance per Step 2 |

### Slashing

Stakers who fail their commitments can be slashed:

| Violation | Consequence |
|-----------|-------------|
| Indexer offline >24h | Warning |
| Indexer offline >7d | Partial slash (10%) |
| False registry data | Full slash + ban |
| Failure to index child paths | Reduced revenue share |

Slashed tokens go to the domain treasury or are burned.

### The Scaling Effect

Larger domains attract more stakers:

```
Small domain ($myblog.com):
  → 1-2 stakers sufficient
  → Low revenue, low infrastructure needs
  → Issuer might self-stake

Large domain ($news.com):
  → Many stakers compete
  → High revenue, high infrastructure needs
  → Redundant indexers for reliability
  → Stakers earn significant revenue
```

### Why This Works

| Traditional Model | $402 Staking Model |
|-------------------|-------------------|
| Company pays for servers | Partners run infrastructure |
| Centralized database | Distributed indexers |
| Single point of failure | Redundant stakers |
| Fixed costs | Revenue-aligned costs |
| Employees | Partners |

**The analogy:** Like a law firm or accounting partnership. Partners commit capital, do work, share profits. The more successful the firm, the more valuable the partnership.

### Staker Independence

Stakers are independent operators:
- Run their own hardware
- Choose their own indexer implementation
- Compete on uptime and performance
- Can stake in multiple domains
- Not employees of the domain

This creates a **permissionless infrastructure layer** without needing a separate PoW token.

### Registry Consensus

Multiple stakers indexing the same domain should agree on state. If they disagree:

1. Query multiple stakers
2. Compare results
3. If mismatch, verify against on-chain inscriptions
4. Slash the staker with incorrect data

The blockchain is always the source of truth. Stakers just make it queryable.

### Inscription Format

Staking is recorded on-chain:

```json
{
  "p": "$402",
  "op": "stake",
  "path": "$example.com",
  "staker": "1ABC...xyz",
  "amount": 1000000,
  "indexer": "https://my-indexer.com",
  "timestamp": 1706918400
}
```

Unstaking requires a cooldown:

```json
{
  "p": "$402",
  "op": "unstake",
  "path": "$example.com",
  "stake_inscription": "abc123",
  "cooldown_blocks": 144
}
```

### The Network Effect

As more domains adopt $402:
- More staking opportunities
- Stakers can diversify across domains
- Infrastructure becomes robust
- Indexer software matures
- The network becomes self-sustaining

**No central indexer needed.** Every domain has partners with incentives to keep it running.

---

## Step 8: AI Agents and Protocol Interoperability

### The Bigger Vision

The $402 protocol proposes something radical:

```
Legacy:     $COIN on NYSE      (Coinbase stock)
$402:       $coinbase.com      (domain IS the equity)

Legacy:     $GOOGL on NASDAQ   (Google stock)
$402:       $google.com        (domain IS the equity)
```

**The domain name becomes the ticker symbol.** Stock exchanges become legacy infrastructure.

Every company already owns their domain. With $402, that domain becomes their cap table. Every visitor can become a shareholder. The website IS the company.

### x402: Payment Rail

Coinbase's x402 protocol handles **payment verification**:
- Client pays on any chain (Base, Solana, Ethereum)
- Facilitator verifies the payment
- Server grants access

x402 answers: "Did they pay?"

### $402: Economic Model

The $402 protocol handles **economics**:
- Who are the shareholders?
- How is price determined?
- How does revenue flow through hierarchy?
- Who runs the infrastructure?

$402 answers: "What do they own? What do they earn?"

### The Relationship

```
┌─────────────────────────────────────────────────────────────┐
│                      User Request                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    $402 ECONOMIC LAYER                      │
│  • Pricing curve (sqrt_decay, fixed, etc.)                 │
│  • Hierarchical ownership (50% to parent)                  │
│  • Shareholder registry                                     │
│  • Staking partnerships                                     │
│  • Revenue distribution                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    x402 PAYMENT LAYER                       │
│  • Multi-chain payment acceptance                          │
│  • Payment verification                                     │
│  • Facilitator protocol                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   SETTLEMENT LAYER                          │
│  • BSV (permanent inscription)                             │
│  • Or any chain the domain chooses                         │
└─────────────────────────────────────────────────────────────┘
```

**$402 sits on top of x402.** We don't compete with x402 — we complete it.

### Why This Matters

x402 without $402:
- Payment verification ✓
- No tokenomics
- No hierarchy
- No staking model
- Just "pay and access"

x402 with $402:
- Payment verification ✓
- Bearer share model ✓
- Hierarchical ownership ✓
- Staking partnerships ✓
- Self-sustaining flywheel ✓

Coinbase built x402 for micropayments. $402 adds the economics that make it a platform for internet-native equity.

### AI Agents as First-Class Participants

The flywheel works better for AI agents than humans:

| Human | AI Agent |
|-------|----------|
| Subscription fatigue | No fatigue |
| CAPTCHA problems | Programmatic access |
| 9-5 availability | 24/7 operation |
| Manual discovery | Automated ROI calculation |
| Emotion-driven decisions | Data-driven decisions |

**Agents can complete the entire flywheel:**

```
1. DISCOVER
   Agent probes $addresses, evaluates pricing curves

2. ACQUIRE
   Agent pays via x402, receives tokens

3. STAKE
   Agent commits tokens, runs indexer

4. SERVE
   Agent serves content to other agents and humans

5. EARN
   Agent receives revenue share, dividends

6. REINVEST
   Agent acquires more tokens in more domains
```

### Self-Funding Agents

The math that makes agents self-sustaining:

```
Agent buys 1000 tokens at 100 sats each = 100,000 sats spent
Agent stakes and runs indexer
Agent earns 70% of entry fees from new buyers
If 10 new buyers pay 100 sats each = 1,000 sats revenue
Agent share (70% of 1,000) = 700 sats
After ~143 new buyers, agent has recovered investment
Everything after is profit
```

With sqrt_decay pricing:
- Early agents get more tokens per sat
- Later buyers pay more, generating more revenue
- Early stakers capture disproportionate value

**The first agents to stake in a domain have the best economics.**

### MCP Integration

The Model Context Protocol (MCP) enables AI assistants to interact with $402:

**Discovery Tools:**
```
path402_discover     → Probe a $address
path402_economics    → Calculate ROI, breakeven
path402_price_schedule → View price curve
```

**Acquisition Tools:**
```
path402_acquire      → Buy tokens, get content
path402_wallet       → Check holdings
path402_transfer     → Move tokens
```

**Staking Tools:**
```
path402_stake        → Become a partner
path402_unstake      → Exit (with cooldown)
path402_serve        → Distribute content, earn
```

Agents with MCP access can autonomously:
- Discover high-potential domains
- Calculate optimal entry points
- Stake and run infrastructure
- Serve content to earn revenue
- Diversify across domains

### The Network of Agents

As AI agents adopt $402:

```
More agents staking
       │
       ▼
More reliable infrastructure
       │
       ▼
Better user experience
       │
       ▼
More human adoption
       │
       ▼
More revenue
       │
       ▼
More agents attracted
       │
       └──────────────────┐
                         │
       ┌─────────────────┘
       │
       ▼
Agent-to-agent economy emerges
```

Agents serving content to other agents. Agents paying agents. A machine economy built on $402.

### Settlement Strategy

$402 is **settlement-layer agnostic**. Domains choose where to inscribe:

| Chain | Properties |
|-------|------------|
| BSV | Unbounded blocks, sub-cent fees, permanent |
| Ethereum | High security, expensive |
| Solana | Fast, cheap, less permanent |
| Base | Coinbase ecosystem, centralized |

**The arbitrage thesis:**

As chains congest, fees rise. BSV has unbounded blocks — fees stay low at any volume. Domains that care about cost and permanence will settle on BSV. Domains that care about ecosystem will settle elsewhere.

$402 doesn't mandate settlement. It enables choice.

### The End State

```
Today:
  Companies → NYSE/NASDAQ → Stock tickers ($COIN, $GOOGL)
  Websites → Subscriptions/Ads → No ownership

$402 future:
  Companies → $402 → Domain tickers ($coinbase.com, $google.com)
  Every website → Shareholder business
  Every visitor → Potential owner
  Every owner → Potential partner
```

Coinbase could issue `$coinbase.com` via $402. Their domain becomes their cap table. Every user becomes a potential shareholder. The NYSE listing becomes secondary.

**This is not competing with Coinbase. This is offering Coinbase a better model.**

---

*The $402 protocol is complete. Implementation begins.*
