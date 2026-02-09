'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/components/WalletProvider';

interface TokenStats {
  currentPrice: number;
  treasuryBalance: number;
}

export default function WhitepaperPaywallPage() {
  const { wallet, connectHandCash } = useWallet();
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [bsvUsdPrice, setBsvUsdPrice] = useState<number>(45);
  const [tokensToReceive, setTokensToReceive] = useState<number>(0);

  // Fetch token stats and BSV price
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, priceRes] = await Promise.all([
          fetch('/api/token/stats'),
          fetch('/api/price/bsv'),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (priceRes.ok) {
          const priceData = await priceRes.json();
          if (priceData.bsv_usd) {
            setBsvUsdPrice(priceData.bsv_usd);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  // Calculate tokens for $0.01 USD
  useEffect(() => {
    if (stats && bsvUsdPrice) {
      // $0.01 USD in sats
      const usdCents = 1; // $0.01
      const satsPerDollar = 100_000_000 / bsvUsdPrice;
      const spendSats = Math.ceil((usdCents / 100) * satsPerDollar);

      // Calculate tokens at current price
      const tokens = Math.floor(spendSats / stats.currentPrice);
      setTokensToReceive(Math.max(1, tokens));
    }
  }, [stats, bsvUsdPrice]);

  const handlePurchase = async () => {
    if (!wallet.connected) {
      setMessage({ type: 'error', text: 'Please connect your wallet first' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Calculate $0.01 USD in sats
      const usdCents = 1;
      const satsPerDollar = 100_000_000 / bsvUsdPrice;
      const spendSats = Math.ceil((usdCents / 100) * satsPerDollar);

      const res = await fetch('/api/token/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': wallet.address || '',
          'x-wallet-provider': wallet.provider || '',
          'x-wallet-handle': wallet.handle || '',
        },
        body: JSON.stringify({ spendSats }),
      });

      const data = await res.json();

      if (!res.ok) {
        let errorText = data.error || 'Purchase failed';
        if (data.details?.includes('spending limit') || data.details?.includes('INSUFFICIENT')) {
          errorText = 'HandCash spending limit exceeded. Visit app.handcash.io to increase your limit.';
        }
        throw new Error(errorText);
      }

      setMessage({
        type: 'success',
        text: `Payment successful! You received ${data.amount.toLocaleString()} $402 tokens. Downloading PDF...`
      });

      // Trigger PDF download
      setTimeout(() => {
        window.open('/whitepaper?download=true', '_blank');
      }, 1500);

    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Purchase failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center pt-14">
      <div className="text-center">
        {/* Big Round $402 Button */}
        <div className="mb-8 flex justify-center">
          <button
            onClick={wallet.connected ? handlePurchase : connectHandCash}
            disabled={loading}
            className="w-96 h-96 -full text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 relative flex flex-col items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f0f0f0 50%, #d4d4d4 100%)',
              boxShadow: `
                0 25px 80px -20px rgba(0, 0, 0, 0.5),
                0 15px 30px -15px rgba(0, 0, 0, 0.3),
                inset 0 -10px 30px rgba(0, 0, 0, 0.12),
                inset 0 10px 30px rgba(255, 255, 255, 0.9)
              `,
            }}
          >
            {/* Inner highlight */}
            <span
              className="absolute inset-6 -full pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 50%)',
              }}
            />
            {/* Content */}
            <span className="relative z-10 flex flex-col items-center">
              {loading ? (
                <svg className="animate-spin h-20 w-20 text-black" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  <span className="text-8xl font-bold">$402</span>
                  <span className="text-lg mt-3 text-gray-600">
                    $0.01 → <span className="text-green-600 font-semibold">{tokensToReceive.toLocaleString()}</span>
                  </span>
                </>
              )}
            </span>
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3  max-w-sm mx-auto text-sm ${
            message.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
