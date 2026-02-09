'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

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

function WhitepaperContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Auto-trigger print dialog when ?download=true
    if (searchParams.get('download') === 'true') {
      // Small delay to ensure page is fully rendered
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white font-mono selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black pt-14">
      {/* Header */}
      <section className="relative py-24 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto">
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
              WHITEPAPER_V3.0.0
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-2"
              variants={fadeIn}
            >
              $<span className="text-zinc-500">402</span>
            </motion.h1>

            <motion.p
              className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-4"
              variants={fadeIn}
            >
              Access Tokens for the Open Web
            </motion.p>

            <motion.p
              className="text-zinc-400 max-w-2xl mb-4 text-lg"
              variants={fadeIn}
            >
              Tokenize anything addressable: your attention, your API, your content
            </motion.p>

            <motion.div
              className="flex items-center gap-4 text-zinc-500 text-sm mb-6"
              variants={fadeIn}
            >
              <a href="https://x.com/b0ase" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                @b0ase
              </a>
              <span>·</span>
              <span>February 2026</span>
            </motion.div>

            <motion.div
              className="flex items-center gap-3"
              variants={fadeIn}
            >
              <a
                href="/whitepaper/academic"
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF (Academic)
              </a>
              <span className="text-zinc-400 text-xs">Bitcoin-style format</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Abstract */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[10px] font-bold text-zinc-500 mb-6 uppercase tracking-widest">Abstract</h2>
          <p className="text-zinc-400 leading-relaxed">
            We propose a protocol where any addressable endpoint—a person, a domain, an API—can become a <em className="text-zinc-900 dark:text-white">tokenized market</em>.
            Mint <span className="text-blue-400 font-mono">$YOURNAME</span> and tokenize your attention. Mint <span className="text-blue-400 font-mono">$yourdomain.com</span> and tokenize your content.
            Holders who stake become <em className="text-zinc-900 dark:text-white">partners</em>—running infrastructure,
            indexing the blockchain, serving the registry, and receiving dividends. The result is a self-sustaining flywheel where buying, serving, and staking
            are the same activity at different stages. No separate classes. No central infrastructure.
            Just aligned incentives all the way down.
          </p>
        </div>
      </section>

      {/* The Core Idea */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-6 uppercase tracking-wide">The Core Idea</h2>
          <p className="text-zinc-400 leading-relaxed mb-6">
            HTTP 402 "Payment Required" was reserved in 1999 but never defined. The $402 protocol finally gives it meaning:
          </p>
          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 text-center mb-6">
            <p className="text-2xl text-zinc-900 dark:text-white font-bold mb-2">
              Any addressable endpoint is a market.
            </p>
            <p className="text-2xl text-zinc-900 dark:text-white font-bold mb-2">
              Every buyer becomes a shareholder.
            </p>
            <p className="text-2xl text-zinc-900 dark:text-white font-bold">
              Every shareholder can become a partner.
            </p>
          </div>
          <p className="text-zinc-400 leading-relaxed mb-4">
            The <span className="text-zinc-900 dark:text-white font-mono">$</span> prefix marks a path as an economic entity. Two models, one protocol:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-black">
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Personal Tokens</div>
              <div className="space-y-1 font-mono text-blue-400">
                <div>$alice</div>
                <div>$bob</div>
                <div>$charlie</div>
              </div>
              <p className="text-zinc-500 text-sm mt-3">Your time is the asset. 1 token = 1 second.</p>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-black">
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Domain Tokens</div>
              <div className="space-y-1 font-mono text-blue-400">
                <div>$charlie.com</div>
                <div>$charlie.com/$alice</div>
                <div>$charlie.com/$alice/$blog</div>
              </div>
              <p className="text-zinc-500 text-sm mt-3">Paths are attribution chains. DNS proves the root. Each <span className="font-mono">/</span> is a business relationship.</p>
            </div>
          </div>
          <p className="text-zinc-400 leading-relaxed">
            Each is a separate market with its own tokens, price curve, and shareholders. The same primitive works for human attention and digital assets.
          </p>
        </div>
      </section>

      {/* The Flywheel */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto">
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
        <div className="max-w-7xl mx-auto">
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
        <div className="max-w-7xl mx-auto">
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
        <div className="max-w-7xl mx-auto">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide">Step 3</h2>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Pricing Curves</h3>

          <p className="text-zinc-400 leading-relaxed mb-6">
            $402 doesn't mandate one pricing model. It defines <em className="text-zinc-900 dark:text-white">how to express</em> pricing models.
          </p>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">sqrt_decay (Default)</h4>
          <p className="text-zinc-400 leading-relaxed mb-6">
            <strong className="text-zinc-900 dark:text-white">Two variants</strong> with different dynamics:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-950">
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Investment (Treasury)</div>
              <div className="text-zinc-900 dark:text-white font-mono text-sm mb-2">price = base / √(treasury + 1)</div>
              <div className="text-zinc-900 dark:text-white mb-2">Price <strong>increases</strong> as treasury depletes</div>
              <div className="text-zinc-400 text-sm">Early buyers get cheap tokens. Rewards early belief.</div>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-950">
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Content (Supply)</div>
              <div className="text-zinc-900 dark:text-white font-mono text-sm mb-2">price = base / √(supply + 1)</div>
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
        <div className="max-w-7xl mx-auto">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide">Step 4</h2>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Paths as Economic Entities</h3>

          <p className="text-zinc-400 leading-relaxed mb-6">
            Every URL path can become a tokenized entity. The <span className="font-mono text-zinc-900 dark:text-white">$</span> prefix means: "this path is a shareholder business."
          </p>

          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
            {`$charlie.com                        → Charlie's domain (editor/publisher)
$charlie.com/$alice                 → Alice's workspace under Charlie
$charlie.com/$alice/$blog           → Alice's blog vertical
$charlie.com/$alice/$blog/$post-1   → Specific deliverable`}
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
        <div className="max-w-7xl mx-auto">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide">Step 5</h2>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Hierarchical Ownership</h3>

          <p className="text-zinc-400 leading-relaxed mb-6">
            A domain is a business with a corporate structure. Child paths are subsidiaries.
          </p>

          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
            {`$charlie.com                              ← Charlie's domain (editor)
├── $charlie.com/$alice                  ← Alice's workspace
│   ├── $charlie.com/$alice/$blog        ← Alice's blog vertical
│   │   └── $charlie.com/$alice/$blog/$post-1  ← Specific post
│   └── $charlie.com/$alice/$api         ← Alice's API
├── $charlie.com/$bob                    ← Bob's workspace
│   ├── $charlie.com/$bob/$research      ← Bob's research feed
│   └── $charlie.com/$bob/$data          ← Bob's data products
└── $charlie.com/$premium                ← Premium content tier`}
          </pre>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">The 50% Rule</h4>
          <p className="text-zinc-400 leading-relaxed mb-6">
            When a child path is created, <strong className="text-zinc-900 dark:text-white">50% of tokens go to the parent</strong>.
          </p>

          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
            {`$charlie.com/$alice created with 1,000,000 tokens:
  → 500,000 go to $charlie.com (Charlie takes editorial cut)
  → 500,000 available for sale

$charlie.com/$alice/$blog created:
  → 500,000 go to $charlie.com/$alice (Alice takes creator cut)
  → 500,000 available for sale
  → Charlie owns 50% of $charlie.com/$alice, so indirectly owns 250,000

Every / in the path is a business relationship with revenue flowing UP.`}
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
        <div className="max-w-7xl mx-auto">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide">Step 6</h2>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Extensibility</h3>

          <p className="text-zinc-400 leading-relaxed mb-6">
            $402 is a <strong className="text-zinc-900 dark:text-white">core + extensions</strong> architecture. The simplest token:
          </p>

          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
            {`{
  "p": "$402",
  "version": "1.0",
  "path": "$charlie.com",
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
        <div className="max-w-7xl mx-auto">
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
            {`Small publisher ($alice.com):
  → 1-2 stakers sufficient
  → Low revenue, Alice might self-stake

Large editor ($charlie.com with 20 writers):
  → Many stakers compete
  → High revenue from all nested workspaces
  → Stakers earn from every /$writer/$content beneath`}
          </pre>

          <p className="text-zinc-400 leading-relaxed">
            <strong className="text-zinc-900 dark:text-white">No central indexer needed.</strong> Every domain has partners with incentives to keep it running.
            The network becomes self-sustaining.
          </p>
        </div>
      </section>

      {/* Step 8: AI Agents and x402 */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto">
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

      {/* Step 9: Network Incentives */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide">Step 9</h2>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Network Incentives: The path402d Daemon</h3>

          <p className="text-zinc-400 leading-relaxed mb-6">
            Bitcoin has <span className="font-mono text-blue-400">bitcoind</span>. The $402 network has <span className="font-mono text-blue-400">path402d</span>.
          </p>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">What is path402d?</h4>
          <p className="text-zinc-400 leading-relaxed mb-4">
            The <strong className="text-zinc-900 dark:text-white">path402d daemon</strong> is the indexing and serving software that powers the $402 network.
            Anyone can download and run it. Those who do become <em className="text-zinc-900 dark:text-white">network nodes</em>.
          </p>

          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
            {`path402d does four things:

1. INDEXES  → Reads BSV blockchain, tracks all $402 tokens
2. VALIDATES → Confirms token ownership before serving content
3. SERVES   → Delivers content to verified token holders
4. EARNS    → Receives $402 rewards for computational work`}
          </pre>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">Future: Network Index Token (Optional)</h4>
          <div className="border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 p-4 mb-6">
            <p className="text-amber-800 dark:text-amber-400 text-sm">
              <strong>Note:</strong> This section describes a <em>possible future development</em> for the production version of path402d.
              It is not part of the current protocol specification.
            </p>
          </div>

          <p className="text-zinc-400 leading-relaxed mb-6">
            A network-wide <span className="font-mono text-blue-400">$402</span> token could serve as the "root" token of the entire $402 ecosystem—granting
            indexing access to all child tokens. This would subsidize the network through PoW mining.
          </p>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">Why PoW?</h4>
          <p className="text-zinc-400 leading-relaxed mb-6">
            <strong className="text-zinc-900 dark:text-white">Not to waste energy—to force operators into the open.</strong> The same reason Bitcoin uses PoW:
            <em className="text-zinc-900 dark:text-white"> to deanonymize nodes by making them large</em>.
          </p>

          <p className="text-zinc-400 leading-relaxed mb-6">
            Small anonymous nodes can hide. Large PoW-mining nodes cannot. They must invest in infrastructure,
            pay electricity bills, register with ISPs. This creates accountability through scale.
          </p>

          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
            {`PoW20 forces visibility:

1. To earn $402 rewards, nodes must mine
2. Mining requires scale and investment
3. Scale requires identity (ISP accounts, electricity contracts)
4. Identity creates accountability

Result: Big indexers can't hide. Users know who they're trusting.`}
          </pre>

          <p className="text-zinc-400 leading-relaxed mb-6">
            Data vendors have biases. A corporate node might promote sponsors. A regional node might follow local regulations.
            <strong className="text-zinc-900 dark:text-white"> This is not a bug—it's a feature we expose.</strong>
            Users can compare nodes and choose who to trust, because PoW forces them to be visible.
          </p>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">Token as Perpetual Access</h4>
          <p className="text-zinc-400 leading-relaxed mb-4">
            The token model works like a <strong className="text-zinc-900 dark:text-white">shareholder meeting pass</strong>:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Shareholder Meeting</th>
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">$402 Token</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr className="border-b border-zinc-800">
                  <td className="py-3">Share certificate</td>
                  <td className="py-3">BSV-21 token</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3">Entry to meeting</td>
                  <td className="py-3">Access to content</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3">Not burned on entry</td>
                  <td className="py-3 text-green-400">Not burned on access</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3">Dynamic information</td>
                  <td className="py-3">Dynamic content stream</td>
                </tr>
                <tr>
                  <td className="py-3">Resellable share</td>
                  <td className="py-3 text-green-400">Tradeable token</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-zinc-400 leading-relaxed mb-6">
            The token is a <strong className="text-zinc-900 dark:text-white">perpetual pass</strong> because the content is a <strong className="text-zinc-900 dark:text-white">living stream</strong>.
            Shareholder meetings provide ongoing value as long as you hold shares. $402 content works the same way.
          </p>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">Browser as Wallet (BRC-100)</h4>
          <p className="text-zinc-400 leading-relaxed mb-4">
            How does the browser talk to path402d? Through the <span className="font-mono text-blue-400">BRC-100</span> wallet interface.
          </p>

          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
            {`┌──────────────┐         BRC-100          ┌──────────────┐
│              │◄────────────────────────►│              │
│   BROWSER    │    wallet-app spec       │    path402d    │
│   (wallet)   │                          │   (server)   │
│              │                          │              │
│  Holds:      │         Request:         │  Validates:  │
│  - $402 tokens│     "I hold 5 $BLOG"    │  - Ownership │
│  - Identity  │         Response:        │  - Serves    │
│              │     "Access granted"     │    content   │
└──────────────┘                          └──────────────┘`}
          </pre>

          <p className="text-zinc-400 leading-relaxed mb-4">
            BRC-100 defines:
          </p>
          <ul className="space-y-2 text-zinc-400 mb-6">
            <li className="flex gap-3">
              <span className="text-blue-400">→</span>
              <span><strong className="text-zinc-900 dark:text-white">createAction</strong> — Construct transactions</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400">→</span>
              <span><strong className="text-zinc-900 dark:text-white">createSignature</strong> — Prove ownership</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400">→</span>
              <span><strong className="text-zinc-900 dark:text-white">listOutputs</strong> — Query token holdings</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400">→</span>
              <span><strong className="text-zinc-900 dark:text-white">acquireCertificate</strong> — Identity verification</span>
            </li>
          </ul>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">The Complete Stack</h4>
          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
            {`Layer 0: BitcoinSV           ← 1M+ TPS base layer
    ↓
Layer 1: BSV-21 + PoW20      ← Token standard + mining
    ↓
Layer 2: path402d Network      ← Indexers serving content
    ↓
Interface: BRC-100           ← Browser ↔ path402d
    ↓
Application: $402 Protocol   ← Paths, tokens, dividends`}
          </pre>

          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-center">
            <p className="text-zinc-500 text-sm mb-2">Install the package:</p>
            <p className="text-zinc-900 dark:text-white text-lg font-mono mb-4">
              npm install -g path402
            </p>
            <p className="text-zinc-500 text-sm mb-2">Start the daemon:</p>
            <p className="text-zinc-900 dark:text-white text-lg font-mono mb-4">
              path402d start
            </p>
            <p className="text-zinc-500 text-sm">
              Index the blockchain. Serve content. Earn rewards.
            </p>
          </div>
        </div>
      </section>

      {/* Step 10: The Content Market */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide">Step 10</h2>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">The Content Market: Narratives as Assets</h3>

          <p className="text-zinc-400 leading-relaxed mb-6">
            Content isn't just consumed. It's <strong className="text-zinc-900 dark:text-white">traded</strong>. Each inscription is a speculative asset
            in a marketplace of ideas. Bots and humans compete to control narratives through economic means.
          </p>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">The Narrative Game</h4>
          <p className="text-zinc-400 leading-relaxed mb-4">
            <strong className="text-zinc-900 dark:text-white">Sellers spread narrative. Buyers can suppress it.</strong>
          </p>

          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
            {`Alice SELLS content to Bob's audience
  → Bob's followers buy → They read Alice's perspective
  → Alice wins by DISTRIBUTING widely

Threatened party sees damaging content
  → Races to buy 51%+ of tokens
  → If successful → Can EMBARGO the content
  → Suppression is expensive and VISIBLE`}
          </pre>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">Token Control Thresholds</h4>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Stake</th>
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Power</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr className="border-b border-zinc-800">
                  <td className="py-3">&lt;50%</td>
                  <td className="py-3">Access only — can read, cannot control</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3 text-zinc-900 dark:text-white font-bold">51%</td>
                  <td className="py-3">Majority — can vote to embargo, control serving</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3 text-zinc-900 dark:text-white font-bold">67%</td>
                  <td className="py-3">Supermajority — can change pricing, access rules</td>
                </tr>
                <tr>
                  <td className="py-3 text-zinc-900 dark:text-white font-bold">100%</td>
                  <td className="py-3">Complete control — name any price, or never serve</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">The Hostile Takeover Race</h4>
          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
            {`Damaging content inscribed at t=0

t=1min:  Threatened party detects it
t=2min:  Starts buying aggressively
t=3min:  Price rising fast (demand signal)
t=4min:  Counter-buyers notice the race
t=5min:  Preservers jump in to block takeover
t=10min: Who reaches 51% first?

SUPPRESSOR WINS → Content embargoed
PRESERVERS WIN  → Content spreads widely`}
          </pre>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">Transparent Censorship</h4>
          <p className="text-zinc-400 leading-relaxed mb-4">
            Unlike traditional censorship (invisible), $402 censorship is <strong className="text-zinc-900 dark:text-white">on-chain and visible</strong>:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Traditional</th>
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">$402</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr className="border-b border-zinc-800">
                  <td className="py-3">Content disappears</td>
                  <td className="py-3 text-green-400">Inscription permanent, serving blocked</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3">Unknown who censored</td>
                  <td className="py-3 text-green-400">Buyer on-chain record</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3">No recourse</td>
                  <td className="py-3 text-green-400">Counter-buyers can race</td>
                </tr>
                <tr>
                  <td className="py-3">Free to censor</td>
                  <td className="py-3 text-green-400">Suppression is expensive</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">The Economics of Suppression</h4>
          <p className="text-zinc-400 leading-relaxed mb-4">
            Suppressing content is <strong className="text-zinc-900 dark:text-white">expensive</strong> — and the creator gets paid:
          </p>

          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
            {`To acquire 51% of 1,000,000 tokens (sqrt_decay):
  First 100k tokens:  ~95,000,000 sats
  Next 200k tokens:   ~160,000,000 sats
  Next 210k tokens:   ~136,000,000 sats
  ─────────────────────────────────────
  Total: ~391,000,000 sats (~$40,000)

The creator receives payment for every token sold.
Suppression FUNDS the person being silenced.`}
          </pre>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">Bots as First Movers</h4>
          <p className="text-zinc-400 leading-relaxed mb-4">
            Bots dominate the early market because they're faster:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Human</th>
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Bot</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr className="border-b border-zinc-800">
                  <td className="py-3">Reads one article</td>
                  <td className="py-3 text-green-400">Scans thousands/second</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3">Emotional decisions</td>
                  <td className="py-3 text-green-400">Pure agenda optimization</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3">Sleeps 8 hours</td>
                  <td className="py-3 text-green-400">24/7 operation</td>
                </tr>
                <tr>
                  <td className="py-3">Misses early pricing</td>
                  <td className="py-3 text-green-400">Catches every mint</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-zinc-400 leading-relaxed">
            <strong className="text-zinc-900 dark:text-white">The result:</strong> A speculative content market where economic demand
            is the quality signal. Multiple agendas compete through capital. The agenda war becomes visible, economic, and honest.
          </p>
        </div>
      </section>

      {/* Step 11: Personal Tokens - The Attention Economy */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-wide">Step 11</h2>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Personal Tokens: The Attention Economy</h3>

          <p className="text-zinc-400 leading-relaxed mb-6">
            So far, we've talked about tokenizing <em className="text-zinc-900 dark:text-white">content</em>.
            But the most valuable thing isn't content—it's <strong className="text-zinc-900 dark:text-white">attention</strong>.
            Human attention is the ultimate scarce resource.
          </p>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">Everyone Has a Token</h4>
          <p className="text-zinc-400 leading-relaxed mb-4">
            In the attention economy, every person mints their own token:
          </p>

          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
            {`$alice       → Alice's attention token
$bob         → Bob's attention token
$charlie     → Charlie's attention token

Your token = The canonical path to opening a connection with YOU`}
          </pre>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">Fixed Supply, Time-Based Access</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-950">
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Token Economics</div>
              <ul className="text-zinc-400 text-sm space-y-1">
                <li>• <strong className="text-zinc-900 dark:text-white">1 billion tokens</strong> per person (fixed)</li>
                <li>• No minting after genesis</li>
                <li>• No burning—tokens circulate</li>
                <li>• Creator controls float (how many to sell)</li>
              </ul>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-950">
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Access Pricing</div>
              <ul className="text-zinc-400 text-sm space-y-1">
                <li>• <strong className="text-zinc-900 dark:text-white">1 token = 1 second</strong> of connection</li>
                <li>• Configurable rate (1-100 tokens/sec)</li>
                <li>• Tokens are <em>tickets</em>, not spent on use</li>
                <li>• Return to holder after connection ends</li>
              </ul>
            </div>
          </div>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">Tokens as Reusable Tickets</h4>
          <p className="text-zinc-400 leading-relaxed mb-4">
            The token model is like a <strong className="text-zinc-900 dark:text-white">shareholder meeting pass</strong>—not a consumable:
          </p>

          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
            {`You hold 3600 $RICHARD tokens
    ↓
You can open a 1-hour connection with Richard
    ↓
After the call, you STILL hold 3600 tokens
    ↓
You can call again tomorrow, or sell to someone else

The token is perpetual access, not a consumable.
Like owning a share—you can attend meetings forever.`}
          </pre>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">Social Scaling: Friends Invest in Friends</h4>
          <p className="text-zinc-400 leading-relaxed mb-4">
            The network scales through <strong className="text-zinc-900 dark:text-white">genuine relationships</strong>, not viral mechanics:
          </p>

          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
            {`I value my friend
       ↓
I buy MORE tokens than I need for calls
       ↓
I stake tokens (earn from their success)
       ↓
I complete KYC (because I trust them)
       ↓
They succeed → I profit + maintain access
       ↓
Network grows through real relationships`}
          </pre>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">Asymmetric Value Calls</h4>
          <p className="text-zinc-400 leading-relaxed mb-4">
            When two people call, their token values create natural economics:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Scenario</th>
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Economics</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr className="border-b border-zinc-800">
                  <td className="py-3">$alice = 1000 sats/token<br />$bob = 100 sats/token</td>
                  <td className="py-3">Both spend each other's tokens during call</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3">Bob calls Alice</td>
                  <td className="py-3">Bob spends expensive $alice<br />Alice spends cheap $bob<br /><span className="text-green-400">Net: Bob pays ~900 sats/sec to talk to Alice</span></td>
                </tr>
                <tr>
                  <td className="py-3">Alice calls Bob</td>
                  <td className="py-3">Alice spends cheap $bob<br />Bob spends expensive $alice<br /><span className="text-green-400">Net: Alice earns ~900 sats/sec</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">Staking & Dividends</h4>
          <p className="text-zinc-400 leading-relaxed mb-4">
            Stake tokens to earn from someone's future success. The model is <strong className="text-zinc-900 dark:text-white">amount-based</strong> (not time-based):
          </p>

          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
            {`Your dividend = (your_staked / total_staked) × period_revenue

Simple. Fair. No gaming.

Revenue Split (Configurable by creator):
├── Creator wallet (95%)
└── Indexer Reward (5%)`}
          </pre>

          <p className="text-zinc-400 leading-relaxed mb-6">
            <strong className="text-zinc-900 dark:text-white">KYC required for dividends.</strong> Basic token holding is permissionless—anyone can buy and trade.
            But claiming dividends requires identity verification. This creates a natural compliance layer where money flows out.
          </p>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">Proof of Serve (Not Proof of Work)</h4>
          <p className="text-zinc-400 leading-relaxed mb-4">
            How do we incentivize network participation? Not through wasteful hash puzzles—through <strong className="text-zinc-900 dark:text-white">actual contribution</strong>:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Proof of Work</th>
                  <th className="text-left py-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Proof of Serve</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr className="border-b border-zinc-800">
                  <td className="py-3">Rewards hash computation</td>
                  <td className="py-3 text-green-400">Rewards actual service</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3">Wastes electricity</td>
                  <td className="py-3 text-green-400">Uses real network work</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-3">Centralizes to ASICs</td>
                  <td className="py-3 text-green-400">Scales with actual usage</td>
                </tr>
                <tr>
                  <td className="py-3">One winner per block</td>
                  <td className="py-3 text-green-400">Everyone who serves earns</td>
                </tr>
              </tbody>
            </table>
          </div>

          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
            {`Serve Reward Actions:
├── SERVE   → Deliver content to requesters
├── RELAY   → Forward gossip messages
├── INDEX   → Maintain accurate token indexes
└── VALIDATE → Verify transactions

Reward = (your_serves / total_network_serves) × daily_pool

Proof of Serve creates healthy incentives without centralization.
Each serve generates a **BRC-104 Signed Stamp**, which is gossiped via **BRC-22 Topic Managers** to provide verifiable social proof of work.`}
          </pre>

          <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">The End State</h4>
          <p className="text-zinc-400 leading-relaxed mb-4">
            Personal tokens create a world where:
          </p>

          <ul className="space-y-2 text-zinc-400 mb-6">
            <li className="flex gap-3">
              <span className="text-blue-400">→</span>
              <span><strong className="text-zinc-900 dark:text-white">Everyone has a price</strong> — Your token represents your time's market value</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400">→</span>
              <span><strong className="text-zinc-900 dark:text-white">Friends invest in friends</strong> — Social relationships create liquidity</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400">→</span>
              <span><strong className="text-zinc-900 dark:text-white">Creators control access</strong> — Your float, your rules</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400">→</span>
              <span><strong className="text-zinc-900 dark:text-white">Spam is impossible</strong> — Connecting costs tokens (economic friction)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400">→</span>
              <span><strong className="text-zinc-900 dark:text-white">No platform rent</strong> — Direct peer-to-peer settlement</span>
            </li>
          </ul>

          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-center">
            <p className="text-zinc-500 text-sm mb-2">Mint your token:</p>
            <p className="text-zinc-900 dark:text-white text-lg font-mono">
              $YOURNAME
            </p>
            <p className="text-zinc-500 text-sm mt-2">
              1 billion tokens. Fixed supply. Your attention, tokenized.
            </p>
          </div>
        </div>
      </section>

      {/* Implementation */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-6 uppercase tracking-wide">Implementation</h2>

          <h3 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">HTTP 402 Response (BRC-105)</h3>
          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
            {`HTTP/1.1 402 Payment Required
x-bsv-payment-version: 1.0.0
x-bsv-payment-satoshis-required: 4500
x-bsv-payment-derivation-prefix: <unique_nonce>

{
  "price_sats": 4500,
  "token": "$charlie.com/$alice/$blog",
  "identity": "<server_pubkey>",
  "accepts": ["bsv", "base", "sol", "eth"]
}`}
          </pre>

          <h3 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">Client Response (BRC-104/105)</h3>
          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
            {`GET /some/path HTTP/1.1
Host: charlie.com
x-bsv-auth-identity-key: <client_pubkey>
x-bsv-auth-signature: <sig>
x-bsv-payment: { transaction, derivationSuffix }`}
          </pre>

          <h3 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-widest">Discovery Endpoint</h3>
          <p className="text-zinc-400 leading-relaxed mb-4">
            Every $402 domain exposes <span className="font-mono text-blue-400">/.well-known/$402.json</span>:
          </p>
          <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-sm overflow-x-auto text-zinc-400 mb-6">
            {`{
  "$402_version": "2.0",
  "extensions": ["$402-curves", "$402-hierarchy"],
  "root": {
    "path": "$charlie.com",
    "inscription_id": "abc123..."
  },
  "children": [
    { "path": "$charlie.com/$alice", "inscription_id": "def456..." }
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

      {/* Conclusion */}
      <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto">
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
        <div className="max-w-7xl mx-auto">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-6 uppercase tracking-wide">References</h2>
          <ol className="space-y-2 text-zinc-500 text-sm">
            <li>[1] Nakamoto, S. (2008). Bitcoin: A Peer-to-Peer Electronic Cash System.</li>
            <li>[2] RFC 2616 (1999). HTTP/1.1 Status Code 402 Payment Required.</li>
            <li>[3] Coinbase (2024). x402 Protocol Specification.</li>
            <li>[4] Anthropic (2024). Model Context Protocol (MCP).</li>
            <li>[5] PATH402.com (2026). Protocol Vision Document.</li>
            <li>[6] 1Sat Ordinals (2024). BSV-21 Token Standard. docs.1satordinals.com</li>
            <li>[7] POW-20 Protocol (2024). Layer-1 tokens backed by proof-of-work. protocol.pow20.io</li>
            <li>[8] BRC-105 (2025). Normative 402 Payment Handshake. bsv.brc.dev/payment/0105</li>
            <li>[9] BRC-104 (2025). Authenticated HTTP Sessions. bsv.brc.dev/auth/0104</li>
            <li>[10] BRC-100 (2025). Wallet-to-Application Interface. bsv.brc.dev/wallet/0100</li>
            <li>[11] BRC-24 (2025). Overlay Lookup Services. bsv.brc.dev/indexing/0024</li>
          </ol>
        </div>
      </section>

      {/* Footer */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-zinc-600 text-sm mb-4">
            This whitepaper is released under the{' '}
            <a href="https://github.com/b0ase/path402-com/blob/main/LICENSE" className="text-blue-400 hover:text-blue-300 transition-colors">
              Open BSV License version 4
            </a>.
          </p>
          <p className="text-zinc-600 text-xs uppercase tracking-widest">
            Version 3.0.0 · February 2026 · <a href="https://path402.com" className="text-blue-400 hover:text-blue-300 transition-colors">path402.com</a>
          </p>
        </div>
      </section>
    </div>
  );
}

export default function WhitepaperPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-black" />}>
      <WhitepaperContent />
    </Suspense>
  );
}
