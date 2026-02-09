
import pg from 'pg';
import fs from 'fs';
import path from 'path';

// Manual env parsing
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

const connectionString = process.env.DATABASE_URL || envConfig.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL not found');
    process.exit(1);
}

const client = new pg.Client({
    connectionString,
});

async function secure() {
    try {
        await client.connect();
        console.log('Connected to database for security hardening...');

        const tables = [
            'financial_accounts',
            'transactions',
            'transaction_categories',
            'direct_messages',
            'user_team_memberships',
            'teams',
            'project_members'
        ];

        // 1. Drop insecure policies
        console.log('Dropping insecure policies...');
        for (const table of tables) {
            const insecurePolicies = [
                'Enable read access for all users',
                'Enable insert for all users',
                'Enable update for all users',
                'Enable delete for all users'
            ];
            for (const policy of insecurePolicies) {
                await client.query(`DROP POLICY IF EXISTS "${policy}" ON ${table};`);
            }
        }

        // 2. Apply Strict Policies

        // --- Financial Accounts ---
        console.log('Securing financial_accounts...');
        await client.query(`
            CREATE POLICY "Users can only view own accounts" ON financial_accounts
            FOR SELECT USING (user_id = auth.uid());
            
            CREATE POLICY "Users can only insert own accounts" ON financial_accounts
            FOR INSERT WITH CHECK (user_id = auth.uid());

            CREATE POLICY "Users can only update own accounts" ON financial_accounts
            FOR UPDATE USING (user_id = auth.uid());

            CREATE POLICY "Users can only delete own accounts" ON financial_accounts
            FOR DELETE USING (user_id = auth.uid());
        `);

        // --- Transactions ---
        console.log('Securing transactions...');
        await client.query(`
            CREATE POLICY "Users can only view own transactions" ON transactions
            FOR SELECT USING (user_id = auth.uid());
            
            CREATE POLICY "Users can only insert own transactions" ON transactions
            FOR INSERT WITH CHECK (user_id = auth.uid());

            CREATE POLICY "Users can only update own transactions" ON transactions
            FOR UPDATE USING (user_id = auth.uid());

            CREATE POLICY "Users can only delete own transactions" ON transactions
            FOR DELETE USING (user_id = auth.uid());
        `);

        // --- Transaction Categories ---
        console.log('Securing transaction_categories...');
        await client.query(`
            CREATE POLICY "Users can only view own categories" ON transaction_categories
            FOR SELECT USING (user_id = auth.uid() OR is_system_default = true);
            
            CREATE POLICY "Users can only insert own categories" ON transaction_categories
            FOR INSERT WITH CHECK (user_id = auth.uid());

            CREATE POLICY "Users can only update own categories" ON transaction_categories
            FOR UPDATE USING (user_id = auth.uid());

            CREATE POLICY "Users can only delete own categories" ON transaction_categories
            FOR DELETE USING (user_id = auth.uid());
        `);

        // --- Direct Messages ---
        console.log('Securing direct_messages...');
        await client.query(`
            CREATE POLICY "Users can view messages sent to or by them" ON direct_messages
            FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());
            
            CREATE POLICY "Users can send messages as themselves" ON direct_messages
            FOR INSERT WITH CHECK (sender_id = auth.uid());

            -- Usually users can't edit messages sent, but let's allow updating read status if receiver
            CREATE POLICY "Users can update received messages (mark read)" ON direct_messages
            FOR UPDATE USING (sender_id = auth.uid() OR receiver_id = auth.uid());

             CREATE POLICY "Users can delete messages" ON direct_messages
            FOR DELETE USING (sender_id = auth.uid() OR receiver_id = auth.uid());
        `);

        // --- User Team Memberships ---
        console.log('Securing user_team_memberships...');
        await client.query(`
            CREATE POLICY "Users can view own memberships" ON user_team_memberships
            FOR SELECT USING (user_id = auth.uid());
            
            -- Only allow self-join if logic permits, or invite system? For now restrict insert to 'if user is adding themselves' (e.g. public teams) OR rely on Service Role for invites.
            -- Let's make it strict: ONLY matching user_id.
            CREATE POLICY "Users can manage own memberships" ON user_team_memberships
            FOR ALL USING (user_id = auth.uid());
        `);

        // --- Teams ---
        console.log('Securing teams...');
        // Users can see teams they are members of.
        // Also need to allow creating a team? If they create it, they should be added as member.
        await client.query(`
            CREATE POLICY "Users can view teams they belong to" ON teams
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM user_team_memberships 
                    WHERE team_id = teams.id AND user_id = auth.uid()
                )
            );
            
            CREATE POLICY "Users can create teams" ON teams
            FOR INSERT WITH CHECK (true); -- Anyone can create a team initially

            CREATE POLICY "Team members can update team" ON teams
            FOR UPDATE USING (
                 EXISTS (
                    SELECT 1 FROM user_team_memberships 
                    WHERE team_id = teams.id AND user_id = auth.uid() AND role IN ('Owner', 'Admin')
                )
            );
        `);

        // --- Project Members ---
        console.log('Securing project_members...');
        // Users can see projects they are in, or if they own the project
        await client.query(`
            CREATE POLICY "View memberships" ON project_members
            FOR SELECT USING (
                user_id = auth.uid() OR 
                project_id IN (SELECT id FROM projects WHERE owner_user_id = auth.uid())
            );
            
             CREATE POLICY "Manage memberships" ON project_members
            FOR ALL USING (
                 project_id IN (SELECT id FROM projects WHERE owner_user_id = auth.uid())
            );
         `);

        console.log('Security hardening complete! RLS is now strict.');

    } catch (err) {
        console.error('Security hardening failed:', err);
    } finally {
        await client.end();
    }
}

secure();
