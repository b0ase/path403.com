-- x402 Facilitator Persistence (nonces, inscriptions, verification logs)
-- Run via: ssh hetzner "docker exec supabase-db psql -U postgres -d postgres" < database/migrations/20260203_x402_facilitator.sql

-- Nonce tracking (replay protection)
CREATE TABLE IF NOT EXISTS x402_nonces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network TEXT NOT NULL,
  nonce TEXT NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(network, nonce)
);

CREATE INDEX IF NOT EXISTS idx_x402_nonces_network ON x402_nonces(network);
CREATE INDEX IF NOT EXISTS idx_x402_nonces_expires ON x402_nonces(expires_at);

-- Inscription records (proof persistence)
CREATE TABLE IF NOT EXISTS x402_inscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inscription_id TEXT NOT NULL UNIQUE,
  tx_id TEXT NOT NULL UNIQUE,
  origin_network TEXT NOT NULL,
  origin_tx_id TEXT NOT NULL,
  payment_from TEXT,
  payment_to TEXT,
  payment_amount TEXT,
  payment_asset TEXT,
  signature TEXT,
  settlement_network TEXT,
  settlement_tx_id TEXT,
  content_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_x402_inscriptions_origin ON x402_inscriptions(origin_network, origin_tx_id);
CREATE INDEX IF NOT EXISTS idx_x402_inscriptions_created ON x402_inscriptions(created_at DESC);

-- Verification audit log
CREATE TABLE IF NOT EXISTS x402_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network TEXT NOT NULL,
  tx_id TEXT,
  amount_sats BIGINT,
  sender TEXT,
  recipient TEXT,
  valid BOOLEAN NOT NULL,
  invalid_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_x402_verifications_created ON x402_verifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_x402_verifications_network ON x402_verifications(network);
