-- AI API Keys Migration
-- Created: 2026-02-01
-- Purpose: Token-gated AI access with micropayments

-- API keys for AI agents
CREATE TABLE IF NOT EXISTS ai_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,  -- Owner of the key
  user_handle TEXT,
  key_hash TEXT NOT NULL UNIQUE,  -- SHA256 hash of the API key
  key_prefix TEXT NOT NULL,  -- First 8 chars for identification (e.g., "b0ai_abc1")
  name TEXT,  -- User-friendly name
  balance_sats BIGINT DEFAULT 0 CHECK (balance_sats >= 0),
  total_funded_sats BIGINT DEFAULT 0,
  total_spent_sats BIGINT DEFAULT 0,
  request_count BIGINT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- AI API usage log
CREATE TABLE IF NOT EXISTS ai_api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id UUID REFERENCES ai_api_keys(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  cost_sats INTEGER NOT NULL,
  request_ip TEXT,
  user_agent TEXT,
  response_tokens INTEGER,  -- Approximate size of response
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pricing configuration (can be updated without code changes)
CREATE TABLE IF NOT EXISTS ai_api_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_pattern TEXT NOT NULL UNIQUE,  -- e.g., '/api/ai/blog/*'
  cost_sats INTEGER NOT NULL DEFAULT 1,  -- Cost per request in satoshis
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default pricing
INSERT INTO ai_api_pricing (endpoint_pattern, cost_sats, description) VALUES
  ('/api/ai/blog', 1, 'List blog posts'),
  ('/api/ai/blog/*', 2, 'Read single blog post'),
  ('/api/ai/portfolio', 1, 'List portfolio projects'),
  ('/api/ai/portfolio/*', 2, 'Read single project'),
  ('/api/ai/tokens', 1, 'List tokens'),
  ('/api/ai/search', 5, 'Search across site'),
  ('/api/ai/*', 1, 'Default pricing')
ON CONFLICT (endpoint_pattern) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_keys_user ON ai_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_keys_hash ON ai_api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_ai_keys_prefix ON ai_api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_ai_keys_active ON ai_api_keys(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ai_usage_key ON ai_api_usage(key_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON ai_api_usage(created_at DESC);

-- Comments
COMMENT ON TABLE ai_api_keys IS 'API keys for AI agents with prepaid satoshi balances';
COMMENT ON TABLE ai_api_usage IS 'Usage log for AI API requests';
COMMENT ON TABLE ai_api_pricing IS 'Per-endpoint pricing configuration';
COMMENT ON COLUMN ai_api_keys.key_hash IS 'SHA256 hash - actual key only shown once at creation';
COMMENT ON COLUMN ai_api_keys.balance_sats IS 'Current balance in satoshis for API calls';
