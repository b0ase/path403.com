-- Add on-chain tracking columns to path402_tokens
-- These track the BSV-21 token's on-chain state (UTXO chain pattern from MoneyButton2)

ALTER TABLE path402_tokens ADD COLUMN IF NOT EXISTS deploy_txid TEXT;
ALTER TABLE path402_tokens ADD COLUMN IF NOT EXISTS bsv21_token_id TEXT;  -- txid_vout format
ALTER TABLE path402_tokens ADD COLUMN IF NOT EXISTS current_utxo TEXT;    -- current UTXO holding platform's tokens
ALTER TABLE path402_tokens ADD COLUMN IF NOT EXISTS on_chain_balance BIGINT DEFAULT 0;

-- Add pending dividends to holdings
ALTER TABLE path402_holdings ADD COLUMN IF NOT EXISTS pending_dividends_sats BIGINT DEFAULT 0;
ALTER TABLE path402_holdings ADD COLUMN IF NOT EXISTS total_dividends_paid_sats BIGINT DEFAULT 0;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tokens_bsv21_id ON path402_tokens(bsv21_token_id);
CREATE INDEX IF NOT EXISTS idx_holdings_pending_dividends ON path402_holdings(pending_dividends_sats) WHERE pending_dividends_sats > 0;
