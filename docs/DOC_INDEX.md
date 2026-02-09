# PATH402 Documentation Index

## Canonical Protocol Document

| Document | Description |
|----------|-------------|
| **[PROTOCOL_VISION.md](PROTOCOL_VISION.md)** | **START HERE** — The $402 protocol vision in 10 steps: Bearer Shares, Compliance, Pricing Curves, Paths as Entities, Hierarchical Ownership, Extensibility, Staking Partners, AI Agents, Network Incentives, Content Market |

> **Note**: PROTOCOL_VISION.md is the authoritative source for the $402 protocol design. Other documents may contain older terminology or partial implementations. When in doubt, defer to PROTOCOL_VISION.md.

---

## For Users

| Document | Description |
|----------|-------------|
| **[HTM_TOKEN.md](HTM_TOKEN.md)** | $402 Hash-to-Mint mining token — how to earn $402 by running the client |

## For Developers

| Document | Description |
|----------|-------------|
| **[CODEBASE_MAP.md](CODEBASE_MAP.md)** | Complete codebase architecture, file purposes, API reference |
| **[INDEXER.md](INDEXER.md)** | Self-hosted BSV-20 token indexer (polls treasury, updates balances) |
| **[RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md)** | Production deploy + npm publish checklist |
| **[DEPLOY_PLAYBOOK.md](DEPLOY_PLAYBOOK.md)** | Staging + production deploy playbook with environment checks |

## For Bots & Speculators

| Document | Description |
|----------|-------------|
| **[CONTENT_INSCRIPTION_SPEC.md](CONTENT_INSCRIPTION_SPEC.md)** | How to inscribe content leaves: format, metadata, signals, pricing |
| **[BOT_API_SPEC.md](BOT_API_SPEC.md)** | Bot-friendly APIs: scan, sample, buy, sell, stream, analytics |

## Protocol Specification

| Document | Description | Alignment Status |
|----------|-------------|------------------|
| **[PROTOCOL_VISION.md](PROTOCOL_VISION.md)** | Canonical $402 protocol (10 steps) | ✓ Source of truth |
| **[HTM_TOKEN.md](HTM_TOKEN.md)** | **$402 Hash-to-Mint mining token** — sCrypt contract, PoW mining, Proof of Indexing | ✓ Aligned |
| **[TREE_MODEL.md](TREE_MODEL.md)** | The 6 rules: paths, revenue flow, non-dilution, roots as index funds | ✓ New |
| **[$402-STANDARD.md]($402-STANDARD.md)** | HTTP 402 implementation spec v2.0.0 | ✓ Aligned |
| **[DOMAIN_VERIFICATION.md](DOMAIN_VERIFICATION.md)** | DNS + well-known + on-chain signature proof for issuers | ✓ New |
| **[PRICING_CURVES.md](PRICING_CURVES.md)** | Library of pricing curves for token issuers | ✓ Aligned |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | Five-layer architecture | ✓ Aligned |
| **[BRC_ALIGNMENT.md](BRC_ALIGNMENT.md)** | How Path402 maps to BRC‑100/103/104/105/22/24 | ✓ New |
| **[PATHD_ARCHITECTURE.md](PATHD_ARCHITECTURE.md)** | path402d daemon, HTM mining, visibility/accountability | ✓ Updated |

## Business

| Document | Description |
|----------|-------------|
| **[BUSINESS_MODEL.md](BUSINESS_MODEL.md)** | Revenue model, fee structure, facilitator economics |
| **[HTM_TOKEN.md](HTM_TOKEN.md)** | $402 mining token — the PoW reward for running the client |

## MCP Server

| Document | Description |
|----------|-------------|
| **[PATH402_MCP_SERVER_README.md](PATH402_MCP_SERVER_README.md)** | MCP server setup and tool reference |
| **[MCP_SERVER_UPDATES.md](MCP_SERVER_UPDATES.md)** | Recent updates to the MCP server |
| **[MCP_SERVER_UPDATE_PLAN.md](MCP_SERVER_UPDATE_PLAN.md)** | Planned MCP server improvements |

---

## Quick Links

**Run the client**: `npx path402 agent start`

**Protocol docs**: [path402.com/docs](https://path402.com/docs)

**MCP server**: [npmjs.com/package/path402-mcp-server](https://www.npmjs.com/package/path402-mcp-server)

**path402d daemon**: [path402.com/pathd](https://path402.com/pathd)

---

**Last Updated**: February 9, 2026
