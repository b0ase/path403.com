import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY) /* service key only: no anon fallback (fail closed) */;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not configured - using in-memory fallback');
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/** Fails closed in production: no service key means an error, never the in-memory store or the anon key. */
export const isDbConnected = () => {
  if (!supabase && process.env.NODE_ENV === 'production') {
    throw new Error('SUPABASE_SERVICE_KEY (or SUPABASE_SERVICE_ROLE_KEY) is not set: refusing to run without the database');
  }
  return !!supabase;
};
