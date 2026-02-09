'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { TrendingUp, DollarSign, PieChart, Repeat } from 'lucide-react';

export default function RevenueTokensPage() {
    const useCases = [
        {
            title: 'Creator Royalties',
            description: 'Automatically distribute streaming royalties, art sales, or content revenue to token holders.',
            example: 'Musicians sharing streaming income with early supporters'
        },
        {
            title: 'Real Estate Income',
            description: 'Fractional property ownership with automatic rental income distribution.',
            example: 'Commercial property dividends paid monthly to token holders'
        },
        {
            title: 'Business Profit Sharing',
            description: 'Issue tokens representing a share of company profits, distributed automatically.',
            example: 'Startup equity tokens with quarterly dividend distributions'
        },
        {
            title: 'Referral Commissions',
            description: 'Tokenized referral programs with perpetual commission streams.',
            example: 'Affiliate networks with on-chain commission tracking'
        }
    ];

    const bsvAdvantages = [
        {
            title: 'Micro-Royalties',
            description: 'Distribute fractions of pennies to thousands of holders economically.',
            icon: DollarSign
        },
        {
            title: 'Automatic Splits',
            description: 'Smart contracts split revenue instantly among all token holders.',
            icon: PieChart
        },
        {
            title: 'Real-Time Payouts',
            description: 'No waiting for monthly statements—revenue flows immediately.',
            icon: TrendingUp
        },
        {
            title: 'Perpetual Tracking',
            description: 'Every distribution permanently recorded for tax and audit purposes.',
            icon: Repeat
        }
    ];

    const realWorldExamples = [
        {
            industry: 'Music',
            useCase: 'Streaming Royalties',
            description: 'Artists issue tokens representing a percentage of streaming revenue. As songs get played, royalties flow to token holders in real-time.',
            metrics: 'Pay 10,000+ holders per stream'
        },
        {
            industry: 'Real Estate',
            useCase: 'Rental Income',
            description: 'Property owners tokenize rental income. Token holders receive proportional share of net operating income monthly.',
            metrics: '6-12% annual yields'
        },
        {
            industry: 'Creator Economy',
            useCase: 'Content Revenue',
            description: 'YouTubers and streamers share ad revenue with loyal fans. Early supporters earn from future content success.',
            metrics: 'Fan investment model'
        },
        {
            industry: 'Startups',
            useCase: 'Profit Distribution',
            description: 'Pre-revenue startups issue future profit share tokens. When profitable, distributions happen automatically.',
            metrics: 'Investor alignment'
        }
    ];

    const implementationSteps = [
        {
            step: 1,
            title: 'Revenue Model Design',
            description: 'Map revenue streams, define distribution mechanics, and set holder rights.',
            duration: '1 week'
        },
        {
            step: 2,
            title: 'Smart Contract Development',
            description: 'Build distribution contracts with automatic splitting and payment routing.',
            duration: '3-4 weeks'
        },
        {
            step: 3,
            title: 'Revenue Integration',
            description: 'Connect revenue sources (payment processors, wallets, sales systems) to the distribution contract.',
            duration: '2 weeks'
        },
        {
            step: 4,
            title: 'Launch & Distribution',
            description: 'Deploy tokens, onboard holders, and start automated distributions.',
            duration: '1 week'
        }
    ];

    return (
        <motion.div
            className="min-h-screen bg-black text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            {/* Header */}
            <div className="px-4 md:px-8 py-16">
                <Link
                    href="/tokens/types"
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
                >
                    <FiArrowLeft />
                    <span>Back to Token Types</span>
                </Link>

                <div className="mb-12 border-b border-white/20 pb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight">
                            Revenue Share Tokens
                        </h1>
                    </div>
                    <p className="text-2xl text-white/60 mb-4">
                        Profit Distribution & Royalties
                    </p>
                    <p className="text-xl text-white/80 max-w-3xl">
                        Automatically distribute revenue, profits, or royalties to token holders. From streaming royalties to rental income, create passive income streams backed by real cash flows.
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <p className="text-3xl font-bold mb-2">10-16</p>
                        <p className="text-sm text-white/60 uppercase tracking-wider">Weeks to Market</p>
                    </div>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <p className="text-3xl font-bold mb-2">Very High</p>
                        <p className="text-sm text-white/60 uppercase tracking-wider">Complexity</p>
                    </div>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <p className="text-3xl font-bold mb-2">&lt;£0.01</p>
                        <p className="text-sm text-white/60 uppercase tracking-wider">Min Distribution</p>
                    </div>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <p className="text-3xl font-bold mb-2">∞</p>
                        <p className="text-sm text-white/60 uppercase tracking-wider">Holder Capacity</p>
                    </div>
                </div>

                {/* Use Cases */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold mb-8 uppercase tracking-tight">Primary Use Cases</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {useCases.map((useCase, index) => (
                            <div key={index} className="bg-white/5 border border-white/20 rounded-lg p-6">
                                <h3 className="text-xl font-bold mb-3">{useCase.title}</h3>
                                <p className="text-white/80 mb-4">{useCase.description}</p>
                                <div className="bg-emerald-500/10 border-l-4 border-emerald-500 p-3 rounded">
                                    <p className="text-sm text-white/60">Example:</p>
                                    <p className="text-sm text-white">{useCase.example}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* BSV Advantages */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold mb-8 uppercase tracking-tight">Why BSV for Revenue Tokens?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {bsvAdvantages.map((advantage, index) => (
                            <div key={index} className="bg-gradient-to-b from-emerald-500/10 to-white/5 border border-white/20 rounded-lg p-6 text-center">
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <advantage.icon className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{advantage.title}</h3>
                                <p className="text-sm text-white/60">{advantage.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Revenue Revolution */}
                <section className="mb-16 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-white/20 rounded-lg p-8">
                    <h2 className="text-3xl font-bold mb-6 uppercase tracking-tight">The Revenue Distribution Problem</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-3">Traditional Model</h3>
                            <ul className="space-y-2 text-white/80">
                                <li>• High minimum distribution amounts</li>
                                <li>• Monthly or quarterly payout cycles</li>
                                <li>• Expensive payment processing fees</li>
                                <li>• Complex cap table management</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-3">Tokenized Solution</h3>
                            <ul className="space-y-2 text-white/80">
                                <li>• Distribute fractions of a penny</li>
                                <li>• Real-time as revenue comes in</li>
                                <li>• Near-zero transaction costs</li>
                                <li>• Automatic, tamper-proof ledger</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Real-World Examples */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold mb-8 uppercase tracking-tight">Real-World Applications</h2>
                    <div className="space-y-4">
                        {realWorldExamples.map((example, index) => (
                            <div key={index} className="bg-white/5 border border-white/20 rounded-lg p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <span className="inline-block bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                                            {example.industry}
                                        </span>
                                        <h3 className="text-xl font-bold">{example.useCase}</h3>
                                    </div>
                                    <span className="text-2xl font-bold text-white/20">0{index + 1}</span>
                                </div>
                                <p className="text-white/80 mb-3">{example.description}</p>
                                <div className="bg-emerald-500/10 px-4 py-2 rounded inline-block">
                                    <p className="text-sm font-mono text-emerald-400">{example.metrics}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Implementation Process */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold mb-8 uppercase tracking-tight">Implementation Process</h2>
                    <div className="space-y-4">
                        {implementationSteps.map((step) => (
                            <div key={step.step} className="flex gap-6 border-l-4 border-emerald-500/40 pl-6 pb-6">
                                <div className="flex-shrink-0 w-12 h-12 bg-emerald-500 text-black rounded-lg flex items-center justify-center font-bold text-xl -ml-9 mt-1">
                                    {step.step}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold">{step.title}</h3>
                                        <span className="text-sm text-white/60 font-mono">{step.duration}</span>
                                    </div>
                                    <p className="text-white/80">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/10 border border-white/20 rounded-lg p-8 md:p-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Tokenize Your Revenue?
                    </h2>
                    <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
                        Create automated profit distribution for your investors, creators, or stakeholders. Start building your revenue token today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/agent/chat"
                            className="bg-emerald-500 text-black px-8 py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-emerald-400 transition-colors inline-flex items-center justify-center gap-2"
                        >
                            <TrendingUp className="w-5 h-5" />
                            Start Building
                        </Link>
                        <Link
                            href="/tokens/types"
                            className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-white/20 transition-colors inline-flex items-center justify-center gap-2"
                        >
                            <FiArrowLeft className="w-5 h-5" />
                            Explore Other Types
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
