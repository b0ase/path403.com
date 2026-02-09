-- GitHub Issues → Investment Tranches System
-- Migration: 20260121_github_issues_tranches
--
-- Creates 3 new tables:
-- 1. github_issues - Cached GitHub issues
-- 2. funding_tranches - Investment bundles
-- 3. github_issue_tranches - Many-to-many mapping

-- ============================================
-- 1. github_issues - Cached GitHub issues
-- ============================================
CREATE TABLE IF NOT EXISTS "public"."github_issues" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "repo_id" UUID NOT NULL,
    "github_issue_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "state" TEXT NOT NULL,
    "html_url" TEXT NOT NULL,
    "author_login" TEXT,
    "labels" JSONB DEFAULT '[]'::jsonb,
    "assignees" JSONB DEFAULT '[]'::jsonb,
    "milestone" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "closed_at" TIMESTAMPTZ(6),
    "last_synced_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "github_issues_pkey" PRIMARY KEY ("id")
);

-- Unique constraint: one entry per issue per repo
ALTER TABLE "public"."github_issues"
ADD CONSTRAINT "github_issues_repo_id_github_issue_id_key"
UNIQUE ("repo_id", "github_issue_id");

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_github_issues_repo" ON "public"."github_issues"("repo_id");
CREATE INDEX IF NOT EXISTS "idx_github_issues_state" ON "public"."github_issues"("state");

-- Foreign key to tokenized_repositories
ALTER TABLE "public"."github_issues"
ADD CONSTRAINT "github_issues_repo_id_fkey"
FOREIGN KEY ("repo_id")
REFERENCES "public"."tokenized_repositories"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- 2. funding_tranches - Investment bundles
-- ============================================
CREATE TABLE IF NOT EXISTS "public"."funding_tranches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_slug" TEXT NOT NULL,
    "tranche_number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "target_amount_gbp" DECIMAL(10,2) NOT NULL,
    "raised_amount_gbp" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "price_per_percent" DECIMAL(10,4) NOT NULL,
    "equity_offered" DECIMAL(5,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "milestone_summary" TEXT,
    "fundraising_round_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "funding_tranches_pkey" PRIMARY KEY ("id")
);

-- Unique constraint: one tranche number per project
ALTER TABLE "public"."funding_tranches"
ADD CONSTRAINT "funding_tranches_project_slug_tranche_number_key"
UNIQUE ("project_slug", "tranche_number");

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_funding_tranches_project" ON "public"."funding_tranches"("project_slug");
CREATE INDEX IF NOT EXISTS "idx_funding_tranches_status" ON "public"."funding_tranches"("status");

-- Foreign key to fundraising_rounds (optional)
ALTER TABLE "public"."funding_tranches"
ADD CONSTRAINT "funding_tranches_fundraising_round_id_fkey"
FOREIGN KEY ("fundraising_round_id")
REFERENCES "public"."fundraising_rounds"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- 3. github_issue_tranches - Many-to-many
-- ============================================
CREATE TABLE IF NOT EXISTS "public"."github_issue_tranches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "issue_id" UUID NOT NULL,
    "tranche_id" UUID NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "github_issue_tranches_pkey" PRIMARY KEY ("id")
);

-- Unique constraint: one assignment per issue-tranche pair
ALTER TABLE "public"."github_issue_tranches"
ADD CONSTRAINT "github_issue_tranches_issue_id_tranche_id_key"
UNIQUE ("issue_id", "tranche_id");

-- Index for efficient tranche lookups
CREATE INDEX IF NOT EXISTS "idx_issue_tranches_tranche" ON "public"."github_issue_tranches"("tranche_id");

-- Foreign keys
ALTER TABLE "public"."github_issue_tranches"
ADD CONSTRAINT "github_issue_tranches_issue_id_fkey"
FOREIGN KEY ("issue_id")
REFERENCES "public"."github_issues"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."github_issue_tranches"
ADD CONSTRAINT "github_issue_tranches_tranche_id_fkey"
FOREIGN KEY ("tranche_id")
REFERENCES "public"."funding_tranches"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- Row Level Security (RLS)
-- ============================================
-- Enable RLS on all tables
ALTER TABLE "public"."github_issues" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."funding_tranches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."github_issue_tranches" ENABLE ROW LEVEL SECURITY;

-- Public read access for github_issues
CREATE POLICY "github_issues_public_read" ON "public"."github_issues"
    FOR SELECT USING (true);

-- Public read access for funding_tranches
CREATE POLICY "funding_tranches_public_read" ON "public"."funding_tranches"
    FOR SELECT USING (true);

-- Public read access for github_issue_tranches
CREATE POLICY "github_issue_tranches_public_read" ON "public"."github_issue_tranches"
    FOR SELECT USING (true);

-- Service role full access (for API operations)
CREATE POLICY "github_issues_service_all" ON "public"."github_issues"
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "funding_tranches_service_all" ON "public"."funding_tranches"
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "github_issue_tranches_service_all" ON "public"."github_issue_tranches"
    FOR ALL USING (auth.role() = 'service_role');
