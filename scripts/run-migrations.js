// Execute database migrations
// Run with: DATABASE_URL=postgresql://... node scripts/run-migrations.js
//
// SECURITY: DATABASE_URL must be set via environment variable.
// Never hardcode database credentials in source files.

const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is required');
    process.exit(1);
}

async function runMigrations() {
    const client = new Client({ connectionString: DATABASE_URL });

    try {
        await client.connect();
        console.log('Connected to database');

        // Check existing tables
        const tablesResult = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
        console.log('Existing tables:', tablesResult.rows.map(r => r.tablename));

        // Migration 1: content_assets table
        console.log('\n--- Migration 1: content_assets ---');
        await client.query(`
      CREATE TABLE IF NOT EXISTS content_assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        file_name VARCHAR(500) NOT NULL,
        file_path TEXT NOT NULL,
        file_size BIGINT NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        asset_type VARCHAR(50) NOT NULL,
        title VARCHAR(500),
        description TEXT,
        tags TEXT[],
        duration INTEGER,
        thumbnail_path TEXT,
        metadata JSONB,
        project_id UUID,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log('✓ content_assets table created/exists');

        // Create indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_content_assets_user_id ON content_assets(user_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_content_assets_asset_type ON content_assets(asset_type);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_content_assets_status ON content_assets(status);`);
        console.log('✓ content_assets indexes created');

        // Enable RLS
        await client.query(`ALTER TABLE content_assets ENABLE ROW LEVEL SECURITY;`);
        console.log('✓ content_assets RLS enabled');

        // Migration 2: content_ideas table
        console.log('\n--- Migration 2: content_ideas ---');
        await client.query(`
      CREATE TABLE IF NOT EXISTS public.content_ideas (
        id uuid primary key default gen_random_uuid(),
        user_id uuid references auth.users(id) on delete cascade not null,
        url text not null,
        title text,
        source_type text not null check (source_type in ('article', 'tweet', 'repo', 'manual')),
        tags text[] default '{}',
        notes text,
        used boolean default false,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null,
        updated_at timestamp with time zone default timezone('utc'::text, now()) not null
      );
    `);
        console.log('✓ content_ideas table created/exists');

        await client.query(`CREATE INDEX IF NOT EXISTS content_ideas_user_id_idx ON public.content_ideas(user_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS content_ideas_created_at_idx ON public.content_ideas(created_at desc);`);
        await client.query(`CREATE INDEX IF NOT EXISTS content_ideas_used_idx ON public.content_ideas(used);`);
        console.log('✓ content_ideas indexes created');

        await client.query(`ALTER TABLE public.content_ideas ENABLE ROW LEVEL SECURITY;`);
        console.log('✓ content_ideas RLS enabled');

        // Migration 3: brand_assets table
        console.log('\n--- Migration 3: brand_assets ---');
        await client.query(`
      CREATE TABLE IF NOT EXISTS public.brand_assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
        primary_logo_url TEXT,
        inverted_logo_url TEXT,
        favicon_url TEXT,
        social_image_url TEXT,
        primary_color VARCHAR(7) DEFAULT '#000000',
        secondary_color VARCHAR(7) DEFAULT '#FFFFFF',
        background_color VARCHAR(7) DEFAULT '#000000',
        text_color VARCHAR(7) DEFAULT '#FFFFFF',
        accent_color VARCHAR(7) DEFAULT '#FBBF24',
        heading_font VARCHAR(100),
        body_font VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
        console.log('✓ brand_assets table created/exists');

        await client.query(`CREATE INDEX IF NOT EXISTS brand_assets_user_id_idx ON public.brand_assets(user_id);`);
        console.log('✓ brand_assets indexes created');

        await client.query(`ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;`);
        console.log('✓ brand_assets RLS enabled');

        // Create RLS policies using DO blocks for idempotency
        console.log('\n--- Creating RLS Policies ---');

        // content_assets policies
        const policies = [
            { table: 'content_assets', name: 'Users can view their own content assets', op: 'SELECT', check: 'auth.uid() = user_id' },
            { table: 'content_assets', name: 'Users can insert their own content assets', op: 'INSERT', check: 'auth.uid() = user_id' },
            { table: 'content_assets', name: 'Users can update their own content assets', op: 'UPDATE', check: 'auth.uid() = user_id' },
            { table: 'content_assets', name: 'Users can delete their own content assets', op: 'DELETE', check: 'auth.uid() = user_id' },
            { table: 'content_ideas', name: 'Users can view own content ideas', op: 'SELECT', check: 'auth.uid() = user_id' },
            { table: 'content_ideas', name: 'Users can insert own content ideas', op: 'INSERT', check: 'auth.uid() = user_id' },
            { table: 'content_ideas', name: 'Users can update own content ideas', op: 'UPDATE', check: 'auth.uid() = user_id' },
            { table: 'content_ideas', name: 'Users can delete own content ideas', op: 'DELETE', check: 'auth.uid() = user_id' },
            { table: 'brand_assets', name: 'Users can view own brand assets', op: 'SELECT', check: 'auth.uid() = user_id' },
            { table: 'brand_assets', name: 'Users can insert own brand assets', op: 'INSERT', check: 'auth.uid() = user_id' },
            { table: 'brand_assets', name: 'Users can update own brand assets', op: 'UPDATE', check: 'auth.uid() = user_id' },
            { table: 'brand_assets', name: 'Users can delete own brand assets', op: 'DELETE', check: 'auth.uid() = user_id' },
        ];

        for (const p of policies) {
            try {
                if (p.op === 'INSERT') {
                    await client.query(`
            CREATE POLICY "${p.name}" ON public.${p.table} FOR ${p.op} TO authenticated WITH CHECK (${p.check});
          `);
                } else {
                    await client.query(`
            CREATE POLICY "${p.name}" ON public.${p.table} FOR ${p.op} TO authenticated USING (${p.check});
          `);
                }
                console.log(`✓ Policy created: ${p.name}`);
            } catch (e) {
                if (e.code === '42710') { // policy already exists
                    console.log(`○ Policy exists: ${p.name}`);
                } else {
                    console.log(`✗ Policy error: ${p.name} - ${e.message}`);
                }
            }
        }

        // Check storage buckets
        console.log('\n--- Checking Storage Buckets ---');
        try {
            const bucketsResult = await client.query(`SELECT id, name FROM storage.buckets;`);
            console.log('Existing buckets:', bucketsResult.rows.map(r => r.name));

            // Create content-assets bucket if not exists
            await client.query(`
        INSERT INTO storage.buckets (id, name, public) 
        VALUES ('content-assets', 'content-assets', true)
        ON CONFLICT (id) DO NOTHING;
      `);
            console.log('✓ content-assets bucket created/exists');

            // Create brand-assets bucket if not exists
            await client.query(`
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('brand-assets', 'brand-assets', true)
        ON CONFLICT (id) DO NOTHING;
      `);
            console.log('✓ brand-assets bucket created/exists');
        } catch (e) {
            console.log('Storage bucket check failed:', e.message);
        }

        // Verify final state
        console.log('\n--- Final State ---');
        const finalTables = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('content_assets', 'content_ideas', 'brand_assets')
      ORDER BY tablename
    `);
        console.log('Migration tables:', finalTables.rows.map(r => r.tablename));

        console.log('\n✅ All migrations complete!');

    } catch (error) {
        console.error('Migration error:', error.message);
        console.error('Full error:', error);
    } finally {
        await client.end();
    }
}

runMigrations();
