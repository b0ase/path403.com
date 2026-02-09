'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Proposal {
  id: string;
  session_id: string;
  session_code: string | null;
  email: string | null;
  wallet_address: string | null;
  project_slug: string | null;
  github_issue_number: number | null;
  github_issue_url: string | null;
  proposal_type: string;
  title: string;
  description: string | null;
  terms: Record<string, any>;
  status: string;
  notes: string | null;
  created_at: string;
}

export default function KintsugiDashboard() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'contacted' | 'completed'>('all');

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const res = await fetch('/api/dashboard/kintsugi/proposals');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProposals(data.proposals || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/dashboard/kintsugi/proposals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      setProposals(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const filtered = filter === 'all'
    ? proposals
    : proposals.filter(p => p.status === filter);

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    contacted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    in_progress: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    completed: 'bg-green-500/10 text-green-400 border-green-500/20',
    cancelled: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  };

  const typeLabels: Record<string, string> = {
    new_project: 'New Project',
    developer: 'Developer',
    investor: 'Investor',
    feedback: 'Feedback',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-zinc-500">Loading proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Kintsugi Proposals</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {proposals.length} total · {proposals.filter(p => p.status === 'pending').length} pending
            </p>
          </div>
          <Link
            href="/kintsugi"
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
          >
            Open Kintsugi Chat
          </Link>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'contacted', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter === f
                  ? 'bg-white text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Proposals List */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            No proposals yet. They'll appear here when people accept proposals in Kintsugi chat.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(proposal => (
              <div
                key={proposal.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-0.5 text-xs rounded border ${statusColors[proposal.status] || statusColors.pending}`}>
                        {proposal.status}
                      </span>
                      <span className="px-2 py-0.5 text-xs rounded bg-zinc-800 text-zinc-400">
                        {typeLabels[proposal.proposal_type] || proposal.proposal_type}
                      </span>
                      {proposal.project_slug && (
                        <span className="text-xs text-zinc-500">
                          → {proposal.project_slug}
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg mb-1">{proposal.title}</h3>

                    {proposal.description && (
                      <p className="text-zinc-400 text-sm mb-3 line-clamp-2">
                        {proposal.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm">
                      {proposal.email && (
                        <a
                          href={`mailto:${proposal.email}`}
                          className="text-blue-400 hover:underline"
                        >
                          {proposal.email}
                        </a>
                      )}
                      {proposal.github_issue_number && (
                        <a
                          href={proposal.github_issue_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-400 hover:text-white"
                        >
                          Issue #{proposal.github_issue_number}
                        </a>
                      )}
                      {proposal.terms && Object.keys(proposal.terms).length > 0 && (
                        <span className="text-zinc-500">
                          Terms: {JSON.stringify(proposal.terms)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                      <span>Session: {proposal.session_code || proposal.session_id.slice(0, 12)}</span>
                      <span>{new Date(proposal.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {proposal.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(proposal.id, 'contacted')}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors"
                      >
                        Mark Contacted
                      </button>
                    )}
                    {proposal.status === 'contacted' && (
                      <button
                        onClick={() => updateStatus(proposal.id, 'in_progress')}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded transition-colors"
                      >
                        Start Work
                      </button>
                    )}
                    {proposal.status === 'in_progress' && (
                      <button
                        onClick={() => updateStatus(proposal.id, 'completed')}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded transition-colors"
                      >
                        Complete
                      </button>
                    )}
                    {proposal.status !== 'cancelled' && proposal.status !== 'completed' && (
                      <button
                        onClick={() => updateStatus(proposal.id, 'cancelled')}
                        className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm rounded transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
