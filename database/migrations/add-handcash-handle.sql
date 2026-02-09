-- Add handcash_handle column to profiles table
-- This allows HandCash wallet users to be properly tracked in the database

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS handcash_handle VARCHAR(100) UNIQUE;

-- Create index for faster lookups by handle
CREATE INDEX IF NOT EXISTS idx_profiles_handcash_handle
ON public.profiles(handcash_handle)
WHERE handcash_handle IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.handcash_handle IS 'HandCash wallet handle (e.g., $bailey) for users who sign in via HandCash';
