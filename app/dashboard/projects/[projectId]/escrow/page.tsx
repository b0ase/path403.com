'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaWallet,
  FaUsers,
  FaCode,
  FaCheckCircle,
  FaArrowRight,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import {
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiRefreshCw,
} from 'react-icons/fi';

interface EscrowPool {
  projectSlug: string;
  totalInvestedUsd: number;
  availableBalanceUsd: number;
  escrowedInContractsUsd: number;
  paidToDevelopersUsd: number;
  createdAt: string | null;
  updatedAt: string | null;
}

interface Contribution {
  id: string;
  contributorHandcash: string;
  amountUsd: number;
  createdAt: string;
}

interface Allocation {
  id: string;
  contractId: string;
  amountUsd: number;
  createdAt: string;
}

export default function EscrowPoolDashboard() {
  const params = useParams();
  const projectSlug = params.projectId as string;

  const [pool, setPool] = useState<EscrowPool | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoolData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectSlug}/escrow-pool`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch pool data');
      }

      setPool(data.pool);
      setContributions(data.recentContributions || []);
      setAllocations(data.activeAllocations || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectSlug) {
      fetchPoolData();
    }
  }, [projectSlug]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <FiRefreshCw className="animate-spin text-4xl text-cyan-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="border border-red-500/50 bg-red-500/10 p-6 rounded">
            <h2 className="text-red-400 font-bold mb-2">Error</h2>
            <p className="text-zinc-400">{error}</p>
            <button
              onClick={fetchPoolData}
              className="mt-4 px-4 py-2 border border-zinc-700 text-sm hover:border-zinc-500 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const utilizationRate = pool && pool.totalInvestedUsd > 0
    ? ((pool.escrowedInContractsUsd + pool.paidToDevelopersUsd) / pool.totalInvestedUsd) * 100
    : 0;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-900 px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-zinc-500 text-sm mb-4">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/dashboard/projects" className="hover:text-white transition-colors">
              Projects
            </Link>
            <span>/</span>
            <span className="text-white">{projectSlug}</span>
            <span>/</span>
            <span className="text-cyan-400">Escrow Pool</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                Escrow Pool
              </h1>
              <p className="text-zinc-400 mt-1">
                Investor funds available for developer contracts
              </p>
            </div>

            <button
              onClick={fetchPoolData}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors"
            >
              <FiRefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            className="border border-zinc-800 p-6 bg-zinc-900/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-cyan-500/10 border border-cyan-500/30">
                <FiDollarSign className="text-cyan-400" size={20} />
              </div>
              <span className="text-zinc-500 text-sm uppercase tracking-wider">Total Invested</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(pool?.totalInvestedUsd || 0)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">From all investors</p>
          </motion.div>

          <motion.div
            className="border border-zinc-800 p-6 bg-zinc-900/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/10 border border-green-500/30">
                <FaWallet className="text-green-400" size={20} />
              </div>
              <span className="text-zinc-500 text-sm uppercase tracking-wider">Available</span>
            </div>
            <p className="text-3xl font-bold text-green-400">
              {formatCurrency(pool?.availableBalanceUsd || 0)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Ready for contracts</p>
          </motion.div>

          <motion.div
            className="border border-zinc-800 p-6 bg-zinc-900/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-yellow-500/10 border border-yellow-500/30">
                <FiClock className="text-yellow-400" size={20} />
              </div>
              <span className="text-zinc-500 text-sm uppercase tracking-wider">In Escrow</span>
            </div>
            <p className="text-3xl font-bold text-yellow-400">
              {formatCurrency(pool?.escrowedInContractsUsd || 0)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Locked in active contracts</p>
          </motion.div>

          <motion.div
            className="border border-zinc-800 p-6 bg-zinc-900/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500/10 border border-purple-500/30">
                <FaCode className="text-purple-400" size={20} />
              </div>
              <span className="text-zinc-500 text-sm uppercase tracking-wider">Paid Out</span>
            </div>
            <p className="text-3xl font-bold text-purple-400">
              {formatCurrency(pool?.paidToDevelopersUsd || 0)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Released to developers</p>
          </motion.div>
        </div>

        {/* Utilization Bar */}
        <motion.div
          className="border border-zinc-800 p-6 bg-zinc-900/30 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400">Fund Utilization</span>
            <span className="text-white font-bold">{utilizationRate.toFixed(1)}%</span>
          </div>
          <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full flex">
              <motion.div
                className="bg-purple-500 h-full"
                initial={{ width: 0 }}
                animate={{ width: `${(pool?.paidToDevelopersUsd || 0) / (pool?.totalInvestedUsd || 1) * 100}%` }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
              <motion.div
                className="bg-yellow-500 h-full"
                initial={{ width: 0 }}
                animate={{ width: `${(pool?.escrowedInContractsUsd || 0) / (pool?.totalInvestedUsd || 1) * 100}%` }}
                transition={{ delay: 0.6, duration: 0.8 }}
              />
            </div>
          </div>
          <div className="flex items-center gap-6 mt-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded" />
              <span className="text-zinc-400">Paid to developers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded" />
              <span className="text-zinc-400">In active contracts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-zinc-700 rounded" />
              <span className="text-zinc-400">Available</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Contributions */}
          <motion.div
            className="border border-zinc-800 bg-zinc-900/30"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <FaUsers className="text-cyan-400" />
                Recent Contributions
              </h3>
              <span className="text-xs text-zinc-500">{contributions.length} shown</span>
            </div>
            <div className="divide-y divide-zinc-800">
              {contributions.length === 0 ? (
                <div className="p-6 text-center text-zinc-500">
                  No contributions yet
                </div>
              ) : (
                contributions.map((contribution) => (
                  <div key={contribution.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-mono text-cyan-400">${contribution.contributorHandcash}</p>
                      <p className="text-xs text-zinc-500">{formatDate(contribution.createdAt)}</p>
                    </div>
                    <p className="text-green-400 font-bold">
                      +{formatCurrency(contribution.amountUsd)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Active Allocations */}
          <motion.div
            className="border border-zinc-800 bg-zinc-900/30"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <FaCode className="text-purple-400" />
                Active Contracts
              </h3>
              <span className="text-xs text-zinc-500">{allocations.length} active</span>
            </div>
            <div className="divide-y divide-zinc-800">
              {allocations.length === 0 ? (
                <div className="p-6 text-center text-zinc-500">
                  <p className="mb-4">No active contracts</p>
                  <Link
                    href="/developers/contracts"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-cyan-500/50 text-cyan-400 text-sm hover:bg-cyan-500/10 transition-colors"
                  >
                    Browse Developer Services
                    <FaArrowRight size={12} />
                  </Link>
                </div>
              ) : (
                allocations.map((allocation) => (
                  <div key={allocation.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <Link
                        href={`/dashboard/contracts/${allocation.contractId}`}
                        className="font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1"
                      >
                        {allocation.contractId.slice(0, 8)}...
                        <FaExternalLinkAlt size={10} />
                      </Link>
                      <p className="text-xs text-zinc-500">{formatDate(allocation.createdAt)}</p>
                    </div>
                    <p className="text-yellow-400 font-bold">
                      {formatCurrency(allocation.amountUsd)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div
          className="mt-8 flex flex-wrap gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Link
            href="/developers/contracts"
            className="flex items-center gap-2 px-6 py-3 bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-colors"
          >
            <FaCode />
            Create Contract
          </Link>
          <Link
            href={`/invest/${projectSlug}`}
            className="flex items-center gap-2 px-6 py-3 border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
          >
            <FiTrendingUp />
            Investment Page
          </Link>
          <Link
            href={`/projects/${projectSlug}/roadmap`}
            className="flex items-center gap-2 px-6 py-3 border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
          >
            <FiClock />
            View Roadmap
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
