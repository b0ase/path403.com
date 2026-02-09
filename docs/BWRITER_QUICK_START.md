# $bWriter Staking - Quick Start Guide

## What is $bWriter Staking?

Users earn $bWriter tokens for using Bitcoin Writer (saving documents to blockchain). They can then:

1. **Buy/Sell tokens** - Trade freely without KYC (utility token phase)
2. **Stake tokens** - Lock in multisig + verify KYC to become shareholder (securities phase)
3. **Earn dividends** - Receive proportional BSV from platform revenue

## Quick API Reference

### For Users

```bash
# 1. Start staking
curl -X POST https://b0ase.com/api/bwriter/stake \
  -H "Authorization: Bearer {user_token}" \
  -H "Content-Type: application/json" \
  -d '{ "amount": 1000000 }'

# Response:
{
  "stakeId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending_deposit",
  "multisigAddress": "1Dd3iSFQEM8spmdLbqwxMenWEryNnBBHM6",
  "depositDeadline": "2026-01-27T12:00:00Z"
}

# 2. Check staking status
curl https://b0ase.com/api/bwriter/stake \
  -H "Authorization: Bearer {user_token}"

# 3. Set BSV withdrawal address
curl -X POST https://b0ase.com/api/bwriter/dividend-address \
  -H "Authorization: Bearer {user_token}" \
  -d '{ "bsvAddress": "1Dd3iSFQEM8spmdLbqwxMenWEryNnBBHM6" }'

# 4. View complete dashboard
curl https://b0ase.com/api/bwriter/dashboard \
  -H "Authorization: Bearer {user_token}"

# 5. Unstake tokens
curl -X DELETE https://b0ase.com/api/bwriter/unstake/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer {user_token}"
```

### For Operations (Cron Jobs)

```bash
# Run deposit confirmation (triggered hourly)
curl https://b0ase.com/api/cron/bwriter/confirm-deposits \
  -H "Authorization: Bearer {CRON_SECRET}"

# Run dividend distribution (triggered daily)
curl https://b0ase.com/api/cron/bwriter/distribute-dividends \
  -H "Authorization: Bearer {CRON_SECRET}"
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: UTILITY                                            │
│                                                             │
│ User earns/purchases tokens → Stored in account            │
│ (No KYC needed, no financial rights)                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
                  User requests to stake
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: STAKING (KYC Required)                             │
│                                                             │
│ 1. POST /api/bwriter/stake                                  │
│    - Verify KYC status                                      │
│    - Create pending_deposit record                          │
│    - Return multisig address                                │
│                                                             │
│ 2. User sends tokens to multisig                            │
│    (e.g., 1Dd3iSFQEM8spmdLbqwxMenWEryNnBBHM6)              │
│                                                             │
│ 3. GET /api/cron/bwriter/confirm-deposits (runs hourly)    │
│    - Watch blockchain for deposit                           │
│    - Match UTXO to pending stake                            │
│    - Set status = 'confirmed'                               │
│    - Add to cap table                                       │
│                                                             │
│ 4. User now dividend-eligible                               │
│    - Must set BSV withdrawal address                        │
│    - POST /api/bwriter/dividend-address                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: DIVIDEND DISTRIBUTION                              │
│                                                             │
│ Platform Revenue Accumulates                                │
│         ↓                                                   │
│ GET /api/cron/bwriter/distribute-dividends (runs daily)    │
│         ↓                                                   │
│ Calculate total platform tokens staked                      │
│         ↓                                                   │
│ For each staked token:                                      │
│   - Calculate: ownership% = user_stake / total_stake        │
│   - Calculate: dividend = dividend_pool * ownership%        │
│   - Send BSV to user's withdrawal address                   │
│         ↓                                                   │
│ Update: dividends_accumulated + dividends_pending           │
│ Record: audit trail in distributions table                  │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema (Simplified)

```
user_bwriter_stakes
├── id (UUID)
├── user_id
├── amount (tokens staked)
├── status (pending_deposit, confirmed, unstaked)
├── staked_at (timestamp)
├── dividends_accumulated (satoshis)
└── ...

bwriter_cap_table
├── stake_id (links to stakes)
├── user_id
├── tokens_staked
├── percentage_of_total
└── status (active, removed)

user_bwriter_dividend_addresses
├── user_id
└── bsv_withdrawal_address

user_bwriter_dividends_owed
├── user_id
├── dividends_pending
├── dividends_claimed
└── ...

bwriter_multisig_deposits
├── stake_id
├── user_id
├── deposit_txid (recorded when blockchain confirms)
├── status (waiting, confirmed)
└── ...
```

## Status Codes & State Machine

### Stake Lifecycle

```
pending_deposit (waiting for user to send tokens)
    ↓
    └→ [cron confirms on blockchain]
    ↓
confirmed (in cap table, earning dividends)
    ↓
    └→ [user requests unstake]
    ↓
unstaked (out of cap table, no future dividends)
```

### Deposit Lifecycle

```
waiting (no transaction yet)
    ↓
    └→ [blockchain receives tokens]
    ↓
confirmed (matched to stake, recorded)
```

## Key Constants

```typescript
const MULTISIG_ADDRESS = '1Dd3iSFQEM8spmdLbqwxMenWEryNnBBHM6'
const DIVIDEND_PERCENTAGE = 0.75  // 75% of revenue
const PLATFORM_FEE = 0.25  // 25% of revenue
const CONFIRMATIONS_REQUIRED = 1  // BSV confirms quickly
const DEPOSIT_DEADLINE_HOURS = 24
```

## Common Scenarios

### Scenario 1: User Stakes for the First Time

```
1. User has 1M $bWriter tokens
2. POST /api/bwriter/stake { amount: 1000000 }
   - System: "KYC verified? ✓ Balance sufficient? ✓"
   - Creates: pending_deposit record
   - Returns: multisig address + 24h deadline

3. User sends 1M tokens to multisig wallet
   - Blockchain processes transaction
   - UTXO appears at address

4. [1 hour later] Cron job runs
   - Finds matching UTXO
   - Updates stake: status = "confirmed"
   - Adds to cap table
   - Deducts from user balance

5. User sets withdrawal address
   - POST /api/bwriter/dividend-address { bsvAddress: "1..." }
   - Now dividend-eligible ✓

6. [Daily] Dividend distribution runs
   - User earns: dividend_pool * (1M / total_staked)
   - Receives BSV in wallet
```

### Scenario 2: User Unstakes

```
1. User has 1M staked tokens
2. DELETE /api/bwriter/unstake/[stake-id]
   - Stake status: confirmed → unstaked
   - Removed from cap table
   - 1M tokens returned to balance
   - Accumulated dividends preserved

3. User can now:
   - Withdraw tokens (trade, cash out)
   - Re-stake later (creates new stake)
```

### Scenario 3: User Withdraws Without Restaking

```
1. User unstakes 1M tokens
2. Sends tokens out of b0ase.com (maybe to DEX to sell)
3. Accumulated dividends remain "owed"
4. If BSV price goes up significantly, dividends might be worth claiming later
5. (Future) User re-stakes: dividends become active again
```

## Error Handling

```
// KYC Not Verified
403 {
  error: "KYC verification required to stake tokens",
  kycStatus: "not_started",
  message: "Visit /tools/verify to complete KYC"
}

// Insufficient Balance
400 {
  error: "Insufficient balance",
  required: 1000000,
  available: 500000
}

// Deposit Already Confirmed
400 {
  error: "Cannot unstake stake with status 'unstaked'",
  reason: "Stake is already unstaked"
}

// Invalid Withdrawal Address
400 {
  error: "Invalid BSV address",
  details: "Address must be 26-35 characters starting with 1 or 3"
}
```

## Monitoring Checklist

```
✓ Hourly deposit confirmations completing
✓ Daily dividend distributions running
✓ No pending deposits stuck past deadline
✓ Withdrawal address format validation working
✓ Cap table percentages updating correctly
✓ Dividend math accurate (75% pool split)
```

## Testing

### Unit Test Template

```typescript
describe('Staking System', () => {
  it('should create pending deposit with KYC', async () => {
    // Verify: KYC ✓, Balance ✓
    // POST /api/bwriter/stake { amount: 1M }
    // Expect: pending_deposit status, multisig address returned
  })

  it('should confirm deposit from blockchain', async () => {
    // Setup: pending_deposit exists
    // Mock: whatsonchain returns UTXO
    // Call: GET /api/cron/bwriter/confirm-deposits
    // Expect: status = confirmed, added to cap table
  })

  it('should calculate ownership percentages', async () => {
    // Setup: 3 stakes (1M, 500k, 500k tokens)
    // Calculate: percentages (50%, 25%, 25%)
    // Distribute: 1M satoshis
    // Expect: User1=500k, User2=250k, User3=250k
  })
})
```

## Deployment Checklist

- [ ] Database migration applied
- [ ] All endpoints deployed
- [ ] CRON_SECRET configured in Vercel
- [ ] Cron jobs scheduled in vercel.json
- [ ] Multisig address correct
- [ ] Error monitoring active (Sentry/Vercel)
- [ ] Staging environment tested
- [ ] KYC integration verified
- [ ] Frontend UI implemented
- [ ] User documentation written

## Troubleshooting

**Q: Stake stuck in "pending_deposit" forever**
A: Check:
- User actually sent tokens to multisig
- whatsonchain API is responding
- Amount matches (allow 1000 sat variance)
- Cron job running (check Vercel logs)

**Q: Dividends not being distributed**
A: Check:
- Revenue tracking implemented (currently stubbed)
- Withdrawal addresses configured for users
- Cron schedule active
- Cap table has active entries

**Q: User claims missing dividend**
A: Check:
- Stake was status="confirmed" during distribution
- User had KYC verified at time of distribution
- Withdrawal address was set

## Next Steps

1. Implement revenue tracking from BitcoinWriter saves
2. Implement actual BSV transfer (currently stubbed)
3. Build frontend staking UI
4. Deploy to staging
5. Deploy to production
6. Deploy to bitcoin-writer.com and bitcoin-corp-website

---

**Last Updated**: 2026-01-26
**Maintainer**: b0ase team
**Questions?** Check `/docs/BWRITER_STAKING.md` for full documentation
