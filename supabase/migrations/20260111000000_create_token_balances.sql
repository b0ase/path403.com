-- Token Balances System for b0ase.com
-- Supports BSV (BSV-21), ETH (ERC-20), and SOL (SPL) tokens

-- Enum for blockchain types
CREATE TYPE blockchain_type AS ENUM ('bsv', 'eth', 'sol');

-- Issued tokens table - tracks on-chain token deployments
CREATE TABLE IF NOT EXISTS public.issued_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Token identity
  symbol TEXT NOT NULL UNIQUE,          -- e.g., '$BOASE', '$NPG'
  name TEXT NOT NULL,                   -- e.g., 'Boase Corporation'
  blockchain blockchain_type NOT NULL,  -- Which chain the token is on

  -- On-chain data
  token_id TEXT,                        -- BSV: txid_vout, ETH: contract address, SOL: mint address
  deploy_tx_id TEXT,                    -- Deployment transaction ID
  is_deployed BOOLEAN DEFAULT FALSE,    -- Whether token exists on-chain

  -- Supply tracking
  total_supply BIGINT DEFAULT 1000000000,  -- 1 billion default
  decimals INT DEFAULT 0,               -- Decimal places (0 for whole tokens)

  -- House wallet tracking (for hybrid model)
  house_address TEXT,                   -- Address holding platform tokens
  current_utxo TEXT,                    -- BSV: current UTXO holding tokens
  on_chain_balance BIGINT DEFAULT 0,    -- Tokens currently on-chain at house

  -- Platform allocation
  platform_tokens BIGINT DEFAULT 10000000,  -- 1% = 10M of 1B

  -- Metadata
  icon_url TEXT,
  market_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- User token balances - tracks off-chain balances per user per token
CREATE TABLE IF NOT EXISTS public.user_token_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token_symbol TEXT NOT NULL REFERENCES public.issued_tokens(symbol) ON DELETE CASCADE,

  -- Balance tracking
  balance BIGINT DEFAULT 0 NOT NULL,           -- Current off-chain balance
  total_minted BIGINT DEFAULT 0 NOT NULL,      -- Total tokens ever credited
  total_withdrawn BIGINT DEFAULT 0 NOT NULL,   -- Total tokens sent to wallet

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- One balance record per user per token
  UNIQUE(user_id, token_symbol)
);

-- Withdrawal authorizations - audit trail for all withdrawals
CREATE TABLE IF NOT EXISTS public.withdrawal_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  token_symbol TEXT NOT NULL,

  -- Withdrawal details
  amount BIGINT NOT NULL,
  to_address TEXT NOT NULL,              -- Recipient wallet address
  blockchain blockchain_type NOT NULL,

  -- Transaction info
  tx_id TEXT,                            -- Blockchain transaction ID
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ
);

-- Mint logs - audit trail for token credits
CREATE TABLE IF NOT EXISTS public.mint_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  token_symbol TEXT NOT NULL,

  -- Mint details
  amount BIGINT NOT NULL,
  source TEXT NOT NULL,                  -- e.g., 'button_press', 'airdrop', 'purchase'
  source_reference TEXT,                 -- e.g., button handle, order ID

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Row level security
ALTER TABLE public.issued_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mint_logs ENABLE ROW LEVEL SECURITY;

-- Policies for issued_tokens (public read, admin write)
CREATE POLICY "Tokens are viewable by everyone"
  ON public.issued_tokens FOR SELECT
  USING (true);

-- Policies for user_token_balances (users see their own)
CREATE POLICY "Users can view their own balances"
  ON public.user_token_balances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert balances"
  ON public.user_token_balances FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update balances"
  ON public.user_token_balances FOR UPDATE
  USING (true);

-- Policies for withdrawal_logs (users see their own)
CREATE POLICY "Users can view their own withdrawals"
  ON public.withdrawal_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert withdrawals"
  ON public.withdrawal_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update withdrawals"
  ON public.withdrawal_logs FOR UPDATE
  USING (true);

-- Policies for mint_logs (users see their own)
CREATE POLICY "Users can view their own mints"
  ON public.mint_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert mints"
  ON public.mint_logs FOR INSERT
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_user_token_balances_user ON public.user_token_balances(user_id);
CREATE INDEX idx_user_token_balances_token ON public.user_token_balances(token_symbol);
CREATE INDEX idx_withdrawal_logs_user ON public.withdrawal_logs(user_id);
CREATE INDEX idx_withdrawal_logs_status ON public.withdrawal_logs(status);
CREATE INDEX idx_mint_logs_user ON public.mint_logs(user_id);
CREATE INDEX idx_mint_logs_token ON public.mint_logs(token_symbol);

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_issued_tokens_updated_at
  BEFORE UPDATE ON public.issued_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_token_balances_updated_at
  BEFORE UPDATE ON public.user_token_balances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to credit tokens to a user (used by API)
CREATE OR REPLACE FUNCTION credit_tokens(
  p_user_id UUID,
  p_token_symbol TEXT,
  p_amount BIGINT,
  p_source TEXT,
  p_source_reference TEXT DEFAULT NULL
) RETURNS BIGINT AS $$
DECLARE
  new_balance BIGINT;
BEGIN
  -- Insert or update user balance
  INSERT INTO public.user_token_balances (user_id, token_symbol, balance, total_minted)
  VALUES (p_user_id, p_token_symbol, p_amount, p_amount)
  ON CONFLICT (user_id, token_symbol)
  DO UPDATE SET
    balance = user_token_balances.balance + p_amount,
    total_minted = user_token_balances.total_minted + p_amount,
    updated_at = NOW()
  RETURNING balance INTO new_balance;

  -- Log the mint
  INSERT INTO public.mint_logs (user_id, token_symbol, amount, source, source_reference)
  VALUES (p_user_id, p_token_symbol, p_amount, p_source, p_source_reference);

  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to debit tokens from a user (for withdrawals)
CREATE OR REPLACE FUNCTION debit_tokens(
  p_user_id UUID,
  p_token_symbol TEXT,
  p_amount BIGINT
) RETURNS BIGINT AS $$
DECLARE
  current_balance BIGINT;
  new_balance BIGINT;
BEGIN
  -- Get current balance
  SELECT balance INTO current_balance
  FROM public.user_token_balances
  WHERE user_id = p_user_id AND token_symbol = p_token_symbol;

  IF current_balance IS NULL OR current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Update balance
  UPDATE public.user_token_balances
  SET
    balance = balance - p_amount,
    total_withdrawn = total_withdrawn + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id AND token_symbol = p_token_symbol
  RETURNING balance INTO new_balance;

  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
