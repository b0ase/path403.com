-- BitSign Tables Migration
-- Blockchain-verified document signing for b0ase.com
-- Created: 2026-01-26

-- ============================================================================
-- USER SIGNATURES TABLE
-- Stores reusable signatures (drawn or typed) for users
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Signature identity
  signature_name VARCHAR(100) DEFAULT 'Default',
  signature_type VARCHAR(20) NOT NULL CHECK (signature_type IN ('drawn', 'typed')),

  -- Drawn signature data
  svg_data TEXT,
  svg_thumbnail TEXT,

  -- Typed signature data
  typed_text VARCHAR(255),
  typed_font VARCHAR(100) DEFAULT 'dancing-script',

  -- Wallet verification
  wallet_type VARCHAR(20),
  wallet_address VARCHAR(255),
  verification_message TEXT,
  wallet_signature TEXT,

  -- BSV inscription
  inscription_txid VARCHAR(100),
  inscription_url VARCHAR(500),
  inscribed_at TIMESTAMPTZ,

  -- Status
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_user_signatures_user ON public.user_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_user_signatures_default ON public.user_signatures(user_id, is_default) WHERE is_default = true;

-- ============================================================================
-- DOCUMENT SIGNATURES TABLE
-- Records each document signing event
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.document_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who signed
  signer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signature_id UUID NOT NULL REFERENCES public.user_signatures(id),

  -- What was signed
  document_type VARCHAR(50) NOT NULL, -- e.g., 'contract', 'agreement', 'invoice'
  document_id UUID, -- Reference to the specific document (contracts, agreements, etc.)
  document_hash VARCHAR(128) NOT NULL, -- SHA-256 of document content
  document_title VARCHAR(255),

  -- Cryptographic proof
  message_signed TEXT NOT NULL, -- The full message that was signed
  wallet_signature TEXT NOT NULL, -- The cryptographic signature from wallet
  wallet_address VARCHAR(255) NOT NULL,
  wallet_type VARCHAR(20) NOT NULL,

  -- Signing timestamp
  signed_at TIMESTAMPTZ DEFAULT NOW(),

  -- BSV inscription (optional immutable proof)
  inscription_txid VARCHAR(100),
  inscription_url VARCHAR(500),
  inscribed_at TIMESTAMPTZ,

  -- Status
  status VARCHAR(20) DEFAULT 'signed' CHECK (status IN ('signed', 'revoked', 'expired')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lookups
CREATE INDEX IF NOT EXISTS idx_doc_signatures_signer ON public.document_signatures(signer_user_id);
CREATE INDEX IF NOT EXISTS idx_doc_signatures_hash ON public.document_signatures(document_hash);
CREATE INDEX IF NOT EXISTS idx_doc_signatures_document ON public.document_signatures(document_type, document_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.user_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;

-- Users can manage their own signatures
DROP POLICY IF EXISTS "Users manage own signatures" ON public.user_signatures;
CREATE POLICY "Users manage own signatures" ON public.user_signatures
  FOR ALL USING (auth.uid() = user_id);

-- Users can view their own document signatures
DROP POLICY IF EXISTS "Users view own doc signatures" ON public.document_signatures;
CREATE POLICY "Users view own doc signatures" ON public.document_signatures
  FOR SELECT USING (auth.uid() = signer_user_id);

-- Users can create their own document signatures
DROP POLICY IF EXISTS "Users create doc signatures" ON public.document_signatures;
CREATE POLICY "Users create doc signatures" ON public.document_signatures
  FOR INSERT WITH CHECK (auth.uid() = signer_user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger for user_signatures
CREATE OR REPLACE FUNCTION update_user_signatures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_signatures_updated_at ON public.user_signatures;
CREATE TRIGGER trigger_user_signatures_updated_at
  BEFORE UPDATE ON public.user_signatures
  FOR EACH ROW
  EXECUTE FUNCTION update_user_signatures_updated_at();

-- Ensure only one default signature per user
CREATE OR REPLACE FUNCTION ensure_single_default_signature()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.user_signatures
    SET is_default = false
    WHERE user_id = NEW.user_id AND id != NEW.id AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_single_default_signature ON public.user_signatures;
CREATE TRIGGER trigger_single_default_signature
  BEFORE INSERT OR UPDATE ON public.user_signatures
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_signature();

-- ============================================================================
-- GRANT PERMISSIONS (for service role access)
-- ============================================================================

GRANT ALL ON public.user_signatures TO service_role;
GRANT ALL ON public.document_signatures TO service_role;
GRANT SELECT ON public.user_signatures TO authenticated;
GRANT SELECT ON public.document_signatures TO authenticated;
