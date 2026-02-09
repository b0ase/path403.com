# Token Architecture - b0ase.com

**Last Updated:** January 31, 2026
**Status:** DESIGN COMPLETE
**Blockchain:** Bitcoin SV (BSV-20 standard)

---

## The $ Mental Model: Tokens as a Global Filesystem

### $ = Directory

The `$` prefix represents a **folder/directory** in a global filesystem. A token is an endpoint within that directory — a tradeable position that can be assigned to a network address with corresponding private keys.

```
Traditional Filesystem          Bitcoin Token Filesystem
─────────────────────          ─────────────────────────
/home/user/documents/    →     $BOASE/
    file.txt             →         holder_address_1 (owns 1%)
    file2.txt            →         holder_address_2 (owns 0.5%)
                                   ...tradeable endpoints
```

When you search for `$PRAWNHUB`, you're doing a **path lookup** in a global database — checking if that directory exists and what endpoints it contains.

### Token Naming Conventions

| Pattern | Meaning | Examples |
|---------|---------|----------|
| `$b*` | bApps ecosystem (lowercase 'b' after $) | `$bMail`, `$bDrive`, `$bSearch` |
| `$NPG*` | NPG ecosystem properties | `$NPGRED`, `$NPG` |
| `$TOKEN` (no 'b') | Standalone venture | `$MONEYBUTTON`, `$DNSDEX`, `$DIVVY` |
| `$BOASE` | Master studio token | — |

**Key insight**: If there's no lowercase 'b' immediately after the `$`, it's NOT a bApp — it's a separate venture.

### The Kintsugi Philosophy

**Kintsugi** (金継ぎ) is the Japanese art of repairing broken pottery with gold, making the repairs visible rather than hiding them.

```
SHATTERED POTTERY (pre-Kintsugi):
  Scattered project fragments:
  $bDNS, $bSearch, $DNSDEX, $bWriter, $bMail...
  50+ pieces, no coherent product

GOLD LACQUER (Kintsugi process):
  • Kintsugi AI orchestrates assembly
  • Investors fund the gold (capital)
  • Token structure = visible seams

REPAIRED VESSEL (post-Kintsugi):
  • Coherent, sellable products
  • Each piece traceable via tokens
  • Revenue flows through the seams (Divvy)
```

The tokens ARE the visible gold seams — they show:
- How pieces were assembled
- Who funded what
- Where revenue flows

### Core Infrastructure Tokens

| Token | Role | Analogy |
|-------|------|---------|
| `$bDNS` | Name resolution | DNS (phone book) |
| `$bSearch` | Global indexer | Google (discovery) |

These solve the fundamental problem: **BSV has no global state machine** like ETH's EVM.

- ETH: Everyone agrees on transaction queue order → canonical state
- BSV: UTXO soup, each indexer has own view → no canonical state

`$bDNS` + `$bSearch` = the indexing layer that makes BSV usable like ETH.

### Investment Hierarchy

```
$BOASE (100%) ─────────────────── Master Studio Token
    ↓ creates
$KINTSUGI (100%) ─────────────── AI Engine (the goldsmith)
    ↓ powers
$bCorp (99%) ──┬── $NPG (85.35%) Companies/Ecosystems
               │
    ↓ contain  ↓
$bDNS, $bSearch, $bMail...      $AIGF, $TRIBE, $ZERODICE...
(100% each)                      (85.35% each via $NPG)
    ↓
$DNSDEX, $MONEYBUTTON, $DIVVY... Ventures (100% each)
```

**Dynamic ownership**: These percentages are current snapshots.
- External investors hold 14.65% of $NPG
- Craig Massey holds 1% of $bCorp

---

## Executive Summary

b0ase.com operates a **token bundle architecture** where:

1. **Invest once, own everything** - Investors receive proportional allocations in ALL b0ase tokens
2. **Standardized supply** - All tokens use 100B base supply for clean accounting
3. **Dividend flow** - Revenue from each product flows to that token's holders via Divvy
4. **One address, multiple tokens** - Investor receives their bundle at a single wallet address
5. **Tokens are issued on Bitcoin SV** using the BSV-20 standard

**The key insight:** Tokens ARE the product. Each product has its own token. Investors get proportional shares in all of them.

---

## Token Bundle Architecture

When you invest in b0ase, you don't just get one token - you get a **proportional allocation in ALL b0ase tokens**. This is the token bundle.

### Why a Bundle?

| Problem | Solution |
|---------|----------|
| "Which token should I buy?" | Get them all proportionally |
| Complex portfolio management | One address, multiple tokens |
| Missing upside on new products | Auto-included in future tokens |
| Fragmented dividends | Divvy aggregates all streams |

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│  INVESTOR: Alice invests £10,000 (1.25% of £800K raise)        │
│                                                                 │
│  Alice's Token Bundle (delivered to one BSV address):          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  INTERNAL PRODUCTS (b0ase owns 100%)                    │   │
│  │  ├── $BOASE    1,250,000,000 tokens (1.25% of 100B)    │   │
│  │  ├── $KINTSUGI 1,250,000,000 tokens (1.25% of 100B)    │   │
│  │  ├── $DIVVY    1,250,000,000 tokens (1.25% of 100B)    │   │
│  │  ├── $bSheets  1,250,000,000 tokens (1.25% of 100B)    │   │
│  │  ├── $bOS      1,250,000,000 tokens (1.25% of 100B)    │   │
│  │  └── $bWriter  1,250,000,000 tokens (1.25% of 100B)    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  SUBSIDIARY TOKENS (b0ase owns partial)                 │   │
│  │  ├── $NPG      Proportional to b0ase's 85.35% stake    │   │
│  │  └── $bCorp    Proportional to b0ase's 99% stake       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Alice also receives dividends via Divvy from ALL products     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Token Categories

### Category 1: Internal Products (100% b0ase Owned)

These tokens are fully owned by b0ase.com Ltd. Investors get proportional allocations.

| Token | Product | Supply | Status |
|-------|---------|--------|--------|
| **$BOASE** | Holding company / platform | 100B | PLANNED |
| **$KINTSUGI** | AI repair engine | 100B | PLANNED |
| **$DIVVY** | Dividend distribution tool | 100B | PLANNED |
| **$bSheets** | Bitcoin Spreadsheets | 100B | PLANNED |
| **$bOS** | Bitcoin Operating System | 100B | PLANNED |
| **$bWriter** | Writing/blogging app | 100B | PLANNED |
| **$bApps** | App marketplace | 100B | PLANNED |
| **$bWallet** | Wallet infrastructure | 100B | PLANNED |

### Category 2: Subsidiary Tokens (Partial Ownership)

b0ase owns stakes in these companies. Investors get proportional to b0ase's stake.

| Token | Company | b0ase Stake | Investor Gets |
|-------|---------|-------------|---------------|
| **$NPG** | Ninja Punk Girls Ltd | 85.35% | 85.35% of their proportional allocation |
| **$bCorp** | Bitcoin Corporation Ltd | 99% | 99% of their proportional allocation |

**Note:** Minority shareholders in NPG (14.65%) and bCorp (1% Massey) retain their own token rights, scoped to their respective companies only.

### Category 3: Kintsugi-Incubated Projects (Earned Through Work)

Kintsugi repairs external projects. b0ase earns tokens by doing the work, not automatically.

```
┌─────────────────────────────────────────────────────────────────┐
│  KINTSUGI EARNING MODEL                                         │
│                                                                 │
│  1. Founder submits broken project                              │
│  2. Kintsugi creates repair plan (10 tranches)                 │
│  3. Founder keeps 100% of project tokens initially             │
│  4. Kintsugi (b0ase) contracts to complete work                │
│  5. b0ase receives tokens as payment for completed tranches    │
│  6. Investors benefit from b0ase's earned token portfolio      │
│                                                                 │
│  Example: Project XYZ                                           │
│  ├── Founder starts with 100% of $XYZ                          │
│  ├── b0ase completes Tranche 1-3 → earns 15% of $XYZ           │
│  ├── b0ase completes Tranche 4-6 → earns another 10%           │
│  └── b0ase's portfolio grows with each completed project       │
└─────────────────────────────────────────────────────────────────┘
```

**Why this matters:** b0ase earns tokens through value creation, not extraction. The more projects Kintsugi repairs, the more tokens flow into the investor portfolio.

---

## Standardized Token Supply: 100B

All internal product tokens use **100,000,000,000 (100 billion)** as their base supply.

### Why 100B?

| Benefit | Explanation |
|---------|-------------|
| **Clean Math** | 1% = 1B tokens, 0.1% = 100M tokens, 0.01% = 10M tokens |
| **Bundle Simplicity** | Same supply across products = easy proportional allocation |
| **Investor Clarity** | "I own 1B tokens of each product" = clear 1% stake |
| **Future Flexibility** | Large supply accommodates micro-transactions |
| **Professional Accounting** | Standardized across cap tables |

### Example Investment Calculation

```
Investor: £10,000 at £800,000 valuation = 1.25% stake

Token Allocation (each product):
├── $BOASE:    1,250,000,000 tokens (1.25% of 100B)
├── $KINTSUGI: 1,250,000,000 tokens (1.25% of 100B)
├── $DIVVY:    1,250,000,000 tokens (1.25% of 100B)
├── $bSheets:  1,250,000,000 tokens (1.25% of 100B)
├── $bOS:      1,250,000,000 tokens (1.25% of 100B)
├── $bWriter:  1,250,000,000 tokens (1.25% of 100B)
└── ...

Consistent 1.25B tokens per product = easy to understand
```

**Exception:** $NPG has ~2.1M tokens (1:1 with existing share structure). Investors receive proportional to b0ase's 85.35% stake.

---

## Platform Token: $BOASE

### Overview

| Field | Value |
|-------|-------|
| **Token Name** | BOASE |
| **Symbol** | $BOASE |
| **Standard** | BSV-20 |
| **Total Supply** | 100,000,000,000 (100 billion) |
| **Decimals** | 8 |
| **Treasury Address** | [BOASE_TREASURY_ADDRESS] |

### Allocation

| Category | Amount | Percentage | Vesting |
|----------|--------|------------|---------|
| Treasury (Unsold) | 60,000,000,000 | 60% | Held for future sales/burns |
| Founder | 20,000,000,000 | 20% | 4-year vesting, 1-year cliff |
| Team/Advisors | 5,000,000,000 | 5% | 3-year vesting |
| Community/Ecosystem | 10,000,000,000 | 10% | Grants, rewards, liquidity |
| Early Investors | 5,000,000,000 | 5% | 1-year cliff, 2-year vesting |
| **TOTAL** | **100,000,000,000** | **100%** | |

### Utility

1. **Platform Access**
   - Staking $BOASE unlocks premium features
   - Higher tiers = more Kintsugi sessions, priority support

2. **Revenue Share**
   - Staked $BOASE receives share of platform fees
   - Distribution proportional to stake duration and amount

3. **Governance**
   - Vote on platform roadmap priorities
   - Propose and vote on new project inclusions

4. **Fee Discounts**
   - Pay platform fees in $BOASE for discount
   - 10-25% discount on marketplace transactions

### Token Economics

**Deflationary Mechanisms:**
- 1% of all platform fees used to buy back and burn $BOASE
- Unused treasury tokens can be burned via governance vote

**Inflationary Mechanisms:**
- None after initial mint
- Fixed supply, no additional minting capability

---

## Project Tokens

### How Project Tokens Work

When Kintsugi repairs a project, it can issue a project-specific token:

```
1. Founder submits broken project to Kintsugi
2. Kintsugi creates repair plan (tranches)
3. Token is minted for the project (e.g., $BWRITER)
4. Investors purchase tokens to fund tranches
5. Developers complete work, receive tokens
6. Token value reflects project success
```

### Standard Project Token Template

| Field | Standard Value |
|-------|----------------|
| **Standard** | BSV-20 |
| **Total Supply** | Project-specific (typically 1M-10M) |
| **Decimals** | 8 |
| **Founder Allocation** | 50-70% |
| **Investor Allocation** | 20-40% |
| **b0ase.com Fee** | 1-5% |
| **Developer Pool** | 5-15% |

### Example: $NPG (Ninja Punk Girls)

| Field | Value |
|-------|-------|
| **Token Name** | NPG |
| **Symbol** | $NPG |
| **Total Supply** | 2,116,000 (matches share count) |
| **Relationship** | 1:1 with NPG Ltd shares |
| **Status** | ACTIVE |

**Allocation (mirrors actual cap table):**

| Holder | Shares/Tokens | Percentage | Investment |
|--------|---------------|------------|------------|
| Richard Boase (→ b0ase Ltd) | 1,806,163 | 85.35% | £489 (founder) |
| Satoshi Block Dojo Ltd | 113,728 | 5.37% | £3,412 |
| Neil Booth | 47,022 | 2.22% | £30,000 |
| Craig Massey | 33,895 | 1.60% | £1,695 |
| Vaionex Corporation | 23,110 | 1.09% | £1,156 |
| Other SEIS Investors | ~92,082 | ~4.37% | ~£18,127 |
| **TOTAL** | **~2,116,000** | **100%** | **~£54,879** |

**b0ase investor exposure:** When Richard transfers his 85.35% to b0ase.com Ltd, investors receive proportional exposure to that stake. NPG minorities retain their tokens.

### Example: $BWRITER (b0ase Blog Writer)

| Field | Value |
|-------|-------|
| **Token Name** | BWRITER |
| **Symbol** | $BWRITER |
| **Total Supply** | TBD (proposed: 1,000,000) |
| **Status** | PLANNED |

**Proposed Allocation:**
| Category | Percentage |
|----------|------------|
| Founder (Richard) | 60% |
| Investors (via tranches) | 30% |
| b0ase.com | 5% |
| Developer Pool | 5% |

---

## Token Relationships

### Platform Token vs Project Tokens

| Aspect | $BOASE (Platform) | Project Tokens |
|--------|-------------------|----------------|
| **Scope** | Entire platform | Single project |
| **Utility** | Platform features, governance | Project equity |
| **Revenue** | Platform fees | Project revenue |
| **Who Benefits** | Platform stakeholders | Project stakeholders |
| **Volatility** | Lower (diversified) | Higher (single project) |

### Cross-Token Interactions

1. **Staking Bonus**
   - Holding $BOASE gives bonus allocation in new project token launches
   - Example: 1000 $BOASE staked = 5% bonus on $BWRITER purchase

2. **Fee Currency**
   - Project token purchases can be paid in $BOASE (discount)
   - Or in BSV/fiat (standard price)

3. **Governance Weight**
   - $BOASE holders vote on which projects Kintsugi prioritizes
   - Project token holders vote on project-specific decisions

---

## Dividend Flow via Divvy

**Divvy** is b0ase's dividend distribution tool. It aggregates revenue from all products and distributes to token holders proportionally.

### How Divvy Works

```
┌─────────────────────────────────────────────────────────────────┐
│  REVENUE SOURCES                    DIVVY AGGREGATION           │
│                                                                 │
│  $KINTSUGI revenue ─────┐                                       │
│  $bSheets revenue ──────┼───→ ┌─────────┐ ───→ Token Holders   │
│  $bWriter revenue ──────┼───→ │  DIVVY  │ ───→ Proportional    │
│  $NPG revenue ──────────┼───→ │ ENGINE  │ ───→ Distribution    │
│  $bCorp revenue ────────┘     └─────────┘                       │
│                                                                 │
│  Each product pays dividends to its token holders.              │
│  Since investors own proportional tokens in ALL products,       │
│  they receive aggregated dividends automatically.               │
└─────────────────────────────────────────────────────────────────┘
```

### Dividend Calculation Example

**Scenario:** Alice owns 1.25% of b0ase token bundle

| Product | Monthly Revenue | Alice's Share (1.25%) |
|---------|-----------------|----------------------|
| $KINTSUGI (platform fees) | £10,000 | £125 |
| $bSheets (subscriptions) | £2,000 | £25 |
| $bWriter (subscriptions) | £1,500 | £18.75 |
| $NPG (gaming revenue) | £500 | £5.34 (85.35% × 1.25%) |
| **Total Monthly Dividend** | | **£174.09** |

### Dividend Distribution Schedule

| Frequency | Type | Method |
|-----------|------|--------|
| Monthly | Regular dividends | BSV micropayment to token address |
| Quarterly | Revenue reconciliation | Audited distribution |
| Annually | Performance bonus | Governance vote |

### Key Benefits

1. **Passive Income** - Hold tokens, receive dividends automatically
2. **Diversified Streams** - Revenue from multiple products
3. **On-Chain Transparency** - All distributions inscribed on BSV
4. **Compounding** - Re-invest dividends into more tokens

---

## Multi-Cap Table Management

### Challenge

Each project has its own:
- Token supply
- Shareholder/token holder list
- Vesting schedules
- Investment history

### Solution: Unified Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  INVESTOR DASHBOARD                                             │
│  ├── Platform Holdings                                          │
│  │   └── $BOASE: 10,000 tokens (staked)                        │
│  │                                                              │
│  ├── Project Holdings                                           │
│  │   ├── $NPG: 1,000 tokens (0.05% of project)                 │
│  │   ├── $BWRITER: 500 tokens (0.05% of project)               │
│  │   └── $DOGWK: 2,000 tokens (0.2% of project)                │
│  │                                                              │
│  └── Total Portfolio Value: £X,XXX                             │
└─────────────────────────────────────────────────────────────────┘
```

### Database Schema

```sql
-- Platform token holdings
CREATE TABLE boase_holdings (
  user_id UUID REFERENCES auth.users,
  balance BIGINT,
  staked_balance BIGINT,
  staked_until TIMESTAMP,
  updated_at TIMESTAMP
);

-- Project token holdings
CREATE TABLE project_token_holdings (
  user_id UUID REFERENCES auth.users,
  project_id UUID REFERENCES projects,
  token_symbol TEXT,
  balance BIGINT,
  vesting_schedule JSONB,
  updated_at TIMESTAMP
);

-- Token transactions
CREATE TABLE token_transactions (
  id UUID PRIMARY KEY,
  token_symbol TEXT,
  from_user UUID,
  to_user UUID,
  amount BIGINT,
  tx_type TEXT, -- 'transfer', 'stake', 'unstake', 'vest', 'burn'
  bsv_txid TEXT, -- on-chain reference
  created_at TIMESTAMP
);
```

---

## On-Chain Integration

### BSV-20 Standard

All tokens are minted on Bitcoin SV using BSV-20:

```json
{
  "p": "bsv-20",
  "op": "deploy",
  "tick": "BOASE",
  "max": "100000000000",
  "dec": "8"
}
```

### Inscription Strategy

| Event | On-Chain Action |
|-------|-----------------|
| Token Creation | Deploy inscription |
| Token Transfer | Transfer inscription |
| Staking | Inscription to staking address |
| Vesting Release | Transfer inscription |
| Burn | Transfer to burn address |

### Treasury Management

- Treasury wallet uses 2-of-3 multisig
- All significant transfers require dual approval
- On-chain transparency for all movements

---

## Regulatory Considerations

### UK Perspective

**Project Tokens (Equity Tokens):**
- Represent shares in UK Ltd companies
- Subject to Companies Act 2006
- Private placement only (not public offering)

**$BOASE (Platform Token):**
- Hybrid utility/equity characteristics
- Careful structuring required

### SEIS/EIS Status

**⚠️ b0ase.com Ltd likely DOES NOT qualify for SEIS/EIS**

The FCA excludes businesses dealing in "financial instruments" from SEIS/EIS schemes. Since b0ase:
- Creates tokenized equity securities
- Operates an investment platform
- Facilitates securities transactions

...it falls under the "excluded activities" for SEIS/EIS purposes.

| Entity | SEIS/EIS Status | Notes |
|--------|-----------------|-------|
| b0ase.com Ltd | ❌ Unlikely | Financial instruments exclusion |
| NPG Ltd | ⚠️ Had SEIS | Gaming focus; some investors used SEIS |
| Bitcoin Corporation Ltd | ❌ Unlikely | Open source tools, minimal revenue |

**Recommendation:** Do not market investment as SEIS/EIS eligible. Individual projects may qualify separately - consult tax specialist.

### Compliance Approach

1. **Investor Certification** - All investors self-certify as sophisticated/high-net-worth
2. **KYC/AML** - Veriff integration for identity verification
3. **Investment Limits** - Track cumulative investment per investor
4. **Documentation** - Clear risk warnings and investor acknowledgments
5. **Private Placement** - Not a public offering; restricted access

---

## Token Launch Roadmap

### Phase 1: Foundation (Current - Q1 2026)

- [x] $NPG token active (linked to NPG Ltd shares)
- [x] Token bundle architecture designed
- [x] Standardized 100B supply decided
- [ ] Incorporate b0ase.com Ltd
- [ ] Treasury wallet setup (2-of-3 multisig)
- [ ] Transfer Richard's shares to b0ase.com Ltd

### Phase 2: Internal Product Tokens (Q1-Q2 2026)

- [ ] Mint $BOASE on BSV mainnet (100B)
- [ ] Mint $KINTSUGI on BSV mainnet (100B)
- [ ] Mint $DIVVY on BSV mainnet (100B)
- [ ] Mint $bSheets, $bOS, $bWriter (100B each)
- [ ] First token bundle allocation to early investors

### Phase 3: Token Bundle Infrastructure (Q2 2026)

- [ ] Single-address bundle delivery system
- [ ] Divvy dividend aggregation
- [ ] Investor dashboard showing all tokens
- [ ] Automated proportional allocation calculator
- [ ] Token-to-share linkage for UK Ltds

### Phase 4: Kintsugi Earned Tokens (Q2-Q3 2026)

- [ ] First external project repaired
- [ ] b0ase earns tokens through completed tranches
- [ ] Earned tokens added to investor portfolio exposure
- [ ] Growing token portfolio as Kintsugi scales

### Phase 5: Exchange/Liquidity (Q3-Q4 2026)

- [ ] List $BOASE on BSV DEX
- [ ] OTC marketplace for token bundle trading
- [ ] Liquidity incentive program
- [ ] Secondary market for individual product tokens

---

## Document References

| Document | Purpose |
|----------|---------|
| `CORPORATE_STRUCTURE.md` | Legal entity relationships |
| `INVESTMENT_PIPELINE.md` | How tranches fund development |
| `MULTISIG_STRATEGY.md` | Wallet custody design |
| `KINTSUGI_PRODUCT.md` | How projects get tokenized |

---

**Review Schedule:** Monthly
**Next Review:** February 24, 2026
