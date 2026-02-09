-- $402 Token Marketplace
-- Multi-tenant token registry for any $address
-- Run via: ssh hetzner "docker exec supabase-db psql -U postgres -d postgres" < database/migrations/20260202_tokens_marketplace.sql

-- Token registry (content/service tokens from any domain)
CREATE TABLE IF NOT EXISTS tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- $address identifier (e.g., "$b0ase.com/$blog", "$example.com/$api")
  address TEXT UNIQUE NOT NULL,

  -- Metadata
  name TEXT NOT NULL,
  description TEXT,
  content_type TEXT, -- "blog", "api", "premium", "membership", etc.
  icon_url TEXT,
  access_url TEXT, -- URL to the gated content

  -- Issuer info
  issuer_handle TEXT NOT NULL,
  issuer_address TEXT, -- BSV address for payouts

  -- Pricing configuration
  pricing_model TEXT NOT NULL DEFAULT 'sqrt_decay',
  base_price_sats BIGINT NOT NULL DEFAULT 500,
  decay_factor DECIMAL(10,4) DEFAULT 1.0,

  -- Supply tracking
  total_supply BIGINT DEFAULT 0,
  max_supply BIGINT, -- NULL = unlimited
  treasury_balance BIGINT DEFAULT 0, -- Remaining tokens to sell

  -- Revenue split (basis points, 10000 = 100%)
  issuer_share_bps INT DEFAULT 8000, -- 80% to creator
  facilitator_share_bps INT DEFAULT 2000, -- 20% to PATH402

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false, -- Domain ownership verified

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Token holdings (who owns what)
CREATE TABLE IF NOT EXISTS token_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  token_address TEXT NOT NULL REFERENCES tokens(address) ON DELETE CASCADE,
  holder_handle TEXT, -- HandCash handle if available
  holder_address TEXT, -- BSV address

  -- Balances
  balance BIGINT NOT NULL DEFAULT 0,
  staked_balance BIGINT DEFAULT 0,

  -- Acquisition stats
  total_acquired BIGINT DEFAULT 0,
  total_spent_sats BIGINT DEFAULT 0,
  avg_cost_sats BIGINT DEFAULT 0,

  -- Timestamps
  first_acquired_at TIMESTAMPTZ DEFAULT NOW(),
  last_acquired_at TIMESTAMPTZ,

  -- Unique per token per holder (handle takes precedence)
  UNIQUE(token_address, holder_handle)
);

-- Transactions (all token movements)
CREATE TABLE IF NOT EXISTS token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  token_address TEXT NOT NULL REFERENCES tokens(address) ON DELETE CASCADE,

  -- Parties
  from_handle TEXT, -- NULL for primary issuance (from treasury)
  from_address TEXT,
  to_handle TEXT NOT NULL,
  to_address TEXT,

  -- Transaction details
  tx_type TEXT NOT NULL, -- "acquire", "transfer", "serve", "stake", "unstake"
  amount BIGINT NOT NULL,
  price_sats BIGINT, -- Total price paid (NULL for transfers)
  unit_price_sats BIGINT, -- Price per token at time of tx

  -- Revenue distribution (for acquisitions)
  issuer_revenue_sats BIGINT,
  facilitator_revenue_sats BIGINT,

  -- Blockchain references
  payment_tx_id TEXT, -- HandCash or BSV tx ID
  inscription_id TEXT, -- BSV inscription ID if inscribed

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Serve events (content access)
CREATE TABLE IF NOT EXISTS token_serves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  token_address TEXT NOT NULL REFERENCES tokens(address) ON DELETE CASCADE,

  -- Who served to whom
  server_handle TEXT NOT NULL,
  requester_handle TEXT,
  requester_address TEXT,

  -- What was served
  resource_path TEXT NOT NULL,
  tokens_consumed BIGINT DEFAULT 1,
  revenue_earned_sats BIGINT DEFAULT 0,

  -- Timestamps
  served_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tokens_active ON tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_tokens_issuer ON tokens(issuer_handle);
CREATE INDEX IF NOT EXISTS idx_tokens_address ON tokens(address);

CREATE INDEX IF NOT EXISTS idx_holdings_token ON token_holdings(token_address);
CREATE INDEX IF NOT EXISTS idx_holdings_holder ON token_holdings(holder_handle);
CREATE INDEX IF NOT EXISTS idx_holdings_address ON token_holdings(holder_address);

CREATE INDEX IF NOT EXISTS idx_transactions_token ON token_transactions(token_address);
CREATE INDEX IF NOT EXISTS idx_transactions_to ON token_transactions(to_handle);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON token_transactions(tx_type);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON token_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_serves_token ON token_serves(token_address);
CREATE INDEX IF NOT EXISTS idx_serves_server ON token_serves(server_handle);
CREATE INDEX IF NOT EXISTS idx_serves_served ON token_serves(served_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for tokens table
DROP TRIGGER IF EXISTS update_tokens_updated_at ON tokens;
CREATE TRIGGER update_tokens_updated_at
  BEFORE UPDATE ON tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sample seed data (optional - comment out if not needed)
-- INSERT INTO tokens (address, name, description, issuer_handle, base_price_sats, content_type)
-- VALUES
--   ('$b0ase.com/$blog', 'b0ase Blog Access', 'Access to b0ase.com blog content', 'boase', 500, 'blog'),
--   ('$b0ase.com/$api', 'b0ase API Credits', 'API access credits for b0ase services', 'boase', 1000, 'api'),
--   ('$b0ase.com/$premium', 'b0ase Premium', 'Premium content and features', 'boase', 2500, 'premium')
-- ON CONFLICT (address) DO NOTHING;
