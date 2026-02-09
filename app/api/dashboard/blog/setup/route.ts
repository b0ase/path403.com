import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// This endpoint creates the blog_post_review_status table if it doesn't exist
// Run once to initialize the table
export async function POST() {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // SQL to create the table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.blog_post_review_status (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug TEXT NOT NULL UNIQUE,
        queued BOOLEAN DEFAULT false,
        live BOOLEAN DEFAULT false,
        formatted BOOLEAN DEFAULT false,
        last_checked_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
        created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
        updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
      );

      CREATE INDEX IF NOT EXISTS idx_blog_post_review_status_slug
        ON public.blog_post_review_status(slug);

      ALTER TABLE public.blog_post_review_status ENABLE ROW LEVEL SECURITY;

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE tablename = 'blog_post_review_status'
          AND policyname = 'Allow authenticated users to read blog post status'
        ) THEN
          CREATE POLICY "Allow authenticated users to read blog post status"
            ON public.blog_post_review_status
            FOR SELECT
            TO authenticated
            USING (true);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE tablename = 'blog_post_review_status'
          AND policyname = 'Allow authenticated users to update blog post status'
        ) THEN
          CREATE POLICY "Allow authenticated users to update blog post status"
            ON public.blog_post_review_status
            FOR ALL
            TO authenticated
            USING (true)
            WITH CHECK (true);
        END IF;
      END $$;

      CREATE OR REPLACE FUNCTION public.update_blog_post_review_status_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = timezone('utc'::text, now());
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS update_blog_post_review_status_updated_at
        ON public.blog_post_review_status;

      CREATE TRIGGER update_blog_post_review_status_updated_at
        BEFORE UPDATE ON public.blog_post_review_status
        FOR EACH ROW
        EXECUTE FUNCTION public.update_blog_post_review_status_updated_at();
    `;

    // Execute the SQL using rpc (raw SQL execution)
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });

    if (error) {
      console.error('Error creating table:', error);
      return NextResponse.json(
        {
          error: 'Failed to create table. You may need to run the migration manually in Supabase dashboard.',
          details: error.message,
          sql: createTableSQL
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Blog post review status table created successfully'
    });
  } catch (error: any) {
    console.error('Error in setup:', error);
    return NextResponse.json(
      {
        error: 'Failed to setup table',
        details: error.message,
        instructions: 'Run the SQL from supabase/migrations/20260116110000_create_blog_post_status.sql in your Supabase dashboard'
      },
      { status: 500 }
    );
  }
}
