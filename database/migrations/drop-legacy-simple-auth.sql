-- Drop Legacy Simple Auth Tables
-- These tables were part of an experimental auth system that was never used in production.
-- Audit on 2026-01-26 confirmed: 0 users in simple_users, 0 records in auth_methods.
--
-- Run with: psql $DATABASE_URL -f database/migrations/drop-legacy-simple-auth.sql
-- Or via Supabase dashboard SQL editor

-- Safety check: Only proceed if tables are empty
DO $$
DECLARE
  simple_count INTEGER;
  auth_count INTEGER;
BEGIN
  -- Check simple_users count
  SELECT COUNT(*) INTO simple_count FROM public.simple_users;
  IF simple_count > 0 THEN
    RAISE EXCEPTION 'simple_users has % records - aborting migration', simple_count;
  END IF;

  -- Check auth_methods count
  SELECT COUNT(*) INTO auth_count FROM public.auth_methods;
  IF auth_count > 0 THEN
    RAISE EXCEPTION 'auth_methods has % records - aborting migration', auth_count;
  END IF;

  RAISE NOTICE 'Safety check passed: both tables are empty';
END $$;

-- Drop the tables
DROP TABLE IF EXISTS public.auth_methods CASCADE;
DROP TABLE IF EXISTS public.simple_users CASCADE;

-- Log the cleanup
DO $$
BEGIN
  RAISE NOTICE 'Successfully dropped simple_users and auth_methods tables';
END $$;
