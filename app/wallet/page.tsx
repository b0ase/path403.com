'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWallet } from '@/components/WalletProvider';
import { deriveWalletClientSide, decryptWifClientSide } from '@/lib/client-wallet';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

interface Holding {
  balance: number;
  onChainBalance: number;
  dbBalance: number;
  stakedBalance: number;
  availableBalance: number;
  pendingDividends: number;
  totalDividendsEarned: number;
}

interface Stats {
  totalCirculating: number;
  currentPrice: number;
}

interface DerivedAddress {
  address: string;
  publicKey?: string;
}

interface MarketplaceToken {
  tokenAddress: string;
  symbol: string;
  name: string;
  balance: number;
  avgCost: number;
  currentPrice: number;
  value: number;
  pnl: number;
  contentType?: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors text-[10px] uppercase tracking-widest"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function WalletPage() {
  const { wallet, connectHandCash } = useWallet();
  const [holding, setHolding] = useState<Holding | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [derivedAddress, setDerivedAddress] = useState<DerivedAddress | null>(null);
  const [deriving, setDeriving] = useState(false);
  const [deriveError, setDeriveError] = useState<string | null>(null);
  const [newlyDerivedWif, setNewlyDerivedWif] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportedWif, setExportedWif] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawResult, setWithdrawResult] = useState<{ txId: string; amount: number } | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [marketplaceTokens, setMarketplaceTokens] = useState<MarketplaceToken[]>([]);
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<string | null>(null);

  const formatNumber = (n: number | undefined | null) => (n ?? 0).toLocaleString();
  const formatSats = (sats: number | undefined | null) => {
    const val = sats ?? 0;
    if (val >= 100000000) return `${(val / 100000000).toFixed(4)} BSV`;
    return `${formatNumber(val)} sats`;
  };

  useEffect(() => {
    if (wallet.connected) {
      fetchData();
      if (wallet.handle && wallet.provider === 'handcash') {
        checkExistingWallet();
      }
    } else {
      setLoading(false);
    }
  }, [wallet.connected, wallet.handle]);

  const fetchData = async () => {
    try {
      const headers: Record<string, string> = {};
      if (wallet.handle) headers['x-wallet-handle'] = wallet.handle;
      if (wallet.provider) headers['x-wallet-provider'] = wallet.provider;

      const [holdingRes, statsRes, holdingsRes] = await Promise.all([
        fetch('/api/token/holding'),
        fetch('/api/token/stats'),
        wallet.handle ? fetch('/api/tokens/holdings', { headers }) : Promise.resolve(null),
      ]);

      if (holdingRes.ok) setHolding(await holdingRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (holdingsRes?.ok) {
        const data = await holdingsRes.json();
        if (Array.isArray(data.holdings)) setMarketplaceTokens(data.holdings);
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingWallet = async () => {
    try {
      const res = await fetch('/api/account/derive', {
        headers: {
          'x-wallet-handle': wallet.handle!,
          'x-wallet-provider': 'handcash',
        },
      });
      const data = await res.json();
      if (data.hasExistingWallet && data.existingAddress) {
        setDerivedAddress({ address: data.existingAddress });
      }
    } catch (error) {
      console.error('Failed to check wallet:', error);
    }
  };

  const deriveAddress = async () => {
    if (!wallet.handle || wallet.provider !== 'handcash') {
      setDeriveError('HandCash connection required');
      return;
    }

    setDeriving(true);
    setDeriveError(null);
    setNewlyDerivedWif(null);

    try {
      const messageRes = await fetch('/api/account/derive', {
        headers: {
          'x-wallet-handle': wallet.handle,
          'x-wallet-provider': 'handcash',
        },
      });
      const { message, hasExistingWallet, existingAddress } = await messageRes.json();

      if (hasExistingWallet && existingAddress) {
        setDerivedAddress({ address: existingAddress });
        setDeriving(false);
        return;
      }

      const signRes = await fetch('/api/auth/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!signRes.ok) {
        const err = await signRes.json();
        throw new Error(err.error || 'Failed to sign message');
      }

      const { signature } = await signRes.json();
      const clientWallet = await deriveWalletClientSide(signature, wallet.handle);

      const storeRes = await fetch('/api/account/store-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-handle': wallet.handle,
          'x-wallet-provider': 'handcash',
        },
        body: JSON.stringify({
          address: clientWallet.address,
          publicKey: clientWallet.publicKey,
          encryptedWif: clientWallet.encryptedWif,
          encryptionSalt: clientWallet.encryptionSalt,
        }),
      });

      if (!storeRes.ok) {
        const err = await storeRes.json();
        throw new Error(err.error || 'Failed to store wallet');
      }

      setNewlyDerivedWif(clientWallet.wif);
      setDerivedAddress({ address: clientWallet.address, publicKey: clientWallet.publicKey });
    } catch (error) {
      setDeriveError(error instanceof Error ? error.message : 'Failed to derive address');
    } finally {
      setDeriving(false);
    }
  };

  const exportPrivateKey = async () => {
    if (!wallet.handle || wallet.provider !== 'handcash') return;
    setExporting(true);
    setExportError(null);
    setExportedWif(null);

    try {
      const walletRes = await fetch('/api/wallet/encrypted', {
        headers: {
          'x-wallet-handle': wallet.handle,
          'x-wallet-provider': 'handcash',
        },
      });
      if (!walletRes.ok) throw new Error('Failed to get wallet data');

      const { encryptedWif, encryptionSalt } = await walletRes.json();
      const wif = await decryptWifClientSide(encryptedWif, wallet.handle, encryptionSalt);
      setExportedWif(wif);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Failed to export key');
    } finally {
      setExporting(false);
    }
  };

  const withdrawToMyAddress = async () => {
    if (!wallet.handle || wallet.provider !== 'handcash' || !derivedAddress) {
      setWithdrawError('HandCash connection and derived address required');
      return;
    }

    const amount = parseInt(withdrawAmount);
    if (!amount || amount <= 0) {
      setWithdrawError('Enter a valid amount');
      return;
    }

    const availableBalance = holding ? holding.balance - holding.stakedBalance : 0;
    if (amount > availableBalance) {
      setWithdrawError(`Maximum available: ${availableBalance.toLocaleString()}`);
      return;
    }

    setWithdrawing(true);
    setWithdrawError(null);
    setWithdrawResult(null);

    try {
      const timestamp = new Date().toISOString();
      const destination = derivedAddress.address;

      await fetch('/api/token/withdraw', {
        headers: {
          'x-wallet-handle': wallet.handle,
          'x-wallet-provider': 'handcash',
        },
      });

      const withdrawMessage = `Withdraw ${amount.toLocaleString()} $PATH402 to ${destination}. Timestamp: ${timestamp}`;
      const signRes = await fetch('/api/auth/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: withdrawMessage }),
      });

      if (!signRes.ok) throw new Error('Failed to sign message');
      const { signature } = await signRes.json();

      const withdrawRes = await fetch('/api/token/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-handle': wallet.handle,
          'x-wallet-provider': 'handcash',
        },
        body: JSON.stringify({ amount, destination, signature, timestamp }),
      });

      if (!withdrawRes.ok) {
        const err = await withdrawRes.json();
        throw new Error(err.error || 'Withdrawal failed');
      }

      const result = await withdrawRes.json();
      setWithdrawResult({ txId: result.txId, amount: result.amount });
      setWithdrawAmount('');
      fetchData();
    } catch (error) {
      setWithdrawError(error instanceof Error ? error.message : 'Withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  const claimDividends = async () => {
    setClaiming(true);
    setClaimResult(null);
    try {
      const res = await fetch('/api/stake/claim', { method: 'POST' });
      if (!res.ok) throw new Error('Claim failed');
      const data = await res.json();
      setClaimResult(`Claimed ${(data.amount ?? 0).toLocaleString()} $PATH402`);
      fetchData();
    } catch {
      setClaimResult('Claim failed');
    } finally {
      setClaiming(false);
    }
  };

  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-white dark:bg-black pt-20 px-6 md:px-16">
        <div className="max-w-[1920px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500 mb-6">
            HTTP_402: PAYMENT_REQUIRED
          </div>
          <h1 className="text-2xl font-mono font-bold text-zinc-900 dark:text-white uppercase tracking-tight mb-4">
            WALLET<span className="text-zinc-300 dark:text-zinc-700">.SYS</span>
          </h1>
          <p className="text-zinc-500 text-sm mb-8">Connect your wallet to access the payment layer.</p>
          <button
            onClick={connectHandCash}
            className="px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black pt-20 px-6 md:px-16">
        <div className="max-w-[1920px] mx-auto">
          <div className="text-zinc-500 text-sm font-mono animate-pulse">Loading wallet...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-20 px-6 md:px-16 pb-20">
      <div className="max-w-[1920px] mx-auto">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          {/* Header */}
          <motion.div className="mb-8" variants={fadeIn}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500 mb-4">
              HTTP_402: PAYMENT_REQUIRED
            </div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1">
              Token Holdings // On-Chain Wallet
            </div>
            <h1 className="text-3xl font-mono font-bold text-zinc-900 dark:text-white uppercase tracking-tight">
              WALLET<span className="text-zinc-300 dark:text-zinc-700">.SYS</span>
            </h1>
          </motion.div>

          {/* Balance Grid */}
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6" variants={fadeIn}>
            <div className="border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-950">
              <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-2">Total</div>
              <div className="text-xl font-mono font-bold text-zinc-900 dark:text-white">{formatNumber(holding?.balance)}</div>
              <div className="text-[10px] text-zinc-500 font-mono">$PATH402</div>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-950">
              <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-2">On-Chain</div>
              <div className="text-xl font-mono font-bold text-green-600 dark:text-green-400">{formatNumber(holding?.onChainBalance)}</div>
              <div className="text-[10px] text-zinc-500 font-mono">You control</div>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-950">
              <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-2">Staked</div>
              <div className="text-xl font-mono font-bold text-purple-600 dark:text-purple-400">{formatNumber(holding?.stakedBalance)}</div>
              <div className="text-[10px] text-zinc-500 font-mono">Earning</div>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-950">
              <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-2">Available</div>
              <div className="text-xl font-mono font-bold text-zinc-900 dark:text-white">{formatNumber(holding?.availableBalance)}</div>
              <div className="text-[10px] text-zinc-500 font-mono">Withdrawable</div>
            </div>
          </motion.div>

          {/* On-Chain Address */}
          <motion.div className="border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-950 mb-6" variants={fadeIn}>
            <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-3">On-Chain Address</div>

            {derivedAddress ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-green-500" />
                  <code className="text-sm font-mono text-zinc-900 dark:text-white break-all">{derivedAddress.address}</code>
                  <CopyButton text={derivedAddress.address} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://whatsonchain.com/address/${derivedAddress.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  >
                    Explorer
                  </a>
                  <button
                    onClick={exportPrivateKey}
                    disabled={exporting}
                    className="text-[10px] uppercase tracking-widest text-yellow-600 dark:text-yellow-400 hover:text-yellow-500 disabled:opacity-50 transition-colors"
                  >
                    {exporting ? 'Signing...' : 'Export Key'}
                  </button>
                </div>

                {exportError && (
                  <div className="text-xs font-mono text-red-500 bg-red-500/10 border border-red-500/20 p-2">{exportError}</div>
                )}

                {newlyDerivedWif && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30">
                    <div className="text-[10px] text-green-600 dark:text-green-400 uppercase tracking-widest mb-2">Private Key — Save Now</div>
                    <div className="p-2 bg-zinc-200 dark:bg-zinc-900 font-mono text-xs break-all text-zinc-900 dark:text-white select-all mb-3">
                      {newlyDerivedWif}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(newlyDerivedWif)}
                        className="px-3 py-1.5 text-xs border border-green-500/50 text-green-600 dark:text-green-400 hover:bg-green-500/10 transition-colors"
                      >
                        Copy WIF
                      </button>
                      <button
                        onClick={() => setNewlyDerivedWif(null)}
                        className="px-3 py-1.5 text-xs border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                      >
                        I&apos;ve Saved It
                      </button>
                    </div>
                  </div>
                )}

                {exportedWif && !newlyDerivedWif && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30">
                    <div className="text-[10px] text-yellow-600 dark:text-yellow-400 uppercase tracking-widest mb-2">Private Key (WIF)</div>
                    <div className="p-2 bg-zinc-200 dark:bg-zinc-900 font-mono text-xs break-all text-zinc-900 dark:text-white select-all mb-3">
                      {exportedWif}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(exportedWif)}
                        className="px-3 py-1.5 text-xs border border-yellow-500/50 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/10 transition-colors"
                      >
                        Copy WIF
                      </button>
                      <button
                        onClick={() => setExportedWif(null)}
                        className="px-3 py-1.5 text-xs border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                      >
                        Hide
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-zinc-500 text-sm">Derive your on-chain address from your HandCash signature.</p>
                {deriveError && (
                  <div className="text-xs font-mono text-red-500 bg-red-500/10 border border-red-500/20 p-2">{deriveError}</div>
                )}
                {wallet.provider === 'handcash' ? (
                  <button
                    onClick={deriveAddress}
                    disabled={deriving}
                    className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
                  >
                    {deriving ? 'Signing...' : 'Derive Address'}
                  </button>
                ) : (
                  <p className="text-yellow-600 dark:text-yellow-400 text-xs">Connect via HandCash to derive your address.</p>
                )}
              </div>
            )}
          </motion.div>

          {/* Marketplace Holdings */}
          <motion.div className="border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-950 mb-6" variants={fadeIn}>
            <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-3">Marketplace Holdings</div>

            {marketplaceTokens.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800">
                      <th className="text-left py-2 font-normal">Token</th>
                      <th className="text-right py-2 font-normal">Balance</th>
                      <th className="text-right py-2 font-normal hidden md:table-cell">Avg Cost</th>
                      <th className="text-right py-2 font-normal">Value</th>
                      <th className="text-right py-2 font-normal hidden md:table-cell">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketplaceTokens.map((token) => (
                      <tr key={token.tokenAddress} className="border-b border-zinc-100 dark:border-zinc-900">
                        <td className="py-3 font-mono text-zinc-900 dark:text-white">{token.symbol || token.name}</td>
                        <td className="py-3 text-right font-mono text-zinc-600 dark:text-zinc-400">{formatNumber(token.balance)}</td>
                        <td className="py-3 text-right font-mono text-zinc-500 hidden md:table-cell">{formatSats(token.avgCost)}</td>
                        <td className="py-3 text-right font-mono text-zinc-900 dark:text-white">{formatSats(token.value)}</td>
                        <td className={`py-3 text-right font-mono hidden md:table-cell ${token.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {token.pnl >= 0 ? '+' : ''}{formatSats(token.pnl)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-zinc-500 text-sm mb-4">No marketplace tokens held.</p>
                <Link
                  href="/exchange"
                  className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  Visit Exchange &rarr;
                </Link>
              </div>
            )}
          </motion.div>

          {/* Staking */}
          {holding && (holding.stakedBalance > 0 || holding.pendingDividends > 0) && (
            <motion.div className="border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-950 mb-6" variants={fadeIn}>
              <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-3">Staking</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-purple-500/10 border border-purple-500/30">
                  <div className="text-[9px] text-purple-400 uppercase tracking-widest mb-1">Staked</div>
                  <div className="text-xl font-mono font-bold text-purple-400">{formatNumber(holding.stakedBalance)}</div>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/30">
                  <div className="text-[9px] text-green-400 uppercase tracking-widest mb-1">Pending Dividends</div>
                  <div className="text-xl font-mono font-bold text-green-400">{formatNumber(holding.pendingDividends)}</div>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/30">
                  <div className="text-[9px] text-blue-400 uppercase tracking-widest mb-1">Total Earned</div>
                  <div className="text-xl font-mono font-bold text-blue-400">{formatNumber(holding.totalDividendsEarned)}</div>
                </div>
              </div>
              {holding.pendingDividends > 0 && (
                <div className="mt-4">
                  <button
                    onClick={claimDividends}
                    disabled={claiming}
                    className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
                  >
                    {claiming ? 'Claiming...' : 'Claim Dividends'}
                  </button>
                  {claimResult && (
                    <span className="ml-3 text-xs font-mono text-green-600 dark:text-green-400">{claimResult}</span>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Withdrawal */}
          {derivedAddress && holding && holding.availableBalance > 0 && (
            <motion.div className="border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-950 mb-6" variants={fadeIn}>
              <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-3">Withdraw to On-Chain</div>
              <p className="text-zinc-500 text-sm mb-4">
                Transfer tokens from your database balance to your derived on-chain address.
              </p>

              <div className="flex gap-3 items-end mb-3">
                <div className="flex-1">
                  <label className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest block mb-1">Amount</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`Max: ${holding.availableBalance.toLocaleString()}`}
                    className="w-full px-4 py-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-mono text-sm focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                  />
                </div>
                <button
                  onClick={() => setWithdrawAmount(holding.availableBalance.toString())}
                  className="px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                >
                  Max
                </button>
                <button
                  onClick={withdrawToMyAddress}
                  disabled={withdrawing || !withdrawAmount}
                  className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
                >
                  {withdrawing ? 'Signing...' : 'Withdraw'}
                </button>
              </div>

              <div className="text-[10px] text-zinc-500 font-mono">
                Destination: {derivedAddress.address}
              </div>

              {withdrawError && (
                <div className="mt-3 text-xs font-mono text-red-500 bg-red-500/10 border border-red-500/20 p-2">{withdrawError}</div>
              )}

              {withdrawResult && (
                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30">
                  <span className="text-green-600 dark:text-green-400 text-sm">
                    Withdrew {withdrawResult.amount.toLocaleString()} $PATH402
                  </span>
                  <a
                    href={`https://whatsonchain.com/tx/${withdrawResult.txId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 text-blue-500 hover:underline text-xs"
                  >
                    View TX
                  </a>
                </div>
              )}
            </motion.div>
          )}

          {/* Market Stats */}
          {stats && (
            <motion.div className="border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-950" variants={fadeIn}>
              <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-3">Market</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1">Circulating Supply</div>
                  <div className="text-xl font-mono font-bold text-zinc-900 dark:text-white">{formatNumber(stats.totalCirculating)}</div>
                </div>
                <div>
                  <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1">Current Price</div>
                  <div className="text-xl font-mono font-bold text-zinc-900 dark:text-white">{formatSats(stats.currentPrice)}</div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
