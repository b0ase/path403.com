'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiActivity, FiZap, FiArrowRight, FiTarget, FiDollarSign } from 'react-icons/fi';
import { formatNumber } from '@/lib/tokenomics/bonding-curve';

export default function PriceCurvesPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto mb-20">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-5xl md:text-7xl font-bold font-orbitron mb-6 uppercase tracking-tighter">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Price</span> Curves
                    </h1>
                    <p className="text-xl text-zinc-400 leading-relaxed font-light">
                        Kintsugi isn't just crowdfunding. It's <span className="text-white font-medium">Algorithmic Valuation</span>.
                        We use specific bonding curves to match the risk profile of different project types.
                        From rigorous enterprise apps to explosive vibecoins.
                    </p>
                </div>

                {/* The Three Curves */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Curve 1: Standard / Linear */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all group"
                    >
                        <div className="h-48 bg-gradient-to-b from-blue-900/20 to-transparent p-6 relative">
                            <FiTrendingUp className="absolute top-6 right-6 text-4xl text-blue-500 opacity-50" />
                            <div className="absolute bottom-0 left-0 right-0 h-1/2 flex items-end px-6 pb-6">
                                {/* Visual Representation of Linear */}
                                <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                                    <line x1="0" y1="50" x2="100" y2="10" stroke="#3b82f6" strokeWidth="3" />
                                    <circle cx="0" cy="50" r="3" fill="#3b82f6" />
                                    <circle cx="50" cy="30" r="3" fill="#3b82f6" />
                                    <circle cx="100" cy="10" r="3" fill="#3b82f6" />
                                </svg>
                            </div>
                        </div>
                        <div className="p-8">
                            <h3 className="text-2xl font-bold mb-2 font-mono uppercase text-blue-400">Standard</h3>
                            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-6">Linear Valuation Growth</p>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3">
                                    <FiTarget className="mt-1 text-blue-500" />
                                    <div>
                                        <span className="block font-bold text-zinc-200">Uniform Cost</span>
                                        <span className="text-sm text-zinc-400">Every 1% costs the same (e.g. £1,000).</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <FiDollarSign className="mt-1 text-blue-500" />
                                    <div>
                                        <span className="block font-bold text-zinc-200">Predictable Cap Table</span>
                                        <span className="text-sm text-zinc-400">Valuation is fixed for the duration of the round.</span>
                                    </div>
                                </li>
                            </ul>

                            <div className="bg-black/50 p-4 rounded-xl border border-zinc-800 font-mono text-xs text-zinc-400">
                                <div>Tranche 1 (10%): £1,000</div>
                                <div>Tranche 2 (10%): £1,000</div>
                                <div>Tranche 3 (10%): £1,000</div>
                                <div className="text-blue-500 mt-2">Valuation: Flat £100k</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Curve 2: Bitcoin Apps / Step-Doubling */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden hover:border-purple-500/50 transition-all group scale-105 shadow-2xl shadow-purple-900/10 z-10"
                    >
                        <div className="h-48 bg-gradient-to-b from-purple-900/20 to-transparent p-6 relative">
                            <FiActivity className="absolute top-6 right-6 text-4xl text-purple-500 opacity-50" />
                            <div className="absolute bottom-0 left-0 right-0 h-1/2 flex items-end px-6 pb-6">
                                {/* Visual Representation of Step */}
                                <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                                    <line x1="0" y1="50" x2="33" y2="40" stroke="#a855f7" strokeWidth="3" />
                                    <line x1="33" y1="40" x2="66" y2="20" stroke="#a855f7" strokeWidth="3" />
                                    <line x1="66" y1="20" x2="100" y2="0" stroke="#a855f7" strokeWidth="3" />
                                    <circle cx="33" cy="40" r="3" fill="#a855f7" />
                                    <circle cx="66" cy="20" r="3" fill="#a855f7" />
                                </svg>
                            </div>
                        </div>
                        <div className="p-8">
                            <h3 className="text-2xl font-bold mb-2 font-mono uppercase text-purple-400">Bitcoin Corp</h3>
                            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-6">Inverse Halving</p>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3">
                                    <FiTarget className="mt-1 text-purple-500" />
                                    <div>
                                        <span className="block font-bold text-zinc-200">Scaling Valuation</span>
                                        <span className="text-sm text-zinc-400">As the project matures, equity becomes scarcer.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <FiDollarSign className="mt-1 text-purple-500" />
                                    <div>
                                        <span className="block font-bold text-zinc-200">Early Bird Reward</span>
                                        <span className="text-sm text-zinc-400">First investors get 4x the equity of later investors.</span>
                                    </div>
                                </li>
                            </ul>

                            <div className="bg-black/50 p-4 rounded-xl border border-zinc-800 font-mono text-xs text-zinc-400">
                                <div className="flex justify-between">
                                    <span>Tranche 1 (10%):</span>
                                    <span className="text-white">£1,000</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tranche 2 (5%):</span>
                                    <span className="text-white">£2,000</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tranche 3 (2.5%):</span>
                                    <span className="text-white">£4,000</span>
                                </div>
                                <div className="text-purple-500 mt-2 border-t border-zinc-700 pt-2">Valuation: £10k → £40k → £160k</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Curve 3: Vibecoins / Exponential */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden hover:border-green-500/50 transition-all group"
                    >
                        <div className="h-48 bg-gradient-to-b from-green-900/20 to-transparent p-6 relative">
                            <FiZap className="absolute top-6 right-6 text-4xl text-green-500 opacity-50" />
                            <div className="absolute bottom-0 left-0 right-0 h-1/2 flex items-end px-6 pb-6">
                                {/* Visual Representation of Exponential */}
                                <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                                    <path d="M0,50 Q50,50 100,0" fill="none" stroke="#22c55e" strokeWidth="3" />
                                </svg>
                            </div>
                        </div>
                        <div className="p-8">
                            <h3 className="text-2xl font-bold mb-2 font-mono uppercase text-green-400">Vibecoin</h3>
                            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-6">Exponential / Parabolic</p>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3">
                                    <FiTarget className="mt-1 text-green-500" />
                                    <div>
                                        <span className="block font-bold text-zinc-200">Price Discovery</span>
                                        <span className="text-sm text-zinc-400">Price moves automatically based on supply and demand.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <FiDollarSign className="mt-1 text-green-500" />
                                    <div>
                                        <span className="block font-bold text-zinc-200">Infinite Liquidity</span>
                                        <span className="text-sm text-zinc-400">Always a buyer and seller (the bonding curve itself).</span>
                                    </div>
                                </li>
                            </ul>

                            <div className="bg-black/50 p-4 rounded-xl border border-zinc-800 font-mono text-xs text-zinc-400">
                                <div>Token 1: $0.00001</div>
                                <div>Token 1M: $1.00</div>
                                <div className="text-green-500 mt-2">Valuation: Dynamic</div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </section>

            {/* The Bitcoin Corp Model Detailed */}
            <section className="max-w-4xl mx-auto mb-20">
                <div className="bg-zinc-900/30 border border-purple-500/30 rounded-3xl p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

                    <h2 className="text-3xl font-bold mb-6 font-orbitron">Why the "Inverse Halving" Curve?</h2>
                    <p className="text-lg text-zinc-300 mb-8 leading-relaxed">
                        For serious software infrastructure like Bitcoin Email or Bitcoin Spreadsheets, we can't use linear pricing (too cheap later) or exponential pricing (too volatile).
                        <br /><br />
                        We use the <strong>Inverse Halving</strong> curve. Just as Bitcoin's block subsidy halves every 4 years, making it scarcer, our <strong>Equity Subsidy</strong> halves as funding milestones are reached.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase text-zinc-500 tracking-wider">The Schedule</h3>
                            <div className="space-y-0.5">
                                <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border-l-2 border-purple-500">
                                    <span className="text-white font-bold">Phase 1</span>
                                    <span className="text-zinc-400 text-sm">£1,000 buys 10%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border-l-2 border-purple-400">
                                    <span className="text-white font-bold">Phase 2</span>
                                    <span className="text-zinc-400 text-sm">£2,000 buys 5%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border-l-2 border-purple-300">
                                    <span className="text-white font-bold">Phase 3</span>
                                    <span className="text-zinc-400 text-sm">£4,000 buys 2.5%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-black/40 rounded-lg border-l-2 border-purple-200">
                                    <span className="text-white font-bold">Phase 4</span>
                                    <span className="text-zinc-400 text-sm">£8,000 buys 1.25%</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center">
                            <p className="text-sm text-zinc-400 italic mb-4">
                                "This incentivizes early risk-takers. If you believe in the project at the "Napkin Stage", you get 10% for £1k. By the time it's a working beta, the valuation has mathematically proven itself."
                            </p>
                            <Link href="/mint/price-curve" className="inline-flex items-center gap-2 text-purple-400 hover:text-white font-bold transition-colors">
                                Simulate in Visualizer <FiArrowRight />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-7xl mx-auto text-center">
                <h2 className="text-2xl font-bold mb-6">Ready to Fund?</h2>
                <div className="flex gap-4 justify-center">
                    <Link href="/kintsugi" className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition-colors">
                        Explore Projects
                    </Link>
                    <Link href="/mint" className="border border-zinc-700 text-white px-8 py-3 rounded-full font-bold hover:bg-zinc-800 transition-colors">
                        Launch Your Own
                    </Link>
                </div>
            </section>
        </div>
    );
}
