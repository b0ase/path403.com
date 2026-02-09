-- Migration: 004_stakes_cap_table.sql
-- Purpose: Create stakes and cap_table for staking with KYC
-- Date: 2026-02-03

-- Stakes table - records of staking declarations
CREATE TABLE IF NOT EXISTS stakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES user_wallets(id),
  holder_id UUID REFERENCES path402_holders(id),
  amount BIGINT NOT NULL,
  staked_at TIMESTAMPTZ DEFAULT NOW(),
  unstaked_at TIMESTAMPTZ,
  stake_signature TEXT NOT NULL,            -- Signature proving user authorized stake
  status TEXT DEFAULT 'active',             -- active, unstaked, suspended

  -- KYC fields (collected on stake)
  kyc_name TEXT,
  kyc_email TEXT,
  kyc_jurisdiction TEXT,
  kyc_completed_at TIMESTAMPTZ,

  CONSTRAINT valid_stake_status CHECK (status IN ('active', 'unstaked', 'suspended'))
);

-- Cap table - public registry of staked token holders
CREATE TABLE IF NOT EXISTS cap_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES user_wallets(id),
  stake_id UUID REFERENCES stakes(id),
  handle TEXT NOT NULL,
  tokens_staked BIGINT NOT NULL,
  kyc_name TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  removed_at TIMESTAMPTZ,
  removal_reason TEXT,                      -- 'unstaked', 'transferred', 'sold'

  -- Cap table entries are public
  is_public BOOLEAN DEFAULT true
);

-- Dividend distributions
CREATE TABLE IF NOT EXISTS dividend_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_pool_sats BIGINT NOT NULL,          -- Total sats to distribute
  total_staked_tokens BIGINT NOT NULL,      -- Total staked at time of distribution
  per_token_sats DECIMAL(20, 10) NOT NULL,  -- Sats per staked token
  distributed_at TIMESTAMPTZ DEFAULT NOW(),
  distributed_by TEXT,                       -- Admin who triggered
  status TEXT DEFAULT 'pending'              -- pending, distributed, cancelled
);

-- Dividend claims - individual entitlements
CREATE TABLE IF NOT EXISTS dividend_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id UUID REFERENCES dividend_distributions(id),
  holder_id UUID REFERENCES path402_holders(id),
  stake_id UUID REFERENCES stakes(id),
  staked_amount BIGINT NOT NULL,            -- Staked at time of distribution
  claim_amount_sats BIGINT NOT NULL,        -- Sats owed
  claimed_at TIMESTAMPTZ,
  claim_tx_id TEXT,                          -- BSV txid when claimed
  status TEXT DEFAULT 'pending'              -- pending, claimed, expired
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stakes_wallet ON stakes(wallet_id);
CREATE INDEX IF NOT EXISTS idx_stakes_holder ON stakes(holder_id);
CREATE INDEX IF NOT EXISTS idx_stakes_status ON stakes(status);
CREATE INDEX IF NOT EXISTS idx_cap_table_handle ON cap_table(handle);
CREATE INDEX IF NOT EXISTS idx_cap_table_active ON cap_table(removed_at) WHERE removed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dividend_claims_holder ON dividend_claims(holder_id);
CREATE INDEX IF NOT EXISTS idx_dividend_claims_status ON dividend_claims(status);

-- View for active cap table entries
CREATE OR REPLACE VIEW active_cap_table AS
SELECT
  ct.id,
  ct.handle,
  ct.tokens_staked,
  ct.kyc_name,
  ct.added_at,
  s.status as stake_status,
  uw.address
FROM cap_table ct
JOIN stakes s ON ct.stake_id = s.id
JOIN user_wallets uw ON ct.wallet_id = uw.id
WHERE ct.removed_at IS NULL
  AND s.status = 'active'
ORDER BY ct.tokens_staked DESC;

COMMENT ON TABLE stakes IS 'Staking declarations with KYC - tokens remain in user wallet';
COMMENT ON TABLE cap_table IS 'Public registry of staked token holders';
COMMENT ON TABLE dividend_distributions IS 'Dividend pool distributions to stakers';
COMMENT ON TABLE dividend_claims IS 'Individual dividend entitlements per holder';
