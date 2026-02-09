-- The code references path402_* tables but the DB has dollar402_* tables.
-- Create the path402_* tables as the canonical names, copy data from dollar402,
-- and create views for backward compat.
--
-- Strategy: Create new path402_* tables with the columns needed (including
-- new on-chain tracking columns), migrate data, then the dollar402 tables
-- can be deprecated.

-- path402_tokens
CREATE TABLE IF NOT EXISTS path402_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  issuer_handle TEXT NOT NULL,
  base_price_sats BIGINT DEFAULT 500,
  pricing_model TEXT DEFAULT 'sqrt_decay',
  decay_factor NUMERIC DEFAULT 1.0,
  total_supply BIGINT DEFAULT 0,
  max_supply BIGINT,
  issuer_share_bps INT DEFAULT 7000,
  platform_share_bps INT DEFAULT 3000,
  content_type TEXT,
  access_url TEXT,
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  -- New columns for on-chain tracking
  deploy_txid TEXT,
  bsv21_token_id TEXT,
  current_utxo TEXT,
  on_chain_balance BIGINT DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_path402_tokens_active ON path402_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_path402_tokens_issuer ON path402_tokens(issuer_handle);
CREATE INDEX IF NOT EXISTS idx_path402_tokens_bsv21 ON path402_tokens(bsv21_token_id);

-- path402_holdings
CREATE TABLE IF NOT EXISTS path402_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id TEXT NOT NULL REFERENCES path402_tokens(token_id),
  holder_handle TEXT NOT NULL,
  holder_user_id TEXT,
  balance BIGINT DEFAULT 0,
  total_acquired BIGINT DEFAULT 0,
  total_spent_sats BIGINT DEFAULT 0,
  first_acquired_at TIMESTAMPTZ DEFAULT now(),
  last_acquired_at TIMESTAMPTZ,
  -- New columns for dividends
  pending_dividends_sats BIGINT DEFAULT 0,
  total_dividends_paid_sats BIGINT DEFAULT 0,
  UNIQUE(token_id, holder_handle)
);
CREATE INDEX IF NOT EXISTS idx_path402_holdings_holder ON path402_holdings(holder_handle);
CREATE INDEX IF NOT EXISTS idx_path402_holdings_token ON path402_holdings(token_id);
CREATE INDEX IF NOT EXISTS idx_path402_holdings_dividends ON path402_holdings(pending_dividends_sats) WHERE pending_dividends_sats > 0;

-- path402_transactions
CREATE TABLE IF NOT EXISTS path402_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id TEXT NOT NULL,
  buyer_handle TEXT NOT NULL,
  seller_handle TEXT,
  amount BIGINT NOT NULL,
  price_sats BIGINT DEFAULT 0,
  unit_price_sats BIGINT DEFAULT 0,
  issuer_revenue_sats BIGINT DEFAULT 0,
  platform_revenue_sats BIGINT DEFAULT 0,
  tx_type TEXT DEFAULT 'acquire',
  handcash_tx_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_path402_tx_token ON path402_transactions(token_id);
CREATE INDEX IF NOT EXISTS idx_path402_tx_buyer ON path402_transactions(buyer_handle);
CREATE INDEX IF NOT EXISTS idx_path402_tx_type ON path402_transactions(tx_type);

-- path402_serves
CREATE TABLE IF NOT EXISTS path402_serves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id TEXT NOT NULL,
  holder_handle TEXT NOT NULL,
  resource_path TEXT NOT NULL,
  tokens_consumed INT DEFAULT 0,
  ip_address TEXT,
  user_agent TEXT,
  served_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_path402_serves_token ON path402_serves(token_id);

-- path402_blog_mints (if not already created)
CREATE TABLE IF NOT EXISTS path402_blog_mints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id TEXT REFERENCES path402_tokens(token_id),
  blog_slug TEXT NOT NULL UNIQUE,
  inscription_txid TEXT NOT NULL,
  inscription_vout INT DEFAULT 0,
  content_hash TEXT NOT NULL,
  markdown_path TEXT NOT NULL,
  minted_at TIMESTAMPTZ DEFAULT now(),
  minted_by TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_blog_mints_slug ON path402_blog_mints(blog_slug);

-- Migrate data from dollar402_* into path402_* (only if dollar402 tables have data)
INSERT INTO path402_tokens (id, token_id, name, description, issuer_handle, base_price_sats, pricing_model, decay_factor, total_supply, max_supply, issuer_share_bps, platform_share_bps, content_type, access_url, icon_url, created_at, updated_at, is_active)
SELECT id, token_id, name, description, issuer_handle, base_price_sats, pricing_model, decay_factor, total_supply, max_supply, issuer_share_bps, platform_share_bps, content_type, access_url, icon_url, created_at, updated_at, is_active
FROM dollar402_tokens
ON CONFLICT (token_id) DO NOTHING;

INSERT INTO path402_holdings (id, token_id, holder_handle, holder_user_id, balance, total_acquired, total_spent_sats, first_acquired_at, last_acquired_at)
SELECT id, token_id, holder_handle, holder_user_id, balance, total_acquired, total_spent_sats, first_acquired_at, last_acquired_at
FROM dollar402_holdings
ON CONFLICT (token_id, holder_handle) DO NOTHING;

INSERT INTO path402_transactions (id, token_id, buyer_handle, seller_handle, amount, price_sats, unit_price_sats, issuer_revenue_sats, platform_revenue_sats, tx_type, handcash_tx_id, metadata, created_at)
SELECT id, token_id, buyer_handle, seller_handle, amount, price_sats, unit_price_sats, issuer_revenue_sats, platform_revenue_sats, tx_type, handcash_tx_id, metadata, created_at
FROM dollar402_transactions
ON CONFLICT DO NOTHING;

INSERT INTO path402_serves (id, token_id, holder_handle, resource_path, tokens_consumed, ip_address, user_agent, served_at)
SELECT id, token_id, holder_handle, resource_path, tokens_consumed, ip_address, user_agent, served_at
FROM dollar402_serves
ON CONFLICT DO NOTHING;
