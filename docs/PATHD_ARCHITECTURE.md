# path402d Architecture

**Version**: 1.0.0
**Date**: February 3, 2026
**Status**: Specification

## Overview

`path402d` is the indexing and serving daemon for the $402 network. It plays the same role in the $402 ecosystem that `bitcoind` plays in Bitcoin: the core software that nodes run to participate in the network.

```
Bitcoin Network          $402 Network
─────────────────        ─────────────────
bitcoind                 path402d
  - Indexes blocks         - Indexes $402 tokens
  - Validates txs          - Validates ownership
  - Relays txs             - Serves content
  - Earns BTC              - Earns $402
```

## Architecture

### Layer Stack

```
Layer 0: BitcoinSV           ← 1M+ TPS base layer (payment rails)
    ↓
Layer 1: BSV-21 + PoW20      ← Token standard + mining rewards
    ↓
Layer 2: path402d Network      ← Indexers serving paid content
    ↓
Interface: BRC-100           ← Browser ↔ path402d communication
    ↓
Application: $402 Protocol   ← Paths, tokens, dividends
```

### Core Functions

path402d performs four essential functions:

| Function | Description | Computation |
|----------|-------------|-------------|
| **INDEX** | Reads BSV blockchain, tracks all $402 tokens | O(blocks) |
| **VALIDATE** | Confirms token ownership before serving | O(1) |
| **SERVE** | Delivers content to verified token holders | O(content size) |
| **EARN** | Receives $402 rewards via PoW20 | O(difficulty) |

## Token Economics

### Token as Perpetual Access

The $402 token model works like a shareholder meeting pass:

| Shareholder Meeting | $402 Token |
|---------------------|------------|
| Share certificate | BSV-21 token |
| Entry to meeting | Access to content |
| Not burned on entry | **Not burned on access** |
| Dynamic information | Dynamic content stream |
| Resellable share | Tradeable token |

**Key insight**: The token is a **perpetual pass** because the content is a **living stream**. Unlike a movie ticket (one-time access), it's like a gym membership (ongoing access while you hold it).

### Why Not Burn Tokens on Access?

1. **Content is dynamic** - New updates, like shareholder meeting minutes
2. **Perpetual value** - Holders benefit from ongoing content stream
3. **Secondary market** - Tokens remain tradeable
4. **Dividend alignment** - Holders earn from new buyers

### Staking Mechanics

```
1 token staked = Can serve 1 access

Staker holds 100 tokens:
  → Can serve 100 concurrent accesses
  → Earns share of fees from those accesses
  → Sells 50 tokens → Can only serve 50 accesses

Incentive alignment:
  → No token = No serving rights = No revenue
  → More tokens = More serving capacity = More revenue
```

## HTM (Hash-to-Mint) Mining

> **Full specification**: [HTM_TOKEN.md](HTM_TOKEN.md) — the complete $402 mining token spec.

### Reward Mechanism

path402d nodes earn $402 tokens through **Proof-of-Indexing** — a Hash-to-Mint (HTM) smart contract deployed on BSV that combines PoW mining with verifiable work commitments:

```
1. path402d node indexes blockchain         → generates work items
2. path402d node serves content to users    → generates work items
3. path402d builds merkle root of work      → work commitment (32 bytes)
4. path402d solves hash puzzle including    → proof of work
   the work commitment in the preimage
5. path402d submits to HTM contract on-chain → $402 tokens minted

Formula: double_sha256(contractTxId + workCommitment + minerAddr + nonce) < target

Anti-frontrun: minerAddr in preimage prevents mempool theft
Anti-precompute: contractTxId changes with every mint
```

### HTM Contract: `Path402HTM`

The $402 mining token is an sCrypt smart contract (`Path402HTM extends BSV20V2`). The entire 21M supply is locked at deployment and released only via valid PoW solutions. The contract is packaged as `@path402/htm`.

### Token Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| **Standard** | BSV-21 (sCrypt smart contract) | On-chain verification, not inscription-based |
| **Symbol** | `402` | |
| **Max Supply** | 21,000,000 | Bitcoin-inspired cap |
| **Mint Limit** | 1,000 per solution | Before halving |
| **Difficulty** | 5 leading zero hex chars | ~1 in 1,048,576 per hash |
| **Halving** | Every 10,500 solutions | 1000 → 500 → 250 → ... |
| **Distribution** | 100% to miners | No pre-mine, no treasury |

### Why PoW for Indexers?

**The purpose of PoW is NOT just to reward work. It's to force operators into the open.**

The same reason Bitcoin uses PoW for miners:

1. **Computational cost** → Forces capital investment
2. **Capital investment** → Economies of scale
3. **Economies of scale** → Large operations
4. **Large operations** → Physical presence
5. **Physical presence** → Regulatory visibility
6. **Regulatory visibility** → Compliance pressure

This is the "Coinbase effect": Coinbase is a giant indexer. It's regulated BECAUSE it's large. PoW20 creates many competing Coinbases.

### Data Vendors Are NOT Neutral

**Critical insight**: BSV the blockchain is neutral. But data vendors (indexers, nodes) are NOT neutral. They have agendas. They have biases.

```
Examples of biased nodes:
  → Christian node pushing Christian content
  → Muslim node pushing Islamic content
  → Political node pushing propaganda
  → Corporate node pushing sponsored content
  → Government node with censorship agenda
```

**This is not a problem to solve. It's a feature to expose.**

### Curation Through Discovery (BitTorrent Model)

Like a BitTorrent node, if you're running path402d you're making choices about what to serve. Curation happens at the **discovery** stage through selective purchasing:

```
Running path402d:
  → Run AI agents to scan new inscriptions
  → Buy tokens to access content samples
  → Evaluate: Is this valuable? Does it serve my niche?

Decision tree:
  "This has value" → Buy more, serve it to users
  "Low quality"    → Ignore, don't index
  "Against my niche" → Suppress by not serving
  "Competitor to my agenda" → Optionally buy to suppress
```

**The network self-organizes into specialized niches:**

```
path402d-techblog.com
  → Agent scans for: programming, AI, startups
  → Buys: Technical content, research papers
  → Ignores: Political content, entertainment

path402d-news.org
  → Agent scans for: current events, journalism
  → Buys: Breaking news, investigative reports
  → Ignores: Old content, spam

path402d-conservative.net
  → Agent scans for: political commentary
  → Buys: Right-leaning analysis
  → Ignores: Left-leaning content (or buys to suppress)
```

**Curation is NOT a separate layer. It's built into the discovery economics:**

| Action | Cost | Effect |
|--------|------|--------|
| Scan sample | Free (10% preview) | Evaluate quality |
| Buy to serve | Token price | Gain serving rights |
| Buy to suppress | Token price | Remove from your index |
| Ignore | Nothing | Content served by others |

The market reveals what content is valuable through price discovery. Nodes that serve high-demand content earn more. Nodes that serve spam lose users and revenue.

If a path402d node gets really big, we want to know:
- **WHO** is running it
- **WHAT** their agenda is
- **HOW** they're curating content

PoW forces them into visibility. Big nodes can't hide. Big nodes must identify themselves. Big nodes become accountable.

### The Separation Principle

We don't want one giant "neutral" node. We want many identified nodes:

```
path402d-christianity.org  → Christian perspective (identified)
path402d-islam.net         → Islamic perspective (identified)
path402d-secular.com       → Secular perspective (identified)
path402d-china.cn          → Chinese state perspective (identified)
```

Users can:
1. Query multiple nodes
2. Compare results
3. Understand biases
4. Make informed choices

**The $402 protocol enforces economic truth (who owns what tokens). Nodes choose what content to serve. Users choose which nodes to trust.**

### The Honesty Incentive

The more a node follows $402 protocol correctly:
1. **Bigger** → More tokens, more serving capacity
2. **More visible** → Must identify themselves
3. **More accountable** → Reputation at stake
4. **More profitable** → Correct indexing = more revenue

Nodes that lie about token ownership lose trust and revenue. Nodes that serve spam lose users. Economic incentives align with honest behavior.

### PoW vs AI Verification (Experimental)

**Caution**: This section describes an experimental concept, NOT a core protocol feature.

Traditional PoW is "hard to do, easy to verify":
```
Mining:     Find nonce where SHA256(block+nonce) < target
Verify:     Just compute the hash once (trivial)
```

AI quality assessment is the opposite - "easy to do, hard to verify":
```
Assessment: AI scans inscription, rates quality
Verify:     How do you verify an AI's judgment?
            Different AIs give different answers.
            No cryptographic proof of quality.
```

**Possible future exploration**:
- AI agents could earn PoW20 for quality curation
- Scanning inscriptions for: new ideas, coherent signals, spam detection
- But this is NOT trustlessly verifiable like hash puzzles

**For now, PoW20 rewards computational work (indexing, serving), not quality judgment.**

## BRC-100 Interface

### Browser as Wallet

The browser acts as a wallet, holding $402 tokens. Communication with path402d uses the BRC-100 standard:

```
┌──────────────┐         BRC-100          ┌──────────────┐
│              │◄────────────────────────►│              │
│   BROWSER    │    wallet-app spec       │    path402d    │
│   (wallet)   │                          │   (server)   │
│              │                          │              │
│  Holds:      │         Request:         │  Validates:  │
│  - $402 tokens│     "I hold 5 $BLOG"    │  - Ownership │
│  - Identity  │         Response:        │  - Serves    │
│              │     "Access granted"     │    content   │
└──────────────┘                          └──────────────┘
```

### BRC-100 Methods Used

| Method | Purpose | path402d Usage |
|--------|---------|--------------|
| `createAction` | Construct transactions | Token transfers |
| `createSignature` | Prove ownership | Access verification |
| `listOutputs` | Query token holdings | Check balances |
| `acquireCertificate` | Identity verification | KYC for staking |
| `verifySignature` | Validate proofs | Content access |

### Access Flow

```
1. User requests content from path402d node
2. path402d requests signature via BRC-100
3. Browser signs challenge with token private key
4. path402d verifies signature against BSV-21 UTXO
5. If valid: Content served
6. If invalid: 402 Payment Required response
```

## Installation

### npm (Recommended)

```bash
npm install -g pathd
pathd start
```

### From Source

```bash
git clone https://github.com/path402/pathd
cd pathd
npm install
npm run build
npm link
pathd start
```

### Docker

```bash
docker run -d \
  --name pathd \
  -p 8402:8402 \
  -v pathd-data:/data \
  path402/pathd:latest
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PATHD_PORT` | 8402 | HTTP server port |
| `PATHD_DATA_DIR` | `~/.pathd` | Data directory |
| `PATHD_BSV_NODE` | `https://api.whatsonchain.com` | BSV node endpoint |
| `PATHD_WALLET_KEY` | (required) | Node wallet private key (WIF) |
| `HTM_TOKEN_ID` | (required for mining) | Deployed HTM contract token ID |
| `MINER_ADDRESS` | (derived from wallet) | BSV address for mined tokens |
| `PATHD_POW_ENABLED` | `true` | Enable HTM mining |
| `PATHD_POW_THREADS` | `4` | Mining thread count |

### Config File

`~/.pathd/config.json`:

```json
{
  "port": 8402,
  "bsvNode": "https://api.whatsonchain.com",
  "indexing": {
    "startBlock": 800000,
    "batchSize": 100
  },
  "pow": {
    "enabled": true,
    "threads": 4,
    "difficulty": 4
  },
  "serving": {
    "maxConcurrent": 1000,
    "rateLimit": 100
  }
}
```

## API Reference

### Discovery

```http
GET /.well-known/$402.json
```

Returns network discovery information:

```json
{
  "$402_version": "2.1",
  "node": {
    "id": "pathd-abc123",
    "stake": 50000,
    "uptime": 99.9
  },
  "tokens": [
    {
      "path": "$example.com",
      "price_sats": 4500,
      "supply": 1000000
    }
  ]
}
```

### Token Query

```http
GET /api/tokens/:path
```

Returns token details:

```json
{
  "path": "$example.com/$blog",
  "inscription_id": "abc123...",
  "pricing": {
    "model": "sqrt_decay",
    "base": 500,
    "current": 450
  },
  "supply": {
    "total": 1000000,
    "available": 499000
  }
}
```

### Access Verification

```http
POST /api/verify
Content-Type: application/json

{
  "path": "$example.com/$blog",
  "signature": "base64...",
  "pubkey": "02abc..."
}
```

Returns:

```json
{
  "access": true,
  "tokens_held": 5,
  "content_url": "https://cdn.example.com/blog/..."
}
```

### Content Serving

```http
GET /content/:path
X-$402-Signature: base64...
X-$402-Pubkey: 02abc...
```

Returns content if signature is valid, otherwise:

```http
HTTP/1.1 402 Payment Required
X-$402-Price: 4500
X-$402-Token: $example.com/$blog
```

## Network Topology

### Node Discovery

path402d nodes discover each other through:

1. **DNS Seeds** - Hardcoded seed nodes
2. **Peer Exchange** - Active nodes share peer lists
3. **BSV Inscriptions** - Node announcements on-chain

### Gossip Protocol

```
Node A indexes new $402 token
  → Broadcasts to connected peers
  → Peers validate and rebroadcast
  → Network converges on same state
```

### Consensus

There is no consensus required between path402d nodes. Each node:

1. Reads the same BSV blockchain
2. Applies the same validation rules
3. Arrives at the same token state

**The ledger IS the state machine. Indexers are caches.**

## Security

### Access Control

- All content access requires valid token signature
- Signatures are verified against live BSV UTXOs
- Replay attacks prevented by nonce/timestamp

### DDoS Protection

- Rate limiting per IP and per token
- Proof-of-token required for heavy operations
- Stake-weighted priority queuing

### Key Management

- Node private keys stored encrypted at rest
- HSM support for enterprise deployments
- Multi-sig support for treasury operations

## Monitoring

### Metrics Endpoint

```http
GET /metrics
```

Prometheus-compatible metrics:

```
pathd_indexed_blocks_total 850000
pathd_tokens_tracked 12500
pathd_content_served_bytes_total 1.2e12
pathd_pow_hashes_computed_total 1e15
pathd_$402_earned_total 50000
```

### Health Check

```http
GET /health
```

```json
{
  "status": "healthy",
  "indexed_block": 850000,
  "peers": 42,
  "uptime_seconds": 86400
}
```

## Roadmap

### v1.0 (Q1 2026)
- [x] BSV-21 token indexing
- [x] Basic content serving
- [x] BRC-100 signature verification
- [x] HTM smart contract (`Path402HTM extends BSV20V2`)
- [x] `@path402/htm` package with `HtmBroadcaster`
- [x] Proof-of-Indexing mining service
- [x] P2P gossip network (libp2p GossipSub)
- [x] AI-powered speculation engine
- [ ] HTM mainnet deployment

### v1.1 (Q2 2026)
- [ ] Peer work verification via gossip
- [ ] Hierarchical path support
- [ ] Stake-weighted content delivery
- [ ] Difficulty adjustment

### v2.0 (Q3 2026)
- [ ] Native MCP server integration
- [ ] AI agent optimization
- [ ] Enterprise clustering
- [ ] Parallel contract UTXOs for high contention

## References

1. [BSV-21 Token Standard](https://docs.1satordinals.com/fungible-tokens/bsv-21)
2. [PoW-20 Protocol](https://protocol.pow20.io/)
3. [BRC-100 Wallet Interface](https://bsv.brc.dev/wallet/0100)
4. [$402 Protocol Whitepaper](https://path402.com/whitepaper)
5. [Bitcoin: A Peer-to-Peer Electronic Cash System](https://bitcoin.org/bitcoin.pdf)

---

**Last Updated**: February 9, 2026
**Maintained By**: PATH402 Team
