-- Migration: 005_purchase_transfer_txid.sql
-- Purpose: Add transfer_tx_id column to track on-chain token transfers
-- Date: 2026-02-03

-- Add transfer_tx_id to purchases table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'path402_purchases' AND column_name = 'transfer_tx_id'
  ) THEN
    ALTER TABLE path402_purchases ADD COLUMN transfer_tx_id TEXT;
  END IF;
END $$;

-- Index for looking up purchases by transfer
CREATE INDEX IF NOT EXISTS idx_purchases_transfer_tx ON path402_purchases(transfer_tx_id) WHERE transfer_tx_id IS NOT NULL;

COMMENT ON COLUMN path402_purchases.transfer_tx_id IS 'BSV transaction ID of the on-chain token transfer to user ordinals address';
