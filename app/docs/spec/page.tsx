'use client';

import Link from "next/link";
import { motion } from "framer-motion";

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function ProtocolSpecPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white pt-24 pb-20 font-sans">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="mb-16 border-b border-zinc-200 dark:border-zinc-800 pb-12"
                >
                    <motion.div variants={fadeIn} className="mb-6">
                        <Link href="/docs" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                            ← Back to Docs
                        </Link>
                    </motion.div>
                    <motion.h1
                        variants={fadeIn}
                        className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4"
                    >
                        $402 Protocol Specification
                    </motion.h1>
                    <motion.div variants={fadeIn} className="flex gap-4 text-sm text-zinc-500 font-mono">
                        <span>Version: 3.0.0</span>
                        <span>Status: Living Document</span>
                    </motion.div>
                </motion.div>

                {/* Overview */}
                <Section title="Overview">
                    <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                        $402 is a protocol for tokenized attention markets. Every participant mints their own token, creating a market for their time and content. The protocol harnesses viral memecoin dynamics to bootstrap the creator economy—every domain becomes a shareholder company, every path becomes a tradable asset.
                    </p>
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800 rounded-sm">
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">The Progression</h3>
                        <ol className="list-decimal list-inside space-y-2 text-zinc-600 dark:text-zinc-400">
                            <li><strong className="text-zinc-900 dark:text-white">Content Tokenization (v1-v2)</strong>: Turn URL paths into shareholder businesses</li>
                            <li><strong className="text-zinc-900 dark:text-white">Personal Tokenization (v3)</strong>: Turn individuals into attention markets</li>
                        </ol>
                    </div>
                </Section>

                {/* Core Principles */}
                <Section title="Core Principles">
                    <ul className="grid gap-4 md:grid-cols-2">
                        {[
                            "Everyone has a token - Your token is your attention market",
                            "Fixed supply - 1 billion tokens per person (no minting/burning)",
                            "Time-based access - Tokens purchase connection time (1 token = 1 second default)",
                            "Creator-controlled float - You decide how many tokens to sell",
                            "Social bootstrapping - Friends invest in friends"
                        ].map((principle, i) => (
                            <li key={i} className="flex items-start gap-3 p-4 border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                                <span className="font-mono text-zinc-400 text-xs">0{i + 1}</span>
                                <span className="text-sm text-zinc-700 dark:text-zinc-300">{principle}</span>
                            </li>
                        ))}
                    </ul>
                </Section>

                {/* Token Economics */}
                <Section title="Token Economics">
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-zinc-500">Supply Model</h3>
                            <div className="bg-zinc-100 dark:bg-zinc-900 p-4 font-mono text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre">
                                {`Per-person supply: 1,000,000,000
No minting after genesis
No burning - tokens circulate`}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-zinc-500">Access Pricing</h3>
                            <div className="bg-zinc-100 dark:bg-zinc-900 p-4 font-mono text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre">
                                {`Base rate: 1 token = 1 second
Configurable: 1-100 tokens/sec
Multicast: Same rate, split`}
                            </div>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-zinc-500">The Economic Flow</h3>
                    <div className="bg-zinc-900 text-zinc-300 p-6 font-mono text-xs overflow-x-auto mb-8 rounded-sm">
                        {`┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  BUYER                    SELLER              CREATOR       │
│    │                        │                    │          │
│    │──── Cash ─────────────→│                    │          │
│    │←─── $CREATOR tokens ───│                    │          │
│    │                                             │          │
│    │──── $CREATOR tokens (to connect) ──────────→│          │
│    │←─── Content/Call/Stream ───────────────────│          │
│                                                             │
│  Result: Creator has CASH (from sales) + TOKENS (returned)  │
│                                                             │
└─────────────────────────────────────────────────────────────┘`}
                    </div>

                    <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-zinc-500">Creator Float Control</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                                    <th className="py-2 px-4 bg-zinc-50 dark:bg-zinc-900">Strategy</th>
                                    <th className="py-2 px-4 bg-zinc-50 dark:bg-zinc-900">Token Float</th>
                                    <th className="py-2 px-4 bg-zinc-50 dark:bg-zinc-900">Price</th>
                                    <th className="py-2 px-4 bg-zinc-50 dark:bg-zinc-900">Result</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                <tr>
                                    <td className="py-2 px-4 font-bold text-zinc-900 dark:text-white">Exclusive</td>
                                    <td className="py-2 px-4 text-zinc-600 dark:text-zinc-400">Low</td>
                                    <td className="py-2 px-4 text-zinc-600 dark:text-zinc-400">High</td>
                                    <td className="py-2 px-4 text-zinc-600 dark:text-zinc-400">Premium access</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-4 font-bold text-zinc-900 dark:text-white">Accessible</td>
                                    <td className="py-2 px-4 text-zinc-600 dark:text-zinc-400">High</td>
                                    <td className="py-2 px-4 text-zinc-600 dark:text-zinc-400">Low</td>
                                    <td className="py-2 px-4 text-zinc-600 dark:text-zinc-400">Mass audience</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-4 font-bold text-zinc-900 dark:text-white">Balanced</td>
                                    <td className="py-2 px-4 text-zinc-600 dark:text-zinc-400">Medium</td>
                                    <td className="py-2 px-4 text-zinc-600 dark:text-zinc-400">Market</td>
                                    <td className="py-2 px-4 text-zinc-600 dark:text-zinc-400">Organic</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Section>

                {/* Social Scaling */}
                <Section title="Social Scaling">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="font-mono text-sm bg-zinc-50 dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800">
                            <div className="space-y-4 text-center">
                                <div>I value my friend</div>
                                <div className="text-zinc-400">↓</div>
                                <div>I buy MORE tokens than I need</div>
                                <div className="text-zinc-400">↓</div>
                                <div>I stake tokens (earn revenue)</div>
                                <div className="text-zinc-400">↓</div>
                                <div>I complete KYC (trust anchor)</div>
                                <div className="text-zinc-400">↓</div>
                                <div className="font-bold text-emerald-600 dark:text-emerald-400">Network grows through real relationships</div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Why This Works</h3>
                            <ul className="space-y-3">
                                {[
                                    "Aligned incentives - Supporting friends = profit",
                                    "Natural liquidity - Social circles base markets",
                                    "Trust bootstrapping - KYC where trust exists",
                                    "Anti-spam - Connecting costs tokens",
                                    "No platform rent - Peer-to-peer settlement"
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-2 text-zinc-600 dark:text-zinc-400">
                                        <span className="text-emerald-500">✓</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Section>

                {/* Legal Compliance */}
                <Section title="Legal Compliance & Liability">
                    <div className="bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 p-6">
                        <h3 className="text-amber-800 dark:text-amber-500 font-bold uppercase tracking-widest text-xs mb-3">Corporate Register vs Token Ownership</h3>
                        <p className="text-amber-900/80 dark:text-amber-100/80 mb-4 leading-relaxed">
                            The company has liability and must produce a confirmation statement each year showing an up-to-date register of members. However, Members can trade tokens that act as a claim on their shares without permission.
                        </p>
                        <p className="text-amber-900/80 dark:text-amber-100/80 leading-relaxed">
                            So while the confirmation statement may say Alice holds Title, she may have already sold her interest to Bob, who has already sold it to Charlie. The confirmation statement says Alice owns the share on the register, but that is still legally compliant, even though the reality is that Charlie holds the asset. As long as each individual pays their own taxes, they are compliant too.
                        </p>
                    </div>
                </Section>

                {/* BSV Implementation */}
                <Section title="BSV Implementation">
                    <div className="mb-6">
                        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                            Why BSV? It is the only chain capable of micropayments at the scale required for 1 token/second streaming.
                        </p>
                        <table className="w-full text-sm border-collapse mb-8">
                            <thead>
                                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                    <th className="py-2 text-left bg-zinc-50 dark:bg-zinc-900 px-4">Requirement</th>
                                    <th className="py-2 text-left bg-zinc-50 dark:bg-zinc-900 px-4 text-emerald-600">BSV</th>
                                    <th className="py-2 text-left bg-zinc-50 dark:bg-zinc-900 px-4 text-red-500">ETH/Others</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                <tr>
                                    <td className="py-2 px-4">1 token/sec cost</td>
                                    <td className="py-2 px-4 text-emerald-600">{'<'}0.001¢ fees</td>
                                    <td className="py-2 px-4 text-red-500">$0.50+ fees</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-4">Settlement</td>
                                    <td className="py-2 px-4 text-emerald-600">Instant</td>
                                    <td className="py-2 px-4 text-red-500">Block times</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-4">Scalability</td>
                                    <td className="py-2 px-4 text-emerald-600">Unbounded</td>
                                    <td className="py-2 px-4 text-red-500">Gas limits</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="border border-zinc-200 dark:border-zinc-800 p-4">
                                <h4 className="font-bold mb-2 text-xs uppercase text-zinc-500">On-chain (BSV)</h4>
                                <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                                    <li>Token genesis (1bn supply)</li>
                                    <li>Large transfers</li>
                                    <li>Staking/unstaking</li>
                                    <li>Dividend distributions</li>
                                    <li>KYC attestations</li>
                                </ul>
                            </div>
                            <div className="border border-zinc-200 dark:border-zinc-800 p-4">
                                <h4 className="font-bold mb-2 text-xs uppercase text-zinc-500">Off-chain (Gossip)</h4>
                                <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                                    <li>Connection handshakes</li>
                                    <li>Micro-transfers during calls</li>
                                    <li>Real-time balance updates</li>
                                    <li>Periodic settlement</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* BRC Standards Alignment */}
                <Section title="BRC Standards Alignment">
                    <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                        $402 is built on the modern Bitcoin SV stack, adhering to established standards (BRCs) to ensure maximum interoperability with wallets, indexers, and other peer-to-peer services.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { id: '105', title: 'Payment Handshake', desc: 'Normative 402 challenge/response flow using headers.' },
                            { id: '104', title: 'HTTP Auth', desc: 'Secure mutual authentication for gated content sessions.' },
                            { id: '103', title: 'Identity', desc: 'Peer-to-peer certificate exchange and identity proof.' },
                            { id: '100', title: 'Wallet Interface', desc: 'Universal integration with compliant wallet providers.' },
                            { id: '24', title: 'Lookup Overlays', desc: 'Scalable indexing and viral content discovery.' },
                            { id: '22', title: 'Topic Managers', desc: 'Protocol-specific content propagation logic.' },
                        ].map((brc) => (
                            <div key={brc.id} className="p-4 border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50">
                                <div className="text-xs font-bold text-zinc-400 mb-1">BRC-{brc.id}</div>
                                <div className="font-bold text-sm mb-1">{brc.title}</div>
                                <div className="text-xs text-zinc-500">{brc.desc}</div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Ticket Stamp Chains */}
                <Section title="Ticket Stamp Chains: The Indexer Solution">
                    <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                        Tickets accumulate cryptographic stamps as they're validated and used, creating a trust layer that solves the indexer incentive problem through pure Bitcoin economics.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-zinc-50 dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800">
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-zinc-500">The Problem</h3>
                            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                                <li className="flex gap-2"><span>1.</span> Validation costs indexers resources</li>
                                <li className="flex gap-2"><span>2.</span> If creators keep 100%, indexers starve</li>
                                <li className="flex gap-2"><span>3.</span> System needs speed, speed needs indexers</li>
                            </ul>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800">
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-zinc-500">The Solution</h3>
                            <div className="text-2xl font-bold mb-2">95/5 Split</div>
                            <p className="text-sm text-zinc-500">
                                Creators keep 95%. Indexers earn 5% fee for every stamp (validation). Market forces prioritize viral content naturally. No bootstrap token required.
                            </p>
                        </div>
                    </div>

                    <div className="border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-900 rounded-sm">
                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-center">Trust Accumulation</h3>
                        <div className="flex flex-wrap gap-4 items-center justify-between text-center max-w-2xl mx-auto">
                            <div className="p-4 bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800 flex-1 min-w-[120px]">
                                <div className="text-xs text-zinc-400 mb-1">0 Stamps</div>
                                <div className="font-bold">Base Price</div>
                            </div>
                            <div className="hidden sm:block text-zinc-300">→</div>
                            <div className="p-4 bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800 flex-1 min-w-[120px]">
                                <div className="text-xs text-zinc-400 mb-1">100 Stamps</div>
                                <div className="font-bold text-emerald-600">+30% Trust</div>
                            </div>
                            <div className="hidden sm:block text-zinc-300">→</div>
                            <div className="p-4 bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800 flex-1 min-w-[120px]">
                                <div className="text-xs text-zinc-400 mb-1">1000 Stamps</div>
                                <div className="font-bold text-emerald-500">+100% Viral Hit</div>
                            </div>
                        </div>
                        <p className="mt-6 text-xs text-zinc-500 uppercase tracking-widest text-center">
                            Stamps ARE the proof of work
                        </p>
                    </div>
                </Section>

            </div>
        </div>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeIn}
            className="mb-20"
        >
            <h2 className="text-2xl font-bold mb-8 pb-4 border-b border-zinc-100 dark:border-zinc-900 text-zinc-900 dark:text-white">
                {title}
            </h2>
            {children}
        </motion.section>
    );
}
