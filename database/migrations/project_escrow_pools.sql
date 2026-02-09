-- Project Escrow Pools
-- Tracks investor funds available for developer contracts per project
-- When investors buy tokens via MoneyButton, a portion goes to the project's escrow pool
-- This pool funds developer contracts for the project

CREATE TABLE IF NOT EXISTS public.project_escrow_pools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_slug VARCHAR(255) NOT NULL UNIQUE,

    -- Pool balances
    total_invested_usd DECIMAL(15, 2) DEFAULT 0,
    available_balance_usd DECIMAL(15, 2) DEFAULT 0,
    escrowed_in_contracts_usd DECIMAL(15, 2) DEFAULT 0,
    paid_to_developers_usd DECIMAL(15, 2) DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track each investor contribution to the pool
CREATE TABLE IF NOT EXISTS public.escrow_pool_contributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pool_id UUID REFERENCES public.project_escrow_pools(id) ON DELETE CASCADE,

    -- Contribution details
    contributor_handcash VARCHAR(100) NOT NULL,
    contribution_amount_usd DECIMAL(10, 2) NOT NULL,
    moneybutton_purchase_id UUID, -- Link to moneybutton_purchases

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track allocations from pool to contracts
CREATE TABLE IF NOT EXISTS public.escrow_pool_allocations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pool_id UUID REFERENCES public.project_escrow_pools(id) ON DELETE CASCADE,
    contract_id UUID NOT NULL, -- Link to marketplace_contracts

    -- Allocation details
    allocated_amount_usd DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- active, released, refunded

    -- When allocation is released or refunded
    released_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Developer token bonuses earned from completing milestones
CREATE TABLE IF NOT EXISTS public.developer_token_bonuses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Developer
    developer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    developer_handcash VARCHAR(100),

    -- Contract/Milestone
    contract_id UUID NOT NULL,
    milestone_id UUID NOT NULL,
    project_slug VARCHAR(255) NOT NULL,

    -- Token details
    token_symbol VARCHAR(50) NOT NULL,
    tokens_earned BIGINT NOT NULL,
    token_value_usd DECIMAL(10, 4) NOT NULL,

    -- Cash payment reference
    cash_amount_usd DECIMAL(10, 2) NOT NULL,
    payout_txid VARCHAR(100),

    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, credited, failed
    credited_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GitHub webhook tracking for PR merge detection
CREATE TABLE IF NOT EXISTS public.github_pr_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- GitHub details
    github_repo VARCHAR(255) NOT NULL,
    github_pr_number INT NOT NULL,
    github_pr_url TEXT NOT NULL,
    github_merge_commit VARCHAR(64),

    -- Link to milestone
    contract_id UUID NOT NULL,
    milestone_id UUID NOT NULL,

    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, merged, closed
    merged_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(github_repo, github_pr_number)
);

-- Contract termination tracking for failed contracts
CREATE TABLE IF NOT EXISTS public.contract_terminations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID NOT NULL,

    -- Termination details
    terminated_by UUID REFERENCES auth.users(id),
    termination_reason TEXT NOT NULL,
    termination_type VARCHAR(50) NOT NULL, -- 'developer_failure', 'client_cancel', 'mutual', 'dispute'

    -- Escrow handling
    escrow_action VARCHAR(50) NOT NULL, -- 'refund_to_pool', 'refund_to_client', 'partial_release'
    refunded_amount_usd DECIMAL(10, 2),
    released_amount_usd DECIMAL(10, 2),

    -- Re-tender info
    eligible_for_retender BOOLEAN DEFAULT true,
    retendered_at TIMESTAMPTZ,
    new_contract_id UUID,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_escrow_pool_project ON public.project_escrow_pools(project_slug);
CREATE INDEX IF NOT EXISTS idx_pool_contributions_pool ON public.escrow_pool_contributions(pool_id);
CREATE INDEX IF NOT EXISTS idx_pool_contributions_handcash ON public.escrow_pool_contributions(contributor_handcash);
CREATE INDEX IF NOT EXISTS idx_pool_allocations_pool ON public.escrow_pool_allocations(pool_id);
CREATE INDEX IF NOT EXISTS idx_pool_allocations_contract ON public.escrow_pool_allocations(contract_id);
CREATE INDEX IF NOT EXISTS idx_dev_token_bonuses_developer ON public.developer_token_bonuses(developer_user_id);
CREATE INDEX IF NOT EXISTS idx_dev_token_bonuses_contract ON public.developer_token_bonuses(contract_id);
CREATE INDEX IF NOT EXISTS idx_github_pr_contract ON public.github_pr_milestones(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_terminations_contract ON public.contract_terminations(contract_id);

-- RLS
ALTER TABLE public.project_escrow_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_pool_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_pool_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developer_token_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_pr_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_terminations ENABLE ROW LEVEL SECURITY;

-- Policies (allow service role full access)
CREATE POLICY "Service can manage escrow pools" ON public.project_escrow_pools FOR ALL USING (true);
CREATE POLICY "Service can manage contributions" ON public.escrow_pool_contributions FOR ALL USING (true);
CREATE POLICY "Service can manage allocations" ON public.escrow_pool_allocations FOR ALL USING (true);
CREATE POLICY "Service can manage token bonuses" ON public.developer_token_bonuses FOR ALL USING (true);
CREATE POLICY "Service can manage github prs" ON public.github_pr_milestones FOR ALL USING (true);
CREATE POLICY "Service can manage terminations" ON public.contract_terminations FOR ALL USING (true);

-- Function to create/update escrow pool when investment is made
CREATE OR REPLACE FUNCTION add_investment_to_escrow_pool(
    p_project_slug VARCHAR(255),
    p_contributor_handcash VARCHAR(100),
    p_amount_usd DECIMAL(10, 2),
    p_purchase_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_pool_id UUID;
BEGIN
    -- Get or create pool
    INSERT INTO public.project_escrow_pools (project_slug, total_invested_usd, available_balance_usd)
    VALUES (p_project_slug, p_amount_usd, p_amount_usd)
    ON CONFLICT (project_slug) DO UPDATE SET
        total_invested_usd = project_escrow_pools.total_invested_usd + EXCLUDED.total_invested_usd,
        available_balance_usd = project_escrow_pools.available_balance_usd + p_amount_usd,
        updated_at = NOW()
    RETURNING id INTO v_pool_id;

    -- Record contribution
    INSERT INTO public.escrow_pool_contributions (pool_id, contributor_handcash, contribution_amount_usd, moneybutton_purchase_id)
    VALUES (v_pool_id, p_contributor_handcash, p_amount_usd, p_purchase_id);

    RETURN v_pool_id;
END;
$$ LANGUAGE plpgsql;

-- Function to allocate from pool to a contract
CREATE OR REPLACE FUNCTION allocate_escrow_to_contract(
    p_project_slug VARCHAR(255),
    p_contract_id UUID,
    p_amount_usd DECIMAL(10, 2)
)
RETURNS UUID AS $$
DECLARE
    v_pool_id UUID;
    v_available DECIMAL(10, 2);
    v_allocation_id UUID;
BEGIN
    -- Get pool and check balance
    SELECT id, available_balance_usd INTO v_pool_id, v_available
    FROM public.project_escrow_pools
    WHERE project_slug = p_project_slug
    FOR UPDATE;

    IF v_pool_id IS NULL THEN
        RAISE EXCEPTION 'No escrow pool found for project: %', p_project_slug;
    END IF;

    IF v_available < p_amount_usd THEN
        RAISE EXCEPTION 'Insufficient funds in escrow pool. Available: %, Requested: %', v_available, p_amount_usd;
    END IF;

    -- Update pool balances
    UPDATE public.project_escrow_pools
    SET
        available_balance_usd = available_balance_usd - p_amount_usd,
        escrowed_in_contracts_usd = escrowed_in_contracts_usd + p_amount_usd,
        updated_at = NOW()
    WHERE id = v_pool_id;

    -- Create allocation
    INSERT INTO public.escrow_pool_allocations (pool_id, contract_id, allocated_amount_usd)
    VALUES (v_pool_id, p_contract_id, p_amount_usd)
    RETURNING id INTO v_allocation_id;

    RETURN v_allocation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to refund allocation back to pool (for failed contracts)
CREATE OR REPLACE FUNCTION refund_allocation_to_pool(
    p_allocation_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_allocation RECORD;
BEGIN
    -- Get and lock allocation
    SELECT * INTO v_allocation
    FROM public.escrow_pool_allocations
    WHERE id = p_allocation_id AND status = 'active'
    FOR UPDATE;

    IF v_allocation IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Update pool balances
    UPDATE public.project_escrow_pools
    SET
        available_balance_usd = available_balance_usd + v_allocation.allocated_amount_usd,
        escrowed_in_contracts_usd = escrowed_in_contracts_usd - v_allocation.allocated_amount_usd,
        updated_at = NOW()
    WHERE id = v_allocation.pool_id;

    -- Mark allocation as refunded
    UPDATE public.escrow_pool_allocations
    SET status = 'refunded', refunded_at = NOW()
    WHERE id = p_allocation_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to mark allocation as released (after developer payment)
CREATE OR REPLACE FUNCTION release_allocation(
    p_allocation_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_allocation RECORD;
BEGIN
    -- Get and lock allocation
    SELECT * INTO v_allocation
    FROM public.escrow_pool_allocations
    WHERE id = p_allocation_id AND status = 'active'
    FOR UPDATE;

    IF v_allocation IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Update pool balances
    UPDATE public.project_escrow_pools
    SET
        escrowed_in_contracts_usd = escrowed_in_contracts_usd - v_allocation.allocated_amount_usd,
        paid_to_developers_usd = paid_to_developers_usd + v_allocation.allocated_amount_usd,
        updated_at = NOW()
    WHERE id = v_allocation.pool_id;

    -- Mark allocation as released
    UPDATE public.escrow_pool_allocations
    SET status = 'released', released_at = NOW()
    WHERE id = p_allocation_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
