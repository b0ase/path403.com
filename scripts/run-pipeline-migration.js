// Execute pipeline system migration
// Run with: DATABASE_URL=postgresql://... node scripts/run-pipeline-migration.js
//
// SECURITY: DATABASE_URL must be set via environment variable.
// Never hardcode database credentials in source files.

const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is required');
    process.exit(1);
}

async function runPipelineMigration() {
    const client = new Client({ connectionString: DATABASE_URL });

    try {
        await client.connect();
        console.log('Connected to database');

        // Create pipeline_stages table
        console.log('\n--- Creating pipeline_stages table ---');
        await client.query(`
      CREATE TABLE IF NOT EXISTS public.pipeline_stages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
        stage_name VARCHAR(50) NOT NULL,
        stage_order INT NOT NULL,
        status VARCHAR(50) DEFAULT 'not_started',
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        agent_id UUID,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        UNIQUE(project_id, stage_name)
      );
    `);
        console.log('✓ pipeline_stages table created');

        // Create stage_tasks table
        console.log('\n--- Creating stage_tasks table ---');
        await client.query(`
      CREATE TABLE IF NOT EXISTS public.stage_tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE CASCADE NOT NULL,
        task_name VARCHAR(200) NOT NULL,
        task_description TEXT,
        task_order INT NOT NULL,
        is_required BOOLEAN DEFAULT true,
        is_completed BOOLEAN DEFAULT false,
        completed_by UUID,
        completed_at TIMESTAMPTZ,
        agent_suggested BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);
        console.log('✓ stage_tasks table created');

        // Create stage_deliverables table
        console.log('\n--- Creating stage_deliverables table ---');
        await client.query(`
      CREATE TABLE IF NOT EXISTS public.stage_deliverables (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE CASCADE NOT NULL,
        deliverable_name VARCHAR(200) NOT NULL,
        deliverable_type VARCHAR(50) DEFAULT 'document',
        description TEXT,
        file_url TEXT,
        file_size BIGINT,
        mime_type VARCHAR(100),
        uploaded_by UUID,
        uploaded_at TIMESTAMPTZ,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);
        console.log('✓ stage_deliverables table created');

        // Create stage_payments table
        console.log('\n--- Creating stage_payments table ---');
        await client.query(`
      CREATE TABLE IF NOT EXISTS public.stage_payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE CASCADE NOT NULL,
        amount_gbp DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'GBP',
        payment_status VARCHAR(50) DEFAULT 'pending',
        invoice_url TEXT,
        stripe_payment_id TEXT,
        stripe_invoice_id TEXT,
        paid_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `);
        console.log('✓ stage_payments table created');

        // Create stage_conversations table
        console.log('\n--- Creating stage_conversations table ---');
        await client.query(`
      CREATE TABLE IF NOT EXISTS public.stage_conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE CASCADE NOT NULL,
        conversation_id UUID,
        topic VARCHAR(200),
        message_count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        last_message_at TIMESTAMPTZ
      );
    `);
        console.log('✓ stage_conversations table created');

        // Create indexes
        console.log('\n--- Creating indexes ---');
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_pipeline_stages_project_id ON public.pipeline_stages(project_id)',
            'CREATE INDEX IF NOT EXISTS idx_pipeline_stages_status ON public.pipeline_stages(status)',
            'CREATE INDEX IF NOT EXISTS idx_stage_tasks_stage_id ON public.stage_tasks(stage_id)',
            'CREATE INDEX IF NOT EXISTS idx_stage_deliverables_stage_id ON public.stage_deliverables(stage_id)',
            'CREATE INDEX IF NOT EXISTS idx_stage_payments_stage_id ON public.stage_payments(stage_id)',
        ];
        for (const idx of indexes) {
            await client.query(idx);
        }
        console.log('✓ Indexes created');

        // Enable RLS
        console.log('\n--- Enabling RLS ---');
        await client.query('ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY');
        await client.query('ALTER TABLE public.stage_tasks ENABLE ROW LEVEL SECURITY');
        await client.query('ALTER TABLE public.stage_deliverables ENABLE ROW LEVEL SECURITY');
        await client.query('ALTER TABLE public.stage_payments ENABLE ROW LEVEL SECURITY');
        await client.query('ALTER TABLE public.stage_conversations ENABLE ROW LEVEL SECURITY');
        console.log('✓ RLS enabled on all tables');

        // Create RLS policies
        console.log('\n--- Creating RLS policies ---');
        const policies = [
            {
                table: 'pipeline_stages',
                name: 'Users can view their project pipeline stages',
                op: 'SELECT',
                check: `EXISTS (SELECT 1 FROM public.projects WHERE projects.id = pipeline_stages.project_id AND projects.user_id = auth.uid())`
            },
            {
                table: 'pipeline_stages',
                name: 'Users can create pipeline stages for their projects',
                op: 'INSERT',
                check: `EXISTS (SELECT 1 FROM public.projects WHERE projects.id = pipeline_stages.project_id AND projects.user_id = auth.uid())`
            },
            {
                table: 'pipeline_stages',
                name: 'Users can update their project pipeline stages',
                op: 'UPDATE',
                check: `EXISTS (SELECT 1 FROM public.projects WHERE projects.id = pipeline_stages.project_id AND projects.user_id = auth.uid())`
            },
        ];

        for (const p of policies) {
            try {
                if (p.op === 'INSERT') {
                    await client.query(`CREATE POLICY "${p.name}" ON public.${p.table} FOR ${p.op} TO authenticated WITH CHECK (${p.check});`);
                } else {
                    await client.query(`CREATE POLICY "${p.name}" ON public.${p.table} FOR ${p.op} TO authenticated USING (${p.check});`);
                }
                console.log(`✓ Policy: ${p.name}`);
            } catch (e) {
                if (e.code === '42710') {
                    console.log(`○ Policy exists: ${p.name}`);
                } else {
                    console.log(`✗ Policy error: ${p.name} - ${e.message}`);
                }
            }
        }

        // Verify final state
        console.log('\n--- Final State ---');
        const tables = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('pipeline_stages', 'stage_tasks', 'stage_deliverables', 'stage_payments', 'stage_conversations')
      ORDER BY tablename
    `);
        console.log('Pipeline tables:', tables.rows.map(r => r.tablename));

        console.log('\n✅ Pipeline migration complete!');

    } catch (error) {
        console.error('Migration error:', error.message);
    } finally {
        await client.end();
    }
}

runPipelineMigration();
