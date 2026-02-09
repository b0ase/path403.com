-- Create tokenized_repositories table
-- Migration: 20260116000001_create_tokenized_repositories
-- Description: Store GitHub repositories that have been claimed or tokenized on b0ase.com

BEGIN;

-- ============================================================================
-- Tokenized Repositories Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tokenized_repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unified_user_id UUID REFERENCES public.unified_users(id) ON DELETE CASCADE NOT NULL,

  -- GitHub Data
  github_repo_id BIGINT NOT NULL UNIQUE,
  github_repo_name TEXT NOT NULL,
  github_owner TEXT NOT NULL,
  github_full_name TEXT NOT NULL, -- "owner/repo"
  github_description TEXT,
  github_stars INTEGER DEFAULT 0,
  github_forks INTEGER DEFAULT 0,
  github_language TEXT,
  github_url TEXT,

  -- Tokenization Status
  is_claimed BOOLEAN DEFAULT true,
  is_tokenized BOOLEAN DEFAULT false,

  -- Token Data (BSV-first, with support for multi-chain later)
  token_symbol TEXT UNIQUE,
  token_chain TEXT DEFAULT 'BSV' CHECK (token_chain IN ('BSV', 'Solana', 'Ethereum')),
  token_contract_address TEXT, -- BSV: inscription ID, Solana: mint address, ETH: contract address
  token_supply BIGINT DEFAULT 1000000, -- Default 1M tokens

  -- Token Economics (configurable by user)
  price_per_star NUMERIC(20, 8), -- sats per GitHub star
  price_per_fork NUMERIC(20, 8), -- sats per fork
  price_per_commit NUMERIC(20, 8), -- sats per commit

  -- Wallet Addresses (for receiving funds)
  handcash_handle TEXT,
  yours_wallet_address TEXT,
  phantom_wallet_address TEXT,
  metamask_wallet_address TEXT,

  -- Timestamps
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tokenized_at TIMESTAMP WITH TIME ZONE,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_chain CHECK (token_chain IN ('BSV', 'Solana', 'Ethereum')),
  CONSTRAINT token_symbol_when_tokenized CHECK (
    (is_tokenized = false) OR (is_tokenized = true AND token_symbol IS NOT NULL)
  )
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_tokenized_repos_user
  ON tokenized_repositories(unified_user_id);

CREATE INDEX IF NOT EXISTS idx_tokenized_repos_github_id
  ON tokenized_repositories(github_repo_id);

CREATE INDEX IF NOT EXISTS idx_tokenized_repos_tokenized
  ON tokenized_repositories(is_tokenized)
  WHERE is_tokenized = true;

CREATE INDEX IF NOT EXISTS idx_tokenized_repos_symbol
  ON tokenized_repositories(token_symbol)
  WHERE token_symbol IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tokenized_repos_chain
  ON tokenized_repositories(token_chain)
  WHERE is_tokenized = true;

CREATE INDEX IF NOT EXISTS idx_tokenized_repos_owner
  ON tokenized_repositories(github_owner);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================
ALTER TABLE tokenized_repositories ENABLE ROW LEVEL SECURITY;

-- Anyone can view tokenized repos (public marketplace)
CREATE POLICY "Anyone can view tokenized repos"
  ON tokenized_repositories FOR SELECT
  USING (is_tokenized = true);

-- Users can view their own repos (claimed or tokenized)
CREATE POLICY "Users can view their own repos"
  ON tokenized_repositories FOR SELECT
  USING (unified_user_id = auth.uid());

-- Users can claim repos (insert)
CREATE POLICY "Users can claim repos"
  ON tokenized_repositories FOR INSERT
  WITH CHECK (unified_user_id = auth.uid());

-- Users can update their own repos
CREATE POLICY "Users can update their own repos"
  ON tokenized_repositories FOR UPDATE
  USING (unified_user_id = auth.uid())
  WITH CHECK (unified_user_id = auth.uid());

-- Users can delete their own repos (before tokenization)
CREATE POLICY "Users can delete unclaimed repos"
  ON tokenized_repositories FOR DELETE
  USING (unified_user_id = auth.uid() AND is_tokenized = false);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tokenized_repos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_update_tokenized_repos_timestamp
  BEFORE UPDATE ON tokenized_repositories
  FOR EACH ROW
  EXECUTE FUNCTION update_tokenized_repos_updated_at();

-- ============================================================================
-- Comments/Documentation
-- ============================================================================
COMMENT ON TABLE tokenized_repositories IS 'Stores GitHub repositories that have been claimed or tokenized on b0ase.com';
COMMENT ON COLUMN tokenized_repositories.github_repo_id IS 'GitHub repository ID (unique identifier from GitHub API)';
COMMENT ON COLUMN tokenized_repositories.token_contract_address IS 'BSV: Inscription ID, Solana: Token Mint Address, Ethereum: Contract Address';
COMMENT ON COLUMN tokenized_repositories.token_supply IS 'Total token supply (default 1M tokens)';
COMMENT ON COLUMN tokenized_repositories.is_claimed IS 'True when user has verified ownership';
COMMENT ON COLUMN tokenized_repositories.is_tokenized IS 'True when tokens have been minted on blockchain';
COMMENT ON COLUMN tokenized_repositories.last_synced_at IS 'Last time GitHub metadata was synced';

COMMIT;
