-- Migration: 003_user_wallets.sql
-- Purpose: Create user_wallets table for ordinals address storage with encrypted WIF
-- Date: 2026-02-03

-- User wallets table for derived ordinals addresses
CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT UNIQUE NOT NULL,              -- HandCash handle (e.g., "b0ase")
  address TEXT UNIQUE NOT NULL,             -- BSV P2PKH address (starts with "1")
  public_key TEXT NOT NULL,                 -- Hex public key
  encrypted_wif TEXT NOT NULL,              -- WIF encrypted with signature-derived key
  encryption_salt TEXT NOT NULL,            -- Salt used for key derivation
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,

  -- Link to existing holder record
  holder_id UUID REFERENCES path402_holders(id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_wallets_handle ON user_wallets(handle);
CREATE INDEX IF NOT EXISTS idx_user_wallets_address ON user_wallets(address);
CREATE INDEX IF NOT EXISTS idx_user_wallets_holder ON user_wallets(holder_id);

-- Add ordinals_address column to holders if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'path402_holders' AND column_name = 'ordinals_address'
  ) THEN
    ALTER TABLE path402_holders ADD COLUMN ordinals_address TEXT;
  END IF;
END $$;

-- Index on ordinals_address
CREATE INDEX IF NOT EXISTS idx_holders_ordinals_address ON path402_holders(ordinals_address);

COMMENT ON TABLE user_wallets IS 'Derived ordinals addresses for token holders with encrypted private keys';
COMMENT ON COLUMN user_wallets.encrypted_wif IS 'WIF private key encrypted with AES-256-GCM using signature-derived key';
COMMENT ON COLUMN user_wallets.encryption_salt IS 'Random salt used in HKDF key derivation from signature';
