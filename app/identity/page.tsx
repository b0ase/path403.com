'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { formatSupply } from '@/lib/token';

interface IdentityToken {
  id: string;
  holder_id: string;
  symbol: string;
  token_id: string;
  issuer_address: string;
  total_supply: string;
  decimals: number;
  access_rate: number;
  inscription_data: Record<string, unknown> | null;
  broadcast_txid: string | null;
  broadcast_status: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    local: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
    pending: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
    confirmed: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30',
  };
  return (
    <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border ${colors[status] || 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 border-zinc-300 dark:border-zinc-700'}`}>
      {status}
    </span>
  );
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

function PreMintView({ onMint, isMinting, mintError }: {
  onMint: (symbol: string) => void;
  isMinting: boolean;
  mintError: string | null;
}) {
  const [symbolInput, setSymbolInput] = useState('');

  const rawName = symbolInput.replace(/^\$/, '').toUpperCase();
  const preview = rawName ? `$${rawName}` : '';
  const isValid = rawName.length >= 1 && rawName.length <= 20 && /^[A-Z0-9_]+$/.test(rawName);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col justify-between min-h-[400px]">
        <div>
          <h3 className="text-xl font-mono font-bold text-zinc-900 dark:text-white uppercase tracking-tight mb-1">
            Mint Digital DNA
          </h3>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-6">
            Resolve 401 — deploy your identity token on BSV
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest block mb-2">
                Symbol
              </label>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-mono font-bold text-zinc-400 dark:text-zinc-600">$</span>
                <input
                  type="text"
                  value={symbolInput}
                  onChange={(e) => setSymbolInput(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 20))}
                  placeholder="YOURNAME"
                  className="flex-1 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 px-4 py-3 font-mono text-xl text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                  disabled={isMinting}
                />
              </div>
              {preview && (
                <div className="mt-2 text-sm font-mono text-indigo-600 dark:text-indigo-400">
                  {preview}
                </div>
              )}
              {symbolInput && !isValid && (
                <div className="mt-2 text-xs font-mono text-red-500">
                  A-Z, 0-9, _ only. 1-20 characters.
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3">
                <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1">Supply</div>
                <div className="text-sm text-zinc-900 dark:text-white font-mono font-bold">1,000,000,000</div>
              </div>
              <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3">
                <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1">Decimals</div>
                <div className="text-sm text-zinc-900 dark:text-white font-mono font-bold">8</div>
              </div>
              <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-3">
                <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1">Rate</div>
                <div className="text-sm text-zinc-900 dark:text-white font-mono font-bold">1 tok/sec</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {mintError && (
            <div className="mb-3 text-xs font-mono text-red-500 bg-red-500/10 border border-red-500/20 p-2">
              {mintError}
            </div>
          )}
          <button
            onClick={() => onMint(preview)}
            disabled={!isValid || isMinting}
            className={`w-full py-4 font-mono font-bold uppercase text-sm tracking-widest transition-all ${
              !isValid || isMinting
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                : 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-200'
            }`}
          >
            {isMinting ? 'Inscribing Genesis...' : 'Mint Digital DNA'}
          </button>
          <p className="text-center text-[9px] text-zinc-400 dark:text-zinc-600 mt-3 font-mono uppercase tracking-widest">
            BSV21 inscription stored in Supabase &middot; broadcast when wallet ready
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-900 p-6 flex items-start gap-4">
          <div className="w-5 h-5 mt-1 shrink-0 text-yellow-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div>
            <h4 className="text-zinc-900 dark:text-white font-mono font-bold uppercase mb-2">Video P2P Fuel</h4>
            <p className="text-zinc-500 text-xs font-mono leading-relaxed">
              Tokens stream second-by-second during video calls.
              Both peers exchange tokens — 1 token/sec each direction.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-900 p-6 flex items-start gap-4">
          <div className="w-5 h-5 mt-1 shrink-0 text-zinc-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          </div>
          <div>
            <h4 className="text-zinc-900 dark:text-white font-mono font-bold uppercase mb-2">Access Control</h4>
            <p className="text-zinc-500 text-xs font-mono leading-relaxed">
              Set minimum token balance for peers to contact you.
              Raise your price to avoid spam.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-900 p-6 flex items-start gap-4">
          <div className="w-5 h-5 mt-1 shrink-0 text-zinc-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
          </div>
          <div>
            <h4 className="text-zinc-900 dark:text-white font-mono font-bold uppercase mb-2">Cloud Custody</h4>
            <p className="text-zinc-500 text-xs font-mono leading-relaxed">
              Identity token stored in Supabase.
              Broadcast to BSV when your wallet is ready.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostMintView({ identity }: { identity: IdentityToken }) {
  return (
    <div className="mt-8 space-y-6">
      {/* Identity Header */}
      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-mono font-bold text-zinc-900 dark:text-white">{identity.symbol}</h2>
              <StatusBadge status={identity.broadcast_status} />
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
              <span>Token ID: {identity.token_id.slice(0, 16)}...{identity.token_id.slice(-8)}</span>
              <CopyButton text={identity.token_id} />
            </div>
            {identity.issuer_address && (
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 dark:text-zinc-600 mt-1">
                <span>Issuer: {identity.issuer_address.slice(0, 20)}...</span>
                <CopyButton text={identity.issuer_address} />
              </div>
            )}
          </div>

          <div className="text-right">
            <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1">Total Supply</div>
            <div className="text-2xl font-mono font-bold text-zinc-900 dark:text-white">
              {formatSupply(identity.total_supply, identity.decimals)}
            </div>
            <div className="text-[10px] font-mono text-zinc-500">
              {identity.decimals} decimals &middot; {identity.access_rate} tok/sec
            </div>
          </div>
        </div>
      </div>

      {/* Info Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-900 p-4">
          <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1">Balance</div>
          <div className="text-xl font-mono font-bold text-zinc-900 dark:text-white">
            {formatSupply(identity.total_supply, identity.decimals)}
          </div>
        </div>
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-900 p-4">
          <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1">Broadcast</div>
          <div className="text-sm font-mono text-zinc-900 dark:text-white mt-1">
            {identity.broadcast_txid ? (
              <span className="flex items-center gap-2">
                {identity.broadcast_txid.slice(0, 16)}...
                <CopyButton text={identity.broadcast_txid} />
              </span>
            ) : (
              <span className="text-zinc-400 dark:text-zinc-600">Not broadcast yet</span>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-900 p-4">
          <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1">Created</div>
          <div className="text-sm font-mono text-zinc-900 dark:text-white mt-1">
            {new Date(identity.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Inscription Data */}
      {identity.inscription_data && (
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-900 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">BSV21 Inscription</div>
            <CopyButton text={JSON.stringify(identity.inscription_data, null, 2)} />
          </div>
          <pre className="text-xs font-mono text-zinc-500 overflow-x-auto whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
            {JSON.stringify(identity.inscription_data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function IdentityPage() {
  const { wallet, connectHandCash } = useWallet();
  const [identity, setIdentity] = useState<IdentityToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);

  const fetchIdentity = useCallback(async () => {
    try {
      const res = await fetch('/api/client/identity');
      const data = await res.json();
      setIdentity(data.identity);
    } catch {
      // Identity not found
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (wallet.connected) {
      fetchIdentity();
    } else {
      setLoading(false);
    }
  }, [wallet.connected, fetchIdentity]);

  const handleMint = async (symbol: string) => {
    setIsMinting(true);
    setMintError(null);
    try {
      const res = await fetch('/api/client/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMintError(data.error || 'Mint failed');
        return;
      }
      setIdentity(data.identity);
    } catch {
      setMintError('Network error');
    } finally {
      setIsMinting(false);
    }
  };

  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-white dark:bg-black pt-20 px-6 md:px-16">
        <div className="max-w-[1920px] mx-auto text-center">
          <h1 className="text-2xl font-mono font-bold text-zinc-900 dark:text-white uppercase tracking-tight mb-4">
            Digital DNA
          </h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500 mb-6">
            HTTP_401: UNAUTHORIZED
          </div>
          <p className="text-zinc-500 text-sm mb-8">
            Connect your wallet to prove your identity.
          </p>
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
          <div className="text-zinc-500 text-sm font-mono animate-pulse">Loading identity...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-20 px-6 md:px-16 pb-20">
      <div className="max-w-[1920px] mx-auto">
        <div className="mb-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500 mb-4">
            HTTP_401: IDENTITY_REQUIRED
          </div>
          <div className="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1">
            Identity Token // Self-Sovereign Issuance
          </div>
          <h1 className="text-3xl font-mono font-bold text-zinc-900 dark:text-white uppercase tracking-tight">
            DIGITAL DNA<span className="text-zinc-300 dark:text-zinc-700">.ID</span>
          </h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-2">
            1B SUPPLY // 8 DECIMALS // 1 TOK/SEC // BSV21
          </p>
        </div>

        {identity ? (
          <PostMintView identity={identity} />
        ) : (
          <PreMintView onMint={handleMint} isMinting={isMinting} mintError={mintError} />
        )}
      </div>
    </div>
  );
}
