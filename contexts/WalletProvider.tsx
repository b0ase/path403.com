'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useYoursWalletContext } from '@/lib/contexts/YoursWalletContext';

export type WalletProviderType = 'handcash' | 'yours' | 'phantom' | 'metamask' | null;

interface WalletContextType {
    isConnected: boolean;
    provider: WalletProviderType;
    address: string | null;
    pubKey: string | null; // Hex or base64 public key for encryption
    connect: (provider: WalletProviderType) => Promise<void>;
    disconnect: () => Promise<void>;
    isConnecting: boolean;
    error: string | null;
}

const WalletContext = createContext<WalletContextType>({
    isConnected: false,
    provider: null,
    address: null,
    pubKey: null,
    connect: async () => { },
    disconnect: async () => { },
    isConnecting: false,
    error: null,
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
    // Integrate existing Yours Context
    const yoursContext = useYoursWalletContext();

    const [isConnected, setIsConnected] = useState(false);
    const [provider, setProvider] = useState<WalletProviderType>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [pubKey, setPubKey] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sync state with YoursWalletProvider
    useEffect(() => {
        if (yoursContext.isConnected && yoursContext.addresses) {
            setProvider('yours');
            setAddress(yoursContext.addresses.identityAddress || yoursContext.addresses.bsvAddress);
            setIsConnected(true);
            setError(null);
        } else if (provider === 'yours' && !yoursContext.isConnected) {
            // Disconnected from Yours logic
            setIsConnected(false);
            setProvider(null);
            setAddress(null);
        }
    }, [yoursContext.isConnected, yoursContext.addresses, provider]);

    // Sync state with HandCash cookies
    useEffect(() => {
        const getCookie = (name: string) => {
            if (typeof document === 'undefined') return null;
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
            return null;
        };

        const authToken = getCookie('b0ase_auth_token');
        const handle = getCookie('b0ase_user_handle');

        if (authToken && handle) {
            setProvider('handcash');
            setAddress(handle);
            setIsConnected(true);
        }
    }, []);


    const connect = async (selectedProvider: WalletProviderType) => {
        if (!selectedProvider) return;
        setIsConnecting(true);
        setError(null);

        try {
            switch (selectedProvider) {
                case 'handcash':
                    // Redirect for HandCash OAuth, preserving return path
                    window.location.href = `/api/auth/handcash?returnTo=${encodeURIComponent(window.location.pathname)}`;
                    return; // Early return as page will redirect
                case 'yours':
                    await yoursContext.connect();
                    // State sync happens in useEffect
                    break;
                case 'phantom':
                    const solana = (window as any).solana;
                    if (!solana?.isPhantom) {
                        window.open('https://phantom.app/', '_blank');
                        throw new Error("Phantom wallet not installed");
                    }
                    const resp = await solana.connect();
                    setAddress(resp.publicKey.toString());
                    setPubKey(resp.publicKey.toString());
                    setIsConnected(true);
                    setProvider('phantom');
                    break;
                case 'metamask':
                    const eth = (window as any).ethereum;
                    if (!eth) {
                        window.open('https://metamask.io/', '_blank');
                        throw new Error("MetaMask not installed");
                    }
                    const accounts = await eth.request({ method: 'eth_requestAccounts' });
                    setAddress(accounts[0]);
                    setIsConnected(true);
                    setProvider('metamask');
                    break;
            }
            localStorage.setItem('kintsugi_wallet_provider', selectedProvider);
        } catch (err: any) {
            console.error("Wallet Connect Error:", err);
            setError(err.message || 'Failed to connect');
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnect = async () => {
        try {
            if (provider === 'yours') {
                await yoursContext.disconnect();
            } else if (provider === 'phantom') {
                await (window as any).solana.disconnect();
            }
            // HandCash/MetaMask might not have explicit disconnect
        } catch (e) {
            console.error(e);
        } finally {
            setIsConnected(false);
            setProvider(null);
            setAddress(null);
            setPubKey(null);
            localStorage.removeItem('kintsugi_wallet_provider');
        }
    };

    return (
        <WalletContext.Provider value={{
            isConnected,
            provider,
            address,
            pubKey,
            connect,
            disconnect,
            isConnecting,
            error
        }}>
            {children}
        </WalletContext.Provider>
    );
};
