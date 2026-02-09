# Ownership Architecture

> **Key Principle**: "The register of members is authoritative; certificates are evidentiary."

## The Three-Layer Model

This is orthodox UK company law, not crypto novelty. It mirrors how shares worked before CREST dematerialisation.

### Layer 1: Beneficial Ownership (Economic Reality)

Who paid for it / who holds it right now.

```
Token holder has:
✅ Economic interest (paid for it)
✅ Right to transfer their interest privately
✅ Expectation of dividends (but not enforceable until registered)
❌ Legal title
❌ Voting rights (until registered)
❌ Company recognition
```

Tokens:
- Float freely on blockchains (BSV, ETH, SOL)
- Can be traded without KYC
- Represent economic interest, not legal ownership
- Are NOT bearer instruments (company consent still required)

### Layer 2: Instrumental Title (Certificate + Signatures)

Who appears entitled if the company accepts it.

```
Certificate holder has:
✅ Evidence of prior registration
✅ Chain of endorsements (if transferred)
✅ Right to present for recognition
❌ Automatic ownership
❌ Self-executing rights
```

Certificates:
- Evidence that holder WAS on register at time of issue
- Can be endorsed and transferred privately
- Chains of signatures prove entitlement
- But possession alone never binds the company

### Layer 3: Legal Ownership (Register of Members)

Who the company legally recognises. **Only this layer matters to the company.**

```
Registered member has:
✅ Legal title (Companies House)
✅ Voting rights
✅ Dividend entitlement
✅ Listed on confirmation statements
✅ Company owes duties to them
```

Registry:
- The legally authoritative record
- Not the token, not the PDF, not the blockchain
- Updated only when company accepts transfer
- This is the source of truth

---

## The Critical Distinction

**Certificates are evidentiary, not constitutive.**

| What | Is it ownership? |
|------|------------------|
| Holding tokens | ❌ Beneficial interest only |
| Holding a certificate | ❌ Evidence only |
| Being on the register | ✅ Legal ownership |

A share certificate evidences that *at the time of issue* the holder was entered on the register. It is not ownership itself.

---

## How They Interact

```
                    BLOCKCHAIN LAYER
                    (Beneficial Interest)
    ┌─────────────────────────────────────────┐
    │                                         │
    │   Token: $BOASE                         │
    │   Holder: 0xABC... (wallet)             │
    │   Amount: 10,000 service credits        │
    │                                         │
    │   Can trade freely, no KYC              │
    │                                         │
    └─────────────────────┬───────────────────┘
                          │
                          │ "I want legal title"
                          │ (requires KYC)
                          ▼
    ┌─────────────────────────────────────────┐
    │                                         │
    │   REGISTRY LAYER                        │
    │   (Legal Title)                         │
    │                                         │
    │   Name: John Smith                      │
    │   Address: 123 Main St, London          │
    │   Shares: 10,000 Class A Ordinary       │
    │   KYC Status: Approved                  │
    │   Filed with Companies House: Yes       │
    │                                         │
    └─────────────────────────────────────────┘
```

---

## Staking Tokens for Equity

When a token holder wants to convert beneficial interest to legal title:

### Step 1: Stake Tokens

```typescript
// Token holder "stakes" tokens to claim equity
{
  action: 'STAKE_FOR_EQUITY',
  token: '$BOASE',
  amount: 10000,
  wallet: '0xABC...',
  timestamp: '2026-01-31T12:00:00Z'
}
```

### Step 2: Complete KYC

```typescript
// Holder provides identity verification
{
  full_name: 'John Smith',
  date_of_birth: '1985-03-15',
  address: {
    line1: '123 Main Street',
    city: 'London',
    postal_code: 'SW1A 1AA',
    country: 'GB'
  },
  id_document: 'passport.jpg',
  proof_of_address: 'utility_bill.pdf'
}
```

### Step 3: Registry Entry Created

```typescript
// Company secretary creates registry entry
{
  company: 'b0ase Ltd',
  shareholder_name: 'John Smith',
  shares: 10000,
  share_class: 'Class A Ordinary',
  date_registered: '2026-01-31',
  certificate_number: 'BOASE-2026-0042',

  // Link to token stake
  beneficial_interest_tx: 'bsv_tx_abc123',
  tokens_staked: 10000,
  token_symbol: '$BOASE'
}
```

### Step 4: Confirmation Statement

Registry entries (not tokens) are filed with Companies House.

---

## Nested Structure

### The Hierarchy

```
b0ase Ltd (Holding Company)
├── $BOASE token (beneficial interest in b0ase Ltd)
│
├── 85.35% of Ninja Punk Girls Ltd
│   └── $NPG token (beneficial interest in NPG Ltd)
│
└── 99% of The Bitcoin Corporation Ltd
    ├── $bCorp token (beneficial interest in Bitcoin Corp)
    │
    ├── 100% of bWriter (division/product)
    │   └── $bWriter token (revenue rights only, not equity)
    │
    ├── 100% of bMail (division/product)
    │   └── $bMail token
    │
    └── 100% of bSheets (division/product)
        └── $bSheets token
```

### Important Distinctions

| Entity Type | Token Represents | Registry Entry = |
|-------------|------------------|------------------|
| Holding company (b0ase) | Equity in holding co | Shareholder of b0ase Ltd |
| Subsidiary (NPG, Bitcoin Corp) | Equity in subsidiary | Shareholder of subsidiary |
| Division/Product (bWriter) | Revenue rights only | NOT a company, no filing |

### Product Tokens vs Company Tokens

**Company tokens** ($BOASE, $NPG, $bCorp):
- Represent actual equity
- Can be staked for shares
- Filed with Companies House
- Shareholder has legal rights

**Product tokens** ($bWriter, $bMail, $bSheets):
- Represent revenue share only
- NOT equity (no company to own)
- NOT filed anywhere
- Contractual profit participation
- "Redeemable service credits with revenue share"

---

## Cap Table Nesting

### Level 1: b0ase Ltd Cap Table

| Shareholder | Shares | % | Type |
|-------------|--------|---|------|
| Richard Boase | 60,000,000,000 | 60% | Founder |
| Token holders (staked) | 20,000,000,000 | 20% | Public |
| Ninja Punk Girls Ltd | 0 | 0% | N/A (subsidiary) |
| Bitcoin Corporation Ltd | 0 | 0% | N/A (subsidiary) |
| Treasury | 20,000,000,000 | 20% | Reserved |

### Level 2: NPG Ltd Cap Table

| Shareholder | Shares | % | Type |
|-------------|--------|---|------|
| b0ase Ltd | 85.35% | 85.35% | Parent |
| Richard Boase | 14.65% | 14.65% | Founder |
| $NPG token stakers | 0% | 0% | (unstaked) |

### Level 2: Bitcoin Corporation Cap Table

| Shareholder | Shares | % | Type |
|-------------|--------|---|------|
| b0ase Ltd | 99% | 99% | Parent |
| Richard Boase | 1% | 1% | Founder |

### Level 3: Product Revenue Share (NOT cap tables)

$bWriter, $bMail, $bSheets are NOT companies. They're products of Bitcoin Corporation.

Token holders have revenue share rights, not equity. This is tracked as:

```typescript
{
  product: 'bWriter',
  token: '$bWriter',
  revenue_share_pool: '20%', // 20% of bWriter revenue to token holders
  parent_company: 'Bitcoin Corporation Ltd',
  type: 'PRODUCT_REVENUE_SHARE', // NOT EQUITY
}
```

---

## Confirmation Statement Implications

### What Gets Filed

**Companies House Form CS01** includes:
- Registered shareholders (from Registry, not blockchain)
- Share classes and amounts
- People with Significant Control (PSC)

**What goes on the filing**:

```
b0ase Ltd - Confirmation Statement

SHAREHOLDERS:
- Richard Boase: 60,000,000,000 Class A Ordinary (60%)
- [Individual stakers who completed KYC]: Listed individually
- [Token holders who did NOT stake]: NOT listed (no legal title)

PSC (People with Significant Control):
- Richard Boase (controls >75% voting rights)

SUBSIDIARIES:
- Ninja Punk Girls Ltd (85.35% owned)
- The Bitcoin Corporation Ltd (99% owned)
```

**What does NOT go on the filing**:
- Unstaked token holders (no legal title)
- Wallet addresses (not legal identities)
- Product tokens ($bWriter, etc.) - not equity

---

## The Token Lifecycle

```
1. TOKEN CREATED (on blockchain)
   └── Beneficial interest, no KYC needed, tradeable

2. TOKEN TRADED (on blockchain)
   └── Beneficial ownership transfers, still no KYC
   └── New holder has same rights (dividends, potential equity)

3. TOKEN STAKED (on blockchain + registry)
   └── Holder requests legal title
   └── KYC process triggered
   └── Tokens locked (can't trade while staked)

4. KYC APPROVED (registry)
   └── Registry entry created
   └── Share certificate issued
   └── Holder now has LEGAL TITLE
   └── Included in confirmation statement

5. UNSTAKE (optional)
   └── Holder can relinquish legal title
   └── Tokens return to tradeable state
   └── Removed from registry (but retains beneficial interest)
```

---

## Database Schema Requirements

### New: Company Hierarchy

```prisma
model Company {
  id            String    @id @default(uuid())
  name          String
  company_number String?  // Companies House number
  type          CompanyType // HOLDING, SUBSIDIARY, DIVISION

  // Hierarchy
  parent_id     String?
  parent        Company?  @relation("Subsidiaries", fields: [parent_id], references: [id])
  subsidiaries  Company[] @relation("Subsidiaries")

  // Ownership by parent
  parent_ownership_percent Float?

  // Token association
  token_symbol  String?   // $BOASE, $NPG, etc.

  // Registry
  registry      Registry?
}

enum CompanyType {
  HOLDING
  SUBSIDIARY
  DIVISION  // Not a legal entity, just a product
}
```

### New: Beneficial vs Title Tracking

```prisma
model ShareholderRegistry {
  id                String   @id @default(uuid())
  company_id        String
  company           Company  @relation(fields: [company_id], references: [id])

  // Legal title holder
  legal_name        String
  legal_address     String

  // Shares held
  shares            BigInt
  share_class       String
  certificate_number String?

  // Link to beneficial interest
  token_stake_tx    String?  // BSV tx where tokens were staked
  tokens_staked     BigInt?
  token_symbol      String?
  staked_at         DateTime?

  // KYC
  kyc_status        KycStatus
  kyc_verified_at   DateTime?

  // For confirmation statements
  psc_status        Boolean @default(false) // Person with Significant Control

  // Audit
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
}

model BeneficialInterest {
  id               String   @id @default(uuid())
  company_id       String
  company          Company  @relation(fields: [company_id], references: [id])

  // On-chain representation
  token_symbol     String
  wallet_address   String
  amount           BigInt
  blockchain       String   // BSV, ETH, SOL

  // Status
  staked_for_equity Boolean @default(false)
  stake_tx         String?

  // NOT on registry until staked + KYC approved
  registry_entry_id String?
  registry_entry   ShareholderRegistry? @relation(fields: [registry_entry_id], references: [id])
}
```

### New: Product Revenue Share (Not Equity)

```prisma
model ProductRevenueShare {
  id               String   @id @default(uuid())
  product_name     String   // bWriter, bMail, etc.
  parent_company_id String
  parent_company   Company  @relation(fields: [parent_company_id], references: [id])

  // Token for revenue participation
  token_symbol     String   // $bWriter

  // Revenue share terms
  revenue_pool_percent Float  // e.g., 20% of product revenue
  distribution_frequency String // MONTHLY, QUARTERLY

  // NOT equity - this is contractual revenue share
  is_equity        Boolean @default(false) // Always false for products
}
```

---

## Confirmation Statement Workflow

### Annual Filing Process

1. **Export Registry Entries**
   ```sql
   SELECT * FROM shareholder_registry
   WHERE company_id = 'boase-ltd'
   AND kyc_status = 'APPROVED'
   ORDER BY shares DESC
   ```

2. **Calculate PSC Status**
   - Anyone with >25% shares = PSC
   - Anyone with >25% voting rights = PSC
   - Parent companies = PSC if >25%

3. **Generate CS01 Data**
   - Legal names and addresses
   - Share classes and amounts
   - PSC declarations

4. **File with Companies House**
   - Use Companies House API or manual filing
   - £13 online / £40 paper

### Token Holder Notification

Before confirmation statement deadline:

```
Dear Token Holder,

Your $BOASE tokens represent beneficial interest in b0ase Ltd.

To be listed as a registered shareholder on our
confirmation statement (and receive a share certificate):

1. Stake your tokens at b0ase.com/stake
2. Complete KYC verification
3. Receive your share certificate

Deadline for this year's filing: [date]

If you do not stake by this date, your tokens will
still represent beneficial interest, but you will
not be listed on the Companies House register.
```

---

## Summary: Your Original Questions

### "Tokens can float about on blockchains"

✅ Yes. Tokens = beneficial interest. Trade freely, no KYC.

### "Staked for equity on the cap table"

✅ Yes. Staking = requesting legal title. Requires KYC.

### "Exchange beneficial ownership without exchanging title"

✅ Correct. Token transfer = beneficial ownership transfer.
   Title stays with whoever is in the Registry.

Example:
- Alice holds 10,000 $BOASE and is in Registry (has title)
- Alice sells tokens to Bob on DEX
- Bob now has beneficial interest
- Alice still has title (until she notifies company)
- Bob must stake + KYC to claim title

### "Nested cap tables and registries"

✅ Correct structure:

```
b0ase Ltd
├── Registry (shareholders of b0ase)
├── Cap Table ($BOASE)
│
├── NPG Ltd (85.35% owned by b0ase)
│   ├── Registry (shareholders of NPG)
│   └── Cap Table ($NPG)
│
└── Bitcoin Corporation Ltd (99% owned by b0ase)
    ├── Registry (shareholders of Bitcoin Corp)
    ├── Cap Table ($bCorp)
    │
    └── Products (NOT companies, NO registry)
        ├── bWriter → $bWriter (revenue share only)
        ├── bMail → $bMail (revenue share only)
        └── bSheets → $bSheets (revenue share only)
```

---

## Next Steps

1. **Add Company model** with parent/child relationships
2. **Split cap_table_shareholders** into Registry + BeneficialInterest
3. **Add staking mechanism** (lock tokens, trigger KYC)
4. **Add ProductRevenueShare** for $bWriter etc.
5. **Build confirmation statement export**
6. **Create staking UI** with KYC flow

---

## Legal Notes

**This is not legal advice.** Consult a solicitor for:
- Share class structures
- PSC filing requirements
- Beneficial ownership disclosure rules
- Cross-border shareholder issues

**UK Companies Act 2006** requires:
- Register of members (our Registry)
- PSC register (>25% control)
- Annual confirmation statement

**Tokens as securities**: If tokens can be staked for equity, they may be securities under FCA rules. Consider:
- Crypto Asset Register registration
- Financial promotion rules
- Prospectus requirements (if offering to public)

---

## The Reversible Staking Primitive

This is what makes our system novel (but still legally orthodox).

### Traditional Shares

```
Shares issued → Shares exist forever (until cancelled by company)
```

### Our Staking Model

```
Stake tokens   → Shares come into existence
Unstake tokens → Shares are extinguished
```

**Implications:**
- Certificates are **revocable instruments**
- Shares are **conditionally outstanding**
- The true asset is the **staked state**, not the paper

This is legally equivalent to:
- Shares subject to forfeiture
- Conditional share issues
- Vesting shares with cliff

**The key rule:**

> A share certificate is valid only while the underlying stake remains locked.

If the original holder unstakes:
- Shares revert to treasury
- Certificate becomes void
- Any downstream buyer is out of luck

This sounds harsh, but it's airtight if disclosed upfront.

---

## Why Certificates Exist (Only Three Reasons)

Certificates start to feel "unnecessary" - and that's correct. They exist only for:

### 1. Legal Orthodoxy

Some investors, auditors, and counterparties expect:
- A director-signed instrument
- Something printable
- Something recognisable as "a share certificate"

This is **optics + compliance**, not mechanics.

### 2. Off-Platform Transfer

Certificates allow:
- Private sales between parties
- Escrow-like behaviour
- Transfers without using our UI

They're a **pressure-release valve** for liquidity, not the core system.

### 3. Evidence in Disputes

If everything goes wrong:
- Register is corrupted
- Dashboards disappear
- Tokens are frozen

A certificate + endorsement chain is **fallback evidence**.

**That's it.** Certificates are NOT:
- The source of truth
- Required for dividends
- Required for cap table integrity

---

## Off-Platform Transfer Workflow

### Step A: Initial Staking

```
1. Investor stakes tokens
2. Completes KYC
3. Company issues shares
4. Company enters investor on register
5. Company issues share certificate

At this point:
├── Investor has LEGAL TITLE
└── Certificate is EVIDENCE, not source of truth
```

### Step B: Private Transfer (Off-Company)

```
1. Investor signs the back of the certificate
2. Buyer pays seller
3. Certificate changes hands
4. Company is NOT involved yet

At this stage:
├── Buyer has EQUITABLE / BENEFICIAL interest
├── Seller is still the LEGAL OWNER
└── Company owes duties only to seller
```

This is fine and normal. The endorsed certificate can circulate.

### Step C: Redemption with Company

```
1. Buyer presents:
   ├── The endorsed certificate
   ├── Identity / KYC
   └── (Optionally) a stock transfer form

2. Company verifies:
   ├── Certificate authenticity
   ├── Chain of endorsements
   ├── No revocation / no prior unstaking
   └── Buyer passes KYC

3. If satisfied:
   ├── Company updates register
   ├── Old certificate is cancelled
   ├── New certificate issued
   └── LEGAL TITLE TRANSFERS
```

🎯 **This is the moment ownership actually changes.**

---

## Certificate Revocation Semantics

### When a Certificate Becomes Void

| Event | Certificate Status | Register Status |
|-------|-------------------|-----------------|
| Holder unstakes | **VOID** | Removed |
| Holder transfers (off-platform) | Still valid (for buyer to redeem) | No change yet |
| Buyer redeems | Old = cancelled, New issued | Updated |
| Company revokes (fraud) | **VOID** | Marked revoked |
| Stake expires (if time-limited) | **VOID** | Removed |

### The Unstaking Edge Case

**Q: What if investor unstakes but still holds the PDF?**

**A:** Easy.
- Certificate was revoked when they unstaked
- Register no longer lists them
- The PDF is void
- Company does not honour it

No contradiction. This is normal company law.

### The Company Failure Edge Case

**Q: What if the company fails?**

**A:** Correct understanding:
- Staked tokens are not bearer assets
- They are claims on a failed entity
- Value goes to zero

This is **equity risk**, not a bug.

---

## The Staking State Machine

```
                    ┌─────────────────────────────────────────┐
                    │                                         │
                    │              UNSTAKED                   │
                    │         (tokens tradeable)              │
                    │                                         │
                    └──────────────────┬──────────────────────┘
                                       │
                                       │ stake()
                                       │
                                       ▼
                    ┌─────────────────────────────────────────┐
                    │                                         │
                    │            PENDING_KYC                  │
                    │        (tokens locked)                  │
                    │                                         │
                    └───────────┬─────────────┬───────────────┘
                                │             │
                       kyc_approved()    kyc_rejected()
                                │             │
                                ▼             ▼
┌───────────────────────────────────────┐    ┌────────────────────────────┐
│                                       │    │                            │
│              REGISTERED               │    │         UNSTAKED           │
│     (on register, certificate         │    │   (tokens returned,        │
│      issued, legal title)             │    │    no certificate)         │
│                                       │    │                            │
└───────────────────┬───────────────────┘    └────────────────────────────┘
                    │
                    │ unstake()
                    │
                    ▼
┌─────────────────────────────────────────┐
│                                         │
│              UNSTAKED                   │
│   (removed from register,               │
│    certificate VOID,                    │
│    tokens tradeable again)              │
│                                         │
└─────────────────────────────────────────┘
```

### State Transitions

| From | To | Trigger | Side Effects |
|------|-----|---------|--------------|
| UNSTAKED | PENDING_KYC | `stake()` | Tokens locked on-chain |
| PENDING_KYC | REGISTERED | `kyc_approved()` | Registry entry + certificate |
| PENDING_KYC | UNSTAKED | `kyc_rejected()` | Tokens unlocked |
| REGISTERED | UNSTAKED | `unstake()` | Registry removal, cert void |

---

## Dividend Entitlement Snapshots

### The Problem

Tokens trade continuously. Shares are registered at a point in time. Who gets dividends?

### The Solution: Snapshot at Record Date

```typescript
// Dividend declaration
{
  company: 'b0ase Ltd',
  amount_per_share: 0.001,  // £0.001 per share
  record_date: '2026-03-31',
  payment_date: '2026-04-15',
}

// Who gets paid?
// ONLY those on the REGISTER at record_date
// NOT token holders (unless staked)
```

### Entitlement Rules

| Status at Record Date | Gets Dividend? |
|-----------------------|----------------|
| On register (staked + KYC) | ✅ Yes |
| Staked, pending KYC | ❌ No |
| Unstaked (holding tokens) | ❌ No |
| Sold tokens after record date | ✅ Yes (was on register) |
| Bought tokens after record date | ❌ No (wasn't on register) |

### For Product Revenue Share ($bWriter etc.)

Different rules - these are contractual, not equity:

```typescript
// Revenue share distribution
{
  product: 'bWriter',
  revenue_period: '2026-Q1',
  total_revenue: 50000,  // £50,000
  pool_percent: 20,      // 20% to token holders
  distribution_amount: 10000,  // £10,000

  // Snapshot based on TOKEN HOLDINGS, not registry
  snapshot_date: '2026-03-31',
}
```

Product tokens can use on-chain snapshots since there's no registry requirement.

---

## Terminology (What to Call This)

### DO NOT call it:
- Bearer equity
- Tokenised shares
- On-chain shares
- Crypto equity

### DO call it:

> **"Certificated shares subject to staking conditions"**

This phrase alone eliminates 90% of confusion.

### In marketing materials:

> "Service credits redeemable for equity participation"

### In legal documents:

> "Conditional ordinary shares, issuable upon staking of service credits and completion of identity verification"

---

## What This Achieves

✅ **Off-company secondary markets** - endorsed certificates can circulate

✅ **Peer-to-peer transfers** - no need for company involvement

✅ **Tradability** - tokens move freely on blockchains

❌ **No forced recognition** - company controls the register

You retain full control over:
- Compliance
- KYC thresholds
- Refusal grounds (fraud, sanctions, prior unstake)

**That's exactly where you want to be.**

---

## Production Readiness Checklist

For this to be production-grade, we need:

- [ ] **Staking state machine** - implemented in code
- [ ] **Certificate revocation** - database + PDF watermarking
- [ ] **Dividend snapshots** - register snapshot at record date
- [ ] **Off-platform transfer form** - stock transfer form template
- [ ] **Endorsement verification** - signature chain validation
- [ ] **Confirmation statement export** - CS01 data generation
- [ ] **Investor disclosure** - terms explaining staking conditions

---

## Summary

The system preserves **liquidity without surrendering control**.

```
Tokens       = beneficial interest (tradeable, no KYC)
Certificates = evidence (endorseable, private transfers)
Register     = legal title (source of truth, Companies House)
```

All three can coexist. The register is authoritative. Everything else is subordinate.
