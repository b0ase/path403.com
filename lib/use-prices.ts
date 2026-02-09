import { useState, useEffect } from 'react';
import type { PriceData, SupportedChain } from './prices';

/**
 * Hook to fetch cryptocurrency prices from the API
 */
export function usePrice(chain: SupportedChain) {
  const [price, setPrice] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchPrice() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/prices?chain=${chain}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch ${chain.toUpperCase()} price`);
        }

        const data = await response.json();

        if (mounted) {
          setPrice(data[chain]);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchPrice();

    // Refresh every 60 seconds
    const interval = setInterval(fetchPrice, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [chain]);

  return { price, loading, error };
}

/**
 * Hook to fetch all cryptocurrency prices at once
 */
export function useAllPrices() {
  const [prices, setPrices] = useState<Record<SupportedChain, PriceData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchPrices() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/prices');

        if (!response.ok) {
          throw new Error('Failed to fetch cryptocurrency prices');
        }

        const data = await response.json();

        if (mounted) {
          setPrices(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchPrices();

    // Refresh every 60 seconds
    const interval = setInterval(fetchPrices, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { prices, loading, error };
}
