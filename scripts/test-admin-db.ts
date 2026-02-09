
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase Admin Connection...');
console.log('URL:', supabaseUrl);
console.log('Key length:', serviceRoleKey ? serviceRoleKey.length : 'undefined');
console.log('Key start:', serviceRoleKey ? serviceRoleKey.substring(0, 10) + '...' : 'N/A');

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testConnection() {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) {
        console.error('Connection Failed:', error.message);
    } else {
        console.log('Connection Successful. Found users:', data?.length);
    }
}

testConnection();
