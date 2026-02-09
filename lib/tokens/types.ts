/**
 * $402 Token Marketplace Types
 */

export type PricingModel = 'sqrt_decay' | 'fixed' | 'linear_decay';
export type AccessMode = 'token' | 'usage' | 'hybrid' | 'public';
export type TxType = 'acquire' | 'transfer' | 'serve' | 'stake' | 'unstake';

export interface UsagePricing {
  enabled?: boolean;
  unit_ms: number;
  price_sats_per_unit: number;
  prepay_ms?: number;
  grace_ms?: number;
  min_payment_sats?: number;
  max_payment_sats?: number;
  accepted_networks?: string[];
  payment_address?: string;
}

export interface DividendPolicy {
  enabled?: boolean;
  stake_required?: boolean;
  kyc_required?: boolean;
  issuer_share_bps?: number;
  stakers_share_bps?: number;
  facilitator_share_bps?: number;
}

export interface Token {
  id: string;
  address: string; // e.g., "$b0ase.com/$blog"

  // Metadata
  name: string;
  description?: string;
  content_type?: string;
  icon_url?: string;
  access_url?: string;

  // Issuer
  issuer_handle: string;
  issuer_address?: string;

  // Pricing
  pricing_model: PricingModel;
  base_price_sats: number;
  decay_factor: number;

  // Supply
  total_supply: number;
  max_supply?: number;
  treasury_balance: number;

  // Revenue split (basis points)
  issuer_share_bps: number;
  facilitator_share_bps: number;

  // Access + usage
  access_mode?: AccessMode;
  parent_address?: string;
  parent_share_bps?: number;
  inscription_id?: string;
  usage_pricing?: UsagePricing;
  dividend_policy?: DividendPolicy;

  // Status
  is_active: boolean;
  is_verified: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface TokenWithPrice extends Token {
  current_price_sats: number;
  market_cap_sats: number;
}

export interface TokenHolding {
  id: string;
  token_address: string;
  holder_handle?: string;
  holder_address?: string;

  balance: number;
  staked_balance: number;

  total_acquired: number;
  total_spent_sats: number;
  avg_cost_sats: number;

  first_acquired_at: string;
  last_acquired_at?: string;
}

export interface TokenTransaction {
  id: string;
  token_address: string;

  from_handle?: string;
  from_address?: string;
  to_handle: string;
  to_address?: string;

  tx_type: TxType;
  amount: number;
  price_sats?: number;
  unit_price_sats?: number;

  issuer_revenue_sats?: number;
  facilitator_revenue_sats?: number;

  payment_tx_id?: string;
  inscription_id?: string;

  created_at: string;
}

export interface TokenServe {
  id: string;
  token_address: string;

  server_handle: string;
  requester_handle?: string;
  requester_address?: string;

  resource_path: string;
  tokens_consumed: number;
  revenue_earned_sats: number;

  served_at: string;
}

export interface TokenUsageSession {
  id: string;
  token_address: string;
  viewer_handle?: string;
  viewer_address?: string;
  expires_at: string;
  last_payment_tx_id?: string;
  total_paid_sats: number;
  created_at: string;
  updated_at: string;
}

export interface TokenUsagePayment {
  id: string;
  token_address: string;
  viewer_handle?: string;
  viewer_address?: string;
  payment_tx_id: string;
  paid_sats: number;
  unit_ms: number;
  price_sats_per_unit: number;
  grant_ms: number;
  expires_at: string;
  created_at: string;
}

// API Request/Response types

export interface RegisterTokenRequest {
  address: string;
  name: string;
  description?: string;
  content_type?: string;
  icon_url?: string;
  access_url?: string;
  pricing_model?: PricingModel;
  base_price_sats?: number;
  max_supply?: number;
  issuer_share_bps?: number;
  issuer_address?: string;
  access_mode?: AccessMode;
  parent_address?: string;
  parent_share_bps?: number;
  usage_pricing?: UsagePricing;
  dividend_policy?: DividendPolicy;
}

export interface AcquireTokenRequest {
  amount?: number; // Number of tokens to acquire
  spend_sats?: number; // Or specify how much to spend
}

export interface AcquireTokenResponse {
  success: boolean;
  acquired: number;
  total_cost_sats: number;
  avg_price_sats: number;
  new_balance: number;
  content?: {
    type: string;
    value: string;
    expires?: string;
  };
  tx_id?: string;
  error?: string;
}

export interface TransferTokenRequest {
  token_address: string;
  amount: number;
  to_handle?: string;
  to_address?: string;
}

export interface TransferTokenResponse {
  success: boolean;
  transferred: number;
  from: string;
  to: string;
  tx_id?: string;
  error?: string;
}

export interface HoldingsResponse {
  holdings: Array<TokenHolding & {
    token: TokenWithPrice;
    current_value_sats: number;
    unrealized_pnl_sats: number;
  }>;
  total_value_sats: number;
  total_cost_sats: number;
  net_pnl_sats: number;
}

export interface HistoryResponse {
  transactions: TokenTransaction[];
  total: number;
  has_more: boolean;
}
