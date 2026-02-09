# MCP Server Update Plan: v0.2.0 → v1.0.0

## Overview

Update `path402-mcp-server` to add x402 facilitator tools while maintaining backward compatibility with existing $402 protocol tools.

**Location:** `/Volumes/2026/Projects/b0ase.com/lib/mcp-servers/`
**Current Version:** 0.2.0 (MIT License)
**Target Version:** 1.0.0 (Open BSV License v4)

---

## Scope Analysis

### Existing Tools (PRESERVE - No Breaking Changes)

| Tool | Purpose | Status |
|------|---------|--------|
| `path402_discover` | Probe $address for pricing terms | Keep unchanged |
| `path402_evaluate` | Budget check before purchase | Keep unchanged |
| `path402_acquire` | Pay and receive token + content | Keep unchanged |
| `path402_wallet` | View token portfolio | Keep unchanged |
| `path402_price_schedule` | See price vs supply curve | Keep unchanged |
| `path402_set_budget` | Set agent spending limit | Keep unchanged |
| `path402_serve` | Serve content, earn revenue | Keep unchanged |
| `path402_economics` | ROI and breakeven analysis | Keep unchanged |
| `path402_batch_discover` | Discover multiple addresses | Keep unchanged |
| `path402_servable` | List tokens with serve rights | Keep unchanged |

**Compatibility Promise:** All existing tools will work exactly as before. No schema changes, no behavior changes.

### New Tools (ADD)

| Tool | Purpose | x402 Endpoint |
|------|---------|---------------|
| `x402_verify` | Verify payment signature from any chain | `/api/x402/verify` |
| `x402_settle` | Settle payment with optional BSV inscription | `/api/x402/settle` |
| `x402_inscription` | Retrieve inscription by ID | `/api/x402/inscription/:id` |
| `x402_stats` | Get facilitator statistics | `/api/x402/stats` |
| `x402_discover` | Fetch facilitator discovery document | `/.well-known/x402.json` |

---

## Architecture Decision

### Two Protocol Families

```
path402-mcp-server v1.0.0
├── $402 Protocol (existing)
│   ├── Token-based content access
│   ├── sqrt_decay pricing
│   ├── Serving rights & revenue
│   └── Local wallet simulation
│
└── x402 Facilitator (new)
    ├── Multi-chain payment verification
    ├── BSV inscription service
    ├── Settlement across chains
    └── Remote API calls to path402.com
```

### Key Differences

| Aspect | $402 Tools | x402 Tools |
|--------|-----------|------------|
| Focus | Content tokens | Payment verification |
| Pricing | Dynamic (sqrt_decay) | Fee-based |
| State | Local wallet | Remote API |
| Target | AI content consumption | Cross-chain notarization |

---

## Implementation Plan

### Phase 1: New Types

**File:** `src/types/x402.ts`

```typescript
// x402 types (compatible with Coinbase spec)
export type SupportedNetwork = 'bsv' | 'base' | 'solana' | 'ethereum';

export interface X402VerifyRequest {
  x402Version: number;
  scheme: 'exact' | 'upto';
  network: SupportedNetwork;
  payload: {
    signature: string;
    authorization: {
      from: string;
      to: string;
      value: string;
      validAfter: string;
      validBefore: string;
      nonce: string;
    };
  };
  inscribe?: boolean;
}

export interface X402VerifyResponse {
  valid: boolean;
  invalidReason?: string;
  inscriptionId?: string;
  inscriptionTxId?: string;
  fee?: {
    verification: number;
    inscription: number;
    total: number;
  };
}

export interface X402SettleRequest extends X402VerifyRequest {
  paymentRequirements?: {
    asset?: string;
    maxAmountRequired?: string;
    resource?: string;
  };
  settleOn?: SupportedNetwork;
}

export interface X402Inscription {
  id: string;
  txId: string;
  blockHeight?: number;
  timestamp: number;
  fee: number;
  proof: {
    p: 'x402-notary';
    v: number;
    origin: { chain: SupportedNetwork; txId: string };
    payment: { from: string; to: string; amount: string; asset: string };
  };
  explorerUrl: string;
}

export interface X402FacilitatorStats {
  facilitator: string;
  version: string;
  status: string;
  stats: {
    totalInscriptions: number;
    totalFeesCollected: number;
    byOriginChain: Record<SupportedNetwork, number>;
  };
  fees: {
    verification: { amount: number; currency: string };
    inscription: { amount: number; currency: string };
    settlement: { percent: number; minimum: number; currency: string };
  };
}
```

### Phase 2: New Schemas

**File:** `src/schemas/x402-inputs.ts`

```typescript
import { z } from 'zod';

export const X402VerifyInputSchema = z.object({
  x402Version: z.number().default(1),
  scheme: z.enum(['exact', 'upto']).default('exact'),
  network: z.enum(['bsv', 'base', 'solana', 'ethereum']),
  payload: z.object({
    signature: z.string(),
    authorization: z.object({
      from: z.string(),
      to: z.string(),
      value: z.string(),
      validAfter: z.string(),
      validBefore: z.string(),
      nonce: z.string(),
    }),
  }),
  inscribe: z.boolean().default(true),
});

export const X402SettleInputSchema = X402VerifyInputSchema.extend({
  paymentRequirements: z.object({
    asset: z.string().optional(),
    maxAmountRequired: z.string().optional(),
    resource: z.string().optional(),
  }).optional(),
  settleOn: z.enum(['bsv', 'base', 'solana', 'ethereum']).default('bsv'),
});

export const X402InscriptionInputSchema = z.object({
  inscriptionId: z.string(),
});

export const X402StatsInputSchema = z.object({
  response_format: z.enum(['markdown', 'json']).default('markdown'),
});

export const X402DiscoverInputSchema = z.object({
  response_format: z.enum(['markdown', 'json']).default('markdown'),
});
```

### Phase 3: API Client

**File:** `src/services/x402-client.ts`

```typescript
const BASE_URL = process.env.PATH402_API_URL || 'https://path402.com';

export async function verifyPayment(request: X402VerifyRequest): Promise<X402VerifyResponse> {
  const response = await fetch(`${BASE_URL}/api/x402/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return response.json();
}

export async function settlePayment(request: X402SettleRequest): Promise<X402SettleResponse> {
  const response = await fetch(`${BASE_URL}/api/x402/settle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return response.json();
}

export async function getInscription(id: string): Promise<X402Inscription | null> {
  const response = await fetch(`${BASE_URL}/api/x402/inscription/${id}`);
  if (!response.ok) return null;
  return response.json();
}

export async function getStats(): Promise<X402FacilitatorStats> {
  const response = await fetch(`${BASE_URL}/api/x402/stats`);
  return response.json();
}

export async function getDiscovery(): Promise<object> {
  const response = await fetch(`${BASE_URL}/.well-known/x402.json`);
  return response.json();
}
```

### Phase 4: New Tools Registration

**File:** `src/tools/x402.ts`

Register 5 new tools:

1. **x402_verify** - Verify multi-chain payment signatures
2. **x402_settle** - Settle payments with BSV inscription
3. **x402_inscription** - Retrieve inscription details
4. **x402_stats** - Get facilitator statistics
5. **x402_discover** - Fetch facilitator capabilities

### Phase 5: Update Index

**File:** `src/index.ts` changes:

```typescript
// Import x402 tools
import { registerX402Tools } from './tools/x402.js';

// Register existing $402 tools (unchanged)
// ...

// Register new x402 tools
registerX402Tools(server);
```

### Phase 6: License Change

**File:** `LICENSE`

Replace MIT with Open BSV License v4:

```
Open BSV License v4

Copyright (c) 2026 Richard Boase / b0ase

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

1. The above copyright notice and this permission notice shall be
   included in all copies or substantial portions of the Software.

2. The Software, and any software that is derived from the Software
   or parts thereof, can only be used on the Bitcoin SV blockchains.
   The Bitcoin SV blockchains are defined, for purposes of this
   license, as the Bitcoin blockchain containing block height #556767
   with the hash "000000000000000001d956714215d96ffc00e0afda4cd0a96c96f8d802b1662b"
   and the test combinator combinator of combinator blockchain combinator thereof.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED...
```

### Phase 7: Package.json Updates

```json
{
  "name": "path402-mcp-server",
  "version": "1.0.0",
  "description": "MCP server for $402 tokenised content and x402 payment verification - AI agent tools for BSV",
  "license": "OpenBSV-4.0",
  "keywords": [
    "mcp",
    "mcp-server",
    "path402",
    "402",
    "x402",
    "micropayments",
    "bsv",
    "bitcoin",
    "claude",
    "anthropic",
    "coinbase-x402",
    "multi-chain"
  ]
}
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/types/x402.ts` | Create | x402 type definitions |
| `src/schemas/x402-inputs.ts` | Create | Zod schemas for x402 tools |
| `src/services/x402-client.ts` | Create | HTTP client for path402.com API |
| `src/tools/x402.ts` | Create | x402 tool registrations |
| `src/index.ts` | Edit | Import and register x402 tools |
| `package.json` | Edit | Version 1.0.0, license, keywords |
| `LICENSE` | Replace | MIT → OpenBSV4 |
| `README.md` | Edit | Document x402 tools |

---

## Breaking Change Analysis

### No Breaking Changes

- All existing `path402_*` tools unchanged
- All existing schemas unchanged
- All existing types unchanged
- Existing tool behavior preserved

### Additions Only

- 5 new `x402_*` tools
- New types for x402 protocol
- New API client for path402.com

---

## Testing Plan

1. **Existing Tools**: Run all path402_* tools, verify unchanged behavior
2. **New Tools**: Test each x402_* tool against path402.com API
3. **Integration**: Test full flow: verify → settle → inscription lookup
4. **Error Handling**: Test invalid inputs, network errors, API failures

---

## Rollback Strategy

If issues discovered:
1. Revert to v0.2.0 tag
2. All existing functionality preserved
3. x402 tools can be fixed independently

---

## Timeline

| Phase | Description | Files |
|-------|-------------|-------|
| 1 | Types | 1 new |
| 2 | Schemas | 1 new |
| 3 | API Client | 1 new |
| 4 | Tools | 1 new |
| 5 | Integration | 1 edit |
| 6 | License | 1 replace |
| 7 | Package | 2 edit |

**Total**: 4 new files, 4 edited/replaced files

---

## Verification Checklist

Before publishing v1.0.0:

- [ ] All path402_* tools work unchanged
- [ ] x402_verify works against path402.com
- [ ] x402_settle works against path402.com
- [ ] x402_inscription retrieves valid inscriptions
- [ ] x402_stats returns facilitator data
- [ ] x402_discover returns well-known document
- [ ] LICENSE is OpenBSV4
- [ ] package.json version is 1.0.0
- [ ] README documents all 15 tools
- [ ] TypeScript compiles without errors
- [ ] npm publish dry-run succeeds
