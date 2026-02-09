# $402 Hash-to-Mint (HTM) Token

**Version**: 1.0.0
**Date**: February 2026
**Status**: Implemented (pending mainnet deployment)

## Overview

$402 is a **Proof-of-Work mining token** on the BSV blockchain. It incentivizes operators who run the path402 client — the software that indexes, serves, and trades content tokens across the $402 network.

$402 is earned exclusively through mining. There is no pre-mine, no ICO, no treasury allocation, and no team reserve. 100% of supply goes to miners who do useful work for the network.

## Two-Token Model

The $402 ecosystem has **two distinct tokens**. They serve different purposes and have completely different economics:

| | **$402 (Mining Token)** | **$PATH402 (Equity Token)** |
|---|---|---|
| **Purpose** | Reward network operators | Protocol revenue share |
| **Supply** | 21,000,000 | 1,000,000,000 |
| **Distribution** | 100% mined via PoW | Treasury sale (sqrt_decay) |
| **Standard** | BSV-21 HTM smart contract | BSV-20 |
| **Dividends** | No | Yes (Tier 2, KYC required) |
| **How to get** | Run path402 client, mine | Buy from treasury or OTC |
| **Regulatory** | Commodity (no issuer) | Security (equity-like) |
| **Docs** | This document | [TOKEN_ARCHITECTURE.md](TOKEN_ARCHITECTURE.md) |

**These are separate tokens.** $402 is what you earn by running the network. $PATH402 is what you buy if you want equity in the protocol company.

## HTM Smart Contract

### What is HTM?

HTM stands for **Hash-to-Mint**. It's a BSV-21 smart contract written in sCrypt that locks the entire 21M token supply at deployment. Tokens are released only when a caller provides a valid Proof-of-Work solution.

The contract is implemented as `Path402HTM extends BSV20V2` using the `scrypt-ord` library.

### Contract Parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Protocol** | BSV-21 (smart contract) | Not inscription — on-chain sCrypt |
| **Symbol** | `402` | |
| **Max Supply** | 21,000,000 | Bitcoin-inspired cap |
| **Decimals** | 0 | Whole tokens only |
| **Mint Limit** | 1,000 per solution | Base reward before halving |
| **Difficulty** | 5 leading zero hex chars | ~1 in 1,048,576 per hash |
| **Hash Algorithm** | Double SHA-256 | `SHA256(SHA256(preimage))` |
| **Halving** | Every 10,500 solutions | 1000 → 500 → 250 → ... |
| **Total Solutions** | ~41,979 | Until supply exhausted |
| **Distribution** | 100% to miners | 0% team, 0% treasury |

### Supply Schedule

```
Era 1:  Solutions     1 – 10,500  →  1,000 per solution  =  10,500,000
Era 2:  Solutions 10,501 – 21,000  →    500 per solution  =   5,250,000
Era 3:  Solutions 21,001 – 31,500  →    250 per solution  =   2,625,000
Era 4:  Solutions 31,501 – 42,000  →    125 per solution  =   1,312,500
...continued halving until 21,000,000 reached
```

### How Mining Works

The mining challenge requires three things in the hash preimage:

1. **Previous contract UTXO txid** (32 bytes) — prevents pre-computation
2. **Work commitment** (32 bytes) — merkle root of indexing work performed
3. **Miner address** (20 bytes) — prevents front-running in the mempool
4. **Nonce** (variable) — the miner's solution

```
preimage = contractTxId + workCommitment + minerAddress + nonce
hash = SHA256(SHA256(preimage))
if hash < difficultyTarget → MINT SUCCEEDS
```

### What the Contract Enforces On-Chain

| Rule | How |
|------|-----|
| PoW difficulty met | `hash256(challenge) < target` verified in Bitcoin Script |
| Miner address bound | `dest` is part of the hash preimage |
| Work commitment recorded | `workCommitment` is permanent on-chain |
| Supply cap (21M) | `supply -= amount; assert(supply >= 0)` |
| Halving schedule | `amount = lim / 2^era` computed on-chain |
| Output integrity | `hash256(outputs) == hashOutputs` |
| Single-spend | UTXO model — only one mint per contract UTXO per block |

### What Happens Off-Chain (Gossip Network)

| Rule | Where |
|------|-------|
| Work commitment is honest | L2 peers verify merkle roots |
| Indexing work was actually done | L2 peers compare index state |
| Difficulty adjustment | Gossip consensus (new contract UTXO) |

## Proof of Indexing

Mining $402 isn't just hash puzzles — it's **Proof of Indexing**. Every mint permanently records a merkle root of useful work the miner performed for the network.

### Work Items

The path402 client accumulates work items as it operates:

| Type | Triggered By |
|------|-------------|
| `tx_indexed` | Indexed a BSV-21 token transfer |
| `content_served` | Served content to a peer |
| `stamp_validated` | Validated a ticket stamp chain |
| `market_indexed` | Indexed a 1sat market listing |
| `peer_relayed` | Relayed a gossip message |

### Mining Loop

```
1. Client performs useful work (indexing, serving, relaying)
2. Work items accumulate in mempool
3. When mempool >= 5 items:
   a. Take up to 10 items
   b. Compute merkleRoot = SHA256 merkle tree of items
   c. Build challenge: contractTxId + merkleRoot + minerAddress + nonce
   d. Mine: find nonce where hash256(challenge) < target
4. On solution found:
   a. Submit to HTM contract on-chain → $402 minted
   b. Broadcast to gossip network → peers verify work
   c. Remove mined items from mempool
5. Repeat
```

## Running the Client

### Package: `@path402/htm`

The HTM smart contract and broadcaster are packaged as `@path402/htm` in the path402 monorepo.

```typescript
import { HtmBroadcaster } from '@path402/htm'

const broadcaster = new HtmBroadcaster(tokenId, walletKeyWif)
const result = await broadcaster.broadcastMint(merkleRoot)
// result: { success: true, txid: "abc...", amount: 1000n }
```

### Agent Configuration

The path402 client (`Path402Agent`) integrates HTM mining automatically:

```bash
# Environment variables
HTM_TOKEN_ID=<deployment_txid>_0    # The deployed contract token ID
PATHD_WALLET_KEY=<wif_private_key>  # Miner's wallet key
MINER_ADDRESS=<bsv_address>        # Where mined tokens go
```

When `HTM_TOKEN_ID` and a wallet key are set, the agent:
1. Loads the `@path402/htm` artifact
2. Creates an `HtmBroadcaster` instance
3. Connects the broadcaster to the `ProofOfIndexingService`
4. Mining runs automatically alongside indexing/serving

### Economics

| Cost | Typical |
|------|---------|
| VPS hosting | ~$5-20/month |
| BSV transaction fees | ~0.5 sat/byte |
| Bandwidth | Variable (content serving) |
| Electricity (PoW) | Negligible (CPU mining) |

| Revenue Stream | Currency |
|---------------|----------|
| Mining $402 | $402 tokens → sell for BSV |
| Content trading | BSV |
| Content serving | BSV (via ticket resale) |
| Market making | BSV (arbitrage) |

## Security

### Anti-Frontrun

The miner's address (`dest`) is part of the hash preimage. If another miner sees your solution in the mempool and tries to substitute their address, the hash changes and the solution becomes invalid.

### Anti-Precompute

The previous contract UTXO txid (`contractTxId`) is part of the preimage and changes with every successful mint. Solutions can only be valid for the current contract state.

### UTXO Contention

Since the HTM contract is a single UTXO chain, only one mint can succeed per block. When multiple miners find solutions simultaneously, only the first to be mined wins — others get a "UTXO spent" error and retry with the new contract state.

The `HtmBroadcaster` handles this automatically with retry logic.

## Source Code

| Component | Location |
|-----------|----------|
| HTM Smart Contract | `path402/packages/htm/src/contracts/htm.ts` |
| HtmBroadcaster | `path402/packages/htm/src/broadcaster.ts` |
| Contract Artifact | `path402/packages/htm/artifacts/htm.json` |
| Deploy Script | `path402/contracts/htm/deploy.ts` |
| Mine Script | `path402/contracts/htm/mine.ts` |
| Agent Integration | `path402/packages/core/src/client/agent.ts` |
| Mining Service | `path402/packages/core/src/services/mining.ts` |
| Full Spec | `path402/docs/PROOF_OF_INDEXING_HTM_SPEC.md` |

## References

- [sCrypt BSV20V2 Base Class](https://github.com/sCrypt-Inc/scrypt-ord)
- [BSV-21 Token Standard](https://docs.1satordinals.com/fungible-tokens/bsv-21)
- [POW-20 Protocol](https://protocol.pow20.io/)
- [Full HTM Spec (path402 core)](../../../path402/docs/PROOF_OF_INDEXING_HTM_SPEC.md)

---

**Last Updated**: February 9, 2026
