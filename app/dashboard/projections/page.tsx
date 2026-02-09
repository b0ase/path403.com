'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiTrendingUp, FiUsers, FiDollarSign, FiTarget, FiBarChart2, FiPieChart, FiArrowLeft } from 'react-icons/fi';

export default function ProjectionsPage() {
    return (
        <motion.div
            className="min-h-screen bg-black text-white relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <div className="px-4 md:px-8 py-16">
                <div className="w-full">
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
                        <h1 className="text-5xl font-bold tracking-tighter mb-2">FINANCIAL PROJECTIONS</h1>
                        <p className="text-gray-400 text-sm uppercase tracking-widest">3-Year Growth Model · 2026-2028</p>
                    </motion.div>

                    {/* Key Metrics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
                        {[
                            { label: 'Year 1 Revenue', value: '£348K', icon: FiDollarSign, color: 'text-green-400' },
                            { label: 'Year 3 Revenue', value: '£1.5M', icon: FiTrendingUp, color: 'text-blue-400' },
                            { label: 'Target Margin', value: '35%', icon: FiPieChart, color: 'text-purple-400' },
                            { label: 'Team Size (Y3)', value: '10 FTE', icon: FiUsers, color: 'text-orange-400' },
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

                    {/* 3-Year Summary */}
                    <motion.div
                        className="mb-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <FiBarChart2 className="text-cyan-400" />
                            3-Year Summary
                        </h2>
                        <div className="border border-gray-800 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-900/30">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase tracking-widest">Metric</th>
                                        <th className="text-right px-6 py-4 text-xs text-gray-500 uppercase tracking-widest">Year 1 (2026)</th>
                                        <th className="text-right px-6 py-4 text-xs text-gray-500 uppercase tracking-widest">Year 2 (2027)</th>
                                        <th className="text-right px-6 py-4 text-xs text-gray-500 uppercase tracking-widest">Year 3 (2028)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { metric: 'Revenue', y1: '£348,000', y2: '£750,000', y3: '£1,500,000' },
                                        { metric: 'Gross Margin', y1: '65%', y2: '68%', y3: '70%' },
                                        { metric: 'Operating Costs', y1: '£261,000', y2: '£525,000', y3: '£975,000' },
                                        { metric: 'Net Profit', y1: '£87,000', y2: '£225,000', y3: '£525,000' },
                                        { metric: 'Profit Margin', y1: '25%', y2: '30%', y3: '35%' },
                                        { metric: 'Customers', y1: '63', y2: '120', y3: '200' },
                                        { metric: 'Avg Deal Size', y1: '£5,524', y2: '£6,250', y3: '£7,500' },
                                        { metric: 'Team Size', y1: '2 FTE', y2: '5 FTE', y3: '10 FTE' },
                                    ].map((row, i) => (
                                        <tr key={i} className="border-t border-gray-800 hover:bg-gray-900/30 transition-colors">
                                            <td className="px-6 py-4 font-medium">{row.metric}</td>
                                            <td className="px-6 py-4 text-right text-gray-300">{row.y1}</td>
                                            <td className="px-6 py-4 text-right text-gray-300">{row.y2}</td>
                                            <td className="px-6 py-4 text-right text-green-400 font-bold">{row.y3}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Revenue Breakdown by Stream */}
                    <motion.div
                        className="mb-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                    >
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <FiTarget className="text-purple-400" />
                            Revenue Streams (Year 3)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { stream: 'Web Development', revenue: '£350,000', percentage: '23%', color: 'bg-blue-500' },
                                { stream: 'Blockchain & Crypto', revenue: '£300,000', percentage: '20%', color: 'bg-purple-500' },
                                { stream: 'AI & Automation', revenue: '£250,000', percentage: '17%', color: 'bg-green-500' },
                                { stream: 'Incubator Packages', revenue: '£400,000', percentage: '27%', color: 'bg-orange-500' },
                                { stream: 'Consulting & Advisory', revenue: '£200,000', percentage: '13%', color: 'bg-cyan-500' },
                            ].map((stream, i) => (
                                <div key={i} className="bg-gray-900/50 border border-gray-800 p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="font-bold text-lg">{stream.stream}</div>
                                            <div className="text-2xl font-bold text-green-400 mt-1">{stream.revenue}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-gray-400">{stream.percentage}</div>
                                            <div className="text-xs text-gray-500">of total</div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-800 h-2 overflow-hidden">
                                        <div className={`${stream.color} h-full`} style={{ width: stream.percentage }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quarterly Breakdown - Year 1 */}
                    <motion.div
                        className="mb-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.1 }}
                    >
                        <h2 className="text-2xl font-bold mb-6">Year 1 Quarterly Breakdown</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { quarter: 'Q1', revenue: '£60,000', customers: 8, team: '1 FTE + 2 contractors' },
                                { quarter: 'Q2', revenue: '£75,000', customers: 12, team: '2 FTE + 2 contractors' },
                                { quarter: 'Q3', revenue: '£95,000', customers: 18, team: '2 FTE + 3 contractors' },
                                { quarter: 'Q4', revenue: '£118,000', customers: 25, team: '2 FTE + 4 contractors' },
                            ].map((q, i) => (
                                <div key={i} className="bg-gray-900/50 border border-gray-800 p-6">
                                    <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">{q.quarter} 2026</div>
                                    <div className="text-3xl font-bold text-green-400 mb-4">{q.revenue}</div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Customers</span>
                                            <span className="font-medium">{q.customers}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Team</span>
                                            <span className="font-medium text-xs">{q.team}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Cost Structure */}
                    <motion.div
                        className="mb-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.3 }}
                    >
                        <h2 className="text-2xl font-bold mb-6">Cost Structure (Year 3)</h2>
                        <div className="bg-gray-900/50 border border-gray-800 p-8">
                            <div className="space-y-4">
                                {[
                                    { category: 'Salaries (10 FTE)', amount: '£600,000', percentage: 62 },
                                    { category: 'Contractors', amount: '£200,000', percentage: 20 },
                                    { category: 'Marketing & Sales', amount: '£100,000', percentage: 10 },
                                    { category: 'Infrastructure & Tools', amount: '£50,000', percentage: 5 },
                                    { category: 'Other Operating Costs', amount: '£25,000', percentage: 3 },
                                ].map((cost, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between mb-2">
                                            <span className="font-medium">{cost.category}</span>
                                            <span className="text-green-400 font-bold">{cost.amount}</span>
                                        </div>
                                        <div className="w-full bg-gray-800 h-2 overflow-hidden">
                                            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full" style={{ width: `${cost.percentage}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-4 mt-4 border-t border-gray-800">
                                    <div className="flex justify-between text-xl font-bold">
                                        <span>Total Operating Costs</span>
                                        <span className="text-red-400">£975,000</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Key Assumptions */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                    >
                        <h2 className="text-2xl font-bold mb-6">Key Assumptions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-900/50 border border-gray-800 p-6">
                                <h3 className="font-bold mb-4 text-cyan-400">Growth Drivers</h3>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li>• Customer acquisition cost: £500</li>
                                    <li>• Customer lifetime value: £15,000</li>
                                    <li>• Churn rate: 15% annually</li>
                                    <li>• Referral rate: 25% of new customers</li>
                                    <li>• Upsell rate: 40% of existing customers</li>
                                </ul>
                            </div>
                            <div className="bg-gray-900/50 border border-gray-800 p-6">
                                <h3 className="font-bold mb-4 text-purple-400">Market Assumptions</h3>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li>• UK Web3 market growing 45% YoY</li>
                                    <li>• Average project size increasing 15% annually</li>
                                    <li>• Enterprise adoption of blockchain accelerating</li>
                                    <li>• AI integration becoming table stakes</li>
                                    <li>• Boutique agencies commanding 30% premium</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>

                    {/* Footer Note */}
                    <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
                        <p>Projections based on current pricing structure, market analysis, and conservative growth assumptions.</p>
                        <p className="mt-2">Last updated: January 2026</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
