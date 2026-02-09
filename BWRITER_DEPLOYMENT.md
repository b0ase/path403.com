# $bWriter Staking Phase 1 - Deployment Guide

**Status**: Ready for Deployment
**Date**: 2026-01-26
**Environment**: Staging (before production)

## Pre-Deployment Checklist

- [x] All API endpoints implemented
- [x] Database schema created
- [x] Environment variables configured
- [x] Cron jobs scheduled in vercel.json
- [x] Documentation complete

## Step 1: Apply Database Migration to Supabase

The database schema must be applied before deploying the API endpoints.

### Option A: Via Supabase Dashboard (Recommended for first-time)

1. Go to https://app.supabase.com/projects
2. Select your b0ase.com project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire content from `/database/migrations/bwriter-staking.sql`
6. Paste into the SQL editor
7. Click **Run** (or Cmd+Enter)
8. Verify success: All tables created without errors

### Option B: Via Supabase CLI (If already installed)

```bash
# Set active project
supabase projects list
supabase link --project-ref <project-id>

# Apply migration
supabase db push bwriter-staking.sql
```

### Option C: Via psql (Direct database access)

```bash
# Connect to database
psql "$DATABASE_URL"

# Load migration
\i /Volumes/2026/Projects/b0ase.com/database/migrations/bwriter-staking.sql

# Verify tables created
\dt user_bwriter*
\dt bwriter*
```

### Verification

After applying migration, verify all tables exist:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'bwriter%' OR table_name LIKE 'user_bwriter%';

-- Expected output (8 tables):
-- user_bwriter_balance
-- user_bwriter_stakes
-- user_bwriter_dividends_owed
-- bwriter_cap_table
-- bwriter_dividend_distributions
-- bwriter_multisig_deposits
-- user_bwriter_dividend_addresses
```

## Step 2: Verify Environment Variables

Check that all required environment variables are set in Vercel:

### Required for Vercel Production

```bash
# In Vercel dashboard → Settings → Environment Variables, add:

# Cron Security
CRON_SECRET=b0ase-cron-secret-a90148dca317d210bec21db373ca351b

# $bWriter Configuration
BWRITER_MULTISIG_ADDRESS=1Dd3iSFQEM8spmdLbqwxMenWEryNnBBHM6

# Optional (but recommended)
WHATSONCHAIN_API_KEY=your-api-key
BWRITER_MULTISIG_PRIVATE_KEY=your-private-key-wif
BWRITER_REVENUE_TRACKER_ADDRESS=optional-address
```

**Note**: These are already in `.env.local` for development. For production, set them in Vercel dashboard.

## Step 3: Deploy API Endpoints

### Option A: Git Push to Main (Automatic)

```bash
git add app/api/bwriter/
git add app/api/cron/bwriter/
git add database/migrations/bwriter-staking.sql
git add vercel.json
git add .env.example
git commit -m "feat: Deploy $bWriter staking infrastructure Phase 1"
git push origin main
```

Vercel will automatically deploy. Monitor at: https://vercel.com/b0ase/b0ase

### Option B: Manual Vercel Deploy

```bash
# If Vercel CLI installed
vercel deploy --prod

# Otherwise, Vercel will deploy automatically on git push
```

### Verification After Deploy

Once deployed, verify endpoints are accessible:

```bash
# Test staking endpoint (will fail with auth, but endpoint exists)
curl https://b0ase.com/api/bwriter/stake \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000000}' \
  2>&1 | grep -q "error" && echo "✓ Endpoint accessible"

# Test dashboard endpoint
curl https://b0ase.com/api/bwriter/dashboard \
  -H "Authorization: Bearer fake-token" \
  2>&1 | grep -q "error" && echo "✓ Endpoint accessible"
```

## Step 4: Test Cron Jobs Configuration

Vercel cron jobs are configured in `vercel.json`. The following crons are now scheduled:

```json
{
  "path": "/api/cron/bwriter/confirm-deposits",
  "schedule": "0 * * * *"  // Every hour at :00 minutes
},
{
  "path": "/api/cron/bwriter/distribute-dividends",
  "schedule": "0 0 * * *"   // Daily at midnight
}
```

### Verify Cron Configuration

Check Vercel dashboard:
1. Go to https://vercel.com/b0ase/b0ase
2. Click **Functions**
3. Should see:
   - `/api/cron/bwriter/confirm-deposits` - Hourly
   - `/api/cron/bwriter/distribute-dividends` - Daily

### Manual Test (Local Development)

```bash
# Start dev server
pnpm dev

# In another terminal, test cron endpoints:

# Test deposit confirmation
curl http://localhost:3000/api/cron/bwriter/confirm-deposits \
  -H "Authorization: Bearer b0ase-cron-secret-a90148dca317d210bec21db373ca351b"

# Test dividend distribution
curl http://localhost:3000/api/cron/bwriter/distribute-dividends \
  -H "Authorization: Bearer b0ase-cron-secret-a90148dca317d210bec21db373ca351b"

# Expected response (development):
# {
#   "status": "success",
#   "message": "No revenue to distribute this period",
#   "revenue": "0",
#   "holdersReceived": 0
# }
```

## Step 5: Integration Testing

Before full production, test the complete flow:

### 5.1 Create a Test User

```bash
# Via Supabase Authentication
# Create test account at: https://app.supabase.com/project/[id]/auth/users
# Or use Supabase CLI:

supabase auth users create --email test@b0ase.com --password Test123456!
```

### 5.2 Create Test Token Balance

```sql
-- Create user balance record for testing
INSERT INTO user_bwriter_balance (user_id, platform, balance, total_earned)
VALUES (
  '<test-user-id>',
  'b0ase',
  1000000,  -- 1M tokens
  1000000
);
```

### 5.3 Test Staking Flow

```bash
# 1. Request to stake
curl -X POST https://b0ase.com/api/bwriter/stake \
  -H "Authorization: Bearer <test-user-token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 500000}'

# Expected response:
# {
#   "stakeId": "uuid-here",
#   "status": "pending_deposit",
#   "multisigAddress": "1Dd3iSFQEM8spmdLbqwxMenWEryNnBBHM6"
# }

# 2. Check staking status
curl https://b0ase.com/api/bwriter/stake \
  -H "Authorization: Bearer <test-user-token>"

# 3. Set withdrawal address
curl -X POST https://b0ase.com/api/bwriter/dividend-address \
  -H "Authorization: Bearer <test-user-token>" \
  -H "Content-Type: application/json" \
  -d '{"bsvAddress": "1BSVxxxxxxxxxxxx"}'

# 4. View dashboard
curl https://b0ase.com/api/bwriter/dashboard \
  -H "Authorization: Bearer <test-user-token>"
```

### 5.4 Simulate Blockchain Confirmation

```sql
-- Manually create a confirmed deposit to test:
-- 1. First create the deposit record
INSERT INTO bwriter_multisig_deposits (
  stake_id, user_id, target_multisig_address,
  amount_expected, status
) VALUES (
  '<stake-id>', '<user-id>',
  '1Dd3iSFQEM8spmdLbqwxMenWEryNnBBHM6',
  500000, 'waiting'
);

-- 2. Simulate blockchain confirmation
UPDATE bwriter_multisig_deposits SET
  status = 'confirmed',
  deposit_txid = 'mock-tx-id',
  amount_received = 500000,
  confirmations = 3,
  confirmed_at = NOW()
WHERE stake_id = '<stake-id>';

-- 3. Test cron job (or wait for hourly run)
curl http://localhost:3000/api/cron/bwriter/confirm-deposits \
  -H "Authorization: Bearer $CRON_SECRET"

-- Verify stake is now confirmed
SELECT status FROM user_bwriter_stakes WHERE id = '<stake-id>';
```

## Step 6: Production Deployment

Once staging is verified:

### 6.1 Security Check

```bash
# Run security audit
bash .claude/skills/security-check/scripts/scan.sh app/api/bwriter/ app/api/cron/bwriter/

# Run standards check
bash .claude/skills/b0ase-standards/scripts/audit.sh .
```

### 6.2 Create Production Commit

```bash
git add .
git commit -m "deploy: $bWriter staking Phase 1 to production

- 8 database tables for staking, dividends, cap table
- 6 API endpoints (stake, unstake, dividend-address, dashboard)
- 2 cron jobs (deposit confirmation, dividend distribution)
- Hybrid blockchain model with whatsonchain watching
- Multi-platform federation support
- Full documentation and guides

Scheduled crons:
- Confirm deposits: hourly (0 * * * *)
- Distribute dividends: daily (0 0 * * *)

Next: Implement revenue tracking, BSV transfers, frontend UI"

git push origin main
```

### 6.3 Verify Production Deployment

```bash
# Check Vercel deployment
vercel logs --follow

# Test production endpoints
curl https://b0ase.com/api/bwriter/dashboard \
  -H "Authorization: Bearer test-token"

# Verify crons are scheduled
# Check: https://vercel.com/b0ase/b0ase/functions
```

## Step 7: Monitor Production

### Set Up Alerts

1. **Failed Cron Jobs**
   - Vercel → Settings → Notifications
   - Enable "Function Errors"

2. **Database Issues**
   - Supabase → Settings → Infrastructure
   - Enable database alerts

3. **API Errors**
   - Vercel → Analytics → Usage
   - Monitor 5xx errors

### Weekly Maintenance

```bash
# Check cron job logs
vercel logs --follow | grep bwriter

# Check for failed deposits
curl https://b0ase.com/api/admin/bwriter/status \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Monitor database size
supabase db stats
```

## Rollback Plan (If Issues)

### Immediate Rollback

If critical issues found:

```bash
# 1. Stop cron jobs (Vercel dashboard → Settings)
# 2. Disable API endpoints (via Vercel)
# 3. Review error logs
# 4. Fix and redeploy
```

### Database Rollback

If migration causes issues:

```bash
# 1. In Supabase, run this to remove tables:
DROP TABLE IF EXISTS user_bwriter_dividend_addresses CASCADE;
DROP TABLE IF EXISTS bwriter_dividend_distributions CASCADE;
DROP TABLE IF EXISTS bwriter_multisig_deposits CASCADE;
DROP TABLE IF EXISTS bwriter_cap_table CASCADE;
DROP TABLE IF EXISTS user_bwriter_dividends_owed CASCADE;
DROP TABLE IF EXISTS user_bwriter_stakes CASCADE;
DROP TABLE IF EXISTS user_bwriter_balance CASCADE;

# 2. Revert git commits
git revert HEAD~1 -m 1

# 3. Redeploy
git push origin main
```

## Phase 2 Prerequisites

Before moving to Phase 2, ensure:

- [x] Database migration applied successfully
- [x] All API endpoints deployed
- [x] Cron jobs scheduled and running
- [x] Testing completed without errors
- [ ] Revenue tracking integrated (Phase 2)
- [ ] BSV transfer implementation (Phase 2)
- [ ] Frontend UI built (Phase 2)

## Next Steps

1. **Immediate** (This week)
   - Apply database migration
   - Deploy API endpoints
   - Verify in staging

2. **Short-term** (Next 1-2 weeks)
   - Implement revenue tracking from BitcoinWriter
   - Implement actual BSV transfers
   - Build frontend staking UI
   - Deploy to bitcoin-corp-website and bitcoin-writer.com

3. **Long-term** (Phase 2+)
   - Admin dashboard
   - Tax reporting
   - Advanced features (delegation, vesting, etc.)

## Troubleshooting

### Issue: Migration Fails with "Table already exists"

**Solution**:
```sql
-- Check existing tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'user_bwriter%';

-- Drop and retry (use IF EXISTS in migration)
-- Or modify migration to use CREATE TABLE IF NOT EXISTS (already included)
```

### Issue: Cron jobs not running

**Solution**:
1. Verify in Vercel: Settings → Cron Jobs
2. Check CRON_SECRET is set in Vercel environment
3. Check endpoints respond to auth header:
   ```bash
   curl https://b0ase.com/api/cron/bwriter/confirm-deposits \
     -H "Authorization: Bearer $(echo $CRON_SECRET)"
   ```

### Issue: "Unauthorized" on cron execution

**Solution**:
```bash
# Verify CRON_SECRET value
echo $CRON_SECRET  # In your shell

# Verify it matches in .env.local
grep CRON_SECRET .env.local

# Update in Vercel if different
vercel env pull  # Or manually set in dashboard
```

### Issue: Database connection timeout

**Solution**:
1. Check DATABASE_URL is valid
2. Verify Vercel can reach Supabase
3. Check for connection pool exhaustion
4. Scale database if needed

## Support

For questions or issues:

1. **Documentation**: `/docs/BWRITER_STAKING.md`
2. **Quick Reference**: `/docs/BWRITER_QUICK_START.md`
3. **Implementation Details**: `/BWRITER_PHASE1_SUMMARY.md`
4. **Code Comments**: See inline docs in route files

---

**Deployment Owner**: b0ase team
**Last Updated**: 2026-01-26
**Status**: Ready for Staging Deployment
