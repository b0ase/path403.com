-- Add marketplace fields to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS github_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS github_stars INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS github_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS portfolio_urls TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_marketplace_developer BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS developer_availability TEXT;

-- Add marketplace fields to agents table
ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS principal_user_id UUID,
  ADD COLUMN IF NOT EXISTS is_marketplace_listed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS capabilities JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS marketplace_description TEXT;

CREATE INDEX IF NOT EXISTS idx_agents_marketplace_listed ON public.agents(is_marketplace_listed);

-- Create marketplace_contracts table
CREATE TABLE IF NOT EXISTS public.marketplace_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_slug VARCHAR(100) NOT NULL,
  client_user_id UUID NOT NULL,
  developer_user_id UUID,
  agent_id UUID,
  contract_type VARCHAR(50) DEFAULT 'service',
  title TEXT NOT NULL,
  description TEXT,
  total_amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  payment_method VARCHAR(50),
  payment_provider_id TEXT,
  escrow_status VARCHAR(50) DEFAULT 'pending',
  contract_status VARCHAR(50) DEFAULT 'draft',
  inscription_txid TEXT,
  platform_fee DECIMAL(5,2) DEFAULT 5.00,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  terms JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_marketplace_contracts_client ON public.marketplace_contracts(client_user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_contracts_developer ON public.marketplace_contracts(developer_user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_contracts_status ON public.marketplace_contracts(contract_status);
CREATE INDEX IF NOT EXISTS idx_marketplace_contracts_escrow_status ON public.marketplace_contracts(escrow_status);

-- Create contract_milestones table
CREATE TABLE IF NOT EXISTS public.contract_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.marketplace_contracts(id) ON DELETE CASCADE,
  milestone_number INTEGER DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  due_date TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  payment_txid TEXT,
  rejection_reason TEXT,
  deliverables JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milestones_contract ON public.contract_milestones(contract_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON public.contract_milestones(status);

-- Create developer_services table
CREATE TABLE IF NOT EXISTS public.developer_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  hourly_rate DECIMAL(10,2),
  fixed_price DECIMAL(15,2),
  estimated_hours INTEGER,
  skills_required TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_developer_services_developer ON public.developer_services(developer_id);
CREATE INDEX IF NOT EXISTS idx_developer_services_type ON public.developer_services(service_type);

-- Create payout_preferences table
CREATE TABLE IF NOT EXISTS public.payout_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  payout_method VARCHAR(50) DEFAULT 'stripe',
  stripe_account_id TEXT,
  paypal_email TEXT,
  crypto_currency VARCHAR(10),
  crypto_address TEXT,
  minimum_payout DECIMAL(10,2) DEFAULT 50.00,
  auto_payout_enabled BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payout_preferences_user ON public.payout_preferences(user_id);

-- Create contract_reviews table
CREATE TABLE IF NOT EXISTS public.contract_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.marketplace_contracts(id) ON DELETE CASCADE,
  reviewer_user_id UUID NOT NULL,
  reviewed_user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  would_hire_again BOOLEAN DEFAULT false,
  inscription_txid TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_contract ON public.contract_reviews(contract_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON public.contract_reviews(reviewer_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed ON public.contract_reviews(reviewed_user_id);
