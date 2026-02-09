
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || 'https://api.b0ase.com';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTransactions() {
    const { data, error } = await supabase
        .from('token_transactions')
        .select('*')
        .limit(5)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching transactions:', error);
        return;
    }

    console.log('--- Recent Token Transactions ---');
    data.forEach(tx => {
        console.log(`Token: ${tx.token_address}`);
        console.log(`Type: ${tx.type}`);
        console.log(`Amount: ${tx.amount_sats} sats`);
        console.log(`Date: ${tx.created_at}`);
        console.log('---');
    });
}

checkTransactions();
