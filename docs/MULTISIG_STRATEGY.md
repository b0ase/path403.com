# Multisig Wallet Strategy

> **Goal**: Move from custodial (b0ase controls) to non-custodial (user controls) while maintaining recovery capability.

## Current State: 2-of-2 Multisig

```
Key 1: User's public key (from their wallet)
Key 2: b0ase platform key (derived from MASTER_SEED + userId)

Problem: Neither party can act alone
- User can't withdraw without b0ase signature
- b0ase can't move funds without user signature
- If either key is lost, funds are GONE
```

**Regulatory Issue**: This is arguably still custodial because the user cannot unilaterally access their funds.

## Target State: 2-of-3 Multisig (User Controls 2 Keys)

```
Key 1: User's PRIMARY key (in their wallet)
Key 2: User's BACKUP key (generated at signup, stored by user)
Key 3: b0ase RECOVERY key (derived from MASTER_SEED + userId)

User can: Move funds with Key 1 + Key 2 (no b0ase involvement)
b0ase can: Assist recovery with Key 3 + either user key
b0ase cannot: Move funds unilaterally (only has 1 of 3)
```

**Regulatory Benefit**: User has unilateral control = b0ase is NOT a custodian.

## Implementation Plan

### Phase 1: New Wallet Architecture

**1. Update vault creation** (`lib/custody/vault-manager.ts`)

```typescript
interface ThreeKeyVault {
  userPrimaryPubKey: string;    // From user's connected wallet
  userBackupPubKey: string;     // Generated at signup, user must save
  platformRecoveryPubKey: string; // b0ase's key for recovery assist
  redeemScript: string;         // 2-of-3 P2SH script
  address: string;              // P2SH address
}

// Create 2-of-3 multisig where ANY 2 keys can sign
function createThreeKeyVault(
  userPrimaryPubKey: string,
  userBackupPubKey: string,
  userId: string
): ThreeKeyVault {
  const platformKey = derivePlatformKey(userId);

  const redeemScript = Script.fromASM(
    `OP_2 ${userPrimaryPubKey} ${userBackupPubKey} ${platformKey.publicKey} OP_3 OP_CHECKMULTISIG`
  );

  return {
    userPrimaryPubKey,
    userBackupPubKey,
    platformRecoveryPubKey: platformKey.publicKey.toString(),
    redeemScript: redeemScript.toHex(),
    address: redeemScript.toAddress().toString()
  };
}
```

**2. Backup key generation flow**

At wallet creation:
1. Generate keypair client-side
2. Display backup key to user with STRONG warning
3. Require user to confirm they've saved it
4. Store only the PUBLIC key on server
5. User stores private key (we never see it)

```typescript
// Client-side only
function generateBackupKeypair(): { publicKey: string; privateKey: string } {
  const privateKey = PrivateKey.fromRandom();
  return {
    publicKey: privateKey.toPublicKey().toString(),
    privateKey: privateKey.toWif() // User must save this!
  };
}
```

**3. Database schema update**

```prisma
model shareholder_wallets {
  id                    String   @id @default(uuid())
  user_id               String

  // 2-of-3 keys
  user_primary_pubkey   String   // From connected wallet
  user_backup_pubkey    String   // Generated at signup
  platform_recovery_pubkey String // b0ase's key

  // Vault details
  redeem_script         String
  address               String   @unique

  // Migration tracking
  vault_version         Int      @default(2) // 1 = old 2-of-2, 2 = new 2-of-3
  migrated_at           DateTime?

  // Balances
  balance_satoshis      BigInt   @default(0)
  token_balances        Json     @default("{}")

  created_at            DateTime @default(now())
  updated_at            DateTime @updatedAt
}
```

### Phase 2: Transaction Signing

**Normal withdrawal (user has both keys):**
1. User initiates withdrawal from UI
2. User signs with PRIMARY key (wallet prompt)
3. User signs with BACKUP key (enters WIF or uses stored key)
4. Transaction broadcast — b0ase not involved

**Recovery flow (user lost one key):**
1. User contacts support with identity verification
2. User signs with remaining key
3. b0ase signs with RECOVERY key
4. Transaction broadcast to new user-controlled address
5. New 2-of-3 vault created with new keys

### Phase 3: Migration Path

**For existing 2-of-2 vaults:**

1. Identify all existing vaults (vault_version = 1)
2. Notify users: "Upgrade your wallet for full self-custody"
3. User generates backup key
4. Create new 2-of-3 vault
5. User signs transfer from old → new vault
6. b0ase co-signs transfer (we have key 2 in old system)
7. Mark old vault as migrated

```typescript
async function migrateVault(userId: string, newBackupPubKey: string) {
  const oldVault = await getExistingVault(userId);
  const newVault = createThreeKeyVault(
    oldVault.userPrimaryPubKey,
    newBackupPubKey,
    userId
  );

  // Build transfer transaction
  const tx = await buildTransferTx(oldVault.address, newVault.address);

  // Get user signature
  const userSig = await requestUserSignature(tx);

  // Add platform signature (we have this key in old 2-of-2)
  const platformSig = signWithPlatformKey(tx, userId);

  // Broadcast
  await broadcastTx(tx);

  // Update database
  await updateVaultToVersion2(userId, newVault);
}
```

### Phase 4: UI/UX Changes

**Wallet creation screen:**
```
┌─────────────────────────────────────────────┐
│  Create Your Self-Custody Wallet            │
├─────────────────────────────────────────────┤
│                                             │
│  Your wallet uses 2-of-3 multisig:          │
│  • Key 1: Your connected wallet             │
│  • Key 2: Your backup key (SAVE THIS!)      │
│  • Key 3: b0ase recovery key                │
│                                             │
│  You control 2 keys. We control 1.          │
│  You can move funds without us.             │
│  We cannot move funds without you.          │
│                                             │
│  ⚠️  BACKUP KEY - WRITE THIS DOWN:          │
│  ┌─────────────────────────────────────┐    │
│  │ L4rK8x...your-wif-key-here...9Qp   │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  □ I have saved my backup key securely      │
│  □ I understand if I lose both keys,        │
│    my funds are lost forever                │
│                                             │
│  [Create Wallet]                            │
└─────────────────────────────────────────────┘
```

**Withdrawal screen:**
```
┌─────────────────────────────────────────────┐
│  Withdraw Funds                             │
├─────────────────────────────────────────────┤
│                                             │
│  Amount: 0.001 BSV                          │
│  To: 1ABC...xyz                             │
│                                             │
│  Sign with your keys:                       │
│  ✓ Primary key (wallet connected)           │
│  □ Backup key: [Enter WIF...         ]      │
│                                             │
│  [Sign & Withdraw]                          │
│                                             │
│  Lost your backup key?                      │
│  → Contact support for recovery             │
└─────────────────────────────────────────────┘
```

## Security Considerations

### MASTER_SEED Protection
- Currently in environment variable (RISKY)
- Should migrate to HSM or key management service
- Consider: AWS KMS, HashiCorp Vault, or hardware HSM
- At minimum: encrypt at rest, rotate periodically

### Key Derivation
```typescript
// Current (acceptable for now)
function derivePlatformKey(userId: string): PrivateKey {
  const seed = process.env.MASTER_SEED!;
  const path = `m/44'/236'/0'/0/${hashUserId(userId)}`;
  return PrivateKey.fromSeed(seed).derive(path);
}

// Future (better)
function derivePlatformKey(userId: string): PrivateKey {
  const encryptedSeed = await kms.decrypt(process.env.ENCRYPTED_MASTER_SEED);
  // ... same derivation
}
```

### Backup Key Security
- Generated client-side (server never sees private key)
- User must store securely (password manager, paper, hardware)
- Consider: optional encrypted backup to email/cloud
- Warning: if user loses both keys, funds are unrecoverable

### Recovery Process
- Requires identity verification (KYC or alternative)
- Rate-limited (max 1 recovery per 30 days)
- Notify user of recovery attempts
- 48-hour delay before execution (fraud prevention)

## Regulatory Implications

### With 2-of-3 (user has 2 keys):
- User has unilateral control
- b0ase is NOT "safeguarding" assets
- b0ase is NOT a custodian wallet provider
- FCA registration for custody NOT required

### Remaining considerations:
- If we're exchanging fiat ↔ crypto, still need AML registration
- If we're facilitating token purchases, may have other obligations
- The wallet structure doesn't affect securities analysis

## Timeline

| Phase | Work | Duration |
|-------|------|----------|
| 1 | New vault architecture | 1-2 weeks |
| 2 | Transaction signing UI | 1 week |
| 3 | Migration tooling | 1 week |
| 4 | User communication | Ongoing |
| 5 | HSM integration | 2-4 weeks (optional, recommended) |

## Immediate Actions

1. **Update Terms of Service** ✅ Done
2. **Add prominent disclaimer** to wallet pages about current custodial status
3. **Begin Phase 1** development of 2-of-3 architecture
4. **Audit MASTER_SEED** storage and access
5. **Document recovery procedures** for support team

## Open Questions

1. Should backup key be optional? (Some users won't want to manage it)
2. What happens if user loses backup key AND primary wallet?
3. Should we offer custodial option for users who prefer it?
4. How do we handle institutional users who want different key arrangements?

---

*This document represents b0ase.com's planned approach to wallet custody. Implementation details may change. This is not financial or legal advice.*
