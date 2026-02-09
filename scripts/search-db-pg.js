
const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function searchDB() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Common for remote Supabase DBs
    });

    try {
        await client.connect();
        console.log("Connected to PostgreSQL.");

        const query = "SELECT * FROM public.agent_inscriptions WHERE conversation_id ILIKE '%CRYSTAL-TIGER-26%' OR inscription_id ILIKE '%CRYSTAL-TIGER-26%'";
        const res = await client.query(query);

        if (res.rows.length > 0) {
            console.log("Found in agent_inscriptions:", res.rows);
        } else {
            console.log("Not found in agent_inscriptions.");
        }

        // Check if there are any tables with 'session' in the name
        const tablesQuery = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name ILIKE '%session%'";
        const tablesRes = await client.query(tablesQuery);
        console.log("Session-related tables found:", tablesRes.rows);

        for (const row of tablesRes.rows) {
            try {
                const searchTable = `SELECT * FROM public.${row.table_name} LIMIT 10`;
                const content = await client.query(searchTable);
                console.log(`Content of ${row.table_name}:`, content.rows);
            } catch (e) { }
        }

    } catch (err) {
        console.error("DB Query error:", err);
    } finally {
        await client.end();
    }
}

searchDB();
