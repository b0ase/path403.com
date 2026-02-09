'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaCheckCircle, FaClock, FaTimesCircle, FaExternalLinkAlt } from 'react-icons/fa';

/**
 * Contracts Dashboard
 *
 * Shows all contracts for the current user (as client or as developer).
 * Allows filtering by role and status.
 */

interface Contract {
  id: string;
  contractSlug: string;
  serviceTitle: string;
  serviceDescription: string;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  contractStatus: string;
  escrowStatus: string;
  createdAt: string;
  startDate?: string;
  completedAt?: string;
  inscriptionTxid?: string;
  inscriptionUrl?: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  developer: {
    id: string;
    name: string;
    username: string;
  } | null;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    amount: number;
    status: string;
    submittedAt?: string;
    approvedAt?: string;
  }>;
  userRole: 'client' | 'developer';
}

export default function ContractsDashboard() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | 'client' | 'developer'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    fetchContracts();
  }, [roleFilter, statusFilter]);

  const fetchContracts = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/marketplace/contracts/user?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch contracts');
      }

      const data = await response.json();
      setContracts(data.contracts || []);
    } catch (err) {
      console.error('[contracts-dashboard] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-500" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-500" />;
      case 'active':
      default:
        return <FaClock className="text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'cancelled':
        return 'text-red-400';
      case 'active':
      default:
        return 'text-blue-400';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-4 md:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 border-b border-zinc-900 pb-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase">
              My Contracts
            </h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2 font-mono">
              {contracts.length} contract{contracts.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Filters */}
          <div className="border border-zinc-900 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role Filter */}
              <div>
                <label className="text-xs text-zinc-500 uppercase font-mono mb-3 block">
                  View As
                </label>
                <div className="flex gap-2">
                  {['all', 'client', 'developer'].map((role) => (
                    <button
                      key={role}
                      onClick={() => setRoleFilter(role as any)}
                      className={`px-4 py-2 text-xs font-mono uppercase transition-colors ${
                        roleFilter === role
                          ? 'bg-white text-black'
                          : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-xs text-zinc-500 uppercase font-mono mb-3 block">
                  Status
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'active', 'completed', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status as any)}
                      className={`px-4 py-2 text-xs font-mono uppercase transition-colors ${
                        statusFilter === status
                          ? 'bg-white text-black'
                          : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="border border-zinc-900 p-12 text-center">
              <p className="text-xs text-zinc-600">Loading contracts...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="border border-zinc-900 bg-zinc-950 p-6 mb-8">
              <p className="text-xs text-zinc-500">{error}</p>
            </div>
          )}

          {/* Contracts List */}
          {!loading && !error && contracts.length === 0 && (
            <div className="border border-zinc-900 p-12 text-center">
              <p className="text-xs text-zinc-600 mb-4">No contracts found</p>
              <Link
                href="/contracts"
                className="text-xs bg-white text-black px-6 py-3 hover:bg-zinc-200 transition-colors font-mono uppercase inline-block"
              >
                Browse Services
              </Link>
            </div>
          )}

          {!loading && !error && contracts.length > 0 && (
            <div className="space-y-6">
              {contracts.map((contract) => (
                <div key={contract.id} className="border border-zinc-900 p-6 hover:bg-zinc-900/30 transition-colors">
                  {/* Contract Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(contract.contractStatus)}
                        <h3 className="text-lg font-bold uppercase text-white">
                          {contract.serviceTitle}
                        </h3>
                        <span className={`text-xs font-mono uppercase ${getStatusColor(contract.contractStatus)}`}>
                          {contract.contractStatus}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mb-2">{contract.serviceDescription}</p>
                      <div className="flex items-center gap-4 text-[10px] text-zinc-600 font-mono uppercase">
                        <span>Role: {contract.userRole}</span>
                        <span>|</span>
                        <span>Created: {new Date(contract.createdAt).toLocaleDateString()}</span>
                        {contract.inscriptionTxid && (
                          <>
                            <span>|</span>
                            <a
                              href={contract.inscriptionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:text-zinc-400 flex items-center gap-1"
                            >
                              Blockchain Proof <FaExternalLinkAlt className="text-[8px]" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        {contract.currency}{contract.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-zinc-600 font-mono uppercase">
                        {contract.paymentMethod}
                      </p>
                    </div>
                  </div>

                  {/* Parties */}
                  <div className="border-t border-zinc-900 pt-4 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-zinc-600 uppercase font-mono mb-1">Client</p>
                        <p className="text-white">{contract.client.name || 'Unknown'}</p>
                      </div>
                      {contract.developer && (
                        <div>
                          <p className="text-zinc-600 uppercase font-mono mb-1">Developer</p>
                          <p className="text-white">{contract.developer.name || contract.developer.username}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Milestones */}
                  {contract.milestones.length > 0 && (
                    <div className="border-t border-zinc-900 pt-4 mb-4">
                      <p className="text-xs text-zinc-600 uppercase font-mono mb-3">Milestones</p>
                      <div className="space-y-2">
                        {contract.milestones.map((milestone) => (
                          <div
                            key={milestone.id}
                            className="flex items-center justify-between text-xs bg-zinc-950 p-3"
                          >
                            <div className="flex items-center gap-2">
                              {getStatusIcon(milestone.status)}
                              <span className="text-white">{milestone.title}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-zinc-500">
                                {contract.currency}{milestone.amount.toFixed(2)}
                              </span>
                              <span className={`font-mono uppercase ${getStatusColor(milestone.status)}`}>
                                {milestone.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      href={`/dashboard/contracts/${contract.id}`}
                      className="text-xs bg-white text-black px-4 py-2 hover:bg-zinc-200 transition-colors font-mono uppercase"
                    >
                      View Details
                    </Link>
                    {contract.contractStatus === 'completed' && contract.userRole === 'client' && (
                      <Link
                        href={`/dashboard/contracts/${contract.id}/review`}
                        className="text-xs border border-zinc-900 text-white px-4 py-2 hover:bg-zinc-900 transition-colors font-mono uppercase"
                      >
                        Leave Review
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
