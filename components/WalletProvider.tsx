'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { WalletState, YoursWallet } from '@/lib/types';


interface WalletContextType {
  wallet: WalletState;
  connectYours: () => Promise<void>;
  connectHandCash: () => void;
  connectMetanet: () => Promise<void>;
  disconnect: () => Promise<void>;
  isYoursAvailable: boolean;
}

const defaultWalletState: WalletState = {
  connected: false,
  provider: null,
  address: null,
  ordinalsAddress: null,
  handle: null,
  balance: 0,
};

const WalletContext = createContext<WalletContextType | null>(null);

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

declare global {
  interface Window {
    yours?: YoursWallet;
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>(defaultWalletState);
  const [isYoursAvailable, setIsYoursAvailable] = useState(false);

  // Check for Yours Wallet on mount
  useEffect(() => {
    const checkYours = () => {
      if (typeof window !== 'undefined' && window.yours) {
        setIsYoursAvailable(true);
        // Check if already connected
        window.yours.isConnected().then((connected) => {
          if (connected) {
            restoreYoursSession();
          }
        });
      }
    };

    // Check immediately and after a delay (extension may load slowly)
    checkYours();
    const timeout = setTimeout(checkYours, 1000);
    return () => clearTimeout(timeout);
  }, []);

  // Check for HandCash session on mount (via API since cookies are httpOnly)
  useEffect(() => {
    const checkHandCashSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        if (session.connected && session.provider === 'handcash') {
          setWallet({
            connected: true,
            provider: 'handcash',
            address: null,
            ordinalsAddress: null,
            handle: session.handle,
            balance: 0,
          });
        }
      } catch (error) {
        console.error('Failed to check HandCash session:', error);
      }
    };
    checkHandCashSession();
  }, []);

  const restoreYoursSession = async () => {
    if (!window.yours) return;
    try {
      const addresses = await window.yours.getAddresses();
      const balanceData = await window.yours.getBalance();
      setWallet({
        connected: true,
        provider: 'yours',
        address: addresses.bsvAddress,
        ordinalsAddress: addresses.ordAddress,
        handle: null,
        balance: balanceData.satoshis,
      });
    } catch (error) {
      console.error('Failed to restore Yours session:', error);
    }
  };

  const connectYours = useCallback(async () => {
    if (!window.yours) {
      window.open('https://yours.org', '_blank');
      return;
    }

    try {
      const result = await window.yours.connect();
      const balanceData = await window.yours.getBalance();

      setWallet({
        connected: true,
        provider: 'yours',
        address: result.addresses.bsvAddress,
        ordinalsAddress: result.addresses.ordAddress,
        handle: null,
        balance: balanceData.satoshis,
      });

      // Register wallet with backend
      await fetch('/api/wallet/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'yours',
          address: result.addresses.bsvAddress,
          ordinalsAddress: result.addresses.ordAddress,
        }),
      });
    } catch (error) {
      console.error('Failed to connect Yours Wallet:', error);
      throw error;
    }
  }, []);

  const connectHandCash = useCallback(() => {
    // Redirect to HandCash OAuth flow
    window.location.href = '/api/auth/handcash';
  }, []);

  const connectMetanet = useCallback(async () => {
    try {
      // Dynamically import Babbage SDK to avoid SSR issues
      const { isAuthenticated, getIdentity, getPaymail } = await import('@babbage/sdk');

      const authenticated = await isAuthenticated();
      if (!authenticated) {
        // Trigger authentication flow if not already authenticated
        // Note: SDK usually prompts automatically on request if not auth'd, 
        // but explicit check helps.
      }

      const identity = await getIdentity();
      // Babbage uses identity keys, not address directly for display usually, 
      // but we can map it. For now, let's treat the identity public key as the identifier.
      // Or better, use Paymail if available.

      // Attempt to get a Paymail or fallback to identity key
      // NOTE: getPaymail might not be available in all SDK versions or configurations
      // Let's use identity public key as the primary handle for now.

      setWallet({
        connected: true,
        provider: 'metanet',
        address: identity, // Using identity key as address placeholder
        ordinalsAddress: null, // Metanet handles this differently
        handle: 'Metanet User', // Placeholder until paymail integration
        balance: 0, // Balance check requires specific protocol in Babbage
      });

    } catch (error) {
      console.error('Failed to connect Metanet:', error);
      alert('Metanet Client (e.g. Babbage Desktop) not detected or connection failed.');
    }
  }, []);


  const disconnect = useCallback(async () => {
    if (wallet.provider === 'yours' && window.yours) {
      try {
        await window.yours.disconnect();
      } catch (error) {
        console.error('Failed to disconnect Yours:', error);
      }
    }

    if (wallet.provider === 'handcash') {
      // Clear server-side cookies
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (error) {
        console.error('Failed to logout from HandCash:', error);
      }
    }

    // For Metanet, 'disconnect' is local state clearing mainly, 
    // as the client itself remains running.

    setWallet(defaultWalletState);
  }, [wallet.provider]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connectYours,
        connectHandCash,
        connectMetanet,
        disconnect,
        isYoursAvailable,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
