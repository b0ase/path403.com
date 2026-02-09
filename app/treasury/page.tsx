'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import CapTable from '@/components/token/CapTable';
import { useYoursWalletContext } from '@/lib/contexts/YoursWalletContext';
import { FaWallet, FaCoins, FaExchangeAlt, FaChartLine, FaLock, FaUsers, FaRocket } from 'react-icons/fa';
import { FiHome, FiCpu } from 'react-icons/fi';

interface PricingTier {
  minAmount: number;
  maxAmount: number;
  pricePerThousand: number;
  discount: number;
}

interface TreasuryInfo {
  token: {
    tokenId: string;
    symbol: string;
    totalSupply: number;
    treasuryBalance: number;
    bsvBalance: number;
    marketUrl: string;
  };
  pricing: {
    tiers: PricingTier[];
  };
  capTable: any[];
  circulatingSupply: number;
}

export default function TreasuryPage() {
  const { isConnected, addresses, connect, disconnect } = useYoursWalletContext();
  const [treasuryInfo, setTreasuryInfo] = useState<TreasuryInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchaseAmount, setPurchaseAmount] = useState<number>(10000);
  const [quote, setQuote] = useState<any>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'BSV' | 'ETH' | 'SOL'>('BSV');
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  // Total supply: 100 Billion $BOASE tokens
  const TOTAL_SUPPLY = 100_000_000_000;

  useEffect(() => {
    fetchTreasuryInfo();
  }, []);

  useEffect(() => {
    if (purchaseAmount >= 1000) {
      fetchQuote();
    }
  }, [purchaseAmount, selectedCurrency]);

  const fetchTreasuryInfo = async () => {
    try {
      const res = await fetch('/api/treasury');
      const data = await res.json();
      setTreasuryInfo(data);
    } catch (error) {
      console.error('Failed to fetch treasury info:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuote = async () => {
    setLoadingQuote(true);
    try {
      const res = await fetch(
        `/api/treasury?action=quote&amount=${purchaseAmount}&currency=${selectedCurrency}`
      );
      const data = await res.json();
      setQuote(data);
    } catch (error) {
      console.error('Failed to fetch quote:', error);
    } finally {
      setLoadingQuote(false);
    }
  };

  const formatNumber = (n: number): string => {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
    return n.toLocaleString();
  };

  const formatFullNumber = (n: number): string => {
    return n.toLocaleString();
  };

  const getTierForAmount = (amount: number): PricingTier | null => {
    if (!treasuryInfo) return null;
    return treasuryInfo.pricing.tiers.find(
      t => amount >= t.minAmount && amount <= t.maxAmount
    ) || null;
  };

  const currentTier = getTierForAmount(purchaseAmount);

  const handlePurchase = async () => {
    if (!isConnected || !quote) return;

    setPurchasing(true);
    setPurchaseError(null);
    setPurchaseSuccess(null);

    try {
      const res = await fetch('/api/treasury', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'purchase',
          amount: purchaseAmount,
          currency: selectedCurrency,
          buyerAddress: addresses.bsvAddress
        })
      });

      const data = await res.json();

      if (data.error) {
        setPurchaseError(data.error);
      } else {
        setPurchaseSuccess(`Successfully purchased ${formatNumber(purchaseAmount)} $BOASE tokens!`);
        fetchTreasuryInfo();
      }
    } catch (error) {
      setPurchaseError('Failed to process purchase. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
        <div className="text-center">
          <div className="animate-pulse text-2xl mb-4">_</div>
          <p className="text-zinc-500 text-xs uppercase tracking-widest">Loading treasury data...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-black text-white relative font-mono selection:bg-white selection:text-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Main Content */}
      <motion.section
        className="px-4 md:px-8 py-16 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="w-full">
          {/* Header */}
          <div className="mb-8 flex items-end gap-4 border-b border-zinc-900 pb-4">
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
              TREASURY<span className="text-zinc-600">_SYS</span>
            </h2>
            <div className="text-xs text-zinc-500 mb-2 uppercase tracking-widest">
              $BOASE Token Management
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-black border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaCoins className="text-zinc-600" />
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">Total Supply</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatNumber(TOTAL_SUPPLY)}</p>
              <p className="text-[10px] text-zinc-600 mt-1">{formatFullNumber(TOTAL_SUPPLY)} tokens</p>
            </div>
            <div className="bg-black border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaLock className="text-zinc-600" />
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">Treasury Balance</span>
              </div>
              <p className="text-2xl font-bold text-green-500">
                {formatNumber(treasuryInfo?.token.treasuryBalance || 0)}
              </p>
              <p className="text-[10px] text-zinc-600 mt-1">$BOASE tokens</p>
            </div>
            <div className="bg-black border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaUsers className="text-zinc-600" />
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">Circulating</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">
                {formatNumber(treasuryInfo?.circulatingSupply || 0)}
              </p>
              <p className="text-[10px] text-zinc-600 mt-1">$BOASE tokens</p>
            </div>
            <div className="bg-black border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaChartLine className="text-zinc-600" />
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">BSV Balance</span>
              </div>
              <p className="text-2xl font-bold text-yellow-500">
                {(treasuryInfo?.token.bsvBalance || 0).toFixed(4)}
              </p>
              <p className="text-[10px] text-zinc-600 mt-1">BSV</p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Purchase Form */}
            <div className="bg-black border border-zinc-800">
              <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Purchase_Tokens</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              </div>

              <div className="p-4 space-y-4">
                {/* Amount Input */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
                    Token Amount
                  </label>
                  <input
                    type="number"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(Math.max(1000, parseInt(e.target.value) || 0))}
                    min={1000}
                    step={1000}
                    className="w-full bg-black border border-zinc-700 p-3 text-xl font-bold text-white focus:border-white focus:outline-none transition-colors"
                  />
                  <p className="text-[10px] text-zinc-600 mt-1">Minimum: 1,000 tokens</p>
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex flex-wrap gap-2">
                  {[10000, 50000, 100000, 500000, 1000000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setPurchaseAmount(amount)}
                      className={`px-3 py-1.5 text-xs border transition-colors ${
                        purchaseAmount === amount
                          ? 'border-white text-white bg-white/10'
                          : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                      }`}
                    >
                      {formatNumber(amount)}
                    </button>
                  ))}
                </div>

                {/* Payment Currency */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
                    Payment Currency
                  </label>
                  <div className="flex gap-2">
                    {(['BSV', 'ETH', 'SOL'] as const).map(currency => (
                      <button
                        key={currency}
                        onClick={() => setSelectedCurrency(currency)}
                        className={`flex-1 py-2 text-xs font-bold uppercase border transition-colors ${
                          selectedCurrency === currency
                            ? 'border-white text-white bg-white/10'
                            : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'
                        }`}
                      >
                        {currency}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pricing Tier */}
                {currentTier && (
                  <div className="border border-zinc-700 p-3 bg-zinc-900/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                        Your Tier
                      </span>
                      {currentTier.discount > 0 && (
                        <span className="text-[10px] px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30">
                          {currentTier.discount}% OFF
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-white">
                      ${currentTier.pricePerThousand} per 1,000 tokens
                    </p>
                  </div>
                )}

                {/* Quote */}
                {quote && !loadingQuote && (
                  <div className="border border-white p-3 bg-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase tracking-wider text-white">
                        Total Price
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        ${quote.priceUsd?.toFixed(2)} USD
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {quote.payment?.amount?.toFixed(6)} {selectedCurrency}
                    </p>
                    {quote.savings > 0 && (
                      <p className="text-[10px] text-green-400 mt-1">
                        You save ${quote.savings.toFixed(2)} with volume discount
                      </p>
                    )}
                  </div>
                )}

                {/* Status Messages */}
                {purchaseError && (
                  <div className="border border-red-500/50 bg-red-500/10 p-3">
                    <p className="text-red-400 text-xs">{purchaseError}</p>
                  </div>
                )}
                {purchaseSuccess && (
                  <div className="border border-green-500/50 bg-green-500/10 p-3">
                    <p className="text-green-400 text-xs">{purchaseSuccess}</p>
                  </div>
                )}

                {/* Purchase Button */}
                {!isConnected ? (
                  <button
                    onClick={connect}
                    className="w-full py-3 bg-white text-black font-bold uppercase tracking-wider text-sm hover:bg-zinc-200 flex items-center justify-center gap-2 transition-colors"
                  >
                    <FaWallet size={14} />
                    Connect Wallet to Purchase
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handlePurchase}
                      disabled={!quote || purchaseAmount < 1000 || purchasing}
                      className="w-full py-3 bg-white text-black font-bold uppercase tracking-wider text-sm hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {purchasing ? 'Processing...' : `Purchase ${formatNumber(purchaseAmount)} $BOASE`}
                    </button>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-zinc-600">
                        Connected: {addresses.bsvAddress.slice(0, 8)}...{addresses.bsvAddress.slice(-6)}
                      </span>
                      <button
                        onClick={disconnect}
                        className="text-zinc-600 hover:text-white transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Cap Table */}
            <div>
              <CapTable
                entries={treasuryInfo?.capTable || []}
                tokenSymbol="BOASE"
                totalSupply={TOTAL_SUPPLY}
              />
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="mt-8 bg-black border border-zinc-800">
            <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Volume_Discounts</span>
            </div>
            <div className="grid md:grid-cols-4 divide-x divide-zinc-900">
              {treasuryInfo?.pricing.tiers.map((tier, i) => (
                <div
                  key={i}
                  className={`p-4 ${currentTier === tier ? 'bg-white/5' : ''}`}
                >
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                    {formatNumber(tier.minAmount)}+ tokens
                  </p>
                  <p className="text-xl font-bold mb-0.5">
                    ${tier.pricePerThousand}
                  </p>
                  <p className="text-[10px] text-zinc-600">per 1,000 tokens</p>
                  {tier.discount > 0 && (
                    <p className="text-[10px] text-green-400 mt-1">
                      {tier.discount}% discount
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Token Info */}
          <div className="mt-8 bg-black border border-zinc-800 p-6">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Token_Info</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Symbol</p>
                <p className="font-bold">$BOASE</p>
              </div>
              <div>
                <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Network</p>
                <p className="font-bold">BSV (Bitcoin SV)</p>
              </div>
              <div>
                <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Protocol</p>
                <p className="font-bold">BSV-20</p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <a
              href={treasuryInfo?.token.marketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white hover:border-white text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              <FaExchangeAlt size={12} />
              Trade on 1Sat.Market
            </a>
            <Link
              href="/boasetoken"
              className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white hover:border-white text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              <FaRocket size={12} />
              Token Info
            </Link>
            <Link
              href="/"
              className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white hover:border-white text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              <FiHome size={12} />
              Home
            </Link>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
