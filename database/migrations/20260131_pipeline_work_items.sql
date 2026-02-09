-- Pipeline Work Items Migration
-- Part of the Kintsugi triage system
-- Run via: ssh hetzner "docker exec supabase-db psql -U postgres -d postgres" < database/migrations/20260131_pipeline_work_items.sql

-- Create the pipeline_work_items table
CREATE TABLE IF NOT EXISTS public.pipeline_work_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_slug VARCHAR NOT NULL,
  tranche_id UUID NOT NULL REFERENCES public.funding_tranches(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  estimated_hours DECIMAL(6,2),
  bounty_amount_gbp DECIMAL(10,2) NOT NULL,
  priority INT DEFAULT 0,
  labels JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'open' NOT NULL,
  claimed_by UUID,
  claimed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  estimated_completion TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  payout_txid VARCHAR,
  github_issue_id UUID,
  pr_url VARCHAR,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_pipeline_work_items_project ON public.pipeline_work_items(project_slug);
CREATE INDEX IF NOT EXISTS idx_pipeline_work_items_tranche ON public.pipeline_work_items(tranche_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_work_items_status ON public.pipeline_work_items(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_work_items_claimed_by ON public.pipeline_work_items(claimed_by);

-- Add comment for documentation
COMMENT ON TABLE public.pipeline_work_items IS 'Claimable work items for the Kintsugi triage pipeline. Links bounties to funding tranches.';

-- Grant permissions (adjust as needed for your setup)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pipeline_work_items TO authenticated;
GRANT SELECT ON public.pipeline_work_items TO anon;

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_pipeline_work_items_updated_at ON public.pipeline_work_items;
CREATE TRIGGER update_pipeline_work_items_updated_at
    BEFORE UPDATE ON public.pipeline_work_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'pipeline_work_items table created successfully' AS result;
