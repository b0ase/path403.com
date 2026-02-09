/**
 * @b0ase/handcash - React Provider
 *
 * This module provides React context and hooks for HandCash integration.
 * Wrap your app with HandCashProvider to enable the useHandCash hook.
 *
 * @example
 * ```tsx
 * import { HandCashProvider, useHandCash } from '@b0ase/handcash/provider';
 *
 * // In your app root
 * function App() {
 *   return (
 *     <HandCashProvider appId="your-app-id">
 *       <YourApp />
 *     </HandCashProvider>
 *   );
 * }
 *
 * // In any component
 * function WalletButton() {
 *   const { isAuthenticated, profile, balance, signIn, signOut } = useHandCash();
 *
 *   if (isAuthenticated) {
 *     return (
 *       <div>
 *         <img src={profile?.publicProfile.avatarUrl} />
 *         <span>{profile?.publicProfile.handle}</span>
 *         <span>${balance?.usd}</span>
 *         <button onClick={signOut}>Sign Out</button>
 *       </div>
 *     );
 *   }
 *
 *   return <button onClick={signIn}>Connect HandCash</button>;
 * }
 * ```
 */

'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { HandCashClient } from './client';
import type {
  HandCashContextType,
  HandCashProfile,
  HandCashBalance,
  HandCashAsset,
  HandCashClientConfig,
} from './types';

// ============================================================================
// Context
// ============================================================================

const HandCashContext = createContext<HandCashContextType | undefined>(undefined);

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access HandCash functionality.
 * Must be used within a HandCashProvider.
 */
export function useHandCash(): HandCashContextType {
  const context = useContext(HandCashContext);
  if (!context) {
    throw new Error('useHandCash must be used within a HandCashProvider');
  }
  return context;
}

// ============================================================================
// Provider Props
// ============================================================================

interface HandCashProviderProps {
  children: ReactNode;
  appId: string;
  redirectUri?: string;
  permissions?: string[];
  /**
   * Enable mock mode for development.
   * When true, signIn() will use mock authentication.
   */
  mockMode?: boolean;
  /**
   * Custom mock profile data for development.
   */
  mockProfile?: Partial<HandCashProfile>;
  /**
   * Callback when authentication state changes.
   */
  onAuthChange?: (isAuthenticated: boolean, profile: HandCashProfile | null) => void;
}

// ============================================================================
// Provider Component
// ============================================================================

export function HandCashProvider({
  children,
  appId,
  redirectUri,
  permissions,
  mockMode = false,
  mockProfile,
  onAuthChange,
}: HandCashProviderProps) {
  // State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<HandCashProfile | null>(null);
  const [balance, setBalance] = useState<HandCashBalance | null>(null);
  const [assets, setAssets] = useState<HandCashAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create client instance
  const client = useMemo(() => {
    const config: HandCashClientConfig = { appId };
    if (redirectUri) config.redirectUri = redirectUri;
    if (permissions) config.permissions = permissions;
    return new HandCashClient(config);
  }, [appId, redirectUri, permissions]);

  // ============================================================================
  // Refresh Functions
  // ============================================================================

  const refreshBalance = useCallback(async () => {
    try {
      const newBalance = await client.getBalance();
      if (newBalance) {
        setBalance(newBalance);
      }
    } catch (err) {
      console.error('[HandCashProvider] Error fetching balance:', err);
      setError('Failed to fetch balance');
    }
  }, [client]);

  const refreshAssets = useCallback(async () => {
    // TODO: Implement when assets API is available
    // For now, return empty array
    setAssets([]);
  }, []);

  // ============================================================================
  // Auth Functions
  // ============================================================================

  const signIn = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (mockMode) {
        // Use mock authentication for development
        const result = await client.mockAuthenticate(mockProfile);
        setProfile(result.profile);
        setIsAuthenticated(true);
        await refreshBalance();
        onAuthChange?.(true, result.profile);
      } else {
        // Redirect to HandCash OAuth
        window.location.href = client.getOAuthUrl();
      }
    } catch (err) {
      console.error('[HandCashProvider] Sign in error:', err);
      setError('Failed to sign in with HandCash');
    } finally {
      setIsLoading(false);
    }
  }, [client, mockMode, mockProfile, refreshBalance, onAuthChange]);

  const signOut = useCallback(() => {
    client.clearAuth();
    setIsAuthenticated(false);
    setProfile(null);
    setBalance(null);
    setAssets([]);
    setError(null);
    onAuthChange?.(false, null);
  }, [client, onAuthChange]);

  const getOAuthUrl = useCallback(() => {
    return client.getOAuthUrl();
  }, [client]);

  const handleCallback = useCallback(
    async (code: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await client.handleOAuthCallback(code);
        if (result) {
          setProfile(result.profile);
          setIsAuthenticated(true);
          await refreshBalance();
          await refreshAssets();
          onAuthChange?.(true, result.profile);
          return true;
        }
        return false;
      } catch (err) {
        console.error('[HandCashProvider] Callback error:', err);
        setError('Failed to complete authentication');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [client, refreshBalance, refreshAssets, onAuthChange]
  );

  // ============================================================================
  // Payment Function
  // ============================================================================

  const sendPayment = useCallback(
    async (to: string, amount: number, currency: string = 'USD'): Promise<string | null> => {
      try {
        const result = await client.sendPayment(to, amount, currency);
        if (result) {
          // Refresh balance after payment
          await refreshBalance();
          return result.transactionId;
        }
        return null;
      } catch (err) {
        console.error('[HandCashProvider] Payment error:', err);
        setError('Failed to send payment');
        return null;
      }
    },
    [client, refreshBalance]
  );

  // ============================================================================
  // Initialize
  // ============================================================================

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        if (client.isAuthenticated()) {
          const storedProfile = client.getProfile();
          if (storedProfile) {
            setProfile(storedProfile);
            setIsAuthenticated(true);
            await refreshBalance();
            await refreshAssets();
            onAuthChange?.(true, storedProfile);
          }
        }
      } catch (err) {
        console.error('[HandCashProvider] Error initializing auth:', err);
        setError('Failed to restore session');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth events
    const handleAuthEvent = (event: CustomEvent<HandCashProfile>) => {
      setProfile(event.detail);
      setIsAuthenticated(true);
      refreshBalance();
      refreshAssets();
      onAuthChange?.(true, event.detail);
    };

    const handleLogoutEvent = () => {
      setIsAuthenticated(false);
      setProfile(null);
      setBalance(null);
      setAssets([]);
      onAuthChange?.(false, null);
    };

    window.addEventListener('handcash-authenticated' as any, handleAuthEvent);
    window.addEventListener('handcash-logout' as any, handleLogoutEvent);

    return () => {
      window.removeEventListener('handcash-authenticated' as any, handleAuthEvent);
      window.removeEventListener('handcash-logout' as any, handleLogoutEvent);
    };
  }, [client, refreshBalance, refreshAssets, onAuthChange]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const contextValue: HandCashContextType = useMemo(
    () => ({
      // State
      isAuthenticated,
      profile,
      balance,
      assets,
      isLoading,
      error,

      // Auth Actions
      signIn,
      signOut,
      getOAuthUrl,
      handleCallback,

      // Wallet Actions
      refreshBalance,
      refreshAssets,
      sendPayment,
    }),
    [
      isAuthenticated,
      profile,
      balance,
      assets,
      isLoading,
      error,
      signIn,
      signOut,
      getOAuthUrl,
      handleCallback,
      refreshBalance,
      refreshAssets,
      sendPayment,
    ]
  );

  return <HandCashContext.Provider value={contextValue}>{children}</HandCashContext.Provider>;
}

// ============================================================================
// Utility Components
// ============================================================================

/**
 * Simple connect button component
 */
interface ConnectButtonProps {
  className?: string;
  children?: ReactNode;
}

export function HandCashConnectButton({ className, children }: ConnectButtonProps) {
  const { isAuthenticated, isLoading, signIn, signOut, profile } = useHandCash();

  if (isLoading) {
    return (
      <button className={className} disabled>
        Loading...
      </button>
    );
  }

  if (isAuthenticated && profile) {
    return (
      <button className={className} onClick={signOut}>
        {children || `${profile.publicProfile.handle} (Sign Out)`}
      </button>
    );
  }

  return (
    <button className={className} onClick={signIn}>
      {children || 'Connect HandCash'}
    </button>
  );
}

/**
 * Display user profile when authenticated
 */
interface ProfileDisplayProps {
  className?: string;
  showBalance?: boolean;
}

export function HandCashProfileDisplay({ className, showBalance = true }: ProfileDisplayProps) {
  const { isAuthenticated, profile, balance } = useHandCash();

  if (!isAuthenticated || !profile) {
    return null;
  }

  return (
    <div className={className}>
      <img
        src={profile.publicProfile.avatarUrl}
        alt={profile.publicProfile.displayName}
        style={{ width: 32, height: 32, borderRadius: '50%' }}
      />
      <span>{profile.publicProfile.handle}</span>
      {showBalance && balance && <span>${balance.usd.toFixed(2)}</span>}
    </div>
  );
}

// Re-export types
export * from './types';
