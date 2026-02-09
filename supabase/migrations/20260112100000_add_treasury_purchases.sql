-- Treasury Purchases tracking table
-- Tracks pending, completed, and failed token purchases

CREATE TABLE IF NOT EXISTS treasury_purchases (
  id TEXT PRIMARY KEY,

  -- Purchase details
  token_amount INTEGER NOT NULL,
  recipient_address TEXT NOT NULL,

  -- Payment info
  payment_currency TEXT NOT NULL CHECK (payment_currency IN ('BSV', 'ETH', 'SOL')),
  expected_amount BIGINT NOT NULL, -- In smallest unit (sats/wei/lamports)
  payment_address TEXT NOT NULL,
  payment_txid TEXT,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verifying', 'paid', 'completed', 'expired', 'failed')),

  -- Verification info
  confirmations INTEGER DEFAULT 0,
  verified_amount BIGINT,
  sender_address TEXT,

  -- Token transfer info (after payment confirmed)
  transfer_txid TEXT,

  -- User association (optional)
  user_id UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Price info snapshot
  price_usd DECIMAL(10, 2),
  price_per_token DECIMAL(10, 6),

  -- Error tracking
  error_message TEXT
);

-- Indexes for common queries
CREATE INDEX idx_treasury_purchases_status ON treasury_purchases(status);
CREATE INDEX idx_treasury_purchases_recipient ON treasury_purchases(recipient_address);
CREATE INDEX idx_treasury_purchases_payment_txid ON treasury_purchases(payment_txid);
CREATE INDEX idx_treasury_purchases_expires_at ON treasury_purchases(expires_at) WHERE status = 'pending';
CREATE INDEX idx_treasury_purchases_user_id ON treasury_purchases(user_id);

-- Function to auto-expire pending purchases
CREATE OR REPLACE FUNCTION expire_pending_purchases()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE treasury_purchases
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Audit log for treasury operations
CREATE TABLE IF NOT EXISTS treasury_audit_log (
  id SERIAL PRIMARY KEY,
  purchase_id TEXT REFERENCES treasury_purchases(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE treasury_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_audit_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
  ON treasury_purchases
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    recipient_address IN (
      SELECT provider_user_id FROM linked_identities WHERE unified_user_id = (
        SELECT unified_user_id FROM linked_identities WHERE provider_user_id = auth.uid()::text
      )
    )
  );

-- Service role can do everything
CREATE POLICY "Service role full access to purchases"
  ON treasury_purchases
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to audit log"
  ON treasury_audit_log
  FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE treasury_purchases IS 'Tracks token purchases from the treasury with payment verification';
COMMENT ON TABLE treasury_audit_log IS 'Audit trail for treasury operations';
