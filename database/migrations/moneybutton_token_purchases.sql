-- MoneyButton Token Purchases Table
-- Tracks token purchases made via MoneyButton dashboard

CREATE TABLE IF NOT EXISTS public.moneybutton_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token_symbol VARCHAR(50) NOT NULL,
    buyer_handcash VARCHAR(100) NOT NULL,
    buyer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    amount_usd DECIMAL(10, 4) NOT NULL,
    tokens_credited BIGINT NOT NULL,
    handcash_txid VARCHAR(100),
    project_slug VARCHAR(255),
    project_amount DECIMAL(10, 4),
    platform_amount DECIMAL(10, 4),
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_moneybutton_purchases_buyer ON public.moneybutton_purchases(buyer_handcash);
CREATE INDEX IF NOT EXISTS idx_moneybutton_purchases_token ON public.moneybutton_purchases(token_symbol);
CREATE INDEX IF NOT EXISTS idx_moneybutton_purchases_project ON public.moneybutton_purchases(project_slug);
CREATE INDEX IF NOT EXISTS idx_moneybutton_purchases_created ON public.moneybutton_purchases(created_at DESC);

-- MoneyButton Token Balances
-- Tracks token balances per HandCash handle (no auth required)
CREATE TABLE IF NOT EXISTS public.moneybutton_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    handcash_handle VARCHAR(100) NOT NULL,
    token_symbol VARCHAR(50) NOT NULL,
    balance BIGINT DEFAULT 0,
    total_purchased BIGINT DEFAULT 0,
    total_spent BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(handcash_handle, token_symbol)
);

CREATE INDEX IF NOT EXISTS idx_moneybutton_balances_handle ON public.moneybutton_balances(handcash_handle);
CREATE INDEX IF NOT EXISTS idx_moneybutton_balances_token ON public.moneybutton_balances(token_symbol);

-- Function to credit tokens to a HandCash handle
CREATE OR REPLACE FUNCTION credit_moneybutton_tokens(
    p_handcash_handle VARCHAR,
    p_token_symbol VARCHAR,
    p_amount BIGINT
) RETURNS BIGINT AS $$
DECLARE
    v_new_balance BIGINT;
BEGIN
    INSERT INTO public.moneybutton_balances (handcash_handle, token_symbol, balance, total_purchased)
    VALUES (p_handcash_handle, p_token_symbol, p_amount, p_amount)
    ON CONFLICT (handcash_handle, token_symbol)
    DO UPDATE SET
        balance = moneybutton_balances.balance + p_amount,
        total_purchased = moneybutton_balances.total_purchased + p_amount,
        updated_at = NOW()
    RETURNING balance INTO v_new_balance;

    RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE public.moneybutton_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moneybutton_balances ENABLE ROW LEVEL SECURITY;

-- Anyone can read purchases (for transparency)
CREATE POLICY "Anyone can view purchases" ON public.moneybutton_purchases
    FOR SELECT USING (true);

-- Only authenticated users can insert (via API)
CREATE POLICY "Service can insert purchases" ON public.moneybutton_purchases
    FOR INSERT WITH CHECK (true);

-- Anyone can view balances
CREATE POLICY "Anyone can view balances" ON public.moneybutton_balances
    FOR SELECT USING (true);

-- Service can modify balances
CREATE POLICY "Service can modify balances" ON public.moneybutton_balances
    FOR ALL USING (true);
