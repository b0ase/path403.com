'use client';

import { useState, useEffect, useCallback } from 'react';

interface BoaseBalance {
    handle: string | null;
    balance: number;
    staked: number;
    available: number;
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export function useBoaseBalance(): BoaseBalance {
    const [handle, setHandle] = useState<string | null>(null);
    const [balance, setBalance] = useState(0);
    const [staked, setStaked] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const res = await fetch('/api/micropay');

            if (!res.ok) {
                if (res.status === 401) {
                    // Not connected - that's okay
                    setHandle(null);
                    setBalance(0);
                    setStaked(0);
                    return;
                }
                throw new Error('Failed to fetch balance');
            }

            const data = await res.json();
            setHandle(data.handle);
            setBalance(data.balance);
            setStaked(data.staked);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return {
        handle,
        balance,
        staked,
        available: balance - staked,
        isLoading,
        error,
        refresh,
    };
}
