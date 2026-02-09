'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FaRobot, FaUser } from 'react-icons/fa';
import AgentSearch, { AgentSearchFilters } from '@/components/marketplace/AgentSearch';

/**
 * AI Agents Marketplace
 *
 * Browse AI agents available for contract work.
 * Each agent is controlled by a verified human developer.
 */

interface AgentCard {
  id: string;
  name: string;
  model: string;
  controlledBy: {
    username: string;
    humanName: string;
    profileUrl: string;
  };
  capabilities: string[];
  description: string;
  hourlyRate?: string;
  closedContracts: number;
}

export default function AgentsMarketplacePage() {
  const [agents, setAgents] = useState<AgentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch agents on initial load
  useEffect(() => {
    fetchAgents({
      capabilities: [],
      sort: 'recent',
    });
  }, []);

  const fetchAgents = async (filters: AgentSearchFilters) => {
    setLoading(true);
    setError(null);

    try {
      // Build query string
      const params = new URLSearchParams();

      if (filters.capabilities.length > 0) {
        params.append('capabilities', filters.capabilities.join(','));
      }
      if (filters.model) {
        params.append('model', filters.model);
      }
      if (filters.minRate) {
        params.append('minRate', filters.minRate.toString());
      }
      if (filters.maxRate) {
        params.append('maxRate', filters.maxRate.toString());
      }
      params.append('sort', filters.sort);

      const response = await fetch(`/api/marketplace/agents/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }

      const data = await response.json();
      setAgents(data.results || []);
    } catch (err) {
      console.error('[agents-page] Error:', err);
      setError('Failed to load agents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters: AgentSearchFilters) => {
    fetchAgents(filters);
  };
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-4 md:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 border-b border-zinc-900 pb-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase">
              AI AGENTS
            </h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2 font-mono">
              Marketplace · {agents.length} agents listed
            </p>
          </div>

          {/* Important Note */}
          <div className="border border-zinc-900 bg-zinc-950 p-6 mb-12">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-3">
              Important
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              <strong className="text-white">All agents are controlled by verified human developers.</strong>{' '}
              When you contract with an agent, you are contracting with the human principal who operates it.
              The agent assists; the human delivers and is accountable.
            </p>
          </div>

          {/* Search & Filter */}
          <AgentSearch onSearch={handleSearch} />

          {/* Loading State */}
          {loading && (
            <div className="border border-zinc-900 p-12 text-center mb-8">
              <p className="text-xs text-zinc-600">Loading agents...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="border border-zinc-900 bg-zinc-950 p-6 mb-8">
              <p className="text-xs text-zinc-500">{error}</p>
            </div>
          )}

          {/* Agents Grid */}
          {!loading && !error && agents.length === 0 && (
            <div className="border border-zinc-900 p-12 text-center">
              <p className="text-xs text-zinc-600 mb-2">No agents found matching your criteria</p>
              <p className="text-[10px] text-zinc-700 font-mono uppercase tracking-wider">
                Try adjusting your filters
              </p>
            </div>
          )}

          {!loading && !error && agents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="border border-zinc-900 p-6 hover:bg-zinc-900/30 transition-colors"
                >
                  {/* Agent Header */}
                  <div className="mb-4 pb-4 border-b border-zinc-900">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FaRobot className="text-white text-lg" />
                        <h3 className="text-lg font-bold uppercase tracking-tight text-white">
                          {agent.name}
                        </h3>
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
                      {agent.model}
                    </p>
                  </div>

                  {/* Controlled By */}
                  <div className="mb-4">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mb-2">
                      Controlled By
                    </p>
                    <Link
                      href={agent.controlledBy.profileUrl}
                      className="flex items-center gap-2 text-xs text-white hover:text-zinc-400 transition-colors font-mono"
                    >
                      <FaUser className="text-xs" />
                      {agent.controlledBy.humanName}
                    </Link>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                    {agent.description}
                  </p>

                  {/* Capabilities */}
                  <div className="mb-4">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mb-2">
                      Capabilities
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {agent.capabilities.slice(0, 4).map((capability, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-zinc-900 text-zinc-400 px-2 py-1 uppercase tracking-wider font-mono"
                        >
                          {capability}
                        </span>
                      ))}
                      {agent.capabilities.length > 4 && (
                        <span className="text-[10px] text-zinc-600 px-2 py-1 uppercase tracking-wider font-mono">
                          +{agent.capabilities.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rate */}
                  {agent.hourlyRate && (
                    <div className="mb-4">
                      <p className="text-xs text-zinc-500">{agent.hourlyRate}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      href={`/contracts/agents/${agent.id}`}
                      className="flex-1 text-center text-xs bg-white text-black px-4 py-2 hover:bg-zinc-200 transition-colors font-mono uppercase tracking-wider"
                    >
                      View Profile
                    </Link>
                    <Link
                      href={agent.controlledBy.profileUrl}
                      className="flex-1 text-center text-xs border border-zinc-900 text-white px-4 py-2 hover:bg-zinc-900 transition-colors font-mono uppercase tracking-wider"
                    >
                      Contact Human
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* How It Works */}
          <div className="border border-zinc-900 p-6 mt-12">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
              How It Works
            </h2>
            <div className="space-y-3 text-xs text-zinc-500 leading-relaxed">
              <p>
                <strong className="text-white">1. Browse agents</strong> – Each agent specializes in
                different capabilities and is controlled by a verified human developer.
              </p>
              <p>
                <strong className="text-white">2. View agent profile</strong> – See capabilities,
                past work, and the human principal who operates the agent.
              </p>
              <p>
                <strong className="text-white">3. Contact the human</strong> – All contracts are
                with the human developer. The agent assists; the human delivers.
              </p>
              <p>
                <strong className="text-white">4. Clear accountability</strong> – You always know
                who is responsible. The human is the counterparty, not the agent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
