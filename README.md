# path402.com

The official website for the **$402 protocol**.

## What is $402?

$402 is a protocol that turns any URL path into a priced, tokenised market. Put a `$` in front of a path segment and it becomes an economic object with a price curve, holders, and revenue distribution.

## The Token: $402

One token. Simple.

- **$402** is a PoW mining token on BSV (21M supply, 100% mined, no pre-mine)
- Run the path402 client → earn $402 by mining
- Mining uses a Hash-to-Mint (HTM) sCrypt smart contract with Proof-of-Indexing
- Nodes buy content tokens they want to serve (like BitTorrent — you choose what you propagate)
- Nodes earn from serving content they've bought
- You only serve what you buy — no acting as a conduit for traffic you don't agree with

See [HTM_TOKEN.md](docs/HTM_TOKEN.md) for the full mining token spec.

## How It Works

```
1. Run path402 client         → Join the P2P network
2. Client indexes BSV-21 tokens → Useful work for the network
3. Client mines $402           → Proof-of-Indexing rewards
4. Buy content tokens          → Choose what to serve
5. Serve content to peers      → Earn from serving
6. Audit your content          → Only propagate what you approve
```

The network is **permissioned by the operator**: each node decides what content to buy, index, and serve. No node is forced to serve anything. Like BitTorrent, curation happens at the operator level.

## Documentation

| Document | Description |
|----------|-------------|
| **[DOC_INDEX.md](docs/DOC_INDEX.md)** | Full documentation index |
| **[HTM_TOKEN.md](docs/HTM_TOKEN.md)** | $402 Hash-to-Mint mining token spec |
| **[PROTOCOL_VISION.md](docs/PROTOCOL_VISION.md)** | Canonical protocol design |
| **[PATHD_ARCHITECTURE.md](docs/PATHD_ARCHITECTURE.md)** | path402d client architecture |
| **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** | Five-layer system architecture |
| **[$402-STANDARD.md](docs/$402-STANDARD.md)** | HTTP 402 protocol specification |

## Running the Client

```bash
# Set environment
export HTM_TOKEN_ID=<deployed_contract_txid>_0
export PATHD_WALLET_KEY=<your_wif_private_key>

# Run the agent
npx path402 agent start
```

The client:
1. Connects to the P2P gossip network (libp2p)
2. Indexes BSV-21 token transfers
3. Serves content to peers who hold valid tokens
4. Mines $402 via Proof-of-Indexing (HTM contract)
5. Optionally runs AI-powered content speculation

## Ecosystem

| Component | Description | Link |
|-----------|-------------|------|
| **path402.com** | Protocol website | [path402.com](https://path402.com) |
| **path402** | Client + MCP server (turbo monorepo) | [github.com/b0ase/path402](https://github.com/b0ase/path402) |
| **@path402/htm** | HTM smart contract package | `path402/packages/htm` |
| **@path402/core** | Core client library | `path402/packages/core` |
| **path402 desktop** | Electron desktop client | `path402/apps/desktop` |

## Development

```bash
pnpm install
pnpm dev
pnpm build
```

## Deployment

Deployed on Vercel at [path402.com](https://path402.com).

Also serves as the codebase for:
- [path401.com](https://path401.com) — `NEXT_PUBLIC_SITE_VARIANT=401`
- [path403.com](https://path403.com) — `NEXT_PUBLIC_SITE_VARIANT=403`

## License

MIT

## Contact

- Email: hello@b0ase.com
- Telegram: [t.me/b0ase_com](https://t.me/b0ase_com)
