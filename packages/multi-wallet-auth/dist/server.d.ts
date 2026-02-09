import { d as WalletProvider, C as Chain, e as WalletSession, W as WalletAuthRequest } from './types-CxXCGG8p.js';
export { b as WalletAuthResponse } from './types-CxXCGG8p.js';

/**
 * Server-Side Wallet Utilities
 *
 * Functions for validating wallet authentication on the server.
 */

/**
 * Validate Ethereum address format
 */
declare function isValidEthereumAddress(address: string): boolean;
/**
 * Validate Solana address format (base58, 32-44 chars)
 */
declare function isValidSolanaAddress(address: string): boolean;
/**
 * Validate BSV address format (starts with 1 or m/n for testnet)
 */
declare function isValidBsvAddress(address: string): boolean;
/**
 * Validate HandCash handle format
 */
declare function isValidHandCashHandle(handle: string): boolean;
/**
 * Validate address for a given provider
 */
declare function validateAddress(provider: WalletProvider, address: string): boolean;
/**
 * Normalize address for consistent storage
 * - Ethereum addresses: lowercase
 * - Others: as-is
 */
declare function normalizeAddress(provider: WalletProvider, address: string): string;
/**
 * Parse wallet session from cookies
 */
declare function parseWalletSession(cookies: Record<string, string | undefined>): WalletSession | null;
/**
 * Create session cookies for wallet auth
 */
declare function createSessionCookies(provider: WalletProvider, address: string, maxAge?: number): string[];
/**
 * Create cookies to clear wallet session
 */
declare function clearSessionCookies(): string[];
/**
 * Validate wallet auth request
 */
declare function validateAuthRequest(body: unknown): {
    valid: true;
    data: WalletAuthRequest;
} | {
    valid: false;
    error: string;
};
/**
 * Generate display name from wallet address
 */
declare function generateDisplayName(provider: WalletProvider, address: string): string;
/**
 * Get chain for provider
 */
declare function getChainForProvider(provider: WalletProvider): Chain;
/**
 * Get explorer URL for transaction
 */
declare function getExplorerUrl(chain: Chain, txid: string): string;
/**
 * Get explorer URL for address
 */
declare function getAddressExplorerUrl(chain: Chain, address: string): string;

export { WalletAuthRequest, WalletProvider, WalletSession, clearSessionCookies, createSessionCookies, generateDisplayName, getAddressExplorerUrl, getChainForProvider, getExplorerUrl, isValidBsvAddress, isValidEthereumAddress, isValidHandCashHandle, isValidSolanaAddress, normalizeAddress, parseWalletSession, validateAddress, validateAuthRequest };
