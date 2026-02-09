-- Migration: 006_withdrawals.sql
-- Purpose: Create withdrawals table to track token withdrawals
-- Date: 2026-02-03

CREATE TABLE IF NOT EXISTS path402_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holder_id UUID REFERENCES path402_holders(id),
  amount BIGINT NOT NULL,
  destination TEXT NOT NULL,
  from_address TEXT NOT NULL,
  tx_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'confirmed'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_withdrawals_holder ON path402_withdrawals(holder_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_tx ON path402_withdrawals(tx_id);

COMMENT ON TABLE path402_withdrawals IS 'Records of token withdrawals to external addresses';
