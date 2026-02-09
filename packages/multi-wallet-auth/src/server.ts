/**
 * Server-Side Wallet Utilities
 *
 * Functions for validating wallet authentication on the server.
 */

import type {
  WalletProvider,
  WalletAuthRequest,
  WalletAuthResponse,
  WalletSession,
  Chain,
  PROVIDER_CHAINS,
} from './types';

// Re-export types
export type {
  WalletProvider,
  WalletAuthRequest,
  WalletAuthResponse,
  WalletSession,
};

// ============================================================================
// Address Validation
// ============================================================================

/**
 * Validate Ethereum address format
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate Solana address format (base58, 32-44 chars)
 */
export function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

/**
 * Validate BSV address format (starts with 1 or m/n for testnet)
 */
export function isValidBsvAddress(address: string): boolean {
  return /^[1mn][a-km-zA-HJ-NP-Z0-9]{25,34}$/.test(address);
}

/**
 * Validate HandCash handle format
 */
export function isValidHandCashHandle(handle: string): boolean {
  return /^[a-zA-Z0-9_]{1,20}$/.test(handle);
}

/**
 * Validate address for a given provider
 */
export function validateAddress(
  provider: WalletProvider,
  address: string
): boolean {
  switch (provider) {
    case 'handcash':
      return isValidHandCashHandle(address);
    case 'yours':
      return isValidBsvAddress(address);
    case 'phantom':
      return isValidSolanaAddress(address);
    case 'metamask':
      return isValidEthereumAddress(address);
    default:
      return false;
  }
}

// ============================================================================
// Address Normalization
// ============================================================================

/**
 * Normalize address for consistent storage
 * - Ethereum addresses: lowercase
 * - Others: as-is
 */
export function normalizeAddress(
  provider: WalletProvider,
  address: string
): string {
  if (provider === 'metamask') {
    return address.toLowerCase();
  }
  return address;
}

// ============================================================================
// Session Utilities
// ============================================================================

/**
 * Parse wallet session from cookies
 */
export function parseWalletSession(
  cookies: Record<string, string | undefined>
): WalletSession | null {
  const provider = cookies['b0ase_wallet_provider'] as WalletProvider;
  const address = cookies['b0ase_wallet_address'];

  if (!provider || !address) {
    // Check for HandCash cookies
    const authToken = cookies['b0ase_auth_token'];
    const handle = cookies['b0ase_user_handle'];

    if (authToken && handle) {
      return {
        provider: 'handcash',
        address: handle,
        chain: 'bsv',
      };
    }

    return null;
  }

  const chains: Record<WalletProvider, Chain> = {
    handcash: 'bsv',
    yours: 'bsv',
    phantom: 'solana',
    metamask: 'ethereum',
  };

  return {
    provider,
    address,
    chain: chains[provider],
  };
}

/**
 * Create session cookies for wallet auth
 */
export function createSessionCookies(
  provider: WalletProvider,
  address: string,
  maxAge = 2592000 // 30 days
): string[] {
  const options = `Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  return [
    `b0ase_wallet_provider=${provider}; ${options}`,
    `b0ase_wallet_address=${normalizeAddress(provider, address)}; ${options}`,
  ];
}

/**
 * Create cookies to clear wallet session
 */
export function clearSessionCookies(): string[] {
  const options = 'Path=/; Max-Age=0; SameSite=Lax';
  return [
    `b0ase_wallet_provider=; ${options}`,
    `b0ase_wallet_address=; ${options}`,
  ];
}

// ============================================================================
// Auth Handler Helpers
// ============================================================================

/**
 * Validate wallet auth request
 */
export function validateAuthRequest(
  body: unknown
): { valid: true; data: WalletAuthRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { provider, address } = body as Record<string, unknown>;

  if (!provider || typeof provider !== 'string') {
    return { valid: false, error: 'provider is required' };
  }

  if (!address || typeof address !== 'string') {
    return { valid: false, error: 'address is required' };
  }

  const validProviders: WalletProvider[] = [
    'handcash',
    'yours',
    'phantom',
    'metamask',
  ];
  if (!validProviders.includes(provider as WalletProvider)) {
    return {
      valid: false,
      error: `Invalid provider. Must be one of: ${validProviders.join(', ')}`,
    };
  }

  if (!validateAddress(provider as WalletProvider, address)) {
    return { valid: false, error: 'Invalid address format for provider' };
  }

  return {
    valid: true,
    data: {
      provider: provider as WalletProvider,
      address: normalizeAddress(provider as WalletProvider, address),
    },
  };
}

// ============================================================================
// Display Name Generation
// ============================================================================

/**
 * Generate display name from wallet address
 */
export function generateDisplayName(
  provider: WalletProvider,
  address: string
): string {
  if (provider === 'handcash') {
    return `$${address}`;
  }

  if (provider === 'metamask') {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  if (provider === 'phantom') {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }

  // BSV addresses
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ============================================================================
// Chain Utilities
// ============================================================================

/**
 * Get chain for provider
 */
export function getChainForProvider(provider: WalletProvider): Chain {
  const chains: Record<WalletProvider, Chain> = {
    handcash: 'bsv',
    yours: 'bsv',
    phantom: 'solana',
    metamask: 'ethereum',
  };
  return chains[provider];
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerUrl(chain: Chain, txid: string): string {
  switch (chain) {
    case 'bsv':
      return `https://whatsonchain.com/tx/${txid}`;
    case 'ethereum':
      return `https://etherscan.io/tx/${txid}`;
    case 'solana':
      return `https://solscan.io/tx/${txid}`;
  }
}

/**
 * Get explorer URL for address
 */
export function getAddressExplorerUrl(chain: Chain, address: string): string {
  switch (chain) {
    case 'bsv':
      return `https://whatsonchain.com/address/${address}`;
    case 'ethereum':
      return `https://etherscan.io/address/${address}`;
    case 'solana':
      return `https://solscan.io/account/${address}`;
  }
}
