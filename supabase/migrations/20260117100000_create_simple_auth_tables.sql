-- Auth Simplification: New Tables
-- Date: 2026-01-17
-- Strategy: Every signup creates new account. No merging. No collision checks.

-- Simple users table
CREATE TABLE IF NOT EXISTS simple_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR, -- optional, for notifications
  display_name VARCHAR,
  avatar_url VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- All auth methods (login + connected)
CREATE TABLE IF NOT EXISTS auth_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES simple_users(id) ON DELETE CASCADE,

  -- Provider info
  provider VARCHAR NOT NULL, -- 'google', 'github', 'metamask', 'discord', etc.
  provider_user_id VARCHAR NOT NULL, -- their ID at that provider

  -- Purpose: login or connected
  purpose VARCHAR NOT NULL CHECK (purpose IN ('login', 'connected')),

  -- OAuth tokens (for connected accounts with API access)
  oauth_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,

  -- Metadata from provider
  provider_email VARCHAR,
  provider_username VARCHAR,
  provider_data JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Allow same provider_user_id for login and connected
  -- Example: GitHub can be login for User A, and connected for User B
  CONSTRAINT auth_methods_unique UNIQUE(provider, provider_user_id, purpose)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_auth_methods_user ON auth_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_methods_login ON auth_methods(provider, provider_user_id) WHERE purpose = 'login';
CREATE INDEX IF NOT EXISTS idx_auth_methods_connected ON auth_methods(user_id, provider) WHERE purpose = 'connected';

-- RLS Policies
ALTER TABLE simple_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_methods ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON simple_users
  FOR SELECT USING (
    id IN (
      SELECT user_id FROM auth_methods
      WHERE provider = 'supabase' AND provider_user_id = auth.uid()::text
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON simple_users
  FOR UPDATE USING (
    id IN (
      SELECT user_id FROM auth_methods
      WHERE provider = 'supabase' AND provider_user_id = auth.uid()::text
    )
  );

-- Users can view their own auth methods
CREATE POLICY "Users can view own auth methods" ON auth_methods
  FOR SELECT USING (
    user_id IN (
      SELECT user_id FROM auth_methods
      WHERE provider = 'supabase' AND provider_user_id = auth.uid()::text
    )
  );

-- Users can insert connected accounts
CREATE POLICY "Users can add connected accounts" ON auth_methods
  FOR INSERT WITH CHECK (
    purpose = 'connected' AND
    user_id IN (
      SELECT user_id FROM auth_methods
      WHERE provider = 'supabase' AND provider_user_id = auth.uid()::text
    )
  );

-- Users can delete their connected accounts (not login methods)
CREATE POLICY "Users can delete connected accounts" ON auth_methods
  FOR DELETE USING (
    purpose = 'connected' AND
    user_id IN (
      SELECT user_id FROM auth_methods
      WHERE provider = 'supabase' AND provider_user_id = auth.uid()::text
    )
  );

-- Comments for documentation
COMMENT ON TABLE simple_users IS 'Simple users table. Every signup creates a new user. No merging.';
COMMENT ON TABLE auth_methods IS 'All authentication methods. purpose=login for signin, purpose=connected for API access.';
COMMENT ON COLUMN auth_methods.purpose IS 'login: used to sign in. connected: linked account for data access only.';
COMMENT ON CONSTRAINT auth_methods_unique ON auth_methods IS 'Allows same provider_user_id for different purposes. Example: GitHub as login for User A, connected for User B.';
