/**
 * @b0ase/unified-auth-ui
 *
 * Unified authentication UI types and utilities for multi-provider login.
 *
 * @packageDocumentation
 */
/** Auth provider category */
type AuthProviderCategory = 'oauth' | 'wallet' | 'email' | 'phone' | 'passkey';
/** OAuth provider */
type OAuthProvider = 'google' | 'github' | 'twitter' | 'discord' | 'apple' | 'facebook' | 'linkedin' | 'twitch';
/** Wallet provider */
type WalletProvider = 'metamask' | 'phantom' | 'handcash' | 'yours' | 'walletconnect' | 'coinbase' | 'ledger' | 'trezor';
/** Blockchain type */
type BlockchainType = 'evm' | 'solana' | 'bsv' | 'bitcoin' | 'multi';
/** Auth provider */
type AuthProvider = OAuthProvider | WalletProvider | 'email' | 'phone' | 'passkey';
/** Auth state */
type AuthState = 'idle' | 'connecting' | 'authenticating' | 'signing' | 'success' | 'error';
/** Auth error code */
type AuthErrorCode = 'user_cancelled' | 'wallet_not_installed' | 'connection_failed' | 'signature_rejected' | 'invalid_credentials' | 'account_not_found' | 'account_disabled' | 'rate_limited' | 'network_error' | 'unknown';
/** Provider configuration */
interface ProviderConfig {
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
interface UserSession {
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
interface AuthError {
    code: AuthErrorCode;
    message: string;
    provider?: AuthProvider;
    details?: Record<string, unknown>;
}
/** Auth modal state */
interface AuthModalState {
    isOpen: boolean;
    view: AuthView;
    provider?: AuthProvider;
    state: AuthState;
    error?: AuthError;
    session?: UserSession;
}
/** Auth view */
type AuthView = 'providers' | 'email-input' | 'email-verify' | 'phone-input' | 'phone-verify' | 'wallet-connect' | 'wallet-sign' | 'loading' | 'success' | 'error';
/** Auth callbacks */
interface AuthCallbacks {
    onAuthStart?: (provider: AuthProvider) => void;
    onAuthSuccess?: (session: UserSession) => void;
    onAuthError?: (error: AuthError) => void;
    onAuthCancel?: () => void;
    onSignMessage?: (message: string, address: string) => Promise<string>;
    onVerifySignature?: (signature: string, message: string, address: string) => Promise<boolean>;
}
/** Auth modal config */
interface AuthModalConfig {
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
declare const OAUTH_PROVIDERS: Record<OAuthProvider, ProviderConfig>;
declare const WALLET_PROVIDERS: Record<WalletProvider, ProviderConfig>;
declare class AuthStateManager {
    private state;
    private config;
    private listeners;
    constructor(config: AuthModalConfig);
    getState(): AuthModalState;
    getConfig(): AuthModalConfig;
    subscribe(listener: (state: AuthModalState) => void): () => void;
    private notify;
    open(): void;
    close(): void;
    setView(view: AuthView): void;
    selectProvider(provider: AuthProvider): void;
    setAuthenticating(): void;
    setSigning(): void;
    setSuccess(session: UserSession): void;
    setError(error: AuthError): void;
    reset(): void;
    getProviderConfig(provider: AuthProvider): ProviderConfig | undefined;
    getProvidersByCategory(category: AuthProviderCategory): ProviderConfig[];
    getFeaturedProviders(): ProviderConfig[];
}
declare function createAuthManager(config: AuthModalConfig): AuthStateManager;
declare function createDefaultConfig(overrides?: Partial<AuthModalConfig>): AuthModalConfig;
declare function getProviderIcon(provider: AuthProvider): string;
declare function getProviderColor(provider: AuthProvider, dark?: boolean): string;
declare function getProviderName(provider: AuthProvider): string;
declare function getProviderCategory(provider: AuthProvider): AuthProviderCategory;
declare function isWalletProvider(provider: AuthProvider): provider is WalletProvider;
declare function isOAuthProvider(provider: AuthProvider): provider is OAuthProvider;
declare function getBlockchainType(provider: WalletProvider): BlockchainType | undefined;
declare function createAuthError(code: AuthErrorCode, message?: string, provider?: AuthProvider): AuthError;
declare function generateNonce(): string;
declare function createSignMessage(domain: string, nonce: string, statement?: string): string;
declare function formatWalletAddress(address: string, chars?: number): string;

export { type AuthCallbacks, type AuthError, type AuthErrorCode, type AuthModalConfig, type AuthModalState, type AuthProvider, type AuthProviderCategory, type AuthState, AuthStateManager, type AuthView, type BlockchainType, OAUTH_PROVIDERS, type OAuthProvider, type ProviderConfig, type UserSession, WALLET_PROVIDERS, type WalletProvider, createAuthError, createAuthManager, createDefaultConfig, createSignMessage, formatWalletAddress, generateNonce, getBlockchainType, getProviderCategory, getProviderColor, getProviderIcon, getProviderName, isOAuthProvider, isWalletProvider };
