-- Fix: Allow multiple OAuth providers per Supabase user
--
-- Problem: Current UNIQUE constraint on (provider, provider_user_id) prevents
-- a user from linking multiple OAuth providers (Google, Discord, GitHub, etc.)
--
-- Solution: Drop the old constraint and create a new one that includes oauth_provider

-- Drop the old UNIQUE constraint
ALTER TABLE user_identities
DROP CONSTRAINT IF EXISTS user_identities_provider_provider_user_id_key;

-- Add new UNIQUE constraint that includes oauth_provider
-- This allows the same Supabase user to have multiple OAuth provider identities
-- Examples:
--   (provider='supabase', provider_user_id='123', oauth_provider='google')
--   (provider='supabase', provider_user_id='123', oauth_provider='discord')
--   (provider='supabase', provider_user_id='123', oauth_provider='github')
--
-- But still prevents duplicate entries for the same provider combination:
--   Can't have two Google identities for the same user
ALTER TABLE user_identities
ADD CONSTRAINT user_identities_provider_user_oauth_unique
UNIQUE (provider, provider_user_id, oauth_provider);

-- Add comment explaining the change
COMMENT ON CONSTRAINT user_identities_provider_user_oauth_unique ON user_identities IS
'Allows a user to link multiple OAuth providers (Google, Discord, GitHub, etc.) while preventing duplicates of the same provider';
