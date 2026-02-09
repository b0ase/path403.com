'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiTarget, FiTrendingUp, FiCheck, FiClock, FiDollarSign, FiUsers } from 'react-icons/fi';

interface FundingTranche {
  id: string;
  project_slug: string;
  tranche_number: number;
  name: string;
  description: string | null;
  target_amount_gbp: number;
  raised_amount_gbp: number;
  price_per_percent: number;
  equity_offered: number;
  status: 'upcoming' | 'active' | 'closed';
  milestone_summary: string | null;
  created_at: string;
}

interface ProjectData {
  id: string;
  name: string;
  description: string | null;
  slug: string;
}

const supabase = createClient();

export default function ProjectRoadmapPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [tranches, setTranches] = useState<FundingTranche[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch project
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('id, name, description, slug')
          .eq('slug', slug)
          .maybeSingle();

        if (projectError) throw projectError;
        if (!projectData) {
          setError('Project not found');
          setLoading(false);
          return;
        }
        setProject(projectData);

        // Fetch funding tranches
        const { data: tranchesData, error: tranchesError } = await supabase
          .from('funding_tranches')
          .select('*')
          .eq('project_slug', slug)
          .order('tranche_number', { ascending: true });

        if (tranchesError) throw tranchesError;
        setTranches(tranchesData || []);
      } catch (err: any) {
        console.error('Error fetching roadmap data:', err);
        setError(err.message || 'Failed to load roadmap');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'closed': return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30';
      default: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'FUNDING NOW';
      case 'closed': return 'COMPLETED';
      default: return 'UPCOMING';
    }
  };

  const totalTarget = tranches.reduce((sum, t) => sum + Number(t.target_amount_gbp), 0);
  const totalRaised = tranches.reduce((sum, t) => sum + Number(t.raised_amount_gbp), 0);
  const totalEquity = tranches.reduce((sum, t) => sum + Number(t.equity_offered), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 text-sm font-mono uppercase">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Project not found'}</p>
          <Link href="/projects" className="text-zinc-500 hover:text-white transition-colors">
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="px-4 md:px-8 py-16">
        {/* Header */}
        <motion.div
          className="mb-12 border-b border-zinc-900 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 text-zinc-500 text-sm mb-4">
            <Link href="/projects" className="hover:text-white transition-colors">Projects</Link>
            <span>/</span>
            <Link href={`/projects/${slug}`} className="hover:text-white transition-colors">{project.name}</Link>
            <span>/</span>
            <span className="text-white">Roadmap</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6">
            <div className="bg-blue-900/50 p-4 md:p-6 border border-blue-800 self-start">
              <FiTarget className="text-4xl md:text-6xl text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500 leading-none tracking-tighter uppercase">
                {project.name.replace(/\s+/g, '_')}
              </h1>
              <div className="text-xs text-zinc-500 mt-2 font-mono uppercase tracking-widest">
                FUNDING_ROADMAP
              </div>
            </div>
          </div>

          {project.description && (
            <p className="text-zinc-400 max-w-2xl">{project.description}</p>
          )}
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="border border-zinc-800 p-6 bg-zinc-900/30">
            <div className="text-xs text-zinc-500 font-mono uppercase mb-2">Total Target</div>
            <div className="text-2xl font-bold text-white">£{totalTarget.toLocaleString()}</div>
          </div>
          <div className="border border-zinc-800 p-6 bg-zinc-900/30">
            <div className="text-xs text-zinc-500 font-mono uppercase mb-2">Total Raised</div>
            <div className="text-2xl font-bold text-green-400">£{totalRaised.toLocaleString()}</div>
          </div>
          <div className="border border-zinc-800 p-6 bg-zinc-900/30">
            <div className="text-xs text-zinc-500 font-mono uppercase mb-2">Equity Offered</div>
            <div className="text-2xl font-bold text-cyan-400">{totalEquity}%</div>
          </div>
          <div className="border border-zinc-800 p-6 bg-zinc-900/30">
            <div className="text-xs text-zinc-500 font-mono uppercase mb-2">Milestones</div>
            <div className="text-2xl font-bold text-white">{tranches.length}</div>
          </div>
        </motion.div>

        {/* Overall Progress */}
        {totalTarget > 0 && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-500 font-mono uppercase">Overall Progress</span>
              <span className="text-white font-bold">{((totalRaised / totalTarget) * 100).toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-zinc-900 border border-zinc-800 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((totalRaised / totalTarget) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </motion.div>
        )}

        {/* Tranches */}
        {tranches.length === 0 ? (
          <motion.div
            className="border border-zinc-800 border-dashed p-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <FiTarget className="text-4xl text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Funding Tranches</h3>
            <p className="text-zinc-500 mb-6">
              This project doesn't have funding milestones defined yet.
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-zinc-500 uppercase tracking-tight mb-6">
              Funding_Milestones
            </h2>

            {tranches.map((tranche, index) => {
              const progress = tranche.target_amount_gbp > 0
                ? (Number(tranche.raised_amount_gbp) / Number(tranche.target_amount_gbp)) * 100
                : 0;

              return (
                <motion.div
                  key={tranche.id}
                  className="border border-zinc-800 bg-black hover:border-zinc-700 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  {/* Tranche Header */}
                  <div className="p-6 border-b border-zinc-900">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl font-bold text-zinc-400">
                          {tranche.tranche_number}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                            {tranche.name}
                          </h3>
                          <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase border ${getStatusColor(tranche.status)}`}>
                            {getStatusLabel(tranche.status)}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-6 text-right">
                        <div>
                          <div className="text-xs text-zinc-500 font-mono uppercase">Target</div>
                          <div className="text-lg font-bold text-white">£{Number(tranche.target_amount_gbp).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-zinc-500 font-mono uppercase">Equity</div>
                          <div className="text-lg font-bold text-cyan-400">{tranche.equity_offered}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-zinc-500 font-mono uppercase">Price/1%</div>
                          <div className="text-lg font-bold text-green-400">£{Number(tranche.price_per_percent).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress & Description */}
                  <div className="p-6">
                    {tranche.description && (
                      <p className="text-zinc-400 text-sm mb-4">{tranche.description}</p>
                    )}

                    {tranche.milestone_summary && (
                      <div className="bg-zinc-900/50 border border-zinc-800 p-4 mb-4">
                        <div className="text-xs text-zinc-500 font-mono uppercase mb-2">Milestone Deliverables</div>
                        <p className="text-white text-sm">{tranche.milestone_summary}</p>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-zinc-500">
                          £{Number(tranche.raised_amount_gbp).toLocaleString()} raised
                        </span>
                        <span className="text-white font-bold">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-zinc-900 border border-zinc-800 overflow-hidden">
                        <motion.div
                          className={`h-full ${tranche.status === 'closed' ? 'bg-zinc-500' : 'bg-gradient-to-r from-green-500 to-emerald-400'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(progress, 100)}%` }}
                          transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                        />
                      </div>
                    </div>

                    {/* CTA for active tranches */}
                    {tranche.status === 'active' && (
                      <div className="mt-6 flex gap-3">
                        <Link
                          href={`/invest/${slug}?tranche=${tranche.tranche_number}`}
                          className="px-6 py-3 bg-green-500 text-black font-bold text-sm uppercase tracking-wider hover:bg-green-400 transition-colors"
                        >
                          Invest Now
                        </Link>
                        <Link
                          href={`/projects/${slug}`}
                          className="px-6 py-3 border border-zinc-700 text-zinc-400 font-bold text-sm uppercase tracking-wider hover:border-zinc-500 hover:text-white transition-colors"
                        >
                          View Project
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Back Link */}
        <motion.div
          className="mt-12 pt-8 border-t border-zinc-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link
            href={`/projects/${slug}`}
            className="text-zinc-500 hover:text-white transition-colors text-sm"
          >
            ← Back to Project
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
