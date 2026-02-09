-- Content Token System Migration
-- Per-content tokens: each page/content piece has its own token
-- Users accumulate tokens as they pay for access

-- Content tokens definition (what tokens exist, their prices)
CREATE TABLE IF NOT EXISTS content_tokens (
  id TEXT PRIMARY KEY,  -- e.g., '$b0ase.com/blog/metaweb-hype-crush'
  path TEXT NOT NULL UNIQUE,  -- e.g., '/blog/metaweb-hype-crush'
  title TEXT,
  price_sats BIGINT NOT NULL DEFAULT 100,  -- Price in satoshis (100 sats ≈ $0.04)
  total_supply BIGINT DEFAULT 0,  -- How many have been minted
  creator_handle TEXT,  -- Original creator
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- User accounts (derived from HandCash)
CREATE TABLE IF NOT EXISTS user_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handcash_handle TEXT UNIQUE NOT NULL,  -- e.g., 'richardboase'
  display_name TEXT,
  ordinals_address TEXT,  -- Derived address for withdrawals
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- User token balances (internal ledger)
CREATE TABLE IF NOT EXISTS user_token_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_accounts(id) ON DELETE CASCADE,
  token_id TEXT REFERENCES content_tokens(id) ON DELETE CASCADE,
  balance BIGINT NOT NULL DEFAULT 1,  -- Usually 1 (you have it or you don't)
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  acquisition_price_sats BIGINT,  -- What they paid
  UNIQUE(user_id, token_id)
);

-- Token transactions (history)
CREATE TABLE IF NOT EXISTS token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id TEXT REFERENCES content_tokens(id),
  from_user_id UUID REFERENCES user_accounts(id),  -- NULL for mints
  to_user_id UUID REFERENCES user_accounts(id),    -- NULL for burns/withdrawals
  amount BIGINT NOT NULL DEFAULT 1,
  price_sats BIGINT,
  tx_type TEXT NOT NULL CHECK (tx_type IN ('mint', 'transfer', 'withdraw', 'burn')),
  handcash_tx_id TEXT,  -- Payment transaction
  ordinals_tx_id TEXT,  -- On-chain withdrawal
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default content tokens for existing blog posts
INSERT INTO content_tokens (id, path, title, price_sats) VALUES
  ('$b0ase.com/blog/metaweb-token-is-not-the-product', '/blog/metaweb-token-is-not-the-product', 'MetaWeb: The Token Is the Product', 100),
  ('$b0ase.com/blog/metaweb-hype-crush', '/blog/metaweb-hype-crush', 'The Hype Crush', 100),
  ('$b0ase.com/blog/metaweb-in-hindsight-obvious', '/blog/metaweb-in-hindsight-obvious', 'In Hindsight, It Was Obvious', 100)
ON CONFLICT (id) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_tokens_path ON content_tokens(path);
CREATE INDEX IF NOT EXISTS idx_user_accounts_handle ON user_accounts(handcash_handle);
CREATE INDEX IF NOT EXISTS idx_user_balances_user ON user_token_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_balances_token ON user_token_balances(token_id);
CREATE INDEX IF NOT EXISTS idx_token_tx_user ON token_transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_token_tx_token ON token_transactions(token_id);

-- Comments
COMMENT ON TABLE content_tokens IS 'Each piece of content has its own token';
COMMENT ON TABLE user_accounts IS 'User accounts derived from HandCash login';
COMMENT ON TABLE user_token_balances IS 'Internal ledger of who owns what tokens';
COMMENT ON TABLE token_transactions IS 'History of all token movements';
