'use client';

import { useParams } from 'next/navigation';
import { portfolioData } from '@/lib/data';
import { getTokenPricing } from '@/lib/token-pricing';
import { CheckCircle, Circle, Lock, Rocket, Code, Users, Globe, TrendingUp } from 'lucide-react';

export default function RoadmapPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const project = portfolioData.projects.find(p => p.slug === slug);
  const pricing = project?.tokenName ? getTokenPricing(project.tokenName) : null;

  if (!project) return null;

  const isLive = pricing?.isReal;

  // Standard b0ase.com project roadmap phases
  // These get unlocked as funding milestones are hit
  const phases = [
    {
      id: 1,
      name: 'Concept',
      funding: '$0',
      status: 'complete' as const,
      description: 'Initial concept development and market research',
      deliverables: [
        'Market research & validation',
        'Initial concept design',
        'Technical feasibility study',
        'Token economics design',
      ],
      icon: Rocket,
    },
    {
      id: 2,
      name: 'Seed',
      funding: '$10,000',
      status: isLive ? 'complete' as const : 'current' as const,
      description: 'First funding milestone - token launch and MVP development',
      deliverables: [
        'Token minting on BSV',
        'Basic landing page',
        'Core feature prototype',
        'Community Discord setup',
      ],
      icon: Code,
    },
    {
      id: 3,
      name: 'Build',
      funding: '$50,000',
      status: 'locked' as const,
      description: 'Full product development phase',
      deliverables: [
        'Full product development',
        'Beta testing program',
        'Documentation & guides',
        'Initial integrations',
      ],
      icon: Code,
    },
    {
      id: 4,
      name: 'Launch',
      funding: '$100,000',
      status: 'locked' as const,
      description: 'Public launch and go-to-market',
      deliverables: [
        'Public product launch',
        'Marketing campaign',
        'Partnership announcements',
        'Exchange listings',
      ],
      icon: Globe,
    },
    {
      id: 5,
      name: 'Scale',
      funding: '$250,000',
      status: 'locked' as const,
      description: 'Growth and scaling phase',
      deliverables: [
        'Team expansion',
        'Enterprise features',
        'Global expansion',
        'Advanced integrations',
      ],
      icon: TrendingUp,
    },
  ];

  const getStatusStyle = (status: 'complete' | 'current' | 'locked') => {
    switch (status) {
      case 'complete':
        return 'border-green-800 bg-green-900/20';
      case 'current':
        return 'border-blue-800 bg-blue-900/20';
      case 'locked':
        return 'border-gray-800 bg-gray-900/30 opacity-60';
    }
  };

  const getStatusIcon = (status: 'complete' | 'current' | 'locked') => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="text-green-400" size={24} />;
      case 'current':
        return <Circle className="text-blue-400" size={24} />;
      case 'locked':
        return <Lock className="text-gray-600" size={24} />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="p-6 border border-gray-800 bg-gray-900/30">
        <h2 className="text-xl font-bold mb-2">Development Roadmap</h2>
        <p className="text-gray-400">
          Each phase unlocks as funding milestones are reached. Early investors help accelerate development
          and get the best token prices.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-800" />

        <div className="space-y-6">
          {phases.map((phase, index) => {
            const Icon = phase.icon;
            return (
              <div key={phase.id} className="relative pl-16">
                {/* Status indicator */}
                <div className="absolute left-0 top-6 w-12 h-12 flex items-center justify-center bg-black">
                  {getStatusIcon(phase.status)}
                </div>

                {/* Phase card */}
                <div className={`p-6 border ${getStatusStyle(phase.status)}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                          Phase {phase.id}
                        </span>
                        {phase.status === 'complete' && (
                          <span className="text-xs px-2 py-0.5 bg-green-900/50 text-green-400 border border-green-800/50">
                            Complete
                          </span>
                        )}
                        {phase.status === 'current' && (
                          <span className="text-xs px-2 py-0.5 bg-blue-900/50 text-blue-400 border border-blue-800/50">
                            In Progress
                          </span>
                        )}
                        {phase.status === 'locked' && (
                          <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-500 border border-gray-700">
                            Locked
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-tight">
                        {phase.name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-widest">Funding Target</p>
                      <p className="text-xl font-black text-white">{phase.funding}</p>
                    </div>
                  </div>

                  <p className="text-gray-400 mb-4">{phase.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {phase.deliverables.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        {phase.status === 'complete' ? (
                          <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                        ) : (
                          <Circle size={14} className="text-gray-600 flex-shrink-0" />
                        )}
                        <span className={phase.status === 'locked' ? 'text-gray-600' : 'text-gray-300'}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Note */}
      <div className="p-4 border border-gray-800 bg-gray-900/30 text-sm text-gray-500">
        <strong className="text-gray-400">Note:</strong> Roadmap phases and funding targets are indicative.
        Actual development may vary based on market conditions and community feedback.
      </div>
    </div>
  );
}
