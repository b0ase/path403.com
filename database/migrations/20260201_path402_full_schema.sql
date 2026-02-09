-- $402 Exchange Full Schema
-- Based on b0ase.com/exchange Product Specification v0.1
-- Date: 1 February 2026

-- ══════════════════════════════════════════════════════════════════════════════
-- USERS & KYC
-- ══════════════════════════════════════════════════════════════════════════════

-- Extend users table with KYC fields (if not exists, create; if exists, alter)
DO $$
BEGIN
  -- Add KYC columns to existing unified_users or create path402_users
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'unified_users') THEN
    -- Add columns to existing unified_users if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'unified_users' AND column_name = 'kyc_status') THEN
      ALTER TABLE unified_users ADD COLUMN kyc_status TEXT NOT NULL DEFAULT 'none';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'unified_users' AND column_name = 'kyc_submitted_at') THEN
      ALTER TABLE unified_users ADD COLUMN kyc_submitted_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'unified_users' AND column_name = 'kyc_verified_at') THEN
      ALTER TABLE unified_users ADD COLUMN kyc_verified_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'unified_users' AND column_name = 'kyc_document_ref') THEN
      ALTER TABLE unified_users ADD COLUMN kyc_document_ref TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'unified_users' AND column_name = 'full_legal_name') THEN
      ALTER TABLE unified_users ADD COLUMN full_legal_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'unified_users' AND column_name = 'nationality') THEN
      ALTER TABLE unified_users ADD COLUMN nationality TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'unified_users' AND column_name = 'registered') THEN
      ALTER TABLE unified_users ADD COLUMN registered BOOLEAN NOT NULL DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'unified_users' AND column_name = 'registered_at') THEN
      ALTER TABLE unified_users ADD COLUMN registered_at TIMESTAMPTZ;
    END IF;
  END IF;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- TOKENS (Enhanced)
-- ══════════════════════════════════════════════════════════════════════════════

-- Drop and recreate path402_tokens with full schema
DROP TABLE IF EXISTS path402_serves CASCADE;
DROP TABLE IF EXISTS path402_transactions CASCADE;
DROP TABLE IF EXISTS path402_holdings CASCADE;
DROP TABLE IF EXISTS dividend_payments CASCADE;
DROP TABLE IF EXISTS dividend_distributions CASCADE;
DROP TABLE IF EXISTS vote_ballots CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS transfer_requests CASCADE;
DROP TABLE IF EXISTS withdrawals CASCADE;
DROP TABLE IF EXISTS path402_tokens CASCADE;

CREATE TABLE path402_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dollar_address  TEXT UNIQUE NOT NULL,       -- e.g. '$b0ase.com/$blog/$my-post'
  title           TEXT NOT NULL,
  description     TEXT,
  content_type    TEXT NOT NULL DEFAULT 'blog', -- 'blog', 'data', 'api', 'research', 'news', 'membership'
  content_hash    TEXT,                       -- hash of gated content
  content_url     TEXT,                       -- URL to access content
  creator_handle  TEXT NOT NULL,              -- HandCash handle of creator
  creator_id      UUID,                       -- Reference to unified_users if exists

  -- Pricing
  pricing_model   TEXT NOT NULL DEFAULT 'sqrt_decay', -- 'fixed', 'sqrt_decay', 'log_decay', 'linear'
  base_price_sats BIGINT NOT NULL DEFAULT 500,
  floor_price_sats BIGINT DEFAULT 1,
  decay_factor    DECIMAL(10,4) DEFAULT 1.0,

  -- Revenue
  revenue_model   TEXT NOT NULL DEFAULT 'fixed_split', -- 'fixed_split', 'decaying_issuer', 'equal_split'
  issuer_share_bps INT NOT NULL DEFAULT 7000, -- Basis points (70% = 7000)
  issuer_decay    DECIMAL(5,4),               -- For decaying issuer model
  issuer_floor_bps INT,                       -- Minimum issuer share
  platform_share_bps INT NOT NULL DEFAULT 500, -- Platform fee (5% = 500)

  -- Supply & Revenue
  current_supply  BIGINT DEFAULT 0,
  total_revenue_sats BIGINT DEFAULT 0,

  -- Token rights flags
  confers_dividends BOOLEAN DEFAULT false,    -- Does holding this token pay dividends?
  confers_voting    BOOLEAN DEFAULT false,    -- Does holding this token grant votes?
  confers_serving   BOOLEAN DEFAULT true,     -- Can holders serve this content?

  -- Hierarchical
  parent_address  TEXT,                       -- Parent token in hierarchy (e.g. '$b0ase.com/$blog')

  -- Metadata
  icon_url        TEXT,
  tags            TEXT[],
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- HOLDINGS (The Account Ledger)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE path402_holdings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id        UUID NOT NULL REFERENCES path402_tokens(id) ON DELETE CASCADE,
  user_handle     TEXT NOT NULL,              -- HandCash handle
  user_id         UUID,                       -- Reference to unified_users if exists

  -- Position
  position        INTEGER NOT NULL,           -- Supply position at time of purchase (1st buyer = 1)
  quantity        BIGINT NOT NULL DEFAULT 1,  -- Number of tokens held
  price_paid_sats BIGINT NOT NULL,            -- Total satoshis paid

  -- Serving
  serving_active  BOOLEAN DEFAULT true,       -- Participating in serving network?
  serving_revenue_sats BIGINT DEFAULT 0,      -- Lifetime serving revenue earned

  -- Registration (for dividend/voting tokens)
  registered      BOOLEAN NOT NULL DEFAULT false,
                  -- true  = holder is KYC'd AND on-platform → gets dividends + votes
                  -- false = either not KYC'd OR token is withdrawn → no dividends/votes

  -- Withdrawal state
  withdrawn       BOOLEAN NOT NULL DEFAULT false,
  withdrawn_at    TIMESTAMPTZ,
  withdrawal_tx   TEXT,                       -- On-chain tx hash
  withdrawal_format TEXT,                     -- '1sat_ordinal', 'brc100', etc.

  -- Timestamps
  acquired_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(token_id, user_handle, position)
);

-- ══════════════════════════════════════════════════════════════════════════════
-- TRANSACTIONS
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE path402_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id        UUID NOT NULL REFERENCES path402_tokens(id) ON DELETE CASCADE,

  -- Parties
  buyer_handle    TEXT NOT NULL,
  buyer_id        UUID,
  seller_handle   TEXT,                       -- NULL for primary issuance

  -- Transaction details
  tx_type         TEXT NOT NULL DEFAULT 'acquire', -- 'acquire', 'transfer', 'dividend', 'serve'
  quantity        BIGINT NOT NULL DEFAULT 1,
  price_sats      BIGINT NOT NULL,            -- Total price
  unit_price_sats BIGINT NOT NULL,            -- Price per token
  supply_at_tx    BIGINT NOT NULL,            -- Supply at time of transaction

  -- Revenue distribution
  issuer_revenue_sats BIGINT,
  platform_revenue_sats BIGINT,
  network_revenue_sats BIGINT,                -- Distributed to serving nodes

  -- Payment
  handcash_tx_id  TEXT,
  payment_status  TEXT DEFAULT 'completed',   -- 'pending', 'completed', 'failed'

  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- SERVES (Content Serving Tracking)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE path402_serves (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id        UUID NOT NULL REFERENCES path402_tokens(id) ON DELETE CASCADE,

  -- Parties
  server_handle   TEXT NOT NULL,              -- Who served the content
  server_id       UUID,
  requester_handle TEXT,                      -- Who requested (if known)
  requester_id    UUID,

  -- Details
  resource_path   TEXT NOT NULL,
  tokens_consumed BIGINT DEFAULT 1,
  revenue_earned_sats BIGINT DEFAULT 0,

  served_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- DIVIDENDS
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE dividend_distributions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id            UUID NOT NULL REFERENCES path402_tokens(id) ON DELETE CASCADE,

  -- Distribution details
  total_amount_sats   BIGINT NOT NULL,        -- Total satoshis distributed
  per_holder_sats     BIGINT NOT NULL,        -- Satoshis per registered holder
  eligible_holders    INTEGER NOT NULL,       -- Count of registered holders at snapshot

  -- Timing
  snapshot_at         TIMESTAMPTZ NOT NULL,   -- When holder list was snapshotted
  distributed_at      TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  distribution_type   TEXT DEFAULT 'regular', -- 'regular', 'special', 'final'
  notes               TEXT,

  created_by          TEXT,                   -- Admin who triggered
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dividend_payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id   UUID NOT NULL REFERENCES dividend_distributions(id) ON DELETE CASCADE,
  holding_id        UUID NOT NULL REFERENCES path402_holdings(id) ON DELETE CASCADE,

  user_handle       TEXT NOT NULL,
  user_id           UUID,
  amount_sats       BIGINT NOT NULL,

  -- Payment status
  payment_status    TEXT DEFAULT 'pending',   -- 'pending', 'paid', 'failed'
  handcash_tx_id    TEXT,
  paid_at           TIMESTAMPTZ,

  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- VOTING
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE votes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id        UUID NOT NULL REFERENCES path402_tokens(id) ON DELETE CASCADE,

  -- Vote details
  title           TEXT NOT NULL,
  description     TEXT,
  vote_type       TEXT DEFAULT 'advisory',    -- 'advisory', 'binding'
  options         JSONB NOT NULL,             -- e.g. ["approve", "reject", "abstain"]

  -- Timing
  opens_at        TIMESTAMPTZ NOT NULL,
  closes_at       TIMESTAMPTZ NOT NULL,

  -- Results (populated after close)
  results         JSONB,                      -- e.g. {"approve": 15, "reject": 3, "abstain": 2}
  winning_option  TEXT,
  total_votes     INTEGER,

  -- Metadata
  created_by      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vote_ballots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id         UUID NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  holding_id      UUID NOT NULL REFERENCES path402_holdings(id) ON DELETE CASCADE,

  user_handle     TEXT NOT NULL,
  user_id         UUID,
  choice          TEXT NOT NULL,

  cast_at         TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(vote_id, holding_id)                 -- One vote per holding
);

-- ══════════════════════════════════════════════════════════════════════════════
-- WITHDRAWALS & TRANSFERS
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE withdrawals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holding_id      UUID NOT NULL REFERENCES path402_holdings(id) ON DELETE CASCADE,
  token_id        UUID NOT NULL REFERENCES path402_tokens(id) ON DELETE CASCADE,

  user_handle     TEXT NOT NULL,
  user_id         UUID,

  -- On-chain details
  chain_format    TEXT NOT NULL,              -- '1sat_ordinal', 'brc100'
  chain_tx_hash   TEXT NOT NULL,
  chain_address   TEXT NOT NULL,              -- Destination on-chain address

  -- Metadata inscribed on-chain
  inscribed_metadata JSONB,                   -- Full metadata written to chain

  withdrawn_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transfer_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id          UUID NOT NULL REFERENCES path402_tokens(id) ON DELETE CASCADE,

  -- Requester (new holder presenting the token)
  requester_handle  TEXT NOT NULL,
  requester_id      UUID,

  -- Proof of ownership
  chain_tx_hash     TEXT NOT NULL,
  chain_address     TEXT NOT NULL,            -- Address they control

  -- Previous holder (if known from our records)
  previous_holding_id UUID REFERENCES path402_holdings(id),
  previous_holder   TEXT,

  -- Status
  status            TEXT NOT NULL DEFAULT 'pending',
                    -- 'pending'  → awaiting KYC check
                    -- 'approved' → KYC passed, transfer registered
                    -- 'rejected' → KYC failed or token invalid
  rejection_reason  TEXT,

  -- Review
  reviewed_by       TEXT,
  reviewed_at       TIMESTAMPTZ,

  -- New holding (created if approved)
  new_holding_id    UUID REFERENCES path402_holdings(id),

  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════════════════════════════════════════════

-- Tokens
CREATE INDEX idx_tokens_dollar_address ON path402_tokens(dollar_address);
CREATE INDEX idx_tokens_creator ON path402_tokens(creator_handle);
CREATE INDEX idx_tokens_content_type ON path402_tokens(content_type);
CREATE INDEX idx_tokens_active ON path402_tokens(is_active);
CREATE INDEX idx_tokens_dividends ON path402_tokens(confers_dividends) WHERE confers_dividends = true;
CREATE INDEX idx_tokens_voting ON path402_tokens(confers_voting) WHERE confers_voting = true;
CREATE INDEX idx_tokens_parent ON path402_tokens(parent_address);

-- Holdings
CREATE INDEX idx_holdings_token ON path402_holdings(token_id);
CREATE INDEX idx_holdings_user ON path402_holdings(user_handle);
CREATE INDEX idx_holdings_registered ON path402_holdings(registered) WHERE registered = true;
CREATE INDEX idx_holdings_serving ON path402_holdings(serving_active) WHERE serving_active = true;
CREATE INDEX idx_holdings_withdrawn ON path402_holdings(withdrawn);

-- Transactions
CREATE INDEX idx_transactions_token ON path402_transactions(token_id);
CREATE INDEX idx_transactions_buyer ON path402_transactions(buyer_handle);
CREATE INDEX idx_transactions_created ON path402_transactions(created_at);
CREATE INDEX idx_transactions_type ON path402_transactions(tx_type);

-- Serves
CREATE INDEX idx_serves_token ON path402_serves(token_id);
CREATE INDEX idx_serves_server ON path402_serves(server_handle);
CREATE INDEX idx_serves_date ON path402_serves(served_at);

-- Dividends
CREATE INDEX idx_dividend_dist_token ON dividend_distributions(token_id);
CREATE INDEX idx_dividend_payments_dist ON dividend_payments(distribution_id);
CREATE INDEX idx_dividend_payments_user ON dividend_payments(user_handle);

-- Votes
CREATE INDEX idx_votes_token ON votes(token_id);
CREATE INDEX idx_votes_open ON votes(opens_at, closes_at);
CREATE INDEX idx_ballots_vote ON vote_ballots(vote_id);
CREATE INDEX idx_ballots_user ON vote_ballots(user_handle);

-- Withdrawals
CREATE INDEX idx_withdrawals_token ON withdrawals(token_id);
CREATE INDEX idx_withdrawals_user ON withdrawals(user_handle);
CREATE INDEX idx_transfers_token ON transfer_requests(token_id);
CREATE INDEX idx_transfers_status ON transfer_requests(status);

-- ══════════════════════════════════════════════════════════════════════════════
-- SEED DATA
-- ══════════════════════════════════════════════════════════════════════════════

-- Root token: $b0ase.com (platform equity token)
INSERT INTO path402_tokens (
  dollar_address, title, description, content_type, creator_handle,
  pricing_model, base_price_sats, floor_price_sats,
  revenue_model, issuer_share_bps, platform_share_bps,
  confers_dividends, confers_voting, confers_serving,
  icon_url, tags
) VALUES (
  '$b0ase.com',
  '$BOASE Platform Token',
  'Root token for b0ase.com. Holders earn platform revenue and vote on governance.',
  'membership',
  'b0ase',
  'sqrt_decay', 2500, 100,
  'fixed_split', 0, 10000,  -- All revenue to platform (this IS the platform token)
  true, true, false,
  '/images/boase-token.png',
  ARRAY['platform', 'governance', 'equity']
);

-- Blog section token
INSERT INTO path402_tokens (
  dollar_address, title, description, content_type, creator_handle,
  pricing_model, base_price_sats, floor_price_sats,
  revenue_model, issuer_share_bps, platform_share_bps,
  confers_dividends, confers_voting, confers_serving,
  parent_address, tags
) VALUES (
  '$b0ase.com/$blog',
  'b0ase Blog Access',
  'Section token for all blog content on b0ase.com',
  'blog',
  'b0ase',
  'sqrt_decay', 500, 10,
  'fixed_split', 5000, 2000,
  false, false, true,
  '$b0ase.com',
  ARRAY['blog', 'content']
);

-- API section token
INSERT INTO path402_tokens (
  dollar_address, title, description, content_type, creator_handle,
  pricing_model, base_price_sats, floor_price_sats,
  revenue_model, issuer_share_bps, platform_share_bps,
  confers_dividends, confers_voting, confers_serving,
  parent_address, tags
) VALUES (
  '$b0ase.com/$api',
  'b0ase API Access',
  'Section token for API endpoints on b0ase.com',
  'api',
  'b0ase',
  'sqrt_decay', 1000, 50,
  'fixed_split', 6000, 2000,
  false, false, true,
  '$b0ase.com',
  ARRAY['api', 'developer']
);

-- Sample blog post tokens (the $402 series)
INSERT INTO path402_tokens (
  dollar_address, title, description, content_type, creator_handle,
  pricing_model, base_price_sats, floor_price_sats,
  revenue_model, issuer_share_bps, platform_share_bps,
  confers_dividends, confers_voting, confers_serving,
  parent_address, content_url, tags
) VALUES
(
  '$b0ase.com/$blog/$maths-of-the-metaweb',
  'The Maths of the MetaWeb',
  'Pricing and revenue economics of the $402 protocol',
  'blog',
  'b0ase',
  'sqrt_decay', 500, 10,
  'fixed_split', 7000, 500,
  false, false, true,
  '$b0ase.com/$blog',
  '/blog/maths-of-the-metaweb',
  ARRAY['$402', 'economics', 'pricing']
),
(
  '$b0ase.com/$blog/$first-native-consumer',
  'The First Native Consumer',
  'AI agents and the MetaWeb protocol',
  'blog',
  'b0ase',
  'sqrt_decay', 500, 10,
  'fixed_split', 7000, 500,
  false, false, true,
  '$b0ase.com/$blog',
  '/blog/first-native-consumer',
  ARRAY['$402', 'AI', 'agents']
),
(
  '$b0ase.com/$blog/$402-protocol-spec',
  '$402 Protocol Specification',
  'Technical specification for the $402 content payment protocol',
  'research',
  'b0ase',
  'log_decay', 2000, 100,
  'fixed_split', 7000, 500,
  false, false, true,
  '$b0ase.com/$blog',
  '/blog/402-protocol-specification',
  ARRAY['$402', 'protocol', 'spec']
);

-- Kintsugi API token
INSERT INTO path402_tokens (
  dollar_address, title, description, content_type, creator_handle,
  pricing_model, base_price_sats, floor_price_sats,
  revenue_model, issuer_share_bps, platform_share_bps,
  confers_dividends, confers_voting, confers_serving,
  parent_address, tags
) VALUES (
  '$b0ase.com/$api/$kintsugi',
  'Kintsugi AI API',
  'Access to Kintsugi AI endpoints - the venture studio AI engine',
  'api',
  'b0ase',
  'sqrt_decay', 1000, 50,
  'fixed_split', 6000, 1500,
  false, false, true,
  '$b0ase.com/$api',
  ARRAY['api', 'AI', 'kintsugi']
);

-- ══════════════════════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ══════════════════════════════════════════════════════════════════════════════

-- Function to calculate current price based on pricing model
CREATE OR REPLACE FUNCTION calculate_token_price(
  p_base_price BIGINT,
  p_supply BIGINT,
  p_model TEXT,
  p_decay_factor DECIMAL DEFAULT 1.0,
  p_floor_price BIGINT DEFAULT 1
) RETURNS BIGINT AS $$
BEGIN
  CASE p_model
    WHEN 'fixed' THEN
      RETURN p_base_price;
    WHEN 'sqrt_decay' THEN
      RETURN GREATEST(p_floor_price, CEIL((p_base_price * p_decay_factor) / SQRT(p_supply + 1)));
    WHEN 'log_decay' THEN
      RETURN GREATEST(p_floor_price, CEIL((p_base_price * p_decay_factor) / LN(p_supply + 2)));
    WHEN 'linear' THEN
      RETURN GREATEST(p_floor_price, CEIL(p_base_price - (p_supply * p_decay_factor)));
    ELSE
      RETURN p_base_price;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get eligible dividend holders for a token
CREATE OR REPLACE FUNCTION get_dividend_eligible_holders(p_token_id UUID)
RETURNS TABLE (
  holding_id UUID,
  user_handle TEXT,
  quantity BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT h.id, h.user_handle, h.quantity
  FROM path402_holdings h
  WHERE h.token_id = p_token_id
    AND h.registered = true
    AND h.withdrawn = false;
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════════════════════════════════
-- VIEWS
-- ══════════════════════════════════════════════════════════════════════════════

-- Token listing view with calculated prices
CREATE OR REPLACE VIEW v_token_listing AS
SELECT
  t.id,
  t.dollar_address,
  t.title,
  t.description,
  t.content_type,
  t.creator_handle,
  t.pricing_model,
  t.base_price_sats,
  t.floor_price_sats,
  t.current_supply,
  t.total_revenue_sats,
  t.confers_dividends,
  t.confers_voting,
  t.confers_serving,
  t.parent_address,
  t.icon_url,
  t.tags,
  t.is_active,
  t.created_at,
  calculate_token_price(
    t.base_price_sats,
    t.current_supply,
    t.pricing_model,
    t.decay_factor,
    t.floor_price_sats
  ) AS current_price_sats,
  (SELECT COUNT(*) FROM path402_holdings h WHERE h.token_id = t.id AND h.withdrawn = false) AS holder_count,
  (SELECT COUNT(*) FROM path402_holdings h WHERE h.token_id = t.id AND h.registered = true AND h.withdrawn = false) AS registered_holders,
  (SELECT COUNT(*) FROM path402_transactions tx WHERE tx.token_id = t.id AND tx.created_at > NOW() - INTERVAL '24 hours') AS tx_24h
FROM path402_tokens t
WHERE t.is_active = true;

-- Registry view (public cap table for dividend/voting tokens)
CREATE OR REPLACE VIEW v_registry AS
SELECT
  h.user_handle AS member,
  t.dollar_address AS token,
  t.title AS token_name,
  h.position,
  h.quantity,
  h.acquired_at,
  COALESCE(
    (SELECT SUM(dp.amount_sats) FROM dividend_payments dp WHERE dp.holding_id = h.id AND dp.payment_status = 'paid'),
    0
  ) AS dividends_received_sats
FROM path402_holdings h
JOIN path402_tokens t ON h.token_id = t.id
WHERE h.registered = true
  AND h.withdrawn = false
  AND (t.confers_dividends = true OR t.confers_voting = true)
ORDER BY t.dollar_address, h.position;

COMMENT ON VIEW v_registry IS 'Public cap table showing registered holders of equity-class tokens';
