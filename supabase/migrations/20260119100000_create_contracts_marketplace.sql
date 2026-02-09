-- Feature Funding Marketplace: Contracts and Tenders
-- Enables the "Vibe-Coder" automation loop and GitHub Issue import

-- 1. Fundraising Rounds (links funding to pipeline stages)
CREATE TABLE IF NOT EXISTS public.fundraising_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID UNIQUE NOT NULL REFERENCES public.pipeline_stages(id) ON DELETE CASCADE,
    target_amount DECIMAL(10, 2) NOT NULL,
    raised_amount DECIMAL(10, 2) DEFAULT 0,
    min_investment DECIMAL(10, 2) DEFAULT 10,
    max_investment DECIMAL(10, 2),
    equity_token_count INT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMPTZ(6) DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fundraising_rounds_stage ON public.fundraising_rounds(stage_id);
CREATE INDEX IF NOT EXISTS idx_fundraising_rounds_status ON public.fundraising_rounds(status);

-- 2. Investor Allocations (tracks individual investments in rounds)
CREATE TABLE IF NOT EXISTS public.investor_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    round_id UUID NOT NULL REFERENCES public.fundraising_rounds(id) ON DELETE CASCADE,
    investor_user_id UUID NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pledged',
    created_at TIMESTAMPTZ(6) DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_investor_allocations_round ON public.investor_allocations(round_id);
CREATE INDEX IF NOT EXISTS idx_investor_allocations_investor ON public.investor_allocations(investor_user_id);

-- 3. Contracts (service agreements, imported GitHub issues, etc.)
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, completed, cancelled
    type VARCHAR(50), -- service_agreement, github_import, custom
    created_at TIMESTAMPTZ(6) DEFAULT NOW(),
    updated_at TIMESTAMPTZ(6) DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_type ON public.contracts(type);

-- 4. Marketplace Tenders (open gigs for developers to claim)
CREATE TABLE IF NOT EXISTS public.marketplace_tenders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID NOT NULL REFERENCES public.pipeline_stages(id) ON DELETE CASCADE,
    budget_max DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'open', -- open, in_progress, completed, cancelled
    awarded_developer_id UUID REFERENCES public.users(id),
    contract_id UUID REFERENCES public.contracts(id),
    created_at TIMESTAMPTZ(6) DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_tenders_stage ON public.marketplace_tenders(stage_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_tenders_status ON public.marketplace_tenders(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_tenders_developer ON public.marketplace_tenders(awarded_developer_id);

-- Enable RLS
ALTER TABLE public.fundraising_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_tenders ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Fundraising Rounds (public read, authenticated write)
CREATE POLICY "Public read access to open rounds" ON public.fundraising_rounds
    FOR SELECT USING (status IN ('open', 'fully_funded'));

CREATE POLICY "Authenticated users can create rounds" ON public.fundraising_rounds
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies: Investor Allocations (own records only)
CREATE POLICY "Users can view own allocations" ON public.investor_allocations
    FOR SELECT USING (investor_user_id = auth.uid());

CREATE POLICY "Users can create own allocations" ON public.investor_allocations
    FOR INSERT WITH CHECK (investor_user_id = auth.uid());

-- RLS Policies: Contracts (public read for active)
CREATE POLICY "Public read access to contracts" ON public.contracts
    FOR SELECT USING (true);

CREATE POLICY "Service role manages contracts" ON public.contracts
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies: Marketplace Tenders (public read, authenticated claim)
CREATE POLICY "Public read access to open tenders" ON public.marketplace_tenders
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can claim tenders" ON public.marketplace_tenders
    FOR UPDATE USING (
        auth.uid() IS NOT NULL
        AND status = 'open'
        AND awarded_developer_id IS NULL
    );

-- Comments
COMMENT ON TABLE public.fundraising_rounds IS 'Funding rounds linked to project pipeline stages';
COMMENT ON TABLE public.investor_allocations IS 'Individual investor contributions to funding rounds';
COMMENT ON TABLE public.contracts IS 'Service agreements and imported GitHub issue contracts';
COMMENT ON TABLE public.marketplace_tenders IS 'Open gigs for developers, created when funding completes';
