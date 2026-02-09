-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    companies_house_number TEXT,
    registered_address TEXT,
    incorporation_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dormant', 'dissolved')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company tokens (share classes)
CREATE TABLE IF NOT EXISTS company_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    name TEXT NOT NULL,
    share_class TEXT DEFAULT 'Ordinary', -- e.g., 'Ordinary', 'Preference', 'A Shares', 'B Shares'
    total_supply BIGINT NOT NULL DEFAULT 0,
    nominal_value DECIMAL(18, 4) DEFAULT 0.01, -- e.g., £0.01 per share
    voting_rights BOOLEAN DEFAULT true,
    dividend_rights BOOLEAN DEFAULT true,
    blockchain TEXT CHECK (blockchain IN ('bsv', 'eth', 'sol')),
    token_contract_address TEXT, -- on-chain address if deployed
    is_deployed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, symbol)
);

-- Cap table entries (who owns what)
CREATE TABLE IF NOT EXISTS cap_table_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID NOT NULL REFERENCES company_tokens(id) ON DELETE CASCADE,
    holder_name TEXT NOT NULL,
    holder_email TEXT,
    holder_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    holder_wallet_address TEXT,
    shares_held BIGINT NOT NULL DEFAULT 0,
    percentage DECIMAL(5, 2) GENERATED ALWAYS AS (
        CASE WHEN shares_held > 0 THEN
            ROUND((shares_held::DECIMAL / NULLIF((SELECT total_supply FROM company_tokens WHERE id = token_id), 0)) * 100, 2)
        ELSE 0 END
    ) STORED,
    share_certificate_number TEXT,
    acquired_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Directors table
CREATE TABLE IF NOT EXISTS company_directors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'Director' CHECK (role IN ('Director', 'Secretary', 'Founder', 'CEO', 'CFO', 'CTO')),
    appointed_date DATE DEFAULT CURRENT_DATE,
    resigned_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE cap_table_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_directors ENABLE ROW LEVEL SECURITY;

-- Companies: owners can see/edit their own companies
CREATE POLICY "Users can view own companies" ON companies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own companies" ON companies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own companies" ON companies
    FOR UPDATE USING (auth.uid() = user_id);

-- Company tokens: visible to company owner
CREATE POLICY "Users can view tokens for own companies" ON company_tokens
    FOR SELECT USING (
        company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can manage tokens for own companies" ON company_tokens
    FOR ALL USING (
        company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
    );

-- Cap table: visible to company owner and token holders
CREATE POLICY "Users can view cap table for own companies" ON cap_table_entries
    FOR SELECT USING (
        token_id IN (
            SELECT ct.id FROM company_tokens ct
            JOIN companies c ON c.id = ct.company_id
            WHERE c.user_id = auth.uid()
        )
        OR holder_user_id = auth.uid()
    );

CREATE POLICY "Company owners can manage cap table" ON cap_table_entries
    FOR ALL USING (
        token_id IN (
            SELECT ct.id FROM company_tokens ct
            JOIN companies c ON c.id = ct.company_id
            WHERE c.user_id = auth.uid()
        )
    );

-- Directors: visible to company owner
CREATE POLICY "Users can view directors for own companies" ON company_directors
    FOR SELECT USING (
        company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
        OR user_id = auth.uid()
    );

CREATE POLICY "Company owners can manage directors" ON company_directors
    FOR ALL USING (
        company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
    );

-- Indexes
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_company_tokens_company_id ON company_tokens(company_id);
CREATE INDEX idx_cap_table_token_id ON cap_table_entries(token_id);
CREATE INDEX idx_cap_table_holder_user ON cap_table_entries(holder_user_id);
CREATE INDEX idx_directors_company_id ON company_directors(company_id);
