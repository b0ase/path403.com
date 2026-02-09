-- Add AI Executive feature flag to unified_users
ALTER TABLE unified_users
ADD COLUMN IF NOT EXISTS ai_executive_enabled BOOLEAN DEFAULT FALSE;

-- Enable AI Executive for admin account
UPDATE unified_users
SET ai_executive_enabled = true
WHERE primary_email = 'richardwboase@gmail.com';

-- Add index for querying AI executive users
CREATE INDEX IF NOT EXISTS idx_unified_users_ai_executive
ON unified_users(ai_executive_enabled)
WHERE ai_executive_enabled = TRUE;

-- Update user_identities provider CHECK to include AI providers and twitter
-- First drop the existing constraint
ALTER TABLE user_identities DROP CONSTRAINT IF EXISTS user_identities_provider_check;

-- Add new constraint with all providers
ALTER TABLE user_identities ADD CONSTRAINT user_identities_provider_check
CHECK (provider IN (
    'supabase',      -- Supabase OAuth (Google, Discord, GitHub, LinkedIn)
    'twitter',       -- Twitter OAuth (custom PKCE implementation)
    'handcash',      -- HandCash wallet
    'phantom',       -- Phantom wallet (Solana)
    'metamask',      -- MetaMask wallet (Ethereum)
    'yours',         -- Yours wallet (BSV)
    'okx',           -- OKX wallet
    'claude',        -- Claude AI (Anthropic) API key
    'openai',        -- OpenAI API key
    'gemini'         -- Gemini AI (Google) API key
));

-- Comment for documentation
COMMENT ON COLUMN unified_users.ai_executive_enabled IS
'Feature flag for AI Executive Suite - enables AI providers (Claude, OpenAI, Gemini) for AI agents in boardrooms and automation';
