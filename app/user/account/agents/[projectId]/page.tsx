'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
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
    { id: 'shannon', name: 'Shannon Security Agent', icon: <FiCheckCircle className="text-green-500" /> },
];

type TabId = 'overview' | 'social' | 'ai' | 'video' | 'security' | 'settings';

interface Project {
    id: string;
    name: string;
    category: string | null;
    owner_user_id: string;
}

interface LogEntry {
    id: string;
    status: string;
    message: string | null;
    created_at: string;
    duration_ms: number | null;
}

export default function UserProjectAutomationPage() {
    const router = useRouter();
    const params = useParams();
    const projectId = params.projectId as string;
    const supabase = createClient();

    const [user, setUser] = useState<any | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [jobs, setJobs] = useState<AutomationJob[]>([]);
    const [project, setProject] = useState<Project | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [editingJob, setEditingJob] = useState<AutomationJob | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        type: 'twitter',
        schedule: '0 */6 * * *',
        config: {} as Record<string, any>
    });

    useEffect(() => {
        const checkAuth = async () => {
            setAuthLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                fetchProjectAndData(session.user.id);
            } else {
                router.push('/login');
            }
            setAuthLoading(false);
        };
        checkAuth();
    }, [supabase, router, projectId]);

    const fetchProjectAndData = async (userId: string) => {
        setIsLoading(true);
        try {
            // 1. Fetch project and verify ownership
            const { data: projectData, error: projectError } = await supabase
                .from('projects')
                .select('id, name, category, owner_user_id')
                .eq('id', projectId)
                .single();

            if (projectError || !projectData) {
                console.error('Project not found or error:', projectError);
                router.push('/user/account/automations');
                return;
            }

            // Check ownership (in production this should also check project_members)
            if (projectData.owner_user_id !== userId) {
                const { data: memberData } = await supabase
                    .from('project_members')
                    .select('id')
                    .eq('project_id', projectId)
                    .eq('user_id', userId)
                    .single();

                if (!memberData) {
                    router.push('/user/account/automations');
                    return;
                }
            }

            setProject(projectData);

            // 2. Fetch jobs
            const { data: jobsData } = await supabase
                .schema('automations')
                .from('jobs')
                .select('*')
                .eq('project_id', projectId)
                .order('created_at', { ascending: true });

            if (jobsData) {
                setJobs(jobsData);
                if (jobsData.length > 0 && !editingJob) {
                    handleSelectJob(jobsData[0]);
                }
            }

            // 3. Fetch logs
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
            if (editingJob?.id === jobId) setEditingJob({ ...editingJob, status: newStatus });
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
            const updatedJob = { ...editingJob, ...formData };
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
                message: 'Manual run triggered from user dashboard',
            });
        if (!error) fetchProjectAndData(user.id);
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

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white font-mono text-sm uppercase tracking-widest">Initialising Secure Access...</div>
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
                            href="/user/account/agents"
                            className="text-gray-500 hover:text-white transition-colors"
                        >
                            <FiArrowLeft size={20} />
                        </Link>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <FiCpu className="text-purple-500" size={24} />
                                <h1 className="text-2xl font-bold uppercase">{project?.name || 'PROJECT HUB'}</h1>
                                <span className="px-2 py-0.5 text-[10px] bg-green-900/20 text-green-500 border border-green-500/20 rounded-sm uppercase font-bold tracking-[0.2em]">
                                    {project?.category || 'PERSONAL'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 uppercase tracking-wide">Manage your specialized agents, services, and chron jobs</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex border border-gray-900 rounded-sm overflow-hidden">
                                {(['overview', 'social', 'ai', 'video', 'security', 'settings'] as TabId[]).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${activeTab === tab ? 'bg-white text-black' : 'bg-black text-gray-500 hover:text-white hover:bg-gray-950'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="h-px bg-gray-900 w-full mb-8" />
                </header>

                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Project Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="border border-gray-900 p-6 bg-gray-950/20">
                                <p className="text-[10px] text-gray-600 mb-2 uppercase tracking-widest font-bold">Active Services</p>
                                <div className="flex items-end gap-2">
                                    <p className="text-3xl font-bold">{jobs.filter(j => j.status === 'enabled').length}</p>
                                    <p className="text-xs text-gray-700 mb-1">/ {jobs.length} TOTAL</p>
                                </div>
                            </div>
                            <div className="border border-gray-900 p-6 bg-gray-950/20">
                                <p className="text-[10px] text-gray-600 mb-2 uppercase tracking-widest font-bold">Total Operations</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-3xl font-bold">{jobs.reduce((sum, j) => sum + j.run_count, 0)}</p>
                                    <FiCheckCircle className="text-green-900" size={20} />
                                </div>
                            </div>
                            <div className="border border-red-900/20 p-6 bg-red-950/5">
                                <p className="text-[10px] text-red-900/70 mb-2 uppercase tracking-widest font-bold">Service Alerts</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-3xl font-bold text-red-500">{jobs.reduce((sum, j) => sum + j.error_count, 0)}</p>
                                    <FiAlertCircle className="text-red-900" size={20} />
                                </div>
                            </div>
                            <div className="border border-gray-900 p-6 bg-gray-950/20">
                                <p className="text-[10px] text-gray-600 mb-2 uppercase tracking-widest font-bold">System Status</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-3xl font-bold text-blue-500">OPTIMAL</p>
                                    <FiZap className="text-blue-900" size={20} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Jobs Status List */}
                            <div className="lg:col-span-2 space-y-4">
                                <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                    <FiList size={14} /> CONFIGURED CHRON SERVICES
                                </h2>
                                <div className="border border-gray-900 bg-gray-950/30 divide-y divide-gray-900">
                                    {jobs.map(j => (
                                        <div key={j.id} className="p-5 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2.5 border ${j.status === 'enabled' ? 'border-green-500/20 bg-green-500/5 text-green-500' : 'border-gray-800 bg-gray-900 text-gray-600'}`}>
                                                    {JOB_TYPES.find(t => t.id === j.type)?.icon || <FiSettings />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm tracking-wide">{j.name.toUpperCase()}</p>
                                                    <p className="text-[9px] text-gray-500 font-mono tracking-widest mt-1">
                                                        SCHEDULE: {j.schedule} | RUNS: {j.run_count} | ERRORS: {j.error_count}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => toggleJobStatus(j.id, j.status)}
                                                    className={`p-2 transition-all ${j.status === 'enabled' ? 'text-green-500 hover:text-amber-500' : 'text-gray-600 hover:text-green-500'}`}
                                                >
                                                    {j.status === 'enabled' ? <FiPause size={20} /> : <FiPlay size={20} />}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleSelectJob(j);
                                                        setActiveTab(j.type === 'shannon' ? 'security' : (j.type === 'ai-content' || j.type === 'ai-chat' ? 'ai' : 'social'));
                                                    }}
                                                    className="p-2 text-gray-600 hover:text-white transition-colors"
                                                >
                                                    <FiSettings size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {jobs.length === 0 && (
                                        <div className="p-12 text-center text-gray-600 italic text-sm">No services configured yet for this project.</div>
                                    )}
                                </div>
                            </div>

                            {/* Realtime Stream */}
                            <div className="space-y-4">
                                <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                    <FiRefreshCw size={14} /> ACTIVITY STREAM
                                </h2>
                                <div className="border border-gray-900 bg-black/40 rounded-sm overflow-hidden">
                                    <div className="h-[438px] overflow-y-auto p-4 space-y-4 font-mono text-[9px] scrollbar-thin scrollbar-thumb-gray-800">
                                        {logs.map(log => (
                                            <div key={log.id} className="border-l border-gray-800 pl-4 py-1 relative">
                                                <div className="absolute left-[-1px] top-2 w-[2px] h-2 bg-gray-700" />
                                                <div className="flex justify-between text-gray-600 mb-1">
                                                    <span className="font-bold tracking-tighter">{new Date(log.created_at).toLocaleTimeString()}</span>
                                                    <span className={`${log.status === 'success' ? 'text-green-900' : (log.status === 'manual_trigger' ? 'text-blue-900' : 'text-red-900')} font-bold uppercase`}>
                                                        {log.status}
                                                    </span>
                                                </div>
                                                <p className="text-gray-500 leading-relaxed">{log.message?.toUpperCase()}</p>
                                            </div>
                                        ))}
                                        {logs.length === 0 && (
                                            <div className="text-gray-700 text-center pt-8">NO RECENT ACTIVITY DETECTED</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {(activeTab === 'social' || activeTab === 'ai' || activeTab === 'security') && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-in">
                        {/* Sidebar with Job Select */}
                        <div className="lg:col-span-1 space-y-4">
                            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-4">SELECT SERVICE</h2>
                            <div className="border border-gray-900 divide-y divide-gray-900 bg-gray-950/20">
                                {jobs.filter(j => activeTab === 'security' ? j.type === 'shannon' : (activeTab === 'ai' ? ['ai-content', 'ai-chat'].includes(j.type) : !['ai-content', 'ai-chat', 'shannon'].includes(j.type))).map(j => (
                                    <button
                                        key={j.id}
                                        onClick={() => handleSelectJob(j)}
                                        className={`w-full p-5 flex items-center gap-4 transition-all text-left group ${editingJob?.id === j.id ? 'bg-white border-l-4 border-orange-500' : 'hover:bg-white/[0.03]'}`}
                                    >
                                        <div className={`${j.status === 'enabled' ? 'text-green-500' : 'text-gray-700'} ${editingJob?.id === j.id ? 'text-black' : ''}`}>
                                            {JOB_TYPES.find(t => t.id === j.type)?.icon}
                                        </div>
                                        <div className="truncate">
                                            <p className={`text-xs font-bold tracking-widest ${editingJob?.id === j.id ? 'text-black' : 'text-gray-400'} group-hover:text-white transition-colors`}>
                                                {j.name.toUpperCase()}
                                            </p>
                                            <p className={`text-[8px] font-mono tracking-widest uppercase mt-0.5 ${editingJob?.id === j.id ? 'text-gray-500' : 'text-gray-700'}`}>
                                                {j.status}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                                <div className="p-4 border-t border-gray-900">
                                    <select
                                        onChange={(e) => createJob(e.target.value)}
                                        className="w-full bg-black border border-gray-800 text-[9px] font-bold tracking-widest p-3 text-gray-500 outline-none hover:border-gray-500 hover:text-white transition-all appearance-none text-center cursor-pointer"
                                        value=""
                                    >
                                        <option value="" disabled>+ ADD NEW SERVICE</option>
                                        {JOB_TYPES.filter(t => activeTab === 'security' ? t.id === 'shannon' : (activeTab === 'ai' ? ['ai-content', 'ai-chat'].includes(t.id) : !['ai-content', 'ai-chat', 'shannon'].includes(t.id))).map(t => (
                                            <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Config Form */}
                        <div className="lg:col-span-3">
                            {editingJob ? (
                                <div className="border border-gray-900 p-10 space-y-10 bg-gray-950/20 relative">
                                    <div className="absolute top-0 right-0 p-4">
                                        <span className="text-[8px] text-gray-800 font-mono">UID: {editingJob.id}</span>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-start mb-10 pb-6 border-b border-gray-900">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-gray-900 border border-gray-800">
                                                    {JOB_TYPES.find(t => t.id === editingJob.type)?.icon}
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold tracking-[0.2em]">
                                                        CONFIGURE {editingJob.name.toUpperCase()}
                                                    </h2>
                                                    <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-widest">Global configuration for {editingJob.type} automation</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => runNow(editingJob.id)}
                                                    className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-[9px] font-bold tracking-[0.3em] flex items-center gap-2 transition-all shadow-lg shadow-orange-950/20"
                                                >
                                                    <FiPlay size={12} /> TRIGGER NOW
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            {/* Left: Metadata */}
                                            <div className="space-y-8">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em]">Friendly Job Name</label>
                                                    <input
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full bg-black border border-gray-800 px-5 py-3.5 text-xs font-bold tracking-widest focus:border-white transition-all outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em]">Execution Schedule (Cron)</label>
                                                    <input
                                                        type="text"
                                                        value={formData.schedule}
                                                        onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                                                        className="w-full bg-black border border-gray-800 px-5 py-3.5 text-xs font-mono tracking-widest focus:border-blue-500 transition-all outline-none"
                                                        placeholder="0 */6 * * *"
                                                    />
                                                    <p className="text-[9px] text-gray-700 italic">Example: 0 */6 * * * = Every 6 hours</p>
                                                </div>

                                                {/* Social Specifics */}
                                                {activeTab === 'social' && (
                                                    <div className="space-y-8 pt-8 border-t border-gray-900">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                                                <FiGlobe size={12} /> ACCOUNT HANDLE / IDENTIFIER
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formData.config.handle || ''}
                                                                placeholder="@YOUR_HANDLE"
                                                                onChange={(e) => setFormData({ ...formData, config: { ...formData.config, handle: e.target.value } })}
                                                                className="w-full bg-black border border-gray-800 px-5 py-3.5 text-xs tracking-widest focus:border-blue-500 transition-all outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                                                <FiZap size={12} className="text-amber-500" /> API ACCESS TOKEN
                                                            </label>
                                                            <input
                                                                type="password"
                                                                value={formData.config.api_token || ''}
                                                                onChange={(e) => setFormData({ ...formData, config: { ...formData.config, api_token: e.target.value } })}
                                                                className="w-full bg-black border border-gray-800 px-5 py-3.5 text-xs focus:border-amber-500 transition-all outline-none"
                                                                placeholder="••••••••••••••••"
                                                            />
                                                            <p className="text-[9px] text-gray-700 italic">Credentials are encrypted and stored in our secure vault.</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* AI Specifics */}
                                                {activeTab === 'ai' && (
                                                    <div className="space-y-8 pt-8 border-t border-gray-900">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                                                <SiGoogle size={12} className="text-purple-500" /> AI INTELLIGENCE ENGINE
                                                            </label>
                                                            <select
                                                                value={formData.config.ai_provider || 'claude'}
                                                                onChange={(e) => setFormData({ ...formData, config: { ...formData.config, ai_provider: e.target.value } })}
                                                                className="w-full bg-black border border-gray-800 px-5 py-3.5 text-xs font-bold tracking-widest focus:border-purple-500 transition-all outline-none appearance-none cursor-pointer"
                                                            >
                                                                <option value="claude">ANTHROPIC CLAUDE 3.5 SONNET</option>
                                                                <option value="gpt-4o">OPENAI GPT-4o AGENT</option>
                                                                <option value="gemini">GOOGLE GEMINI PRO</option>
                                                                <option value="grok-beta">XAI GROK-BETA</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                                                <FiCpu size={12} className="text-purple-500" /> DEDICATED API KEY
                                                            </label>
                                                            <input
                                                                type="password"
                                                                value={formData.config.api_key || ''}
                                                                onChange={(e) => setFormData({ ...formData, config: { ...formData.config, api_key: e.target.value } })}
                                                                className="w-full bg-black border border-gray-800 px-5 py-3.5 text-xs focus:border-purple-500 transition-all outline-none"
                                                                placeholder="LEAVE EMPTY TO USE SYSTEM CREDITS"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Security Specifics */}
                                                {activeTab === 'security' && (
                                                    <div className="space-y-8 pt-8 border-t border-gray-900">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                                                <FiGlobe size={12} className="text-green-500" /> TARGET ASSET URL
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formData.config.target_url || ''}
                                                                onChange={(e) => setFormData({ ...formData, config: { ...formData.config, target_url: e.target.value } })}
                                                                placeholder="https://app.example.com"
                                                                className="w-full bg-black border border-gray-800 px-5 py-3.5 text-xs font-bold tracking-widest focus:border-green-500 transition-all outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                                                <FiCheckCircle size={12} className="text-green-500" /> SCAN INTENSITY
                                                            </label>
                                                            <select
                                                                value={formData.config.scan_intensity || 'standard'}
                                                                onChange={(e) => setFormData({ ...formData, config: { ...formData.config, scan_intensity: e.target.value } })}
                                                                className="w-full bg-black border border-gray-800 px-5 py-3.5 text-xs font-bold tracking-widest focus:border-green-500 transition-all outline-none appearance-none cursor-pointer"
                                                            >
                                                                <option value="quick">QUICK RECONNAISSANCE</option>
                                                                <option value="standard">STANDARD VULNERABILITY SCAN</option>
                                                                <option value="deep">DEEP PACKET INSPECTION (SLOW)</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right: Prompting & Instructions */}
                                            <div className="space-y-8 flex flex-col">
                                                <div className="space-y-2 flex-1 flex flex-col">
                                                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em]">AUTONOMOUS SYSTEM PROMPT</label>
                                                    <textarea
                                                        value={formData.config.prompt || ''}
                                                        onChange={(e) => setFormData({ ...formData, config: { ...formData.config, prompt: e.target.value } })}
                                                        placeholder="DEFINE YOUR AGENT'S PERSONALITY AND CORE MISSION HERE..."
                                                        className="flex-1 min-h-[300px] w-full bg-black border border-gray-800 px-5 py-5 text-sm focus:border-white transition-all outline-none resize-none leading-relaxed font-sans"
                                                    />
                                                    <p className="text-[9px] text-gray-700 italic mt-2">Maximum token limit applies based on provider.</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                                        <FiHash size={12} /> GLOBAL TAGS / SIGNATURE
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.config.tags || ''}
                                                        onChange={(e) => setFormData({ ...formData, config: { ...formData.config, tags: e.target.value } })}
                                                        placeholder="#WEB3 #DESIGN #AUTONOMOUS"
                                                        className="w-full bg-black border border-gray-800 px-5 py-3.5 text-xs focus:border-gray-500 transition-all outline-none tracking-widest"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-16 flex justify-between items-center pt-10 border-t border-gray-900">
                                            <button
                                                onClick={() => toggleJobStatus(editingJob.id, editingJob.status)}
                                                className={`px-6 py-3 border font-bold text-[10px] tracking-[0.2em] transition-all ${editingJob.status === 'enabled' ? 'border-red-900/50 text-red-500 hover:bg-red-950/20' : 'border-green-900/50 text-green-500 hover:bg-green-950/20'}`}
                                            >
                                                {editingJob.status === 'enabled' ? 'DEACTIVATE SERVICE' : 'ACTIVATE SERVICE'}
                                            </button>

                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => setEditingJob(null)}
                                                    className="px-8 py-3 border border-gray-800 text-gray-600 hover:text-white text-[10px] font-bold tracking-[0.2em] transition-all"
                                                >
                                                    CANCEL
                                                </button>
                                                <button
                                                    onClick={saveConfig}
                                                    disabled={isSaving}
                                                    className="px-10 py-3 bg-white text-black hover:bg-orange-500 hover:text-white text-[10px] font-bold tracking-[0.3em] transition-all disabled:opacity-50"
                                                >
                                                    {isSaving ? 'SYNCHRONISING...' : 'SAVE SETTINGS'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full border border-gray-900 border-dashed flex flex-col items-center justify-center p-20 text-gray-700 bg-gray-950/10">
                                    <FiSettings size={64} className="mb-6 opacity-5" />
                                    <p className="text-[10px] font-bold tracking-[0.5em] uppercase">Select a service to configure</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'video' && (
                    <div className="border border-gray-900 p-20 text-center animate-fade-in bg-gray-950/20 rounded-sm">
                        <FiFilm size={64} className="mx-auto mb-8 text-gray-900" />
                        <h2 className="text-2xl font-bold mb-6 tracking-tighter uppercase">Video Content Pipeline</h2>
                        <p className="text-gray-500 text-sm max-w-2xl mx-auto leading-relaxed mb-10 uppercase tracking-widest text-[11px]">
                            BRIDGE YOUR B0ASE STUDIO SESSIONS WITH KLINGAI AND HIGGSFIELD.
                            AUTOMATE THE POST-PRODUCTION AND DISTRIBUTION OF YOUR VIDEO ASSETS ACROSS TIKTOK AND REELS.
                        </p>
                        <div className="flex justify-center gap-6">
                            <Link
                                href="/studio"
                                className="px-8 py-4 border border-gray-800 hover:border-white text-[10px] font-bold tracking-[0.3em] transition-all inline-block"
                            >
                                ACCESS B0ASE STUDIO
                            </Link>
                            <button
                                disabled
                                className="px-8 py-4 bg-gray-900 text-gray-700 text-[10px] font-bold tracking-[0.3em] cursor-not-allowed"
                            >
                                INITIALISE PIPELINE (BETA)
                            </button>
                        </div>
                    </div>
                )}

                {/* Settings and other tabs omitted for brevity similar to admin but themed */}
                {activeTab === 'settings' && (
                    <div className="max-w-2xl animate-fade-in space-y-8">
                        <div className="border border-gray-900 p-10 space-y-8 bg-gray-950/20">
                            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mb-4">Secure Project Vault</h2>
                            <p className="text-[10px] text-gray-600 uppercase tracking-widest leading-relaxed">
                                STORE YOUR GLOBAL API KEYS HERE. THESE CREDENTIALS CAN BE SHARED ACROSS ALL SERVICES IN THIS PROJECT TO STREAMLINE CONFIGURATION.
                            </p>
                            <div className="space-y-4 pt-4">
                                {['CLAUDE_API_KEY', 'GROK_API_KEY', 'KLING_SESSION_TOKEN'].map(secret => (
                                    <div key={secret} className="flex items-center justify-between p-5 border border-gray-900 bg-black group hover:border-gray-700 transition-colors">
                                        <div>
                                            <p className="text-[11px] font-bold font-mono tracking-widest">{secret}</p>
                                            <p className="text-[9px] text-gray-600 uppercase mt-1">Status: UNCONFIGURED</p>
                                        </div>
                                        <button className="text-[9px] font-bold tracking-widest px-4 py-2 border border-gray-800 hover:border-white transition-all">CONFIGURE</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
