
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual env parsing since we can't easily use dotenv in module mode sometimes or path varies
const envPath = path.resolve(process.cwd(), '.env.local');
let envConfig = {};

if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, ...values] = line.split('=');
        if (key && values) {
            envConfig[key.trim()] = values.join('=').trim().replace(/^["']|["']$/g, '');
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking profiles table...');
    const { data: profiles, error: profileError } = await supabase.from('profiles').select('*').limit(1);
    if (profileError) {
        console.error('Profiles Error:', JSON.stringify(profileError, null, 2));
    } else {
        if (profiles && profiles.length > 0) {
            console.log('Profiles Columns:', Object.keys(profiles[0]));
            if (profiles[0].role) console.log('Role column exists');
        } else {
            console.log('Profiles table is empty or no read access');
        }
    }

    console.log('Checking financial_accounts table...');
    const { error: faError } = await supabase.from('financial_accounts').select('id').limit(1);
    if (!faError || faError.code !== 'PGRST205') {
        console.log('financial_accounts exists');
    } else {
        console.log('financial_accounts MISSING');
    }

    console.log('Checking transactions table...');
    const { error: txError } = await supabase.from('transactions').select('id').limit(1);
    if (!txError || txError.code !== 'PGRST205') {
        console.log('transactions exists');
    } else {
        console.log('transactions MISSING');
    }

    console.log('Checking transaction_categories table...');
    const { error: catError } = await supabase.from('transaction_categories').select('id').limit(1);
    if (!catError || catError.code !== 'PGRST205') {
        console.log('transaction_categories exists');
    } else {
        console.log('transaction_categories MISSING');
    }
    console.log('Checking b0ase_com.websites table...');
    const { data: websites, error: webError } = await supabase.schema('b0ase_com').from('websites').select('*').limit(1);
    if (webError) {
        console.error('Websites Error:', JSON.stringify(webError, null, 2));
    } else {
        if (websites && websites.length > 0) {
            console.log('Websites Columns:', Object.keys(websites[0]));
        } else {
            console.log('Websites table is empty or no read access');
        }
    }
    console.log('Checking projects table...');
    const { data: projects, error: projError } = await supabase.from('projects').select('*').limit(1);
    if (projError) {
        console.error('Projects Error:', projError);
    } else if (projects && projects.length > 0) {
        console.log('Projects Columns:', Object.keys(projects[0]));
    }
    console.log('Checking automations.jobs table...');
    const { data: jobs, error: jobsError } = await supabase.schema('automations').from('jobs').select('*').limit(1);
    if (jobsError) {
        console.error('Jobs Error:', jobsError);
    } else if (jobs && jobs.length > 0) {
        console.log('Jobs Columns:', Object.keys(jobs[0]));
    }
}

check();
