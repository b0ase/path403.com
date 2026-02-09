# path402-mcp-server Updates Specification

## Current State (v1.0)

The MCP server currently has **10 tools**:

| Tool | Status | Description |
|------|--------|-------------|
| `path402_discover` | ✅ Implemented | Probe $address for pricing |
| `path402_batch_discover` | ✅ Implemented | Batch discovery |
| `path402_evaluate` | ✅ Implemented | ROI assessment |
| `path402_economics` | ✅ Implemented | Financial analysis |
| `path402_price_schedule` | ✅ Implemented | Price curve |
| `path402_acquire` | ✅ Implemented | Purchase tokens |
| `path402_set_budget` | ✅ Implemented | Configure budget |
| `path402_wallet` | ✅ Implemented | View holdings |
| `path402_serve` | ✅ Implemented | Distribute content |
| `path402_servable` | ✅ Implemented | List servable content |

## New Tools to Add (v1.1)

### 1. `path402_transfer`

Transfer tokens to another address.

```typescript
{
  name: "path402_transfer",
  description: "Transfer tokens to another $address or BSV address",
  inputSchema: {
    type: "object",
    properties: {
      token: {
        type: "string",
        description: "$address of the token to transfer (e.g., $example.com/$api)"
      },
      amount: {
        type: "number",
        description: "Number of tokens to transfer"
      },
      recipient: {
        type: "string",
        description: "Recipient $address, BSV address, or paymail"
      }
    },
    required: ["token", "amount", "recipient"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "txId": "abc123...",
  "from": "$agent.wallet",
  "to": "$recipient.address",
  "amount": 100,
  "token": "$example.com/$api",
  "fee_sats": 10
}
```

### 2. `path402_history`

View transaction history for the agent's wallet.

```typescript
{
  name: "path402_history",
  description: "View transaction history for your wallet",
  inputSchema: {
    type: "object",
    properties: {
      token: {
        type: "string",
        description: "Filter by specific token (optional)"
      },
      type: {
        type: "string",
        enum: ["all", "acquire", "serve", "transfer"],
        description: "Filter by transaction type"
      },
      limit: {
        type: "number",
        description: "Max transactions to return (default 20)"
      }
    }
  }
}
```

**Response:**
```json
{
  "transactions": [
    {
      "id": "tx_123",
      "type": "acquire",
      "token": "$example.com/$api",
      "amount": 100,
      "price_sats": 1000,
      "timestamp": "2026-02-02T10:00:00Z",
      "txId": "abc123..."
    }
  ],
  "total": 45,
  "hasMore": true
}
```

### 3. `path402_register`

Register a new $address as an issuer/creator.

```typescript
{
  name: "path402_register",
  description: "Register a new $address to issue tokens for your content",
  inputSchema: {
    type: "object",
    properties: {
      address: {
        type: "string",
        description: "The $address to register (e.g., $yourdomain.com/$content)"
      },
      base_price_sats: {
        type: "number",
        description: "Base price in satoshis (default 500)"
      },
      pricing_model: {
        type: "string",
        enum: ["sqrt_decay", "fixed", "linear_decay"],
        description: "Pricing model (default sqrt_decay)"
      },
      max_supply: {
        type: "number",
        description: "Maximum token supply (optional)"
      },
      description: {
        type: "string",
        description: "Description of the content/service"
      },
      content_url: {
        type: "string",
        description: "URL to the gated content"
      }
    },
    required: ["address", "description"]
  }
}
```

### 4. `x402_verify`

Verify a payment proof from any supported chain.

```typescript
{
  name: "x402_verify",
  description: "Verify a payment proof via the x402 facilitator (multi-chain)",
  inputSchema: {
    type: "object",
    properties: {
      payment_proof: {
        type: "string",
        description: "The payment proof/signature to verify"
      },
      network: {
        type: "string",
        enum: ["bsv", "base", "solana", "ethereum"],
        description: "The source blockchain network"
      },
      expected_amount: {
        type: "number",
        description: "Expected payment amount in sats"
      },
      expected_recipient: {
        type: "string",
        description: "Expected recipient address"
      }
    },
    required: ["payment_proof", "network"]
  }
}
```

**Response:**
```json
{
  "valid": true,
  "network": "base",
  "amount_sats": 1000,
  "recipient": "0x...",
  "sender": "0x...",
  "txId": "0x...",
  "timestamp": "2026-02-02T10:00:00Z",
  "facilitator": "path402.com"
}
```

### 5. `x402_settle`

Settle a cross-chain payment through the facilitator.

```typescript
{
  name: "x402_settle",
  description: "Settle a payment via the x402 facilitator with BSV inscription",
  inputSchema: {
    type: "object",
    properties: {
      payment_id: {
        type: "string",
        description: "The verified payment ID to settle"
      },
      recipient_address: {
        type: "string",
        description: "BSV address to receive the settlement"
      }
    },
    required: ["payment_id", "recipient_address"]
  }
}
```

**Response:**
```json
{
  "settled": true,
  "settlement_txId": "bsv_tx_123...",
  "inscription_id": "inscription_456...",
  "amount_sats": 980,
  "fee_sats": 20,
  "facilitator_fee_sats": 100
}
```

### 6. `x402_inscription`

Get or create a BSV inscription proof for a payment.

```typescript
{
  name: "x402_inscription",
  description: "Get BSV inscription proof for a payment (creates if doesn't exist)",
  inputSchema: {
    type: "object",
    properties: {
      payment_id: {
        type: "string",
        description: "Payment ID to inscribe"
      },
      payment_proof: {
        type: "string",
        description: "Original payment proof (if creating new inscription)"
      }
    },
    required: ["payment_id"]
  }
}
```

**Response:**
```json
{
  "inscription_id": "inscription_456...",
  "txId": "bsv_tx_789...",
  "content_type": "application/json",
  "content": {
    "type": "x402_payment_proof",
    "original_network": "base",
    "original_txId": "0x...",
    "amount_sats": 1000,
    "timestamp": "2026-02-02T10:00:00Z"
  },
  "explorer_url": "https://whatsonchain.com/tx/bsv_tx_789..."
}
```

---

## Implementation Priority

### Phase 1 (Critical - v1.1)
1. `x402_verify` — Core facilitator functionality
2. `x402_settle` — Complete the payment flow
3. `x402_inscription` — Proof persistence

### Phase 2 (Important - v1.2)
4. `path402_transfer` — Token mobility
5. `path402_history` — Transaction tracking

### Phase 3 (Creator Tools - v1.3)
6. `path402_register` — Issuer self-service

---

## API Endpoints

The MCP server calls these PATH402.com endpoints:

### Single Token ($PATH402)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/token/stats` | GET | $PATH402 token statistics |
| `/api/token/preview` | POST | Preview purchase cost |
| `/api/token/buy` | POST | Acquire $PATH402 tokens |
| `/api/token/holding` | GET | User's $PATH402 holdings |
| `/api/token/cap-table` | GET | All $PATH402 holders |

### Multi-Tenant Marketplace (Any $address)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/tokens` | GET | List all registered tokens |
| `/api/tokens` | POST | Register new $address |
| `/api/tokens/[address]` | GET | Token details + price schedule |
| `/api/tokens/[address]` | POST | Acquire tokens |
| `/api/tokens/holdings` | GET | User's holdings (all tokens) |
| `/api/tokens/transfer` | POST | Transfer tokens |
| `/api/tokens/history` | GET | Transaction history |

### x402 Facilitator

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/.well-known/x402.json` | GET | Discovery document |
| `/api/x402/verify` | POST | Verify payment proof |
| `/api/x402/settle` | POST | Settle cross-chain payment |
| `/api/x402/inscription` | GET/POST | Inscription management |
| `/api/x402/stats` | GET | Facilitator statistics |

---

## Configuration Updates

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "path402": {
      "command": "npx",
      "args": ["path402-mcp-server"],
      "env": {
        "PATH402_API_URL": "https://path402.com",
        "PATH402_WALLET_KEY": "your-wallet-key",
        "PATH402_DEFAULT_BUDGET": "10000"
      }
    }
  }
}
```

---

## Testing Checklist

- [ ] `x402_verify` works with BSV payments
- [ ] `x402_verify` works with Base USDC payments
- [ ] `x402_verify` works with Solana payments
- [ ] `x402_settle` creates BSV inscription
- [ ] `x402_inscription` retrieves existing proofs
- [ ] `path402_transfer` moves tokens between addresses
- [ ] `path402_history` shows all transaction types
- [ ] `path402_register` creates new $address with correct pricing

---

## Version History

- **v1.0.0** — Initial release with 10 tools
- **v1.1.0** — Add x402 facilitator tools (verify, settle, inscription)
- **v1.2.0** — Add transfer and history tools
- **v1.3.0** — Add register tool for creators
