-- PATH402.com Identity Token Schema
-- Run on Hetzner Supabase: ssh hetzner "docker exec supabase-db psql -U postgres -d postgres" < database/migrations/002_identity_tokens.sql

-- Identity Tokens (BSV21 Digital DNA)
CREATE TABLE IF NOT EXISTS path402_identity_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holder_id UUID NOT NULL REFERENCES path402_holders(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL UNIQUE,
  token_id TEXT NOT NULL UNIQUE,
  issuer_address TEXT,
  total_supply TEXT NOT NULL DEFAULT '100000000000000000',
  decimals INTEGER NOT NULL DEFAULT 8,
  access_rate INTEGER NOT NULL DEFAULT 1,
  inscription_data JSONB,
  broadcast_txid TEXT,
  broadcast_status TEXT NOT NULL DEFAULT 'local',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_identity_holder ON path402_identity_tokens(holder_id);
CREATE INDEX IF NOT EXISTS idx_identity_symbol ON path402_identity_tokens(symbol);
