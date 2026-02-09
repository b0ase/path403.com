-- Add columns to track first-time token credit and tier purchases
ALTER TABLE user_bwriter_balance
  ADD COLUMN IF NOT EXISTS first_token_credited BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS first_token_credited_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS tier_001_purchased_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS tier_010_purchased_at TIMESTAMP WITH TIME ZONE;

-- Index for quick lookup of users who haven't received first token
CREATE INDEX IF NOT EXISTS idx_user_bwriter_balance_first_token
  ON user_bwriter_balance(first_token_credited);

-- Comments for documentation
COMMENT ON COLUMN user_bwriter_balance.first_token_credited
  IS 'Whether user has received their free first token after HandCash auth. Prevents duplicate credits.';

COMMENT ON COLUMN user_bwriter_balance.first_token_credited_at
  IS 'Timestamp when first token was credited. NULL if not credited.';

COMMENT ON COLUMN user_bwriter_balance.tier_001_purchased_at
  IS 'Timestamp when user first purchased $0.01 tier (1 token). Used for UI highlight.';

COMMENT ON COLUMN user_bwriter_balance.tier_010_purchased_at
  IS 'Timestamp when user first purchased $0.10 tier (10 tokens). Used for UI highlight.';
