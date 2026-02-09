-- Exchange Order Book Migration
-- Created: 2026-02-01
-- Purpose: Order book for centralized exchange with Kintsugi AI matching

-- Order book table
CREATE TABLE IF NOT EXISTS exchange_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_handle TEXT,  -- HandCash handle for display
  token_id TEXT NOT NULL,  -- BSV-20 token ID
  token_symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  amount BIGINT NOT NULL CHECK (amount > 0),
  price_sats BIGINT NOT NULL CHECK (price_sats > 0),  -- Price per token in satoshis
  filled_amount BIGINT DEFAULT 0 CHECK (filled_amount >= 0),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'partial', 'filled', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Trade history table
CREATE TABLE IF NOT EXISTS exchange_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buy_order_id UUID REFERENCES exchange_orders(id) ON DELETE SET NULL,
  sell_order_id UUID REFERENCES exchange_orders(id) ON DELETE SET NULL,
  token_id TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  amount BIGINT NOT NULL CHECK (amount > 0),
  price_sats BIGINT NOT NULL CHECK (price_sats > 0),
  total_sats BIGINT NOT NULL,  -- amount * price_sats
  buyer_id TEXT NOT NULL,
  buyer_handle TEXT,
  seller_id TEXT NOT NULL,
  seller_handle TEXT,
  tx_hash TEXT,  -- BSV transaction hash if on-chain settlement
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  settled_at TIMESTAMPTZ,
  settlement_type TEXT DEFAULT 'offchain' CHECK (settlement_type IN ('offchain', 'onchain', 'pending'))
);

-- User clearing balances (sats held for trading)
CREATE TABLE IF NOT EXISTS exchange_clearing_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  user_handle TEXT,
  available_sats BIGINT DEFAULT 0 CHECK (available_sats >= 0),
  locked_sats BIGINT DEFAULT 0 CHECK (locked_sats >= 0),  -- Locked in open orders
  total_deposited BIGINT DEFAULT 0,
  total_withdrawn BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User token balances (internal ledger, mirrors on-chain)
CREATE TABLE IF NOT EXISTS exchange_token_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_handle TEXT,
  token_id TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  available_amount BIGINT DEFAULT 0 CHECK (available_amount >= 0),
  locked_amount BIGINT DEFAULT 0 CHECK (locked_amount >= 0),  -- Locked in open sell orders
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token_id)
);

-- Matching queue for Kintsugi to process
CREATE TABLE IF NOT EXISTS exchange_match_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES exchange_orders(id) ON DELETE CASCADE,
  token_id TEXT NOT NULL,
  priority INTEGER DEFAULT 0,  -- Higher = process first
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_orders_token_status ON exchange_orders(token_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON exchange_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_side_price ON exchange_orders(token_id, side, price_sats);
CREATE INDEX IF NOT EXISTS idx_orders_created ON exchange_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_open_buys ON exchange_orders(token_id, price_sats DESC) WHERE side = 'buy' AND status IN ('open', 'partial');
CREATE INDEX IF NOT EXISTS idx_orders_open_sells ON exchange_orders(token_id, price_sats ASC) WHERE side = 'sell' AND status IN ('open', 'partial');

CREATE INDEX IF NOT EXISTS idx_trades_token ON exchange_trades(token_id);
CREATE INDEX IF NOT EXISTS idx_trades_buyer ON exchange_trades(buyer_id);
CREATE INDEX IF NOT EXISTS idx_trades_seller ON exchange_trades(seller_id);
CREATE INDEX IF NOT EXISTS idx_trades_executed ON exchange_trades(executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_clearing_user ON exchange_clearing_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_token_balances_user ON exchange_token_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_token_balances_token ON exchange_token_balances(token_id);

CREATE INDEX IF NOT EXISTS idx_match_queue_pending ON exchange_match_queue(token_id, status, priority DESC) WHERE status = 'pending';

-- Updated_at trigger function (reuse if exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_exchange_orders_updated_at ON exchange_orders;
CREATE TRIGGER update_exchange_orders_updated_at
    BEFORE UPDATE ON exchange_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_exchange_clearing_balances_updated_at ON exchange_clearing_balances;
CREATE TRIGGER update_exchange_clearing_balances_updated_at
    BEFORE UPDATE ON exchange_clearing_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_exchange_token_balances_updated_at ON exchange_token_balances;
CREATE TRIGGER update_exchange_token_balances_updated_at
    BEFORE UPDATE ON exchange_token_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE exchange_orders IS 'Order book entries for buy/sell orders';
COMMENT ON TABLE exchange_trades IS 'Executed trade history between matched orders';
COMMENT ON TABLE exchange_clearing_balances IS 'User satoshi balances for trading';
COMMENT ON TABLE exchange_token_balances IS 'User token balances (internal ledger)';
COMMENT ON TABLE exchange_match_queue IS 'Queue for Kintsugi AI to process order matching';
COMMENT ON COLUMN exchange_orders.price_sats IS 'Price per single token unit in satoshis';
COMMENT ON COLUMN exchange_orders.filled_amount IS 'Amount already filled, remaining = amount - filled_amount';
