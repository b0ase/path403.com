-- Add usage pricing + access policy fields for $402 content tokens

ALTER TABLE tokens
  ADD COLUMN IF NOT EXISTS access_mode TEXT DEFAULT 'token',
  ADD COLUMN IF NOT EXISTS parent_address TEXT,
  ADD COLUMN IF NOT EXISTS parent_share_bps INT DEFAULT 5000,
  ADD COLUMN IF NOT EXISTS inscription_id TEXT,
  ADD COLUMN IF NOT EXISTS usage_pricing JSONB,
  ADD COLUMN IF NOT EXISTS dividend_policy JSONB;

CREATE INDEX IF NOT EXISTS idx_tokens_parent ON tokens(parent_address);
CREATE INDEX IF NOT EXISTS idx_tokens_access_mode ON tokens(access_mode);

-- Track active usage sessions (metered access)
CREATE TABLE IF NOT EXISTS token_usage_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_address TEXT NOT NULL REFERENCES tokens(address) ON DELETE CASCADE,
  viewer_handle TEXT,
  viewer_address TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  last_payment_tx_id TEXT,
  total_paid_sats BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(token_address, viewer_handle)
);

CREATE INDEX IF NOT EXISTS idx_usage_sessions_token ON token_usage_sessions(token_address);
CREATE INDEX IF NOT EXISTS idx_usage_sessions_viewer ON token_usage_sessions(viewer_handle);
CREATE INDEX IF NOT EXISTS idx_usage_sessions_expires ON token_usage_sessions(expires_at);

-- Log each usage payment for audit/dividend accounting
CREATE TABLE IF NOT EXISTS token_usage_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_address TEXT NOT NULL REFERENCES tokens(address) ON DELETE CASCADE,
  viewer_handle TEXT,
  viewer_address TEXT,
  payment_tx_id TEXT NOT NULL,
  paid_sats BIGINT NOT NULL,
  unit_ms BIGINT NOT NULL,
  price_sats_per_unit BIGINT NOT NULL,
  grant_ms BIGINT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(token_address, payment_tx_id)
);

CREATE INDEX IF NOT EXISTS idx_usage_payments_token ON token_usage_payments(token_address);
CREATE INDEX IF NOT EXISTS idx_usage_payments_viewer ON token_usage_payments(viewer_handle);
