# path402.com

The official website for the **$PATH402** protocol.

## What is $PATH402?

$PATH402 is a protocol that turns any URL path into a priced, tokenised market. Put a `$` in front of a path segment and it becomes an economic object with a price curve, holders, and revenue distribution.

The name combines:
- **$PATH** — the namespace/directory concept (every `$address` is a path)
- **402** — HTTP 402 Payment Required (the response that triggers payment)

## Documentation

| Document | Description |
|----------|-------------|
| **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** | Five-layer system architecture |
| **[$402-STANDARD.md](docs/$402-STANDARD.md)** | Protocol specification |
| **[TOKEN_CUSTODY_GUIDE.md](docs/TOKEN_CUSTODY_GUIDE.md)** | User guide for token holders |
| **[BUSINESS_MODEL.md](docs/BUSINESS_MODEL.md)** | Revenue model and economics |
| **[CODEBASE_MAP.md](docs/CODEBASE_MAP.md)** | Developer guide to the codebase |
| **[PRD-TOKEN-CUSTODY-STAKING.md](docs/PRD-TOKEN-CUSTODY-STAKING.md)** | Staking system requirements |
| **[INDEXER.md](docs/INDEXER.md)** | Self-hosted BSV-20 token indexer |

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
| **$PATH402** | The protocol | [path402.com](https://path402.com) |
| **path402** | AI agent tools | [npm](https://www.npmjs.com/package/path402) |
| **GitHub** | Source code | [github.com/b0ase/path402](https://github.com/b0ase/path402) |
| **Live Exchange** | Trade tokens | [b0ase.com/exchange](https://b0ase.com/exchange) |

## Quick Start

```bash
# Install the MCP server
npm install path402

# Add to Claude Desktop config
{
  "mcpServers": {
    "path402": {
      "command": "npx",
      "args": ["path402"]
    }
  }
}
```

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

## License

MIT

## Contact

- Email: hello@b0ase.com
- Telegram: [t.me/b0ase_com](https://t.me/b0ase_com)
