-- $bWriter Revenue Tracking
--
-- Tracks accumulated revenue from platform usage (saves, transactions, etc)
-- Revenue source: BitcoinWriter save fees, Bitcoin Corp payments, etc.
--
-- Economics:
-- - 75% goes to dividend pool (distributed to stakers)
-- - 25% is platform fee (retained)
--

CREATE TABLE IF NOT EXISTS bwriter_revenue_accumulated (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Revenue source
  revenue_source TEXT NOT NULL, -- 'bitcoin_writer_save', 'bitcoin_corp_fee', 'manual_deposit', 'other'
  source_reference TEXT, -- Transaction ID, payment ID, etc for tracing

  -- Amount in satoshis
  amount_satoshis BIGINT NOT NULL,

  -- Period tracking
  revenue_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_distributed_at TIMESTAMP WITH TIME ZONE,

  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'distributed', 'reversed'

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_bwriter_revenue_source ON bwriter_revenue_accumulated(revenue_source);
CREATE INDEX IF NOT EXISTS idx_bwriter_revenue_status ON bwriter_revenue_accumulated(status);
CREATE INDEX IF NOT EXISTS idx_bwriter_revenue_created_at ON bwriter_revenue_accumulated(created_at DESC);

-- Comment
COMMENT ON TABLE bwriter_revenue_accumulated IS 'Revenue ledger for $bWriter staking dividends. 75% distributed to stakers, 25% retained by platform.';
COMMENT ON COLUMN bwriter_revenue_accumulated.revenue_source IS 'Source of revenue: bitcoin_writer_save (users paying to save documents), bitcoin_corp_fee (Bitcoin Corp services), manual_deposit (admin deposits for testing), other';
COMMENT ON COLUMN bwriter_revenue_accumulated.amount_satoshis IS 'Revenue amount in satoshis (smallest Bitcoin unit)';
