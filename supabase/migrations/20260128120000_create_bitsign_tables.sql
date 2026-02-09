-- Create user_signatures table
CREATE TABLE IF NOT EXISTS user_signatures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    signature_name TEXT DEFAULT 'Default',
    signature_type TEXT NOT NULL CHECK (signature_type IN ('drawn', 'typed', 'upload')),
    svg_data TEXT,
    svg_thumbnail TEXT,
    image_data TEXT,
    typed_text TEXT,
    typed_font TEXT,
    wallet_type TEXT,
    wallet_address TEXT,
    verification_message TEXT,
    wallet_signature TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user_signatures
CREATE INDEX IF NOT EXISTS idx_user_signatures_user_id ON user_signatures(user_id);

-- Create document_signatures table (history)
CREATE TABLE IF NOT EXISTS document_signatures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    signer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    signature_id UUID REFERENCES user_signatures(id) ON DELETE SET NULL,
    document_type TEXT, -- 'pdf', 'text', etc
    document_id TEXT, -- external ID if applicable
    document_hash TEXT,
    document_title TEXT,
    wallet_address TEXT,
    wallet_type TEXT,
    signed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Inscription details
    inscription_txid TEXT,
    inscription_url TEXT,
    inscribed_at TIMESTAMPTZ,
    
    status TEXT DEFAULT 'signed' CHECK (status IN ('signed', 'inscribing', 'inscribed', 'failed'))
);

-- Index for document_signatures
CREATE INDEX IF NOT EXISTS idx_document_signatures_signer ON document_signatures(signer_user_id);
CREATE INDEX IF NOT EXISTS idx_document_signatures_hash ON document_signatures(document_hash);

-- Create certificates table for bit/certificates
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  serial_number TEXT NOT NULL UNIQUE,
  shareholder_name TEXT NOT NULL,
  share_class TEXT NOT NULL,
  share_amount NUMERIC NOT NULL,
  director_signature_id UUID REFERENCES user_signatures(id),
  issuance_date TIMESTAMPTZ DEFAULT NOW(),
  pdf_url TEXT,
  pdf_hash TEXT,
  director_wallet_signature TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'redeemed')),
  inscription_txid TEXT,
  inscription_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Index for certificates
CREATE INDEX IF NOT EXISTS certificates_shareholder_name_idx ON certificates(shareholder_name);
CREATE INDEX IF NOT EXISTS certificates_serial_number_idx ON certificates(serial_number);

-- RLS Policies
ALTER TABLE user_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- user_signatures policies
CREATE POLICY "Users can view their own signatures" 
    ON user_signatures FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own signatures" 
    ON user_signatures FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own signatures" 
    ON user_signatures FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own signatures" 
    ON user_signatures FOR DELETE 
    USING (auth.uid() = user_id);

-- document_signatures policies
CREATE POLICY "Users can view their own document signatures" 
    ON document_signatures FOR SELECT 
    USING (auth.uid() = signer_user_id);

CREATE POLICY "Users can insert their own document signatures" 
    ON document_signatures FOR INSERT 
    WITH CHECK (auth.uid() = signer_user_id);

-- certificates policies
CREATE POLICY "Users can view certificates they created" 
    ON certificates FOR SELECT 
    USING (auth.uid() = created_by);

CREATE POLICY "Users can insert certificates" 
    ON certificates FOR INSERT 
    WITH CHECK (auth.uid() = created_by);
