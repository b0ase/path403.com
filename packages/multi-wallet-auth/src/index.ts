/**
 * @b0ase/multi-wallet-auth
 *
 * Unified multi-wallet authentication for BSV, Ethereum, and Solana.
 *
 * Supports:
 * - HandCash (BSV) - via OAuth
 * - Yours Wallet (BSV) - browser extension
 * - Phantom (Solana) - browser extension
 * - MetaMask (Ethereum) - browser extension
 *
 * @example
 * ```tsx
 * // In your app layout or providers
 * import { MultiWalletProvider } from '@b0ase/multi-wallet-auth/provider';
 *
 * function Providers({ children }) {
 *   return (
 *     <MultiWalletProvider handcashAuthUrl="/api/auth/handcash">
 *       {children}
 *     </MultiWalletProvider>
 *   );
 * }
 *
 * // In your components
 * import { useWallet } from '@b0ase/multi-wallet-auth/provider';
 *
 * function WalletButton() {
 *   const { isConnected, address, provider, connect, disconnect } = useWallet();
 *
 *   if (isConnected) {
 *     return (
 *       <div>
 *         <span>{provider}: {address}</span>
 *         <button onClick={disconnect}>Disconnect</button>
 *       </div>
 *     );
 *   }
 *
 *   return (
 *     <div>
 *       <button onClick={() => connect('handcash')}>HandCash</button>
 *       <button onClick={() => connect('phantom')}>Phantom</button>
 *       <button onClick={() => connect('metamask')}>MetaMask</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @packageDocumentation
 */

// Type exports
export type {
  WalletProvider,
  Chain,
  WalletState,
  WalletContext,
  HandCashProfile,
  YoursAddresses,
  PhantomResponse,
  MetaMaskAccounts,
  WalletAuthRequest,
  WalletAuthResponse,
  WalletSession,
} from './types';

// Constant exports
export { PROVIDER_CHAINS } from './types';

// Provider exports (for convenience, also available via /provider)
export { MultiWalletProvider, useWallet } from './provider';
export type { MultiWalletProviderProps } from './provider';

// Server exports (for convenience, also available via /server)
export {
  isValidEthereumAddress,
  isValidSolanaAddress,
  isValidBsvAddress,
  isValidHandCashHandle,
  validateAddress,
  normalizeAddress,
  parseWalletSession,
  createSessionCookies,
  clearSessionCookies,
  validateAuthRequest,
  generateDisplayName,
  getChainForProvider,
  getExplorerUrl,
  getAddressExplorerUrl,
} from './server';
