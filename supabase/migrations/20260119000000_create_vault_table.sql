-- Create vault table for 2-of-2 multisig investor custody
-- This table stores the multisig vault information for each investor
-- Key 1: Investor's wallet (they control)
-- Key 2: b0ase.com platform key (we control)
-- Both signatures required for any token transfer

CREATE TABLE IF NOT EXISTS public.vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.unified_users(id) ON DELETE CASCADE,
    address VARCHAR(100) NOT NULL UNIQUE, -- P2SH multisig address
    redeem_script TEXT NOT NULL, -- Hex encoded redeem script
    user_public_key VARCHAR(130) NOT NULL, -- Key 1 - Investor's wallet key
    app_public_key VARCHAR(130) NOT NULL, -- Key 2 - b0ase.com platform key
    app_key_path VARCHAR(50) NOT NULL, -- Derivation path for platform key
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_vault_user_id ON public.vault(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_address ON public.vault(address);

-- Enable RLS
ALTER TABLE public.vault ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own vault
CREATE POLICY "Users can view own vault" ON public.vault
    FOR SELECT
    USING (
        user_id IN (
            SELECT id FROM public.unified_users
            WHERE id = auth.uid()::uuid
        )
        OR
        -- Also allow if user has a linked identity
        user_id IN (
            SELECT unified_user_id FROM public.user_identities
            WHERE provider_user_id = auth.uid()::text
        )
    );

-- Policy: Only service role can insert/update vaults (via API)
CREATE POLICY "Service role can manage vaults" ON public.vault
    FOR ALL
    USING (auth.role() = 'service_role');

-- Comment on table
COMMENT ON TABLE public.vault IS '2-of-2 multisig custody vaults for investor token holdings. Both investor and platform keys required for transfers.';
COMMENT ON COLUMN public.vault.address IS 'P2SH address derived from 2-of-2 multisig script';
COMMENT ON COLUMN public.vault.redeem_script IS 'Hex-encoded Bitcoin script for spending from multisig';
COMMENT ON COLUMN public.vault.user_public_key IS 'Investor wallet public key (they control)';
COMMENT ON COLUMN public.vault.app_public_key IS 'Platform public key (b0ase controls)';
