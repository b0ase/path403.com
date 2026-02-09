-- Multi-Token Account System
-- Run this in Supabase SQL Editor
--
-- Creates tables for:
-- - venture_tokens: Portfolio company token definitions
-- - user_token_balances: User balances per token
-- - token_purchases: Purchase records
-- - withdrawal_requests: On-chain withdrawal requests

-- ============================================
-- VENTURE TOKENS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.venture_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  -- Token economics
  total_supply BIGINT DEFAULT 1000000000,
  price_usd DECIMAL(20, 8) DEFAULT 0.024,
  price_gbp DECIMAL(20, 8),

  -- On-chain details
  blockchain TEXT DEFAULT 'BSV',
  token_id TEXT,
  is_deployed BOOLEAN DEFAULT false,
  deploy_txid TEXT,

  -- Platform tracking
  tokens_sold BIGINT DEFAULT 0,
  tokens_available BIGINT DEFAULT 1000000000,
  treasury_balance DECIMAL(20, 2) DEFAULT 0,

  -- Link to portfolio
  portfolio_slug TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venture_tokens_ticker ON public.venture_tokens(ticker);
CREATE INDEX IF NOT EXISTS idx_venture_tokens_portfolio_slug ON public.venture_tokens(portfolio_slug);

-- ============================================
-- USER TOKEN BALANCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_token_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token_id UUID NOT NULL REFERENCES public.venture_tokens(id) ON DELETE CASCADE,

  -- Balances
  balance BIGINT DEFAULT 0,
  total_purchased BIGINT DEFAULT 0,
  total_withdrawn BIGINT DEFAULT 0,
  total_received BIGINT DEFAULT 0,
  total_sent BIGINT DEFAULT 0,

  -- Investment tracking
  total_invested_usd DECIMAL(20, 2) DEFAULT 0,
  average_buy_price DECIMAL(20, 8),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, token_id)
);

CREATE INDEX IF NOT EXISTS idx_user_token_balances_user_id ON public.user_token_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_token_balances_token_id ON public.user_token_balances(token_id);

-- ============================================
-- TOKEN PURCHASES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.token_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token_id UUID NOT NULL REFERENCES public.venture_tokens(id),

  -- Purchase details
  token_amount BIGINT NOT NULL,
  usd_amount DECIMAL(20, 2) NOT NULL,
  price_per_token DECIMAL(20, 8) NOT NULL,

  -- Payment
  payment_method TEXT NOT NULL,
  payment_currency TEXT DEFAULT 'USD',
  payment_amount DECIMAL(30, 8) NOT NULL,

  -- Stripe
  stripe_session_id TEXT,
  stripe_payment_id TEXT,

  -- Crypto
  crypto_address TEXT,
  crypto_txid TEXT,

  -- Status
  status TEXT DEFAULT 'pending',
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_token_purchases_user_id ON public.token_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_token_purchases_token_id ON public.token_purchases(token_id);
CREATE INDEX IF NOT EXISTS idx_token_purchases_status ON public.token_purchases(status);
CREATE INDEX IF NOT EXISTS idx_token_purchases_stripe_session ON public.token_purchases(stripe_session_id);

-- ============================================
-- WITHDRAWAL REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token_id UUID NOT NULL REFERENCES public.venture_tokens(id),

  -- Request details
  amount BIGINT NOT NULL,
  destination TEXT NOT NULL,
  blockchain TEXT NOT NULL,

  -- Status
  status TEXT DEFAULT 'pending',

  -- Review
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Execution
  txid TEXT,
  executed_at TIMESTAMPTZ,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON public.withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_token_id ON public.withdrawal_requests(token_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);

-- ============================================
-- ENABLE RLS (Row Level Security)
-- ============================================
ALTER TABLE public.venture_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Policies: venture_tokens readable by all, editable by service role only
CREATE POLICY "venture_tokens_read" ON public.venture_tokens FOR SELECT USING (true);

-- Policies: user_token_balances - users can read their own
CREATE POLICY "user_token_balances_read_own" ON public.user_token_balances
  FOR SELECT USING (auth.uid()::text = user_id::text OR auth.jwt() ->> 'role' = 'service_role');

-- Policies: token_purchases - users can read their own
CREATE POLICY "token_purchases_read_own" ON public.token_purchases
  FOR SELECT USING (auth.uid()::text = user_id::text OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "token_purchases_insert_own" ON public.token_purchases
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text OR auth.jwt() ->> 'role' = 'service_role');

-- Policies: withdrawal_requests - users can read/insert their own
CREATE POLICY "withdrawal_requests_read_own" ON public.withdrawal_requests
  FOR SELECT USING (auth.uid()::text = user_id::text OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "withdrawal_requests_insert_own" ON public.withdrawal_requests
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text OR auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- SEED $BOASE TOKEN
-- ============================================
INSERT INTO public.venture_tokens (
  ticker, name, description,
  total_supply, price_usd, price_gbp,
  blockchain, is_deployed, is_public, is_active,
  portfolio_slug
) VALUES (
  'BOASE', 'b0ase.com Index Token',
  'Index token representing ownership in the b0ase.com venture studio portfolio',
  1000000000, 0.024, 0.019,
  'BSV', true, true, true,
  'boase-index'
) ON CONFLICT (ticker) DO UPDATE SET
  price_usd = EXCLUDED.price_usd,
  is_active = true,
  updated_at = NOW();

-- Done!
SELECT 'Multi-token system tables created successfully!' as result;
