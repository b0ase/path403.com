-- Identity tokens table (tokens based on user identities from various sources)
CREATE TABLE IF NOT EXISTS identity_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source TEXT NOT NULL CHECK (source IN ('handcash', 'twitter', 'google', 'discord', 'github', 'linkedin', 'phantom', 'metamask', 'yours')),
    identity TEXT NOT NULL, -- e.g., "$boase", "@boase", "email@gmail.com"
    symbol TEXT NOT NULL, -- e.g., "$BOASE"
    display_name TEXT NOT NULL, -- e.g., "HandCash: $boase"
    blockchain TEXT CHECK (blockchain IN ('bsv', 'eth', 'sol')),
    token_contract_address TEXT, -- on-chain address if deployed
    token_id TEXT, -- on-chain token ID if applicable
    is_deployed BOOLEAN DEFAULT false,
    total_supply BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, source, identity)
);

-- RLS Policies
ALTER TABLE identity_tokens ENABLE ROW LEVEL SECURITY;

-- Users can view their own identity tokens
CREATE POLICY "Users can view own identity tokens" ON identity_tokens
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own identity tokens
CREATE POLICY "Users can insert own identity tokens" ON identity_tokens
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own identity tokens
CREATE POLICY "Users can update own identity tokens" ON identity_tokens
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own identity tokens
CREATE POLICY "Users can delete own identity tokens" ON identity_tokens
    FOR DELETE USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_identity_tokens_user_id ON identity_tokens(user_id);
CREATE INDEX idx_identity_tokens_source ON identity_tokens(source);
