import Link from 'next/link';
import { FaGithub, FaLinkedin, FaExternalLinkAlt, FaFileContract } from 'react-icons/fa';

/**
 * Human Profile: Richard Boase
 *
 * Explains who the human is, what their agent assists with,
 * how they work, and what responsibility they retain.
 */

export default function BoaseProfilePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-4 md:px-8 py-16">
        <div className="max-w-4xl">
          {/* Back Link */}
          <Link
            href="/contracts/developers"
            className="text-xs text-zinc-600 hover:text-white mb-8 inline-block font-mono uppercase transition-colors"
          >
            ← Registry
          </Link>

          {/* Header */}
          <div className="mb-12 border-b border-zinc-900 pb-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase mb-2">
              RICHARD BOASE
            </h1>
            <p className="text-sm text-zinc-500 uppercase tracking-widest font-mono mb-4">
              Human Principal · b0ase.com
            </p>
            <div className="flex items-center gap-4 text-xs">
              <a
                href="https://github.com/b0ase"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white flex items-center gap-2 transition-colors font-mono"
              >
                <FaGithub />
                github.com/b0ase
              </a>
              <span className="text-zinc-800">|</span>
              <a
                href="https://linkedin.com/in/richardboase"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white flex items-center gap-2 transition-colors font-mono"
              >
                <FaLinkedin />
                LinkedIn
              </a>
              <span className="text-zinc-800">|</span>
              <a
                href="mailto:richard@b0ase.com"
                className="text-zinc-500 hover:text-white transition-colors font-mono"
              >
                richard@b0ase.com
              </a>
            </div>
          </div>

          {/* Overview */}
          <section className="mb-8 border border-zinc-900 p-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">Overview</h2>
            <div className="space-y-3 text-xs text-zinc-400 leading-relaxed">
              <p>
                I am Richard Boase, the human principal behind b0ase.com. I build software systems
                and AI-assisted workflows with a focus on explicit, accountable contracting.
              </p>
              <p>
                I am the legal counterparty for all work I accept. I am accountable for delivery,
                quality, and outcomes.
              </p>
            </div>
          </section>

          {/* Agent Setup */}
          <section className="mb-8 border border-zinc-900 p-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">Agent Setup</h2>
            <div className="space-y-3 text-xs text-zinc-400 leading-relaxed">
              <p>
                <strong className="text-white">I work with a b0ase agent</strong> (Claude Sonnet 4.5)
                that assists with:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-zinc-500">
                <li>Code generation and review</li>
                <li>System design and architecture</li>
                <li>Documentation and specifications</li>
                <li>Contract drafting and clarification</li>
              </ul>
              <p className="pt-2 text-zinc-500">
                <strong className="text-zinc-400">The agent is an assistant, not a substitute.</strong>{' '}
                I review all output, make all decisions, and retain full responsibility for delivery.
              </p>
            </div>
          </section>

          {/* How I Work */}
          <section className="mb-8 border border-zinc-900 p-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">How I Work</h2>
            <div className="space-y-4 text-xs text-zinc-400 leading-relaxed">
              <div>
                <h3 className="font-mono uppercase tracking-wider text-white mb-2 text-[10px]">1. Contract-First</h3>
                <p className="text-zinc-500">
                  Every engagement starts with an explicit, scoped contract. No work begins without
                  written terms.
                </p>
              </div>
              <div>
                <h3 className="font-mono uppercase tracking-wider text-white mb-2 text-[10px]">2. Explicit Scope</h3>
                <p className="text-zinc-500">
                  Contracts define exactly what will be delivered. No ambiguity. Maximum 1 page.
                </p>
              </div>
              <div>
                <h3 className="font-mono uppercase tracking-wider text-white mb-2 text-[10px]">3. Clear Acceptance Criteria</h3>
                <p className="text-zinc-500">
                  You know what "done" means before work starts. Binary acceptance: delivered or not
                  delivered.
                </p>
              </div>
              <div>
                <h3 className="font-mono uppercase tracking-wider text-white mb-2 text-[10px]">4. Human Accountability</h3>
                <p className="text-zinc-500">
                  I am the counterparty. I deliver. I am accountable. The agent assists; I am
                  responsible.
                </p>
              </div>
            </div>
          </section>

          {/* Payment Terms */}
          <section className="mb-8 border border-zinc-900 p-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">Payment Terms</h2>
            <div className="space-y-3 text-xs text-zinc-400 leading-relaxed">
              <p>
                <strong className="text-white">Fixed rate per contract:</strong> £250
              </p>
              <p className="text-zinc-500">
                Payment structure:
                <br />• 50% upfront (on contract acceptance)
                <br />• 50% on delivery (on acceptance of deliverable)
              </p>
              <p className="text-zinc-600">
                Payments: Bank transfer, PayPal, or Bitcoin SV (BSV).
                <br />Contracts inscribed on BSV blockchain for proof of existence.
              </p>
            </div>
          </section>

          {/* Closed Contracts */}
          <section id="contracts" className="mb-8 border border-zinc-900 p-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
              <FaFileContract />
              Closed Contracts
            </h2>
            <div className="text-center py-8">
              <p className="text-xs text-zinc-600 mb-2">No closed contracts yet</p>
              <p className="text-[10px] text-zinc-700 font-mono uppercase tracking-wider">
                This section will display completed contracts with proof of delivery and acceptance.
              </p>
            </div>
          </section>

          {/* Responsibility Statement */}
          <section className="mb-8 border border-zinc-900 bg-zinc-950 p-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-3">Responsibility</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              I am the human principal. I am the legal counterparty. I deliver the work. I accept
              liability for outcomes. The agent assists me; it does not replace me.
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed mt-3">
              If you engage with me, you are contracting with a human, not an autonomous system.
              Accountability is never ambiguous.
            </p>
          </section>

          {/* Call to Action */}
          <div className="border border-zinc-900 p-6 mb-6">
            <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">Ready to Contract?</h2>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              If you need explicit, scoped work with clear accountability, let's talk.
            </p>
            <div className="flex gap-4">
              <Link
                href="/contracts"
                className="text-xs bg-white text-black px-4 py-2 hover:bg-zinc-200 transition-colors font-mono uppercase tracking-wider"
              >
                View Contracts
              </Link>
              <a
                href="mailto:richard@b0ase.com"
                className="text-xs border border-zinc-900 text-white px-4 py-2 hover:bg-zinc-900 transition-colors font-mono uppercase tracking-wider"
              >
                Email
              </a>
            </div>
          </div>

          {/* Note about Future Concepts */}
          <div className="border border-zinc-900 bg-zinc-950 p-4">
            <p className="text-[10px] text-zinc-700 leading-relaxed font-mono">
              <strong className="text-zinc-600">Note:</strong> Future revenue-sharing or capital
              structures may be explored conceptually. These are not active and are explicitly out of
              scope for current engagements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
