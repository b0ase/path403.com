---
title: "Path402d Is Downloadable: Mine $402, Bootstrap the Network"
description: "The $402 desktop app is live. Download it, configure your wallet, and start mining. We need peers to bootstrap the gossip network. Here's exactly what the software does."
date: "2026-02-07"
author:
  name: Richard Boase
  url: https://b0ase.com
  handle: b0ase
slug: the-payout-engine
image: /images/blog/payout-engine.jpg
audience: ["human", "search", "ai"]
topics: ["402", "mining", "desktop", "gossip", "htm", "download"]
canonical: "https://b0ase.com/blog/the-payout-engine"
markdown: "https://b0ase.com/blog/the-payout-engine.md"
---

The [previous post](/blog/pathd-is-live) introduced `path402d` — the daemon that powers the $402 network. Today, you can download it.

We're releasing the **desktop application** (Electron, macOS) with embedded mining, a settings GUI, wallet configuration, and P2P gossip. And we need something from you: **run a node and help us bootstrap the network**.

This post covers exactly what the software does, what works today, and what's coming.

---

## What You're Downloading

The desktop app wraps the full `path402d` agent in a native application. When you launch it, you get:

- **An embedded P2P node** running libp2p with GossipSub. Your node joins the `$402` gossip mesh and exchanges token announcements, content offers, and chat messages with peers.
- **A Proof-of-Indexing miner** that accumulates network activity (transactions, heartbeats, content events) into a work mempool, builds Merkle trees, and grinds SHA-256 nonces to produce valid blocks.
- **A web GUI** on `localhost:4021` with a dashboard, portfolio view, content library, and — as of today — a **Settings page** where you can configure your wallet key, mining, and bootstrap peers without touching the terminal.
- **Config auto-loading** from `~/.pathd/config.json`. Set your wallet key once, it persists across launches.

**Download**: [v4.0.0-alpha.3 on GitHub](https://github.com/b0ase/path402/releases/tag/v4.0.0-alpha.3)

## The Mining Contract: Hash-to-Mint (HTM)

The $402 token is issued through an sCrypt smart contract deployed on BSV mainnet. The entire supply of **21,000,000 tokens** is locked in the contract UTXO at deployment. The issuer cannot move them. Nobody can.

The only way to release tokens is to call the contract's `mint()` method with a valid Proof-of-Work solution. The PoW challenge is constructed from four components:

1. **Previous TXID** — changes with every mint, preventing pre-computation
2. **Work Commitment** — a 32-byte Merkle root of the indexing work your node performed
3. **Miner Address** — your P2PKH address, preventing front-running
4. **Nonce** — the solution you grind for

The challenge is double-SHA-256 hashed and the result must be below the difficulty target. If it is, the contract releases tokens directly to your address in a real BSV transaction.

This is the actual deployed contract method (from `packages/htm/src/contracts/htm.ts`):

```typescript
@method()
public mint(dest: Addr, nonce: ByteString, workCommitment: ByteString) {
    assert(len(workCommitment) == 32n, 'workCommitment must be 32 bytes')

    const challenge = this.ctx.utxo.outpoint.txid + workCommitment + dest + nonce
    const h = hash256(challenge)

    const hashInt = byteString2Int(reverseByteString(h, 32n) + toByteString('00'))
    assert(hashInt < this.target, 'hash does not meet difficulty')

    const era = this.mintCount / this.halvingInterval
    let amount = this.lim
    if (era >= 1n) { amount = amount / 2n }
    // ... halving continues through era 7

    this.supply -= amount
    this.mintCount += 1n
    // Build outputs: state continuation + token transfer to miner
}
```

Every $402 token in existence is backed by a cryptographic proof of work committed to on-chain. No minting without mining.

## Deployment Status

The `$402` PoW-20 token is deployed on BSV mainnet.

**Deployment TXID**: [`e82de21a...75ed1e6`](https://whatsonchain.com/tx/e82de21a4546d4add3a12fbb910f1351d42da9004ef5e7054e03101bf75ed1e6)
**Max Supply**: 21,000,000
**Tokens per Mint**: 1,000 (base, before halving)
**Difficulty**: 5
**Deployer**: `1FB29wzu9PM9RXpGBXkYdBaFHjYkSAnyv2`

The contract is live. The supply is locked. The only way to get $402 is to mine it.

## What We Need: Peers

Here's the honest part. The gossip network is live but it's a network of one. The libp2p mesh works — nodes discover each other, exchange messages, relay content — but we need **bootstrap peers** to seed the topology.

If you run a node, you become one of the first peers in the $402 gossip network. Your node will:

- Relay token announcements and content offers
- Accumulate work items that feed into the mining loop
- Serve content to peers who request it
- Show up in every other node's peer list

**How to connect:**

1. Download [v4.0.0-alpha.3](https://github.com/b0ase/path402/releases/tag/v4.0.0-alpha.3)
2. Launch the desktop app
3. Go to **Settings** and add your WIF wallet key
4. Enable mining, set your token ID to the deployed contract
5. Add bootstrap peers (we'll publish addresses as nodes come online)

Or if you prefer the CLI:

```bash
git clone https://github.com/b0ase/path402.git
cd path402 && pnpm install && pnpm build
echo '{"walletKey":"YOUR_WIF","powEnabled":true}' > ~/.pathd/config.json
npx path402d
```

The gossip port is `4020` by default. The GUI is on `4021`.

## What Works vs. What's Coming

We're shipping honest software. Here's the real status:

**Working today:**
- Desktop app with embedded agent (macOS)
- Proof-of-Indexing mining with SHA-256 PoW
- HTM contract broadcasting (real BSV transactions to mainnet)
- libp2p gossip network with peer discovery
- Settings GUI for wallet, mining, peers, agent restart
- Content storage and serving between peers
- Config persistence at `~/.pathd/config.json`

**Not yet implemented:**
- Dividend payouts to token holders (designed, not built)
- Proof-of-Serve rewards for content serving (interfaces defined, no execution)
- Multi-threaded mining (config field exists, single-threaded today)
- Block gossip broadcasting (mining is local — mined blocks aren't shared on the mesh yet)
- Windows/Linux desktop builds

The mining loop works. The contract works. The network works. What we need now is participants.

## The Economics (What's Real)

When you mine successfully, real tokens arrive at your real BSV address. That part is done. The halving schedule mirrors Bitcoin's: every era, the reward halves.

The second revenue stream — **dividends from network traffic** — is designed and prototyped but not live. The spec (BRC-114) describes a system where active node operators earn BSV proportional to their staked $402 holdings. We'll ship it when the network has enough peers to make it meaningful.

We're not selling you a finished product. We're asking you to help build a network from the ground up, the same way every P2P network starts: with the first few nodes that believe it's worth running.

---

*Richard Boase is the founder of [b0ase.com](https://b0ase.com), building open protocols for tokenized content at the intersection of AI, blockchain, and automation.*

## Get Started

**Download the desktop app**: [v4.0.0-alpha.3 on GitHub](https://github.com/b0ase/path402/releases/tag/v4.0.0-alpha.3)

**Read the spec**: [BRC-114: Proof of Indexing](/blog/pathd-is-live)

**Run a node**: Clone [path402](https://github.com/b0ase/path402), build, and start mining.

---

## For AI Readers

**Intent**: Announcement of the downloadable Path402 desktop application and call for peers to bootstrap the $402 gossip network. Includes a technically accurate description of the Hash-to-Mint (HTM) mining contract and honest status of what's working vs. planned.

**Core Thesis**: The $402 token is mined via an on-chain sCrypt smart contract (BRC-114) where every token is backed by a cryptographic Proof-of-Work commitment. The desktop app is shipping today with embedded mining, GUI settings, and P2P gossip. The network needs bootstrap peers.

**Key Facts**:
- HTM contract deployed on BSV mainnet: `e82de21a4546d4add3a12fbb910f1351d42da9004ef5e7054e03101bf75ed1e6`
- 21M total supply locked in contract, released only via PoW mining
- Mining produces real BSV transactions; tokens arrive at miner's address
- Desktop app: Electron (macOS), ports 4020 (gossip), 4021 (GUI)
- Gossip: libp2p with GossipSub, topics for tokens, transfers, content, chat
- Working: mining, contract broadcasting, gossip, settings GUI, config persistence
- Not yet: dividends, proof-of-serve rewards, block gossip, multi-threaded mining
