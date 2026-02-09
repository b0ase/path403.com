
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || 'https://api.b0ase.com';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseKey) {
    console.error('SUPABASE_SERVICE_KEY is missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsage() {
    const { data, error } = await supabase
        .from('token_usage_sessions')
        .select('*')
        .order('expires_at', { ascending: false });

    if (error) {
        console.error('Error fetching sessions:', error);
        return;
    }

    console.log('--- Active Usage Sessions ---');
    if (data.length === 0) {
        console.log('No active sessions found.');
    } else {
        data.forEach(session => {
            const now = new Date();
            const expires = new Date(session.expires_at);
            const remainingSeconds = Math.max(0, Math.floor((expires.getTime() - now.getTime()) / 1000));
            console.log(`Token: ${session.token_address}`);
            console.log(`User: ${session.viewer_handle}`);
            console.log(`Expires: ${session.expires_at} (${remainingSeconds}s left)`);
            console.log(`Total Paid: ${session.total_paid_sats} sats`);
            console.log('---');
        });
    }
}

checkUsage();
