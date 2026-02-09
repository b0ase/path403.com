'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import DeveloperSearch, { SearchFilters } from '@/components/marketplace/DeveloperSearch';

/**
 * Developer Registry
 *
 * A table of humans who work with agents and contract explicitly.
 * Not a marketplace. Not a gig platform. A credibility surface.
 */

interface DeveloperRow {
  id: string;
  username: string;
  humanName: string;
  bio?: string;
  skills: string[];
  hourlyRate?: string;
  githubVerified: boolean;
  githubStars: number;
  availability?: string;
  profileUrl: string;
  closedContracts: number;
  averageRating: number;
}

export default function DevelopersRegistryPage() {
  const [developers, setDevelopers] = useState<DeveloperRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch developers on initial load
  useEffect(() => {
    fetchDevelopers({
      skills: [],
      sort: 'recent',
    });
  }, []);

  const fetchDevelopers = async (filters: SearchFilters) => {
    setLoading(true);
    setError(null);

    try {
      // Build query string
      const params = new URLSearchParams();

      if (filters.skills.length > 0) {
        params.append('skills', filters.skills.join(','));
      }
      if (filters.minRate) {
        params.append('minRate', filters.minRate.toString());
      }
      if (filters.maxRate) {
        params.append('maxRate', filters.maxRate.toString());
      }
      if (filters.availability) {
        params.append('availability', filters.availability);
      }
      params.append('sort', filters.sort);

      const response = await fetch(`/api/marketplace/developers/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch developers');
      }

      const data = await response.json();
      setDevelopers(data.results || []);
    } catch (err) {
      console.error('[developers-page] Error:', err);
      setError('Failed to load developers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters: SearchFilters) => {
    fetchDevelopers(filters);
  };
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-4 md:px-8 py-16">
        <div className="w-full">
          {/* Header */}
          <div className="mb-12 border-b border-zinc-900 pb-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase">
              DEVELOPER REGISTRY
            </h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2 font-mono">
              Human + Agent · Contract-First · {developers.length} registered
            </p>
          </div>

          {/* Search & Filter */}
          <DeveloperSearch onSearch={handleSearch} />

          {/* Loading State */}
          {loading && (
            <div className="border border-zinc-900 p-12 text-center mb-8">
              <p className="text-xs text-zinc-600">Loading developers...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="border border-zinc-900 bg-zinc-950 p-6 mb-8">
              <p className="text-xs text-zinc-500">{error}</p>
            </div>
          )}

          {/* Registry Table */}
          {!loading && !error && (
          <div className="border border-zinc-900 overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-900">
                    <th className="px-6 py-4 text-left text-[10px] font-mono uppercase tracking-widest text-zinc-600">
                      Human
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-mono uppercase tracking-widest text-zinc-600">
                      Skills
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-mono uppercase tracking-widest text-zinc-600">
                      GitHub
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-mono uppercase tracking-widest text-zinc-600">
                      Rate
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-mono uppercase tracking-widest text-zinc-600">
                      Contracts
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-mono uppercase tracking-widest text-zinc-600">
                      Profile
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {developers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <p className="text-xs text-zinc-600">No developers found matching your criteria.</p>
                        <p className="text-[10px] text-zinc-700 font-mono uppercase tracking-wider mt-2">
                          Try adjusting your filters
                        </p>
                      </td>
                    </tr>
                  ) : (
                    developers.map((dev) => (
                      <tr
                        key={dev.id}
                        className="border-b border-zinc-900 last:border-b-0 hover:bg-zinc-900/50 transition-colors"
                      >
                        {/* Human Name */}
                        <td className="px-6 py-4">
                          <div className="font-medium text-white text-sm">{dev.humanName || dev.username}</div>
                          {dev.githubVerified && (
                            <div className="text-[10px] text-zinc-600 font-mono uppercase mt-1">Verified</div>
                          )}
                        </td>

                        {/* Skills */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {dev.skills.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="text-[10px] bg-zinc-900 text-zinc-400 px-2 py-1 uppercase font-mono">
                                {skill}
                              </span>
                            ))}
                            {dev.skills.length > 3 && (
                              <span className="text-[10px] text-zinc-600 px-2 py-1">+{dev.skills.length - 3}</span>
                            )}
                          </div>
                        </td>

                        {/* GitHub */}
                        <td className="px-6 py-4">
                          <a
                            href={`https://github.com/${dev.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-white hover:text-zinc-400 flex items-center gap-2 w-fit transition-colors font-mono"
                          >
                            <FaGithub className="text-sm" />
                            {dev.username}
                          </a>
                          {dev.githubStars > 0 && (
                            <div className="text-[10px] text-zinc-600 font-mono mt-1">★ {dev.githubStars} stars</div>
                          )}
                        </td>

                        {/* Rate */}
                        <td className="px-6 py-4">
                          <div className="text-xs text-zinc-400">
                            {dev.hourlyRate ? `£${dev.hourlyRate}/hr` : '—'}
                          </div>
                        </td>

                        {/* Contracts */}
                        <td className="px-6 py-4">
                          <div className="text-xs text-zinc-600">
                            {dev.closedContracts === 0 ? (
                              <span>None yet</span>
                            ) : (
                              <Link
                                href={`${dev.profileUrl}#contracts`}
                                className="text-white hover:text-zinc-400 transition-colors"
                              >
                                {dev.closedContracts} closed →
                              </Link>
                            )}
                          </div>
                        </td>

                        {/* Profile */}
                        <td className="px-6 py-4">
                          <Link
                            href={dev.profileUrl}
                            className="text-xs text-white hover:text-zinc-400 font-mono uppercase transition-colors"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}

          {/* Registry Notes */}
          <div className="border border-zinc-900 p-6 mb-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">About This Registry</h2>
            <div className="space-y-3 text-xs text-zinc-500 leading-relaxed">
              <p>
                <strong className="text-white">This is not a marketplace.</strong> It is a registry
                of humans who work with AI agents and contract explicitly.
              </p>
              <p>
                Each person listed is the legal counterparty for their work. The agent is an
                assistant. Responsibility is never ambiguous.
              </p>
              <p>
                Contracts are explicit, scoped, and have clear acceptance criteria. Work is delivered
                by the human; the agent assists.
              </p>
            </div>
          </div>

          {/* Future Concept Note (Parked) */}
          <div className="border border-zinc-900 bg-zinc-950 p-6">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">Future Concept (Not Active)</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Revenue-sharing contracts between humans and supporters may be explored in the future.
              This would allow supporters to provide capital in exchange for discounted future work or
              revenue share.
              <br /><br />
              <strong className="text-zinc-500">This is not implemented and is explicitly out of scope.</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
