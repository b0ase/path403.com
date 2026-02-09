# $PATH402 Token Architecture (Equity Token)

> **Note**: This document describes **$PATH402**, the equity/revenue-share token. For the **$402 mining token** (PoW, HTM smart contract), see [HTM_TOKEN.md](HTM_TOKEN.md).

## Overview

$PATH402 is the equity token of the $402 protocol. It uses a two-tier system that separates token holding (permissionless) from equity participation (KYC required).

$PATH402 is separate from the $402 mining token. See [HTM_TOKEN.md](HTM_TOKEN.md) for the mining token's 21M supply, sCrypt smart contract, and Proof-of-Indexing system.

## Address Derivation

Users derive their own PATH402 address from their HandCash signature. This means:

1. **User controls the keys** - PATH402 never has access to private keys
2. **Deterministic derivation** - Same signature always produces same address
3. **Verifiable on-chain** - Anyone can verify address ownership via signature

### Derivation Process

```
1. User connects HandCash (requires SIGN_DATA permission)
2. User signs: "PATH402-ACCOUNT-{handle}-{timestamp}"
3. Signature → SHA256 → secp256k1 private key
4. Private key → Public key → BSV address
5. Address stored on-chain as user's PATH402 account
```

## Tier 1: Token Holders (No KYC)

**Requirements:** None (just a HandCash account)

**Capabilities:**
- Receive tokens to their derived address
- Hold tokens (on-chain, in their control)
- Transfer tokens to any address (user signs with their keys)
- View balance on registry

**Restrictions:**
- Cannot stake
- Cannot receive dividends
- Cannot vote

**Implementation:**
- Tokens live at user's derived address (standard BSV-20)
- User can import address into any wallet
- Fully self-custodial

## Tier 2: Stakers (KYC Required)

**Requirements:**
- Tier 1 address
- KYC verification (identity, jurisdiction check)

**Capabilities:**
- All Tier 1 capabilities
- Stake tokens for dividends
- Receive proportional dividends from protocol revenue
- Vote on protocol governance

**Staking Mechanism:**

When staking, tokens move to a 2-of-2 multi-sig:
- Key 1: User's derived key (same as Tier 1)
- Key 2: Platform staking contract key

This ensures:
- User cannot unilaterally withdraw (prevents gaming dividends)
- Platform cannot unilaterally seize (user's key required)
- Proper unstaking process must be followed
- Dividend distribution is enforceable

### Multi-sig Staking Flow

```
STAKE:
1. User requests stake of N tokens
2. Platform generates staking multi-sig address
3. User signs transfer to multi-sig
4. Tokens locked, staking position recorded

UNSTAKE:
1. User requests unstake
2. Cooldown period (e.g., 7 days)
3. Both parties sign transfer back to user's address
4. Tokens return to user's sole control

DIVIDENDS:
1. Protocol revenue accumulates
2. Snapshot of staked balances taken
3. Dividends calculated per staker
4. Platform signs, user claims (or auto-distribute)
```

## KYC Requirements

For Tier 2 (staking/dividends), users must provide:

1. **Identity Verification**
   - Full legal name
   - Date of birth
   - Government ID (passport, driver's license)

2. **Address Verification**
   - Proof of address (utility bill, bank statement)
   - Country of residence

3. **Jurisdiction Check**
   - Not in restricted jurisdictions
   - Accredited investor status (if required by jurisdiction)

4. **Tax Information**
   - Tax ID / SSN (for US persons)
   - W-8BEN (for non-US persons)

**KYC Provider:** TBD (Jumio, Onfido, Persona, etc.)

## On-Chain State

### Token Contract (BSV-20)
```
{
  "p": "bsv-20",
  "op": "deploy+mint",
  "tick": "PATH402.com",
  "max": "1000000000",
  "dec": "0"
}
```

### Holder State
Each holder's tokens are at their derived address:
- No central database needed for balances
- Query blockchain for source of truth
- Database only caches for performance

### Staking State
Staked tokens are in multi-sig UTXOs:
- UTXO script: `OP_2 <user_pubkey> <platform_pubkey> OP_2 OP_CHECKMULTISIG`
- Staking positions tracked by UTXO
- Unstaking creates new transaction back to user

## Security Considerations

1. **Key Derivation**
   - Use BIP-340 Schnorr signatures from HandCash
   - Deterministic but unpredictable derivation
   - User can re-derive if they lose local cache

2. **Multi-sig Safety**
   - Platform key in HSM (Hardware Security Module)
   - Time-locked recovery if platform disappears
   - User can always prove ownership via original signature

3. **KYC Data**
   - Encrypted at rest
   - Minimal data retention
   - Compliance with GDPR, CCPA

## Migration Path

### Phase 1: Current (Database)
- Balances in PostgreSQL
- HandCash payments work
- Registry shows database state

### Phase 2: Address Derivation
- Users derive on-chain addresses
- Tokens still allocated via database
- Withdrawal creates real BSV-20 transfer

### Phase 3: Full On-Chain
- All balances on-chain
- Database only caches
- Multi-sig staking implemented

### Phase 4: KYC Integration
- KYC provider integrated
- Tier 2 staking enabled
- Dividend distribution live

## API Endpoints

```
POST /api/account/derive
  - Input: HandCash signature
  - Output: Derived BSV address

GET /api/account/{address}
  - Returns: balance, tier, staking status

POST /api/account/kyc/start
  - Initiates KYC flow
  - Returns: KYC provider redirect URL

POST /api/account/kyc/complete
  - Webhook from KYC provider
  - Upgrades user to Tier 2

POST /api/staking/stake
  - Input: amount, user signature
  - Output: multi-sig address, stake ID

POST /api/staking/unstake
  - Input: stake ID
  - Initiates cooldown

POST /api/staking/claim
  - Claims pending dividends
```

## Compliance Notes

This architecture is designed to:

1. **Separate utility from equity** - Holding tokens ≠ equity stake
2. **KYC for income** - Only dividend recipients need KYC
3. **User custody** - Platform never controls user funds
4. **Auditability** - All state on public blockchain
5. **Jurisdiction awareness** - Can restrict staking by region

**Not legal advice** - Consult securities lawyers for your jurisdiction.
