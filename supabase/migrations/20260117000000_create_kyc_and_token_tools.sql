-- Token Management Tools: KYC Verifications and Token Minting
-- Supports the new /tools pages for token registry, KYC, minting, cap table, dividends, and transfers

-- Add wallet addresses to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bsv_address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS eth_address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sol_address TEXT;

-- KYC Verifications table for /tools/verify
CREATE TABLE IF NOT EXISTS public.kyc_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Personal information
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,

  -- Document uploads (Supabase storage URLs)
  government_id_front_url TEXT NOT NULL,
  government_id_back_url TEXT,
  proof_of_address_url TEXT NOT NULL,
  selfie_url TEXT,

  -- Verification status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  rejection_reason TEXT,

  -- Admin verification tracking
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Token Mint Logs table for /tools/mint
-- Tracks minting tokens to specific addresses (different from mint_logs which tracks user credits)
CREATE TABLE IF NOT EXISTS public.token_mint_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Token details
  token_symbol TEXT NOT NULL,
  amount BIGINT NOT NULL,

  -- Recipient information
  recipient_address TEXT,
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Blockchain details
  blockchain TEXT CHECK (blockchain IN ('bsv', 'eth', 'sol')),
  tx_hash TEXT,
  block_number BIGINT,

  -- Mint metadata
  mint_type TEXT DEFAULT 'manual' CHECK (mint_type IN ('manual', 'automated', 'airdrop', 'vesting')),
  notes TEXT,

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ
);

-- Row level security
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_mint_logs ENABLE ROW LEVEL SECURITY;

-- Policies for kyc_verifications
CREATE POLICY "Users can view their own KYC submissions"
  ON public.kyc_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own KYC submissions"
  ON public.kyc_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending KYC submissions"
  ON public.kyc_verifications FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Admin policies (users with role 'Admin' in profiles table)
CREATE POLICY "Admins can view all KYC submissions"
  ON public.kyc_verifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'Admin'
    )
  );

CREATE POLICY "Admins can update KYC submissions"
  ON public.kyc_verifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'Admin'
    )
  );

-- Policies for token_mint_logs
CREATE POLICY "Users can view their own mint logs"
  ON public.token_mint_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert mint logs"
  ON public.token_mint_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update mint logs"
  ON public.token_mint_logs FOR UPDATE
  USING (true);

CREATE POLICY "Admins can view all mint logs"
  ON public.token_mint_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'Admin'
    )
  );

-- Indexes for performance
CREATE INDEX idx_kyc_verifications_user ON public.kyc_verifications(user_id);
CREATE INDEX idx_kyc_verifications_status ON public.kyc_verifications(status);
CREATE INDEX idx_kyc_verifications_verified_by ON public.kyc_verifications(verified_by);

CREATE INDEX idx_token_mint_logs_user ON public.token_mint_logs(user_id);
CREATE INDEX idx_token_mint_logs_token ON public.token_mint_logs(token_symbol);
CREATE INDEX idx_token_mint_logs_status ON public.token_mint_logs(status);
CREATE INDEX idx_token_mint_logs_blockchain ON public.token_mint_logs(blockchain);
CREATE INDEX idx_token_mint_logs_recipient_user ON public.token_mint_logs(recipient_user_id);

CREATE INDEX idx_profiles_bsv_address ON public.profiles(bsv_address) WHERE bsv_address IS NOT NULL;
CREATE INDEX idx_profiles_eth_address ON public.profiles(eth_address) WHERE eth_address IS NOT NULL;
CREATE INDEX idx_profiles_sol_address ON public.profiles(sol_address) WHERE sol_address IS NOT NULL;

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_kyc_verification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_token_mint_log_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_kyc_verifications_updated_at
  BEFORE UPDATE ON public.kyc_verifications
  FOR EACH ROW EXECUTE FUNCTION update_kyc_verification_updated_at();

-- Function to approve KYC verification (called by admin)
CREATE OR REPLACE FUNCTION approve_kyc_verification(
  p_kyc_id UUID,
  p_admin_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user_id from KYC record
  SELECT user_id INTO v_user_id
  FROM public.kyc_verifications
  WHERE id = p_kyc_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'KYC verification not found';
  END IF;

  -- Update KYC verification status
  UPDATE public.kyc_verifications
  SET
    status = 'verified',
    verified_at = NOW(),
    verified_by = p_admin_id,
    updated_at = NOW()
  WHERE id = p_kyc_id;

  -- Update cap_table_shareholders kyc_status for this user
  UPDATE public.cap_table_shareholders
  SET
    kyc_status = 'verified',
    kyc_verified_at = NOW()
  WHERE email IN (
    SELECT email FROM public.profiles WHERE id = v_user_id
  ) OR wallet_address IN (
    SELECT bsv_address FROM public.profiles WHERE id = v_user_id
    UNION
    SELECT eth_address FROM public.profiles WHERE id = v_user_id
    UNION
    SELECT sol_address FROM public.profiles WHERE id = v_user_id
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject KYC verification
CREATE OR REPLACE FUNCTION reject_kyc_verification(
  p_kyc_id UUID,
  p_admin_id UUID,
  p_reason TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.kyc_verifications
  SET
    status = 'rejected',
    rejection_reason = p_reason,
    verified_by = p_admin_id,
    updated_at = NOW()
  WHERE id = p_kyc_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE public.kyc_verifications IS 'KYC verification submissions for token holders';
COMMENT ON TABLE public.token_mint_logs IS 'Audit log for token minting operations to specific addresses';
COMMENT ON COLUMN public.profiles.bsv_address IS 'User''s Bitcoin SV wallet address';
COMMENT ON COLUMN public.profiles.eth_address IS 'User''s Ethereum wallet address';
COMMENT ON COLUMN public.profiles.sol_address IS 'User''s Solana wallet address';
