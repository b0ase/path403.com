-- Staking Agreements Table
-- Formal staking agreements between users and projects

CREATE TABLE IF NOT EXISTS public.staking_agreements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Parties
    staker_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    staker_handcash VARCHAR(100),
    staker_name VARCHAR(255),
    staker_email VARCHAR(255),

    -- Project/Token
    project_slug VARCHAR(255),
    token_symbol VARCHAR(50) NOT NULL,

    -- Staking terms
    stake_amount BIGINT NOT NULL,
    stake_value_usd DECIMAL(15, 2),
    lock_period_days INT DEFAULT 0,
    unlock_date TIMESTAMPTZ,

    -- Rewards
    reward_rate_percent DECIMAL(5, 2) DEFAULT 0,
    rewards_earned BIGINT DEFAULT 0,

    -- Agreement details
    agreement_hash VARCHAR(64),
    blockchain_txid VARCHAR(100),
    blockchain_url TEXT,

    -- Status
    status VARCHAR(50) DEFAULT 'active',
    signed_at TIMESTAMPTZ,
    unstaked_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staking_user ON public.staking_agreements(staker_user_id);
CREATE INDEX IF NOT EXISTS idx_staking_handcash ON public.staking_agreements(staker_handcash);
CREATE INDEX IF NOT EXISTS idx_staking_project ON public.staking_agreements(project_slug);
CREATE INDEX IF NOT EXISTS idx_staking_status ON public.staking_agreements(status);

-- Milestone completion tracking for token unlocks
CREATE TABLE IF NOT EXISTS public.milestone_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tranche_id UUID NOT NULL,
    project_slug VARCHAR(255) NOT NULL,

    -- Completion details
    completed_by UUID REFERENCES auth.users(id),
    completion_notes TEXT,
    evidence_url TEXT,

    -- Token unlock
    tokens_unlocked BIGINT DEFAULT 0,
    unlock_txid VARCHAR(100),

    -- Verification
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,

    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milestone_tranche ON public.milestone_completions(tranche_id);
CREATE INDEX IF NOT EXISTS idx_milestone_project ON public.milestone_completions(project_slug);

-- UK Companies House form data
CREATE TABLE IF NOT EXISTS public.companies_house_filings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Company
    company_id UUID,
    company_number VARCHAR(20),
    company_name VARCHAR(255) NOT NULL,

    -- Form type
    form_type VARCHAR(20) NOT NULL, -- 'SH01', 'CS01', 'AR01'
    form_data JSONB NOT NULL,

    -- Generation
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    generated_by UUID REFERENCES auth.users(id),

    -- Filing
    filed_at TIMESTAMPTZ,
    filing_reference VARCHAR(100),

    -- Document
    pdf_url TEXT,
    pdf_hash VARCHAR(64),

    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ch_company ON public.companies_house_filings(company_number);
CREATE INDEX IF NOT EXISTS idx_ch_form_type ON public.companies_house_filings(form_type);

-- Share certificate generation tracking
CREATE TABLE IF NOT EXISTS public.share_certificate_generations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    certificate_id UUID REFERENCES public.certificates(id),

    -- PDF details
    pdf_url TEXT,
    pdf_hash VARCHAR(64),
    pdf_size_bytes INT,

    -- Template used
    template_version VARCHAR(20) DEFAULT 'v1',

    -- Blockchain
    inscription_txid VARCHAR(100),
    inscription_url TEXT,

    generated_at TIMESTAMPTZ DEFAULT NOW(),
    generated_by UUID REFERENCES auth.users(id)
);

-- RLS
ALTER TABLE public.staking_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies_house_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_certificate_generations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their staking agreements" ON public.staking_agreements
    FOR SELECT USING (staker_user_id = auth.uid() OR true);

CREATE POLICY "Service can manage staking" ON public.staking_agreements
    FOR ALL USING (true);

CREATE POLICY "View milestone completions" ON public.milestone_completions
    FOR SELECT USING (true);

CREATE POLICY "Service can manage milestones" ON public.milestone_completions
    FOR ALL USING (true);

CREATE POLICY "View filings" ON public.companies_house_filings
    FOR SELECT USING (true);

CREATE POLICY "Service can manage filings" ON public.companies_house_filings
    FOR ALL USING (true);

CREATE POLICY "View certificate generations" ON public.share_certificate_generations
    FOR SELECT USING (true);

CREATE POLICY "Service can manage generations" ON public.share_certificate_generations
    FOR ALL USING (true);
