'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';

interface Shareholder {
  id: string;
  full_name: string;
  token_balance: string;
  ownership_percentage: string;
  kyc_status: string;
  investment_date: string | null;
  accredited_investor: boolean;
  shareholder_type: string;
}

interface CapTableProps {
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

export function CapTable({ limit = 10, showHeader = true, className = '' }: CapTableProps) {
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShareholders() {
      try {
        const res = await fetch(`/api/investors/cap-table?limit=${limit}`);
        if (!res.ok) {
          throw new Error('Failed to fetch cap table');
        }
        const data = await res.json();
        setShareholders(data.shareholders || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cap table');
      } finally {
        setLoading(false);
      }
    }

    fetchShareholders();
  }, [limit]);

  if (loading) {
    return (
      <div className={`border border-zinc-800 p-8 ${className}`}>
        <div className="flex items-center justify-center gap-3 text-zinc-500">
          <FaSpinner className="animate-spin" />
          <span>Loading cap table...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`border border-zinc-800 p-8 ${className}`}>
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  if (shareholders.length === 0) {
    return (
      <div className={`border border-zinc-800 p-8 ${className}`}>
        <div className="text-zinc-500 text-center">No shareholders yet. Be the first investor!</div>
      </div>
    );
  }

  const formatName = (name: string) => {
    // Privacy: Show first name and last initial
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const formatTokens = (balance: string) => {
    const num = parseFloat(balance);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toLocaleString();
  };

  return (
    <div className={`border border-zinc-800 overflow-hidden ${className}`}>
      {showHeader && (
        <div className="bg-zinc-900/50 px-6 py-4 border-b border-zinc-800">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">Cap Table</h3>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
              <th className="text-left px-6 py-3 font-medium">Name</th>
              <th className="text-right px-6 py-3 font-medium">Tokens</th>
              <th className="text-right px-6 py-3 font-medium">%</th>
              <th className="text-center px-6 py-3 font-medium">KYC</th>
              <th className="text-right px-6 py-3 font-medium">Since</th>
            </tr>
          </thead>
          <tbody>
            {shareholders.map((shareholder, index) => (
              <motion.tr
                key={shareholder.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{formatName(shareholder.full_name)}</span>
                    {shareholder.accredited_investor && (
                      <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded uppercase">
                        Accredited
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-zinc-300 font-mono">
                  {formatTokens(shareholder.token_balance)}
                </td>
                <td className="px-6 py-4 text-right text-zinc-400 font-mono">
                  {parseFloat(shareholder.ownership_percentage).toFixed(2)}%
                </td>
                <td className="px-6 py-4 text-center">
                  {shareholder.kyc_status === 'approved' ? (
                    <FaCheckCircle className="text-green-500 inline" />
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right text-zinc-500 text-sm">
                  {formatDate(shareholder.investment_date)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface CapTableStatsProps {
  className?: string;
}

export function CapTableStats({ className = '' }: CapTableStatsProps) {
  const [stats, setStats] = useState({
    totalRaised: 0,
    verifiedInvestors: 0,
    totalSupply: 100000000,
    currentPrice: 0.024,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/investors/cap-table/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

  const statItems = [
    { label: 'Total Raised', value: formatCurrency(stats.totalRaised) },
    { label: 'Verified Investors', value: stats.verifiedInvestors.toString() },
    { label: 'Total Supply', value: `${(stats.totalSupply / 1000000).toFixed(0)}M` },
    { label: 'Current Price', value: `$${stats.currentPrice.toFixed(3)}` },
  ];

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="border border-zinc-800 p-6 bg-zinc-900/30"
        >
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">{item.label}</div>
          <div className="text-2xl font-bold text-white font-mono">
            {loading ? '...' : item.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
