'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/components/Providers';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FiArrowLeft,
    FiPlus,
    FiCpu,
    FiMessageSquare,
    FiSettings,
    FiTrash2,
    FiClock,
    FiPlay,
    FiPause,
    FiCalendar,
    FiZap,
    FiFolder,
    FiLink,
    FiLink2,
    FiExternalLink,
    FiDatabase,
    FiCheck,
    FiLoader,
} from 'react-icons/fi';

interface Agent {
    id: string;
    name: string;
    description: string | null;
    role: string;
    ai_model: string;
    is_active: boolean;
    system_prompt: string | null;
    temperature: number;
    max_tokens: number;
    created_at: string;
}

interface Task {
    id: string;
    task_name: string;
    task_description: string | null;
    task_type: 'cron' | 'webhook' | 'manual';
    cron_expression: string | null;
    next_run_at: string | null;
    last_run_at: string | null;
    is_enabled: boolean;
    execution_count: number;
    success_count: number;
    failure_count: number;
    priority: number;
    created_at: string;
}

interface AgentProject {
    id: string;
    project_id: string;
    can_read: boolean;
    can_write: boolean;
    can_deploy: boolean;
    is_active: boolean;
    created_at: string;
    projects: {
        id: string;
        name: string;
        description: string | null;
        category: string | null;
        status: string | null;
        url: string | null;
    };
}

interface Inscription {
    id: string;
    inscription_id: string | null;
    transaction_id: string | null;
    content_hash: string | null;
    inscription_url: string | null;
    inscription_type: string | null;
    created_at: string;
}

export default function AgentDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: agentId } = use(params);
    const { user } = useAuth();
    const router = useRouter();

    const [agent, setAgent] = useState<Agent | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<AgentProject[]>([]);
    const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [showLinkProject, setShowLinkProject] = useState(false);
    const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'tasks' | 'projects' | 'inscriptions' | 'settings'>('tasks');

    useEffect(() => {
        if (!user) {
            router.push('/signin?redirect=/dashboard/agents');
            return;
        }

        loadAgent();
        loadTasks();
        loadProjects();
        loadInscriptions();
    }, [user, agentId, router]);

    const loadAgent = async () => {
        try {
            const response = await fetch(`/api/agents/${agentId}`);
            if (!response.ok) throw new Error('Agent not found');
            const data = await response.json();
            setAgent(data.agent);
        } catch (error) {
            console.error('Error loading agent:', error);
            router.push('/dashboard/agents');
        }
    };

    const loadTasks = async () => {
        try {
            const response = await fetch(`/api/agents/${agentId}/tasks`);
            if (!response.ok) throw new Error('Failed to load tasks');
            const data = await response.json();
            setTasks(data.tasks || []);
        } catch (error) {
            console.error('Error loading tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadProjects = async () => {
        try {
            const response = await fetch(`/api/agents/${agentId}/projects`);
            if (!response.ok) throw new Error('Failed to load projects');
            const data = await response.json();
            setProjects(data.projects || []);
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    };

    const loadInscriptions = async () => {
        try {
            const response = await fetch(`/api/agents/${agentId}/inscriptions`);
            if (!response.ok) throw new Error('Failed to load inscriptions');
            const data = await response.json();
            setInscriptions(data.inscriptions || []);
        } catch (error) {
            console.error('Error loading inscriptions:', error);
        }
    };

    const runTask = async (taskId: string) => {
        try {
            setRunningTaskId(taskId);
            const response = await fetch(`/api/agents/${agentId}/tasks/${taskId}`, {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Failed to run task');
            loadTasks();
        } catch (error) {
            console.error('Error running task:', error);
        } finally {
            setRunningTaskId(null);
        }
    };

    const unlinkProject = async (projectLinkId: string) => {
        if (!confirm('Are you sure you want to unlink this project?')) return;
        try {
            await fetch(`/api/agents/${agentId}/projects/${projectLinkId}`, { method: 'DELETE' });
            loadProjects();
        } catch (error) {
            console.error('Error unlinking project:', error);
        }
    };

    const toggleTask = async (taskId: string, isEnabled: boolean) => {
        try {
            await fetch(`/api/agents/${agentId}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_enabled: !isEnabled }),
            });
            loadTasks();
        } catch (error) {
            console.error('Error toggling task:', error);
        }
    };

    const deleteTask = async (taskId: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            await fetch(`/api/agents/${agentId}/tasks/${taskId}`, { method: 'DELETE' });
            loadTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    if (!user || loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <FiCpu className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!agent) return null;

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="px-4 md:px-8 py-16">
                {/* Header */}
                <Link
                    href="/dashboard/agents"
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
                >
                    <FiArrowLeft />
                    <span>Back to Agents</span>
                </Link>

                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
                            <FiCpu className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-1">{agent.name}</h1>
                            <div className="flex items-center gap-4 text-white/60">
                                <span className="capitalize">{agent.role}</span>
                                <span>•</span>
                                <span className="font-mono text-sm">{agent.ai_model}</span>
                                <span>•</span>
                                <span className={agent.is_active ? 'text-green-400' : 'text-white/40'}>
                                    {agent.is_active ? '● Active' : '○ Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Link
                        href={`/agent/chat?agent=${agentId}`}
                        className="bg-white text-black px-6 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-white/90 transition-colors inline-flex items-center gap-2"
                    >
                        <FiMessageSquare className="w-5 h-5" />
                        Chat
                    </Link>
                </div>

                {agent.description && (
                    <p className="text-white/60 mb-8 max-w-2xl">{agent.description}</p>
                )}

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-white/20 pb-4 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`px-4 py-2 font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === 'tasks'
                                ? 'text-white border-b-2 border-white'
                                : 'text-white/60 hover:text-white'
                            }`}
                    >
                        <FiClock className="w-4 h-4 inline mr-2" />
                        Tasks ({tasks.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`px-4 py-2 font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === 'projects'
                                ? 'text-white border-b-2 border-white'
                                : 'text-white/60 hover:text-white'
                            }`}
                    >
                        <FiFolder className="w-4 h-4 inline mr-2" />
                        Projects ({projects.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('inscriptions')}
                        className={`px-4 py-2 font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === 'inscriptions'
                                ? 'text-white border-b-2 border-white'
                                : 'text-white/60 hover:text-white'
                            }`}
                    >
                        <FiDatabase className="w-4 h-4 inline mr-2" />
                        Inscriptions ({inscriptions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-2 font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === 'settings'
                                ? 'text-white border-b-2 border-white'
                                : 'text-white/60 hover:text-white'
                            }`}
                    >
                        <FiSettings className="w-4 h-4 inline mr-2" />
                        Settings
                    </button>
                </div>

                {/* Tasks Tab */}
                {activeTab === 'tasks' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold uppercase tracking-tight">
                                Scheduled Tasks
                            </h2>
                            <button
                                onClick={() => setShowCreateTask(true)}
                                className="bg-white/10 border border-white/20 px-4 py-2 rounded-lg font-bold uppercase tracking-wider hover:bg-white/20 transition-colors inline-flex items-center gap-2"
                            >
                                <FiPlus className="w-4 h-4" />
                                Add Task
                            </button>
                        </div>

                        {tasks.length === 0 ? (
                            <div className="bg-white/5 border border-white/20 rounded-lg p-12 text-center">
                                <FiClock className="w-16 h-16 mx-auto text-white/20 mb-4" />
                                <h3 className="text-lg font-bold mb-2">No Tasks Scheduled</h3>
                                <p className="text-white/60 mb-6">
                                    Create automated tasks for this agent to run on a schedule
                                </p>
                                <button
                                    onClick={() => setShowCreateTask(true)}
                                    className="bg-white text-black px-6 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-white/90 transition-colors inline-flex items-center gap-2"
                                >
                                    <FiPlus className="w-4 h-4" />
                                    Create First Task
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="bg-white/5 border border-white/20 rounded-lg p-6"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${task.is_enabled ? 'bg-green-500/20' : 'bg-white/10'
                                                        }`}
                                                >
                                                    {task.task_type === 'cron' ? (
                                                        <FiCalendar className={task.is_enabled ? 'text-green-400' : 'text-white/40'} />
                                                    ) : task.task_type === 'webhook' ? (
                                                        <FiZap className={task.is_enabled ? 'text-green-400' : 'text-white/40'} />
                                                    ) : (
                                                        <FiPlay className={task.is_enabled ? 'text-green-400' : 'text-white/40'} />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold">{task.task_name}</h3>
                                                    <p className="text-white/60 text-sm capitalize">
                                                        {task.task_type} task • Priority {task.priority}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => runTask(task.id)}
                                                    disabled={runningTaskId === task.id}
                                                    className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                                                    title="Run Now"
                                                >
                                                    {runningTaskId === task.id ? (
                                                        <FiLoader className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <FiZap className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => toggleTask(task.id, task.is_enabled)}
                                                    className={`p-2 rounded-lg transition-colors ${task.is_enabled
                                                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                                                        }`}
                                                    title={task.is_enabled ? 'Disable' : 'Enable'}
                                                >
                                                    {task.is_enabled ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => deleteTask(task.id)}
                                                    className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {task.task_description && (
                                            <p className="text-white/60 text-sm mb-4">{task.task_description}</p>
                                        )}

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            {task.cron_expression && (
                                                <div>
                                                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Schedule</p>
                                                    <p className="font-mono">{task.cron_expression}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Executions</p>
                                                <p>{task.execution_count}</p>
                                            </div>
                                            <div>
                                                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Success Rate</p>
                                                <p className={task.success_count > 0 ? 'text-green-400' : ''}>
                                                    {task.execution_count > 0
                                                        ? `${Math.round((task.success_count / task.execution_count) * 100)}%`
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Last Run</p>
                                                <p>
                                                    {task.last_run_at
                                                        ? new Date(task.last_run_at).toLocaleDateString()
                                                        : 'Never'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Projects Tab */}
                {activeTab === 'projects' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold uppercase tracking-tight">
                                Linked Projects
                            </h2>
                            <button
                                onClick={() => setShowLinkProject(true)}
                                className="bg-white/10 border border-white/20 px-4 py-2 rounded-lg font-bold uppercase tracking-wider hover:bg-white/20 transition-colors inline-flex items-center gap-2"
                            >
                                <FiLink className="w-4 h-4" />
                                Link Project
                            </button>
                        </div>

                        {projects.length === 0 ? (
                            <div className="bg-white/5 border border-white/20 rounded-lg p-12 text-center">
                                <FiFolder className="w-16 h-16 mx-auto text-white/20 mb-4" />
                                <h3 className="text-lg font-bold mb-2">No Projects Linked</h3>
                                <p className="text-white/60 mb-6">
                                    Link projects to give this agent context about your work
                                </p>
                                <button
                                    onClick={() => setShowLinkProject(true)}
                                    className="bg-white text-black px-6 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-white/90 transition-colors inline-flex items-center gap-2"
                                >
                                    <FiLink className="w-4 h-4" />
                                    Link First Project
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {projects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="bg-white/5 border border-white/20 rounded-lg p-6"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                                    <FiFolder className="text-white/60" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold">{project.projects?.name || 'Unknown Project'}</h3>
                                                    <p className="text-white/60 text-sm">
                                                        {project.projects?.category || 'No category'} • {project.projects?.status || 'Unknown status'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {project.projects?.url && (
                                                    <a
                                                        href={project.projects.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
                                                        title="Open Project"
                                                    >
                                                        <FiExternalLink className="w-4 h-4" />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => unlinkProject(project.id)}
                                                    className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                                    title="Unlink"
                                                >
                                                    <FiLink2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {project.projects?.description && (
                                            <p className="text-white/60 text-sm mb-4">{project.projects.description}</p>
                                        )}

                                        <div className="flex gap-4 text-sm">
                                            <div className={`flex items-center gap-1 ${project.can_read ? 'text-green-400' : 'text-white/40'}`}>
                                                <FiCheck className="w-3 h-3" />
                                                <span>Read</span>
                                            </div>
                                            <div className={`flex items-center gap-1 ${project.can_write ? 'text-green-400' : 'text-white/40'}`}>
                                                <FiCheck className="w-3 h-3" />
                                                <span>Write</span>
                                            </div>
                                            <div className={`flex items-center gap-1 ${project.can_deploy ? 'text-green-400' : 'text-white/40'}`}>
                                                <FiCheck className="w-3 h-3" />
                                                <span>Deploy</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Inscriptions Tab */}
                {activeTab === 'inscriptions' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold uppercase tracking-tight">
                                Blockchain Inscriptions
                            </h2>
                        </div>

                        {inscriptions.length === 0 ? (
                            <div className="bg-white/5 border border-white/20 rounded-lg p-12 text-center">
                                <FiDatabase className="w-16 h-16 mx-auto text-white/20 mb-4" />
                                <h3 className="text-lg font-bold mb-2">No Inscriptions Yet</h3>
                                <p className="text-white/60 mb-6">
                                    Agent outputs can be inscribed on the BSV blockchain for permanent proof
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {inscriptions.map((inscription) => (
                                    <div
                                        key={inscription.id}
                                        className="bg-white/5 border border-white/20 rounded-lg p-6"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                                    <FiDatabase className="text-green-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold font-mono text-sm">
                                                        {inscription.inscription_id?.substring(0, 16)}...
                                                    </h3>
                                                    <p className="text-white/60 text-sm">
                                                        {inscription.inscription_type || 'Unknown type'} • {new Date(inscription.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {inscription.inscription_url && (
                                                <a
                                                    href={inscription.inscription_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
                                                    title="View on Blockchain"
                                                >
                                                    <FiExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Transaction ID</p>
                                                <p className="font-mono text-xs break-all">{inscription.transaction_id || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Content Hash</p>
                                                <p className="font-mono text-xs break-all">{inscription.content_hash?.substring(0, 32)}...</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="max-w-2xl">
                        <h2 className="text-xl font-bold uppercase tracking-tight mb-6">
                            Agent Settings
                        </h2>

                        <div className="space-y-6">
                            <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                                <h3 className="font-bold mb-4">AI Configuration</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Model</span>
                                        <span className="font-mono text-sm">{agent.ai_model}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Temperature</span>
                                        <span>{agent.temperature}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Max Tokens</span>
                                        <span>{agent.max_tokens}</span>
                                    </div>
                                </div>
                            </div>

                            {agent.system_prompt && (
                                <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                                    <h3 className="font-bold mb-4">System Prompt</h3>
                                    <p className="text-white/60 text-sm whitespace-pre-wrap">
                                        {agent.system_prompt}
                                    </p>
                                </div>
                            )}

                            <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                                <h3 className="font-bold mb-4">Metadata</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Agent ID</span>
                                        <span className="font-mono text-sm">{agent.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Created</span>
                                        <span>{new Date(agent.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Task Modal */}
            {showCreateTask && (
                <CreateTaskModal
                    agentId={agentId}
                    onClose={() => setShowCreateTask(false)}
                    onSuccess={(newTask) => {
                        setTasks((prev) => [newTask, ...prev]);
                        setShowCreateTask(false);
                    }}
                />
            )}

            {/* Link Project Modal */}
            {showLinkProject && (
                <LinkProjectModal
                    agentId={agentId}
                    onClose={() => setShowLinkProject(false)}
                    onSuccess={() => {
                        loadProjects();
                        setShowLinkProject(false);
                    }}
                />
            )}
        </div>
    );
}

function CreateTaskModal({
    agentId,
    onClose,
    onSuccess,
}: {
    agentId: string;
    onClose: () => void;
    onSuccess: (task: Task) => void;
}) {
    const [formData, setFormData] = useState({
        task_name: '',
        task_description: '',
        task_type: 'manual',
        cron_expression: '',
        priority: 5,
    });
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.task_name.trim()) {
            setError('Task name is required');
            return;
        }

        if (formData.task_type === 'cron' && !formData.cron_expression.trim()) {
            setError('Cron expression is required for scheduled tasks');
            return;
        }

        try {
            setCreating(true);
            const response = await fetch(`/api/agents/${agentId}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create task');
            }

            const { task } = await response.json();
            onSuccess(task);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create task');
        } finally {
            setCreating(false);
        }
    };

    const cronPresets = [
        { label: 'Every minute', value: '* * * * *' },
        { label: 'Every hour', value: '0 * * * *' },
        { label: 'Daily at 9am', value: '0 9 * * *' },
        { label: 'Weekly (Mon 9am)', value: '0 9 * * 1' },
        { label: 'Monthly (1st, 9am)', value: '0 9 1 * *' },
    ];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-black border border-white/20 rounded-lg max-w-md w-full p-6">
                <h2 className="text-2xl font-bold mb-6">Create Task</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider">
                            Task Name *
                        </label>
                        <input
                            type="text"
                            value={formData.task_name}
                            onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
                            placeholder="Daily Twitter Post"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider">
                            Description
                        </label>
                        <textarea
                            value={formData.task_description}
                            onChange={(e) => setFormData({ ...formData, task_description: e.target.value })}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 resize-none"
                            placeholder="Post a tweet with content from the ideas bucket"
                            rows={2}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider">
                            Task Type
                        </label>
                        <select
                            value={formData.task_type}
                            onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40"
                        >
                            <option value="manual">Manual (On-demand)</option>
                            <option value="cron">Scheduled (Cron)</option>
                            <option value="webhook">Webhook Trigger</option>
                        </select>
                    </div>

                    {formData.task_type === 'cron' && (
                        <div>
                            <label className="block text-sm font-bold mb-2 uppercase tracking-wider">
                                Cron Expression *
                            </label>
                            <input
                                type="text"
                                value={formData.cron_expression}
                                onChange={(e) => setFormData({ ...formData, cron_expression: e.target.value })}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-mono placeholder:text-white/40 focus:outline-none focus:border-white/40 mb-2"
                                placeholder="0 9 * * *"
                            />
                            <div className="flex flex-wrap gap-2">
                                {cronPresets.map((preset) => (
                                    <button
                                        key={preset.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, cron_expression: preset.value })}
                                        className="text-xs bg-white/10 px-2 py-1 rounded hover:bg-white/20 transition-colors"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold mb-2 uppercase tracking-wider">
                            Priority (1-10)
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-white/60">
                            <span>Low</span>
                            <span className="font-bold text-white">{formData.priority}</span>
                            <span>High</span>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-3 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={creating}
                            className="flex-1 bg-white text-black px-6 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-white/90 transition-colors disabled:opacity-50"
                        >
                            {creating ? 'Creating...' : 'Create Task'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface AvailableProject {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    status: string | null;
}

function LinkProjectModal({
    agentId,
    onClose,
    onSuccess,
}: {
    agentId: string;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [availableProjects, setAvailableProjects] = useState<AvailableProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>('');
    const [permissions, setPermissions] = useState({
        can_read: true,
        can_write: false,
        can_deploy: false,
    });
    const [loading, setLoading] = useState(true);
    const [linking, setLinking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAvailableProjects();
    }, []);

    const loadAvailableProjects = async () => {
        try {
            // Fetch all projects (simplified - in production, filter by user access)
            const response = await fetch('/api/projects');
            if (!response.ok) throw new Error('Failed to load projects');
            const data = await response.json();
            setAvailableProjects(data.projects || []);
        } catch (error) {
            console.error('Error loading projects:', error);
            setError('Failed to load available projects');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!selectedProject) {
            setError('Please select a project');
            return;
        }

        try {
            setLinking(true);
            const response = await fetch(`/api/agents/${agentId}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: selectedProject,
                    ...permissions,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to link project');
            }

            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to link project');
        } finally {
            setLinking(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-black border border-white/20 rounded-lg max-w-md w-full p-6">
                <h2 className="text-2xl font-bold mb-6">Link Project</h2>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <FiLoader className="w-8 h-8 animate-spin text-white/60" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-2 uppercase tracking-wider">
                                Select Project *
                            </label>
                            {availableProjects.length === 0 ? (
                                <p className="text-white/60 text-sm">No projects available</p>
                            ) : (
                                <select
                                    value={selectedProject}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40"
                                >
                                    <option value="">Choose a project...</option>
                                    {availableProjects.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            {project.name} {project.category && `(${project.category})`}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2 uppercase tracking-wider">
                                Permissions
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.can_read}
                                        onChange={(e) => setPermissions({ ...permissions, can_read: e.target.checked })}
                                        className="w-4 h-4 rounded bg-white/10 border-white/20"
                                    />
                                    <span>Read</span>
                                    <span className="text-white/40 text-sm">- Agent can access project information</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.can_write}
                                        onChange={(e) => setPermissions({ ...permissions, can_write: e.target.checked })}
                                        className="w-4 h-4 rounded bg-white/10 border-white/20"
                                    />
                                    <span>Write</span>
                                    <span className="text-white/40 text-sm">- Agent can modify project files</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={permissions.can_deploy}
                                        onChange={(e) => setPermissions({ ...permissions, can_deploy: e.target.checked })}
                                        className="w-4 h-4 rounded bg-white/10 border-white/20"
                                    />
                                    <span>Deploy</span>
                                    <span className="text-white/40 text-sm">- Agent can deploy project changes</span>
                                </label>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={linking || !selectedProject}
                                className="flex-1 bg-white text-black px-6 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-white/90 transition-colors disabled:opacity-50"
                            >
                                {linking ? 'Linking...' : 'Link Project'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
