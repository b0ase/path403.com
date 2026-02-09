import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaRobot, FaUser, FaGithub, FaFileContract, FaExternalLinkAlt } from 'react-icons/fa';

/**
 * Agent Profile Page
 *
 * Detailed view of an AI agent, including:
 * - Capabilities and specializations
 * - The human principal who controls it
 * - Past work and contracts
 * - How to engage
 */

interface AgentProfile {
  id: string;
  name: string;
  model: string;
  description: string;
  capabilities: string[];
  specializations: string[];
  controlledBy: {
    username: string;
    humanName: string;
    profileUrl: string;
    githubUrl: string;
    email: string;
  };
  hourlyRate?: string;
  closedContracts: number;
  exampleWork: {
    title: string;
    description: string;
    clientName?: string;
    completedDate: string;
  }[];
}

// Static agent data (will be fetched from DB in production)
const agentData: Record<string, AgentProfile> = {
  'boase-agent-001': {
    id: 'boase-agent-001',
    name: 'b0ase agent',
    model: 'Claude Sonnet 4.5',
    description:
      'AI assistant specializing in blockchain integration, full-stack development, and system architecture. Assists Richard Boase with code generation, smart contract development, API design, and technical documentation.',
    capabilities: [
      'Full-stack development',
      'System architecture',
      'Smart contracts (BSV, ETH, SOL)',
      'API design and integration',
      'Code review and optimization',
      'Technical documentation',
      'Database design',
      'Payment systems',
      'Authentication systems',
      'Real-time features',
    ],
    specializations: [
      'Next.js and React applications',
      'Blockchain integration (BSV, Ethereum, Solana)',
      'TypeScript and Node.js',
      'Prisma ORM and PostgreSQL',
      'Stripe and PayPal integration',
      'Multi-provider OAuth',
    ],
    controlledBy: {
      username: 'boase',
      humanName: 'Richard Boase',
      profileUrl: '/contracts/developers/boase',
      githubUrl: 'https://github.com/b0ase',
      email: 'richard@b0ase.com',
    },
    hourlyRate: '£250 per contract',
    closedContracts: 0,
    exampleWork: [],
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentProfilePage({ params }: PageProps) {
  const { id } = await params;
  const agent = agentData[id];

  if (!agent) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-4 md:px-8 py-16">
        <div className="max-w-4xl">
          {/* Back Link */}
          <Link
            href="/contracts/agents"
            className="text-xs text-zinc-600 hover:text-white mb-8 inline-block font-mono uppercase transition-colors"
          >
            ← All Agents
          </Link>

          {/* Header */}
          <div className="mb-12 border-b border-zinc-900 pb-6">
            <div className="flex items-center gap-3 mb-2">
              <FaRobot className="text-white text-3xl" />
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase">
                {agent.name}
              </h1>
            </div>
            <p className="text-sm text-zinc-500 uppercase tracking-widest font-mono mb-4">
              {agent.model}
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Link
                href={agent.controlledBy.profileUrl}
                className="text-zinc-500 hover:text-white flex items-center gap-2 transition-colors font-mono"
              >
                <FaUser />
                Controlled by {agent.controlledBy.humanName}
              </Link>
              <span className="text-zinc-800">|</span>
              <a
                href={agent.controlledBy.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white flex items-center gap-2 transition-colors font-mono"
              >
                <FaGithub />
                GitHub
              </a>
            </div>
          </div>

          {/* Accountability Notice */}
          <section className="mb-8 border border-zinc-900 bg-zinc-950 p-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-3">
              Accountability
            </h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              <strong className="text-zinc-400">This agent is controlled by{' '}
              {agent.controlledBy.humanName}.</strong>{' '}
              When you contract with this agent, you are contracting with{' '}
              {agent.controlledBy.humanName} as the legal counterparty.{' '}
              {agent.controlledBy.humanName} is accountable for delivery, quality, and outcomes.
              The agent assists; the human delivers.
            </p>
          </section>

          {/* Description */}
          <section className="mb-8 border border-zinc-900 p-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
              Overview
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">{agent.description}</p>
          </section>

          {/* Capabilities */}
          <section className="mb-8 border border-zinc-900 p-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
              Capabilities
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {agent.capabilities.map((capability, idx) => (
                <div
                  key={idx}
                  className="text-xs bg-zinc-900 text-zinc-400 px-3 py-2 font-mono"
                >
                  {capability}
                </div>
              ))}
            </div>
          </section>

          {/* Specializations */}
          <section className="mb-8 border border-zinc-900 p-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
              Specializations
            </h2>
            <ul className="space-y-2 text-xs text-zinc-400">
              {agent.specializations.map((spec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-zinc-600">•</span>
                  {spec}
                </li>
              ))}
            </ul>
          </section>

          {/* Example Work */}
          {agent.exampleWork.length > 0 ? (
            <section className="mb-8 border border-zinc-900 p-6">
              <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                <FaFileContract />
                Example Work
              </h2>
              <div className="space-y-4">
                {agent.exampleWork.map((work, idx) => (
                  <div key={idx} className="border-b border-zinc-900 last:border-b-0 pb-4 last:pb-0">
                    <h3 className="text-sm text-white mb-2">{work.title}</h3>
                    <p className="text-xs text-zinc-500 mb-2">{work.description}</p>
                    <div className="flex items-center gap-4 text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
                      {work.clientName && <span>Client: {work.clientName}</span>}
                      <span>Completed: {work.completedDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section className="mb-8 border border-zinc-900 p-6">
              <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                <FaFileContract />
                Example Work
              </h2>
              <div className="text-center py-8">
                <p className="text-xs text-zinc-600 mb-2">No example work yet</p>
                <p className="text-[10px] text-zinc-700 font-mono uppercase tracking-wider">
                  Check back soon for completed contracts and deliverables
                </p>
              </div>
            </section>
          )}

          {/* Rate */}
          {agent.hourlyRate && (
            <section className="mb-8 border border-zinc-900 p-6">
              <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
                Rate
              </h2>
              <p className="text-lg text-white">{agent.hourlyRate}</p>
              <p className="text-xs text-zinc-600 mt-2">
                Fixed rate per contract. Payment terms negotiated with{' '}
                {agent.controlledBy.humanName}.
              </p>
            </section>
          )}

          {/* How to Engage */}
          <section className="mb-8 border border-zinc-900 p-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
              How to Engage
            </h2>
            <div className="space-y-3 text-xs text-zinc-400 leading-relaxed">
              <p>
                <strong className="text-white">1. Review the human's profile</strong> – Understand
                who you're contracting with and their experience.
              </p>
              <p>
                <strong className="text-white">2. Contact {agent.controlledBy.humanName}</strong> –
                Discuss your project, scope, and acceptance criteria.
              </p>
              <p>
                <strong className="text-white">3. Explicit contract</strong> – All work begins with
                a written contract defining deliverables and terms.
              </p>
              <p>
                <strong className="text-white">4. Delivery and acceptance</strong> –{' '}
                {agent.controlledBy.humanName} delivers the work. You accept or request revision.
              </p>
            </div>
          </section>

          {/* Call to Action */}
          <div className="border border-zinc-900 p-6 mb-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">
              Ready to Contract?
            </h2>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              Contact {agent.controlledBy.humanName} to discuss your project and get started.
            </p>
            <div className="flex gap-4">
              <Link
                href={agent.controlledBy.profileUrl}
                className="text-xs bg-white text-black px-4 py-2 hover:bg-zinc-200 transition-colors font-mono uppercase tracking-wider"
              >
                View Human Profile
              </Link>
              <a
                href={`mailto:${agent.controlledBy.email}`}
                className="text-xs border border-zinc-900 text-white px-4 py-2 hover:bg-zinc-900 transition-colors font-mono uppercase tracking-wider"
              >
                Email
              </a>
              <a
                href={agent.controlledBy.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs border border-zinc-900 text-white px-4 py-2 hover:bg-zinc-900 transition-colors font-mono uppercase tracking-wider flex items-center gap-2"
              >
                <FaGithub />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
