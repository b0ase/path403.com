-- Enhanced Authentication System Migration
-- This migration adds multi-wallet support, improved role management, and super admin capabilities

-- 1. Update profiles table with enhanced role system and wallet connections
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role_level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspended_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- 2. Create wallet connections table for multi-wallet support
CREATE TABLE IF NOT EXISTS wallet_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_type TEXT NOT NULL, -- 'phantom', 'metamask', 'handcash'
  wallet_address TEXT NOT NULL,
  wallet_name TEXT, -- User-defined name for the wallet
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verification_signature TEXT,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique wallet addresses per user
  UNIQUE(user_id, wallet_address),
  -- Ensure only one primary wallet per user per type
  UNIQUE(user_id, wallet_type, is_primary) WHERE is_primary = true
);

-- 3. Create OAuth connections table for multiple OAuth providers
CREATE TABLE IF NOT EXISTS oauth_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'google', 'github', 'twitter', etc.
  provider_user_id TEXT NOT NULL,
  provider_email TEXT,
  provider_username TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique provider connections per user
  UNIQUE(user_id, provider, provider_user_id),
  -- Ensure only one primary OAuth connection per user per provider
  UNIQUE(user_id, provider, is_primary) WHERE is_primary = true
);

-- 4. Create audit log table for authentication events
CREATE TABLE IF NOT EXISTS auth_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL, -- 'login', 'logout', 'wallet_connected', 'oauth_connected', 'role_changed', etc.
  resource TEXT, -- 'wallet', 'oauth', 'profile', 'role', etc.
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create rate limiting table
CREATE TABLE IF NOT EXISTS auth_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- IP address or user ID
  action TEXT NOT NULL, -- 'login', 'signup', 'password_reset', etc.
  attempt_count INTEGER DEFAULT 1,
  first_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_blocked BOOLEAN DEFAULT false,
  blocked_until TIMESTAMP WITH TIME ZONE,
  
  -- Ensure unique rate limit entries
  UNIQUE(identifier, action)
);

-- 6. Create role hierarchy table
CREATE TABLE IF NOT EXISTS role_hierarchy (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_name TEXT UNIQUE NOT NULL,
  parent_role TEXT REFERENCES role_hierarchy(role_name),
  level INTEGER NOT NULL,
  permissions JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Insert role hierarchy
INSERT INTO role_hierarchy (role_name, parent_role, level, permissions, description) VALUES
('super_admin', NULL, 1, '{"*": "*"}', 'Full system access - Richard Boase only'),
('admin', 'super_admin', 2, '{"users": ["read", "update"], "projects": ["*"], "analytics": ["read"]}', 'Platform administrators'),
('builder', NULL, 3, '{"projects": ["create", "read", "update", "delete_own"], "code": ["*"], "tools": ["*"]}', 'Developers and technical users'),
('investor', NULL, 3, '{"projects": ["read", "invest"], "finances": ["read_own", "invest"], "portfolio": ["*"]}', 'Financial backers'),
('client', NULL, 3, '{"projects": ["read_own", "update_own"], "communications": ["*"], "billing": ["read_own"]}', 'Service recipients'),
('user', NULL, 4, '{"projects": ["read_public"], "profile": ["read", "update_own"], "community": ["*"]}', 'General platform users')
ON CONFLICT (role_name) DO NOTHING;

-- 8. Set up Richard Boase as super admin
UPDATE profiles 
SET 
  role = 'admin',
  role_level = 1,
  is_super_admin = true,
  permissions = '{"*": "*"}'
WHERE email = 'richardwboase@gmail.com';

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallet_connections_user_id ON wallet_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_wallet_type ON wallet_connections(wallet_type);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_wallet_address ON wallet_connections(wallet_address);
CREATE INDEX IF NOT EXISTS idx_oauth_connections_user_id ON oauth_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_connections_provider ON oauth_connections(provider);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_user_id ON auth_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_action ON auth_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_created_at ON auth_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_identifier ON auth_rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_action ON auth_rate_limits(action);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_super_admin ON profiles(is_super_admin);

-- 10. Enable RLS on new tables
ALTER TABLE wallet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_hierarchy ENABLE ROW LEVEL SECURITY;

-- 11. Create RLS policies for wallet_connections
CREATE POLICY "Users can view their own wallet connections" 
  ON wallet_connections FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet connections" 
  ON wallet_connections FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet connections" 
  ON wallet_connections FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wallet connections" 
  ON wallet_connections FOR DELETE 
  USING (auth.uid() = user_id);

-- 12. Create RLS policies for oauth_connections
CREATE POLICY "Users can view their own OAuth connections" 
  ON oauth_connections FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own OAuth connections" 
  ON oauth_connections FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own OAuth connections" 
  ON oauth_connections FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own OAuth connections" 
  ON oauth_connections FOR DELETE 
  USING (auth.uid() = user_id);

-- 13. Create RLS policies for auth_audit_log (read-only for users, full access for super admin)
CREATE POLICY "Users can view their own audit logs" 
  ON auth_audit_log FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Super admin can view all audit logs" 
  ON auth_audit_log FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "System can insert audit logs" 
  ON auth_audit_log FOR INSERT 
  WITH CHECK (true);

-- 14. Create RLS policies for auth_rate_limits (system access only)
CREATE POLICY "System can manage rate limits" 
  ON auth_rate_limits FOR ALL 
  USING (true);

-- 15. Create RLS policies for role_hierarchy (read-only for authenticated users)
CREATE POLICY "Authenticated users can view role hierarchy" 
  ON role_hierarchy FOR SELECT 
  TO authenticated 
  USING (true);

-- 16. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 17. Create triggers for updated_at
CREATE TRIGGER update_wallet_connections_updated_at 
  BEFORE UPDATE ON wallet_connections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oauth_connections_updated_at 
  BEFORE UPDATE ON oauth_connections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 18. Create function to log authentication events
CREATE OR REPLACE FUNCTION log_auth_event(
  p_user_id UUID,
  p_action TEXT,
  p_resource TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO auth_audit_log (
    user_id, 
    action, 
    resource, 
    details, 
    success, 
    error_message,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_action,
    p_resource,
    p_details,
    p_success,
    p_error_message,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 19. Create function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_action TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN AS $$
DECLARE
  v_record auth_rate_limits%ROWTYPE;
  v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate window start
  v_window_start := NOW() - INTERVAL '1 minute' * p_window_minutes;
  
  -- Get or create rate limit record
  SELECT * INTO v_record 
  FROM auth_rate_limits 
  WHERE identifier = p_identifier AND action = p_action;
  
  IF v_record IS NULL THEN
    -- First attempt
    INSERT INTO auth_rate_limits (identifier, action, attempt_count, first_attempt, last_attempt)
    VALUES (p_identifier, p_action, 1, NOW(), NOW());
    RETURN true;
  END IF;
  
  -- Check if blocked
  IF v_record.is_blocked AND v_record.blocked_until > NOW() THEN
    RETURN false;
  END IF;
  
  -- Reset if outside window
  IF v_record.last_attempt < v_window_start THEN
    UPDATE auth_rate_limits 
    SET attempt_count = 1, first_attempt = NOW(), last_attempt = NOW(), is_blocked = false, blocked_until = NULL
    WHERE identifier = p_identifier AND action = p_action;
    RETURN true;
  END IF;
  
  -- Check if within limits
  IF v_record.attempt_count < p_max_attempts THEN
    UPDATE auth_rate_limits 
    SET attempt_count = attempt_count + 1, last_attempt = NOW()
    WHERE identifier = p_identifier AND action = p_action;
    RETURN true;
  END IF;
  
  -- Block if exceeded
  UPDATE auth_rate_limits 
  SET is_blocked = true, blocked_until = NOW() + INTERVAL '1 hour'
  WHERE identifier = p_identifier AND action = p_action;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 20. Create function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_role TEXT;
  v_role_permissions JSONB;
BEGIN
  -- Get user's role
  SELECT role INTO v_user_role 
  FROM profiles 
  WHERE id = p_user_id;
  
  -- Get role permissions from hierarchy
  SELECT permissions INTO v_role_permissions 
  FROM role_hierarchy 
  WHERE role_name = v_user_role;
  
  -- Add super admin permissions if applicable
  IF EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id AND is_super_admin = true) THEN
    RETURN '{"*": "*"}'::JSONB;
  END IF;
  
  RETURN COALESCE(v_role_permissions, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 21. Create function to check permission
CREATE OR REPLACE FUNCTION check_permission(
  p_user_id UUID,
  p_resource TEXT,
  p_action TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_permissions JSONB;
  v_resource_permissions JSONB;
BEGIN
  -- Get user permissions
  v_permissions := get_user_permissions(p_user_id);
  
  -- Check for wildcard permissions
  IF v_permissions ? '*' THEN
    RETURN true;
  END IF;
  
  -- Check resource-specific permissions
  IF v_permissions ? p_resource THEN
    v_resource_permissions := v_permissions->p_resource;
    
    -- Check for wildcard action
    IF jsonb_typeof(v_resource_permissions) = 'array' AND 
       v_resource_permissions ? '*' THEN
      RETURN true;
    END IF;
    
    -- Check for specific action
    IF jsonb_typeof(v_resource_permissions) = 'array' AND 
       v_resource_permissions ? p_action THEN
      RETURN true;
    END IF;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 