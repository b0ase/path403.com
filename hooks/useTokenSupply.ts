'use client';

import { useState, useEffect } from 'react';

export interface TokenSupplyData {
    tokenName: string;
    tokensSold: string;
    tokensRemaining: string;
    totalSupply: string;
    currentPrice: number;
    currentPriceFormatted: string;
    tokensPerPress: number;
    progress: number;
}

export function useTokenSupply() {
    const [tokenSupply, setTokenSupply] = useState<TokenSupplyData | null>(null);

    useEffect(() => {
        // Fetch token supply for bonding curve display
        const fetchTokenSupply = async () => {
            try {
                const res = await fetch('/api/buttons/token-supply');
                if (res.ok) {
                    const data = await res.json();
                    setTokenSupply(data);
                }
            } catch (e) {
                console.error('Failed to fetch token supply:', e);
            }
        };
        fetchTokenSupply();

        // Poll token supply every 5 seconds
        const supplyInterval = setInterval(fetchTokenSupply, 5000);

        return () => {
            clearInterval(supplyInterval);
        };
    }, []);

    return tokenSupply;
}
