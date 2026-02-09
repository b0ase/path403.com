
import dotenv from 'dotenv';
import { App } from 'octokit';

// Load .env.local
dotenv.config({ path: '.env.local' });

async function verify() {
    const appId = process.env.KINTSUGI_APP_ID;
    const privateKey = process.env.KINTSUGI_PRIVATE_KEY?.replace(/\\n/g, '\n');

    console.log(`Checking Config...`);
    console.log(`App ID: ${appId}`);
    console.log(`Private Key Length: ${privateKey?.length}`);

    if (!appId || !privateKey) {
        console.error('Missing Credentials');
        return;
    }

    const app = new App({ appId, privateKey });

    console.log('Authenticating as App...');
    const { data: jwt } = await app.octokit.request('GET /app');
    console.log(`Authenticated as: ${jwt.name} (${jwt.html_url})`);

    console.log('Fetching Installations...');
    const iterator = app.eachInstallation.iterator();
    for await (const { installation } of iterator) {
        console.log(`----------------------------------------`);
        console.log(`Installation ID: ${installation.id}`);
        console.log(`Account: ${installation.account?.login}`);
        console.log(`Target Type: ${installation.target_type}`);
        console.log(`Permissions: ${JSON.stringify(installation.permissions)}`);
        console.log(`----------------------------------------`);
    }
}

verify().catch(console.error);
