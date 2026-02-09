'use client';

import React, { useState } from 'react';

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
  results?: {
    byOption: Record<string, number>;
    byPower: Record<string, number>;
    percentages: Record<string, number>;
    powerPercentages: Record<string, number>;
  };
}

interface ProposalCardProps {
  proposal: Proposal;
  walletAddress?: string;
  votingPower?: number;
  onVote?: (proposalId: string, choice: number) => Promise<void>;
  userVote?: number;
}

export default function ProposalCard({
  proposal,
  walletAddress,
  votingPower = 1,
  onVote,
  userVote
}: ProposalCardProps) {
  const [voting, setVoting] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(userVote ?? null);

  const isActive = proposal.status === 'active' && new Date(proposal.ends_at) > new Date();
  const hasEnded = new Date(proposal.ends_at) <= new Date();
  const canVote = isActive && walletAddress && !voting;

  const timeRemaining = () => {
    const end = new Date(proposal.ends_at);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Ending soon';
  };

  const handleVote = async (choice: number) => {
    if (!onVote || !canVote) return;

    setVoting(true);
    try {
      await onVote(proposal.id, choice);
      setSelectedChoice(choice);
    } catch (error) {
      console.error('Vote failed:', error);
    } finally {
      setVoting(false);
    }
  };

  const statusColor = {
    active: 'text-green-400 border-green-400',
    passed: 'text-cyan-400 border-cyan-400',
    rejected: 'text-red-400 border-red-400',
    cancelled: 'text-white/40 border-white/40'
  };

  return (
    <div className="bg-black border border-white/20 hover:border-white/40 transition-colors">
      {/* Header */}
      <div className="border-b border-white/20 p-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold uppercase tracking-wider flex-1">
            {proposal.title}
          </h3>
          <span className={`text-xs px-2 py-1 border uppercase ${statusColor[proposal.status]}`}>
            {proposal.status}
          </span>
        </div>
        <p className="text-sm text-white/60 mt-2">{proposal.description}</p>
      </div>

      {/* Voting Options */}
      <div className="p-4 space-y-3">
        {proposal.options.map((option, i) => {
          const percentage = proposal.results?.percentages?.[option] || 0;
          const powerPercentage = proposal.results?.powerPercentages?.[option] || 0;
          const isSelected = selectedChoice === i || userVote === i;
          const displayPercentage = proposal.token_weighted ? powerPercentage : percentage;

          return (
            <button
              key={i}
              onClick={() => handleVote(i)}
              disabled={!canVote}
              className={`w-full text-left p-3 border transition-all relative overflow-hidden ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-400/10'
                  : canVote
                  ? 'border-white/20 hover:border-white/40'
                  : 'border-white/10'
              }`}
            >
              {/* Progress bar */}
              {(hasEnded || proposal.status !== 'active') && (
                <div
                  className="absolute inset-0 bg-white/5"
                  style={{ width: `${displayPercentage}%` }}
                />
              )}

              <div className="relative flex items-center justify-between">
                <span className="font-medium uppercase tracking-wider">
                  {option}
                </span>
                <span className="text-sm text-white/60">
                  {hasEnded || proposal.status !== 'active'
                    ? `${displayPercentage.toFixed(1)}%`
                    : isSelected
                    ? 'YOUR VOTE'
                    : ''
                  }
                </span>
              </div>

              {/* Vote counts for ended proposals */}
              {(hasEnded || proposal.status !== 'active') && proposal.results && (
                <div className="relative text-xs text-white/40 mt-1">
                  {proposal.results.byOption[option]} votes
                  {proposal.token_weighted && ` (${proposal.results.byPower[option].toLocaleString()} voting power)`}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-white/20 p-4 flex items-center justify-between text-xs text-white/60">
        <div className="flex items-center gap-4">
          <span>
            {proposal.vote_count || proposal.total_votes} votes
          </span>
          {proposal.token_weighted && (
            <span>
              {proposal.total_voting_power.toLocaleString()} voting power
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {proposal.token_weighted && (
            <span className="text-cyan-400">TOKEN-WEIGHTED</span>
          )}
          <span>{timeRemaining()}</span>
        </div>
      </div>

      {/* Voting power info */}
      {canVote && votingPower > 0 && (
        <div className="border-t border-white/10 p-3 bg-white/5 text-xs text-center text-white/60">
          Your voting power: <span className="text-cyan-400">{votingPower.toLocaleString()}</span>
        </div>
      )}

      {/* Connect wallet prompt */}
      {isActive && !walletAddress && (
        <div className="border-t border-white/10 p-3 bg-white/5 text-xs text-center text-white/60">
          Connect wallet to vote
        </div>
      )}
    </div>
  );
}
