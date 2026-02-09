-- Create investor_certifications table for UK FCA exemption self-certification
-- Enables compliant share sales to High Net Worth and Sophisticated Investors

CREATE TABLE IF NOT EXISTS public.investor_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Certification type: 'high_net_worth' or 'sophisticated'
  certification_type VARCHAR(50) NOT NULL,

  -- High Net Worth criteria
  income_threshold_met BOOLEAN DEFAULT FALSE,
  assets_threshold_met BOOLEAN DEFAULT FALSE,

  -- Sophisticated Investor criteria
  angel_network_member BOOLEAN DEFAULT FALSE,
  previous_investments_count INTEGER DEFAULT 0,
  relevant_work_experience TEXT,
  director_of_qualifying_co BOOLEAN DEFAULT FALSE,

  -- The signed statement
  statement_text TEXT NOT NULL,
  full_name VARCHAR(255) NOT NULL,

  -- Cryptographic proof
  signed_at TIMESTAMPTZ NOT NULL,
  wallet_address VARCHAR(255) NOT NULL,
  signature_hash TEXT NOT NULL,
  inscription_txid TEXT,

  -- Validity period (12 months per FCA guidance)
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,

  -- Optional Veriff integration
  veriff_session_id TEXT,
  veriff_status VARCHAR(50),
  veriff_verified_at TIMESTAMPTZ,

  -- Audit trail
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_certification_type CHECK (certification_type IN ('high_net_worth', 'sophisticated')),
  CONSTRAINT valid_veriff_status CHECK (veriff_status IS NULL OR veriff_status IN ('pending', 'approved', 'rejected', 'expired'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_investor_cert_user_id ON public.investor_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_investor_cert_valid_until ON public.investor_certifications(valid_until);
CREATE INDEX IF NOT EXISTS idx_investor_cert_type ON public.investor_certifications(certification_type);

-- Enable Row Level Security
ALTER TABLE public.investor_certifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own certifications
CREATE POLICY "Users can read own certifications"
  ON public.investor_certifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own certifications
CREATE POLICY "Users can create own certifications"
  ON public.investor_certifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users cannot update certifications (immutable once signed)
-- Only admins via service role can update (for Veriff status, revocation)

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_investor_certification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_investor_certifications_updated_at
  BEFORE UPDATE ON public.investor_certifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_investor_certification_updated_at();

-- Add comment for documentation
COMMENT ON TABLE public.investor_certifications IS 'Self-certification records for UK FCA exemptions (High Net Worth / Sophisticated Investor). Used to enable compliant share sales without FCA registration.';
