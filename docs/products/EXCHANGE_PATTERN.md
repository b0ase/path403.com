# The Exchange Pattern - Architecture Document

> **Status**: Draft
> **Last Updated**: 2026-01-25
> **Type**: Pattern Documentation (not a single product)

---

## Overview

**Key Insight**: The Exchange is not a product — it's THE pattern.

Every b0ase application follows the same architecture:
1. A **useful frontend** (writing, files, spreadsheets, games)
2. An **embedded exchange** as the backend
3. Connected to **MoneyButton → Cashboard → Divvy** plumbing

This document describes the Exchange Pattern so individual product PRDs can reference it without re-documenting the same architecture.

---

## The Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                      USER-FACING APP                         │
│         (Bitcoin Writer, Drive, Spreadsheet, etc.)          │
│                                                             │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐      │
│   │   Create    │   │    Save     │   │   Share     │      │
│   │  Document   │   │   to Chain  │   │  /Publish   │      │
│   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘      │
│          │                 │                 │              │
│          └────────────────┬┴─────────────────┘              │
│                           │                                 │
│                    ┌──────▼──────┐                          │
│                    │  EXCHANGE   │  ← Every action has      │
│                    │   LAYER     │    economic value        │
│                    └──────┬──────┘                          │
└───────────────────────────┼─────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
        ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
        │  MONEY    │ │ CASHBOARD │ │   DIVVY   │
        │  BUTTON   │ │           │ │           │
        │ (trigger) │ │ (coord)   │ │ (distrib) │
        └───────────┘ └───────────┘ └───────────┘
```

---

## What "Exchange Layer" Means

Every app has an embedded exchange that handles:

### 1. Token Economics
- App has its own token (e.g., $WRITER, $DRIVE, $SHEET)
- Users earn/spend tokens through app usage
- Token represents ownership stake in that app's revenue

### 2. Payment Triggers
- User actions trigger MoneyButton payments
- Examples:
  - Save document → 1 sat
  - Premium feature → 100 sats
  - Storage upgrade → 1000 sats

### 3. Revenue Routing
- Payments flow through Cashboard rules
- Automatic splits:
  - X% → App treasury
  - Y% → Token holder dividends
  - Z% → b0ase master treasury ($BOASE)

### 4. Dividend Distribution
- App revenue → Divvy
- Divvy calculates proportional payouts
- Token holders receive their share

---

## Implementation Layers

### Layer 1: Wallet Integration
Every app needs wallet connectivity for payments and auth.

**Required Primitives:**
| Package | Purpose |
|---------|---------|
| `@b0ase/handcash` | Primary wallet (OAuth, payments) |
| `@b0ase/yours-wallet` | Secondary wallet (BSV-20 tokens) |
| `@b0ase/multi-wallet-auth` | Unified auth across wallets |

**Standard Implementation:**
```typescript
// Every app has this pattern
import { createHandCashClient } from '@b0ase/handcash';
import { createYoursWallet } from '@b0ase/yours-wallet';

const auth = {
  handcash: createHandCashClient({ appId: 'YOUR_APP' }),
  yours: createYoursWallet()
};

// Login flow
const login = () => auth.handcash.connect();

// Payment flow
const pay = (amount) => auth.handcash.pay({
  destination: TREASURY_ADDRESS,
  amount
});
```

### Layer 2: Token System
Every app has its own token on the bonding curve.

**Required Primitives:**
| Package | Purpose |
|---------|---------|
| `@b0ase/bonding-curve` | Price calculation |
| `@b0ase/inscription-service` | On-chain token creation |
| `@b0ase/tx-builder` | Transaction construction |

**Token Creation Pattern:**
```typescript
import { createBondingCurve } from '@b0ase/bonding-curve';

// App's token economics
const tokenConfig = {
  ticker: '$WRITER',
  supply: 1_000_000_000, // 1 billion
  curve: 'exponential',  // or 'linear', 'sigmoid'
  initialPrice: 0.0000001,
  finalPrice: 1000000
};

const curve = createBondingCurve(tokenConfig);
const priceForToken = (n) => curve.getPrice(n);
```

### Layer 3: Exchange Operations
Buy/sell/trade tokens within the app.

**Required Primitives:**
| Package | Purpose |
|---------|---------|
| `@b0ase/price-service` | Real-time pricing |
| `@b0ase/ledger` | Transaction ledger |
| `@b0ase/utxo-viz` | UTXO management |

**Exchange Pattern:**
```typescript
// Buy tokens
async function buyTokens(userId, amount) {
  const price = curve.getPrice(currentSupply);
  const cost = price * amount;

  // 1. Collect payment via MoneyButton
  await moneyButton.charge(userId, cost);

  // 2. Route through Cashboard
  await cashboard.route(cost, {
    dividends: 0.30,  // 30% to holders
    treasury: 0.70    // 70% to app
  });

  // 3. Credit tokens to user
  await db.tokens.increment(userId, amount);

  // 4. Update supply
  currentSupply += amount;
}
```

### Layer 4: Revenue Distribution
Dividends flow to token holders.

**Required Primitives:**
| Package | Purpose |
|---------|---------|
| `@b0ase/dividend-engine` | Calculation logic |
| `@b0ase/queue-manager` | Batch processing |

**Distribution Pattern:**
```typescript
import { createDividendEngine } from '@b0ase/dividend-engine';

const divvy = createDividendEngine({
  token: '$WRITER',
  paymentMethod: 'handcash'
});

// When revenue comes in
async function onRevenue(amount) {
  const pool = amount * 0.30; // 30% to dividends

  await divvy.distribute({
    pool,
    period: 'auto',
    holders: await db.getActiveHolders()
  });
}
```

---

## Standard App Architecture

Every b0ase app follows this structure:

```
app/
├── (auth)/
│   ├── login/
│   └── callback/
├── (app)/                    # App-specific features
│   ├── [feature]/
│   └── ...
├── exchange/                 # Embedded exchange
│   ├── buy/
│   ├── sell/
│   └── history/
├── dividends/                # Dividend view
│   ├── claim/
│   └── history/
└── api/
    ├── auth/
    ├── exchange/
    │   ├── buy/
    │   ├── sell/
    │   └── price/
    ├── dividends/
    │   ├── calculate/
    │   └── claim/
    └── [app-specific]/
```

---

## Integration Points

### MoneyButton Integration
Every payment action triggers MoneyButton:

```typescript
// Button press, save, purchase, etc.
const onAction = async (action) => {
  const cost = getPriceForAction(action);

  if (cost > 0) {
    await moneyButton.press({
      amount: cost,
      memo: `${APP_NAME}: ${action.type}`
    });
  }

  // Proceed with action
  await executeAction(action);
};
```

### Cashboard Integration
Revenue routing rules:

```typescript
// Define routing for this app
const routingRules = {
  trigger: 'on_payment',
  conditions: [{ source: APP_TREASURY }],
  actions: [
    { type: 'split', destination: DIVIDEND_POOL, percentage: 30 },
    { type: 'split', destination: OPERATIONS, percentage: 50 },
    { type: 'split', destination: BOASE_TREASURY, percentage: 20 }
  ]
};

await cashboard.createRule(routingRules);
```

### Divvy Integration
Dividend distribution:

```typescript
// Monthly dividend run
const monthlyDividends = async () => {
  const pool = await treasury.getBalance(DIVIDEND_POOL);
  const holders = await db.getTokenHolders();

  await divvy.distribute({
    pool,
    holders,
    period: `${currentMonth} ${currentYear}`
  });
};

// Schedule via cron
cron.schedule('0 0 1 * *', monthlyDividends);
```

---

## Apps Using This Pattern

| App | Token | Exchange Features |
|-----|-------|-------------------|
| Bitcoin Writer | $WRITER | Save = earn, Premium = spend |
| Bitcoin Drive | $DRIVE | Storage = spend, Share = earn |
| Bitcoin Spreadsheet | $SHEET | Compute = spend, Templates = earn |
| Bitcoin Chat | $CHAT | Messages = spend, Tips = earn |
| MoneyButton | $MONEYBUTTON | Press = earn/spend |
| Ninja Punk Girls | $NPG | Play = spend, Win = earn |

---

## Benefits of the Pattern

1. **Consistent UX**: Users learn once, use everywhere
2. **Shared Infrastructure**: One wallet login, one dividend view
3. **Network Effects**: $BOASE holders benefit from all apps
4. **Composability**: Apps can integrate with each other
5. **Reduced Development**: 60%+ of code is reusable

---

## Anti-Patterns to Avoid

❌ **Siloed tokens**: Each app with completely separate token economics
❌ **Manual dividends**: Admin manually calculating and sending
❌ **Single wallet**: Only supporting one wallet provider
❌ **Off-chain only**: Not inscribing tokens on-chain
❌ **No routing**: Payments going directly to founders, not through Cashboard

---

## Checklist for New Apps

When building a new app on the Exchange Pattern:

- [ ] Wallet integration (HandCash + Yours)
- [ ] Token defined (ticker, supply, curve)
- [ ] Exchange UI (buy/sell/history)
- [ ] MoneyButton triggers on key actions
- [ ] Cashboard routing rules configured
- [ ] Divvy integration for distributions
- [ ] $BOASE treasury receiving its share
- [ ] On-chain token inscription working

---

## Related Documents

- [MoneyButton PRD](moneybutton.md) - The trigger layer
- [Cashboard PRD](cashboard.md) - The coordination layer
- [Divvy PRD](divvy.md) - The distribution layer
- [Bitcoin Writer PRD](bitcoin-writer.md) - Example app (TBD)
- [Bitcoin Drive PRD](bitcoin-drive.md) - Example app (TBD)
- [Bitcoin Spreadsheet PRD](bitcoin-spreadsheet.md) - Example app (TBD)

---

*This pattern is the foundation of the b0ase ecosystem. Every dollar flows through this architecture, irrigating upward to $BOASE holders.*
