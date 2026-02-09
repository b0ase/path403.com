'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
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
    FiArrowLeft,
    FiCpu
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

interface Project {
    id: string;
    name: string;
    category: string | null;
    owner_user_id: string;
}

export default function UserAutomationsPage() {
    const router = useRouter();
    const supabase = createClient();

    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState<AutomationJob[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'enabled' | 'disabled'>('all');

    useEffect(() => {
        const getUser = async () => {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                fetchData(session.user.id);
            } else {
                router.push('/login?redirectedFrom=' + encodeURIComponent('/user/account/automations'));
            }
            setLoading(false);
        };
        getUser();
    }, [supabase, router]);

    const fetchData = async (userId: string) => {
        setIsLoading(true);
        try {
            // 1. Fetch projects owned by user
            const { data: projectsData, error: projectsError } = await supabase
                .from('projects')
                .select('id, name, category, owner_user_id')
                .eq('owner_user_id', userId);

            if (projectsError) throw projectsError;
            setProjects(projectsData || []);

            const projectIds = projectsData?.map(p => p.id) || [];

            if (projectIds.length > 0) {
                // 2. Fetch automation jobs for these projects
                const { data: jobsData, error: jobsError } = await supabase
                    .schema('automations')
                    .from('jobs')
                    .select('*')
                    .in('project_id', projectIds);

                if (!jobsError && jobsData) {
                    setJobs(jobsData);
                }
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const projectGroups = projects.map(project => {
        const projectJobs = jobs.filter(j => j.project_id === project.id);
        return {
            project,
            jobs: projectJobs,
            activeCount: projectJobs.filter(j => j.status === 'enabled').length,
            errorCount: projectJobs.reduce((sum, j) => sum + (j.error_count || 0), 0)
        };
    });

    const filteredProjects = projectGroups.filter(group => {
        const matchesSearch = group.project.name.toLowerCase().includes(searchQuery.toLowerCase());

        if (filterStatus === 'enabled') return matchesSearch && group.activeCount > 0;
        if (filterStatus === 'disabled') return matchesSearch && group.activeCount === 0;

        return matchesSearch;
    });

    const stats = {
        totalProjects: projects.length,
        activeProjects: projectGroups.filter(g => g.activeCount > 0).length,
        totalJobs: jobs.length,
        errored: jobs.filter(j => j.error_count > 0).length,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white font-mono text-sm uppercase tracking-widest">Loading Automations...</div>
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
                            href="/user/account"
                            className="text-gray-500 hover:text-white transition-colors"
                        >
                            <FiArrowLeft size={20} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <FiZap className="text-orange-500" size={24} />
                                <h1 className="text-2xl font-bold uppercase">Automations</h1>
                            </div>
                            <p className="text-sm text-gray-500">Autonomous agents & scheduled tasks for your projects</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="border border-gray-900 p-4">
                            <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Total Projects</p>
                        </div>
                        <div className="border border-green-900/30 p-4 bg-green-950/5">
                            <p className="text-2xl font-bold text-green-500">{stats.activeProjects}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Active Projects</p>
                        </div>
                        <div className="border border-gray-900 p-4">
                            <p className="text-2xl font-bold text-gray-400">{stats.totalJobs}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Active Jobs</p>
                        </div>
                        <div className="border border-red-900/30 p-4 bg-red-950/5">
                            <p className="text-2xl font-bold text-red-500">{stats.errored}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">System Errors</p>
                        </div>
                    </div>
                </header>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <div className="relative flex-1 min-w-[200px]">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search your projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black border border-gray-800 rounded px-10 py-2.5 text-sm focus:border-white focus:outline-none transition-colors"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="bg-black border border-gray-800 rounded px-4 py-2 text-sm focus:border-white focus:outline-none appearance-none cursor-pointer"
                    >
                        <option value="all">ALL STATUS</option>
                        <option value="enabled">ACTIVE ONLY</option>
                        <option value="disabled">INACTIVE ONLY</option>
                    </select>
                    <button
                        onClick={() => user && fetchData(user.id)}
                        className="flex items-center gap-2 px-6 py-2 border border-gray-800 hover:border-white transition-colors text-sm font-bold"
                    >
                        <FiRefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                        REFRESH
                    </button>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProjects.map((group) => (
                        <Link
                            key={group.project.id}
                            href={`/user/account/automations/${group.project.id}`}
                            className="group border border-gray-900 hover:border-orange-500/50 transition-all duration-300 bg-gray-950/50 backdrop-blur-sm overflow-hidden flex flex-col"
                        >
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg group-hover:text-orange-500 transition-colors">
                                            {group.project.name.toUpperCase()}
                                        </h3>
                                        <p className="text-[10px] text-gray-500 font-mono tracking-widest mt-1">
                                            {group.project.category || 'GENERAL PROJECT'}
                                        </p>
                                    </div>
                                    <div className="flex h-8 w-8 items-center justify-center bg-gray-900 border border-gray-800 group-hover:border-orange-500 transition-colors">
                                        <FiChevronRight className="text-gray-500 group-hover:text-white" />
                                    </div>
                                </div>

                                <div className="h-px bg-gradient-to-r from-gray-800 to-transparent w-full mb-6" />

                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">PLATFORMS</p>
                                        <div className="flex items-center gap-2">
                                            <FiTwitter className={group.jobs.some(j => j.type === 'twitter') ? 'text-blue-400' : 'text-gray-800'} size={14} />
                                            <FiCpu className={group.jobs.some(j => j.type === 'ai_chat') ? 'text-purple-400' : 'text-gray-800'} size={14} />
                                            <span className="text-xs font-bold">{group.jobs.length} JOBS</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">STATUS</p>
                                        <div className="flex items-center justify-end gap-2">
                                            <span className={`text-[10px] font-bold ${group.activeCount > 0 ? 'text-green-500' : 'text-gray-600'}`}>
                                                {group.activeCount > 0 ? 'RUNNING' : 'STANDBY'}
                                            </span>
                                            {group.activeCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                                        </div>
                                    </div>
                                </div>

                                {group.errorCount > 0 && (
                                    <div className="mt-auto flex items-center gap-2 text-[10px] text-red-500 bg-red-500/5 p-2 border border-red-500/20">
                                        <FiAlertCircle size={12} />
                                        {group.errorCount} SYSTEM ERRORS DETECTED
                                    </div>
                                )}
                            </div>

                            <div className="px-6 py-3 border-t border-gray-900 bg-black/40 text-[9px] text-gray-600 flex justify-between items-center group-hover:bg-orange-500/5 transition-colors">
                                <span className="font-mono">ID: {group.project.id.split('-')[0]}...</span>
                                <span className="font-bold tracking-widest text-gray-500 group-hover:text-white">CONFIGURE →</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {filteredProjects.length === 0 && !isLoading && (
                    <div className="border border-gray-900 border-dashed p-20 text-center text-gray-500">
                        <FiCpu className="mx-auto mb-4 opacity-10" size={64} />
                        <p className="uppercase tracking-[0.3em] font-bold text-xs">No project automations found</p>
                        <p className="text-[10px] mt-4 max-w-xs mx-auto text-gray-600">
                            CREATE A PROJECT IN THE DASHBOARD AND LINK YOUR SOCIAL ACCOUNTS TO START AUTOMATING.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
