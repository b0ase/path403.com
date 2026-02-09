# PRD: $402 Token Custody & Staking System

**Version:** 2.0
**Date:** 2026-02-08
**Author:** Richard Boase / Claude

---

## Executive Summary

This document specifies the token custody and staking system for $402. The system enables users to mine, hold, stake, and withdraw BSV-21 PoW20 tokens while maintaining proper custody boundaries and regulatory compliance.

**Core Principle:** Tokens are bearer instruments. $402 tokens are 100% mined (PoW20 Hash-to-Mint). Staking requires $401 identity verification (KYC) to earn serving revenue.

---

## Problem Statement

Current issues:
1. **HandCash cannot receive ordinals** - Users pay with HandCash but can't receive BSV-21 tokens there
2. **Database-only credits are risky** - We could accidentally burn tokens, get hacked, or face custody liability
3. **No clear staking mechanism** - Unclear how users claim serving revenue
4. **$401 KYC timing unclear** - When do we require identity verification?

---

## Solution Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. CONNECT          2. DERIVE           3. PURCHASE             │
│  ───────────         ──────────          ──────────              │
│  HandCash OAuth  →   Sign message   →    Pay with HC  →          │
│                      Create address      Tokens sent to          │
│                      (user controls)     derived address         │
│                                                                  │
│  4. HOLD (unstaked)  5. STAKE            6. CLAIM                │
│  ─────────────────   ─────────           ─────────               │
│  Tokens in address   Sign to stake  →    Serving revenue         │
│  Withdraw anytime    Complete $401 KYC   Registry listing        │
│  No revenue          Added to cap table                          │
│                                                                  │
│                                                                  │
│  7. UNSTAKE          8. WITHDRAW         9. TRANSFER             │
│  ──────────          ──────────          ──────────              │
│  Sign to unstake     Sign to withdraw    Send to any             │
│  Still on cap table  Tokens leave        BSV address             │
│  until new staker    our system                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Detailed Requirements

### 1. Address Derivation

**Goal:** Create a unique BSV address for each user that ONLY THEY can spend from.

**Flow:**
1. User connects with HandCash OAuth
2. System presents message to sign: `"I am creating my $402 wallet for @{handle}. Timestamp: {ISO8601}"`
3. User signs with HandCash
4. System derives keypair deterministically from signature
5. **CRITICAL:** System returns the WIF private key to user AND stores encrypted version

**Technical Spec:**
```typescript
interface DerivedWallet {
  address: string;        // BSV P2PKH address (starts with "1")
  publicKey: string;      // Hex public key
  encryptedWIF: string;   // WIF encrypted with user's signature
  createdAt: Date;
  handle: string;         // HandCash handle
}
```

**Key Derivation:**
```
seed = HMAC-SHA256(key: "$402-v1", data: signature + handle)
privateKey = seed (first 32 bytes)
address = P2PKH(publicKey(privateKey))
```

**User Control Mechanism:**
- User can always re-sign the same message to recover their private key
- We store encrypted WIF that only their signature can decrypt
- User can export WIF to external wallet anytime
- We NEVER have unencrypted access to their private key

**Database Schema:**
```sql
CREATE TABLE user_wallets (
  id UUID PRIMARY KEY,
  handle TEXT UNIQUE NOT NULL,
  address TEXT UNIQUE NOT NULL,
  public_key TEXT NOT NULL,
  encrypted_wif TEXT NOT NULL,  -- Encrypted with signature-derived key
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ
);
```

---

### 2. Token Purchase

**Goal:** User pays, receives tokens to their derived address.

**Flow:**
1. User has derived address (prerequisite)
2. User selects amount to spend (BSV)
3. System calculates tokens via sqrt_decay curve
4. User confirms and pays via HandCash to treasury
5. **On payment success:** System sends BSV-21 transfer to user's derived address
6. User now holds bearer instruments they control

**Key Points:**
- Tokens go ON-CHAIN to user's address, not database credits
- User can verify on blockchain explorer
- User can withdraw/transfer immediately
- We have NO custody of their tokens

**API:**
```
POST /api/token/buy
{
  spendSats: number
}

Response:
{
  purchaseId: string,
  tokenAmount: number,
  txId: string,           // HandCash payment tx
  transferTxId: string,   // BSV-21 transfer to user's address
  address: string,        // User's derived address
  status: "completed"
}
```

---

### 3. Token States

| State | Location | Revenue Share | KYC Required | Cap Table |
|-------|----------|---------------|--------------|-----------|
| **Unstaked** | User's derived address | No | No | No |
| **Staked** | User's derived address (same) | Yes (100% serving revenue) | Yes ($401) | Yes |
| **Withdrawn** | External address | No | No | No |

**Key Insight:** Staking does NOT move tokens. It's a signed declaration + KYC that grants rights.

---

### 4. Staking Mechanism

**Goal:** User stakes tokens to receive serving revenue. Requires $401 identity verification (KYC).

**Flow:**
1. User has tokens in their derived address (prerequisite)
2. User clicks "Stake"
3. System prompts: Sign message to stake
4. Message: `"I am staking {amount} $402 tokens. I agree to complete $401 identity verification. Timestamp: {ISO8601}"`
5. User signs with HandCash
6. System verifies signature and token balance
7. System prompts $401 KYC collection (name, email, jurisdiction)
8. On KYC completion: User added to cap table

**What Staking IS:**
- A signed declaration of intent
- Permission to collect $401 KYC
- Registration on the cap table
- Eligibility for serving revenue share (100%, proportional to stake)

**What Staking IS NOT:**
- Moving tokens to a different address
- Locking tokens (user can still withdraw)
- Transferring custody to us

**Database Schema:**
```sql
CREATE TABLE stakes (
  id UUID PRIMARY KEY,
  wallet_id UUID REFERENCES user_wallets(id),
  amount BIGINT NOT NULL,
  staked_at TIMESTAMPTZ DEFAULT NOW(),
  unstaked_at TIMESTAMPTZ,
  stake_signature TEXT NOT NULL,
  status TEXT DEFAULT 'active',  -- active, unstaked

  -- KYC fields (collected on stake)
  kyc_name TEXT,
  kyc_email TEXT,
  kyc_jurisdiction TEXT,
  kyc_completed_at TIMESTAMPTZ,

  CONSTRAINT valid_status CHECK (status IN ('active', 'unstaked'))
);

CREATE TABLE cap_table (
  id UUID PRIMARY KEY,
  wallet_id UUID REFERENCES user_wallets(id),
  stake_id UUID REFERENCES stakes(id),
  handle TEXT NOT NULL,
  tokens_staked BIGINT NOT NULL,
  kyc_name TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  removed_at TIMESTAMPTZ,
  removal_reason TEXT,  -- 'unstaked', 'transferred', 'sold'

  -- Cap table is public registry
  is_public BOOLEAN DEFAULT true
);
```

---

### 5. Unstaking

**Goal:** User removes stake declaration. Remains on cap table until tokens change hands.

**Flow:**
1. User clicks "Unstake"
2. System prompts: Sign message to unstake
3. Message: `"I am unstaking {amount} $402 tokens. Timestamp: {ISO8601}"`
4. User signs
5. Stake marked as `unstaked`
6. **User REMAINS on cap table** (they still hold the tokens)
7. Revenue share suspended

**Cap Table Update Rules:**
- Unstaking: User stays on cap table, rights suspended
- Withdrawal: User stays on cap table until tokens are staked by new owner
- New owner stakes: Old owner removed, new owner added

---

### 6. Withdrawal

**Goal:** User moves tokens out of our system to any BSV address.

**Flow:**
1. User enters destination address
2. User enters amount to withdraw
3. System prompts: Sign message to authorize withdrawal
4. Message: `"Withdraw {amount} $402 to {destination}. Timestamp: {ISO8601}"`
5. User signs
6. System decrypts user's WIF using signature-derived key
7. System builds and broadcasts BSV-21 transfer
8. Tokens leave our system

**Security:**
- We NEVER have the unencrypted private key
- User's signature is required for EVERY withdrawal
- Signature both authorizes and decrypts

**API:**
```
POST /api/token/withdraw
{
  amount: number,
  destination: string,  // BSV address
  signature: string     // HandCash signature of withdrawal message
}

Response:
{
  txId: string,
  amount: number,
  destination: string,
  status: "broadcast"
}
```

---

### 7. Cap Table Management

**Goal:** Maintain accurate registry of token holders who have staked and KYC'd.

**Rules:**
1. **Add to cap table:** When user stakes + completes KYC
2. **Suspend rights:** When user unstakes (stays on table, no revenue share)
3. **Remove from cap table:** When NEW owner stakes the same tokens
4. **Transfer tracking:** We monitor on-chain transfers from staked addresses

**Transfer Detection:**
```typescript
// Cron job or webhook monitors staked addresses
async function detectTransfers() {
  for (const stake of activeStakes) {
    const balance = await getOnChainBalance(stake.address);
    if (balance < stake.amount) {
      // Tokens moved out
      await suspendStake(stake.id, 'tokens_transferred');
    }
  }
}
```

**Cap Table Entry Lifecycle:**
```
User A stakes 100 tokens → Added to cap table
User A transfers 100 tokens to User B → User A suspended (tokens gone)
User B stakes 100 tokens + KYC → User A removed, User B added
```

---

### 8. Serving Revenue Distribution

**Goal:** Distribute 100% of serving revenue to staked token holders.

**Flow:**
1. Facilitator earns fees (verification, inscription, settlement)
2. Revenue accumulates in serving revenue pool
3. On distribution (monthly or on-demand):
   - Calculate pro-rata share per staked token
   - Only ACTIVE stakes with $401 KYC qualify (not suspended)
   - Send BSV to each staker's derived address

**Distribution Formula:**
```
userShare = (userStakedTokens / totalStakedTokens) * servingRevenuePool
```

**API:**
```
POST /api/revenue/distribute  (admin only)
{
  poolAmount: number  // Sats to distribute
}

GET /api/revenue/pending
{
  pendingAmount: number,
  stakedTokens: number,
  estimatedShare: number
}
```

---

### 9. Security Model

**What We Control:**
- Treasury address (for receiving payments)
- Encrypted WIF storage
- Cap table and stake records
- Revenue distribution

**What Users Control:**
- Their derived private key (via signature)
- Decision to stake/unstake
- Decision to withdraw
- Their tokens (bearer instruments)

**Attack Vectors Mitigated:**
| Attack | Mitigation |
|--------|------------|
| We get hacked | Attackers can't spend without user signatures |
| We go rogue | Users can withdraw anytime with their signature |
| Database corruption | Tokens are on-chain, users have private keys |
| Accidental burns | We never have unencrypted private keys |

---

### 10. API Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/wallet/derive` | POST | HandCash | Create derived address |
| `/api/wallet/export` | POST | Signature | Export WIF private key |
| `/api/wallet/balance` | GET | HandCash | Get on-chain balance |
| `/api/token/buy` | POST | HandCash | Purchase tokens |
| `/api/token/withdraw` | POST | Signature | Withdraw to external address |
| `/api/stake` | POST | Signature | Stake tokens (requires KYC) |
| `/api/stake/unstake` | POST | Signature | Unstake tokens |
| `/api/stake/status` | GET | HandCash | Get stake status |
| `/api/captable` | GET | Public | View cap table registry |
| `/api/revenue/pending` | GET | HandCash | Check pending revenue |
| `/api/revenue/claim` | POST | Signature | Claim revenue |

---

### 11. UI Components

**Account Page:**
```
┌─────────────────────────────────────────────────────────┐
│  Your $402 Wallet                                    │
│  ─────────────────────                                  │
│  Address: 19NHocpx2SxtN5JBHP5rBip8n5U37oWsPC           │
│  [Copy] [Export Private Key] [View on Explorer]         │
│                                                         │
│  Balance: 10,000,000 $402                           │
│  Staked:  0 $402                                    │
│  ─────────────────────                                  │
│  [Stake Tokens]  [Withdraw]                            │
│                                                         │
│  ─────────────────────                                  │
│  Pending Revenue: 0 sats                               │
│  (Stake tokens + $401 KYC to earn revenue)             │
└─────────────────────────────────────────────────────────┘
```

**Stake Modal:**
```
┌─────────────────────────────────────────────────────────┐
│  Stake $402 Tokens                                   │
│  ─────────────────────                                  │
│  Amount to stake: [___________] [Max]                  │
│                                                         │
│  Staking gives you:                                    │
│  ✓ 100% serving revenue share (proportional to stake)  │
│  ✓ Listing on public cap table                         │
│                                                         │
│  Requirements:                                          │
│  • Sign with HandCash to authorize                     │
│  • Complete $401 identity verification (KYC)           │
│                                                         │
│  [Cancel]                      [Sign & Continue →]      │
└─────────────────────────────────────────────────────────┘
```

**Registry/Cap Table Page:**
```
┌─────────────────────────────────────────────────────────┐
│  $402 Registry                                       │
│  ─────────────────────                                  │
│  Total Staked: 150,000,000 $402                     │
│  Registered Holders: 47                                 │
│                                                         │
│  Handle          Staked          Since                 │
│  ────────────────────────────────────────              │
│  @b0ase          50,000,000      2026-02-03            │
│  @alice          25,000,000      2026-02-05            │
│  @bob            10,000,000      2026-02-07            │
│  ...                                                    │
└─────────────────────────────────────────────────────────┘
```

---

### 12. Implementation Phases

**Phase 1: Wallet Derivation** (Priority: Critical)
- [ ] Fix address derivation to return WIF to user
- [ ] Implement encrypted WIF storage
- [ ] Add "Export Private Key" functionality
- [ ] Verify user can spend from derived address

**Phase 2: Purchase Flow** (Priority: Critical)
- [ ] On purchase success, send BSV-21 to user's derived address
- [ ] Remove database-only token credits
- [ ] Show on-chain balance, not database balance

**Phase 3: Withdrawal** (Priority: High)
- [ ] Implement signature-authorized withdrawal
- [ ] Build BSV-21 transfer from user's address
- [ ] Add withdrawal UI

**Phase 4: Staking** (Priority: High)
- [ ] Implement stake signing flow
- [ ] Add KYC collection
- [ ] Create cap table entries
- [ ] Build registry page

**Phase 5: Revenue Distribution** (Priority: Medium)
- [ ] Implement serving revenue pool tracking
- [ ] Build distribution mechanism ($401 KYC required)
- [ ] Add claim flow

---

### 13. Migration Plan

**Current State:**
- Users have database credits
- No on-chain tokens at user addresses
- All tokens in treasury

**Migration Steps:**
1. Notify existing users to create derived addresses
2. For each user with database credits:
   - Send BSV-21 transfer to their derived address
   - Clear database credits
3. Update UI to show on-chain balance only
4. Deprecate database credit system

---

## Success Criteria

1. **Users control their tokens:** Can export private key and spend independently
2. **We have no custody:** Cannot spend user tokens without their signature
3. **Staking is opt-in:** Requires explicit signature + $401 KYC
4. **Cap table is accurate:** Reflects actual staked, $401-verified holders
5. **Revenue flows correctly:** 100% of serving revenue to active stakers

---

## Appendix: Signature Message Templates

```typescript
const MESSAGES = {
  DERIVE: (handle: string, timestamp: string) =>
    `I am creating my $402 wallet for @${handle}. Timestamp: ${timestamp}`,

  STAKE: (amount: number, timestamp: string) =>
    `I am staking ${amount} $402 tokens. I agree to provide KYC. Timestamp: ${timestamp}`,

  UNSTAKE: (amount: number, timestamp: string) =>
    `I am unstaking ${amount} $402 tokens. Timestamp: ${timestamp}`,

  WITHDRAW: (amount: number, destination: string, timestamp: string) =>
    `Withdraw ${amount} $402 to ${destination}. Timestamp: ${timestamp}`,

  EXPORT: (timestamp: string) =>
    `Export my $402 private key. Timestamp: ${timestamp}`,
};
```

---

**Document Status:** Draft
**Next Review:** After implementation of Phase 1
