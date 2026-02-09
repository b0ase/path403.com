-- Investor Agreements Migration
-- For tracking co-founder/investor agreements with performance-based terms
-- Created: 2026-01-26

-- Table: investor_agreements
-- Tracks domain-specific investment agreements with performance obligations
CREATE TABLE IF NOT EXISTS investor_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Link to auth.users (the investor's user account)
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Investor details (denormalized for quick access)
    investor_name VARCHAR(255) NOT NULL,
    investor_email VARCHAR(255) NOT NULL,
    investor_wallet_address VARCHAR(255),

    -- Agreement type
    agreement_type VARCHAR(50) NOT NULL DEFAULT 'domain_exit_rights',
    -- Options: 'domain_exit_rights', 'equity', 'revenue_share', 'token_sale'

    -- Properties covered by this agreement (JSONB array)
    properties JSONB NOT NULL DEFAULT '[]',
    -- Example: ["BSVEX.com", "DNS-DEX.com"]

    -- Investment details
    investment_amount_bsv DECIMAL(18, 8) NOT NULL,
    investment_amount_usd DECIMAL(15, 2),
    investment_txid VARCHAR(64), -- BSV transaction ID for the investment
    investment_date TIMESTAMPTZ DEFAULT NOW(),

    -- Equity allocation
    initial_equity_percentage DECIMAL(7, 4) NOT NULL, -- e.g., 50.0000
    current_equity_percentage DECIMAL(7, 4) NOT NULL, -- May change due to dilution

    -- Performance obligations (JSONB for flexibility)
    performance_obligations JSONB NOT NULL DEFAULT '{}',
    -- Example:
    -- {
    --   "option_a": { "type": "capital_raising", "target_usd": 10000, "met": false },
    --   "option_b": { "type": "development_work", "description": "Build MVP", "met": false },
    --   "option_c": { "type": "pro_rata_capital", "description": "Join capital raises", "met": false },
    --   "option_d": { "type": "equity_funded_dev", "description": "Fund dev via equity", "met": false }
    -- }

    -- Performance tracking
    performance_deadline TIMESTAMPTZ NOT NULL,
    performance_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- Options: 'pending', 'option_a_met', 'option_b_met', 'option_c_met', 'option_d_met', 'multiple_met', 'failed'

    performance_notes TEXT,
    performance_evidence JSONB DEFAULT '[]',
    -- Array of evidence records: [{ "date": "...", "type": "capital_raised", "amount": 5000, "notes": "..." }]

    -- Clawback mechanism
    clawback_status VARCHAR(50) NOT NULL DEFAULT 'active',
    -- Options: 'active' (can be triggered), 'triggered' (executed), 'waived' (investor performed)
    clawback_triggered_at TIMESTAMPTZ,
    clawback_reason TEXT,

    -- Contract storage
    contract_json JSONB NOT NULL, -- Full contract stored as JSON
    contract_html_path VARCHAR(500), -- Path to HTML version
    contract_pdf_path VARCHAR(500), -- Path to PDF version

    -- Blockchain inscription
    contract_txid VARCHAR(64), -- BSV transaction ID for contract inscription
    contract_inscription_id VARCHAR(100),

    -- Monthly sync tracking
    monthly_sync_schedule VARCHAR(100) DEFAULT '1st Wednesday 10:00 AM PT',
    monthly_sync_history JSONB DEFAULT '[]',
    -- Array: [{ "date": "2026-02-05", "notes": "Discussed capital raising progress", "action_items": [...] }]
    next_sync_date TIMESTAMPTZ,

    -- Milestone dates
    six_month_review_date TIMESTAMPTZ,
    six_month_review_status VARCHAR(50) DEFAULT 'pending',
    -- Options: 'pending', 'passed', 'cure_notice_issued', 'failed'

    twelve_month_decision_date TIMESTAMPTZ,
    twelve_month_decision VARCHAR(50) DEFAULT 'pending',
    -- Options: 'pending', 'tokens_valid', 'clawback_executed'

    -- Metadata
    founder_user_id UUID REFERENCES auth.users(id), -- The founder/developer
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_agreement_type CHECK (agreement_type IN ('domain_exit_rights', 'equity', 'revenue_share', 'token_sale')),
    CONSTRAINT valid_performance_status CHECK (performance_status IN ('pending', 'option_a_met', 'option_b_met', 'option_c_met', 'option_d_met', 'multiple_met', 'failed')),
    CONSTRAINT valid_clawback_status CHECK (clawback_status IN ('active', 'triggered', 'waived'))
);

-- Indexes for investor_agreements
CREATE INDEX IF NOT EXISTS idx_investor_agreements_user_id ON investor_agreements(user_id);
CREATE INDEX IF NOT EXISTS idx_investor_agreements_agreement_type ON investor_agreements(agreement_type);
CREATE INDEX IF NOT EXISTS idx_investor_agreements_performance_status ON investor_agreements(performance_status);
CREATE INDEX IF NOT EXISTS idx_investor_agreements_clawback_status ON investor_agreements(clawback_status);
CREATE INDEX IF NOT EXISTS idx_investor_agreements_performance_deadline ON investor_agreements(performance_deadline);
CREATE INDEX IF NOT EXISTS idx_investor_agreements_created_at ON investor_agreements(created_at);

-- Table: domain_exit_tokens
-- Tracks domain-specific exit rights tokens
CREATE TABLE IF NOT EXISTS domain_exit_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Link to agreement
    agreement_id UUID NOT NULL REFERENCES investor_agreements(id) ON DELETE CASCADE,

    -- Domain details
    domain_name VARCHAR(255) NOT NULL,
    domain_registrar VARCHAR(255),
    domain_registered_at TIMESTAMPTZ,
    domain_expires_at TIMESTAMPTZ,

    -- Token details
    token_name VARCHAR(100) NOT NULL, -- e.g., "BSVEX Domain Sale Rights"
    token_symbol VARCHAR(20) NOT NULL, -- e.g., "BSVEX-EXIT"
    total_supply BIGINT NOT NULL DEFAULT 1000000000, -- 1 billion tokens

    -- Allocations
    founder_tokens BIGINT NOT NULL,
    founder_wallet_address VARCHAR(255),
    investor_tokens BIGINT NOT NULL,
    investor_wallet_address VARCHAR(255),

    -- Token status
    token_status VARCHAR(50) NOT NULL DEFAULT 'active',
    -- Options: 'pending_mint', 'active', 'forfeited', 'redeemed'
    forfeited_at TIMESTAMPTZ,
    forfeited_reason TEXT,

    -- Blockchain details
    minting_txid VARCHAR(64),
    inscription_id VARCHAR(100),
    inscription_number BIGINT,
    block_height BIGINT,

    -- Exit event (when domain sells)
    exit_triggered BOOLEAN DEFAULT FALSE,
    exit_sale_price_usd DECIMAL(15, 2),
    exit_sale_date TIMESTAMPTZ,
    exit_buyer VARCHAR(255),

    -- Payouts (when domain sells)
    founder_payout_usd DECIMAL(15, 2),
    founder_payout_txid VARCHAR(64),
    investor_payout_usd DECIMAL(15, 2),
    investor_payout_txid VARCHAR(64),

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_token_status CHECK (token_status IN ('pending_mint', 'active', 'forfeited', 'redeemed')),
    CONSTRAINT unique_domain_per_agreement UNIQUE (agreement_id, domain_name)
);

-- Indexes for domain_exit_tokens
CREATE INDEX IF NOT EXISTS idx_domain_exit_tokens_agreement_id ON domain_exit_tokens(agreement_id);
CREATE INDEX IF NOT EXISTS idx_domain_exit_tokens_domain_name ON domain_exit_tokens(domain_name);
CREATE INDEX IF NOT EXISTS idx_domain_exit_tokens_token_status ON domain_exit_tokens(token_status);
CREATE INDEX IF NOT EXISTS idx_domain_exit_tokens_minting_txid ON domain_exit_tokens(minting_txid);

-- Table: agreement_performance_logs
-- Audit trail of performance updates
CREATE TABLE IF NOT EXISTS agreement_performance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    agreement_id UUID NOT NULL REFERENCES investor_agreements(id) ON DELETE CASCADE,

    -- Log details
    log_type VARCHAR(50) NOT NULL,
    -- Options: 'capital_raised', 'work_completed', 'pro_rata_participated', 'equity_funded', 'sync_call', 'review', 'clawback', 'other'

    log_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Amount (for capital-related logs)
    amount_usd DECIMAL(15, 2),
    amount_bsv DECIMAL(18, 8),

    -- Description
    description TEXT NOT NULL,

    -- Evidence
    evidence_url VARCHAR(500),
    evidence_type VARCHAR(50), -- 'github_commit', 'invoice', 'bank_statement', 'contract', 'email', 'other'

    -- Who logged it
    logged_by_user_id UUID REFERENCES auth.users(id),
    logged_by_name VARCHAR(255),

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for agreement_performance_logs
CREATE INDEX IF NOT EXISTS idx_performance_logs_agreement_id ON agreement_performance_logs(agreement_id);
CREATE INDEX IF NOT EXISTS idx_performance_logs_log_type ON agreement_performance_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_performance_logs_log_date ON agreement_performance_logs(log_date);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_investor_agreement_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for investor_agreements
DROP TRIGGER IF EXISTS update_investor_agreements_timestamp ON investor_agreements;
CREATE TRIGGER update_investor_agreements_timestamp
    BEFORE UPDATE ON investor_agreements
    FOR EACH ROW
    EXECUTE FUNCTION update_investor_agreement_timestamp();

-- Trigger for domain_exit_tokens
DROP TRIGGER IF EXISTS update_domain_exit_tokens_timestamp ON domain_exit_tokens;
CREATE TRIGGER update_domain_exit_tokens_timestamp
    BEFORE UPDATE ON domain_exit_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_investor_agreement_timestamp();

-- Enable Row Level Security
ALTER TABLE investor_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_exit_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreement_performance_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investor_agreements
-- Users can read their own agreements
CREATE POLICY "Users can view own agreements" ON investor_agreements
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = founder_user_id);

-- Only founders can insert/update agreements
CREATE POLICY "Founders can manage agreements" ON investor_agreements
    FOR ALL USING (auth.uid() = founder_user_id);

-- RLS Policies for domain_exit_tokens
-- Users can view tokens for agreements they're part of
CREATE POLICY "Users can view tokens for their agreements" ON domain_exit_tokens
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM investor_agreements
            WHERE investor_agreements.id = domain_exit_tokens.agreement_id
            AND (investor_agreements.user_id = auth.uid() OR investor_agreements.founder_user_id = auth.uid())
        )
    );

-- RLS Policies for agreement_performance_logs
-- Users can view logs for their agreements
CREATE POLICY "Users can view performance logs" ON agreement_performance_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM investor_agreements
            WHERE investor_agreements.id = agreement_performance_logs.agreement_id
            AND (investor_agreements.user_id = auth.uid() OR investor_agreements.founder_user_id = auth.uid())
        )
    );

-- Grant permissions
GRANT ALL ON investor_agreements TO authenticated;
GRANT ALL ON domain_exit_tokens TO authenticated;
GRANT ALL ON agreement_performance_logs TO authenticated;

-- Comments for documentation
COMMENT ON TABLE investor_agreements IS 'Stores co-founder/investor agreements with performance-based terms and clawback mechanisms';
COMMENT ON TABLE domain_exit_tokens IS 'Tracks domain-specific exit rights tokens for each agreement';
COMMENT ON TABLE agreement_performance_logs IS 'Audit trail of all performance updates and milestones';

COMMENT ON COLUMN investor_agreements.performance_obligations IS 'JSON object with 4 options: capital_raising, development_work, pro_rata_capital, equity_funded_dev';
COMMENT ON COLUMN investor_agreements.clawback_status IS 'active=can be triggered, triggered=executed, waived=investor performed';
COMMENT ON COLUMN domain_exit_tokens.token_status IS 'pending_mint, active, forfeited (clawback), or redeemed (exit)';
