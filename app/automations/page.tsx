'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

// Automation types and phases
type AutomationPhase = 'basic' | 'workflow' | 'intelligent';
type AutomationType = 'text-to-image' | 'image-to-video' | 'upscaling' | 'batch-processing';

interface Automation {
  id: string;
  name: string;
  description: string;
  type: AutomationType;
  phase: AutomationPhase;
  isEnabled: boolean;
  usage: number;
  lastUsed?: Date;
}

const automations: Automation[] = [
  {
    id: 'text-to-image',
    name: 'Text to Image Generation',
    description: 'Generate high-quality images from text prompts using Grok Imagine API',
    type: 'text-to-image',
    phase: 'basic',
    isEnabled: true,
    usage: 0
  },
  {
    id: 'image-to-video',
    name: 'Image to Video Animation',
    description: 'Convert static images into animated videos with AI-powered motion',
    type: 'image-to-video',
    phase: 'basic',
    isEnabled: true,
    usage: 0
  },
  {
    id: 'upscaling',
    name: 'AI Image Upscaling',
    description: 'Enhance image resolution without quality loss for print and digital',
    type: 'upscaling',
    phase: 'basic',
    isEnabled: true,
    usage: 0
  },
  {
    id: 'batch-processing',
    name: 'Batch Content Generation',
    description: 'Process multiple content requests in automated workflows',
    type: 'batch-processing',
    phase: 'workflow',
    isEnabled: false,
    usage: 0
  }
];

export default function AutomationsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState<AutomationPhase>('basic');
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login?redirect=/automations');
        return;
      }

      setUser(session.user);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/login?redirect=/automations');
        } else {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  const getPhaseColor = (phase: AutomationPhase) => {
    switch (phase) {
      case 'basic': return 'bg-blue-500';
      case 'workflow': return 'bg-orange-500';
      case 'intelligent': return 'bg-purple-500';
    }
  };

  const getPhaseDescription = (phase: AutomationPhase) => {
    switch (phase) {
      case 'basic': return 'Essential AI-powered content generation tools';
      case 'workflow': return 'Advanced automation workflows and batch processing';
      case 'intelligent': return 'AI-driven optimization and intelligent content strategies';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const filteredAutomations = automations.filter(auto => auto.phase === activePhase);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Content */}
      <div className="px-4 md:px-8 py-16">
        {/* Page Title */}
        <div className="mb-8 flex items-end gap-4 border-b border-zinc-900 pb-4">
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
            AUTOMATIONS
          </h2>
          <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
            AI_WORKFLOWS
          </div>
        </div>

        <p className="text-gray-400 mb-8">AI-powered content generation and workflow automation</p>

        <div className="w-full">
        {/* Phase Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Technology Progression Phases</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['basic', 'workflow', 'intelligent'] as AutomationPhase[]).map((phase) => (
              <button
                key={phase}
                onClick={() => setActivePhase(phase)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  activePhase === phase 
                    ? 'border-red-500 bg-red-500/10' 
                    : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getPhaseColor(phase)}`} />
                  <div>
                    <h3 className="font-semibold capitalize">{phase} Phase</h3>
                    <p className="text-sm text-gray-400 text-left mt-1">
                      {getPhaseDescription(phase)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Automations Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Available Automations - {activePhase.charAt(0).toUpperCase() + activePhase.slice(1)} Phase
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAutomations.map((automation) => (
              <div
                key={automation.id}
                className={`p-6 rounded-xl border transition-all cursor-pointer ${
                  automation.isEnabled 
                    ? 'border-gray-700 bg-gray-800/30 hover:border-red-500/50 hover:bg-red-500/5' 
                    : 'border-gray-800 bg-gray-900/50 opacity-60'
                }`}
                onClick={() => automation.isEnabled && setSelectedAutomation(automation)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg">{automation.name}</h3>
                  <div className={`px-2 py-1 rounded text-xs ${
                    automation.isEnabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {automation.isEnabled ? 'Active' : 'Coming Soon'}
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-4">{automation.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Usage: {automation.usage}</span>
                  {automation.lastUsed && (
                    <span className="text-gray-500">
                      Last used: {automation.lastUsed.toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Integration Status */}
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">API Integration Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
              <div>
                <h3 className="font-medium">Grok Imagine API</h3>
                <p className="text-sm text-gray-400">Kie.ai Platform</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-green-400">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
              <div>
                <h3 className="font-medium">Cost per Generation</h3>
                <p className="text-sm text-gray-400">6-second video</p>
              </div>
              <div className="text-right">
                <span className="font-semibold text-green-400">$0.10</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Automation Detail Modal */}
      {selectedAutomation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{selectedAutomation.name}</h2>
              <button
                onClick={() => setSelectedAutomation(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <p className="text-gray-300 mb-6">{selectedAutomation.description}</p>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h3 className="font-semibold mb-2">Quick Start</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Get started with {selectedAutomation.name} in just a few clicks.
                </p>
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors">
                  Launch Tool
                </button>
              </div>
              
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h3 className="font-semibold mb-2">Usage Statistics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Total Uses:</span>
                    <div className="font-semibold">{selectedAutomation.usage}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Success Rate:</span>
                    <div className="font-semibold text-green-400">98.5%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}