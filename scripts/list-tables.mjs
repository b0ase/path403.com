
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || 'https://api.b0ase.com';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    const { data, error } = await supabase.rpc('get_tables'); // This might not work if RPC not defined
    if (error) {
        // Try querying a system table
        const { data: tables, error: err2 } = await supabase
            .from('pg_catalog.pg_tables')
            .select('tablename')
            .eq('schemaname', 'public');

        if (err2) {
            console.error('Error listing tables:', err2);
            return;
        }
        console.log('Tables:', tables.map(t => t.tablename));
    } else {
        console.log('Tables:', data);
    }
}

listTables();
