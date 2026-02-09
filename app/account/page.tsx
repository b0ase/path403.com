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
    transition: { staggerChildren: 0.1 }
  }
};

interface Holding {
  balance: number;
  onChainBalance: number;
  dbBalance: number;
  ordinalsAddress: string | null;
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
  tier: number;
}

interface ExportedWallet {
  wif: string;
  address: string;
}

export default function AccountPage() {
  const { wallet, disconnect } = useWallet();
  const [holding, setHolding] = useState<Holding | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [derivedAddress, setDerivedAddress] = useState<DerivedAddress | null>(null);
  const [deriving, setDeriving] = useState(false);
  const [deriveError, setDeriveError] = useState<string | null>(null);
  const [newlyDerivedWif, setNewlyDerivedWif] = useState<string | null>(null); // WIF shown on first derivation
  const [exporting, setExporting] = useState(false);
  const [exportedWallet, setExportedWallet] = useState<ExportedWallet | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawResult, setWithdrawResult] = useState<{ txId: string; amount: number } | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  useEffect(() => {
    if (wallet.connected) {
      fetchAccountData();
      // Check if user already has a derived wallet
      if (wallet.handle && wallet.provider === 'handcash') {
        checkExistingWallet();
      }
    } else {
      setLoading(false);
    }
  }, [wallet.connected, wallet.handle, wallet.address]);

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
        setDerivedAddress({
          address: data.existingAddress,
          tier: 1,
        });
      }
    } catch (error) {
      console.error('Failed to check existing wallet:', error);
    }
  };

  const fetchAccountData = async () => {
    try {
      const [holdingRes, statsRes] = await Promise.all([
        fetch('/api/token/holding'),
        fetch('/api/token/stats'),
      ]);

      if (holdingRes.ok) {
        const holdingData = await holdingRes.json();
        setHolding(holdingData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to fetch account data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (n: number | undefined | null) => (n ?? 0).toLocaleString();
  const formatSats = (sats: number | undefined | null) => {
    const val = sats ?? 0;
    if (val >= 100000000) {
      return `${(val / 100000000).toFixed(4)} BSV`;
    }
    return `${formatNumber(val)} sats`;
  };

  const deriveAddress = async () => {
    if (!wallet.handle || wallet.provider !== 'handcash') {
      setDeriveError('HandCash connection required');
      return;
    }

    setDeriving(true);
    setDeriveError(null);
    setNewlyDerivedWif(null);
    setExportedWallet(null);

    try {
      // Step 1: Get the message to sign
      const messageRes = await fetch('/api/account/derive', {
        headers: {
          'x-wallet-handle': wallet.handle,
          'x-wallet-provider': 'handcash',
        },
      });
      const { message, hasExistingWallet, existingAddress } = await messageRes.json();

      // If wallet already exists, just show it
      if (hasExistingWallet && existingAddress) {
        setDerivedAddress({
          address: existingAddress,
          tier: 1,
        });
        setDeriving(false);
        return;
      }

      // Step 2: Sign the message via HandCash
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

      // Step 3: DERIVE WALLET CLIENT-SIDE - WIF never leaves browser unencrypted
      const clientWallet = await deriveWalletClientSide(signature, wallet.handle);

      // Step 4: Send ONLY address, publicKey, encryptedWif, salt to server (NO WIF!)
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
          // NOTE: WIF is NOT sent to server!
        }),
      });

      if (!storeRes.ok) {
        const err = await storeRes.json();
        throw new Error(err.error || 'Failed to store wallet');
      }

      // Show the WIF to user (only time they'll see it unless they export)
      setNewlyDerivedWif(clientWallet.wif);

      setDerivedAddress({
        address: clientWallet.address,
        publicKey: clientWallet.publicKey,
        tier: 1,
      });
    } catch (error) {
      console.error('Failed to derive address:', error);
      setDeriveError(error instanceof Error ? error.message : 'Failed to derive address');
    } finally {
      setDeriving(false);
    }
  };

  const exportPrivateKey = async () => {
    if (!wallet.handle || wallet.provider !== 'handcash') {
      setExportError('HandCash connection required');
      return;
    }

    setExporting(true);
    setExportError(null);
    setExportedWallet(null);

    try {
      // Get encrypted wallet data from server (server never decrypts)
      const walletRes = await fetch('/api/wallet/encrypted', {
        headers: {
          'x-wallet-handle': wallet.handle,
          'x-wallet-provider': 'handcash',
        },
      });

      if (!walletRes.ok) {
        const err = await walletRes.json();
        throw new Error(err.error || 'Failed to get wallet data');
      }

      const { encryptedWif, encryptionSalt, address } = await walletRes.json();

      // DECRYPT CLIENT-SIDE - server never sees the WIF
      const wif = await decryptWifClientSide(encryptedWif, wallet.handle, encryptionSalt);

      setExportedWallet({
        wif,
        address,
      });
    } catch (error) {
      console.error('Failed to export private key:', error);
      setExportError(error instanceof Error ? error.message : 'Failed to export private key');
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

      // Step 1: Get the message to sign
      const messageRes = await fetch('/api/token/withdraw', {
        headers: {
          'x-wallet-handle': wallet.handle,
          'x-wallet-provider': 'handcash',
        },
      });

      if (!messageRes.ok) {
        const err = await messageRes.json();
        throw new Error(err.error || 'Failed to get withdraw info');
      }

      // Step 2: Sign the withdrawal message
      const withdrawMessage = `Withdraw ${amount.toLocaleString()} $PATH402 to ${destination}. Timestamp: ${timestamp}`;
      const signRes = await fetch('/api/auth/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: withdrawMessage }),
      });

      if (!signRes.ok) {
        const err = await signRes.json();
        throw new Error(err.error || 'Failed to sign message');
      }

      const { signature } = await signRes.json();

      // Step 3: Execute withdrawal
      const withdrawRes = await fetch('/api/token/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-handle': wallet.handle,
          'x-wallet-provider': 'handcash',
        },
        body: JSON.stringify({
          amount,
          destination,
          signature,
          timestamp,
        }),
      });

      if (!withdrawRes.ok) {
        const err = await withdrawRes.json();
        throw new Error(err.error || 'Withdrawal failed');
      }

      const result = await withdrawRes.json();
      setWithdrawResult({
        txId: result.txId,
        amount: result.amount,
      });
      setWithdrawAmount('');
      // Refresh account data
      fetchAccountData();
    } catch (error) {
      console.error('Withdrawal failed:', error);
      setWithdrawError(error instanceof Error ? error.message : 'Withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-white dark:bg-black pt-20">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <motion.div
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-900 dark:text-white mb-6">Account</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8">Connect your wallet to view your account.</p>
            <p className="text-zinc-500 text-sm">
              Click "Connect Wallet" in the navbar to get started.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-20">
      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn}>
            <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-900 dark:text-white text-sm mb-4 inline-block">
              ← Back to Home
            </Link>
          </motion.div>
          <motion.h1
            className="text-5xl font-bold text-zinc-900 dark:text-white mb-4"
            variants={fadeIn}
          >
            Account
          </motion.h1>
          <motion.p
            className="text-zinc-400"
            variants={fadeIn}
          >
            Manage your $PATH402 holdings and wallet
          </motion.p>
        </motion.div>

        {/* Wallet Info */}
        <motion.div
          className="border border-zinc-200 dark:border-zinc-800 p-6 mb-8 bg-zinc-50 dark:bg-zinc-950 "
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ borderColor: "rgba(96, 165, 250, 0.5)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-zinc-400 mb-1">Connected Wallet</div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-green-500 dark:bg-green-400 -full" />
                <span className="text-xl font-bold text-zinc-900 dark:text-white">
                  {wallet.handle ? `@${wallet.handle}` : wallet.address?.slice(0, 12) + '...'}
                </span>
                <span className="text-zinc-500 text-sm capitalize px-2 py-1 bg-gray-100 dark:bg-gray-800 ">
                  {wallet.provider}
                </span>
              </div>
            </div>
            <motion.button
              onClick={disconnect}
              className="px-4 py-2 border border-red-500/50 text-red-600 dark:text-red-400 text-sm hover:bg-red-500/10 transition-colors "
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Disconnect
            </motion.button>
          </div>
        </motion.div>

        {/* On-Chain Address */}
        <motion.div
          className="border border-zinc-200 dark:border-zinc-800 p-6 mb-8 bg-zinc-50 dark:bg-zinc-950 "
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          whileHover={{ borderColor: "rgba(96, 165, 250, 0.5)" }}
        >
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">On-Chain Address</h2>

          {derivedAddress ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 ">
                <div className="text-green-400 text-sm mb-1">Your $PATH402 Address</div>
                <div className="font-mono text-zinc-900 dark:text-white break-all">{derivedAddress.address}</div>
                <p className="text-zinc-500 text-xs mt-2">
                  You control this address. Tokens sent here are yours.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(derivedAddress.address)}
                  className="px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-gray-500 transition-colors"
                >
                  Copy Address
                </button>
                <a
                  href={`https://whatsonchain.com/address/${derivedAddress.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-gray-500 transition-colors"
                >
                  View on Explorer
                </a>
                <button
                  onClick={exportPrivateKey}
                  disabled={exporting}
                  className="px-4 py-2 text-sm border border-yellow-500/50 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/10 disabled:opacity-50 transition-colors"
                >
                  {exporting ? 'Signing...' : 'Export Private Key'}
                </button>
              </div>

              {exportError && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm">
                  {exportError}
                </div>
              )}

              {/* Show WIF immediately after derivation - generated client-side, never sent to server */}
              {newlyDerivedWif && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30">
                  <div className="text-green-600 dark:text-green-400 text-sm font-medium mb-2">
                    🔐 Your Private Key (Generated in your browser - SAVE IT NOW!)
                  </div>
                  <div className="p-3 bg-zinc-200 dark:bg-zinc-900 font-mono text-xs break-all text-zinc-900 dark:text-white select-all">
                    {newlyDerivedWif}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => navigator.clipboard.writeText(newlyDerivedWif)}
                      className="px-3 py-1.5 text-xs border border-green-500/50 text-green-600 dark:text-green-400 hover:bg-green-500/10 transition-colors"
                    >
                      Copy WIF
                    </button>
                    <button
                      onClick={() => {
                        const walletData = {
                          site: 'path402.com',
                          wallet: 'PATH402 Token Wallet',
                          handle: wallet.handle,
                          address: derivedAddress?.address,
                          wif: newlyDerivedWif,
                          network: 'mainnet',
                          exportedAt: new Date().toISOString(),
                          security: 'This key was generated in your browser. The server never saw it.',
                        };
                        const blob = new Blob([JSON.stringify(walletData, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `path402-wallet-${wallet.handle}-${new Date().toISOString().split('T')[0]}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="px-3 py-1.5 text-xs border border-green-500/50 text-green-600 dark:text-green-400 hover:bg-green-500/10 transition-colors"
                    >
                      Download JSON
                    </button>
                    <button
                      onClick={() => setNewlyDerivedWif(null)}
                      className="px-3 py-1.5 text-xs border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      I've Saved It
                    </button>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-3">
                    ✓ Your private key was generated entirely in your browser. It was NEVER sent to our servers.
                  </p>
                </div>
              )}

              {exportedWallet && !newlyDerivedWif && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30">
                  <div className="text-yellow-600 dark:text-yellow-400 text-sm font-medium mb-2">
                    ⚠️ Private Key (WIF) - Keep this secret!
                  </div>
                  <div className="p-3 bg-zinc-200 dark:bg-zinc-900 font-mono text-xs break-all text-zinc-900 dark:text-white select-all">
                    {exportedWallet.wif}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(exportedWallet.wif);
                      }}
                      className="px-3 py-1.5 text-xs border border-yellow-500/50 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/10 transition-colors"
                    >
                      Copy WIF
                    </button>
                    <button
                      onClick={() => {
                        const walletData = {
                          site: 'path402.com',
                          wallet: 'PATH402 Token Wallet',
                          handle: wallet.handle,
                          address: exportedWallet.address,
                          wif: exportedWallet.wif,
                          network: 'mainnet',
                          exportedAt: new Date().toISOString(),
                          warning: 'Keep this file secure! Anyone with this WIF can spend your tokens.',
                        };
                        const blob = new Blob([JSON.stringify(walletData, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `path402-wallet-${wallet.handle}-${new Date().toISOString().split('T')[0]}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="px-3 py-1.5 text-xs border border-green-500/50 text-green-600 dark:text-green-400 hover:bg-green-500/10 transition-colors"
                    >
                      Download JSON
                    </button>
                    <button
                      onClick={() => setExportedWallet(null)}
                      className="px-3 py-1.5 text-xs border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Hide
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 mt-3">
                    Import this WIF into any BSV wallet (ElectrumSV, Simply Cash, etc.) to control your tokens directly.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-zinc-400 text-sm">
                Derive your unique on-chain address from your HandCash signature.
                This address is controlled by YOU - path402.com never has your keys.
              </p>

              {deriveError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm ">
                  {deriveError}
                </div>
              )}

              {wallet.provider === 'handcash' ? (
                <motion.button
                  onClick={deriveAddress}
                  disabled={deriving}
                  className="px-6 py-3 bg-white text-black font-medium hover:bg-zinc-200 disabled:opacity-50 transition-colors "
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {deriving ? 'Signing...' : 'Derive My Address'}
                </motion.button>
              ) : (
                <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                  Connect with HandCash to derive your on-chain address.
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Account Tier */}
        <motion.div
          className="border border-zinc-200 dark:border-zinc-800 p-6 mb-8 bg-zinc-50 dark:bg-zinc-950 "
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileHover={{ borderColor: "rgba(96, 165, 250, 0.5)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Account Tier</h2>
            <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-400 text-sm font-medium ">
              Tier 1: Holder
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tier 1 - Current */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 ">
              <div className="text-blue-400 font-medium mb-2">Tier 1: Token Holder</div>
              <ul className="text-sm text-zinc-400 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Receive tokens
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Hold & transfer (your keys)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> View on registry
                </li>
              </ul>
            </div>

            {/* Tier 2 - Active */}
            <div className="p-4 bg-purple-500/10 border border-purple-500/30">
              <div className="text-purple-400 font-medium mb-2">
                Tier 2: Network Partner (Indexer)
                <span className="ml-2 text-xs bg-purple-500/20 px-2 py-0.5">ACTIVE</span>
              </div>
              <ul className="text-sm text-zinc-400 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">→</span> Run an Indexer Node
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">→</span> Earn 5% of Path Revenue
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">→</span> BRC-24 Lookup Rewards
                </li>
              </ul>
            </div>
          </div>

          <p className="text-zinc-500 text-xs mt-4">
            Tier 2 staking with dividends and governance will require KYC verification.
          </p>
        </motion.div>

        {/* Holdings */}
        <motion.div
          className="border border-zinc-200 dark:border-zinc-800 p-6 mb-8 bg-zinc-50 dark:bg-zinc-950 "
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ borderColor: "rgba(96, 165, 250, 0.5)" }}
        >
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">$PATH402 Holdings</h2>

          {loading ? (
            <div className="text-zinc-400">Loading...</div>
          ) : holding && holding.balance > 0 ? (
            <div className="space-y-6">
              {/* Total Balance - Big Number */}
              <div className="text-center py-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="text-sm text-zinc-400 mb-1">Total Balance</div>
                <div className="text-4xl font-bold text-zinc-900 dark:text-white">
                  {formatNumber(holding.balance)}
                </div>
                <div className="text-sm text-zinc-500">$PATH402</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* On-Chain Balance */}
                <div className="p-4 bg-green-500/10 border border-green-500/30">
                  <div className="text-sm text-green-400 mb-1">On-Chain (You Control)</div>
                  <div className="text-2xl font-bold text-green-400">
                    {formatNumber(holding.onChainBalance)}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    At your derived address
                  </div>
                </div>

                {/* Database Balance - Pending Withdrawal */}
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30">
                  <div className="text-sm text-yellow-400 mb-1">Pending Withdrawal</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {formatNumber(holding.dbBalance)}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {holding.dbBalance > 0 ? 'Use Withdraw below to claim' : 'All tokens on-chain'}
                  </div>
                </div>
              </div>

              {holding.stakedBalance > 0 && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30">
                  <div className="text-sm text-purple-400 mb-1">Staked</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {formatNumber(holding.stakedBalance)}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">earning dividends</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-zinc-400 mb-4">You don't hold any $PATH402 tokens yet.</div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/token"
                  className="inline-block px-6 py-3 bg-white text-black font-medium hover:bg-zinc-200 transition-colors "
                >
                  Buy Tokens
                </Link>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Withdraw to On-Chain Address */}
        {derivedAddress && holding && holding.availableBalance > 0 && (
          <motion.div
            className="border border-zinc-200 dark:border-zinc-800 p-6 mb-8 bg-zinc-50 dark:bg-zinc-950"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            whileHover={{ borderColor: "rgba(96, 165, 250, 0.5)" }}
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Withdraw to On-Chain</h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
              Transfer tokens from your database balance to your derived on-chain address.
              Once on-chain, you control them with your private key.
            </p>

            <div className="flex gap-3 items-end mb-4">
              <div className="flex-1">
                <label className="text-sm text-zinc-500 mb-1 block">Amount</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={`Max: ${holding.availableBalance.toLocaleString()}`}
                  className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => setWithdrawAmount(holding.availableBalance.toString())}
                className="px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                Max
              </button>
              <button
                onClick={withdrawToMyAddress}
                disabled={withdrawing || !withdrawAmount}
                className="px-6 py-2 bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {withdrawing ? 'Signing...' : 'Withdraw'}
              </button>
            </div>

            <div className="text-xs text-zinc-500">
              Destination: <code className="bg-zinc-200 dark:bg-zinc-800 px-1">{derivedAddress.address}</code>
            </div>

            {withdrawError && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm">
                {withdrawError}
              </div>
            )}

            {withdrawResult && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30">
                <div className="text-green-600 dark:text-green-400 font-medium mb-2">
                  Withdrawal successful!
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  {withdrawResult.amount.toLocaleString()} $PATH402 sent to your on-chain address.
                </div>
                <a
                  href={`https://whatsonchain.com/tx/${withdrawResult.txId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline text-sm"
                >
                  View Transaction →
                </a>
              </div>
            )}
          </motion.div>
        )}

        {/* Market Stats */}
        {stats && (
          <motion.div
            className="border border-zinc-200 dark:border-zinc-800 p-6 mb-8 bg-zinc-50 dark:bg-zinc-950"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ borderColor: "rgba(96, 165, 250, 0.5)" }}
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Market Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-zinc-400 mb-1">Circulating Supply</div>
                <div className="text-xl font-bold text-zinc-900 dark:text-white">
                  {formatNumber(stats.totalCirculating)}
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-400 mb-1">Current Price</div>
                <div className="text-xl font-bold text-zinc-900 dark:text-white">
                  {formatSats(stats.currentPrice)}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          className="flex flex-wrap gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/token"
              className="inline-block px-6 py-3 bg-white text-black font-medium hover:bg-zinc-200 transition-colors "
            >
              Buy More Tokens
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/registry"
              className="inline-block px-6 py-3 border border-gray-300 dark:border-gray-600 text-zinc-900 dark:text-white hover:border-gray-500 dark:hover:border-white transition-colors "
            >
              View Registry
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
