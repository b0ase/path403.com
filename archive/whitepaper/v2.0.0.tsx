'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white font-mono selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Header */}
      <section className="relative py-24 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn}>
              <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-xs uppercase tracking-widest mb-8 inline-block">
                ← Back to Home
              </Link>
            </motion.div>

            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500 mb-8"
              variants={fadeIn}
            >
              WHITEPAPER_V2.0.0
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-6"
              variants={fadeIn}
            >
              $<span className="text-zinc-500">402</span> Protocol
            </motion.h1>

            <motion.p
              className="text-zinc-400 max-w-2xl mb-4 text-lg"
              variants={fadeIn}
            >
              Turning Websites into Shareholder Businesses
            </motion.p>

            <motion.div
              className="flex items-center gap-4 text-zinc-500 text-sm"
              variants={fadeIn}
            >
              <a href="https://x.com/b0ase" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                @b0ase
              </a>
              <span>·</span>
              <span>February 2026</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Abstract */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[10px] font-bold text-zinc-500 mb-6 uppercase tracking-widest">Abstract</h2>
          <p className="text-zinc-400 leading-relaxed">
            We propose a protocol where every URL path can become a <em className="text-zinc-900 dark:text-white">shareholder business</em>.
            Visitors buy tokens to access content. Token holders can serve that content to others and earn revenue.
            Holders who stake become <em className="text-zinc-900 dark:text-white">partners</em>—running infrastructure, indexing the blockchain,
            and receiving dividends. The result is a self-sustaining flywheel where buying, serving, and staking
            are the same activity at different stages. No separate classes. No central infrastructure.
            Just aligned incentives all the way down.
          </p>
        </div>
      </section>

      {/* The Core Idea */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-6 uppercase tracking-wide">The Core Idea</h2>
          <p className="text-zinc-400 leading-relaxed mb-6">
            HTTP 402 "Payment Required" was reserved in 1999 but never defined. The $402 protocol finally gives it meaning:
          </p>
          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 text-center mb-6">
            <p className="text-2xl text-zinc-900 dark:text-white font-bold mb-2">
              Every URL path is a company.
            </p>
            <p className="text-2xl text-zinc-900 dark:text-white font-bold mb-2">
              Every visitor can become a shareholder.
            </p>
            <p className="text-2xl text-zinc-900 dark:text-white font-bold">
              Every shareholder can become a partner.
            </p>
          </div>
          <p className="text-zinc-400 leading-relaxed">
            The <span className="text-zinc-900 dark:text-white font-mono">$</span> prefix marks a path as an economic entity:
            <span className="text-blue-400 font-mono"> $example.com</span>,
            <span className="text-blue-400 font-mono"> $example.com/$blog</span>,
            <span className="text-blue-400 font-mono"> $example.com/$api</span>.
            Each is a separate market with its own tokens, price curve, and shareholders.
          </p>
        </div>
      </section>

      {/* The Flywheel */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-6 uppercase tracking-wide">The Flywheel</h2>
          <p className="text-zinc-400 leading-relaxed mb-6">
            The $402 protocol creates a self-reinforcing cycle:
          </p>
          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
{`    ┌─────────────────────────────────────────┐
    │                                         │
    │   1. BUY ACCESS                         │
    │      Pay entry fee → Receive tokens     │
    │                 │                       │
    │                 ▼                       │
    │   2. STAKE TOKENS                       │
    │      Lock tokens → Become partner       │
    │                 │                       │
    │                 ▼                       │
    │   3. RUN INFRASTRUCTURE                 │
    │      Index blockchain → Serve registry  │
    │                 │                       │
    │                 ▼                       │
    │   4. EARN REVENUE                       │
    │      Entry fees + API fees + Dividends  │
    │                 │                       │
    │                 ▼                       │
    │   5. NEW BUYERS REPEAT                  │
    │      They buy → stake → serve → earn    │
    │                 │                       │
    │                 └──────────┐            │
    │                            │            │
    │   More partners = Better infrastructure │
    │   Better infra = More buyers            │
    │   More buyers = More revenue            │
    │   More revenue = More partners ◄────────┘
    │                                         │
    └─────────────────────────────────────────┘`}
          </pre>
          <p className="text-zinc-400 leading-relaxed">
            <strong className="text-zinc-900 dark:text-white">Every role is the same person at different stages.</strong> A buyer
            becomes a holder becomes a staker becomes a partner. No separate classes. The path is open to everyone.
          </p>
        </div>
      </section>

      {/* Step 1: Bearer Share Model */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide">Step 1</h2>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Bearer Share Model</h3>

          <p className="text-zinc-400 leading-relaxed mb-6">
            Old micropayment model: pay a fixed price, get access, done. No reason to be early. No network effect.
          </p>

          <p className="text-zinc-400 leading-relaxed mb-6">
            <strong className="text-zinc-900 dark:text-white">$402 model:</strong> Pay for access, receive <em className="text-zinc-900 dark:text-white">bearer shares</em>.
            These shares are tradeable. Early buyers get more shares per dollar spent. They can resell to latecomers at profit.
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Stakeholder</th>
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Old Model</th>
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">$402 Model</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr className="border-b border-zinc-800">
                  <td className="py-3">Creator</td>
                  <td className="py-3">Sells access once</td>
                  <td className="py-3">Creates secondary market</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3">Early User</td>
                  <td className="py-3">Pays, gets access</td>
                  <td className="py-3">Pays, gets access + tradeable asset</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3">Late User</td>
                  <td className="py-3">Pays same price</td>
                  <td className="py-3">Pays more OR buys from early users</td>
                </tr>
                <tr>
                  <td className="py-3">Network</td>
                  <td className="py-3">No effect</td>
                  <td className="py-3">Viral incentive to discover early</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-zinc-400 leading-relaxed">
            Users are incentivized to discover content early because they get more tokens per unit spent and can profit from latecomers.
          </p>
        </div>
      </section>

      {/* Step 2: Compliance and Dividends */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide">Step 2</h2>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Compliance and Dividends</h3>

          <p className="text-zinc-400 leading-relaxed mb-6">
            Bearer shares are permissionless—anyone can hold and trade them. But dividends require compliance.
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Tier</th>
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">KYC</th>
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Dividends</th>
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Can Trade</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr className="border-b border-zinc-800">
                  <td className="py-3 text-zinc-900 dark:text-white font-bold">Tier 1: Bearer</td>
                  <td className="py-3">No</td>
                  <td className="py-3">No</td>
                  <td className="py-3 text-green-400">Yes</td>
                </tr>
                <tr>
                  <td className="py-3 text-zinc-900 dark:text-white font-bold">Tier 2: Staker</td>
                  <td className="py-3 text-green-400">Yes</td>
                  <td className="py-3 text-green-400">Yes</td>
                  <td className="py-3 text-green-400">Yes</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-zinc-400 leading-relaxed mb-4">
            <strong className="text-zinc-900 dark:text-white">To receive dividends:</strong>
          </p>
          <ol className="space-y-2 text-zinc-400 mb-6 list-decimal list-inside">
            <li>Hold bearer shares (tokens)</li>
            <li>Complete KYC verification</li>
            <li>Stake tokens on the site</li>
            <li>Appear on the Registry of Members</li>
            <li>Receive proportional dividends from entry fees</li>
          </ol>

          <p className="text-zinc-400 leading-relaxed">
            The registry only updates when a new holder stakes and completes KYC. Bearer tokens are bearer instruments—the site doesn't track transfers.
          </p>
        </div>
      </section>

      {/* Step 3: Pricing Curves */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide">Step 3</h2>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Pricing Curves</h3>

          <p className="text-zinc-400 leading-relaxed mb-6">
            $402 doesn't mandate one pricing model. It defines <em className="text-zinc-900 dark:text-white">how to express</em> pricing models.
          </p>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">sqrt_decay (Default)</h4>
          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 mb-6 text-center">
            <p className="text-lg mb-2 text-zinc-900 dark:text-white font-mono">
              price = base / √(supply + 1)
            </p>
          </div>

          <p className="text-zinc-400 leading-relaxed mb-6">
            <strong className="text-zinc-900 dark:text-white">Two variants:</strong>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-950">
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Investment (Treasury)</div>
              <div className="text-zinc-900 dark:text-white mb-2">Price <strong>increases</strong> as treasury depletes</div>
              <div className="text-zinc-400 text-sm">Early buyers get cheap tokens. Rewards early belief.</div>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-950">
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Content (Access)</div>
              <div className="text-zinc-900 dark:text-white mb-2">Price <strong>decreases</strong> as supply grows</div>
              <div className="text-zinc-400 text-sm">Early buyers pay premium for time advantage.</div>
            </div>
          </div>

          <p className="text-zinc-400 leading-relaxed">
            Other models: <span className="font-mono text-blue-400">fixed</span>, <span className="font-mono text-blue-400">linear</span>, <span className="font-mono text-blue-400">exponential</span>, <span className="font-mono text-blue-400">bonding_curve</span>. The curve is the economic constitution of the token.
          </p>
        </div>
      </section>

      {/* Step 4: Paths as Economic Entities */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide">Step 4</h2>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Paths as Economic Entities</h3>

          <p className="text-zinc-400 leading-relaxed mb-6">
            Every URL path can become a tokenized entity. The <span className="font-mono text-zinc-900 dark:text-white">$</span> prefix means: "this path is a shareholder business."
          </p>

          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
{`$example.com                    → Site-level entity
$example.com/$blog              → Blog section entity
$example.com/$blog/$premium     → Premium content entity
$example.com/$api               → API access entity`}
          </pre>

          <p className="text-zinc-400 leading-relaxed mb-4">
            Each <span className="font-mono text-blue-400">$path</span> is:
          </p>
          <ul className="space-y-2 text-zinc-400 mb-6">
            <li className="flex gap-3">
              <span className="text-blue-400">→</span>
              <span>A <strong className="text-zinc-900 dark:text-white">token</strong> — tradeable bearer share</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400">→</span>
              <span>An <strong className="text-zinc-900 dark:text-white">inscription</strong> — anchored on blockchain</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400">→</span>
              <span>A <strong className="text-zinc-900 dark:text-white">pricing curve</strong> — determines cost of entry</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400">→</span>
              <span>A <strong className="text-zinc-900 dark:text-white">registry</strong> — list of shareholders</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400">→</span>
              <span>A <strong className="text-zinc-900 dark:text-white">revenue stream</strong> — entry fees flow to shareholders</span>
            </li>
          </ul>

          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-center">
            <p className="text-zinc-500 text-sm mb-2">The name:</p>
            <p className="text-zinc-900 dark:text-white text-lg">
              <span className="text-blue-400 font-mono">$</span> = Path is an economic entity
            </p>
            <p className="text-zinc-900 dark:text-white text-lg">
              <span className="text-blue-400 font-mono">402</span> = HTTP Payment Required
            </p>
            <p className="text-zinc-900 dark:text-white text-lg mt-2">
              <span className="font-mono">$402</span> = Paths as 402-enabled entities
            </p>
          </div>
        </div>
      </section>

      {/* Step 5: Hierarchical Ownership */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide">Step 5</h2>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Hierarchical Ownership</h3>

          <p className="text-zinc-400 leading-relaxed mb-6">
            A domain is a business with a corporate structure. Child paths are subsidiaries.
          </p>

          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
{`$example.com                      ← Holding company (root)
├── $example.com/$blog            ← Subsidiary (branch)
│   ├── $example.com/$blog/$news  ← Product line (leaf)
│   └── $example.com/$blog/$opinion
├── $example.com/$api             ← Subsidiary (branch)
│   ├── $example.com/$api/$v1     ← Product line (leaf)
│   └── $example.com/$api/$v2
└── $example.com/$premium         ← Subsidiary (branch)`}
          </pre>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">The 50% Rule</h4>
          <p className="text-zinc-400 leading-relaxed mb-6">
            When a child path is created, <strong className="text-zinc-900 dark:text-white">50% of tokens go to the parent</strong>.
          </p>

          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
{`$example.com/$blog created with 1,000,000 tokens:
  → 500,000 go to $example.com (parent)
  → 500,000 available for sale

$example.com/$blog/$premium created:
  → 500,000 go to $example.com/$blog (parent)
  → 500,000 available for sale
  → $example.com owns 50% of $blog, so indirectly owns 250,000`}
          </pre>

          <p className="text-zinc-400 leading-relaxed mb-6">
            <strong className="text-zinc-900 dark:text-white">Revenue flows UP the tree.</strong> Entry fees at leaf nodes split up through the hierarchy.
            Root shareholders benefit from ALL activity in the tree.
          </p>

          <p className="text-zinc-400 leading-relaxed">
            <strong className="text-zinc-900 dark:text-white">Root access:</strong> A majority shareholder in the root has access to everything underneath.
            The CEO doesn't need to buy tickets to their own products.
          </p>
        </div>
      </section>

      {/* Step 6: Extensibility */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide">Step 6</h2>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Extensibility</h3>

          <p className="text-zinc-400 leading-relaxed mb-6">
            $402 is a <strong className="text-zinc-900 dark:text-white">core + extensions</strong> architecture. The simplest token:
          </p>

          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
{`{
  "p": "$402",
  "version": "1.0",
  "path": "$myblog.com",
  "pricing": { "model": "fixed", "price": 500 }
}`}
          </pre>

          <p className="text-zinc-400 leading-relaxed mb-6">
            That's it. 4 fields. Everything else is an extension:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Extension</th>
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">What It Adds</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr className="border-b border-zinc-800">
                  <td className="py-3 font-mono text-blue-400">$402-curves</td>
                  <td className="py-3">sqrt_decay, linear, exponential, bonding</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3 font-mono text-blue-400">$402-compliance</td>
                  <td className="py-3">KYC, staking, dividends, registry</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3 font-mono text-blue-400">$402-hierarchy</td>
                  <td className="py-3">Parent/child relationships, revenue flow</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3 font-mono text-blue-400">$402-containers</td>
                  <td className="py-3">Data embedded in inscriptions</td>
                </tr>
                <tr>
                  <td className="py-3 font-mono text-blue-400">$402-governance</td>
                  <td className="py-3">Voting rights, proposals</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-zinc-400 leading-relaxed">
            The tree is built <strong className="text-zinc-900 dark:text-white">incrementally</strong>. Each path is a separate inscription.
            Child inscriptions reference their parent. The tree emerges from linked inscriptions over time.
          </p>
        </div>
      </section>

      {/* Step 7: Staking Partners */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide">Step 7</h2>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Staking Partners</h3>

          <p className="text-zinc-400 leading-relaxed mb-6">
            Who runs the infrastructure? Who indexes the blockchain? Who serves the registry?
            <strong className="text-zinc-900 dark:text-white"> Stakers do.</strong>
          </p>

          <p className="text-zinc-400 leading-relaxed mb-6">
            Stakers are not passive dividend collectors. They are <strong className="text-zinc-900 dark:text-white">partners</strong> in the domain business.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-950">
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Staker Commits</div>
              <ul className="text-zinc-400 text-sm space-y-1">
                <li>• Lock tokens (can't sell while staked)</li>
                <li>• Run indexer for the domain</li>
                <li>• Maintain shareholder registry</li>
                <li>• Index child path inscriptions</li>
              </ul>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-950">
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Staker Receives</div>
              <ul className="text-zinc-400 text-sm space-y-1">
                <li>• Share of entry fees (70%)</li>
                <li>• Child path creation fees</li>
                <li>• API access fees</li>
                <li>• Dividends proportional to stake</li>
              </ul>
            </div>
          </div>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">The Scaling Effect</h4>
          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
{`Small domain ($myblog.com):
  → 1-2 stakers sufficient
  → Low revenue, issuer might self-stake

Large domain ($news.com):
  → Many stakers compete
  → High revenue, redundant infrastructure
  → Stakers earn significant income`}
          </pre>

          <p className="text-zinc-400 leading-relaxed">
            <strong className="text-zinc-900 dark:text-white">No central indexer needed.</strong> Every domain has partners with incentives to keep it running.
            The network becomes self-sustaining.
          </p>
        </div>
      </section>

      {/* Implementation */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-6 uppercase tracking-wide">Implementation</h2>

          <h3 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">HTTP 402 Response</h3>
          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
{`HTTP/1.1 402 Payment Required
X-$402-Version: 1.0.0
X-$402-Price: 4500
X-$402-Token: $example.com/$blog
X-$402-Model: sqrt_decay

{
  "price_sats": 4500,
  "token": "$example.com/$blog",
  "treasury_remaining": 499000000,
  "accepts": ["bsv", "base", "sol", "eth"]
}`}
          </pre>

          <h3 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">Discovery Endpoint</h3>
          <p className="text-zinc-400 leading-relaxed mb-4">
            Every $402 domain exposes <span className="font-mono text-blue-400">/.well-known/$402.json</span>:
          </p>
          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
{`{
  "$402_version": "1.0",
  "extensions": ["$402-curves", "$402-hierarchy"],
  "root": {
    "path": "$example.com",
    "inscription_id": "abc123..."
  },
  "children": [
    { "path": "$example.com/$blog", "inscription_id": "def456..." }
  ]
}`}
          </pre>

          <h3 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">x402 Facilitator</h3>
          <p className="text-zinc-400 leading-relaxed mb-4">
            PATH402.com operates as an x402 facilitator—verifying payments from any chain and inscribing proofs on BSV:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Network</th>
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Status</th>
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Assets</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr className="border-b border-zinc-800">
                  <td className="py-3">BSV</td>
                  <td className="py-3 text-blue-400">Primary</td>
                  <td className="py-3">BSV, BSV-20 tokens</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3">Base</td>
                  <td className="py-3">Supported</td>
                  <td className="py-3">USDC, ETH</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3">Solana</td>
                  <td className="py-3">Supported</td>
                  <td className="py-3">USDC, SOL</td>
                </tr>
                <tr>
                  <td className="py-3">Ethereum</td>
                  <td className="py-3">Supported</td>
                  <td className="py-3">USDC, ETH, USDT</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Step 8: AI Agents and x402 */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide">Step 8</h2>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">AI Agents and Protocol Interoperability</h3>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">The Bigger Vision</h4>
          <p className="text-zinc-400 leading-relaxed mb-4">
            $402 proposes something radical: <strong className="text-zinc-900 dark:text-white">the domain name becomes the ticker symbol</strong>.
          </p>
          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
{`Legacy:     $COIN on NYSE      → Coinbase stock
$402:       $coinbase.com      → Domain IS the equity

Legacy:     $GOOGL on NASDAQ   → Google stock
$402:       $google.com        → Domain IS the equity`}
          </pre>
          <p className="text-zinc-400 leading-relaxed mb-6">
            Every company already owns their domain. With $402, that domain becomes their cap table.
            Stock exchanges become legacy infrastructure.
          </p>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">x402 vs $402</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-950">
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-2">x402 (Coinbase)</div>
              <div className="text-zinc-900 dark:text-white mb-2">Payment Verification</div>
              <ul className="text-zinc-400 text-sm space-y-1">
                <li>• Multi-chain payment acceptance</li>
                <li>• Facilitator protocol</li>
                <li>• "Did they pay?"</li>
              </ul>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-950">
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-2">$402 (This Protocol)</div>
              <div className="text-zinc-900 dark:text-white mb-2">Economic Model</div>
              <ul className="text-zinc-400 text-sm space-y-1">
                <li>• Pricing curves, hierarchy</li>
                <li>• Shareholder registry</li>
                <li>• "What do they own?"</li>
              </ul>
            </div>
          </div>
          <p className="text-zinc-400 leading-relaxed mb-6">
            <strong className="text-zinc-900 dark:text-white">$402 sits on top of x402.</strong> We don't compete with x402 — we complete it.
            Coinbase built x402 for micropayments. $402 adds the economics that make it a platform for internet-native equity.
          </p>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">AI Agents as First-Class Participants</h4>
          <p className="text-zinc-400 leading-relaxed mb-4">
            The flywheel works <em className="text-zinc-900 dark:text-white">better</em> for AI agents than humans:
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Human</th>
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">AI Agent</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr className="border-b border-zinc-800">
                  <td className="py-3">Subscription fatigue</td>
                  <td className="py-3 text-green-400">No fatigue</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3">CAPTCHA problems</td>
                  <td className="py-3 text-green-400">Programmatic access</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3">9-5 availability</td>
                  <td className="py-3 text-green-400">24/7 operation</td>
                </tr>
                <tr>
                  <td className="py-3">Emotion-driven</td>
                  <td className="py-3 text-green-400">Data-driven ROI</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-zinc-400 leading-relaxed mb-4">
            <strong className="text-zinc-900 dark:text-white">Self-funding agents:</strong> An agent that stakes early, runs infrastructure,
            and earns from new buyers can recover its investment and become profitable. The first agents to stake have the best economics.
          </p>

          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
{`npm install path402-mcp-server

Discovery:  path402_discover, path402_economics
Acquire:    path402_acquire, path402_wallet
Stake:      path402_stake, path402_serve`}
          </pre>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">The End State</h4>
          <p className="text-zinc-400 leading-relaxed mb-4">
            Coinbase could issue <span className="font-mono text-blue-400">$coinbase.com</span> via $402.
            Their domain becomes their cap table. Every user becomes a potential shareholder. The NYSE listing becomes secondary.
          </p>
          <p className="text-zinc-900 dark:text-white leading-relaxed">
            This is not competing with Coinbase. This is offering Coinbase a better model.
          </p>
        </div>
      </section>

      {/* Conclusion */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-6 uppercase tracking-wide">Conclusion</h2>
          <p className="text-zinc-400 leading-relaxed mb-6">
            The $402 protocol turns websites into shareholder businesses. Every visitor can become an owner.
            Every owner can become a partner. Every partner helps run the infrastructure that makes the business work.
          </p>
          <p className="text-zinc-400 leading-relaxed mb-6">
            There are no separate classes—just the same person at different stages of commitment.
            Buy, stake, serve, earn. The flywheel spins.
          </p>
          <p className="text-zinc-900 dark:text-white leading-relaxed text-lg">
            HTTP 402 was reserved for "future use" in 1999. That future is now.
          </p>
        </div>
      </section>

      {/* References */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-6 uppercase tracking-wide">References</h2>
          <ol className="space-y-2 text-zinc-500 text-sm">
            <li>[1] Nakamoto, S. (2008). Bitcoin: A Peer-to-Peer Electronic Cash System.</li>
            <li>[2] RFC 2616 (1999). HTTP/1.1 Status Code 402 Payment Required.</li>
            <li>[3] Coinbase (2024). x402 Protocol Specification.</li>
            <li>[4] Anthropic (2024). Model Context Protocol (MCP).</li>
            <li>[5] PATH402.com (2026). Protocol Vision Document.</li>
          </ol>
        </div>
      </section>

      {/* Footer */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-zinc-600 text-sm mb-4">
            This whitepaper is released under the{' '}
            <a href="https://github.com/b0ase/path402-com/blob/main/LICENSE" className="text-blue-400 hover:text-blue-300 transition-colors">
              Open BSV License version 4
            </a>.
          </p>
          <p className="text-zinc-600 text-xs uppercase tracking-widest">
            Version 2.0.0 · February 2026 · <a href="https://path402.com" className="text-blue-400 hover:text-blue-300 transition-colors">path402.com</a>
          </p>
        </div>
      </section>
    </div>
  );
}
