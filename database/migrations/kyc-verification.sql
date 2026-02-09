-- Create KYC verification table for shareholder identity verification
-- Required for dividend payouts and withdrawals

CREATE TABLE IF NOT EXISTS user_kyc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Personal Information
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,

  -- Uploaded Documents (base64 encoded for security)
  id_document_base64 TEXT NOT NULL,
  id_document_filename TEXT NOT NULL,
  id_document_mimetype TEXT NOT NULL,

  proof_of_address_base64 TEXT NOT NULL,
  proof_of_address_filename TEXT NOT NULL,
  proof_of_address_mimetype TEXT NOT NULL,

  -- Verification Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by TEXT, -- Admin who verified (email or user_id)
  rejected_reason TEXT,

  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN ('pending', 'verified', 'rejected')),
  CONSTRAINT age_check CHECK (date_of_birth < CURRENT_DATE)
);

-- Index for quick status lookups
CREATE INDEX IF NOT EXISTS idx_user_kyc_status ON user_kyc(status);
CREATE INDEX IF NOT EXISTS idx_user_kyc_user_id ON user_kyc(user_id);
CREATE INDEX IF NOT EXISTS idx_user_kyc_submitted_at ON user_kyc(submitted_at DESC);

-- Comment for clarity
COMMENT ON TABLE user_kyc IS 'Know Your Customer (KYC) verification records for $bWriter shareholders. Required for dividend payouts and withdrawals per UK Register of Members regulations.';
COMMENT ON COLUMN user_kyc.id_document_base64 IS 'Base64-encoded government-issued ID (passport, driving license, national ID)';
COMMENT ON COLUMN user_kyc.proof_of_address_base64 IS 'Base64-encoded proof of address (utility bill, bank statement, council tax document)';
COMMENT ON COLUMN user_kyc.status IS 'Verification status: pending (awaiting manual review), verified (approved for dividends), rejected (failed verification)';
