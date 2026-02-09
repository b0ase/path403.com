# path402.com

The official website for the **$402 protocol**.

## What is $402?

$402 is a protocol that turns any URL path into a priced, tokenised market. Put a `$` in front of a path segment and it becomes an economic object with a price curve, holders, and revenue distribution.

The name combines:
- **$PATH** — the namespace/directory concept (every `$address` is a path)
- **402** — HTTP 402 Payment Required (the response that triggers payment)

## Two Tokens

The ecosystem has two distinct tokens:

| | **$402** | **$PATH402** |
|---|---|---|
| **What** | PoW mining token | Equity token |
| **Supply** | 21M (mined via HTM contract) | 1B (treasury sale) |
| **How** | Run path402 client, mine | Buy from treasury |
| **Standard** | BSV-21 sCrypt smart contract | BSV-20 |

**$402** is the mining reward — earned by running the path402 client that indexes, serves, and trades content tokens. It uses a Hash-to-Mint (HTM) sCrypt smart contract (`Path402HTM extends BSV20V2`) with Proof-of-Indexing.

**$PATH402** is the equity instrument — buy it for protocol revenue share (70/30 split, KYC required for dividends).

See [HTM_TOKEN.md](docs/HTM_TOKEN.md) for full mining token details.

## Documentation

| Document | Description |
|----------|-------------|
| **[DOC_INDEX.md](docs/DOC_INDEX.md)** | Full documentation index |
| **[HTM_TOKEN.md](docs/HTM_TOKEN.md)** | $402 Hash-to-Mint mining token spec |
| **[PROTOCOL_VISION.md](docs/PROTOCOL_VISION.md)** | Canonical protocol design (10 steps) |
| **[PATHD_ARCHITECTURE.md](docs/PATHD_ARCHITECTURE.md)** | path402d client architecture |
| **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** | Five-layer system architecture |
| **[$402-STANDARD.md](docs/$402-STANDARD.md)** | HTTP 402 protocol specification |
| **[BUSINESS_MODEL.md](docs/BUSINESS_MODEL.md)** | Revenue model and economics |
| **[TOKEN_ARCHITECTURE.md](docs/TOKEN_ARCHITECTURE.md)** | $PATH402 equity token details |
| **[TOKEN_CUSTODY_GUIDE.md](docs/TOKEN_CUSTODY_GUIDE.md)** | User guide for token holders |

## Running the Client

The path402 client mines $402 tokens while indexing and serving content:

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
3. Serves content to peers
4. Mines $402 via Proof-of-Indexing (HTM contract)
5. Optionally runs AI-powered speculation

## Pages

- `/` — Homepage with protocol overview
- `/token` — Buy, stake, and manage $PATH402 tokens
- `/account` — User dashboard and holdings
- `/registry` — Cap table and holder registry
- `/docs` — Full documentation
- `/exchange` — Token marketplace
- `/whitepaper` — Protocol whitepaper

## Ecosystem

| Component | Description | Link |
|-----------|-------------|------|
| **path402.com** | Protocol website | [path402.com](https://path402.com) |
| **path402** | Client + MCP server (turbo monorepo) | [github.com/b0ase/path402](https://github.com/b0ase/path402) |
| **@path402/htm** | HTM smart contract package | `path402/packages/htm` |
| **@path402/core** | Core client library | `path402/packages/core` |
| **path402 desktop** | Electron desktop client | `path402/apps/desktop` |
| **Live Exchange** | Trade tokens | [b0ase.com/exchange](https://b0ase.com/exchange) |

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

## Deployment

This site is deployed on Vercel at [path402.com](https://path402.com).

Also serves as the codebase for:
- [path401.com](https://path401.com) — `NEXT_PUBLIC_SITE_VARIANT=401`
- [path403.com](https://path403.com) — `NEXT_PUBLIC_SITE_VARIANT=403`

## License

MIT

## Contact

- Email: hello@b0ase.com
- Telegram: [t.me/b0ase_com](https://t.me/b0ase_com)
