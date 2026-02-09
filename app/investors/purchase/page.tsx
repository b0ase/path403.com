'use client';

import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiTarget, FiGitBranch } from 'react-icons/fi';
import { FaArrowRight, FaSpinner, FaCheckCircle, FaCreditCard, FaUniversity, FaBitcoin, FaCopy, FaCheck } from 'react-icons/fa';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

const TOKEN_PRICE = 0.024;
const MIN_INVESTMENT = 100;
const MAX_INVESTMENT = 10000000;

interface TrancheInfo {
  id: string;
  trancheNumber: number;
  name: string;
  description: string | null;
  targetAmountGbp: number;
  raisedAmountGbp: number;
  pricePerPercent: number;
  equityOffered: number;
  status: string;
  milestoneSummary: string | null;
  projectSlug: string;
  projectName: string;
  tokenSymbol: string | null;
}

export default function InvestorPurchasePage() {
  const searchParams = useSearchParams();
  const cancelled = searchParams.get('cancelled');
  const trancheId = searchParams.get('tranche');
  const projectSlug = searchParams.get('project');

  const [amount, setAmount] = useState(1000);
  const [trancheInfo, setTrancheInfo] = useState<TrancheInfo | null>(null);
  const [trancheLoading, setTrancheLoading] = useState(false);
  const [equityPercent, setEquityPercent] = useState(1); // Default 1%
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'wire' | 'crypto'>('stripe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [investorStatus, setInvestorStatus] = useState<{
    hasVault: boolean;
    isRegistered: boolean;
  } | null>(null);
  const [cryptoCurrency, setCryptoCurrency] = useState<'BSV' | 'ETH' | 'SOL'>('BSV');
  const [cryptoPayment, setCryptoPayment] = useState<{
    purchaseId: string;
    address: string;
    amount: string;
    currency: string;
    usdAmount: number;
  } | null>(null);
  const [wireInstructions, setWireInstructions] = useState<{
    purchaseId: string;
    reference: string;
    bankName: string;
    accountName: string;
    sortCode: string;
    accountNumber: string;
    iban: string;
    swift: string;
    amount: number;
    currency: string;
  } | null>(null);
  const [markingSent, setMarkingSent] = useState(false);
  const [paymentMarkedSent, setPaymentMarkedSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const tokenAmount = Math.floor(amount / TOKEN_PRICE);

  // Fetch tranche info if tranche param is present
  useEffect(() => {
    async function fetchTrancheInfo() {
      if (!trancheId) return;
      setTrancheLoading(true);
      try {
        const res = await fetch(`/api/tranches/${trancheId}`);
        if (res.ok) {
          const data = await res.json();
          setTrancheInfo({
            id: data.id,
            trancheNumber: data.tranche_number,
            name: data.name,
            description: data.description,
            targetAmountGbp: Number(data.target_amount_gbp),
            raisedAmountGbp: Number(data.raised_amount_gbp),
            pricePerPercent: Number(data.price_per_percent),
            equityOffered: Number(data.equity_offered),
            status: data.status,
            milestoneSummary: data.milestone_summary,
            projectSlug: data.project_slug,
            projectName: projectSlug?.replace(/-/g, ' ') || data.project_slug,
            tokenSymbol: null, // Could be fetched from portfolio data
          });
          // Set initial amount based on 1% equity
          setAmount(Number(data.price_per_percent));
        }
      } catch (err) {
        console.error('Failed to fetch tranche:', err);
      } finally {
        setTrancheLoading(false);
      }
    }
    fetchTrancheInfo();
  }, [trancheId, projectSlug]);

  // Update amount when equity percent changes (for tranche mode)
  useEffect(() => {
    if (trancheInfo) {
      setAmount(equityPercent * trancheInfo.pricePerPercent);
    }
  }, [equityPercent, trancheInfo]);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/api/investors/register');
        if (res.ok) {
          const data = await res.json();
          setInvestorStatus({
            hasVault: data.hasVault,
            isRegistered: data.isRegistered,
          });
        }
      } catch (err) {
        console.error('Status check error:', err);
      }
    }
    checkStatus();
  }, []);

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);
    setCryptoPayment(null);
    setWireInstructions(null);
    setPaymentMarkedSent(false);

    try {
      const res = await fetch('/api/investors/purchase/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: trancheInfo ? 'GBP' : 'USD', // Tranches use GBP
          paymentMethod,
          cryptoCurrency: paymentMethod === 'crypto' ? cryptoCurrency : undefined,
          // Tranche-specific fields
          trancheId: trancheInfo?.id,
          projectSlug: trancheInfo?.projectSlug,
          equityPercent: trancheInfo ? equityPercent : undefined,
          investmentType: trancheInfo ? 'tranche' : 'token',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.checkoutUrl) {
          // Stripe - redirect to checkout
          window.location.href = data.checkoutUrl;
        } else if (data.wireInstructions) {
          // Wire transfer - show instructions
          setWireInstructions({
            purchaseId: data.purchaseId,
            ...data.wireInstructions,
          });
        } else if (data.cryptoPayment) {
          // Crypto - show payment address
          setCryptoPayment({
            purchaseId: data.purchaseId,
            address: data.cryptoPayment.address,
            amount: data.cryptoPayment.amount,
            currency: data.cryptoPayment.currency,
            usdAmount: data.cryptoPayment.usdAmount,
          });
        }
      } else {
        setError(data.error || 'Failed to initiate purchase');
      }
    } catch (err) {
      console.error('Purchase error:', err);
      setError('Failed to initiate purchase');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSent = async (purchaseId: string) => {
    setMarkingSent(true);
    setError(null);

    try {
      const res = await fetch('/api/investors/purchase/mark-sent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPaymentMarkedSent(true);
      } else {
        setError(data.error || 'Failed to mark payment as sent');
      }
    } catch (err) {
      console.error('Mark sent error:', err);
      setError('Failed to mark payment as sent');
    } finally {
      setMarkingSent(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presetAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

  return (
    <motion.div
      className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-mono relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.section
        className="px-4 md:px-8 py-20 lg:py-32 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="w-full max-w-4xl mx-auto">

          {/* Header */}
          <motion.div
            className="mb-12 border-b border-zinc-900 pb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Link
              href={trancheInfo ? `/invest/${trancheInfo.projectSlug}` : "/investors"}
              className="text-zinc-500 hover:text-white text-sm mb-4 inline-block"
            >
              ← {trancheInfo ? `Back to ${trancheInfo.projectName}` : 'Back to Investor Registry'}
            </Link>
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800 self-start">
                {trancheInfo ? (
                  <FiTarget className="text-4xl md:text-6xl text-white" />
                ) : (
                  <FiTrendingUp className="text-4xl md:text-6xl text-white" />
                )}
              </div>
              <div>
                {trancheInfo ? (
                  <>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">
                      Tranche {trancheInfo.trancheNumber} Investment
                    </p>
                    <h1 className="text-3xl md:text-5xl font-bold text-white leading-none tracking-tighter uppercase">
                      {trancheInfo.projectName}
                    </h1>
                    <p className="text-zinc-500 mt-2">
                      {trancheInfo.name} — {trancheInfo.equityOffered}% equity available
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-3xl md:text-5xl font-bold text-white leading-none tracking-tighter">
                      PURCHASE $BOASE
                    </h1>
                    <p className="text-zinc-500 mt-2">Invest in the b0ase.com venture studio</p>
                  </>
                )}
              </div>
            </div>

            {/* Tranche Info Box */}
            {trancheInfo && (
              <div className="mt-6 p-4 border border-zinc-800 bg-zinc-900/30">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-500 uppercase text-xs tracking-widest">Target</p>
                    <p className="font-bold text-white">£{trancheInfo.targetAmountGbp.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 uppercase text-xs tracking-widest">Raised</p>
                    <p className="font-bold text-green-400">£{trancheInfo.raisedAmountGbp.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 uppercase text-xs tracking-widest">Price per 1%</p>
                    <p className="font-bold text-white">£{trancheInfo.pricePerPercent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 uppercase text-xs tracking-widest">Status</p>
                    <p className={`font-bold uppercase ${
                      trancheInfo.status === 'open' ? 'text-green-400' : 'text-zinc-400'
                    }`}>{trancheInfo.status}</p>
                  </div>
                </div>
                {trancheInfo.milestoneSummary && (
                  <p className="mt-4 text-sm text-zinc-400 border-l-2 border-zinc-700 pl-3">
                    <strong>Deliverables:</strong> {trancheInfo.milestoneSummary}
                  </p>
                )}
              </div>
            )}
          </motion.div>

          {cancelled && (
            <div className="mb-8 p-4 border border-yellow-500/50 bg-yellow-500/10 text-yellow-400">
              Payment was cancelled. You can try again when you're ready.
            </div>
          )}

          {error && (
            <div className="mb-8 p-4 border border-red-500/50 bg-red-500/10 text-red-400">
              {error}
            </div>
          )}

          {/* Payment Marked as Sent Success */}
          {paymentMarkedSent && (
            <div className="mb-8 p-6 border border-green-500/50 bg-green-500/10">
              <div className="flex items-start gap-4">
                <FaCheckCircle className="text-green-500 text-2xl flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-green-400 mb-2">Payment Marked as Sent</h3>
                  <p className="text-green-200/80 text-sm mb-4">
                    We've recorded your payment notification. Our team will verify receipt and credit your tokens.
                  </p>
                  <ul className="text-green-200/60 text-sm space-y-1 list-disc list-inside">
                    <li>Crypto payments: Usually verified within a few hours</li>
                    <li>Wire transfers: Usually 1-2 business days</li>
                    <li>You'll receive an email when your tokens are allocated</li>
                  </ul>
                  <Link
                    href="/investors/dashboard"
                    className="inline-flex items-center gap-2 mt-4 text-green-400 hover:text-green-300"
                  >
                    View your account <FaArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Not Eligible Warning */}
          {investorStatus && (!investorStatus.hasVault || !investorStatus.isRegistered) && (
            <div className="mb-8 p-6 border border-yellow-500/50 bg-yellow-500/10">
              <h3 className="font-bold text-yellow-400 mb-2">Complete Onboarding First</h3>
              <p className="text-yellow-200/80 text-sm mb-4">
                You need to complete the investor onboarding process before you can purchase tokens.
              </p>
              <Link
                href="/investors/onboard"
                className="inline-flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 font-bold uppercase text-sm hover:bg-yellow-400 transition-colors"
              >
                Complete Onboarding <FaArrowRight />
              </Link>
            </div>
          )}

          {/* Wire Instructions Display */}
          {wireInstructions && !paymentMarkedSent && (
            <div className="mb-8 p-6 border border-blue-500/50 bg-blue-500/5">
              <h3 className="font-bold text-blue-400 mb-4 text-lg">Wire Transfer Instructions</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Bank</span>
                  <span className="text-white">{wireInstructions.bankName}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Account Name</span>
                  <span className="text-white">{wireInstructions.accountName}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Sort Code</span>
                  <span className="text-white font-mono">{wireInstructions.sortCode}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Account Number</span>
                  <span className="text-white font-mono">{wireInstructions.accountNumber}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">IBAN</span>
                  <span className="text-white font-mono">{wireInstructions.iban}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">SWIFT/BIC</span>
                  <span className="text-white font-mono">{wireInstructions.swift}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Amount</span>
                  <span className="text-white font-bold">${wireInstructions.amount.toLocaleString()} {wireInstructions.currency}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-zinc-400">Reference (IMPORTANT)</span>
                  <span className="text-yellow-400 font-mono font-bold">{wireInstructions.reference}</span>
                </div>
              </div>
              <p className="text-zinc-500 text-xs mt-4">
                Please use the reference number exactly as shown. This helps us match your payment to your account.
              </p>
              <button
                onClick={() => handleMarkSent(wireInstructions.purchaseId)}
                disabled={markingSent}
                className="w-full mt-6 bg-blue-600 text-white py-3 font-bold uppercase tracking-wider hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {markingSent ? (
                  <>
                    <FaSpinner className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    I've Sent the Wire Transfer <FaCheckCircle />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Crypto Payment Instructions */}
          {cryptoPayment && !paymentMarkedSent && (
            <div className="mb-8 p-6 border border-yellow-500/50 bg-yellow-500/5">
              <h3 className="font-bold text-yellow-400 mb-4 text-lg">Send {cryptoPayment.currency} Payment</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-zinc-400 text-sm mb-1">Send exactly:</div>
                  <div className="font-mono text-2xl text-white">{cryptoPayment.amount} {cryptoPayment.currency}</div>
                  <div className="text-zinc-500 text-sm">≈ ${cryptoPayment.usdAmount.toLocaleString()} USD</div>
                </div>
                <div>
                  <div className="text-zinc-400 text-sm mb-1">To address:</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 font-mono text-sm bg-zinc-900 p-3 text-green-400 break-all select-all border border-zinc-700">
                      {cryptoPayment.address}
                    </div>
                    <button
                      onClick={() => copyToClipboard(cryptoPayment.address)}
                      className="p-3 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                      title="Copy address"
                    >
                      {copied ? <FaCheck className="text-green-400" /> : <FaCopy className="text-zinc-400" />}
                    </button>
                  </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4 text-sm">
                  <p className="text-zinc-400 mb-2">After sending your payment:</p>
                  <ol className="text-zinc-300 space-y-1 list-decimal list-inside">
                    <li>Click the button below to notify us</li>
                    <li>We'll check our treasury for your payment</li>
                    <li>Your tokens will be credited (usually within a few hours)</li>
                  </ol>
                </div>
                <button
                  onClick={() => handleMarkSent(cryptoPayment.purchaseId)}
                  disabled={markingSent}
                  className="w-full bg-yellow-500 text-black py-3 font-bold uppercase tracking-wider hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {markingSent ? (
                    <>
                      <FaSpinner className="animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      I've Sent the Payment <FaCheckCircle />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Purchase Form - only show if no pending payment */}
          {!cryptoPayment && !wireInstructions && !paymentMarkedSent && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Investment Amount */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="border border-zinc-800 p-8"
              >
                <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">
                  {trancheInfo ? 'Investment Amount' : 'Investment Amount'}
                </h2>

                {trancheInfo ? (
                  /* Tranche Mode: Equity Selection */
                  <>
                    {/* Equity Percentage Slider */}
                    <div className="mb-6">
                      <label className="block text-sm text-zinc-400 mb-2">
                        Equity Percentage (max {trancheInfo.equityOffered}%)
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="0.5"
                          max={trancheInfo.equityOffered}
                          step="0.5"
                          value={equityPercent}
                          onChange={(e) => setEquityPercent(parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                        />
                        <div className="w-20 text-center">
                          <span className="text-2xl font-bold text-white">{equityPercent}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Select Buttons */}
                    <div className="grid grid-cols-4 gap-2 mb-6">
                      {[1, 2, 5, trancheInfo.equityOffered].filter((v, i, a) => a.indexOf(v) === i).map((pct) => (
                        <button
                          key={pct}
                          onClick={() => setEquityPercent(Math.min(pct, trancheInfo.equityOffered))}
                          className={`py-3 text-sm font-bold uppercase transition-colors ${
                            equityPercent === pct
                              ? 'bg-green-600 text-white'
                              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>

                    {/* Investment Summary */}
                    <div className="bg-zinc-900 border border-zinc-800 p-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-zinc-500">Price per 1%</span>
                        <span className="text-zinc-300">£{trancheInfo.pricePerPercent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-zinc-500">Equity</span>
                        <span className="text-zinc-300">{equityPercent}%</span>
                      </div>
                      <div className="border-t border-zinc-800 pt-2 mt-2">
                        <div className="flex justify-between font-bold">
                          <span className="text-white">Total Investment</span>
                          <span className="text-green-400 text-xl">£{amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Escrow Notice */}
                    <div className="mt-4 p-3 border border-blue-800/50 bg-blue-900/20 text-sm">
                      <p className="text-blue-300">
                        <strong>Escrow Protected:</strong> Your funds are held in escrow until GitHub PRs for this tranche are merged.
                        You receive tokens immediately, held in 2-of-2 multisig custody.
                      </p>
                    </div>
                  </>
                ) : (
                  /* Token Mode: Standard $BOASE purchase */
                  <>
                    {/* Preset Amounts */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      {presetAmounts.map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setAmount(preset)}
                          className={`py-3 text-sm font-bold uppercase transition-colors ${
                            amount === preset
                              ? 'bg-white text-black'
                              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                          }`}
                        >
                          ${preset.toLocaleString()}
                        </button>
                      ))}
                    </div>

                    {/* Custom Amount */}
                    <div className="mb-6">
                      <label className="block text-sm text-zinc-400 mb-2">Custom Amount (USD)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(Math.max(MIN_INVESTMENT, Math.min(MAX_INVESTMENT, parseInt(e.target.value) || 0)))}
                          min={MIN_INVESTMENT}
                          max={MAX_INVESTMENT}
                          className="w-full bg-zinc-900 border border-zinc-700 pl-8 pr-4 py-3 text-white text-lg focus:border-white outline-none transition-colors"
                        />
                      </div>
                      <p className="text-zinc-500 text-xs mt-2">
                        Min: ${MIN_INVESTMENT.toLocaleString()} | Max: ${MAX_INVESTMENT.toLocaleString()}
                      </p>
                    </div>

                    {/* Token Calculation */}
                    <div className="bg-zinc-900 border border-zinc-800 p-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-zinc-500">Token Price</span>
                        <span className="text-zinc-300">${TOKEN_PRICE}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-zinc-500">Investment</span>
                        <span className="text-zinc-300">${amount.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-zinc-800 pt-2 mt-2">
                        <div className="flex justify-between font-bold">
                          <span className="text-white">Tokens</span>
                          <span className="text-white">{tokenAmount.toLocaleString()} $BOASE</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="border border-zinc-800 p-8"
              >
                <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Payment Method</h2>

                <div className="space-y-4">
                  <label
                    className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${
                      paymentMethod === 'stripe'
                        ? 'border-white bg-zinc-900'
                        : 'border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={() => setPaymentMethod('stripe')}
                      className="sr-only"
                    />
                    <FaCreditCard className={paymentMethod === 'stripe' ? 'text-white' : 'text-zinc-500'} />
                    <div>
                      <div className="font-bold text-white">Credit/Debit Card</div>
                      <div className="text-zinc-500 text-sm">Via Stripe - Instant processing</div>
                    </div>
                    {paymentMethod === 'stripe' && <FaCheckCircle className="ml-auto text-green-500" />}
                  </label>

                  <label
                    className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${
                      paymentMethod === 'wire'
                        ? 'border-white bg-zinc-900'
                        : 'border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="wire"
                      checked={paymentMethod === 'wire'}
                      onChange={() => setPaymentMethod('wire')}
                      className="sr-only"
                    />
                    <FaUniversity className={paymentMethod === 'wire' ? 'text-white' : 'text-zinc-500'} />
                    <div>
                      <div className="font-bold text-white">Wire Transfer</div>
                      <div className="text-zinc-500 text-sm">1-2 business days</div>
                    </div>
                    {paymentMethod === 'wire' && <FaCheckCircle className="ml-auto text-green-500" />}
                  </label>

                  <label
                    className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${
                      paymentMethod === 'crypto'
                        ? 'border-white bg-zinc-900'
                        : 'border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="crypto"
                      checked={paymentMethod === 'crypto'}
                      onChange={() => setPaymentMethod('crypto')}
                      className="sr-only"
                    />
                    <FaBitcoin className={paymentMethod === 'crypto' ? 'text-white' : 'text-zinc-500'} />
                    <div>
                      <div className="font-bold text-white">Cryptocurrency</div>
                      <div className="text-zinc-500 text-sm">BSV, ETH, or SOL</div>
                    </div>
                    {paymentMethod === 'crypto' && <FaCheckCircle className="ml-auto text-green-500" />}
                  </label>

                  {/* Crypto Currency Selection */}
                  {paymentMethod === 'crypto' && (
                    <div className="ml-8 mt-2 flex gap-2">
                      {(['BSV', 'ETH', 'SOL'] as const).map((currency) => (
                        <button
                          key={currency}
                          onClick={() => setCryptoCurrency(currency)}
                          className={`px-4 py-2 text-sm font-bold uppercase transition-colors ${
                            cryptoCurrency === currency
                              ? 'bg-white text-black'
                              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-700'
                          }`}
                        >
                          {currency}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={loading || !investorStatus?.hasVault || !investorStatus?.isRegistered || (trancheInfo && trancheInfo.status !== 'open')}
                  className={`w-full mt-8 py-4 font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 ${
                    trancheInfo
                      ? 'bg-green-600 text-white hover:bg-green-500'
                      : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" /> Processing...
                    </>
                  ) : trancheInfo ? (
                    <>
                      Invest £{amount.toLocaleString()} for {equityPercent}% equity <FaArrowRight />
                    </>
                  ) : (
                    <>
                      Purchase ${amount.toLocaleString()} <FaArrowRight />
                    </>
                  )}
                </button>
              </motion.div>
            </div>
          )}

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8 text-zinc-500 text-xs"
          >
            <p className="mb-2">
              <strong>Risk Disclosure:</strong> Investing in securities involves substantial risk of loss.
              Past performance is not indicative of future results. Only invest what you can afford to lose.
            </p>
            <p>
              $BOASE tokens are offered under FSMA prospectus exemptions to certified high net worth
              and sophisticated investors only. By proceeding, you confirm you meet UK certified investor requirements.
            </p>
          </motion.div>

        </div>
      </motion.section>
    </motion.div>
  );
}
