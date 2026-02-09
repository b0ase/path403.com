-- $bWriter Token Staking & Dividend System
--
-- Token Lifecycle:
-- 1. Earned/Purchased → stored in user_bwriter_balance (no KYC needed)
-- 2. Staked → locked in multisig (requires KYC), generates dividends
-- 3. Unstaked → withdrawn from system, loses future dividends
-- 4. Dividends owed → tracked separately, unclaimed until staked + KYC
--
-- Key Principle: Dividends only accumulate on staked tokens with KYC.
-- If token is withdrawn, it's gone - dividends stay orphaned in system.

-- User Token Balances (across all platforms)
CREATE TABLE IF NOT EXISTS user_bwriter_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'b0ase', 'bitcoin-writer', 'bitcoin-corp'

  balance BIGINT DEFAULT 0, -- Tokens in account (not staked)
  total_earned BIGINT DEFAULT 0, -- Cumulative tokens earned
  total_purchased BIGINT DEFAULT 0, -- Tokens bought
  total_withdrawn BIGINT DEFAULT 0, -- Tokens removed from system
  total_staked_ever BIGINT DEFAULT 0, -- Total tokens ever staked (cumulative)

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Staked Tokens (locked in multisig, dividend-bearing)
CREATE TABLE IF NOT EXISTS user_bwriter_stakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_staked_on TEXT NOT NULL, -- Platform where stake was initiated
  kyc_id UUID NOT NULL REFERENCES user_kyc(id), -- Must be verified

  amount BIGINT NOT NULL, -- Tokens locked
  status TEXT NOT NULL DEFAULT 'pending_deposit', -- 'pending_deposit', 'confirmed', 'unstaking', 'unstaked'

  -- Deposit tracking
  deposit_deadline TIMESTAMP WITH TIME ZONE,
  blockchain_confirmations INT DEFAULT 0, -- Watching multisig for deposit

  -- Staking timeline
  staked_at TIMESTAMP WITH TIME ZONE,
  unstaked_at TIMESTAMP WITH TIME ZONE,

  -- Dividend tracking
  dividends_accumulated BIGINT DEFAULT 0, -- Satoshis owed from staking period
  dividends_claimed BIGINT DEFAULT 0, -- Satoshis already paid out
  last_dividend_block INT, -- Last block where dividends were distributed

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN ('pending_deposit', 'confirmed', 'unstaking', 'unstaked'))
);

-- Dividends Owed (unclaimed, accumulates even after unstake)
CREATE TABLE IF NOT EXISTS user_bwriter_dividends_owed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  dividends_pending BIGINT DEFAULT 0, -- Satoshis waiting to be claimed
  dividends_claimed BIGINT DEFAULT 0, -- Satoshis already paid out
  last_claim_at TIMESTAMP WITH TIME ZONE,

  -- Claim requirements
  requires_kyc BOOLEAN DEFAULT true,
  requires_staked_balance BOOLEAN DEFAULT false, -- If true, user must have staked tokens to claim

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Master Cap Table (shared across all platforms)
CREATE TABLE IF NOT EXISTS bwriter_cap_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Stake reference
  stake_id UUID NOT NULL UNIQUE REFERENCES user_bwriter_stakes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Current holdings
  tokens_staked BIGINT NOT NULL,
  percentage_of_total DECIMAL(10, 6), -- Recalculated on each dividend distribution

  -- Dividend calculations
  last_dividend_amount BIGINT, -- Satoshis in last distribution
  lifetime_dividends_received BIGINT DEFAULT 0,

  status TEXT DEFAULT 'active', -- 'active', 'unstaked_pending', 'removed'

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dividend Distribution History (audit trail)
CREATE TABLE IF NOT EXISTS bwriter_dividend_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  distribution_round INT NOT NULL,
  block_height INT NOT NULL, -- BSV block where dividends were distributed

  -- Economics
  total_revenue_bsv BIGINT NOT NULL,
  dividend_pool_bsv BIGINT NOT NULL, -- 75% of revenue
  total_tokens_staked BIGINT NOT NULL,
  tokens_per_satoshi DECIMAL(20, 10), -- How many tokens per satoshi distributed

  distribution_completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Multisig Deposits (watching blockchain for incoming tokens)
CREATE TABLE IF NOT EXISTS bwriter_multisig_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  stake_id UUID NOT NULL UNIQUE REFERENCES user_bwriter_stakes(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),

  -- Blockchain tracking
  deposit_txid TEXT, -- Transaction ID when tokens arrive
  deposit_address TEXT NOT NULL, -- User's deposit address (if using per-user addresses)
  target_multisig_address TEXT NOT NULL, -- 1Dd3iSFQEM8spmdLbqwxMenWEryNnBBHM6

  amount_expected BIGINT NOT NULL,
  amount_received BIGINT DEFAULT 0,
  confirmations INT DEFAULT 0,
  confirmed_at TIMESTAMP WITH TIME ZONE,

  -- Status
  status TEXT DEFAULT 'waiting', -- 'waiting', 'received', 'confirmed', 'failed'

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dividend Addresses (where to send BSV payouts)
CREATE TABLE IF NOT EXISTS user_bwriter_dividend_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- BSV withdrawal address where dividends are paid
  bsv_withdrawal_address TEXT NOT NULL, -- Format: 1xxxxx or 3xxxxx (legacy BSV addresses)

  -- Validation
  address_verified BOOLEAN DEFAULT false, -- Can require signature verification if paranoid
  last_dividend_paid_to_address TIMESTAMP WITH TIME ZONE, -- Last time dividends were sent here

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_bwriter_balance_user_id ON user_bwriter_balance(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bwriter_balance_platform ON user_bwriter_balance(platform);

CREATE INDEX IF NOT EXISTS idx_user_bwriter_stakes_user_id ON user_bwriter_stakes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bwriter_stakes_status ON user_bwriter_stakes(status);
CREATE INDEX IF NOT EXISTS idx_user_bwriter_stakes_staked_at ON user_bwriter_stakes(staked_at);

CREATE INDEX IF NOT EXISTS idx_cap_table_user_id ON bwriter_cap_table(user_id);
CREATE INDEX IF NOT EXISTS idx_cap_table_status ON bwriter_cap_table(status);

CREATE INDEX IF NOT EXISTS idx_bwriter_dividends_owed_user_id ON user_bwriter_dividends_owed(user_id);

CREATE INDEX IF NOT EXISTS idx_multisig_deposits_status ON bwriter_multisig_deposits(status);
CREATE INDEX IF NOT EXISTS idx_multisig_deposits_confirmed_at ON bwriter_multisig_deposits(confirmed_at);

CREATE INDEX IF NOT EXISTS idx_dividend_addresses_user_id ON user_bwriter_dividend_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_dividend_addresses_verified ON user_bwriter_dividend_addresses(address_verified);

-- Comments
COMMENT ON TABLE user_bwriter_balance IS 'Token balances in user accounts (not staked). Earned via platform use or purchased.';
COMMENT ON TABLE user_bwriter_stakes IS 'Tokens locked in multisig, generating dividends. Requires KYC verification.';
COMMENT ON TABLE user_bwriter_dividends_owed IS 'Accumulated dividends, claimed only after KYC + active stake.';
COMMENT ON TABLE bwriter_cap_table IS 'Master register of staked tokens. Source of truth for dividend distribution.';
COMMENT ON TABLE user_bwriter_dividend_addresses IS 'BSV withdrawal addresses where dividend payouts are sent. Required for dividend-eligible users.';
COMMENT ON COLUMN user_bwriter_dividends_owed.requires_staked_balance IS 'If true, user must have active staked tokens to claim dividends (prevents claiming after unstaking).';
