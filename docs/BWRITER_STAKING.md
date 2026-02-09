# $bWriter Token Staking & Dividend System

**Status**: Phase 1 Infrastructure Complete (Hybrid Model)

This document describes the complete $bWriter token staking and dividend distribution system. It's a hybrid on-chain + off-chain architecture that allows users to earn dividends through platform usage while solving FCA compliance challenges through strategic separation of utility tokens from securities.

## Architecture Overview

The system operates in two phases:

### Phase 1: Utility Phase (No KYC Required)
- User earns/purchases $bWriter tokens through platform usage
- Tokens stored in `user_bwriter_balance` table
- No financial rights attached to tokens at this stage
- User can trade, withdraw, or stake freely

### Phase 2: Staking Phase (KYC Required)
- User voluntarily sends tokens to multisig wallet
- At staking moment, KYC verification is required
- Staked tokens enter cap table and become dividend-bearing
- User entitled to proportional share of platform revenue

### Phase 3: Dividend Distribution
- Platform revenue (from usage fees) accumulates in multisig
- Quarterly/monthly dividend distributions calculated based on ownership percentages
- BSV dividends sent directly to each holder's BSV wallet
- Rewards flow without intermediaries (bank, payment processor, etc.)

## Key Economic Principles

**Regulatory Advantage**:
- Utility tokens (earned/purchased) = no financial rights = FCA exempt
- Staked tokens (with KYC) = voluntary securities relationship = optional registration
- Dividends only accrue on staked portion
- If user withdraws tokens, they're "unchained" from dividends (though accumulated dividends remain claimable)

**Incentive Structure**:
- Early stakers benefit from full dividend accrual period
- Withdrawn tokens lose forward dividends but preserve accumulated history
- High platform adoption increases dividend value
- Users directly benefit from their usage and platform growth

## Database Schema

### Core Tables

**user_bwriter_balance**
```
- user_id (PK)
- balance: Current tokens in account (not staked)
- total_earned: Tokens earned through usage
- total_purchased: Tokens bought
- total_withdrawn: Tokens removed from system
- total_staked_ever: Cumulative tokens ever staked
```

**user_bwriter_stakes**
```
- id (PK)
- user_id
- kyc_id: Must be verified to stake
- amount: Tokens locked
- status: 'pending_deposit', 'confirmed', 'unstaking', 'unstaked'
- staked_at: When blockchain confirmed
- unstaked_at: When tokens were removed
- dividends_accumulated: Satoshis earned during staking
- dividends_claimed: Satoshis already paid out
```

**bwriter_cap_table** (Master register)
```
- stake_id (PK)
- user_id
- tokens_staked: Amount in this stake
- percentage_of_total: Calculated during dividend distributions
- status: 'active', 'unstaked_pending', 'removed'
```

**bwriter_multisig_deposits** (Blockchain watch)
```
- stake_id (PK)
- user_id
- deposit_txid: Transaction when tokens arrive
- amount_expected: What user said they'd send
- amount_received: What actually arrived
- confirmations: Blockchain confirmations
- status: 'waiting', 'received', 'confirmed', 'failed'
```

**user_bwriter_dividend_addresses**
```
- user_id (PK)
- bsv_withdrawal_address: Where dividends are sent
- address_verified: (future: signature validation)
- last_dividend_paid_to_address
```

**user_bwriter_dividends_owed**
```
- user_id (PK)
- dividends_pending: Accumulated, unclaimed
- dividends_claimed: Already paid
- last_claim_at
```

**bwriter_dividend_distributions** (Audit trail)
```
- distribution_round (PK)
- block_height: Where in time
- total_revenue_bsv: Platform earnings
- dividend_pool_bsv: 75% of revenue
- total_tokens_staked: Denominator for splits
```

## API Endpoints

### User Actions

**POST /api/bwriter/stake**
- User initiates stake request
- Checks: KYC verified? Balance sufficient?
- Creates `pending_deposit` record
- Returns: multisig address, 24-hour deadline, stake ID
- Next: User must send tokens to multisig address

```json
{
  "success": true,
  "stakeId": "uuid",
  "status": "pending_deposit",
  "amount": 1000000,
  "depositDeadline": "2026-01-27T12:00:00Z",
  "multisigAddress": "1Dd3iSFQEM8spmdLbqwxMenWEryNnBBHM6",
  "instructions": "Send 1,000,000 tokens to..."
}
```

**GET /api/bwriter/stake**
- Get user's current staking status
- Returns: balance, all stakes, dividends owed

**DELETE /api/bwriter/unstake/[stakeId]**
- Remove stake from cap table
- Returns tokens to user balance
- Preserves accumulated dividends
- User can now withdraw or re-stake

**GET /api/bwriter/unstake/[stakeId]**
- Check if stake can be unstaked
- Shows: current status, amount, accumulated dividends

**POST /api/bwriter/dividend-address**
- Set or update BSV withdrawal address
- Address must be valid BSV format (1xxxxx or 3xxxxx)
- Required to receive dividends

**GET /api/bwriter/dividend-address**
- Get current withdrawal address
- Shows: address, dividend eligibility, accumulated dividends

**GET /api/bwriter/dashboard**
- Comprehensive staking dashboard
- Shows: balance, all stakes, dividends, ownership %, next steps
- Used by frontend for user profile

### Cron Jobs (Automated)

**GET /api/cron/bwriter/confirm-deposits** (Runs hourly)
- Queries whatsonchain API for UTXOs at multisig
- Matches incoming transactions to pending deposits
- When found: activates stake, adds to cap table, deducts from user balance
- Requires: `Authorization: Bearer {CRON_SECRET}`

**GET /api/cron/bwriter/distribute-dividends** (Runs daily/weekly)
- Calculates total platform revenue
- Determines dividend pool (75% of revenue)
- Calculates each stake's ownership percentage
- Distributes proportional BSV to withdrawal addresses
- Records distribution for audit trail
- Requires: `Authorization: Bearer {CRON_SECRET}`

## Staking Lifecycle

### 1. User Initiates Stake
```
POST /api/bwriter/stake { amount: 1000000 }
↓
- Check: User has KYC? Balance sufficient?
- Create: user_bwriter_stakes record (status = pending_deposit)
- Create: bwriter_multisig_deposits record (status = waiting)
- Return: multisig address + 24-hour deadline
```

### 2. User Sends Tokens to Multisig
```
User action: Send BSV-20 tokens to 1Dd3iSFQEM8spmdLbqwxMenWEryNnBBHM6
↓
Token appears on blockchain (confirmations increasing)
```

### 3. Cron Job Confirms Deposit
```
GET /api/cron/bwriter/confirm-deposits (runs hourly)
↓
- Query whatsonchain for UTXOs at multisig
- Find matching deposit for pending stake
- Update: bwriter_multisig_deposits (status = confirmed, txid recorded)
- Update: user_bwriter_stakes (status = confirmed, staked_at = now)
- Insert: bwriter_cap_table (stake is now dividend-eligible)
- Update: user_bwriter_balance (deduct tokens from available balance)
```

### 4. Dividends Accrue
```
Platform revenue flows in as users save documents
↓
Dividends accumulate on confirmed stakes
↓
GET /api/cron/bwriter/distribute-dividends (runs daily/weekly)
↓
- Calculate ownership percentages
- Calculate dividend amount for each stake
- Update: dividends_accumulated on each stake
- Update: dividends_pending for each user
- Send: BSV to withdrawal addresses
```

### 5. User Unstakes (Optional)
```
DELETE /api/bwriter/unstake/[stakeId]
↓
- Verify: stake belongs to user and is confirmed
- Update: user_bwriter_stakes (status = unstaked, unstaked_at = now)
- Update: bwriter_cap_table (status = removed)
- Update: user_bwriter_balance (add tokens back to balance)
- Preserve: dividends_accumulated (still claimable)
↓
Tokens can now be withdrawn or re-staked
Dividends stop accruing from this point forward
```

## Revenue & Economics

### Revenue Sources (To be integrated)
1. **Bitcoin Writer save transactions** - Users pay per save
2. **Bitcoin Corp service fees** - Services purchased
3. **Other platform revenue** - Any additional earnings

### Dividend Calculation
```
Total Platform Revenue = X satoshis
Dividend Pool = X * 0.75 (75% dividend, 25% platform fee)

For each stake:
  User's Ownership % = stake.amount / total_staked
  User's Dividend = Dividend Pool * User's Ownership %

Example:
  Platform earns: 1,000,000 satoshis
  Dividend pool: 750,000 satoshis

  User A: 1,000,000 tokens (33% of 3M total)
    Receives: 250,000 satoshis

  User B: 500,000 tokens (16% of 3M total)
    Receives: 125,000 satoshis
```

### Platform Growth Incentive
- Early stakers get larger percentage ownership
- As platform grows and more revenue comes in, their fixed percentage earns more
- This incentivizes early adoption and creates alignment between user and platform

## Multi-Platform Architecture

The system is designed to work across multiple platforms:

1. **b0ase.com** - Primary staking and dividend interface
2. **bitcoin-writer.com** - Allow staking from writer platform
3. **bitcoin-corp-website** - Services and marketplace staking

All platforms:
- Watch the same multisig address for deposits
- Query the shared cap table for dividends
- Update shared dividend records
- Maintain local balance records for UI/UX

This prevents lock-in and allows users to stake from their preferred platform.

## Regulatory Compliance Strategy

### Why This Structure Works

**Utility Token Exemption** (applies to earned/purchased tokens)
- Tokens have no financial characteristics until staked
- No promise of dividend at purchase time
- FCA treats as utility/reward token (exempt)
- Users can trade freely without being "investors"

**Securities Exemption** (applies to staked tokens)
- When user stakes with KYC, they're explicitly becoming shareholder
- Clear financial relationship (dividends in BSV)
- Can optionally register as security depending on jurisdiction
- KYC requirement ensures AML/KYC compliance

**Dividend Distribution** (pure function)
- Direct payments to user's own wallet
- No custodian, no intermediary
- User has full control of BSV at all times
- Complies with crypto-friendly jurisdictions

### No Middle Ground
Users either:
1. Have utility tokens (can trade, no rights) → no regulation needed
2. Stake with KYC (have securities) → optional registration, clear terms

This binary approach is cleaner than gray area "tokens with potential future utility."

## Implementation Status

### ✅ Completed (Phase 1)

Database:
- ✅ Schema with all 8 tables
- ✅ Indexes for performance
- ✅ Comments for clarity

API Endpoints:
- ✅ POST /api/bwriter/stake - Create stakes with KYC enforcement
- ✅ GET /api/bwriter/stake - Check staking status
- ✅ DELETE /api/bwriter/unstake/[id] - Remove from cap table
- ✅ GET /api/bwriter/unstake/[id] - Validate unstake eligibility
- ✅ POST/GET /api/bwriter/dividend-address - Manage withdrawal addresses
- ✅ GET /api/bwriter/dashboard - Comprehensive user dashboard

Cron Jobs:
- ✅ GET /api/cron/bwriter/confirm-deposits - Blockchain watcher (hourly)
- ✅ GET /api/cron/bwriter/distribute-dividends - Dividend calculator (daily/weekly)

### 🚧 Pending (Phase 2)

Infrastructure:
- 🚧 Revenue tracking table and ingestion
- 🚧 Actual BSV transfer implementation
- 🚧 Multisig key management
- 🚧 Admin dashboard for manual distribution trigger

Frontend:
- 🚧 Staking UI component
- 🚧 Dashboard visualization
- 🚧 Unstaking confirmation modal
- 🚧 Withdrawal address form

Monitoring:
- 🚧 Deposit confirmation alerts
- 🚧 Failed deposit notifications
- 🚧 Dividend distribution reports

### ❌ Not Yet Started (Phase 3)

Advanced:
- ❌ Cross-platform stake transfers
- ❌ Stake delegation/proxy voting
- ❌ Buyback mechanism (platform buys own tokens)
- ❌ Token burning/deflation
- ❌ Vesting schedules for founders
- ❌ Multi-signature governance

## Configuration

### Environment Variables

```bash
# Database (Supabase)
DATABASE_URL=postgresql://...

# Cron Jobs
CRON_SECRET=your-secret-key-here

# Optional: Blockchain
WHATSONCHAIN_API_KEY=...
MULTISIG_ADDRESS=1Dd3iSFQEM8spmdLbqwxMenWEryNnBBHM6
```

### Vercel Cron Configuration

```json
{
  "crons": [
    {
      "path": "/api/cron/bwriter/confirm-deposits",
      "schedule": "0 * * * *",
      "description": "Confirm deposits every hour"
    },
    {
      "path": "/api/cron/bwriter/distribute-dividends",
      "schedule": "0 0 * * *",
      "description": "Distribute dividends daily"
    }
  ]
}
```

## Testing Checklist

### Unit Tests
- [ ] Stake creation with/without KYC
- [ ] Balance validation
- [ ] Unstaking logic
- [ ] Ownership percentage calculation
- [ ] Dividend distribution math

### Integration Tests
- [ ] End-to-end stake flow
- [ ] Blockchain confirmation mocking
- [ ] Multi-user dividend distribution
- [ ] Cross-platform consistency

### Manual Tests
- [ ] Create stake via UI
- [ ] Verify pending_deposit status
- [ ] Send tokens to multisig
- [ ] Check confirmation via cron
- [ ] Verify cap table entry
- [ ] Trigger dividend distribution
- [ ] Verify dividend calculations
- [ ] Unstake and verify balance return
- [ ] Check dividend preservation

## Next Steps

1. **Implement Revenue Tracking** - Create endpoint to record platform revenue from BitcoinWriter saves
2. **Deploy to Staging** - Test all endpoints with real Supabase instance
3. **Frontend UI** - Build staking flow, dashboard, unstaking modals
4. **BSV Integration** - Implement actual BSV transfers (currently stubbed)
5. **Admin Dashboard** - Manual dividend trigger, recipient management
6. **Cross-Platform** - Deploy to bitcoin-corp-website and bitcoin-writer.com
7. **Monitoring** - Set up alerts for failed deposits, pending transfers
8. **Documentation** - User guide, FAQ, compliance statement

## Key Files

```
/app/api/bwriter/
├── stake/route.ts                    # Create stakes
├── unstake/[stakeId]/route.ts        # Remove stakes
├── dividend-address/route.ts         # Manage addresses
└── dashboard/route.ts                # User dashboard

/app/api/cron/bwriter/
├── confirm-deposits/route.ts         # Hourly blockchain watch
└── distribute-dividends/route.ts     # Daily dividend distribution

/database/migrations/
└── bwriter-staking.sql               # Complete schema
```

---

**Last Updated**: 2026-01-26
**Architecture**: Hybrid (DB + Blockchain Watch)
**Status**: Phase 1 Complete, Ready for Phase 2 (Frontend & BSV Integration)
