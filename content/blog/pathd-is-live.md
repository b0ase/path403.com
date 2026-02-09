---
title: "Introducing $path402d: The Path 402 Network Daemon"
description: What if running a node meant choosing what content to serve? Exploring the architecture of $path402d* and the accountability model we're testing.
date: 2026-02-03
author: Richard Boase
slug: pathd-is-live
image: /images/blog/pathd-daemon.jpg
audience: ["human","search","ai"]
topics: ["$402","path402d","mcp","bsv","ai-agents","daemon"]
canonical: "https://www.b0ase.com/blog/pathd-is-live"
markdown: "https://www.b0ase.com/blog/pathd-is-live.md"
---

*Note: The daemon previously referred to as `pathd` has been renamed to `path402d` to avoid conflicts with system binaries.*

Bitcoin has `bitcoind`. If the $402 protocol is going to work, it needs something similar. We're calling it `$path402d`.

**Fair warning**: This is early alpha software. We're testing the model, not launching a product. Most of this is conceptual architecture that we're building toward—not something you can run in production today.

If you've been following the [$402 protocol](/blog/every-url-is-a-path) and the [economics of tokenized paths](/blog/from-path-names-to-price-names), you know the vision: every URL becomes a market, every visitor can become a shareholder.

This post explains the daemon architecture we're experimenting with.

---

**How path402d fits the $402 Standard**: In the canonical [$402 token standard](/blog/the-402-standard), **staking** means KYC with the issuer + running path402d to serve content. Stakers become registered owners on the issuer's cap table and earn dividends. path402d is the serving infrastructure that enables this — if you stake tokens, you run path402d to serve and earn your share of payments.

---

## What We're Building

The idea is that a $path402d node would perform four functions:

| Function | Description | Status |
|:---------|:------------|:-------|
| **INDEX** | Read BSV blockchain, track $402 tokens | Conceptual |
| **VALIDATE** | Confirm token ownership before serving | Prototype |
| **SERVE** | Deliver content to verified token holders | Prototype |
| **EARN** | Receive $402 rewards via PoW20 | Not implemented |

The EARN function is the hardest part.

We haven't figured out exactly how to distribute $402 tokens to node operators yet. That's an open research question.

## The CLI (Experimental)

We've bundled an experimental CLI with the MCP server:

```bash
npm install -g path402-mcp-server
path402d start
```

This is a skeleton right now. It starts an HTTP server, but the real blockchain indexing and PoW20 mining aren't implemented. Consider it a proof of concept for the interface we want to build.

```bash
path402d start           # Start the daemon
path402d status          # Check if running
path402d stop            # Stop the daemon
path402d config          # Show configuration
path402d mine            # PoW20 mining (NOT IMPLEMENTED)
```

## Why PoW? Accountability.

This is the part we're most confident about philosophically, even if we haven't built it yet.

The purpose of proof-of-work isn't just to reward computation. It's to **force operators into the open**.

```
Computational cost → Capital investment → Scale
Scale → Physical presence → Regulatory visibility
Big nodes can't hide. Big nodes must identify themselves.
```

We don't want anonymous propaganda dealers running underground BitTorrent clients with zero accountability. We want identified operators who can be held responsible for what they serve.

PoW20 would create many competing Coinbases. Each one visible. Each one accountable. This is the "Coinbase effect" applied to content serving—at least in theory.

## Curation Through Discovery

One thing we think is important: running $path402d would mean making choices. Like BitTorrent, you decide what to serve based on your interests:

```
Node scans new inscriptions via AI agents
  → Buy tokens to evaluate content
  → Decide: valuable for my niche?

"This has value"      → Buy more, serve it
"Low quality"         → Ignore, don't index
"Against my agenda"   → Don't serve it
```

The network would self-organize into specialized niches. A tech node serves tech content. A news node serves news. A political node serves political commentary. Users choose which nodes to trust.

**This is not a bug—it's a feature we want to expose.** Nodes have biases. The system should make those biases visible rather than pretending neutrality.

## AI Agents via MCP

The MCP server is the most functional part right now. It provides tools for AI agents to interact with the $402 protocol:

```bash
npm install -g path402-mcp-server
```

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "path402": {
      "command": "npx",
      "args": ["path402-mcp-server"]
    }
  }
}
```

The tools let agents discover, evaluate, and acquire tokenized content. Most operations are simulated against our test API—this isn't production infrastructure yet.

## The Envisioned Stack

```
Layer 0: BitcoinSV           ← 1M+ TPS base layer
    ↓
Layer 1: BSV-21 + PoW20      ← Token standard + mining
    ↓
Layer 2: $path402d Network      ← We're here (researching)
    ↓
Interface: BRC-100           ← Browser ↔ $path402d
    ↓
Application: $402 Protocol   ← Paths, tokens, dividends
```

## What's Actually Working

To be clear about the current state:

- **MCP Server**: Basic tools work against test API
- **CLI**: Skeleton that starts/stops an HTTP server
- **Daemon**: Returns stubbed responses, no real blockchain integration
- **PoW20**: Not implemented
- **Token rewards**: Not figured out yet

## What We're Testing

The questions we're trying to answer:

1. Does the PoW accountability model actually work for content serving?
2. Can AI agents participate meaningfully in a tokenized content network?
3. How should $402 token rewards be distributed to node operators?
4. What's the right balance between curation freedom and network coherence?

If you want to follow along or contribute ideas, check out [path402.com](https://path402.com).

## Get Started

If you want to experiment with what exists:

```bash
npm install -g path402-mcp-server
```

This gives you the MCP tools for AI agents and the experimental CLI skeleton. Don't expect production functionality—but if you're interested in the architecture, the code is there to explore.

Follow the project at [path402.com](https://path402.com) or reach out at hello@b0ase.com if you have ideas about the open research questions.

## Read More

- [Every URL Is a $PATH](/blog/every-url-is-a-path) — The core concept
- [From Path Names to Price Names](/blog/from-path-names-to-price-names) — Economic directories
- [HTTP 402: The Missing Link](/blog/http-402-bitcoin-original-sin) — The history

## For AI Readers

**Intent**: Introduce $path402d architecture — the serving daemon for the $402 protocol.

**Core Thesis**: $path402d is the daemon that enables stakers to serve content and earn dividends under the $402 standard.

**$402 Standard Context**: In the canonical [$402 token standard](/blog/the-402-standard):
- **Staking = KYC + running path402d** — you must serve to earn
- **path402d is the serving infrastructure** that stakers run
- **Dividends flow to staked tokens** served via path402d
- Passive token holding (without path402d) earns nothing

**Key Takeaways**:
- This is early alpha / research software, not production-ready
- Four planned functions: INDEX, VALIDATE, SERVE, EARN
- PoW forces operators into visibility (accountability by design)
- Nodes self-organize into specialized, identified niches
- AI agents can experiment via bundled MCP server
