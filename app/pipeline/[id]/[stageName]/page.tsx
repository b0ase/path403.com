'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/components/Providers';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FiArrowLeft,
    FiCheck,
    FiSquare,
    FiPlus,
    FiTrash2,
    FiPlay,
    FiCpu,
    FiMessageSquare,
} from 'react-icons/fi';
import StageAgentChat from '@/components/pipeline/StageAgentChat';

// Check if we're in demo mode
const isDemoMode = () => {
    return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://demo.supabase.co';
};

interface Task {
    id: string;
    task_name: string;
    task_description: string | null;
    task_order: number;
    is_required: boolean;
    is_completed: boolean;
    completed_at: string | null;
}

interface Stage {
    id: string;
    stage_name: string;
    stage_order: number;
    status: string;
    agent_id: string | null;
    started_at: string | null;
    completed_at: string | null;
    tasks: Task[];
}

interface Project {
    id: string;
    name: string;
}

// Demo tasks for each stage
const DEMO_TASKS: Record<string, Task[]> = {
    discovery: [
        { id: '1', task_name: 'Complete project questionnaire', task_description: '30 questions about your project', task_order: 1, is_required: true, is_completed: true, completed_at: '2026-01-05' },
        { id: '2', task_name: 'Market research review', task_description: 'Agent-generated market analysis', task_order: 2, is_required: true, is_completed: true, completed_at: '2026-01-06' },
        { id: '3', task_name: 'Competitive analysis', task_description: 'Review competitor landscape', task_order: 3, is_required: true, is_completed: false, completed_at: null },
        { id: '4', task_name: 'Technical feasibility assessment', task_description: null, task_order: 4, is_required: true, is_completed: false, completed_at: null },
        { id: '5', task_name: 'Budget and timeline estimation', task_description: null, task_order: 5, is_required: true, is_completed: false, completed_at: null },
        { id: '6', task_name: 'Risk identification', task_description: null, task_order: 6, is_required: false, is_completed: false, completed_at: null },
        { id: '7', task_name: 'Go/No-Go decision meeting', task_description: null, task_order: 7, is_required: true, is_completed: false, completed_at: null },
    ],
    specification: [
        { id: '1', task_name: 'User story mapping', task_description: 'Define all user stories', task_order: 1, is_required: true, is_completed: true, completed_at: '2026-01-10' },
        { id: '2', task_name: 'Feature prioritization (MoSCoW)', task_description: null, task_order: 2, is_required: true, is_completed: true, completed_at: '2026-01-11' },
        { id: '3', task_name: 'Technical requirements documentation', task_description: null, task_order: 3, is_required: true, is_completed: false, completed_at: null },
        { id: '4', task_name: 'API & integration specifications', task_description: null, task_order: 4, is_required: true, is_completed: false, completed_at: null },
        { id: '5', task_name: 'Data model design', task_description: 'ER diagrams and schema', task_order: 5, is_required: true, is_completed: false, completed_at: null },
        { id: '6', task_name: 'Security requirements definition', task_description: null, task_order: 6, is_required: true, is_completed: false, completed_at: null },
        { id: '7', task_name: 'Module selection from b0ase catalog', task_description: null, task_order: 7, is_required: false, is_completed: false, completed_at: null },
        { id: '8', task_name: 'Final pricing agreement', task_description: null, task_order: 8, is_required: true, is_completed: false, completed_at: null },
    ],
    design: [
        { id: '1', task_name: 'Wireframe creation', task_description: 'All key screens', task_order: 1, is_required: true, is_completed: false, completed_at: null },
        { id: '2', task_name: 'High-fidelity mockups', task_description: '10-20 screens', task_order: 2, is_required: true, is_completed: false, completed_at: null },
        { id: '3', task_name: 'Brand style guide creation', task_description: 'Colors, fonts, logos', task_order: 3, is_required: true, is_completed: false, completed_at: null },
        { id: '4', task_name: 'Component library design', task_description: null, task_order: 4, is_required: true, is_completed: false, completed_at: null },
        { id: '5', task_name: 'User flow diagrams', task_description: null, task_order: 5, is_required: false, is_completed: false, completed_at: null },
        { id: '6', task_name: 'Design review & iterations', task_description: null, task_order: 6, is_required: true, is_completed: false, completed_at: null },
    ],
    development: [
        { id: '1', task_name: 'Development environment setup', task_description: null, task_order: 1, is_required: true, is_completed: true, completed_at: '2026-01-06' },
        { id: '2', task_name: 'Database schema implementation', task_description: null, task_order: 2, is_required: true, is_completed: true, completed_at: '2026-01-07' },
        { id: '3', task_name: 'Backend API development', task_description: null, task_order: 3, is_required: true, is_completed: true, completed_at: '2026-01-10' },
        { id: '4', task_name: 'Frontend component development', task_description: null, task_order: 4, is_required: true, is_completed: false, completed_at: null },
        { id: '5', task_name: 'Feature implementation', task_description: 'Per specification', task_order: 5, is_required: true, is_completed: false, completed_at: null },
        { id: '6', task_name: 'Integration testing', task_description: null, task_order: 6, is_required: true, is_completed: false, completed_at: null },
        { id: '7', task_name: 'Code review & QA', task_description: null, task_order: 7, is_required: true, is_completed: false, completed_at: null },
        { id: '8', task_name: 'Bug fixing', task_description: null, task_order: 8, is_required: true, is_completed: false, completed_at: null },
        { id: '9', task_name: 'Performance optimization', task_description: null, task_order: 9, is_required: false, is_completed: false, completed_at: null },
        { id: '10', task_name: 'Security audit', task_description: null, task_order: 10, is_required: true, is_completed: false, completed_at: null },
    ],
    testing: [
        { id: '1', task_name: 'Test plan creation', task_description: null, task_order: 1, is_required: true, is_completed: false, completed_at: null },
        { id: '2', task_name: 'Unit test verification', task_description: null, task_order: 2, is_required: true, is_completed: false, completed_at: null },
        { id: '3', task_name: 'Integration testing', task_description: null, task_order: 3, is_required: true, is_completed: false, completed_at: null },
        { id: '4', task_name: 'End-to-end testing', task_description: null, task_order: 4, is_required: true, is_completed: false, completed_at: null },
        { id: '5', task_name: 'Cross-browser testing', task_description: null, task_order: 5, is_required: true, is_completed: false, completed_at: null },
        { id: '6', task_name: 'Mobile responsiveness testing', task_description: null, task_order: 6, is_required: true, is_completed: false, completed_at: null },
        { id: '7', task_name: 'Performance testing', task_description: 'Load and stress tests', task_order: 7, is_required: false, is_completed: false, completed_at: null },
        { id: '8', task_name: 'Security testing', task_description: null, task_order: 8, is_required: true, is_completed: false, completed_at: null },
        { id: '9', task_name: 'Accessibility testing (WCAG)', task_description: null, task_order: 9, is_required: false, is_completed: false, completed_at: null },
        { id: '10', task_name: 'User acceptance testing (UAT)', task_description: null, task_order: 10, is_required: true, is_completed: false, completed_at: null },
    ],
    deployment: [
        { id: '1', task_name: 'Production environment setup', task_description: null, task_order: 1, is_required: true, is_completed: false, completed_at: null },
        { id: '2', task_name: 'Database migration to production', task_description: null, task_order: 2, is_required: true, is_completed: false, completed_at: null },
        { id: '3', task_name: 'DNS & domain configuration', task_description: null, task_order: 3, is_required: true, is_completed: false, completed_at: null },
        { id: '4', task_name: 'SSL certificate installation', task_description: null, task_order: 4, is_required: true, is_completed: false, completed_at: null },
        { id: '5', task_name: 'Deployment automation setup', task_description: null, task_order: 5, is_required: false, is_completed: false, completed_at: null },
        { id: '6', task_name: 'Monitoring & logging configuration', task_description: null, task_order: 6, is_required: true, is_completed: false, completed_at: null },
        { id: '7', task_name: 'Backup system setup', task_description: null, task_order: 7, is_required: true, is_completed: false, completed_at: null },
        { id: '8', task_name: 'Launch checklist completion', task_description: null, task_order: 8, is_required: true, is_completed: false, completed_at: null },
        { id: '9', task_name: 'Production smoke testing', task_description: null, task_order: 9, is_required: true, is_completed: false, completed_at: null },
        { id: '10', task_name: 'Go-live!', task_description: null, task_order: 10, is_required: true, is_completed: false, completed_at: null },
    ],
    post_launch: [
        { id: '1', task_name: 'Monitor application health', task_description: null, task_order: 1, is_required: true, is_completed: false, completed_at: null },
        { id: '2', task_name: 'User feedback collection', task_description: null, task_order: 2, is_required: true, is_completed: false, completed_at: null },
        { id: '3', task_name: 'Bug fix releases', task_description: null, task_order: 3, is_required: true, is_completed: false, completed_at: null },
        { id: '4', task_name: 'Performance optimization', task_description: null, task_order: 4, is_required: false, is_completed: false, completed_at: null },
        { id: '5', task_name: 'Analytics review & insights', task_description: null, task_order: 5, is_required: false, is_completed: false, completed_at: null },
        { id: '6', task_name: 'Client training sessions', task_description: null, task_order: 6, is_required: true, is_completed: false, completed_at: null },
        { id: '7', task_name: 'Documentation updates', task_description: null, task_order: 7, is_required: false, is_completed: false, completed_at: null },
        { id: '8', task_name: 'Growth recommendations', task_description: null, task_order: 8, is_required: false, is_completed: false, completed_at: null },
    ],
};

// Demo project names
const DEMO_PROJECT_NAMES: Record<string, string> = {
    'demo-saas-app': 'My SaaS Application',
    'demo-nft-marketplace': 'NFT Marketplace',
    'demo-mobile-app': 'Fitness Tracking App',
    'demo-ai-chatbot': 'Customer Support AI',
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

const stageDescriptions: Record<string, string> = {
    discovery: 'Validate your project idea, assess market fit, and determine feasibility.',
    specification: 'Define exactly what will be built with detailed requirements.',
    design: 'Create visual designs, wireframes, and brand assets.',
    development: 'Build the actual product with code and integrations.',
    testing: 'Comprehensive testing to ensure quality before launch.',
    deployment: 'Launch your project to production.',
    post_launch: 'Monitor, optimize, and grow your project.',
};

const stageOrders: Record<string, number> = {
    discovery: 1,
    specification: 2,
    design: 3,
    development: 4,
    testing: 5,
    deployment: 6,
    post_launch: 7,
};

export default function StagePage({
    params,
}: {
    params: Promise<{ id: string; stageName: string }>;
}) {
    const { id: projectId, stageName } = use(params);
    const { user } = useAuth();
    const router = useRouter();

    const [project, setProject] = useState<Project | null>(null);
    const [stage, setStage] = useState<Stage | null>(null);
    const [loading, setLoading] = useState(true);
    const [newTaskName, setNewTaskName] = useState('');
    const [showAddTask, setShowAddTask] = useState(false);

    useEffect(() => {
        // In demo mode, skip auth check and load demo data
        if (isDemoMode()) {
            loadDemoData();
            return;
        }

        if (!user) {
            router.push('/signin');
            return;
        }
        loadStage();
    }, [user, projectId, stageName, router]);

    const loadDemoData = () => {
        const projectName = DEMO_PROJECT_NAMES[projectId] || projectId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        setProject({ id: projectId, name: projectName });

        const tasks = DEMO_TASKS[stageName] || [];
        setStage({
            id: `${projectId}-${stageName}`,
            stage_name: stageName,
            stage_order: stageOrders[stageName] || 1,
            status: tasks.some(t => t.is_completed) ? 'in_progress' : 'not_started',
            agent_id: null,
            started_at: '2026-01-01',
            completed_at: null,
            tasks,
        });
        setLoading(false);
    };

    const loadStage = async () => {
        try {
            const response = await fetch(`/api/pipeline/${projectId}/stages/${stageName}`);
            if (response.ok) {
                const data = await response.json();
                setStage(data.stage);
                setProject(data.project);
            }
        } catch (error) {
            console.error('Error loading stage:', error);
        } finally {
            setLoading(false);
        }
    };

    const startStage = async () => {
        if (isDemoMode()) {
            setStage(prev => prev ? { ...prev, status: 'in_progress', started_at: new Date().toISOString() } : null);
            return;
        }

        try {
            const response = await fetch(`/api/pipeline/${projectId}/stages/${stageName}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'start' }),
            });
            if (response.ok) {
                loadStage();
            }
        } catch (error) {
            console.error('Error starting stage:', error);
        }
    };

    const completeStage = async () => {
        const incompleteTasks = stage?.tasks.filter(t => t.is_required && !t.is_completed);
        if (incompleteTasks && incompleteTasks.length > 0) {
            alert(`Please complete all required tasks first (${incompleteTasks.length} remaining)`);
            return;
        }

        if (isDemoMode()) {
            setStage(prev => prev ? { ...prev, status: 'completed', completed_at: new Date().toISOString() } : null);
            return;
        }

        try {
            const response = await fetch(`/api/pipeline/${projectId}/stages/${stageName}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'complete' }),
            });
            if (response.ok) {
                loadStage();
            }
        } catch (error) {
            console.error('Error completing stage:', error);
        }
    };

    const toggleTask = async (taskId: string, isCompleted: boolean) => {
        if (isDemoMode()) {
            setStage(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    tasks: prev.tasks.map(t =>
                        t.id === taskId
                            ? { ...t, is_completed: !isCompleted, completed_at: !isCompleted ? new Date().toISOString() : null }
                            : t
                    ),
                };
            });
            return;
        }

        try {
            const response = await fetch(`/api/pipeline/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: isCompleted ? 'uncomplete' : 'complete' }),
            });
            if (response.ok) {
                loadStage();
            }
        } catch (error) {
            console.error('Error toggling task:', error);
        }
    };

    const addTask = async () => {
        if (!newTaskName.trim() || !stage) return;

        if (isDemoMode()) {
            const newTask: Task = {
                id: `custom-${Date.now()}`,
                task_name: newTaskName.trim(),
                task_description: null,
                task_order: stage.tasks.length + 1,
                is_required: false,
                is_completed: false,
                completed_at: null,
            };
            setStage(prev => prev ? { ...prev, tasks: [...prev.tasks, newTask] } : null);
            setNewTaskName('');
            setShowAddTask(false);
            return;
        }

        try {
            const response = await fetch(`/api/pipeline/stages/${stage.id}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task_name: newTaskName.trim(), is_required: false }),
            });
            if (response.ok) {
                setNewTaskName('');
                setShowAddTask(false);
                loadStage();
            }
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const deleteTask = async (taskId: string) => {
        if (!confirm('Delete this task?')) return;

        if (isDemoMode()) {
            setStage(prev => prev ? { ...prev, tasks: prev.tasks.filter(t => t.id !== taskId) } : null);
            return;
        }

        try {
            await fetch(`/api/pipeline/tasks/${taskId}`, { method: 'DELETE' });
            loadStage();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    if (loading || (!isDemoMode() && !user)) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <FiCpu className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!stage) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <p>Stage not found</p>
            </div>
        );
    }

    const completedTasks = stage.tasks.filter(t => t.is_completed).length;
    const totalTasks = stage.tasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="px-4 md:px-8 py-16">
                {/* Header */}
                <Link
                    href={`/pipeline/${projectId}`}
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
                >
                    <FiArrowLeft />
                    <span>Back to Pipeline</span>
                </Link>

                <div className="flex items-start justify-between mb-8">
                    <div>
                        <p className="text-white/60 text-sm uppercase tracking-wider mb-2">
                            {project?.name} • Stage {stage.stage_order}/7
                        </p>
                        <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-2">
                            {stageLabels[stageName]}
                        </h1>
                        <p className="text-white/60 max-w-xl">
                            {stageDescriptions[stageName]}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-white/60 text-sm">Progress</p>
                        <p className="text-3xl font-bold">{progress}%</p>
                        <p className="text-white/60 text-sm">{completedTasks}/{totalTasks} tasks</p>
                    </div>
                </div>

                {/* Stage Status Actions */}
                <div className="mb-8 flex gap-4">
                    {stage.status === 'not_started' && (
                        <button
                            onClick={startStage}
                            className="bg-white text-black px-6 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-white/90 transition-colors inline-flex items-center gap-2"
                        >
                            <FiPlay className="w-5 h-5" />
                            Start Stage
                        </button>
                    )}
                    {stage.status === 'in_progress' && (
                        <button
                            onClick={completeStage}
                            className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-green-600 transition-colors inline-flex items-center gap-2"
                        >
                            <FiCheck className="w-5 h-5" />
                            Complete Stage
                        </button>
                    )}
                    {stage.status === 'completed' && (
                        <div className="bg-green-500/20 text-green-400 px-6 py-3 rounded-lg font-bold uppercase tracking-wider inline-flex items-center gap-2">
                            <FiCheck className="w-5 h-5" />
                            Completed
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Tasks Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold uppercase tracking-tight">Tasks</h2>
                        <button
                            onClick={() => setShowAddTask(true)}
                            className="text-white/60 hover:text-white transition-colors inline-flex items-center gap-2"
                        >
                            <FiPlus className="w-4 h-4" />
                            Add Task
                        </button>
                    </div>

                    {showAddTask && (
                        <div className="bg-white/5 border border-white/20 rounded-lg p-4 mb-4 flex gap-2">
                            <input
                                type="text"
                                value={newTaskName}
                                onChange={(e) => setNewTaskName(e.target.value)}
                                placeholder="New task name..."
                                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
                                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                            />
                            <button
                                onClick={addTask}
                                className="bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-white/90 transition-colors"
                            >
                                Add
                            </button>
                            <button
                                onClick={() => setShowAddTask(false)}
                                className="text-white/60 hover:text-white px-4 py-2"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    <div className="space-y-2">
                        {stage.tasks.map((task) => (
                            <div
                                key={task.id}
                                className={`bg-white/5 border rounded-lg p-4 flex items-center justify-between ${task.is_completed ? 'border-green-500/30' : 'border-white/20'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleTask(task.id, task.is_completed)}
                                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${task.is_completed
                                            ? 'bg-green-500 text-white'
                                            : 'bg-white/10 text-white/40 hover:bg-white/20'
                                            }`}
                                    >
                                        {task.is_completed ? <FiCheck className="w-4 h-4" /> : null}
                                    </button>
                                    <div>
                                        <p className={task.is_completed ? 'text-white/60 line-through' : ''}>
                                            {task.task_name}
                                        </p>
                                        {task.task_description && (
                                            <p className="text-white/40 text-sm">{task.task_description}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {task.is_required && (
                                        <span className="text-xs bg-white/10 px-2 py-1 rounded">Required</span>
                                    )}
                                    {!task.is_required && (
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="text-white/40 hover:text-red-400 p-1"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Agent Chat Section - Always visible in demo mode */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Deliverables */}
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <h2 className="text-xl font-bold uppercase tracking-tight mb-4">Deliverables</h2>
                        <div className="space-y-3">
                            {getStageDeliverables(stageName).map((deliverable, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                                            <FiSquare className="text-blue-400" size={14} />
                                        </div>
                                        <span className="text-sm">{deliverable}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">Pending</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Agent Chat */}
                    <div>
                        <h2 className="text-xl font-bold uppercase tracking-tight mb-4">Stage Agent</h2>
                        <StageAgentChat
                            agentRole={stageName as 'discovery' | 'specification' | 'design' | 'development' | 'testing' | 'deployment' | 'post_launch'}
                            projectName={project?.name}
                            stageName={stageLabels[stageName]}
                            className="h-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper function to get stage deliverables
function getStageDeliverables(stageName: string): string[] {
    const deliverables: Record<string, string[]> = {
        discovery: [
            'Market Research Report',
            'Competitive Landscape Analysis',
            'Technical Feasibility Document',
            'Preliminary Budget & Timeline',
            'Risk Assessment Matrix',
        ],
        specification: [
            'Product Requirements Document (PRD)',
            'User Stories & Acceptance Criteria',
            'Technical Specification Document',
            'Data Model Diagrams',
            'API Specification',
            'Statement of Work (SOW)',
        ],
        design: [
            'Wireframe Set (Figma)',
            'High-Fidelity Mockups',
            'Brand Style Guide',
            'Component Library',
            'User Flow Diagrams',
        ],
        development: [
            'Working Application (Staging)',
            'Source Code Repository',
            'API Documentation',
            'Database Schema & Migrations',
            'Developer Documentation',
        ],
        testing: [
            'Test Plan Document',
            'Test Cases & Results',
            'Bug Reports & Resolutions',
            'Performance Test Results',
            'UAT Sign-off Document',
        ],
        deployment: [
            'Live Production Application',
            'Deployment Runbook',
            'Monitoring Dashboard',
            'Backup & Recovery Plan',
            'Operations Handover Document',
        ],
        post_launch: [
            'Monthly Performance Reports',
            'Bug Fix Releases',
            'Optimization Recommendations',
            'Analytics Dashboard',
            'Growth Strategy Document',
        ],
    };
    return deliverables[stageName] || [];
}
