-- M2M Infrastructure Migration
-- Implements: Event Capture, UTXO Metering, Batch Commits, Anchor Mappings

-- ============================================
-- EVENT CAPTURE QUEUE
-- ============================================

CREATE TYPE event_source AS ENUM (
  'stripe',
  'paypal',
  'eth',
  'sol',
  'bsv',
  'handcash',
  'webhook',
  'agent',
  'api'
);

CREATE TYPE event_status AS ENUM (
  'captured',
  'normalised',
  'queued',
  'batched',
  'committed',
  'failed'
);

-- All external events land here first
CREATE TABLE IF NOT EXISTS captured_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source identification
  source event_source NOT NULL,
  source_id VARCHAR(255) NOT NULL,  -- External ID (payment_intent, tx_hash, etc.)
  event_type VARCHAR(100) NOT NULL,  -- payment.completed, tx.confirmed, etc.

  -- Raw payload
  raw_payload JSONB NOT NULL,

  -- Normalised data (after processing)
  normalised_payload JSONB,
  content_hash VARCHAR(64),  -- SHA256 of normalised payload

  -- Processing status
  status event_status DEFAULT 'captured',

  -- Commit tracking
  batch_id UUID,
  commit_txid VARCHAR(100),
  commit_vout INT,

  -- Timestamps
  event_timestamp TIMESTAMPTZ NOT NULL,  -- When event occurred
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  normalised_at TIMESTAMPTZ,
  committed_at TIMESTAMPTZ,

  -- Error tracking
  error_message TEXT,
  retry_count INT DEFAULT 0,

  UNIQUE(source, source_id)
);

CREATE INDEX idx_events_status ON captured_events(status);
CREATE INDEX idx_events_source ON captured_events(source, event_type);
CREATE INDEX idx_events_batch ON captured_events(batch_id);
CREATE INDEX idx_events_hash ON captured_events(content_hash);

-- ============================================
-- COMMIT BATCHES
-- ============================================

CREATE TYPE batch_status AS ENUM (
  'pending',
  'building',
  'signed',
  'broadcast',
  'confirmed',
  'failed'
);

-- Batched commits (1 UTXO = 1000+ events)
CREATE TABLE IF NOT EXISTS commit_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Batch content
  event_count INT NOT NULL,
  merkle_root VARCHAR(64) NOT NULL,  -- Root of event hashes
  merkle_tree JSONB,  -- Full tree for proof generation

  -- Transaction
  raw_tx TEXT,
  txid VARCHAR(100),

  -- Status
  status batch_status DEFAULT 'pending',

  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  signed_at TIMESTAMPTZ,
  broadcast_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,

  -- Cost tracking
  fee_satoshis BIGINT,

  -- Error
  error_message TEXT
);

CREATE INDEX idx_batches_status ON commit_batches(status);
CREATE INDEX idx_batches_txid ON commit_batches(txid);

-- ============================================
-- UTXO METERING
-- ============================================

CREATE TYPE meter_action AS ENUM (
  'task_start',
  'task_complete',
  'api_call',
  'inscription',
  'payment',
  'transfer',
  'compute',
  'storage'
);

-- Every billable action = 1 meter entry
CREATE TABLE IF NOT EXISTS utxo_meters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What did the action
  agent_id UUID,
  user_id UUID,
  project_id UUID,

  -- Action details
  action_type meter_action NOT NULL,
  action_id VARCHAR(255),  -- External reference
  action_metadata JSONB,

  -- UTXO tracking (optional - for on-chain metering)
  utxo_txid VARCHAR(100),
  utxo_vout INT,
  satoshis_cost BIGINT DEFAULT 0,

  -- Billing
  billable_units DECIMAL(20, 8) DEFAULT 1,  -- 1 action = 1 unit by default
  unit_price_usd DECIMAL(10, 6),
  total_cost_usd DECIMAL(10, 6),

  -- Billing status
  billed BOOLEAN DEFAULT FALSE,
  invoice_id UUID,
  billed_at TIMESTAMPTZ,

  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INT,

  CONSTRAINT valid_agent_or_user CHECK (agent_id IS NOT NULL OR user_id IS NOT NULL)
);

CREATE INDEX idx_meters_agent ON utxo_meters(agent_id);
CREATE INDEX idx_meters_user ON utxo_meters(user_id);
CREATE INDEX idx_meters_billed ON utxo_meters(billed) WHERE billed = FALSE;
CREATE INDEX idx_meters_action ON utxo_meters(action_type);

-- ============================================
-- ANCHOR MAPPINGS
-- ============================================

-- Map external events to BSV proofs
CREATE TABLE IF NOT EXISTS anchor_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- External reference
  source event_source NOT NULL,
  external_id VARCHAR(255) NOT NULL,  -- Stripe pi_xxx, ETH 0x..., etc.
  external_type VARCHAR(100),  -- payment, transaction, contract, etc.

  -- BSV anchor
  bsv_txid VARCHAR(100) NOT NULL,
  bsv_vout INT DEFAULT 0,

  -- Batch info (if part of batch)
  batch_id UUID REFERENCES commit_batches(id),
  merkle_proof JSONB,  -- Proof path within batch

  -- Verification
  content_hash VARCHAR(64),
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(source, external_id)
);

CREATE INDEX idx_anchors_external ON anchor_mappings(source, external_id);
CREATE INDEX idx_anchors_bsv ON anchor_mappings(bsv_txid);

-- ============================================
-- UTXO POOL (for efficient transaction building)
-- ============================================

CREATE TYPE utxo_status AS ENUM (
  'available',
  'reserved',
  'spent',
  'consolidating'
);

-- Track platform UTXOs for inscription wallet
CREATE TABLE IF NOT EXISTS utxo_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- UTXO identifier
  txid VARCHAR(100) NOT NULL,
  vout INT NOT NULL,

  -- Value
  satoshis BIGINT NOT NULL,

  -- Address
  address VARCHAR(100) NOT NULL,
  script_hex TEXT,

  -- Status
  status utxo_status DEFAULT 'available',
  reserved_by UUID,  -- batch_id that reserved it
  reserved_at TIMESTAMPTZ,

  -- Chain confirmation
  block_height INT,
  confirmations INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  spent_at TIMESTAMPTZ,
  spent_in_txid VARCHAR(100),

  UNIQUE(txid, vout)
);

CREATE INDEX idx_utxo_status ON utxo_pool(status, satoshis DESC);
CREATE INDEX idx_utxo_address ON utxo_pool(address);

-- ============================================
-- USAGE INVOICES
-- ============================================

CREATE TYPE invoice_status AS ENUM (
  'draft',
  'pending',
  'paid',
  'failed',
  'cancelled'
);

-- Monthly usage invoices
CREATE TABLE IF NOT EXISTS usage_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who
  user_id UUID,
  agent_id UUID,
  project_id UUID,

  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Totals
  total_actions INT DEFAULT 0,
  total_units DECIMAL(20, 8) DEFAULT 0,
  total_amount_usd DECIMAL(10, 2) DEFAULT 0,

  -- Breakdown by action type
  breakdown JSONB,  -- { "api_call": {count, cost}, "inscription": {...} }

  -- Status
  status invoice_status DEFAULT 'draft',

  -- Payment
  payment_method VARCHAR(50),  -- stripe, paypal, handcash, etc.
  payment_id VARCHAR(255),
  paid_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ
);

CREATE INDEX idx_invoices_user ON usage_invoices(user_id);
CREATE INDEX idx_invoices_status ON usage_invoices(status);
CREATE INDEX idx_invoices_period ON usage_invoices(period_start, period_end);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Get available UTXOs with enough value
CREATE OR REPLACE FUNCTION get_available_utxos(
  required_satoshis BIGINT,
  max_utxos INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  txid VARCHAR(100),
  vout INT,
  satoshis BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.txid, u.vout, u.satoshis
  FROM utxo_pool u
  WHERE u.status = 'available'
    AND u.confirmations >= 1
  ORDER BY u.satoshis DESC
  LIMIT max_utxos;
END;
$$ LANGUAGE plpgsql;

-- Reserve UTXOs for a batch
CREATE OR REPLACE FUNCTION reserve_utxos_for_batch(
  p_batch_id UUID,
  p_utxo_ids UUID[]
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE utxo_pool
  SET status = 'reserved',
      reserved_by = p_batch_id,
      reserved_at = NOW()
  WHERE id = ANY(p_utxo_ids)
    AND status = 'available';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Calculate usage for billing period
CREATE OR REPLACE FUNCTION calculate_period_usage(
  p_agent_id UUID,
  p_start DATE,
  p_end DATE
)
RETURNS TABLE (
  action_type meter_action,
  count BIGINT,
  total_units DECIMAL,
  total_cost_usd DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.action_type,
    COUNT(*)::BIGINT as count,
    SUM(m.billable_units) as total_units,
    SUM(m.total_cost_usd) as total_cost_usd
  FROM utxo_meters m
  WHERE m.agent_id = p_agent_id
    AND m.started_at >= p_start
    AND m.started_at < p_end
    AND m.billed = FALSE
  GROUP BY m.action_type;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS
-- ============================================

-- Pending events ready for batching
CREATE OR REPLACE VIEW pending_batch_events AS
SELECT
  e.id,
  e.source,
  e.source_id,
  e.content_hash,
  e.normalised_payload,
  e.captured_at
FROM captured_events e
WHERE e.status = 'normalised'
  AND e.batch_id IS NULL
ORDER BY e.captured_at ASC;

-- Usage summary by agent
CREATE OR REPLACE VIEW agent_usage_summary AS
SELECT
  m.agent_id,
  m.action_type,
  DATE_TRUNC('day', m.started_at) as day,
  COUNT(*) as action_count,
  SUM(m.billable_units) as total_units,
  SUM(m.total_cost_usd) as total_cost_usd,
  SUM(m.satoshis_cost) as total_satoshis
FROM utxo_meters m
WHERE m.agent_id IS NOT NULL
GROUP BY m.agent_id, m.action_type, DATE_TRUNC('day', m.started_at);

-- Anchor verification queue
CREATE OR REPLACE VIEW unverified_anchors AS
SELECT
  a.id,
  a.source,
  a.external_id,
  a.bsv_txid,
  a.created_at
FROM anchor_mappings a
WHERE a.verified = FALSE
ORDER BY a.created_at ASC;
