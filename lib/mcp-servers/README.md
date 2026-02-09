# path402-mcp-server

MCP server for **$402 tokenised content** and **x402 multi-chain payment verification**.

Enables AI agents to:
- Discover, evaluate, acquire, and serve tokenised content ($402 protocol)
- Verify, settle, and inscribe payments across chains (x402 facilitator)

## Quick Start

```bash
npm install path402-mcp-server
npx path402-mcp-server
```

## Two Protocol Families

### $402 Protocol (Tokenised Content)

Turn any URL path into a priced, tokenised market. Put a `$` in front of a path segment and it becomes an economic object with a price curve, supply count, holders who serve content, and revenue that flows to participants.

```
$b0ase.com                    → site-level token
$b0ase.com/$blog              → section token
$b0ase.com/$blog/$my-post     → content token
```

### x402 Protocol (Multi-Chain Payments)

Compatible with Coinbase's x402 specification. Verify payment signatures from BSV, Base, Solana, and Ethereum. Settle payments on any chain. Inscribe permanent proofs on BSV.

```
Client → x402 payment signature → PATH402.com → BSV inscription
```

## Tools

### $402 Protocol Tools (10)

| Tool | Description |
|------|-------------|
| `path402_discover` | Probe a $address — get pricing, supply, revenue model, nested paths |
| `path402_evaluate` | Budget check — should the agent buy? Returns ROI estimate |
| `path402_acquire` | Pay and receive token + content. Agent becomes a serving node |
| `path402_serve` | Serve content to a requester and earn revenue |
| `path402_wallet` | View balance, tokens held, total spent/earned, net position |
| `path402_servable` | List all content the agent can serve (tokens with serving rights) |
| `path402_economics` | Deep dive into breakeven, ROI projections, and the math |
| `path402_batch_discover` | Discover multiple $addresses at once (efficient exploration) |
| `path402_price_schedule` | See how price decays with supply for a given endpoint |
| `path402_set_budget` | Configure the agent's spending budget |

### x402 Facilitator Tools (5)

| Tool | Description |
|------|-------------|
| `x402_verify` | Verify payment signature from any chain (BSV, Base, Solana, Ethereum) |
| `x402_settle` | Settle payment with optional BSV inscription. Routes to cheapest chain |
| `x402_inscription` | Retrieve inscription proof by ID |
| `x402_stats` | Get facilitator statistics (inscriptions, fees, networks) |
| `x402_discover` | Fetch facilitator capabilities (/.well-known/x402.json) |

## Usage with Claude Desktop

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

### $402 Examples

```
> "Discover what's available at $b0ase.com/$blog"
> "Is it worth buying this content?"
> "Show me the economics of $b0ase.com/$blog/$metaweb-economics"
> "Acquire the token for $b0ase.com/$blog/$metaweb-economics"
> "Show me my wallet"
> "What content can I serve?"
```

### x402 Examples

```
> "Verify this x402 payment from Base"
> "Settle the payment on BSV (cheapest)"
> "Get inscription abc123_0"
> "Show me x402 facilitator stats"
> "Discover the x402 facilitator capabilities"
```

## x402 Multi-Chain Support

PATH402.com acts as an x402 facilitator that:
- Verifies payment signatures from any supported chain
- Settles payments (defaults to BSV for lowest fees)
- Inscribes permanent proofs on BSV

### Supported Networks

| Network | Signature Type | Assets |
|---------|---------------|--------|
| **BSV** | Bitcoin signature | BSV, PATH402 |
| **Base** | EIP-712 | USDC, ETH |
| **Solana** | Ed25519 | USDC, SOL |
| **Ethereum** | EIP-712 | USDC, ETH, USDT |

### Fee Structure

| Service | Fee |
|---------|-----|
| Verification | 200 sats |
| Inscription | 500 sats |
| Settlement | 0.1% (min 100 sats) |

## $402 Agent Workflow

```
1. DISCOVER  →  Agent probes a $address, reads pricing terms
2. EVALUATE  →  Agent checks budget, estimates ROI
3. ACQUIRE   →  Agent pays, receives token + content
4. SERVE     →  Agent holds token, earns from future buyers
5. REPEAT    →  Agent reinvests earnings, grows portfolio
```

### Self-Funding Agents

Under sqrt_decay pricing with proportional serving, **every buyer except the last achieves positive ROI**. This is a mathematical property of the curve. An agent that:

1. Acquires undervalued tokens early
2. Serves content to later buyers
3. Reinvests earnings into new tokens

...eventually operates at profit.

### Economics Analysis

```
> "Show me the economics of $b0ase.com/$premium/$guide"

## $402 Economics: $b0ase.com/$premium/$guide

### Current State
- Supply: 23 tokens issued
- Your Position: #24 (next buyer)
- Price to Acquire: 208 SAT
- Pricing Model: sqrt_decay

### Breakeven Analysis
- Buyers needed to break even: 12
- Supply at breakeven: 36
- Breakeven probability: High

### ROI Projections
| Supply Level | ROI |
|--------------|-----|
| 46 (2x current) | 67% |
| 230 (10x current) | 412% |
| 1000 (projected) | 1847% |
```

## x402 Verification Flow

```
> "Verify this Base USDC payment"

## x402 Verification: BASE

**Valid:** true
**From:** 0x1234...
**To:** 0x5678...
**Amount:** 1000000 (1 USDC)

### BSV Inscription
**Inscription ID:** abc123def456_0
**Transaction:** abc123def456...
**Explorer:** https://whatsonchain.com/tx/abc123def456...

### Fees
**Verification:** 200 sats
**Inscription:** 500 sats
**Total:** 700 sats
```

## Architecture

```
path402-mcp-server/
├── src/
│   ├── index.ts              # MCP server + all tool registration
│   ├── types.ts              # $402 protocol types
│   ├── constants.ts          # Protocol constants
│   ├── types/
│   │   └── x402.ts           # x402 protocol types
│   ├── schemas/
│   │   ├── inputs.ts         # $402 input schemas
│   │   └── x402-inputs.ts    # x402 input schemas
│   ├── services/
│   │   ├── client.ts         # $402 HTTP client
│   │   ├── pricing.ts        # Price calculation engine
│   │   ├── wallet.ts         # Token portfolio + serving
│   │   └── x402-client.ts    # x402 API client (path402.com)
│   └── tools/
│       └── x402.ts           # x402 tool registration
└── dist/                     # Compiled JavaScript
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PATH402_API_URL` | `https://path402.com` | x402 facilitator URL |
| `TRANSPORT` | `stdio` | Transport mode (`stdio` or `http`) |
| `PORT` | `3402` | HTTP server port (when TRANSPORT=http) |

## Related Links

| Resource | Link |
|----------|------|
| **PATH402.com** | [path402.com](https://path402.com) |
| **$402 Standard** | [path402.com/402](https://path402.com/402) |
| **x402 Discovery** | [path402.com/.well-known/x402.json](https://path402.com/.well-known/x402.json) |
| **Token Exchange** | [path402.com/exchange](https://path402.com/exchange) |
| **Documentation** | [path402.com/docs](https://path402.com/docs) |
| **npm Package** | [npmjs.com/package/path402-mcp-server](https://www.npmjs.com/package/path402-mcp-server) |

## Version History

### v1.0.0 — x402 Facilitator Integration

- **NEW**: 5 x402 tools for multi-chain payment verification
- **NEW**: BSV inscription for permanent payment proofs
- **NEW**: Cross-chain settlement with fee comparison
- **CHANGED**: License changed from MIT to Open BSV License v4
- All existing $402 tools unchanged (backward compatible)

### v0.2.0 — Enhanced Agent Tools

- Full $402 tool suite (discover, evaluate, acquire, serve, wallet, economics)
- Batch discovery for efficient exploration
- Servable content listing with ROI tracking
- Detailed economics analysis with breakeven and projections

## License

Open BSV License v4 — This software can only be used on the Bitcoin SV blockchain.

See [LICENSE](./LICENSE) for full terms.
