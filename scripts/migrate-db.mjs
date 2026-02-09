
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

// Try connecting without SSL explicitly set (or allowing it to be optional)
const client = new pg.Client({
    connectionString,
    // Removing explicit SSL block to let the driver/server negotiate or fail differently if needed
});

async function migrate() {
    try {
        await client.connect();
        console.log('Connected to database');

        // 1. Add owner_user_id to projects if missing
        console.log('Adding owner_user_id to projects...');
        await client.query(`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id);
    `);

        // 2. Create project_members table
        console.log('Creating project_members table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS project_members (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        role TEXT NOT NULL DEFAULT 'Freelancer',
        display_name TEXT,
        email TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        UNIQUE(project_id, user_id)
      );
    `);

        // Enable RLS on project_members
        await client.query(`ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;`);

        // Add simple policies for project_members
        await client.query(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_members' AND policyname = 'Enable read access for all users') THEN
              CREATE POLICY "Enable read access for all users" ON project_members FOR SELECT USING (true);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_members' AND policyname = 'Enable insert for all users') THEN
              CREATE POLICY "Enable insert for all users" ON project_members FOR INSERT WITH CHECK (true);
          END IF;
           IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_members' AND policyname = 'Enable update for all users') THEN
              CREATE POLICY "Enable update for all users" ON project_members FOR UPDATE USING (true);
          END IF;
           IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_members' AND policyname = 'Enable delete for all users') THEN
              CREATE POLICY "Enable delete for all users" ON project_members FOR DELETE USING (true);
          END IF;
      END $$;
    `);

        // 3. Add role to profiles if missing
        console.log('Adding role to profiles...');
        await client.query(`
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'User';
    `);

        // 4. Create teams table
        console.log('Creating teams table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);

        // 5. Create user_team_memberships table
        console.log('Creating user_team_memberships table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS user_team_memberships (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        role TEXT NOT NULL DEFAULT 'Member',
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        UNIQUE(user_id, team_id)
      );
    `);

        // 6. Create direct_messages table
        console.log('Creating direct_messages table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS direct_messages (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        receiver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);

        // 7. Create financial_accounts table
        console.log('Creating financial_accounts table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS financial_accounts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        account_type TEXT DEFAULT 'Checking',
        provider_name TEXT,
        current_balance NUMERIC(15, 2) DEFAULT 0.00,
        currency_code TEXT DEFAULT 'USD',
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);

        // 8. Create transaction_categories table
        console.log('Creating transaction_categories table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS transaction_categories (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        is_system_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);

        // 9. Create transactions table
        console.log('Creating transactions table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        financial_account_id UUID REFERENCES financial_accounts(id) ON DELETE CASCADE,
        transaction_category_id UUID REFERENCES transaction_categories(id) ON DELETE SET NULL,
        transaction_date DATE NOT NULL,
        description TEXT NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        currency_code TEXT DEFAULT 'USD',
        status TEXT DEFAULT 'posted',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);

        // Enable RLS for all new tables
        const newTables = ['teams', 'user_team_memberships', 'direct_messages', 'financial_accounts', 'transaction_categories', 'transactions'];
        for (const table of newTables) {
            try {
                await client.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
            } catch (e) {
                // Ignore if already enabled
            }
        }

        // Add broad policies for all tables
        for (const table of newTables) {
            await client.query(`
          DO $$ 
          BEGIN
              IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '${table}' AND policyname = 'Enable read access for all users') THEN
                  CREATE POLICY "Enable read access for all users" ON ${table} FOR SELECT USING (true);
              END IF;
              IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '${table}' AND policyname = 'Enable insert for all users') THEN
                  CREATE POLICY "Enable insert for all users" ON ${table} FOR INSERT WITH CHECK (true);
              END IF;
              IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '${table}' AND policyname = 'Enable update for all users') THEN
                  CREATE POLICY "Enable update for all users" ON ${table} FOR UPDATE USING (true);
              END IF;
              IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '${table}' AND policyname = 'Enable delete for all users') THEN
                  CREATE POLICY "Enable delete for all users" ON ${table} FOR DELETE USING (true);
              END IF;
          END $$;
        `);
        }

        console.log('Migration complete!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
