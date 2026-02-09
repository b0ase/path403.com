'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiDollarSign, FiPieChart, FiTrendingUp, FiUsers, FiLock, FiCalendar, FiArrowLeft } from 'react-icons/fi';

export default function FundraisingPage() {
    return (
        <motion.div
            className="min-h-screen bg-black text-white relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <div className="px-4 md:px-8 py-16">
                {/* Header */}
                <motion.div
                    className="mb-12 border-b border-gray-800 pb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm mb-6"
                    >
                        <FiArrowLeft /> Back to Dashboard
                    </Link>
                    <h1 className="text-5xl font-bold tracking-tighter mb-2">FUNDRAISING STRATEGY</h1>
                    <p className="text-gray-400 text-sm uppercase tracking-widest">£1.5M Raise · 3% Equity · £50M Valuation</p>
                </motion.div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
                    {[
                        { label: 'Total Raise', value: '£1.5M', icon: FiDollarSign, color: 'text-green-400' },
                        { label: 'Equity Offered', value: '3.0%', icon: FiPieChart, color: 'text-purple-400' },
                        { label: 'Pre-Money Valuation', value: '£50M', icon: FiTrendingUp, color: 'text-blue-400' },
                        { label: 'Token Allocation', value: '3B $BOASE', icon: FiLock, color: 'text-orange-400' },
                    ].map((metric, i) => (
                        <motion.div
                            key={i}
                            className="bg-gray-900/50 border border-gray-800 p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                        >
                            <metric.icon className={`text-3xl mb-3 ${metric.color}`} />
                            <div className="text-3xl font-bold mb-1">{metric.value}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-widest">{metric.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Investment Tranches */}
                <motion.div
                    className="mb-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <FiCalendar className="text-cyan-400" />
                        Investment Tranches
                    </h2>
                    <div className="space-y-4">
                        {[
                            {
                                name: 'Seed Round',
                                amount: '£250,000',
                                equity: '0.5%',
                                tokens: '500M $BOASE',
                                timing: 'Q1 2026',
                                status: 'Open',
                                color: 'border-green-500',
                                use: 'Team hiring (2 FTE), initial marketing, product development'
                            },
                            {
                                name: 'Series A',
                                amount: '£500,000',
                                equity: '1.0%',
                                tokens: '1B $BOASE',
                                timing: 'Q3 2026',
                                status: 'Planned',
                                color: 'border-blue-500',
                                use: 'Scale operations (3 FTE), sales team, enterprise partnerships'
                            },
                            {
                                name: 'Series B',
                                amount: '£750,000',
                                equity: '1.5%',
                                tokens: '1.5B $BOASE',
                                timing: 'Q1 2027',
                                status: 'Planned',
                                color: 'border-purple-500',
                                use: 'International expansion (5 FTE), R&D, infrastructure'
                            },
                        ].map((tranche, i) => (
                            <div key={i} className={`bg-gray-900/50 border-l-4 ${tranche.color} border-t border-r border-b border-gray-800 p-6`}>
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-2xl font-bold">{tranche.name}</h3>
                                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest ${tranche.status === 'Open' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
                                                }`}>
                                                {tranche.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm">{tranche.use}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Target Close</div>
                                        <div className="font-bold">{tranche.timing}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Amount</div>
                                        <div className="text-2xl font-bold text-green-400">{tranche.amount}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Equity</div>
                                        <div className="text-2xl font-bold text-purple-400">{tranche.equity}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Tokens</div>
                                        <div className="text-2xl font-bold text-orange-400">{tranche.tokens}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Use of Funds */}
                <motion.div
                    className="mb-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                >
                    <h2 className="text-2xl font-bold mb-6">Use of Funds Breakdown</h2>
                    <div className="bg-gray-900/50 border border-gray-800 p-8">
                        <div className="space-y-4">
                            {[
                                { category: 'Team Expansion', amount: '£600,000', percentage: 40, description: 'Developers, sales, operations' },
                                { category: 'Marketing & Customer Acquisition', amount: '£375,000', percentage: 25, description: 'Content, ads, events, partnerships' },
                                { category: 'Product Development & R&D', amount: '£300,000', percentage: 20, description: 'New features, AI integration, blockchain tools' },
                                { category: 'Infrastructure & Tooling', amount: '£150,000', percentage: 10, description: 'Servers, software, security, compliance' },
                                { category: 'Legal & Compliance', amount: '£75,000', percentage: 5, description: 'Company formation, contracts, IP protection' },
                            ].map((item, i) => (
                                <div key={i}>
                                    <div className="flex justify-between mb-2">
                                        <div>
                                            <span className="font-bold">{item.category}</span>
                                            <span className="text-sm text-gray-500 ml-3">{item.description}</span>
                                        </div>
                                        <span className="text-green-400 font-bold">{item.amount}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 bg-gray-800 h-2 rounded-full overflow-hidden">
                                            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full" style={{ width: `${item.percentage}%` }}></div>
                                        </div>
                                        <span className="text-sm text-gray-400 w-12 text-right">{item.percentage}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Token Economics */}
                <motion.div
                    className="mb-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                >
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <FiPieChart className="text-purple-400" />
                        $BOASE Token Economics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-900/50 border border-gray-800 p-6">
                            <h3 className="font-bold mb-4 text-cyan-400">Token Distribution</h3>
                            <div className="space-y-3">
                                {[
                                    { holder: 'Founder (@b0ase)', amount: '97B', percentage: '97.0%', color: 'bg-blue-500' },
                                    { holder: 'Seed Investors', amount: '500M', percentage: '0.5%', color: 'bg-green-500' },
                                    { holder: 'Series A Investors', amount: '1B', percentage: '1.0%', color: 'bg-purple-500' },
                                    { holder: 'Series B Investors', amount: '1.5B', percentage: '1.5%', color: 'bg-orange-500' },
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>{item.holder}</span>
                                            <span className="font-bold">{item.amount} ({item.percentage})</span>
                                        </div>
                                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                            <div className={`${item.color} h-full`} style={{ width: item.percentage }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-800">
                                <div className="flex justify-between font-bold">
                                    <span>Total Supply</span>
                                    <span className="text-purple-400">100,000,000,000 $BOASE</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900/50 border border-gray-800 p-6">
                            <h3 className="font-bold mb-4 text-purple-400">Vesting & Lockup</h3>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <div className="font-bold mb-2">Investor Tokens</div>
                                    <ul className="space-y-1 text-gray-300">
                                        <li>• 1-year lockup period (no transfers)</li>
                                        <li>• 4-year vesting schedule</li>
                                        <li>• 25% unlock annually after lockup</li>
                                        <li>• Pro-rata voting rights from day 1</li>
                                    </ul>
                                </div>
                                <div>
                                    <div className="font-bold mb-2">Founder Tokens</div>
                                    <ul className="space-y-1 text-gray-300">
                                        <li>• No lockup (already owned)</li>
                                        <li>• Full control and voting rights</li>
                                        <li>• Can be used for treasury operations</li>
                                        <li>• Subject to good leaver provisions</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Investment Terms */}
                <motion.div
                    className="mb-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 }}
                >
                    <h2 className="text-2xl font-bold mb-6">Investment Terms</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-900/50 border border-gray-800 p-6">
                            <h3 className="font-bold mb-4 text-green-400">Investor Rights</h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li>• Pro-rata participation in future rounds</li>
                                <li>• Quarterly financial reporting</li>
                                <li>• Board observer rights (Series B+)</li>
                                <li>• Information rights and audit access</li>
                                <li>• Tag-along rights on founder exits</li>
                                <li>• Anti-dilution protection (weighted average)</li>
                            </ul>
                        </div>
                        <div className="bg-gray-900/50 border border-gray-800 p-6">
                            <h3 className="font-bold mb-4 text-orange-400">Exit Scenarios</h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li>• Target exit: £150M+ (3x return in 5 years)</li>
                                <li>• Preferred: Strategic acquisition by Web3 platform</li>
                                <li>• Alternative: Token listing on major exchange</li>
                                <li>• Liquidation preference: 1x non-participating</li>
                                <li>• Drag-along rights at 75% threshold</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>

                {/* Investor Pipeline */}
                <motion.div
                    className="mb-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                >
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <FiUsers className="text-cyan-400" />
                        Target Investor Profile
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                type: 'Angel Investors',
                                description: 'Web3 entrepreneurs, crypto early adopters',
                                ticket: '£10K - £50K',
                                focus: 'Seed Round'
                            },
                            {
                                type: 'Venture Capital',
                                description: 'Blockchain-focused VCs, AI/tech funds',
                                ticket: '£100K - £500K',
                                focus: 'Series A'
                            },
                            {
                                type: 'Strategic Partners',
                                description: 'Exchanges, blockchain platforms, enterprise',
                                ticket: '£250K - £750K',
                                focus: 'Series B'
                            },
                        ].map((profile, i) => (
                            <div key={i} className="bg-gray-900/50 border border-gray-800 p-6">
                                <h3 className="font-bold text-lg mb-2">{profile.type}</h3>
                                <p className="text-sm text-gray-400 mb-4">{profile.description}</p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Ticket Size</span>
                                        <span className="font-bold text-green-400">{profile.ticket}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Target Round</span>
                                        <span className="font-bold">{profile.focus}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Milestones */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.7 }}
                >
                    <h2 className="text-2xl font-bold mb-6">Funding Milestones</h2>
                    <div className="bg-gray-900/50 border border-gray-800 p-6">
                        <div className="space-y-6">
                            {[
                                { date: 'Feb 2026', milestone: 'Company Registration (Companies House)', status: 'Pending' },
                                { date: 'Feb 2026', milestone: 'Close first customer (aiforge.org - £5K)', status: 'In Progress' },
                                { date: 'Mar 2026', milestone: 'Complete Seed Round (£250K)', status: 'Open' },
                                { date: 'Jun 2026', milestone: 'Reach £100K ARR', status: 'Planned' },
                                { date: 'Sep 2026', milestone: 'Complete Series A (£500K)', status: 'Planned' },
                                { date: 'Dec 2026', milestone: 'Reach £250K ARR', status: 'Planned' },
                                { date: 'Mar 2027', milestone: 'Complete Series B (£750K)', status: 'Planned' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="w-24 text-sm text-gray-500 font-mono">{item.date}</div>
                                    <div className="flex-1 flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${item.status === 'Pending' ? 'bg-yellow-500' :
                                                item.status === 'In Progress' ? 'bg-blue-500 animate-pulse' :
                                                    item.status === 'Open' ? 'bg-green-500' :
                                                        'bg-gray-600'
                                            }`}></div>
                                        <span className="font-medium">{item.milestone}</span>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest ${item.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                            item.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
                                                item.status === 'Open' ? 'bg-green-500/20 text-green-400' :
                                                    'bg-gray-700 text-gray-400'
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-gray-800 text-center">
                    <p className="text-gray-400 mb-4">Interested in investing in b0ase.com?</p>
                    <a
                        href="/contact"
                        className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold uppercase tracking-widest hover:from-cyan-600 hover:to-blue-600 transition-all"
                    >
                        Get in Touch
                    </a>
                    <p className="text-sm text-gray-500 mt-6">Last updated: January 2026</p>
                </div>
            </div>
        </motion.div>
    );
}
