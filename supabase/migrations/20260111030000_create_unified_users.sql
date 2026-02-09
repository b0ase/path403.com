-- Unified users table - our internal user records that can be accessed via any auth method
CREATE TABLE IF NOT EXISTS unified_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name TEXT,
    primary_email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- For merged/tombstoned accounts - points to the surviving account
    merged_into_id UUID REFERENCES unified_users(id) ON DELETE SET NULL
);

-- User identities - links all auth methods to unified users
-- Each identity (Google, Twitter, HandCash, MetaMask, etc.) links to one unified user
CREATE TABLE IF NOT EXISTS user_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unified_user_id UUID NOT NULL REFERENCES unified_users(id) ON DELETE CASCADE,

    -- Provider info
    provider TEXT NOT NULL CHECK (provider IN (
        'supabase',      -- Supabase OAuth (Google, Twitter, Discord, GitHub, LinkedIn)
        'handcash',      -- HandCash wallet
        'phantom',       -- Phantom wallet (Solana)
        'metamask',      -- MetaMask wallet (Ethereum)
        'yours',         -- Yours wallet (BSV)
        'okx'            -- OKX wallet
    )),
    provider_user_id TEXT NOT NULL,  -- Supabase user UUID, wallet address, or handle

    -- Optional metadata
    provider_email TEXT,
    provider_handle TEXT,            -- e.g., $boase for HandCash, @username for Twitter
    provider_data JSONB DEFAULT '{}', -- Additional provider-specific data

    -- For Supabase OAuth, store which specific provider (google, twitter, etc.)
    oauth_provider TEXT,  -- 'google', 'twitter', 'discord', 'github', 'linkedin'

    linked_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ DEFAULT NOW(),

    -- Each provider+provider_user_id combo can only exist once
    UNIQUE(provider, provider_user_id)
);

-- Update existing tables to reference unified_users instead of auth.users
-- We'll add a unified_user_id column to companies and keep user_id for backward compat

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS unified_user_id UUID REFERENCES unified_users(id) ON DELETE CASCADE;

ALTER TABLE identity_tokens
ADD COLUMN IF NOT EXISTS unified_user_id UUID REFERENCES unified_users(id) ON DELETE CASCADE;

-- RLS Policies for unified_users
ALTER TABLE unified_users ENABLE ROW LEVEL SECURITY;

-- Users can view their own unified user record (via their identity)
CREATE POLICY "Users can view own unified user" ON unified_users
    FOR SELECT USING (
        id IN (
            SELECT unified_user_id FROM user_identities
            WHERE (provider = 'supabase' AND provider_user_id = auth.uid()::text)
        )
        OR merged_into_id IN (
            SELECT unified_user_id FROM user_identities
            WHERE (provider = 'supabase' AND provider_user_id = auth.uid()::text)
        )
    );

-- Users can update their own unified user record
CREATE POLICY "Users can update own unified user" ON unified_users
    FOR UPDATE USING (
        id IN (
            SELECT unified_user_id FROM user_identities
            WHERE (provider = 'supabase' AND provider_user_id = auth.uid()::text)
        )
    );

-- RLS Policies for user_identities
ALTER TABLE user_identities ENABLE ROW LEVEL SECURITY;

-- Users can view identities linked to their unified user
CREATE POLICY "Users can view own identities" ON user_identities
    FOR SELECT USING (
        unified_user_id IN (
            SELECT unified_user_id FROM user_identities
            WHERE (provider = 'supabase' AND provider_user_id = auth.uid()::text)
        )
    );

-- Users can insert identities for their unified user
CREATE POLICY "Users can link identities" ON user_identities
    FOR INSERT WITH CHECK (
        unified_user_id IN (
            SELECT unified_user_id FROM user_identities
            WHERE (provider = 'supabase' AND provider_user_id = auth.uid()::text)
        )
    );

-- Users can delete their own identities (unlink)
CREATE POLICY "Users can unlink identities" ON user_identities
    FOR DELETE USING (
        unified_user_id IN (
            SELECT unified_user_id FROM user_identities
            WHERE (provider = 'supabase' AND provider_user_id = auth.uid()::text)
        )
    );

-- Update companies RLS to use unified_user_id
DROP POLICY IF EXISTS "Users can view own companies" ON companies;
DROP POLICY IF EXISTS "Users can insert own companies" ON companies;
DROP POLICY IF EXISTS "Users can update own companies" ON companies;

CREATE POLICY "Users can view own companies" ON companies
    FOR SELECT USING (
        user_id = auth.uid()
        OR unified_user_id IN (
            SELECT unified_user_id FROM user_identities
            WHERE (provider = 'supabase' AND provider_user_id = auth.uid()::text)
        )
    );

CREATE POLICY "Users can insert own companies" ON companies
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        OR unified_user_id IN (
            SELECT unified_user_id FROM user_identities
            WHERE (provider = 'supabase' AND provider_user_id = auth.uid()::text)
        )
    );

CREATE POLICY "Users can update own companies" ON companies
    FOR UPDATE USING (
        user_id = auth.uid()
        OR unified_user_id IN (
            SELECT unified_user_id FROM user_identities
            WHERE (provider = 'supabase' AND provider_user_id = auth.uid()::text)
        )
    );

-- Update identity_tokens RLS to use unified_user_id
DROP POLICY IF EXISTS "Users can view own identity tokens" ON identity_tokens;
DROP POLICY IF EXISTS "Users can insert own identity tokens" ON identity_tokens;
DROP POLICY IF EXISTS "Users can update own identity tokens" ON identity_tokens;
DROP POLICY IF EXISTS "Users can delete own identity tokens" ON identity_tokens;

CREATE POLICY "Users can view own identity tokens" ON identity_tokens
    FOR SELECT USING (
        user_id = auth.uid()
        OR unified_user_id IN (
            SELECT unified_user_id FROM user_identities
            WHERE (provider = 'supabase' AND provider_user_id = auth.uid()::text)
        )
    );

CREATE POLICY "Users can insert own identity tokens" ON identity_tokens
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        OR unified_user_id IN (
            SELECT unified_user_id FROM user_identities
            WHERE (provider = 'supabase' AND provider_user_id = auth.uid()::text)
        )
    );

CREATE POLICY "Users can update own identity tokens" ON identity_tokens
    FOR UPDATE USING (
        user_id = auth.uid()
        OR unified_user_id IN (
            SELECT unified_user_id FROM user_identities
            WHERE (provider = 'supabase' AND provider_user_id = auth.uid()::text)
        )
    );

CREATE POLICY "Users can delete own identity tokens" ON identity_tokens
    FOR DELETE USING (
        user_id = auth.uid()
        OR unified_user_id IN (
            SELECT unified_user_id FROM user_identities
            WHERE (provider = 'supabase' AND provider_user_id = auth.uid()::text)
        )
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_identities_unified_user ON user_identities(unified_user_id);
CREATE INDEX IF NOT EXISTS idx_user_identities_provider ON user_identities(provider, provider_user_id);
CREATE INDEX IF NOT EXISTS idx_unified_users_merged ON unified_users(merged_into_id) WHERE merged_into_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_companies_unified_user ON companies(unified_user_id);
CREATE INDEX IF NOT EXISTS idx_identity_tokens_unified_user ON identity_tokens(unified_user_id);

-- Function to get or create unified user for a provider identity
CREATE OR REPLACE FUNCTION get_or_create_unified_user(
    p_provider TEXT,
    p_provider_user_id TEXT,
    p_provider_email TEXT DEFAULT NULL,
    p_provider_handle TEXT DEFAULT NULL,
    p_oauth_provider TEXT DEFAULT NULL,
    p_display_name TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_unified_user_id UUID;
    v_existing_identity user_identities%ROWTYPE;
BEGIN
    -- Check if identity already exists
    SELECT * INTO v_existing_identity
    FROM user_identities
    WHERE provider = p_provider AND provider_user_id = p_provider_user_id;

    IF FOUND THEN
        -- Identity exists, check if unified user was merged
        SELECT COALESCE(merged_into_id, id) INTO v_unified_user_id
        FROM unified_users
        WHERE id = v_existing_identity.unified_user_id;

        -- Update last_used_at
        UPDATE user_identities
        SET last_used_at = NOW()
        WHERE id = v_existing_identity.id;

        RETURN v_unified_user_id;
    END IF;

    -- Identity doesn't exist, create new unified user and link identity
    INSERT INTO unified_users (display_name, primary_email)
    VALUES (p_display_name, p_provider_email)
    RETURNING id INTO v_unified_user_id;

    INSERT INTO user_identities (
        unified_user_id, provider, provider_user_id,
        provider_email, provider_handle, oauth_provider
    )
    VALUES (
        v_unified_user_id, p_provider, p_provider_user_id,
        p_provider_email, p_provider_handle, p_oauth_provider
    );

    RETURN v_unified_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to merge two unified users
CREATE OR REPLACE FUNCTION merge_unified_users(
    p_source_user_id UUID,  -- The account being merged (will be tombstoned)
    p_target_user_id UUID   -- The surviving account
) RETURNS BOOLEAN AS $$
BEGIN
    -- Move all identities from source to target
    UPDATE user_identities
    SET unified_user_id = p_target_user_id
    WHERE unified_user_id = p_source_user_id;

    -- Move all companies from source to target
    UPDATE companies
    SET unified_user_id = p_target_user_id
    WHERE unified_user_id = p_source_user_id;

    -- Move all identity tokens from source to target
    UPDATE identity_tokens
    SET unified_user_id = p_target_user_id
    WHERE unified_user_id = p_source_user_id;

    -- Tombstone the source user
    UPDATE unified_users
    SET merged_into_id = p_target_user_id,
        updated_at = NOW()
    WHERE id = p_source_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
