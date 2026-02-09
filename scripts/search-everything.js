
const { Client } = require('pg');
const { Octokit } = require('octokit');
const { createAppAuth } = require('@octokit/auth-app');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function searchEverything() {
    const dbUrl = process.env.DATABASE_URL;

    if (dbUrl) {
        const client = new Client({
            connectionString: dbUrl,
            ssl: false
        });

        try {
            await client.connect();
            console.log("Connected to PostgreSQL.");

            const queryInscriptions = "SELECT * FROM public.agent_inscriptions WHERE conversation_id ILIKE '%CRYSTAL-TIGER-26%'";
            const resIns = await client.query(queryInscriptions);
            if (resIns.rows.length > 0) console.log("Found in agent_inscriptions:", resIns.rows);
            else console.log("Not found in agent_inscriptions.");

            // Check for 'projects' table
            const queryProjects = "SELECT * FROM public.projects WHERE title ILIKE '%CRYSTAL-TIGER-26%' OR slug ILIKE '%CRYSTAL-TIGER-26%'";
            try {
                const resProj = await client.query(queryProjects);
                if (resProj.rows.length > 0) console.log("Found in projects:", resProj.rows);
            } catch (e) {
                console.log("Projects table search failed or doesn't exist.");
            }

        } catch (err) {
            console.error("DB Query error:", err.message);
        } finally {
            await client.end();
        }
    }

    // Check GitHub
    const appId = process.env.KINTSUGI_APP_ID;
    const privateKey = process.env.KINTSUGI_PRIVATE_KEY;
    const installationId = process.env.KINTSUGI_INSTALLATION_ID;

    if (appId && privateKey) {
        console.log("Checking GitHub Org 'ai-kintsugi'...");
        try {
            const octokit = new Octokit({
                authStrategy: createAppAuth,
                auth: {
                    appId,
                    privateKey,
                    installationId,
                },
            });

            const { data: repos } = await octokit.rest.apps.listReposAccessibleToInstallation();
            const found = repos.repositories.filter(r => r.name.toLowerCase().includes('crystal-tiger-26'));
            if (found.length > 0) {
                console.log("Found matching GitHub repos:", found.map(r => ({ name: r.name, url: r.html_url })));
            } else {
                console.log("No matching GitHub repos found in accessible installations.");
            }
        } catch (e) {
            console.error("GitHub search error:", e.message);
        }
    }
}

searchEverything();
