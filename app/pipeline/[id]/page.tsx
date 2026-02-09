'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/components/Providers';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FiArrowLeft,
    FiCheck,
    FiClock,
    FiPlay,
    FiPause,
    FiAlertCircle,
    FiChevronRight,
} from 'react-icons/fi';

// Check if we're in demo mode
const isDemoMode = () => {
    return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://demo.supabase.co';
};

interface Stage {
    id: string;
    stage_name: string;
    stage_order: number;
    status: 'not_started' | 'in_progress' | 'blocked' | 'completed' | 'skipped';
    started_at: string | null;
    completed_at: string | null;
    agent_id: string | null;
    fundraising_rounds?: {
        status: string;
        target_amount: number;
        raised_amount: number;
    } | null;
}

interface Project {
    id: string;
    name: string;
}

// Demo data for local development
const DEMO_PROJECTS: Record<string, { name: string; stages: Stage[] }> = {
    'demo-saas-app': {
        name: 'My SaaS Application',
        stages: [
            { id: '1', stage_name: 'discovery', stage_order: 1, status: 'completed', started_at: '2025-12-01', completed_at: '2025-12-14', agent_id: null },
            { id: '2', stage_name: 'specification', stage_order: 2, status: 'completed', started_at: '2025-12-15', completed_at: '2025-12-28', agent_id: null },
            { id: '3', stage_name: 'design', stage_order: 3, status: 'completed', started_at: '2025-12-29', completed_at: '2026-01-05', agent_id: null },
            { id: '4', stage_name: 'development', stage_order: 4, status: 'in_progress', started_at: '2026-01-06', completed_at: null, agent_id: null, fundraising_rounds: { status: 'fully_funded', target_amount: 5000, raised_amount: 5000 } },
            { id: '5', stage_name: 'testing', stage_order: 5, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
            { id: '6', stage_name: 'deployment', stage_order: 6, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
            { id: '7', stage_name: 'post_launch', stage_order: 7, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
        ],
    },
    'demo-nft-marketplace': {
        name: 'NFT Marketplace',
        stages: [
            { id: '1', stage_name: 'discovery', stage_order: 1, status: 'completed', started_at: '2026-01-01', completed_at: '2026-01-10', agent_id: null },
            { id: '2', stage_name: 'specification', stage_order: 2, status: 'in_progress', started_at: '2026-01-11', completed_at: null, agent_id: null },
            { id: '3', stage_name: 'design', stage_order: 3, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
            { id: '4', stage_name: 'development', stage_order: 4, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
            { id: '5', stage_name: 'testing', stage_order: 5, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
            { id: '6', stage_name: 'deployment', stage_order: 6, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
            { id: '7', stage_name: 'post_launch', stage_order: 7, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
        ],
    },
    'demo-mobile-app': {
        name: 'Fitness Tracking App',
        stages: [
            { id: '1', stage_name: 'discovery', stage_order: 1, status: 'completed', started_at: '2025-10-01', completed_at: '2025-10-14', agent_id: null },
            { id: '2', stage_name: 'specification', stage_order: 2, status: 'completed', started_at: '2025-10-15', completed_at: '2025-10-28', agent_id: null },
            { id: '3', stage_name: 'design', stage_order: 3, status: 'completed', started_at: '2025-10-29', completed_at: '2025-11-10', agent_id: null },
            { id: '4', stage_name: 'development', stage_order: 4, status: 'completed', started_at: '2025-11-11', completed_at: '2025-12-20', agent_id: null },
            { id: '5', stage_name: 'testing', stage_order: 5, status: 'in_progress', started_at: '2025-12-21', completed_at: null, agent_id: null },
            { id: '6', stage_name: 'deployment', stage_order: 6, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
            { id: '7', stage_name: 'post_launch', stage_order: 7, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
        ],
    },
    'demo-ai-chatbot': {
        name: 'Customer Support AI',
        stages: [
            { id: '1', stage_name: 'discovery', stage_order: 1, status: 'in_progress', started_at: '2026-01-10', completed_at: null, agent_id: null },
            { id: '2', stage_name: 'specification', stage_order: 2, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
            { id: '3', stage_name: 'design', stage_order: 3, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
            { id: '4', stage_name: 'development', stage_order: 4, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
            { id: '5', stage_name: 'testing', stage_order: 5, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
            { id: '6', stage_name: 'deployment', stage_order: 6, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
            { id: '7', stage_name: 'post_launch', stage_order: 7, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
        ],
    },
};

const stageLabels: Record<string, string> = {
    discovery: 'Discovery',
    specification: 'Specification',
    design: 'Design',
    development: 'Development',
    testing: 'Testing',
    deployment: 'Deployment',
    post_launch: 'Post-Launch',
};

const stagePricing: Record<string, string> = {
    discovery: '£500-1,500',
    specification: '£1,000-3,000',
    design: '£800-2,500',
    development: '£5,000-50,000',
    testing: '£1,000-3,000',
    deployment: '£500-1,500',
    post_launch: '£300-1,000/mo',
};

export default function PipelineDashboard({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: projectId } = use(params);
    const { user } = useAuth();
    const router = useRouter();

    const [project, setProject] = useState<Project | null>(null);
    const [stages, setStages] = useState<Stage[]>([]);
    const [loading, setLoading] = useState(true);
    const [initializing, setInitializing] = useState(false);

    useEffect(() => {
        // In demo mode, skip auth check and load demo data
        if (isDemoMode()) {
            loadDemoData();
            return;
        }

        if (!user) {
            router.push('/signin?redirect=/pipeline');
            return;
        }
        loadProject();
        loadStages();
    }, [user, projectId, router]);

    const loadDemoData = () => {
        const demoProject = DEMO_PROJECTS[projectId];
        if (demoProject) {
            setProject({ id: projectId, name: demoProject.name });
            setStages(demoProject.stages);
        } else {
            // Unknown demo project - create generic stages
            setProject({ id: projectId, name: projectId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) });
            setStages([
                { id: '1', stage_name: 'discovery', stage_order: 1, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
                { id: '2', stage_name: 'specification', stage_order: 2, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
                { id: '3', stage_name: 'design', stage_order: 3, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
                { id: '4', stage_name: 'development', stage_order: 4, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
                { id: '5', stage_name: 'testing', stage_order: 5, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
                { id: '6', stage_name: 'deployment', stage_order: 6, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
                { id: '7', stage_name: 'post_launch', stage_order: 7, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
            ]);
        }
        setLoading(false);
    };

    const loadProject = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}`);
            if (response.ok) {
                const data = await response.json();
                setProject(data.project);
            }
        } catch (error) {
            console.error('Error loading project:', error);
        }
    };

    const loadStages = async () => {
        try {
            const response = await fetch(`/api/pipeline/${projectId}/stages`);
            if (response.ok) {
                const data = await response.json();
                setStages(data.stages || []);
            }
        } catch (error) {
            console.error('Error loading stages:', error);
        } finally {
            setLoading(false);
        }
    };

    const initializePipeline = async () => {
        if (isDemoMode()) {
            // In demo mode, just set up default stages
            setStages([
                { id: '1', stage_name: 'discovery', stage_order: 1, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
                { id: '2', stage_name: 'specification', stage_order: 2, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
                { id: '3', stage_name: 'design', stage_order: 3, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
                { id: '4', stage_name: 'development', stage_order: 4, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
                { id: '5', stage_name: 'testing', stage_order: 5, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
                { id: '6', stage_name: 'deployment', stage_order: 6, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
                { id: '7', stage_name: 'post_launch', stage_order: 7, status: 'not_started', started_at: null, completed_at: null, agent_id: null },
            ]);
            return;
        }

        setInitializing(true);
        try {
            const response = await fetch(`/api/pipeline/${projectId}/stages`, {
                method: 'POST',
            });
            if (response.ok) {
                loadStages();
            }
        } catch (error) {
            console.error('Error initializing pipeline:', error);
        } finally {
            setInitializing(false);
        }
    };

    const getStageIcon = (status: Stage['status']) => {
        switch (status) {
            case 'completed':
                return <FiCheck className="w-5 h-5 text-green-400" />;
            case 'in_progress':
                return <FiPlay className="w-5 h-5 text-blue-400" />;
            case 'blocked':
                return <FiAlertCircle className="w-5 h-5 text-red-400" />;
            case 'skipped':
                return <FiPause className="w-5 h-5 text-yellow-400" />;
            default:
                return <FiClock className="w-5 h-5 text-white/40" />;
        }
    };

    const getProgress = () => {
        const completed = stages.filter(s => s.status === 'completed').length;
        return Math.round((completed / stages.length) * 100);
    };

    const getCurrentStage = () => {
        return stages.find(s => s.status === 'in_progress') || stages.find(s => s.status === 'not_started');
    };

    if (loading || (!isDemoMode() && !user)) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <FiClock className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="px-4 md:px-8 py-16">
                {/* Header */}
                <Link
                    href="/pipeline"
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
                >
                    <FiArrowLeft />
                    <span>Back to Pipeline</span>
                </Link>

                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-2">
                            {project?.name || 'Project Pipeline'}
                        </h1>
                        <p className="text-white/60">
                            {stages.length > 0 ? `${getProgress()}% Complete` : 'Pipeline not initialized'}
                        </p>
                    </div>
                    {stages.length > 0 && (
                        <div className="text-right">
                            <p className="text-white/60 text-sm">Current Stage</p>
                            <p className="text-xl font-bold">
                                {stageLabels[getCurrentStage()?.stage_name || 'discovery']}
                            </p>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                {stages.length > 0 && (
                    <div className="mb-12">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                                style={{ width: `${getProgress()}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* No Pipeline State */}
                {stages.length === 0 && (
                    <div className="bg-white/5 border border-white/20 rounded-lg p-12 text-center">
                        <FiClock className="w-16 h-16 mx-auto text-white/20 mb-4" />
                        <h2 className="text-2xl font-bold mb-4">Initialize Your Pipeline</h2>
                        <p className="text-white/60 mb-8 max-w-md mx-auto">
                            Set up your project pipeline to track progress through Discovery, Development, and Deployment stages.
                        </p>
                        <button
                            onClick={initializePipeline}
                            disabled={initializing}
                            className="bg-white text-black px-8 py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-white/90 transition-colors disabled:opacity-50"
                        >
                            {initializing ? 'Initializing...' : 'Start Pipeline'}
                        </button>
                    </div>
                )}

                {/* Stages List */}
                {stages.length > 0 && (
                    <div className="space-y-4">
                        {stages.map((stage, index) => (
                            <Link
                                key={stage.id}
                                href={`/pipeline/${projectId}/${stage.stage_name}`}
                                className={`block bg-white/5 border rounded-lg p-6 transition-all hover:bg-white/10 ${stage.status === 'in_progress'
                                    ? 'border-blue-500/50'
                                    : stage.status === 'completed'
                                        ? 'border-green-500/30'
                                        : 'border-white/20'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-12 h-12 rounded-lg flex items-center justify-center ${stage.status === 'completed'
                                                ? 'bg-green-500/20'
                                                : stage.status === 'in_progress'
                                                    ? 'bg-blue-500/20'
                                                    : 'bg-white/10'
                                                }`}
                                        >
                                            {getStageIcon(stage.status)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white/40 text-sm font-mono">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                                <h3 className="font-bold text-lg">
                                                    {stageLabels[stage.stage_name]}
                                                </h3>
                                            </div>
                                            <p className="text-white/60 text-sm">
                                                {stagePricing[stage.stage_name]} •{' '}
                                                <span className="capitalize">{stage.status.replace('_', ' ')}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {stage.fundraising_rounds && (
                                            <div className="hidden md:block text-right">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${stage.fundraising_rounds.status === 'fully_funded' ? 'bg-green-500/20 text-green-400' :
                                                    stage.fundraising_rounds.status === 'open' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-white/10 text-white/40'
                                                    }`}>
                                                    {stage.fundraising_rounds.status === 'fully_funded' ? 'Funded' : 'Fundraising'}
                                                </span>
                                            </div>
                                        )}
                                        <FiChevronRight className="w-6 h-6 text-white/40" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
