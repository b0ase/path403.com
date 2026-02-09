-- Token Member Registry
-- Tracks token allocations for verified members/investors
-- Separate from user_token_balances which tracks on-platform balances
-- This tracks legal ownership for cap table and compliance purposes

CREATE TABLE IF NOT EXISTS public.token_member_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Token identification
  token_symbol TEXT NOT NULL,                    -- e.g., 'BSHEETS', 'BOASE'

  -- Member identification
  member_name TEXT NOT NULL,                     -- Full legal name
  email TEXT,                                    -- Contact email
  wallet_address TEXT,                           -- BSV/ETH/SOL address for delivery
  user_id UUID REFERENCES auth.users(id),        -- Link to platform user (if registered)

  -- Allocation details
  allocation_tokens BIGINT NOT NULL DEFAULT 0,   -- Number of tokens allocated
  allocation_percentage NUMERIC(10, 6) DEFAULT 0, -- Ownership percentage
  allocation_date TIMESTAMPTZ DEFAULT NOW(),     -- Date of allocation

  -- Purchase details
  tranche INT DEFAULT 0,                         -- Which tranche (0=seed, 1=first public, etc.)
  price_per_token NUMERIC(20, 10) DEFAULT 0,     -- Price paid per token
  total_paid NUMERIC(20, 2) DEFAULT 0,           -- Total amount paid
  currency TEXT DEFAULT 'GBP',                   -- Currency of payment
  payment_reference TEXT,                        -- Payment ID or reference

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'claimed', 'cancelled')),
  -- pending: Awaiting payment confirmation
  -- confirmed: Payment confirmed, tokens allocated
  -- claimed: Tokens transferred to wallet
  -- cancelled: Allocation cancelled/refunded

  -- Visibility
  is_public BOOLEAN DEFAULT false,               -- Show in public cap table

  -- Metadata
  notes TEXT,                                    -- Internal notes
  metadata JSONB DEFAULT '{}',                   -- Additional metadata

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT positive_allocation CHECK (allocation_tokens >= 0),
  CONSTRAINT valid_percentage CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100)
);

-- Row level security
ALTER TABLE public.token_member_registry ENABLE ROW LEVEL SECURITY;

-- Policies
-- Public can view public members
CREATE POLICY "Public members are viewable by everyone"
  ON public.token_member_registry FOR SELECT
  USING (is_public = true);

-- Authenticated users can view their own entries
CREATE POLICY "Users can view their own entries"
  ON public.token_member_registry FOR SELECT
  USING (auth.uid() = user_id);

-- System/admin can manage all entries
CREATE POLICY "System can insert entries"
  ON public.token_member_registry FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update entries"
  ON public.token_member_registry FOR UPDATE
  USING (true);

-- Indexes
CREATE INDEX idx_token_member_registry_symbol ON public.token_member_registry(token_symbol);
CREATE INDEX idx_token_member_registry_user ON public.token_member_registry(user_id);
CREATE INDEX idx_token_member_registry_wallet ON public.token_member_registry(wallet_address);
CREATE INDEX idx_token_member_registry_status ON public.token_member_registry(status);
CREATE INDEX idx_token_member_registry_public ON public.token_member_registry(is_public);

-- Trigger for updated_at
CREATE TRIGGER update_token_member_registry_updated_at
  BEFORE UPDATE ON public.token_member_registry
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert initial $BSHEETS allocation for Craig Massey (Tranche 0)
-- 1% of 1 billion = 10,000,000 tokens
-- Price: £0.00001 per token = £100 total
INSERT INTO public.token_member_registry (
  token_symbol,
  member_name,
  allocation_tokens,
  allocation_percentage,
  tranche,
  price_per_token,
  total_paid,
  currency,
  status,
  is_public,
  notes
) VALUES (
  'BSHEETS',
  'Craig Massey',
  10000000,  -- 10 million tokens = 1%
  1.0,       -- 1%
  0,         -- Tranche 0 (seed)
  0.00001,   -- £0.00001 per token
  100,       -- £100 total
  'GBP',
  'confirmed',
  false,     -- Private for now
  'Tranche 0 investor via The Bitcoin Corporation share certificate. 1% allocation as part of bApps ecosystem investment.'
);
