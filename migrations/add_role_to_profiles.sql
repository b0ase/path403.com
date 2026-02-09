-- Add role column to profiles table
-- This migration adds user role functionality to the profiles table

-- First, create an enum for user roles
CREATE TYPE user_role_type AS ENUM (
  'investor',
  'builder',
  'social',
  'strategist', 
  'creative',
  'marketer',
  'connector',
  'community'
);

-- Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN role user_role_type NULL;

-- Add index for role queries
CREATE INDEX idx_profiles_role ON profiles(role);

-- Add comment for documentation
COMMENT ON COLUMN profiles.role IS 'User role that defines their pathway and experience in the platform';

-- Optional: Add RLS policy for role-based access if needed
-- CREATE POLICY "Users can view their own role" ON profiles FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "Users can update their own role" ON profiles FOR UPDATE USING (auth.uid() = id); 