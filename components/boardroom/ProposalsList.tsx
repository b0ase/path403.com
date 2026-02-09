'use client';

import React, { useState, useEffect } from 'react';
import ProposalCard from './ProposalCard';
import CreateProposal from './CreateProposal';

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer_wallet: string;
  proposer_name?: string;
  options: string[];
  token_weighted: boolean;
  ends_at: string;
  status: 'active' | 'passed' | 'rejected' | 'cancelled';
  total_votes: number;
  total_voting_power: number;
  vote_count?: number;
}

interface ProposalsListProps {
  roomId: string;
  walletAddress?: string;
  votingPower?: number;
}

export default function ProposalsList({ roomId, walletAddress, votingPower = 1 }: ProposalsListProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<'all' | 'active' | 'passed' | 'rejected'>('all');

  useEffect(() => {
    fetchProposals();
  }, [roomId, filter]);

  const fetchProposals = async () => {
    try {
      const status = filter === 'all' ? '' : filter;
      const res = await fetch(`/api/boardroom/proposals?roomId=${roomId}&status=${status}`);
      const data = await res.json();
      if (data.proposals) {
        setProposals(data.proposals);
      }
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proposalId: string, choice: number) => {
    try {
      const res = await fetch('/api/boardroom/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'vote',
          proposalId,
          choice,
          votingPower
        })
      });

      if (res.ok) {
        setUserVotes(prev => ({ ...prev, [proposalId]: choice }));
        fetchProposals(); // Refresh to get updated counts
      }
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  const handleCreateProposal = async (proposal: {
    title: string;
    description: string;
    options: string[];
    endsAt: string;
    tokenWeighted: boolean;
  }) => {
    try {
      const res = await fetch('/api/boardroom/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          roomId,
          ...proposal
        })
      });

      if (res.ok) {
        setShowCreate(false);
        fetchProposals();
      }
    } catch (error) {
      console.error('Failed to create proposal:', error);
    }
  };

  const activeCount = proposals.filter(p => p.status === 'active').length;
  const passedCount = proposals.filter(p => p.status === 'passed').length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-white/20 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wider">PROPOSALS</h2>
          <p className="text-xs text-white/60 mt-1">
            {activeCount} active, {passedCount} passed
          </p>
        </div>
        {walletAddress && (
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider hover:bg-cyan-300"
          >
            NEW PROPOSAL
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-white/20 flex">
        {(['all', 'active', 'passed', 'rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-3 text-xs uppercase tracking-wider transition-colors ${
              filter === f
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {showCreate ? (
          <CreateProposal
            roomId={roomId}
            onSubmit={handleCreateProposal}
            onCancel={() => setShowCreate(false)}
          />
        ) : loading ? (
          <div className="text-center text-white/60 py-8">Loading proposals...</div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/60 mb-4">No proposals yet</p>
            {walletAddress && (
              <button
                onClick={() => setShowCreate(true)}
                className="text-cyan-400 text-sm hover:text-cyan-300"
              >
                Create the first proposal
              </button>
            )}
          </div>
        ) : (
          proposals.map(proposal => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              walletAddress={walletAddress}
              votingPower={votingPower}
              onVote={handleVote}
              userVote={userVotes[proposal.id]}
            />
          ))
        )}
      </div>

      {/* Connect prompt */}
      {!walletAddress && (
        <div className="border-t border-white/20 p-4 text-center text-sm text-white/60">
          Connect wallet to create proposals and vote
        </div>
      )}
    </div>
  );
}
