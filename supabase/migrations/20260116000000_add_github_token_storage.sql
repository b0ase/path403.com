-- Add encrypted token storage to user_identities table
-- Migration: 20260116000000_add_github_token_storage
-- Description: Add columns for storing OAuth access tokens, refresh tokens, and expiration times

BEGIN;

-- Add new columns for OAuth token storage
ALTER TABLE user_identities
ADD COLUMN IF NOT EXISTS access_token TEXT,
ADD COLUMN IF NOT EXISTS refresh_token TEXT,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster lookups by unified_user_id and provider
CREATE INDEX IF NOT EXISTS idx_user_identities_unified_provider
ON user_identities(unified_user_id, provider)
WHERE access_token IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN user_identities.access_token IS 'Encrypted OAuth access token for API access';
COMMENT ON COLUMN user_identities.refresh_token IS 'Encrypted OAuth refresh token for token renewal';
COMMENT ON COLUMN user_identities.token_expires_at IS 'Timestamp when the access token expires';

-- Security note: In production, consider using Supabase Vault or database-level encryption
-- for sensitive token data. For MVP, we're storing directly but should encrypt before storage.

COMMIT;
