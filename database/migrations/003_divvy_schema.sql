-- =============================================================================
-- DIVVY CORE SCHEMA
-- Shared dividend distribution infrastructure for DNS DEX, Path402, and Divvy
-- =============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- DIVVY USERS (wallet/handle registry)
-- =============================================================================
CREATE TABLE IF NOT EXISTS divvy_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identity
  handcash_handle TEXT UNIQUE,              -- e.g. "$BOASE"
  paymail TEXT,                              -- e.g. "richard@handcash.io"
  bsv_address TEXT,                          -- Fallback address
  
  -- Auth
  handcash_auth_token TEXT,                  -- Encrypted OAuth token
  
  -- KYC/Compliance
  kyc_status TEXT DEFAULT 'none' CHECK (kyc_status IN ('none', 'pending', 'verified', 'rejected')),
  kyc_provider TEXT,                         -- e.g. 'veriff'
  kyc_verified_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_divvy_users_handle ON divvy_users(handcash_handle);
CREATE INDEX idx_divvy_users_paymail ON divvy_users(paymail);

-- =============================================================================
-- DIVVY ASSETS (tokenized domains, paths, handles)
-- =============================================================================
CREATE TABLE IF NOT EXISTS divvy_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Asset identification
  asset_type TEXT NOT NULL CHECK (asset_type IN ('domain', 'path', 'handle')),
  identifier TEXT NOT NULL UNIQUE,           -- "b0ase.com" or "b0ase.com/video" or "$BOASE"
  symbol TEXT NOT NULL,                       -- "$b0ase.com" or "$BOASE"
  
  -- Ownership
  owner_id UUID REFERENCES divvy_users(id),
  issuer_address TEXT,                        -- BSV address or paymail of issuer
  
  -- Tokenomics
  total_supply BIGINT NOT NULL DEFAULT 1000000000,  -- 1 billion default
  circulating_supply BIGINT DEFAULT 0,
  
  -- Revenue collection
  receive_address TEXT,                       -- Master paymail/address for incoming payments
  receive_paymail TEXT,                       -- Paymail endpoint (preferred)
  
  -- Verification (varies by type)
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'active', 'suspended')),
  verification_method TEXT,                   -- 'dns', 'path402', 'handcash'
  verification_proof TEXT,                    -- TX ID or signature
  verified_at TIMESTAMPTZ,
  
  -- Metadata
  description TEXT,
  category TEXT DEFAULT 'other',
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_divvy_assets_type ON divvy_assets(asset_type);
CREATE INDEX idx_divvy_assets_identifier ON divvy_assets(identifier);
CREATE INDEX idx_divvy_assets_owner ON divvy_assets(owner_id);
CREATE INDEX idx_divvy_assets_status ON divvy_assets(verification_status);

-- =============================================================================
-- DIVVY HOLDINGS (who owns what)
-- =============================================================================
CREATE TABLE IF NOT EXISTS divvy_holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationship
  asset_id UUID NOT NULL REFERENCES divvy_assets(id) ON DELETE CASCADE,
  holder_id UUID REFERENCES divvy_users(id),
  
  -- Non-custodial holder (if not registered user)
  holder_address TEXT,                        -- BSV address
  holder_paymail TEXT,                        -- Paymail for payouts
  
  -- Balance
  balance BIGINT NOT NULL DEFAULT 0,          -- Token balance
  locked_balance BIGINT DEFAULT 0,            -- Staked/locked tokens
  
  -- Stats
  total_acquired BIGINT DEFAULT 0,
  total_dividends_received BIGINT DEFAULT 0,  -- Lifetime sats received
  last_dividend_at TIMESTAMPTZ,
  
  -- Timestamps
  first_acquired_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(asset_id, holder_id),
  UNIQUE(asset_id, holder_address)
);

CREATE INDEX idx_divvy_holdings_asset ON divvy_holdings(asset_id);
CREATE INDEX idx_divvy_holdings_holder ON divvy_holdings(holder_id);
CREATE INDEX idx_divvy_holdings_balance ON divvy_holdings(balance) WHERE balance > 0;

-- =============================================================================
-- DIVVY PAYMENTS (incoming revenue)
-- =============================================================================
CREATE TABLE IF NOT EXISTS divvy_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Which asset received payment
  asset_id UUID NOT NULL REFERENCES divvy_assets(id) ON DELETE CASCADE,
  
  -- Payment details
  tx_id TEXT UNIQUE,                          -- BSV transaction ID
  amount_sats BIGINT NOT NULL,
  payer_handle TEXT,                          -- Who paid (if known)
  payer_address TEXT,
  
  -- Processing
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'distributed', 'failed')),
  distributed_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Metadata
  payment_type TEXT DEFAULT 'revenue',        -- 'revenue', 'tip', 'purchase'
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  received_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_divvy_payments_asset ON divvy_payments(asset_id);
CREATE INDEX idx_divvy_payments_status ON divvy_payments(status);
CREATE INDEX idx_divvy_payments_tx ON divvy_payments(tx_id);

-- =============================================================================
-- DIVVY DIVIDENDS (outgoing payouts)
-- =============================================================================
CREATE TABLE IF NOT EXISTS divvy_dividends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Source payment
  payment_id UUID NOT NULL REFERENCES divvy_payments(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES divvy_assets(id) ON DELETE CASCADE,
  
  -- Recipient
  holder_id UUID REFERENCES divvy_users(id),
  recipient_address TEXT,                     -- Where payout was sent
  recipient_paymail TEXT,
  
  -- Amount
  amount_sats BIGINT NOT NULL,
  holder_balance_at_time BIGINT,              -- Snapshot of balance for audit
  total_supply_at_time BIGINT,                -- Snapshot of supply for audit
  share_percentage DECIMAL(10, 6),            -- e.g. 0.001234 = 0.1234%
  
  -- Processing
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'confirmed', 'failed')),
  tx_id TEXT,                                 -- Payout transaction ID
  error_message TEXT,
  
  -- Timestamps
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ
);

CREATE INDEX idx_divvy_dividends_payment ON divvy_dividends(payment_id);
CREATE INDEX idx_divvy_dividends_asset ON divvy_dividends(asset_id);
CREATE INDEX idx_divvy_dividends_holder ON divvy_dividends(holder_id);
CREATE INDEX idx_divvy_dividends_status ON divvy_dividends(status);

-- =============================================================================
-- DIVVY DISTRIBUTION BATCHES (group payouts)
-- =============================================================================
CREATE TABLE IF NOT EXISTS divvy_distribution_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- What's being distributed
  asset_id UUID NOT NULL REFERENCES divvy_assets(id),
  payment_id UUID REFERENCES divvy_payments(id),
  
  -- Totals
  total_amount_sats BIGINT NOT NULL,
  holder_count INT NOT NULL,
  successful_payouts INT DEFAULT 0,
  failed_payouts INT DEFAULT 0,
  
  -- Processing
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'partial', 'failed')),
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_divvy_batches_asset ON divvy_distribution_batches(asset_id);
CREATE INDEX idx_divvy_batches_status ON divvy_distribution_batches(status);

-- =============================================================================
-- VIEWS
-- =============================================================================

-- Asset summary with holder count and total distributed
CREATE OR REPLACE VIEW divvy_asset_summary AS
SELECT 
  a.id,
  a.asset_type,
  a.identifier,
  a.symbol,
  a.total_supply,
  a.verification_status,
  COUNT(DISTINCT h.id) FILTER (WHERE h.balance > 0) as holder_count,
  COALESCE(SUM(h.balance), 0) as circulating_supply,
  COALESCE(SUM(p.amount_sats) FILTER (WHERE p.status = 'distributed'), 0) as total_revenue_sats,
  COALESCE(SUM(d.amount_sats) FILTER (WHERE d.status = 'confirmed'), 0) as total_dividends_paid_sats
FROM divvy_assets a
LEFT JOIN divvy_holdings h ON h.asset_id = a.id
LEFT JOIN divvy_payments p ON p.asset_id = a.id
LEFT JOIN divvy_dividends d ON d.asset_id = a.id
GROUP BY a.id;

-- Holder portfolio view
CREATE OR REPLACE VIEW divvy_holder_portfolio AS
SELECT 
  h.holder_id,
  u.handcash_handle,
  a.symbol,
  a.identifier,
  h.balance,
  h.total_dividends_received,
  (h.balance::DECIMAL / NULLIF(a.total_supply, 0) * 100) as ownership_percentage
FROM divvy_holdings h
JOIN divvy_assets a ON a.id = h.asset_id
LEFT JOIN divvy_users u ON u.id = h.holder_id
WHERE h.balance > 0;

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Calculate dividend distribution for a payment
CREATE OR REPLACE FUNCTION calculate_dividend_distribution(
  p_payment_id UUID
) RETURNS TABLE (
  holder_id UUID,
  recipient_address TEXT,
  recipient_paymail TEXT,
  amount_sats BIGINT,
  share_percentage DECIMAL
) AS $$
DECLARE
  v_asset_id UUID;
  v_payment_amount BIGINT;
  v_total_supply BIGINT;
BEGIN
  -- Get payment details
  SELECT asset_id, amount_sats INTO v_asset_id, v_payment_amount
  FROM divvy_payments WHERE id = p_payment_id;
  
  -- Get total supply
  SELECT total_supply INTO v_total_supply
  FROM divvy_assets WHERE id = v_asset_id;
  
  -- Return distribution
  RETURN QUERY
  SELECT 
    h.holder_id,
    COALESCE(h.holder_address, u.bsv_address) as recipient_address,
    COALESCE(h.holder_paymail, u.paymail, u.handcash_handle || '@handcash.io') as recipient_paymail,
    (h.balance::DECIMAL / v_total_supply * v_payment_amount)::BIGINT as amount_sats,
    (h.balance::DECIMAL / v_total_supply * 100) as share_percentage
  FROM divvy_holdings h
  LEFT JOIN divvy_users u ON u.id = h.holder_id
  WHERE h.asset_id = v_asset_id
    AND h.balance > 0;
END;
$$ LANGUAGE plpgsql;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_divvy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER divvy_users_updated_at BEFORE UPDATE ON divvy_users
  FOR EACH ROW EXECUTE FUNCTION update_divvy_updated_at();

CREATE TRIGGER divvy_assets_updated_at BEFORE UPDATE ON divvy_assets
  FOR EACH ROW EXECUTE FUNCTION update_divvy_updated_at();

CREATE TRIGGER divvy_holdings_updated_at BEFORE UPDATE ON divvy_holdings
  FOR EACH ROW EXECUTE FUNCTION update_divvy_updated_at();

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON TABLE divvy_assets IS 'Tokenized assets: domains, content paths, or handles';
COMMENT ON TABLE divvy_holdings IS 'Token balances per holder per asset';
COMMENT ON TABLE divvy_payments IS 'Incoming revenue payments to assets';
COMMENT ON TABLE divvy_dividends IS 'Individual dividend payouts to holders';
COMMENT ON TABLE divvy_distribution_batches IS 'Grouped payout batches for efficiency';
