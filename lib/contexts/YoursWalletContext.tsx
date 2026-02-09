'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { YoursProvider, useYoursWallet, Bsv20 } from 'yours-wallet-provider';

interface WalletState {
    isReady: boolean;
    isConnected: boolean;
    addresses: {
        bsvAddress: string;
        ordAddress: string;
        identityAddress: string;
    } | null;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    getBsv20s: () => Promise<Bsv20[] | undefined>;
    error: string | null;
}

const YoursWalletContext = createContext<WalletState | null>(null);

function YoursWalletInner({ children }: { children: React.ReactNode }) {
    const wallet = useYoursWallet();
    const [isConnected, setIsConnected] = useState(false);
    const [addresses, setAddresses] = useState<WalletState['addresses']>(null);
    const [error, setError] = useState<string | null>(null);

    // Check connection status on mount
    useEffect(() => {
        if (wallet?.isReady) {
            wallet.isConnected().then((connected: boolean) => {
                setIsConnected(connected);
                if (connected) {
                    wallet.getAddresses().then((addrs) => {
                        if (addrs) setAddresses(addrs);
                    }).catch(console.error);
                }
            }).catch(console.error);
        }
    }, [wallet?.isReady]);

    const connect = useCallback(async () => {
        if (!wallet?.isReady) {
            setError('Yours wallet extension not detected. Please install it from yours.org');
            return;
        }
        try {
            setError(null);
            await wallet.connect();
            const connected = await wallet.isConnected();
            setIsConnected(connected);
            if (connected) {
                const addrs = await wallet.getAddresses();
                if (addrs) setAddresses(addrs);
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Failed to connect';
            setError(msg);
            throw e;
        }
    }, [wallet]);

    const disconnect = useCallback(async () => {
        if (!wallet?.isReady) return;
        try {
            await wallet.disconnect();
            setIsConnected(false);
            setAddresses(null);
        } catch (e) {
            console.error('Disconnect error:', e);
        }
    }, [wallet]);

    const getBsv20s = useCallback(async () => {
        if (!wallet?.isReady) return undefined;
        try {
            return await wallet.getBsv20s();
        } catch (e) {
            console.error('getBsv20s error:', e);
            return undefined;
        }
    }, [wallet]);

    const value: WalletState = {
        isReady: wallet?.isReady ?? false,
        isConnected,
        addresses,
        connect,
        disconnect,
        getBsv20s,
        error
    };

    return (
        <YoursWalletContext.Provider value={value}>
            {children}
        </YoursWalletContext.Provider>
    );
}

export function YoursWalletProvider({ children }: { children: React.ReactNode }) {
    return (
        <YoursProvider>
            <YoursWalletInner>{children}</YoursWalletInner>
        </YoursProvider>
    );
}

export function useYoursWalletContext() {
    const context = useContext(YoursWalletContext);
    if (!context) {
        throw new Error('useYoursWalletContext must be used within YoursWalletProvider');
    }
    return context;
}
