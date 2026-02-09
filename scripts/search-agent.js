
const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function searchAgent() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });

    try {
        await client.connect();
        console.log("Connected to PostgreSQL.");

        const query = "SELECT * FROM public.ai_agent_config WHERE config_data::text ILIKE '%CRYSTAL-TIGER-26%'";
        const res = await client.query(query);

        if (res.rows.length > 0) {
            console.log("Found in ai_agent_config:", res.rows);
        } else {
            console.log("Not found in ai_agent_config.");
        }

        const queryInscriptions = "SELECT * FROM public.agent_inscriptions WHERE conversation_id ILIKE '%CRYSTAL-TIGER-26%'";
        const resIns = await client.query(queryInscriptions);
        if (resIns.rows.length > 0) console.log("Found in agent_inscriptions:", resIns.rows);
        else console.log("No inscriptions found for 'CRYSTAL-TIGER-26'");

    } catch (err) {
        console.error("error:", err.message);
    } finally {
        await client.end();
    }
}

searchAgent();
