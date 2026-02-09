'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWallet } from '@/components/WalletProvider';
import { useTheme } from '@/components/ThemeProvider';
import { decryptWifClientSide } from '@/lib/client-wallet';

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

interface IdentityToken {
  symbol: string;
  token_id: string;
  broadcast_status: string;
  broadcast_txid: string | null;
}

interface DerivedAddress {
  address: string;
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

export default function SettingsPage() {
  const { wallet, disconnect, connectHandCash } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const [identity, setIdentity] = useState<IdentityToken | null>(null);
  const [derivedAddress, setDerivedAddress] = useState<DerivedAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportedWif, setExportedWif] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const [identityRes, walletRes] = await Promise.all([
        fetch('/api/client/identity'),
        wallet.handle && wallet.provider === 'handcash'
          ? fetch('/api/account/derive', {
              headers: {
                'x-wallet-handle': wallet.handle,
                'x-wallet-provider': 'handcash',
              },
            })
          : Promise.resolve(null),
      ]);

      const identityData = await identityRes.json();
      if (identityData.identity) setIdentity(identityData.identity);

      if (walletRes?.ok) {
        const walletData = await walletRes.json();
        if (walletData.hasExistingWallet && walletData.existingAddress) {
          setDerivedAddress({ address: walletData.existingAddress });
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  }, [wallet.handle, wallet.provider]);

  useEffect(() => {
    if (wallet.connected) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [wallet.connected, fetchSettings]);

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

  const setTheme = (t: 'light' | 'dark') => {
    if (theme !== t) toggleTheme();
  };

  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-white dark:bg-black pt-20 px-6 md:px-16">
        <div className="max-w-[1920px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500 mb-6">
            HTTP_200: AUTHENTICATED
          </div>
          <h1 className="text-2xl font-mono font-bold text-zinc-900 dark:text-white uppercase tracking-tight mb-4">
            SETTINGS<span className="text-zinc-300 dark:text-zinc-700">.CFG</span>
          </h1>
          <p className="text-zinc-500 text-sm mb-8">Connect your wallet to access settings.</p>
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
          <div className="text-zinc-500 text-sm font-mono animate-pulse">Loading settings...</div>
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
              HTTP_200: AUTHENTICATED
            </div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1">
              Account Configuration
            </div>
            <h1 className="text-3xl font-mono font-bold text-zinc-900 dark:text-white uppercase tracking-tight">
              SETTINGS<span className="text-zinc-300 dark:text-zinc-700">.CFG</span>
            </h1>
          </motion.div>

          {/* Account Section */}
          <motion.div className="border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-950 mb-6" variants={fadeIn}>
            <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-4">Account</div>
            <div className="flex items-center gap-4 mb-4">
              <span className="w-2 h-2 bg-green-500" />
              <span className="text-xl font-mono font-bold text-zinc-900 dark:text-white">
                {wallet.handle ? `@${wallet.handle}` : wallet.address?.slice(0, 12) + '...'}
              </span>
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-500 capitalize">
                {wallet.provider}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
                <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1">401 Identity</div>
                <div className={`text-sm font-mono font-bold ${identity ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {identity ? identity.symbol : 'NOT MINTED'}
                </div>
              </div>
              <div className="p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
                <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1">402 Payment</div>
                <div className="text-sm font-mono font-bold text-green-600 dark:text-green-400">
                  Connected
                </div>
              </div>
            </div>
          </motion.div>

          {/* Identity Section */}
          <motion.div className="border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-950 mb-6" variants={fadeIn}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Identity Token</div>
              <Link
                href="/identity"
                className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              >
                Manage &rarr;
              </Link>
            </div>

            {identity ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-mono font-bold text-zinc-900 dark:text-white">{identity.symbol}</span>
                  <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border ${
                    identity.broadcast_status === 'confirmed'
                      ? 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30'
                      : identity.broadcast_status === 'pending'
                      ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  }`}>
                    {identity.broadcast_status}
                  </span>
                </div>
                <div className="text-xs font-mono text-zinc-500">
                  Token ID: {identity.token_id.slice(0, 20)}...
                  <CopyButton text={identity.token_id} />
                </div>
                {identity.broadcast_txid && (
                  <div className="text-xs font-mono text-zinc-500">
                    TX: {identity.broadcast_txid.slice(0, 20)}...
                    <CopyButton text={identity.broadcast_txid} />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-zinc-500 text-sm mb-3">No identity token minted yet.</p>
                <Link
                  href="/identity"
                  className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors inline-block"
                >
                  Mint Digital DNA
                </Link>
              </div>
            )}
          </motion.div>

          {/* Wallet Section */}
          <motion.div className="border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-950 mb-6" variants={fadeIn}>
            <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-4">Derived Wallet</div>

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

                {exportedWif && (
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
              <div>
                <p className="text-zinc-500 text-sm mb-3">No derived wallet yet.</p>
                <Link
                  href="/wallet"
                  className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  Derive in Wallet &rarr;
                </Link>
              </div>
            )}
          </motion.div>

          {/* Appearance */}
          <motion.div className="border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-950 mb-6" variants={fadeIn}>
            <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-4">Appearance</div>
            <div className="flex gap-2">
              {(['light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                    theme === t
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-black'
                      : 'border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600'
                  }`}
                >
                  {t === 'light' ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Light
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      Dark
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div className="border border-red-500/30 p-6 bg-zinc-50 dark:bg-zinc-950" variants={fadeIn}>
            <div className="text-[9px] text-red-500 uppercase tracking-widest mb-4">Danger Zone</div>
            <p className="text-zinc-500 text-sm mb-4">
              Disconnecting will clear your session. Your tokens and identity are safe on-chain.
            </p>
            {confirmDisconnect ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    disconnect();
                    setConfirmDisconnect(false);
                  }}
                  className="px-6 py-3 border border-red-500/50 text-red-600 dark:text-red-400 font-bold text-xs uppercase tracking-widest hover:bg-red-500/10 transition-colors"
                >
                  Confirm Disconnect
                </button>
                <button
                  onClick={() => setConfirmDisconnect(false)}
                  className="px-6 py-3 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDisconnect(true)}
                className="px-6 py-3 border border-red-500/50 text-red-600 dark:text-red-400 font-bold text-xs uppercase tracking-widest hover:bg-red-500/10 transition-colors"
              >
                Disconnect Wallet
              </button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
