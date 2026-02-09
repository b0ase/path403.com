'use client';

/**
 * Unified Wallet Provider
 *
 * React context that provides multi-wallet authentication
 * for HandCash, Yours, Phantom, and MetaMask.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import type {
  WalletProvider as WalletProviderType,
  WalletContext,
  WalletState,
  Chain,
  PROVIDER_CHAINS,
} from './types';

// Re-export types
export type { WalletProviderType, WalletContext, WalletState, Chain };

// ============================================================================
// Context
// ============================================================================

const defaultState: WalletContext = {
  isConnected: false,
  provider: null,
  address: null,
  publicKey: null,
  chain: null,
  isConnecting: false,
  error: null,
  connect: async () => {},
  disconnect: async () => {},
};

const WalletCtx = createContext<WalletContext>(defaultState);

// ============================================================================
// Hook
// ============================================================================

/**
 * Use the wallet context
 *
 * @example
 * ```tsx
 * const { isConnected, address, connect, disconnect } = useWallet();
 *
 * if (isConnected) {
 *   return <div>Connected: {address}</div>;
 * }
 *
 * return <button onClick={() => connect('handcash')}>Connect</button>;
 * ```
 */
export function useWallet(): WalletContext {
  const ctx = useContext(WalletCtx);
  if (!ctx) {
    throw new Error('useWallet must be used within MultiWalletProvider');
  }
  return ctx;
}

// ============================================================================
// Provider Props
// ============================================================================

export interface MultiWalletProviderProps {
  children: ReactNode;
  /** HandCash OAuth redirect URL (defaults to /api/auth/handcash) */
  handcashAuthUrl?: string;
  /** Whether to persist wallet selection to localStorage */
  persistSelection?: boolean;
  /** Storage key for persisted wallet */
  storageKey?: string;
  /** Callback when wallet connects */
  onConnect?: (provider: WalletProviderType, address: string) => void;
  /** Callback when wallet disconnects */
  onDisconnect?: () => void;
  /** Callback on connection error */
  onError?: (error: Error) => void;
}

// ============================================================================
// Provider Component
// ============================================================================

/**
 * Multi-Wallet Provider
 *
 * Wraps your app to provide unified wallet authentication.
 *
 * @example
 * ```tsx
 * import { MultiWalletProvider } from '@b0ase/multi-wallet-auth/provider';
 *
 * function App() {
 *   return (
 *     <MultiWalletProvider handcashAuthUrl="/api/auth/handcash">
 *       <YourApp />
 *     </MultiWalletProvider>
 *   );
 * }
 * ```
 */
export function MultiWalletProvider({
  children,
  handcashAuthUrl = '/api/auth/handcash',
  persistSelection = true,
  storageKey = 'b0ase_wallet',
  onConnect,
  onDisconnect,
  onError,
}: MultiWalletProviderProps) {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    provider: null,
    address: null,
    publicKey: null,
    chain: null,
    isConnecting: false,
    error: null,
  });

  // Get chain for provider
  const getChain = (provider: WalletProviderType): Chain => {
    const chains: Record<WalletProviderType, Chain> = {
      handcash: 'bsv',
      yours: 'bsv',
      phantom: 'solana',
      metamask: 'ethereum',
    };
    return chains[provider];
  };

  // Check for HandCash session on mount
  useEffect(() => {
    const getCookie = (name: string): string | null => {
      if (typeof document === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    };

    const authToken = getCookie('b0ase_auth_token');
    const handle = getCookie('b0ase_user_handle');

    if (authToken && handle) {
      setState((prev) => ({
        ...prev,
        isConnected: true,
        provider: 'handcash',
        address: handle,
        chain: 'bsv',
      }));
    }
  }, []);

  // Restore persisted wallet selection
  useEffect(() => {
    if (!persistSelection || typeof window === 'undefined') return;

    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const { provider, address } = JSON.parse(stored);
        if (provider && address) {
          setState((prev) => ({
            ...prev,
            isConnected: true,
            provider,
            address,
            chain: getChain(provider),
          }));
        }
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
  }, [persistSelection, storageKey]);

  // Connect to wallet
  const connect = useCallback(
    async (provider: WalletProviderType) => {
      setState((prev) => ({ ...prev, isConnecting: true, error: null }));

      try {
        let address: string | null = null;
        let publicKey: string | null = null;

        switch (provider) {
          case 'handcash': {
            // Redirect to HandCash OAuth
            const returnTo =
              typeof window !== 'undefined' ? window.location.pathname : '/';
            window.location.href = `${handcashAuthUrl}?returnTo=${encodeURIComponent(returnTo)}`;
            return; // Page will redirect
          }

          case 'yours': {
            // Yours wallet requires extension
            if (typeof window === 'undefined') {
              throw new Error('Yours wallet only works in browser');
            }
            // Yours integration typically done via their provider
            // This is a simplified version - full integration uses YoursProvider
            throw new Error(
              'Yours wallet requires YoursWalletProvider wrapper'
            );
          }

          case 'phantom': {
            const solana = window.solana;
            if (!solana?.isPhantom) {
              window.open('https://phantom.app/', '_blank');
              throw new Error('Phantom wallet not installed');
            }
            const resp = await solana.connect();
            address = resp.publicKey.toString();
            publicKey = address;
            break;
          }

          case 'metamask': {
            const ethereum = window.ethereum;
            if (!ethereum?.isMetaMask) {
              window.open('https://metamask.io/', '_blank');
              throw new Error('MetaMask not installed');
            }
            const accounts = await ethereum.request<string[]>({
              method: 'eth_requestAccounts',
            });
            address = accounts?.[0] || null;
            break;
          }
        }

        if (!address) {
          throw new Error('Failed to get wallet address');
        }

        const chain = getChain(provider);

        setState({
          isConnected: true,
          provider,
          address,
          publicKey,
          chain,
          isConnecting: false,
          error: null,
        });

        // Persist selection
        if (persistSelection && typeof window !== 'undefined') {
          localStorage.setItem(storageKey, JSON.stringify({ provider, address }));
        }

        // Callback
        onConnect?.(provider, address);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error: error.message,
        }));
        onError?.(error);
      }
    },
    [handcashAuthUrl, persistSelection, storageKey, onConnect, onError]
  );

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      const { provider } = state;

      if (provider === 'phantom' && window.solana) {
        await window.solana.disconnect();
      }
      // MetaMask doesn't have a disconnect method
      // HandCash requires clearing cookies (server-side)

      setState({
        isConnected: false,
        provider: null,
        address: null,
        publicKey: null,
        chain: null,
        isConnecting: false,
        error: null,
      });

      // Clear persisted selection
      if (persistSelection && typeof window !== 'undefined') {
        localStorage.removeItem(storageKey);
      }

      // Callback
      onDisconnect?.();
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  }, [state, persistSelection, storageKey, onDisconnect]);

  // Sign message (for wallets that support it)
  const signMessage = useCallback(
    async (message: string): Promise<string> => {
      const { provider } = state;

      if (!provider) {
        throw new Error('No wallet connected');
      }

      switch (provider) {
        case 'phantom': {
          if (!window.solana) throw new Error('Phantom not available');
          const encodedMessage = new TextEncoder().encode(message);
          const { signature } = await window.solana.signMessage(
            encodedMessage,
            'utf8'
          );
          return Buffer.from(signature).toString('hex');
        }

        case 'metamask': {
          if (!window.ethereum) throw new Error('MetaMask not available');
          const address = state.address;
          if (!address) throw new Error('No address');
          const signature = await window.ethereum.request<string>({
            method: 'personal_sign',
            params: [message, address],
          });
          return signature || '';
        }

        default:
          throw new Error(`Signing not supported for ${provider}`);
      }
    },
    [state]
  );

  const value: WalletContext = {
    ...state,
    connect,
    disconnect,
    signMessage,
  };

  return <WalletCtx.Provider value={value}>{children}</WalletCtx.Provider>;
}

// ============================================================================
// Export default for convenience
// ============================================================================

export default MultiWalletProvider;
