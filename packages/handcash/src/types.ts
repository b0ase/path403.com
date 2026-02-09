/**
 * @b0ase/handcash - Shared Types
 *
 * These types are used across all HandCash integrations in the b0ase ecosystem.
 */

// ============================================================================
// Profile Types
// ============================================================================

export interface HandCashPublicProfile {
  id: string;
  handle: string;
  paymail: string;
  displayName: string;
  avatarUrl: string;
  localCurrencyCode: string;
}

export interface HandCashPrivateProfile {
  email: string;
  phoneNumber: string;
}

export interface HandCashProfile {
  publicProfile: HandCashPublicProfile;
  privateProfile?: HandCashPrivateProfile;
}

// ============================================================================
// Balance Types
// ============================================================================

export interface HandCashBalance {
  bsv: number;
  usd: number;
  satoshis?: number;
}

export interface SpendableBalance {
  spendableSatoshiBalance: number;
  spendableFiatBalance: number;
  currencyCode: string;
}

// ============================================================================
// Asset Types
// ============================================================================

export interface HandCashAsset {
  id: string;
  type: 'token' | 'nft' | 'file';
  name: string;
  ticker?: string;
  amount?: number;
  icon?: string;
  metadata?: Record<string, unknown>;
}

export interface HandCashItem {
  origin: string;
  name: string;
  description?: string;
  imageUrl?: string;
  attributes?: Record<string, unknown>;
}

// ============================================================================
// Payment Types
// ============================================================================

export interface PaymentDestination {
  destination: string;
  amount: number;
  currencyCode?: string;
}

export interface SinglePaymentParams {
  destination: string;
  amount: number;
  currency?: string;
  description?: string;
}

export interface MultiPaymentParams {
  payments: PaymentDestination[];
  description?: string;
  appAction?: 'PAY' | 'TIPPING' | 'PAYMENT';
}

/**
 * Payment result from HandCash SDK.
 * Using Record for participants to accommodate SDK type variations.
 */
export interface PaymentResult {
  transactionId: string;
  note?: string;
  type?: string;
  time?: number;
  satoshiFees?: number;
  fiatExchangeRate?: number;
  participants?: Array<Record<string, unknown>>;
}

// ============================================================================
// Auth Types
// ============================================================================

export interface HandCashAuthResponse {
  authToken: string;
  profile: HandCashProfile;
}

export interface HandCashAuthState {
  isAuthenticated: boolean;
  profile: HandCashProfile | null;
  authToken: string | null;
}

// ============================================================================
// Transfer Types
// ============================================================================

export interface TransferItemsParams {
  origins: string[];
  destination: string;
}

export interface TransferResult {
  transactionId: string;
}

// ============================================================================
// Context Types (for React Provider)
// ============================================================================

export interface HandCashContextType {
  // State
  isAuthenticated: boolean;
  profile: HandCashProfile | null;
  balance: HandCashBalance | null;
  assets: HandCashAsset[];
  isLoading: boolean;
  error: string | null;

  // Auth Actions
  signIn: () => Promise<void>;
  signOut: () => void;
  getOAuthUrl: () => string;
  handleCallback: (code: string) => Promise<boolean>;

  // Wallet Actions
  refreshBalance: () => Promise<void>;
  refreshAssets: () => Promise<void>;
  sendPayment: (to: string, amount: number, currency?: string) => Promise<string | null>;
}

// ============================================================================
// Config Types
// ============================================================================

export interface HandCashConfig {
  appId: string;
  appSecret?: string; // Only for server-side
  environment?: 'production' | 'sandbox';
}

export interface HandCashClientConfig {
  appId: string;
  redirectUri?: string;
  permissions?: string[];
}

// ============================================================================
// Error Types
// ============================================================================

export class HandCashError extends Error {
  code: string;

  constructor(message: string, code: string = 'HANDCASH_ERROR') {
    super(message);
    this.name = 'HandCashError';
    this.code = code;
  }
}

export class HandCashDemoModeError extends HandCashError {
  constructor() {
    super('HandCash is in DEMO MODE - real operations unavailable', 'DEMO_MODE');
  }
}

export class HandCashAuthError extends HandCashError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_REQUIRED');
  }
}
