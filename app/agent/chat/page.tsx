'use client';

import { useState, useEffect } from 'react';
import { AgentChatInterface } from '@/components/agents/AgentChatInterface';
import { useAuth } from '@/components/Providers';
import { FiCpu, FiPlus, FiMessageSquare, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Agent {
  id: string;
  name: string;
  description: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function AgentChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingAgent, setCreatingAgent] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/signin?redirect=/agent/chat');
      return;
    }

    loadAgents();
  }, [user, router]);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/agents');

      if (!response.ok) {
        throw new Error('Failed to load agents');
      }

      const data = await response.json();
      setAgents(data.agents || []);

      // Auto-select first agent if available
      if (data.agents && data.agents.length > 0 && !selectedAgent) {
        setSelectedAgent(data.agents[0]);
      }
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultAgent = async () => {
    try {
      setCreatingAgent(true);
      const response = await fetch('/api/agents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'My Assistant',
          description: 'A helpful AI assistant',
          role: 'custom',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create agent');
      }

      const data = await response.json();
      setAgents((prev) => [data.agent, ...prev]);
      setSelectedAgent(data.agent);
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Failed to create agent. Please try again.');
    } finally {
      setCreatingAgent(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Please sign in to use the agent system</p>
          <Link
            href="/signin?redirect=/agent/chat"
            className="bg-white text-black px-8 py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-white/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <FiCpu className="w-8 h-8 animate-spin" />
          <p className="text-xl">Loading agents...</p>
        </div>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="px-4 md:px-8 py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
          >
            <FiArrowLeft />
            <span>Back to Home</span>
          </Link>

          <div className="max-w-2xl mx-auto text-center space-y-6">
            <FiCpu className="w-24 h-24 mx-auto text-white/20" />
            <h1 className="text-4xl md:text-6xl font-bold">
              No Agents Yet
            </h1>
            <p className="text-xl text-white/60">
              Create your first autonomous agent to get started
            </p>
            <button
              onClick={createDefaultAgent}
              disabled={creatingAgent}
              className="bg-white text-black px-8 py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-white/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              {creatingAgent ? 'Creating...' : 'Create Agent'}
            </button>
            <div className="pt-8">
              <Link
                href="/dashboard/agents"
                className="text-white/60 hover:text-white underline"
              >
                Or manage agents in dashboard →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-white/20 px-4 md:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-white/60 hover:text-white transition-colors"
            >
              <FiArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold flex items-center gap-3">
                <FiMessageSquare />
                Agent Chat
              </h1>
              {selectedAgent && (
                <p className="text-white/60 text-sm mt-1">
                  Chatting with: <span className="text-white">{selectedAgent.name}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/agents"
              className="text-sm text-white/60 hover:text-white underline"
            >
              Manage Agents
            </Link>
          </div>
        </div>
      </div>

      {/* Agent Selector (if multiple agents) */}
      {agents.length > 1 && (
        <div className="border-b border-white/20 px-4 md:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => {
                  setSelectedAgent(agent);
                  setConversationId(null); // Reset conversation when switching agents
                }}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedAgent?.id === agent.id
                    ? 'bg-white text-black font-bold'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiCpu className="w-4 h-4" />
                  {agent.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedAgent ? (
          <AgentChatInterface
            key={selectedAgent.id} // Force re-render when agent changes
            agentId={selectedAgent.id}
            conversationId={conversationId}
            onConversationCreated={setConversationId}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/60">Select an agent to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
