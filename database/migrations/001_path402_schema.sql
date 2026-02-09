-- PATH402.com Token System Schema
-- Run on Hetzner Supabase: ssh hetzner "docker exec supabase-db psql -U postgres -d postgres" < database/migrations/001_path402_schema.sql

-- Token Holders
CREATE TABLE IF NOT EXISTS path402_holders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT,
  ordinals_address TEXT,
  handle TEXT,
  provider TEXT NOT NULL CHECK (provider IN ('yours', 'handcash')),
  balance BIGINT NOT NULL DEFAULT 0,
  staked_balance BIGINT NOT NULL DEFAULT 0,
  total_purchased BIGINT NOT NULL DEFAULT 0,
  total_withdrawn BIGINT NOT NULL DEFAULT 0,
  total_dividends BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique index for provider + address/handle combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_holders_unique_yours ON path402_holders(provider, address) WHERE provider = 'yours' AND address IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_holders_unique_handcash ON path402_holders(provider, handle) WHERE provider = 'handcash' AND handle IS NOT NULL;

-- Token Purchases
CREATE TABLE IF NOT EXISTS path402_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holder_id UUID NOT NULL REFERENCES path402_holders(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  price_sats BIGINT NOT NULL,
  total_paid_sats BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  tx_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- Stakes
CREATE TABLE IF NOT EXISTS path402_stakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holder_id UUID NOT NULL REFERENCES path402_holders(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unstaked')),
  staked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unstaked_at TIMESTAMPTZ
);

-- Dividends (distributions)
CREATE TABLE IF NOT EXISTS path402_dividends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_amount BIGINT NOT NULL,
  per_token_amount DECIMAL(20, 10) NOT NULL,
  total_staked BIGINT NOT NULL,
  source_tx_id TEXT,
  distributed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dividend Claims
CREATE TABLE IF NOT EXISTS path402_dividend_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dividend_id UUID NOT NULL REFERENCES path402_dividends(id) ON DELETE CASCADE,
  holder_id UUID NOT NULL REFERENCES path402_holders(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  staked_at_time BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'claimed')),
  claimed_at TIMESTAMPTZ,
  UNIQUE(dividend_id, holder_id)
);

-- Treasury tracking
CREATE TABLE IF NOT EXISTS path402_treasury (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL,
  balance BIGINT NOT NULL DEFAULT 1000000000, -- 1 billion initial supply
  total_sold BIGINT NOT NULL DEFAULT 0,
  total_revenue_sats BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert initial treasury record
INSERT INTO path402_treasury (address, balance)
VALUES ('1BrbnQon4uZPSxNwt19ozwtgHPDbgvaeD1', 1000000000)
ON CONFLICT DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_holders_provider_address ON path402_holders(provider, address);
CREATE INDEX IF NOT EXISTS idx_holders_provider_handle ON path402_holders(provider, handle);
CREATE INDEX IF NOT EXISTS idx_purchases_holder ON path402_purchases(holder_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON path402_purchases(status);
CREATE INDEX IF NOT EXISTS idx_stakes_holder ON path402_stakes(holder_id);
CREATE INDEX IF NOT EXISTS idx_stakes_status ON path402_stakes(status);
CREATE INDEX IF NOT EXISTS idx_claims_holder ON path402_dividend_claims(holder_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON path402_dividend_claims(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for holders updated_at
DROP TRIGGER IF EXISTS update_path402_holders_updated_at ON path402_holders;
CREATE TRIGGER update_path402_holders_updated_at
  BEFORE UPDATE ON path402_holders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for treasury updated_at
DROP TRIGGER IF EXISTS update_path402_treasury_updated_at ON path402_treasury;
CREATE TRIGGER update_path402_treasury_updated_at
  BEFORE UPDATE ON path402_treasury
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your Supabase setup)
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
