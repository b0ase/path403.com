'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/Providers';
import {
  FiZap,
  FiTwitter,
  FiRefreshCw,
  FiSearch,
  FiChevronRight,
  FiPlay,
  FiPause,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiSettings,
  FiArrowLeft
} from 'react-icons/fi';

interface AutomationJob {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  type: string;
  schedule: string;
  status: string;
  last_run: string | null;
  next_run: string | null;
  run_count: number;
  error_count: number;
}

interface Website {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string | null;
  image_url?: string | null;
}

export default function AutomationsPage() {
  const router = useRouter();
  const { user, loading, supabase } = useAuth();

  const [jobs, setJobs] = useState<AutomationJob[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchData();
    }
  }, [loading, user, router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch automation jobs
      const { data: jobsData, error: jobsError } = await supabase
        .schema('automations')
        .from('jobs')
        .select('*')
        .order('project_id', { ascending: true });

      if (!jobsError && jobsData) {
        setJobs(jobsData);
      }

      // Fetch websites for additional info
      const { data: websitesData, error: websitesError } = await supabase
        .schema('b0ase_com')
        .from('websites')
        .select('id, title, slug, status, category')
        .order('title', { ascending: true });

      if (!websitesError && websitesData) {
        setWebsites(websitesData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleJobStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';

    const { error } = await supabase
      .schema('automations')
      .from('jobs')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', jobId);

    if (!error) {
      setJobs(jobs.map(job =>
        job.id === jobId ? { ...job, status: newStatus } : job
      ));
    }
  };

  const projectGroups = websites.map(website => {
    const projectJobs = jobs.filter(j => j.project_id === website.id);
    return {
      website,
      jobs: projectJobs,
      activeCount: projectJobs.filter(j => j.status === 'enabled').length,
      errorCount: projectJobs.reduce((sum, j) => sum + (j.error_count || 0), 0)
    };
  });

  const categories = ['all', ...new Set(websites.map(w => w.category).filter(Boolean))];

  const filteredProjects = projectGroups.filter(group => {
    const matchesSearch =
      group.website.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.website.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'all' || group.website.category === filterCategory;

    if (filterStatus === 'enabled') return matchesSearch && matchesCategory && group.activeCount > 0;
    if (filterStatus === 'disabled') return matchesSearch && matchesCategory && group.activeCount === 0;

    return matchesSearch && matchesCategory;
  });

  const stats = {
    totalProjects: websites.length,
    activeProjects: projectGroups.filter(g => g.activeCount > 0).length,
    totalJobs: jobs.length,
    errored: jobs.filter(j => j.error_count > 0).length,
  };

  /* Wizard State */
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedProjectForWizard, setSelectedProjectForWizard] = useState<string>('');
  const [selectedJobTypeForWizard, setSelectedJobTypeForWizard] = useState<string>('');

  const JOB_TYPES = [
    { id: 'twitter', name: 'Twitter Bot', description: 'Auto-post and reply on X', icon: <FiTwitter /> },
    { id: 'instagram', name: 'Instagram Poster', description: 'Schedule Reels and Posts', icon: <FiSettings /> }, // Using generic icon if FiInstagram not available in scope, but normally would import
    { id: 'ai-chat', name: 'AI Agent', description: 'Autonomous interaction bot', icon: <FiZap /> },
    { id: 'ai-content', name: 'Content Generator', description: 'Create posts with AI', icon: <FiRefreshCw /> },
  ];

  /* ... previous useEffect ... */

  /* ... previous fetchData ... */

  /* ... previous toggleJobStatus ... */

  /* ... previous projectGroups ... */

  /* ... previous categories ... */

  /* ... previous filteredProjects ... */

  /* ... previous stats ... */

  const handleWizardComplete = () => {
    if (selectedProjectForWizard && selectedJobTypeForWizard) {
      router.push(`/dashboard/servers/hetzner/automations/${selectedProjectForWizard}?create=${selectedJobTypeForWizard}`);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono relative">
        <div className="w-full px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-sm">LOADING...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono relative">

      {/* Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-2xl p-8 rounded-lg shadow-2xl relative animate-fade-in">
            <button
              onClick={() => { setShowWizard(false); setWizardStep(1); }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <FiChevronRight className="rotate-45" size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-2">SETUP NEW AUTOMATION</h2>
            <p className="text-gray-500 text-sm mb-8">Deploy a new autonomous agent or scheduled task</p>

            <div className="flex items-center mb-8">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${wizardStep === 1 ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'}`}>1</div>
              <div className={`h-1 flex-1 mx-4 ${wizardStep === 2 ? 'bg-orange-500' : 'bg-gray-800'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${wizardStep === 2 ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-500'}`}>2</div>
            </div>

            {wizardStep === 1 && (
              <div>
                <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">SELECT TARGET PROJECT</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                  {websites.map(w => (
                    <button
                      key={w.id}
                      onClick={() => setSelectedProjectForWizard(w.id)}
                      className={`p-4 border text-left transition-all ${selectedProjectForWizard === w.id ? 'border-orange-500 bg-orange-500/10' : 'border-gray-800 hover:border-gray-600'}`}
                    >
                      <p className="font-bold text-sm truncate">{w.title}</p>
                      <p className="text-[10px] text-gray-500">{w.category || 'General'}</p>
                    </button>
                  ))}
                </div>
                <div className="mt-8 flex justify-end">
                  <button
                    disabled={!selectedProjectForWizard}
                    onClick={() => setWizardStep(2)}
                    className="px-6 py-2 bg-white text-black font-bold text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    NEXT STEP
                  </button>
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div>
                <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">SELECT AUTOMATION TYPE</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {JOB_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedJobTypeForWizard(type.id)}
                      className={`p-4 border text-left transition-all flex items-start gap-4 ${selectedJobTypeForWizard === type.id ? 'border-orange-500 bg-orange-500/10' : 'border-gray-800 hover:border-gray-600'}`}
                    >
                      <div className={`mt-1 ${selectedJobTypeForWizard === type.id ? 'text-orange-500' : 'text-gray-500'}`}>
                        {type.icon}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{type.name}</p>
                        <p className="text-[10px] text-gray-500">{type.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => setWizardStep(1)}
                    className="text-gray-500 hover:text-white text-sm"
                  >
                    BACK
                  </button>
                  <button
                    disabled={!selectedJobTypeForWizard}
                    onClick={handleWizardComplete}
                    className="px-6 py-2 bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    CREATE AGENT
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      <div className="w-full px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard/servers/hetzner"
              className="text-gray-500 hover:text-white transition-colors"
            >
              <FiArrowLeft size={20} />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <FiZap className="text-orange-500" size={24} />
                <h1 className="text-2xl font-bold">AUTOMATIONS</h1>
              </div>
              <p className="text-sm text-gray-500">Twitter bots & scheduled tasks for all projects</p>
            </div>
            <div>
              <button
                onClick={() => setShowWizard(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold flex items-center gap-2 transition-colors"
              >
                <FiPlay /> NEW AUTOMATION
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="border border-gray-800 p-4">
              <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
              <p className="text-xs text-gray-500">PROJECTS</p>
            </div>
            <div className="border border-green-800 p-4">
              <p className="text-2xl font-bold text-green-500">{stats.activeProjects}</p>
              <p className="text-xs text-gray-500">ACTIVE PROJECTS</p>
            </div>
            <div className="border border-gray-800 p-4">
              <p className="text-2xl font-bold text-gray-400">{stats.totalJobs}</p>
              <p className="text-xs text-gray-500">TOTAL JOBS</p>
            </div>
            <div className="border border-red-800 p-4">
              <p className="text-2xl font-bold text-red-500">{stats.errored}</p>
              <p className="text-xs text-gray-500">JOBS WITH ERRORS</p>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded px-10 py-2 text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-black border border-gray-800 rounded px-4 py-2 text-sm focus:border-orange-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-black border border-gray-800 rounded px-4 py-2 text-sm focus:border-orange-500 focus:outline-none"
          >
            {categories.map(cat => (
              <option key={cat || 'all'} value={cat || 'all'}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 border border-gray-800 hover:border-orange-500 transition-colors text-sm"
          >
            <FiRefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((group) => (
            <Link
              key={group.website.id}
              href={`/dashboard/servers/hetzner/automations/${group.website.id}`}
              className="group border border-gray-800 hover:border-orange-500 transition-all duration-300 bg-black overflow-hidden flex flex-col"
            >
              {/* Card Header/Project Image */}
              <div className="h-32 bg-gray-900 overflow-hidden relative border-b border-gray-800">
                {group.website.image_url ? (
                  <img
                    src={group.website.image_url}
                    alt={group.website.title}
                    className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiZap className="text-gray-800 group-hover:text-orange-900 transition-colors" size={48} />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  {group.activeCount > 0 ? (
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-green-900/80 text-green-400 text-[10px] rounded backdrop-blur-sm border border-green-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      ACTIVE
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-900/80 text-gray-500 text-[10px] rounded backdrop-blur-sm border border-gray-700/50">
                      STANDBY
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg group-hover:text-orange-500 transition-colors truncate">
                    {group.website.title}
                  </h3>
                  <FiChevronRight className="text-gray-700 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">
                    {group.website.category || 'Portfolio'}
                  </span>
                  <div className="h-px bg-gray-800 flex-1" />
                </div>

                {/* Job Summary */}
                <div className="space-y-3 mt-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-600 uppercase tracking-widest">Automation</p>
                      <div className="flex items-center gap-2">
                        <FiTwitter className={group.jobs.some(j => j.type === 'twitter') ? 'text-blue-400' : 'text-gray-800'} size={14} />
                        <span className="text-xs">{group.jobs.length} Jobs</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-600 uppercase tracking-widest">Running</p>
                      <div className="flex items-center gap-2">
                        <FiRefreshCw className={group.activeCount > 0 ? 'text-green-400 animate-spin-slow' : 'text-gray-800'} size={14} />
                        <span className="text-xs">{group.activeCount} Active</span>
                      </div>
                    </div>
                  </div>

                  {group.errorCount > 0 && (
                    <div className="flex items-center gap-2 text-xs text-red-400 bg-red-900/10 p-2 border border-red-900/30">
                      <FiAlertCircle size={14} />
                      {group.errorCount} system errors detected
                    </div>
                  )}
                </div>
              </div>

              {/* Footer/Quick Link */}
              <div className="px-5 py-3 border-t border-gray-900 bg-gray-950/20 text-[10px] text-gray-500 flex justify-between items-center">
                <span>PROJECT ID: {group.website.id.split('-')[0]}...</span>
                <span className="text-gray-700">MANAGE →</span>
              </div>
            </Link>
          ))}
        </div>

        {filteredProjects.length === 0 && !isLoading && (
          <div className="border border-gray-800 p-12 text-center text-gray-500">
            <FiSearch className="mx-auto mb-4 opacity-20" size={48} />
            <p>No projects found matching your filters</p>
          </div>
        )}

        {/* Quick Enable All */}
        <div className="mt-8 border-t border-gray-800 pt-8">
          <h2 className="text-sm text-gray-500 mb-4">BULK ACTIONS</h2>
          <div className="flex gap-4">
            <button
              onClick={async () => {
                const { error } = await supabase
                  .schema('automations')
                  .from('jobs')
                  .update({ status: 'enabled', updated_at: new Date().toISOString() })
                  .neq('status', 'enabled');
                if (!error) fetchData();
              }}
              className="px-4 py-2 bg-green-900/30 text-green-400 hover:bg-green-900/50 transition-colors text-sm"
            >
              Enable All
            </button>
            <button
              onClick={async () => {
                const { error } = await supabase
                  .schema('automations')
                  .from('jobs')
                  .update({ status: 'disabled', updated_at: new Date().toISOString() })
                  .neq('status', 'disabled');
                if (!error) fetchData();
              }}
              className="px-4 py-2 bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors text-sm"
            >
              Disable All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
