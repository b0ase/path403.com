'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/Providers';
import { FiArrowLeft, FiPlus, FiCpu, FiTrash2, FiMessageSquare, FiSettings, FiActivity, FiZap } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Check if we're in demo mode
const isDemoMode = () => {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://demo.supabase.co';
};

interface Agent {
  id: string;
  name: string;
  description: string;
  role: string;
  ai_model: string;
  is_active: boolean;
  created_at: string;
  tasks_completed?: number;
  messages_today?: number;
}

// Demo agents for local development
const DEMO_AGENTS: Agent[] = [
  {
    id: 'demo-discovery-agent',
    name: 'Discovery Agent',
    description: 'Analyzes project ideas, conducts market research, and validates technical feasibility for new client projects.',
    role: 'discovery',
    ai_model: 'claude-3-5-sonnet',
    is_active: true,
    created_at: '2025-12-01T00:00:00Z',
    tasks_completed: 47,
    messages_today: 12,
  },
  {
    id: 'demo-spec-agent',
    name: 'Spec Writer',
    description: 'Creates detailed product requirements, user stories, and technical specifications from client conversations.',
    role: 'specification',
    ai_model: 'claude-3-5-sonnet',
    is_active: true,
    created_at: '2025-12-05T00:00:00Z',
    tasks_completed: 31,
    messages_today: 8,
  },
  {
    id: 'demo-content-agent',
    name: 'Content Creator',
    description: 'Generates blog posts, social media content, and marketing copy. Auto-posts to Twitter daily.',
    role: 'content',
    ai_model: 'claude-3-5-sonnet',
    is_active: true,
    created_at: '2025-12-10T00:00:00Z',
    tasks_completed: 156,
    messages_today: 3,
  },
  {
    id: 'demo-support-agent',
    name: 'Support Bot',
    description: 'Handles customer inquiries, troubleshooting, and basic technical support 24/7.',
    role: 'support',
    ai_model: 'claude-3-haiku',
    is_active: true,
    created_at: '2025-12-15T00:00:00Z',
    tasks_completed: 89,
    messages_today: 24,
  },
  {
    id: 'demo-dev-agent',
    name: 'Dev Assistant',
    description: 'Assists with code reviews, generates boilerplate, and helps debug issues in client projects.',
    role: 'developer',
    ai_model: 'claude-3-5-sonnet',
    is_active: false,
    created_at: '2026-01-01T00:00:00Z',
    tasks_completed: 0,
    messages_today: 0,
  },
];

import AgentNav from './nav';

export default function AgentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (isDemoMode()) {
      // Load demo agents
      setAgents(DEMO_AGENTS);
      setLoading(false);
      return;
    }

    // Fetch real agents from API
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agents');
        if (response.ok) {
          const data = await response.json();
          setAgents(data.agents || []);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAgents();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <FiCpu className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-4 md:px-8 py-16">
        <AgentNav showCreateButton={true} onCreateClick={() => setShowCreateModal(true)} />

        {/* Demo Mode Banner */}
        {isDemoMode() && (
          <div className="mb-8 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <p className="text-yellow-400 text-sm">
              <strong>Demo Mode:</strong> Showing sample agents. These demonstrate the agent workforce system.
              Connect your database and Anthropic API key for real agents.
            </p>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-3xl font-bold">{agents.length}</p>
            <p className="text-xs text-white/60 uppercase tracking-wider">Total Agents</p>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-3xl font-bold text-green-400">{agents.filter(a => a.is_active).length}</p>
            <p className="text-xs text-white/60 uppercase tracking-wider">Active</p>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-3xl font-bold text-blue-400">
              {agents.reduce((sum, a) => sum + (a.tasks_completed || 0), 0)}
            </p>
            <p className="text-xs text-white/60 uppercase tracking-wider">Tasks Done</p>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-3xl font-bold text-purple-400">
              {agents.reduce((sum, a) => sum + (a.messages_today || 0), 0)}
            </p>
            <p className="text-xs text-white/60 uppercase tracking-wider">Messages Today</p>
          </div>
        </div>


        {/* Agents Grid */}
        {agents.length === 0 ? (
          <div className="text-center py-24">
            <FiCpu className="w-24 h-24 mx-auto text-white/20 mb-6" />
            <h2 className="text-2xl font-bold mb-4">No Agents Yet</h2>
            <p className="text-white/60 mb-8">
              Create your first autonomous agent to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-black px-8 py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-white/90 transition-colors inline-flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              Create Agent
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white/5 border border-white/20 rounded-lg p-6 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                      <FiCpu className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{agent.name}</h3>
                      <p className="text-white/60 text-sm capitalize">
                        {agent.role}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${agent.is_active ? 'bg-green-500' : 'bg-white/20'
                      }`}
                  />
                </div>

                {agent.description && (
                  <p className="text-white/60 text-sm mb-4 line-clamp-2">
                    {agent.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Model:</span>
                    <span className="text-white font-mono text-xs">
                      {agent.ai_model}
                    </span>
                  </div>
                  {agent.tasks_completed !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Tasks Completed:</span>
                      <span className="text-green-400 font-bold">
                        {agent.tasks_completed}
                      </span>
                    </div>
                  )}
                  {agent.messages_today !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Messages Today:</span>
                      <span className="text-blue-400 font-bold">
                        {agent.messages_today}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/agent/chat?agent=${agent.id}`}
                    className="flex-1 bg-white text-black px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-white/90 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <FiMessageSquare className="w-4 h-4" />
                    Chat
                  </Link>
                  <button
                    className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
                    title="Settings"
                  >
                    <FiSettings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Agent Modal */}
      {showCreateModal && (
        <CreateAgentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newAgent) => {
            setAgents((prev) => [newAgent, ...prev]);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

// Create Agent Modal Component
function CreateAgentModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (agent: Agent) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    role: 'custom',
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Agent name is required');
      return;
    }

    // In demo mode, create a local demo agent
    if (isDemoMode()) {
      const newAgent: Agent = {
        id: `demo-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        role: formData.role,
        ai_model: 'claude-3-5-sonnet',
        is_active: true,
        created_at: new Date().toISOString(),
        tasks_completed: 0,
        messages_today: 0,
      };
      onSuccess(newAgent);
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('/api/agents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create agent');
      }

      const data = await response.json();
      onSuccess(data.agent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-white/20 rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-6">Create New Agent</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wider">
              Agent Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
              placeholder="My Assistant"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 resize-none"
              placeholder="A helpful AI assistant that..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wider">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40"
            >
              <option value="custom">Custom</option>
              <option value="developer">Developer</option>
              <option value="marketer">Marketer</option>
              <option value="content">Content Creator</option>
              <option value="support">Support</option>
            </select>
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
              {creating ? 'Creating...' : 'Create Agent'}
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
