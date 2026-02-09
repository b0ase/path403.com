-- $402 Token Exchange Migration
-- Price discovery and transaction exchange for content/API access tokens
-- Uses sqrt_decay pricing model: price = base / sqrt(supply + 1)

-- Token registry (content/service tokens)
CREATE TABLE IF NOT EXISTS path402_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id TEXT UNIQUE NOT NULL,  -- e.g., 'BOASE_BLOG', 'KINTSUGI_API'
  name TEXT NOT NULL,
  description TEXT,
  issuer_handle TEXT NOT NULL,  -- HandCash handle of token issuer
  base_price_sats BIGINT NOT NULL DEFAULT 500,  -- Base price before decay
  pricing_model TEXT NOT NULL DEFAULT 'sqrt_decay',  -- 'sqrt_decay' | 'fixed' | 'linear'
  decay_factor DECIMAL(10,4) DEFAULT 1.0,  -- Multiplier for decay curve
  total_supply BIGINT DEFAULT 0,  -- Current circulating supply
  max_supply BIGINT,  -- NULL = unlimited
  issuer_share_bps INT DEFAULT 7000,  -- 70% to issuer (basis points)
  platform_share_bps INT DEFAULT 3000,  -- 30% to platform
  content_type TEXT,  -- 'blog' | 'api' | 'membership' | 'media' | 'custom'
  access_url TEXT,  -- URL pattern for content access
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Token holdings (who owns what)
CREATE TABLE IF NOT EXISTS path402_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id TEXT NOT NULL REFERENCES path402_tokens(token_id) ON DELETE CASCADE,
  holder_handle TEXT NOT NULL,  -- HandCash handle
  holder_user_id TEXT,  -- Optional user ID link
  balance BIGINT NOT NULL DEFAULT 0,  -- Current token balance
  total_acquired BIGINT DEFAULT 0,  -- Lifetime total acquired
  total_spent_sats BIGINT DEFAULT 0,  -- Lifetime sats spent
  first_acquired_at TIMESTAMPTZ DEFAULT NOW(),
  last_acquired_at TIMESTAMPTZ,
  UNIQUE(token_id, holder_handle)
);

-- Transaction history
CREATE TABLE IF NOT EXISTS path402_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id TEXT NOT NULL REFERENCES path402_tokens(token_id) ON DELETE CASCADE,
  buyer_handle TEXT NOT NULL,
  seller_handle TEXT,  -- NULL for primary issuance
  amount BIGINT NOT NULL,  -- Number of tokens
  price_sats BIGINT NOT NULL,  -- Total price paid
  unit_price_sats BIGINT NOT NULL,  -- Price per token at time of purchase
  issuer_revenue_sats BIGINT,  -- Revenue to issuer
  platform_revenue_sats BIGINT,  -- Revenue to platform
  tx_type TEXT NOT NULL CHECK (tx_type IN ('acquire', 'transfer', 'refund', 'grant')),
  handcash_tx_id TEXT,  -- Payment transaction ID
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Serve events (token usage tracking)
CREATE TABLE IF NOT EXISTS path402_serves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id TEXT NOT NULL REFERENCES path402_tokens(token_id) ON DELETE CASCADE,
  holder_handle TEXT NOT NULL,
  resource_path TEXT NOT NULL,  -- What was accessed
  tokens_consumed BIGINT DEFAULT 1,  -- Tokens used (usually 0 for unlimited access tokens)
  ip_address TEXT,
  user_agent TEXT,
  served_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_d402_tokens_active ON path402_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_d402_tokens_issuer ON path402_tokens(issuer_handle);
CREATE INDEX IF NOT EXISTS idx_d402_holdings_holder ON path402_holdings(holder_handle);
CREATE INDEX IF NOT EXISTS idx_d402_holdings_token ON path402_holdings(token_id);
CREATE INDEX IF NOT EXISTS idx_d402_holdings_balance ON path402_holdings(balance) WHERE balance > 0;
CREATE INDEX IF NOT EXISTS idx_d402_transactions_token ON path402_transactions(token_id);
CREATE INDEX IF NOT EXISTS idx_d402_transactions_buyer ON path402_transactions(buyer_handle);
CREATE INDEX IF NOT EXISTS idx_d402_transactions_created ON path402_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_d402_serves_holder ON path402_serves(holder_handle, token_id);
CREATE INDEX IF NOT EXISTS idx_d402_serves_token ON path402_serves(token_id);

-- Initial tokens for b0ase.com content
INSERT INTO path402_tokens (token_id, name, description, issuer_handle, base_price_sats, content_type, access_url)
VALUES
  ('BOASE_BLOG', 'b0ase Blog Access', 'Full access to all b0ase.com blog content', 'richardboase', 500, 'blog', '/blog/*'),
  ('KINTSUGI_API', 'Kintsugi API Credits', 'API credits for Kintsugi AI services', 'richardboase', 1000, 'api', '/api/kintsugi/*'),
  ('BOASE_STUDIO', 'b0ase Studio Membership', 'Full studio membership with all benefits', 'richardboase', 2500, 'membership', '/dashboard/*')
ON CONFLICT (token_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Comments
COMMENT ON TABLE path402_tokens IS '$402 Exchange: Token registry for content/API access';
COMMENT ON TABLE path402_holdings IS '$402 Exchange: Who owns what tokens';
COMMENT ON TABLE path402_transactions IS '$402 Exchange: All token acquisition history';
COMMENT ON TABLE path402_serves IS '$402 Exchange: Token usage/serve tracking';
COMMENT ON COLUMN path402_tokens.pricing_model IS 'sqrt_decay: price = base / sqrt(supply + 1)';
COMMENT ON COLUMN path402_tokens.issuer_share_bps IS 'Basis points (7000 = 70%) of revenue to issuer';
