'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/Providers';
import PublicNavbar from '@/components/PublicNavbar';
import {
  FiZap,
  FiTwitter,
  FiRefreshCw,
  FiArrowLeft,
  FiPlay,
  FiPause,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiSettings,
  FiExternalLink,
  FiSave,
  FiTrash2,
  FiPlus,
  FiList,
  FiInstagram,
  FiVideo,
  FiMessageSquare,
  FiCpu,
  FiFilm,
  FiCode,
  FiHash,
  FiGlobe
} from 'react-icons/fi';
import { FaTiktok, FaFacebook } from 'react-icons/fa';
import { SiGoogle } from 'react-icons/si';

interface AutomationJob {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  type: string;
  schedule: string;
  status: string;
  config: Record<string, any>;
  last_run: string | null;
  next_run: string | null;
  run_count: number;
  error_count: number;
  last_error: string | null;
  updated_at: string;
}

const JOB_TYPES = [
  { id: 'twitter', name: 'Twitter (X)', icon: <FiTwitter className="text-blue-400" /> },
  { id: 'instagram', name: 'Instagram', icon: <FiInstagram className="text-pink-400" /> },
  { id: 'tiktok', name: 'TikTok', icon: <FaTiktok className="text-white" /> },
  { id: 'facebook', name: 'Facebook', icon: <FaFacebook className="text-blue-600" /> },
  { id: 'ai-content', name: 'AI Content (Kling/Higgs)', icon: <FiCpu className="text-purple-400" /> },
  { id: 'ai-chat', name: 'AI Autonomous Chat', icon: <FiMessageSquare className="text-green-400" /> },
];

type TabId = 'overview' | 'social' | 'ai' | 'video' | 'settings';

interface Website {
  id: string;
  title: string;
  slug: string;
  live_url: string | null;
  status: string;
  category: string | null;
}

interface LogEntry {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  duration_ms: number | null;
}

export default function ProjectAutomationPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const { user, loading, supabase } = useAuth();

  const [jobs, setJobs] = useState<AutomationJob[]>([]);
  const [website, setWebsite] = useState<Website | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [editingJob, setEditingJob] = useState<AutomationJob | null>(null);

  // Form state for editing/creating
  const [formData, setFormData] = useState({
    name: '',
    type: 'twitter',
    schedule: '0 */6 * * *',
    config: {} as Record<string, any>
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user && projectId) {
      fetchData();
    }
  }, [loading, user, router, projectId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch jobs
      const { data: jobsData } = await supabase
        .schema('automations')
        .from('jobs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (jobsData) {
        setJobs(jobsData);
        if (jobsData.length > 0 && !editingJob) {
          // Initialize form with first job or first of type
          handleSelectJob(jobsData[0]);
        }
      }

      // Fetch website info
      const { data: websiteData } = await supabase
        .schema('b0ase_com')
        .from('websites')
        .select('*')
        .eq('id', projectId)
        .single();

      if (websiteData) {
        setWebsite(websiteData);
      }

      // Fetch recent logs
      const { data: logsData } = await supabase
        .schema('automations')
        .from('logs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (logsData) {
        setLogs(logsData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectJob = (job: AutomationJob) => {
    setEditingJob(job);
    setFormData({
      name: job.name,
      type: job.type,
      schedule: job.schedule,
      config: job.config || {}
    });
  };

  const toggleJobStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';

    const { error } = await supabase
      .schema('automations')
      .from('jobs')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', jobId);

    if (!error) {
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
      if (editingJob?.id === jobId) {
        setEditingJob({ ...editingJob, status: newStatus });
      }
    }
  };

  const saveConfig = async () => {
    if (!editingJob) return;
    setIsSaving(true);

    const { error } = await supabase
      .schema('automations')
      .from('jobs')
      .update({
        name: formData.name,
        schedule: formData.schedule,
        config: formData.config,
        updated_at: new Date().toISOString()
      })
      .eq('id', editingJob.id);

    if (!error) {
      const updatedJob = {
        ...editingJob,
        name: formData.name,
        schedule: formData.schedule,
        config: formData.config
      };
      setJobs(jobs.map(j => j.id === editingJob.id ? updatedJob : j));
      setEditingJob(updatedJob);
    }

    setIsSaving(false);
  };

  const runNow = async (jobId: string) => {
    const { error } = await supabase
      .schema('automations')
      .from('logs')
      .insert({
        job_id: jobId,
        project_id: projectId,
        status: 'manual_trigger',
        message: 'Manual run triggered from dashboard',
      });

    if (!error) {
      fetchData();
    }
  };

  const createJob = async (type: string) => {
    const typeInfo = JOB_TYPES.find(t => t.id === type);
    const newJob = {
      project_id: projectId,
      name: `${typeInfo?.name || type} Job`,
      type: type,
      schedule: '0 */6 * * *',
      status: 'disabled',
      config: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .schema('automations')
      .from('jobs')
      .insert(newJob)
      .select()
      .single();

    if (!error && data) {
      setJobs([...jobs, data]);
      handleSelectJob(data);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-mono text-sm">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">

      <div className="w-full px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard/servers/hetzner/automations"
              className="text-gray-500 hover:text-white transition-colors"
            >
              <FiArrowLeft size={20} />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <FiCpu className="text-orange-500" size={24} />
                <h1 className="text-2xl font-bold">{website?.title || projectId}</h1>
                <span className="px-2 py-0.5 text-[10px] bg-gray-800 text-gray-400 rounded uppercase font-bold tracking-widest">
                  {website?.category || 'PROD'}
                </span>
              </div>
              <p className="text-sm text-gray-500">Autonomous social media & content automation hub</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex border border-gray-800 rounded overflow-hidden">
                {(['overview', 'social', 'ai', 'video', 'settings'] as TabId[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === tab ? 'bg-orange-600 text-white' : 'bg-black text-gray-500 hover:text-white hover:bg-gray-900'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-800 w-full mb-8" />
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Project Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="border border-gray-800 p-6 bg-black/40">
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest">Active Scripts</p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-bold">{jobs.filter(j => j.status === 'enabled').length}</p>
                  <p className="text-xs text-gray-600 mb-1">/ {jobs.length} total</p>
                </div>
              </div>
              <div className="border border-gray-800 p-6 bg-black/40">
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest">24h Throughput</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold">{logs.filter(l => l.status === 'success' && new Date(l.created_at) > new Date(Date.now() - 86400000)).length}</p>
                  <FiCheckCircle className="text-green-500" size={20} />
                </div>
              </div>
              <div className="border border-red-900/30 p-6 bg-red-900/5">
                <p className="text-xs text-red-700 mb-2 uppercase tracking-widest">System Errors</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-red-500">{jobs.reduce((sum, j) => sum + j.error_count, 0)}</p>
                  <FiAlertCircle className="text-red-500" size={20} />
                </div>
              </div>
              <div className="border border-gray-800 p-6 bg-black/40">
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest">API Credits</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-blue-400">GOOD</p>
                  <FiZap className="text-blue-500" size={20} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Jobs Status List */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <FiList size={14} /> ACTIVE CHRON SERVICES
                </h2>
                <div className="border border-gray-800 divide-y divide-gray-800">
                  {jobs.map(j => (
                    <div key={j.id} className="p-4 hover:bg-gray-900/20 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded ${j.status === 'enabled' ? 'bg-green-900/20 text-green-500' : 'bg-gray-800 text-gray-600'}`}>
                          {JOB_TYPES.find(t => t.id === j.type)?.icon || <FiSettings />}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{j.name}</p>
                          <p className="text-[10px] text-gray-500 font-mono tracking-tighter">
                            SCHEDULE: {j.schedule} | RUNS: {j.run_count}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleJobStatus(j.id, j.status)}
                          className={`p-2 rounded transition-colors ${j.status === 'enabled' ? 'hover:text-amber-500' : 'hover:text-green-500'}`}
                        >
                          {j.status === 'enabled' ? <FiPause size={16} /> : <FiPlay size={16} />}
                        </button>
                        <button
                          onClick={() => {
                            handleSelectJob(j);
                            setActiveTab(j.type === 'ai-content' || j.type === 'ai-chat' ? 'ai' : 'social');
                          }}
                          className="p-2 hover:text-white transition-colors"
                        >
                          <FiSettings size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {jobs.length === 0 && (
                    <div className="p-8 text-center text-gray-600 italic text-sm">No services configured</div>
                  )}
                </div>
              </div>

              {/* Realtime Stream */}
              <div className="space-y-4">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <FiRefreshCw size={14} /> ACTIVITY STREAM
                </h2>
                <div className="border border-gray-800 bg-black/40 rounded overflow-hidden">
                  <div className="h-[400px] overflow-y-auto p-4 space-y-4 font-mono text-[10px]">
                    {logs.map(log => (
                      <div key={log.id} className="border-l-2 border-gray-800 pl-3 py-1">
                        <div className="flex justify-between text-gray-600 mb-1">
                          <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                          <span className={log.status === 'success' ? 'text-green-900' : 'text-red-900'}>[{log.status}]</span>
                        </div>
                        <p className="text-gray-400 leading-relaxed">{log.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'social' || activeTab === 'ai') && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-in">
            {/* Sidebar with Job Select */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">SELECT SERVICE</h2>
              <div className="border border-gray-800 divide-y divide-gray-800 bg-black/20">
                {jobs.filter(j => activeTab === 'social' ? !['ai-content', 'ai-chat'].includes(j.type) : ['ai-content', 'ai-chat'].includes(j.type)).map(j => (
                  <button
                    key={j.id}
                    onClick={() => handleSelectJob(j)}
                    className={`w-full p-4 flex items-center gap-3 transition-colors text-left ${editingJob?.id === j.id ? 'bg-orange-950/20 border-l-2 border-orange-500' : 'hover:bg-gray-900/30'
                      }`}
                  >
                    <div className={j.status === 'enabled' ? 'text-green-500' : 'text-gray-700'}>
                      {JOB_TYPES.find(t => t.id === j.type)?.icon}
                    </div>
                    <div className="truncate">
                      <p className={`text-xs font-bold ${editingJob?.id === j.id ? 'text-white' : 'text-gray-400'}`}>{j.name}</p>
                      <p className="text-[9px] text-gray-600 font-mono tracking-tighter uppercase">{j.status}</p>
                    </div>
                  </button>
                ))}
                <div className="p-4">
                  <select
                    onChange={(e) => createJob(e.target.value)}
                    className="w-full bg-black border border-gray-800 text-[10px] p-2 text-gray-400 outline-none hover:border-gray-600 transition-colors"
                    value=""
                  >
                    <option value="" disabled>+ ADD NEW SERVICE</option>
                    {JOB_TYPES.filter(t => activeTab === 'social' ? !['ai-content', 'ai-chat'].includes(t.id) : ['ai-content', 'ai-chat'].includes(t.id)).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Config Form */}
            <div className="lg:col-span-3">
              {editingJob ? (
                <div className="border border-gray-800 p-8 space-y-8 bg-black/40">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        {JOB_TYPES.find(t => t.id === editingJob.type)?.icon}
                        CONFIGURE {editingJob.name.toUpperCase()}
                      </h2>
                      <div className="flex gap-2">
                        <button
                          onClick={() => runNow(editingJob.id)}
                          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold tracking-widest flex items-center gap-2 transition-all"
                        >
                          <FiPlay size={12} /> TRIGGER NOW
                        </button>
                        <button
                          onClick={() => toggleJobStatus(editingJob.id, editingJob.status)}
                          className="px-4 py-2 border border-gray-800 hover:border-white text-gray-400 text-[10px] font-bold tracking-widest transition-all"
                        >
                          {editingJob.status === 'enabled' ? 'PAUSE' : 'START'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left: Metadata */}
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Service Name</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-black border border-gray-800 px-4 py-3 text-sm focus:border-orange-500 transition-colors outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Chron Schedule (Linux Standard)</label>
                          <input
                            type="text"
                            value={formData.schedule}
                            onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                            className="w-full bg-black border border-gray-800 px-4 py-3 text-sm font-mono focus:border-blue-500 transition-colors outline-none"
                            placeholder="0 */6 * * *"
                          />
                        </div>

                        {/* Social Specifics */}
                        {activeTab === 'social' && (
                          <div className="space-y-6 pt-6 border-t border-gray-900">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <FiGlobe size={12} /> ACCOUNT HANDLE / ID
                              </label>
                              <input
                                type="text"
                                value={formData.config.handle || ''}
                                onChange={(e) => setFormData({ ...formData, config: { ...formData.config, handle: e.target.value } })}
                                className="w-full bg-black border border-gray-800 px-4 py-3 text-sm focus:border-blue-500 transition-colors outline-none"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2 text-amber-500/70">
                                <FiZap size={12} /> API ACCESS TOKEN
                              </label>
                              <input
                                type="password"
                                value={formData.config.api_token || ''}
                                onChange={(e) => setFormData({ ...formData, config: { ...formData.config, api_token: e.target.value } })}
                                className="w-full bg-black border border-gray-800 px-4 py-3 text-sm focus:border-amber-500 transition-colors outline-none"
                                placeholder="••••••••••••••••"
                              />
                            </div>
                          </div>
                        )}

                        {/* AI Specifics */}
                        {activeTab === 'ai' && (
                          <div className="space-y-6 pt-6 border-t border-gray-900">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <SiGoogle size={12} /> AI ENGINE / PROVIDER
                              </label>
                              <select
                                value={formData.config.ai_provider || 'claude'}
                                onChange={(e) => setFormData({ ...formData, config: { ...formData.config, ai_provider: e.target.value } })}
                                className="w-full bg-black border border-gray-800 px-4 py-3 text-sm focus:border-purple-500 transition-colors outline-none"
                              >
                                <option value="claude">Anthropic Claude 3.5 Sonnet</option>
                                <option value="gpt-4o">OpenAI GPT-4o Agent</option>
                                <option value="gemini">Google Gemini Pro</option>
                                <option value="grok-beta">xAI Grok-Beta (Twitter)</option>
                                <option value="kling">KlingAI (Video Generation)</option>
                                <option value="higgsfield">Higgsfield (Social Content)</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2 text-purple-500/70">
                                <FiCpu size={12} /> API KEY (Omit to use global vault)
                              </label>
                              <input
                                type="password"
                                value={formData.config.api_key || ''}
                                onChange={(e) => setFormData({ ...formData, config: { ...formData.config, api_key: e.target.value } })}
                                className="w-full bg-black border border-gray-800 px-4 py-3 text-sm focus:border-purple-500 transition-colors outline-none"
                                placeholder="••••••••••••••••"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Prompting & Instructions */}
                      <div className="space-y-6">
                        <div className="space-y-2 h-full flex flex-col">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Autonomous Agent Instructions (System Prompt)</label>
                          <textarea
                            value={formData.config.prompt || ''}
                            onChange={(e) => setFormData({ ...formData, config: { ...formData.config, prompt: e.target.value } })}
                            placeholder="You are an autonomous brand representative for b0ase. Focus on high-value engagement..."
                            className="flex-1 min-h-[250px] w-full bg-black border border-gray-800 px-4 py-4 text-sm focus:border-orange-500 transition-colors outline-none resize-none leading-relaxed"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <FiHash size={12} /> STATIC TAGS / FOOTER
                          </label>
                          <input
                            type="text"
                            value={formData.config.tags || ''}
                            onChange={(e) => setFormData({ ...formData, config: { ...formData.config, tags: e.target.value } })}
                            placeholder="#web3 #design #ai"
                            className="w-full bg-black border border-gray-800 px-4 py-3 text-sm focus:border-gray-500 transition-colors outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-12 flex justify-between items-center pt-8 border-t border-gray-800">
                      <div className="text-[10px] text-gray-700 font-mono">
                        UID: {editingJob.id} | UPDATED: {new Date(editingJob.updated_at).toLocaleString()}
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setEditingJob(null)}
                          className="px-6 py-2 border border-gray-800 text-gray-500 hover:text-white text-[10px] font-bold tracking-widest transition-colors"
                        >
                          CANCEL
                        </button>
                        <button
                          onClick={saveConfig}
                          disabled={isSaving}
                          className="px-8 py-3 bg-white text-black hover:bg-orange-500 hover:text-white text-[10px] font-bold tracking-widest transition-all disabled:opacity-50"
                        >
                          {isSaving ? 'PERSISTING...' : 'SAVE CONFIGURATION'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full border border-gray-800 border-dashed flex flex-col items-center justify-center p-12 text-gray-600">
                  <FiSettings size={48} className="mb-4 opacity-10" />
                  <p className="text-sm">Select a service from the left and initialize configuration</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'video' && (
          <div className="border border-gray-800 p-12 text-center animate-fade-in bg-black/40">
            <FiFilm size={48} className="mx-auto mb-6 text-gray-800" />
            <h2 className="text-xl font-bold mb-4 italic tracking-tighter">VIDEO PRODUCTION PIPELINE</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed mb-8">
              Automate the flow of raw media from the B0ase Studio into KlingAI or Higgsfield for professional post-production
              then auto-distribute to TikTok and Instagram Reels.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/studio"
                className="px-6 py-3 border border-gray-800 hover:border-orange-500 text-[10px] font-bold tracking-widest transition-all"
              >
                OPEN B0ASE STUDIO
              </Link>
              <button
                disabled
                className="px-6 py-3 bg-gray-900 text-gray-600 text-[10px] font-bold tracking-widest"
              >
                SETUP PIPELINE (BETA)
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl animate-fade-in space-y-8">
            <div className="border border-gray-800 p-8 space-y-6">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">GLOBAL PROJECT SECRETS</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-900 group">
                  <div>
                    <p className="text-xs font-bold font-mono">CLAUDE_API_KEY</p>
                    <p className="text-[10px] text-gray-600">Primary reasoning engine for this project</p>
                  </div>
                  <button className="text-[10px] px-3 py-1 border border-gray-800 group-hover:border-gray-600">CONFIGURE</button>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-900 group">
                  <div>
                    <p className="text-xs font-bold font-mono">GROK_API_KEY</p>
                    <p className="text-[10px] text-gray-600">Real-time Twitter data + Imagine credits</p>
                  </div>
                  <button className="text-[10px] px-3 py-1 border border-gray-800 group-hover:border-gray-600">CONFIGURE</button>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-900 group">
                  <div>
                    <p className="text-xs font-bold font-mono">KLING_SESSION_TOKEN</p>
                    <p className="text-[10px] text-gray-600">High-end video generation credits</p>
                  </div>
                  <button className="text-[10px] px-3 py-1 border border-gray-800 group-hover:border-gray-600">CONFIGURE</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
