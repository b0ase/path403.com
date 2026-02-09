/**
 * @b0ase/unified-auth-ui
 *
 * Unified authentication UI types and utilities for multi-provider login.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Auth provider category */
export type AuthProviderCategory = 'oauth' | 'wallet' | 'email' | 'phone' | 'passkey';

/** OAuth provider */
export type OAuthProvider =
  | 'google'
  | 'github'
  | 'twitter'
  | 'discord'
  | 'apple'
  | 'facebook'
  | 'linkedin'
  | 'twitch';

/** Wallet provider */
export type WalletProvider =
  | 'metamask'
  | 'phantom'
  | 'handcash'
  | 'yours'
  | 'walletconnect'
  | 'coinbase'
  | 'ledger'
  | 'trezor';

/** Blockchain type */
export type BlockchainType = 'evm' | 'solana' | 'bsv' | 'bitcoin' | 'multi';

/** Auth provider */
export type AuthProvider = OAuthProvider | WalletProvider | 'email' | 'phone' | 'passkey';

/** Auth state */
export type AuthState =
  | 'idle'
  | 'connecting'
  | 'authenticating'
  | 'signing'
  | 'success'
  | 'error';

/** Auth error code */
export type AuthErrorCode =
  | 'user_cancelled'
  | 'wallet_not_installed'
  | 'connection_failed'
  | 'signature_rejected'
  | 'invalid_credentials'
  | 'account_not_found'
  | 'account_disabled'
  | 'rate_limited'
  | 'network_error'
  | 'unknown';

/** Provider configuration */
export interface ProviderConfig {
  id: AuthProvider;
  name: string;
  category: AuthProviderCategory;
  icon: string;
  color: string;
  darkColor?: string;
  blockchain?: BlockchainType;
  enabled: boolean;
  featured?: boolean;
  comingSoon?: boolean;
  beta?: boolean;
  redirectUrl?: string;
  scope?: string[];
}

/** User session */
export interface UserSession {
  id: string;
  provider: AuthProvider;
  providerAccountId?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  walletAddress?: string;
  blockchain?: BlockchainType;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  lastActiveAt: Date;
}

/** Auth error */
export interface AuthError {
  code: AuthErrorCode;
  message: string;
  provider?: AuthProvider;
  details?: Record<string, unknown>;
}

/** Auth modal state */
export interface AuthModalState {
  isOpen: boolean;
  view: AuthView;
  provider?: AuthProvider;
  state: AuthState;
  error?: AuthError;
  session?: UserSession;
}

/** Auth view */
export type AuthView =
  | 'providers'
  | 'email-input'
  | 'email-verify'
  | 'phone-input'
  | 'phone-verify'
  | 'wallet-connect'
  | 'wallet-sign'
  | 'loading'
  | 'success'
  | 'error';

/** Auth callbacks */
export interface AuthCallbacks {
  onAuthStart?: (provider: AuthProvider) => void;
  onAuthSuccess?: (session: UserSession) => void;
  onAuthError?: (error: AuthError) => void;
  onAuthCancel?: () => void;
  onSignMessage?: (message: string, address: string) => Promise<string>;
  onVerifySignature?: (signature: string, message: string, address: string) => Promise<boolean>;
}

/** Auth modal config */
export interface AuthModalConfig {
  title?: string;
  subtitle?: string;
  logo?: string;
  providers: ProviderConfig[];
  featured?: AuthProvider[];
  callbacks?: AuthCallbacks;
  theme?: 'light' | 'dark' | 'system';
  brandColor?: string;
  showTerms?: boolean;
  termsUrl?: string;
  privacyUrl?: string;
  allowGuestMode?: boolean;
}

// ============================================================================
// Default Provider Configs
// ============================================================================

export const OAUTH_PROVIDERS: Record<OAuthProvider, ProviderConfig> = {
  google: {
    id: 'google',
    name: 'Google',
    category: 'oauth',
    icon: 'google',
    color: '#4285F4',
    enabled: true,
    featured: true,
  },
  github: {
    id: 'github',
    name: 'GitHub',
    category: 'oauth',
    icon: 'github',
    color: '#24292e',
    darkColor: '#ffffff',
    enabled: true,
    featured: true,
  },
  twitter: {
    id: 'twitter',
    name: 'X (Twitter)',
    category: 'oauth',
    icon: 'twitter',
    color: '#000000',
    darkColor: '#ffffff',
    enabled: true,
  },
  discord: {
    id: 'discord',
    name: 'Discord',
    category: 'oauth',
    icon: 'discord',
    color: '#5865F2',
    enabled: true,
  },
  apple: {
    id: 'apple',
    name: 'Apple',
    category: 'oauth',
    icon: 'apple',
    color: '#000000',
    darkColor: '#ffffff',
    enabled: true,
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    category: 'oauth',
    icon: 'facebook',
    color: '#1877F2',
    enabled: false,
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    category: 'oauth',
    icon: 'linkedin',
    color: '#0A66C2',
    enabled: false,
  },
  twitch: {
    id: 'twitch',
    name: 'Twitch',
    category: 'oauth',
    icon: 'twitch',
    color: '#9146FF',
    enabled: false,
  },
};

export const WALLET_PROVIDERS: Record<WalletProvider, ProviderConfig> = {
  metamask: {
    id: 'metamask',
    name: 'MetaMask',
    category: 'wallet',
    icon: 'metamask',
    color: '#E2761B',
    blockchain: 'evm',
    enabled: true,
    featured: true,
  },
  phantom: {
    id: 'phantom',
    name: 'Phantom',
    category: 'wallet',
    icon: 'phantom',
    color: '#AB9FF2',
    blockchain: 'solana',
    enabled: true,
    featured: true,
  },
  handcash: {
    id: 'handcash',
    name: 'HandCash',
    category: 'wallet',
    icon: 'handcash',
    color: '#38CB7C',
    blockchain: 'bsv',
    enabled: true,
    featured: true,
  },
  yours: {
    id: 'yours',
    name: 'Yours Wallet',
    category: 'wallet',
    icon: 'yours',
    color: '#FF6B00',
    blockchain: 'bsv',
    enabled: true,
  },
  walletconnect: {
    id: 'walletconnect',
    name: 'WalletConnect',
    category: 'wallet',
    icon: 'walletconnect',
    color: '#3B99FC',
    blockchain: 'multi',
    enabled: true,
  },
  coinbase: {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    category: 'wallet',
    icon: 'coinbase',
    color: '#0052FF',
    blockchain: 'evm',
    enabled: true,
  },
  ledger: {
    id: 'ledger',
    name: 'Ledger',
    category: 'wallet',
    icon: 'ledger',
    color: '#000000',
    darkColor: '#ffffff',
    blockchain: 'multi',
    enabled: true,
  },
  trezor: {
    id: 'trezor',
    name: 'Trezor',
    category: 'wallet',
    icon: 'trezor',
    color: '#00A846',
    blockchain: 'multi',
    enabled: false,
    comingSoon: true,
  },
};

// ============================================================================
// Auth State Manager
// ============================================================================

export class AuthStateManager {
  private state: AuthModalState;
  private config: AuthModalConfig;
  private listeners: Set<(state: AuthModalState) => void> = new Set();

  constructor(config: AuthModalConfig) {
    this.config = config;
    this.state = {
      isOpen: false,
      view: 'providers',
      state: 'idle',
    };
  }

  getState(): AuthModalState {
    return { ...this.state };
  }

  getConfig(): AuthModalConfig {
    return { ...this.config };
  }

  subscribe(listener: (state: AuthModalState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  open(): void {
    this.state = {
      ...this.state,
      isOpen: true,
      view: 'providers',
      state: 'idle',
      error: undefined,
    };
    this.notify();
  }

  close(): void {
    this.state = {
      ...this.state,
      isOpen: false,
    };
    this.notify();
    this.config.callbacks?.onAuthCancel?.();
  }

  setView(view: AuthView): void {
    this.state = { ...this.state, view };
    this.notify();
  }

  selectProvider(provider: AuthProvider): void {
    const providerConfig = this.getProviderConfig(provider);
    if (!providerConfig || !providerConfig.enabled) {
      return;
    }

    this.state = {
      ...this.state,
      provider,
      state: 'connecting',
      view: providerConfig.category === 'wallet' ? 'wallet-connect' : 'loading',
    };
    this.notify();
    this.config.callbacks?.onAuthStart?.(provider);
  }

  setAuthenticating(): void {
    this.state = { ...this.state, state: 'authenticating' };
    this.notify();
  }

  setSigning(): void {
    this.state = { ...this.state, state: 'signing', view: 'wallet-sign' };
    this.notify();
  }

  setSuccess(session: UserSession): void {
    this.state = {
      ...this.state,
      state: 'success',
      view: 'success',
      session,
      error: undefined,
    };
    this.notify();
    this.config.callbacks?.onAuthSuccess?.(session);
  }

  setError(error: AuthError): void {
    this.state = {
      ...this.state,
      state: 'error',
      view: 'error',
      error,
    };
    this.notify();
    this.config.callbacks?.onAuthError?.(error);
  }

  reset(): void {
    this.state = {
      isOpen: this.state.isOpen,
      view: 'providers',
      state: 'idle',
      provider: undefined,
      error: undefined,
      session: undefined,
    };
    this.notify();
  }

  getProviderConfig(provider: AuthProvider): ProviderConfig | undefined {
    return this.config.providers.find(p => p.id === provider);
  }

  getProvidersByCategory(category: AuthProviderCategory): ProviderConfig[] {
    return this.config.providers.filter(
      p => p.category === category && p.enabled
    );
  }

  getFeaturedProviders(): ProviderConfig[] {
    if (this.config.featured && this.config.featured.length > 0) {
      return this.config.featured
        .map(id => this.getProviderConfig(id))
        .filter((p): p is ProviderConfig => !!p && p.enabled);
    }
    return this.config.providers.filter(p => p.featured && p.enabled);
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createAuthManager(config: AuthModalConfig): AuthStateManager {
  return new AuthStateManager(config);
}

export function createDefaultConfig(overrides?: Partial<AuthModalConfig>): AuthModalConfig {
  return {
    title: 'Sign in',
    subtitle: 'Choose your preferred sign in method',
    providers: [
      ...Object.values(OAUTH_PROVIDERS),
      ...Object.values(WALLET_PROVIDERS),
      {
        id: 'email',
        name: 'Email',
        category: 'email',
        icon: 'mail',
        color: '#6B7280',
        enabled: true,
      },
    ],
    featured: ['google', 'github', 'metamask', 'phantom'],
    theme: 'system',
    showTerms: true,
    ...overrides,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

export function getProviderIcon(provider: AuthProvider): string {
  const config = OAUTH_PROVIDERS[provider as OAuthProvider] ||
    WALLET_PROVIDERS[provider as WalletProvider];
  return config?.icon || provider;
}

export function getProviderColor(provider: AuthProvider, dark?: boolean): string {
  const config = OAUTH_PROVIDERS[provider as OAuthProvider] ||
    WALLET_PROVIDERS[provider as WalletProvider];
  if (!config) return '#6B7280';
  return dark && config.darkColor ? config.darkColor : config.color;
}

export function getProviderName(provider: AuthProvider): string {
  const config = OAUTH_PROVIDERS[provider as OAuthProvider] ||
    WALLET_PROVIDERS[provider as WalletProvider];
  return config?.name || provider;
}

export function getProviderCategory(provider: AuthProvider): AuthProviderCategory {
  if (provider in OAUTH_PROVIDERS) return 'oauth';
  if (provider in WALLET_PROVIDERS) return 'wallet';
  if (provider === 'email') return 'email';
  if (provider === 'phone') return 'phone';
  if (provider === 'passkey') return 'passkey';
  return 'oauth';
}

export function isWalletProvider(provider: AuthProvider): provider is WalletProvider {
  return provider in WALLET_PROVIDERS;
}

export function isOAuthProvider(provider: AuthProvider): provider is OAuthProvider {
  return provider in OAUTH_PROVIDERS;
}

export function getBlockchainType(provider: WalletProvider): BlockchainType | undefined {
  return WALLET_PROVIDERS[provider]?.blockchain;
}

export function createAuthError(
  code: AuthErrorCode,
  message?: string,
  provider?: AuthProvider
): AuthError {
  const defaultMessages: Record<AuthErrorCode, string> = {
    user_cancelled: 'Authentication was cancelled',
    wallet_not_installed: 'Wallet extension not detected',
    connection_failed: 'Failed to connect',
    signature_rejected: 'Signature request was rejected',
    invalid_credentials: 'Invalid credentials',
    account_not_found: 'Account not found',
    account_disabled: 'Account has been disabled',
    rate_limited: 'Too many attempts. Please try again later',
    network_error: 'Network error. Please check your connection',
    unknown: 'An unknown error occurred',
  };

  return {
    code,
    message: message || defaultMessages[code],
    provider,
  };
}

export function generateNonce(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function createSignMessage(domain: string, nonce: string, statement?: string): string {
  const parts = [
    `${domain} wants you to sign in with your wallet.`,
  ];

  if (statement) {
    parts.push('', statement);
  }

  parts.push(
    '',
    `Nonce: ${nonce}`,
    `Issued At: ${new Date().toISOString()}`
  );

  return parts.join('\n');
}

export function formatWalletAddress(address: string, chars: number = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
