-- Add marketplace developer fields to profiles table
-- Migration created: 2026-01-18
-- Purpose: Enable developer marketplace functionality

-- Add marketplace developer fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_marketplace_developer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS developer_availability TEXT,
ADD COLUMN IF NOT EXISTS github_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS github_stars INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS github_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS portfolio_urls TEXT[] DEFAULT '{}';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_marketplace_developer
ON profiles(is_marketplace_developer)
WHERE is_marketplace_developer = true;

CREATE INDEX IF NOT EXISTS idx_profiles_github_verified
ON profiles(github_verified)
WHERE github_verified = true;

CREATE INDEX IF NOT EXISTS idx_profiles_skills
ON profiles USING GIN(skills);

-- Add comment for documentation
COMMENT ON COLUMN profiles.is_marketplace_developer IS 'Whether user is registered as marketplace developer';
COMMENT ON COLUMN profiles.developer_availability IS 'immediate, within_week, within_month';
COMMENT ON COLUMN profiles.github_verified IS 'GitHub account verified (90+ days, 3+ repos)';
COMMENT ON COLUMN profiles.github_stars IS 'Total GitHub stars across all repos';
COMMENT ON COLUMN profiles.skills IS 'Array of developer skills for marketplace matching';
COMMENT ON COLUMN profiles.hourly_rate IS 'Hourly rate in GBP for marketplace services';
COMMENT ON COLUMN profiles.portfolio_urls IS 'Array of portfolio project URLs';
