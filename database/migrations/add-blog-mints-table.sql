-- Blog Token Minting Table
-- Links path402_tokens to blog posts via BSV inscriptions.
-- The inscription txid+vout IS the ordinal root (no separate keypairs needed).

CREATE TABLE IF NOT EXISTS path402_blog_mints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id TEXT NOT NULL REFERENCES path402_tokens(token_id),
  blog_slug TEXT NOT NULL UNIQUE,
  inscription_txid TEXT NOT NULL,
  inscription_vout INT DEFAULT 0,
  content_hash TEXT NOT NULL,
  markdown_path TEXT NOT NULL,
  minted_at TIMESTAMPTZ DEFAULT now(),
  minted_by TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blog_mints_slug ON path402_blog_mints(blog_slug);
CREATE INDEX IF NOT EXISTS idx_blog_mints_token ON path402_blog_mints(token_id);
