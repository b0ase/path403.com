'use client';

import React, { useState, useEffect } from 'react';
import { FiUsers, FiAward, FiDollarSign, FiPieChart, FiExternalLink, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUserHandle } from '@/hooks/useUserHandle';

interface RegistryEntry {
  member: string;
  token: string;
  tokenName: string;
  position: number | null;
  quantity: number;
  acquiredAt: string;
  dividendsReceived: number;
  servingRevenue: number;
  rights: {
    dividends: boolean;
    voting: boolean;
  };
}

interface RegistrySummary {
  totalEntries: number;
  uniqueMembers: number;
  uniqueTokens: number;
  totalDividendsPaid: number;
}

export default function RegistryPage() {
  const { handle: userHandle } = useUserHandle();
  const [registry, setRegistry] = useState<RegistryEntry[]>([]);
  const [summary, setSummary] = useState<RegistrySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterToken, setFilterToken] = useState<string>('');
  const [tokens, setTokens] = useState<{ dollar_address: string; title: string }[]>([]);

  useEffect(() => {
    fetchRegistry();
    fetchTokens();
  }, [filterToken]);

  const fetchRegistry = async () => {
    setLoading(true);
    try {
      const url = filterToken
        ? `/api/path402/registry?token=${filterToken}`
        : '/api/path402/registry';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setRegistry(data.registry || []);
        setSummary(data.summary || null);
      }
    } catch (err) {
      console.error('Failed to fetch registry:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTokens = async () => {
    try {
      const res = await fetch('/api/path402/tokens');
      const data = await res.json();
      if (data.success && Array.isArray(data.tokens)) {
        // Only show equity-class tokens (dividends or voting)
        const equityTokens = data.tokens.filter(
          (t: any) => t.confers_dividends || t.confers_voting
        );
        setTokens(equityTokens.map((t: any) => ({
          dollar_address: t.token_id,
          title: t.name,
        })));
      }
    } catch (err) {
      console.error('Failed to fetch tokens:', err);
    }
  };

  const formatSats = (sats: number) => {
    if (sats >= 100000000) {
      return `${(sats / 100000000).toFixed(2)} BSV`;
    }
    return `${sats.toLocaleString()} sats`;
  };

  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="px-4 md:px-8 py-16">
        {/* Header */}
        <motion.div
          className="mb-12 border-b border-gray-800 pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
            <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800 self-start">
              <FiUsers className="text-4xl md:text-6xl text-white" />
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                REGISTRY
              </h1>
              <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                CAP_TABLE
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-gray-400 max-w-2xl">
              Public registry of all registered token holders. KYC-verified members eligible
              for dividends and voting rights.
            </p>
            <Link
              href="/exchange/register"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold hover:bg-green-500 transition-colors whitespace-nowrap"
            >
              <FiCheckCircle size={14} />
              Register Holdings
            </Link>
          </div>
        </motion.div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 border border-white/10 rounded-lg bg-gray-900/30">
              <div className="text-xs text-gray-500 uppercase mb-1">Registered Entries</div>
              <div className="text-2xl font-bold font-mono">{summary.totalEntries}</div>
            </div>
            <div className="p-4 border border-white/10 rounded-lg bg-gray-900/30">
              <div className="text-xs text-gray-500 uppercase mb-1">Unique Members</div>
              <div className="text-2xl font-bold font-mono">{summary.uniqueMembers}</div>
            </div>
            <div className="p-4 border border-white/10 rounded-lg bg-gray-900/30">
              <div className="text-xs text-gray-500 uppercase mb-1">Equity Tokens</div>
              <div className="text-2xl font-bold font-mono">{summary.uniqueTokens}</div>
            </div>
            <div className="p-4 border border-white/10 rounded-lg bg-gray-900/30">
              <div className="text-xs text-gray-500 uppercase mb-1">Dividends Paid</div>
              <div className="text-2xl font-bold font-mono text-green-400">
                {formatSats(summary.totalDividendsPaid)}
              </div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="mb-6 flex items-center gap-4">
          <label className="text-gray-500 text-sm">Filter by Token:</label>
          <select
            value={filterToken}
            onChange={(e) => setFilterToken(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:border-gray-600"
          >
            <option value="">All Equity Tokens</option>
            {tokens.map((t) => (
              <option key={t.dollar_address} value={t.dollar_address}>
                {t.dollar_address} - {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Registry Table */}
        <div className="border border-white/10 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-900/50 border-b border-white/10 text-xs text-gray-500 uppercase tracking-wider font-bold">
            <div className="col-span-1">#</div>
            <div className="col-span-2">Member</div>
            <div className="col-span-2">Token</div>
            <div className="col-span-2 text-right">Quantity</div>
            <div className="col-span-2 text-right">Dividends</div>
            <div className="col-span-2 text-right">Rights</div>
            <div className="col-span-1 text-right">Since</div>
          </div>

          {/* Body */}
          {loading ? (
            <div className="px-6 py-16 text-center text-gray-500">
              Loading registry...
            </div>
          ) : registry.length === 0 ? (
            <div className="px-6 py-16 text-center text-gray-500">
              <FiUsers className="mx-auto text-4xl text-gray-700 mb-4" />
              <p>No registered holdings found</p>
              <p className="text-sm mt-2">
                Be the first to{' '}
                <Link href="/exchange/register" className="text-green-400 hover:underline">
                  register your holdings
                </Link>
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {registry.map((entry, index) => (
                <div
                  key={`${entry.member}-${entry.token}-${index}`}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-white/5 transition-colors ${
                    entry.member === userHandle ? 'bg-green-900/20' : ''
                  }`}
                >
                  <div className="col-span-1 font-mono text-gray-500">
                    {entry.position || index + 1}
                  </div>
                  <div className="col-span-2">
                    <span className="font-bold">
                      {entry.member === userHandle ? (
                        <span className="text-green-400">{entry.member} (you)</span>
                      ) : (
                        entry.member
                      )}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <div className="font-mono text-yellow-400">{entry.token}</div>
                    <div className="text-xs text-gray-500">{entry.tokenName}</div>
                  </div>
                  <div className="col-span-2 text-right font-mono">
                    {entry.quantity.toLocaleString()}
                  </div>
                  <div className="col-span-2 text-right font-mono text-green-400">
                    {entry.dividendsReceived > 0 ? formatSats(entry.dividendsReceived) : '-'}
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="flex justify-end gap-2">
                      {entry.rights.dividends && (
                        <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                          DIV
                        </span>
                      )}
                      {entry.rights.voting && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                          VOTE
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-1 text-right text-xs text-gray-500">
                    {new Date(entry.acquiredAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 border border-white/10 rounded-xl bg-gray-900/30">
          <h3 className="font-bold text-white mb-4">About the Registry</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-400">
            <div>
              <div className="text-white font-bold mb-2 flex items-center gap-2">
                <FiCheckCircle className="text-green-400" />
                KYC Verification
              </div>
              <p>
                Only KYC-verified holders can register. This ensures compliance and
                enables dividend/voting rights.
              </p>
            </div>
            <div>
              <div className="text-white font-bold mb-2 flex items-center gap-2">
                <FiDollarSign className="text-green-400" />
                Dividend Rights
              </div>
              <p>
                Registered holders of equity tokens receive their share of dividend
                distributions proportional to their holdings.
              </p>
            </div>
            <div>
              <div className="text-white font-bold mb-2 flex items-center gap-2">
                <FiPieChart className="text-blue-400" />
                Voting Rights
              </div>
              <p>
                Registered holders can participate in governance votes. Weight depends
                on token count and vote type.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Exchange */}
        <div className="mt-8 text-center">
          <Link
            href="/exchange"
            className="text-gray-500 hover:text-white transition-colors"
          >
            ← Back to Exchange
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
