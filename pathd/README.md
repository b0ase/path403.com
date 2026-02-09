# $pathd

> A tiny daemon that lets private networks price access to files.

## What is this?

`$pathd` is a daemon that sits on any machine and serves content behind `$PATH` addresses. When someone requests content, they get a 402 Payment Required response with pricing info. When they pay, they get the content — and the right to serve it to others.

## Position in the Stack

```
$PATH protocol (the idea)
├── $402 spec (the HTTP response format)
├── $pathd (the daemon)                    ← YOU ARE HERE
├── path402-mcp-server (AI agent tools)
└── b0ase.com/exchange (hosted marketplace)
```

## Quick Start

```bash
# Build
cd pathd
go build -o pathd ./cmd/pathd

# Configure
cp pathd.example.yaml pathd.yaml
# Edit pathd.yaml with your paths and wallet

# Run
./pathd -config pathd.yaml
```

## Publish (Local Registry)

`pathd publish` creates or updates a local registry entry for a specific $PATH.
This is the off-chain "publish" step used to bind path metadata to a content hash.

```bash
./pathd publish -config pathd.yaml -path "/$blog/$my-post" -out pathd.registry.json
```

## Publish (Inscription Payload)

Generate an inscription payload and OP_RETURN hex for on-chain publishing.
You can broadcast the OP_RETURN using your preferred wallet or tool.

```bash
./pathd publish -config pathd.yaml -path "/$blog/$my-post" -inscribe \
  -payload-out pathd.publish.json -opreturn-out pathd.publish.opreturn
```

Estimate the fee for a basic publish transaction:

```bash
./pathd publish -config pathd.yaml -path "/$blog/$my-post" -estimate-fee -fee-rate 1.0
```

## The Litmus Test

If `$pathd` can do this, it's done:

> Two nodes in a Tailnet. One hosts content behind $PATH. The other pays, receives it, then serves it to a third. All payments settle automatically.

## How It Works

1. **You configure paths** — Tell the daemon what files to serve at what prices
2. **Client requests content** — `GET /$blog/$my-post`
3. **Daemon returns 402** — With price, payment address, and nonce
4. **Client pays** — Sends SATs to the address
5. **Client retries with proof** — `X-Path-Payment: txid=abc...`
6. **Daemon verifies and serves** — Content delivered, serve event logged

## Configuration

```yaml
node:
  name: my-node
  listen: 127.0.0.1:4020

wallet:
  chain: BSV
  receive_address: 1YourAddress...

pricing:
  default_curve: sqrt_decay
  issuer_share: 0.20
  server_share: 0.80

paths:
  - path: "/$blog/$my-post"
    content:
      type: file
      location: /content/my-post.md
    pricing:
      base_price: 5
```

See [pathd.example.yaml](./pathd.example.yaml) for full configuration options.

## Pricing Curves

| Curve | Formula | Use Case |
|-------|---------|----------|
| `sqrt_decay` | `base / √(supply + 1)` | Default. Early buyers get value, late buyers get cheap access |
| `fixed` | `base` | Same price for everyone |
| `log_decay` | `base / log(supply + 2)` | Gentler price decrease |
| `linear_floor` | `max(floor, base - supply * rate)` | Linear decrease to minimum |

## What This Daemon Does

- ✅ Serves HTTP 402 responses with pricing metadata
- ✅ Verifies BSV payments
- ✅ Serves content after payment
- ✅ Logs serve events for revenue splitting
- ✅ Calculates prices based on supply curves

## What This Daemon Does NOT Do

- ❌ Discovery / search
- ❌ UI / frontend
- ❌ Moderation
- ❌ Token exchanges
- ❌ KYC
- ❌ Platform logic

Those belong to other components.

## Wire Protocol

### 402 Response

```http
HTTP/1.1 402 Payment Required
Content-Type: application/json

{
  "path": "/$blog/$my-post",
  "price": 5,
  "currency": "SAT",
  "pay_to": "bsv:1abc...",
  "nonce": "xyz123"
}
```

### Paid Request

```http
GET /$blog/$my-post
X-Path-Payment: txid=abc123...
X-Path-Nonce: xyz123
```

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `/*` | Content paths (returns 402 or content) |
| `/_pathd/health` | Health check |
| `/_pathd/stats` | Serving statistics |

## Development

```bash
# Install dependencies
go mod download

# Build
go build -o pathd ./cmd/pathd

# Run tests
go test ./...
```

## Status

**v0.1.0 — MVP**

- ✅ Config loading
- ✅ HTTP server with 402 responses
- ✅ Pricing calculations (all curves)
- ✅ SQLite ledger
- ✅ Basic wallet stub
- 🔲 Real BSV transaction verification
- 🔲 Serving tokens (JWT for rehosting rights)
- 🔲 Payout automation

## Related

- [PATHD_SPEC.md](../docs/PATHD_SPEC.md) — Full specification
- [path402-mcp-server](../lib/mcp-servers/) — AI agent tools
- [b0ase.com/exchange](https://b0ase.com/exchange) — Hosted marketplace

## License

MIT
