
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function searchChat() {
    console.log("Searching for 'CRYSTAL-TIGER-26' in database...");

    // 1. Search in inscriptions
    const { data: inscriptions, error: insError } = await supabase
        .from('agent_inscriptions')
        .select('*')
        .or(`conversation_id.ilike.%CRYSTAL-TIGER-26%,inscription_id.ilike.%CRYSTAL-TIGER-26%`);

    if (insError) console.error("Inscription search error:", insError);
    else if (inscriptions.length > 0) console.log("Found in inscriptions:", inscriptions);
    else console.log("No inscriptions found for 'CRYSTAL-TIGER-26'");

    // 2. Search for any table that might have 'title' or 'session_code'
    // Since I don't know all tables, I'll just check if there's a sessions table
    const { data: sessions, error: sesError } = await supabase
        .from('sessions')
        .select('*')
        .limit(5); // Just to check schema or presence

    if (sesError) console.log("No 'sessions' table found or access denied.");
    else console.log("Recent sessions (first 5):", sessions);
}

searchChat();
