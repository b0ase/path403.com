'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { MessageSquare, Users, Star, Heart } from 'lucide-react';

export default function SocialTokensPage() {
    const useCases = [
        {
            title: 'Creator Communities',
            description: 'Token-gated access to exclusive Discord channels, live streams, and creator content.',
            example: 'YouTubers giving early video access to token holders'
        },
        {
            title: 'Fan Engagement',
            description: 'Reward loyal fans with tradeable tokens that unlock perks and experiences.',
            example: 'K-pop groups issuing tokens for meet-and-greet access'
        },
        {
            title: 'Influencer Economies',
            description: 'Influencers monetizing their personal brand with tokens backed by their success.',
            example: 'Fitness influencers selling workout access via tokens'
        },
        {
            title: 'Community Membership',
            description: 'Tiered membership access based on token holdings, from basic to VIP.',
            example: 'Professional networks with token-gated mastermind groups'
        }
    ];

    const bsvAdvantages = [
        {
            title: 'Instant Micro-Tips',
            description: 'Fans can tip creators fractions of a penny per interaction.',
            icon: Heart
        },
        {
            title: 'Portable Reputation',
            description: 'Fan status transfers across platforms—your loyalty follows you.',
            icon: Star
        },
        {
            title: 'Scalable Communities',
            description: 'Manage millions of token holders without performance issues.',
            icon: Users
        },
        {
            title: 'Real-Time Engagement',
            description: 'Token transactions confirm in seconds for live interaction.',
            icon: MessageSquare
        }
    ];

    const realWorldExamples = [
        {
            industry: 'Content Creation',
            useCase: 'Patreon Alternative',
            description: 'Creators issue tokens instead of subscriptions. Fans own their access and can trade it. Creators get upfront capital.',
            metrics: 'Fan-owned access rights'
        },
        {
            industry: 'Sports',
            useCase: 'Fan Tokens',
            description: 'Sports teams issue tokens for voting on jersey designs, meeting players, and accessing exclusive content.',
            metrics: '50M+ fan token holders globally'
        },
        {
            industry: 'Music',
            useCase: 'Fan Clubs',
            description: 'Artists tokenize fan club membership. Early supporters get access to tours, merch drops, and private events.',
            metrics: 'Tradeable VIP access'
        },
        {
            industry: 'Gaming',
            useCase: 'Streamer Tokens',
            description: 'Twitch streamers issue tokens for exclusive emotes, shoutouts, and game sessions with the streamer.',
            metrics: 'Direct creator support'
        }
    ];

    const implementationSteps = [
        {
            step: 1,
            title: 'Community Design',
            description: 'Define token tiers, perks, and engagement mechanics for your community.',
            duration: '1 week'
        },
        {
            step: 2,
            title: 'Token Mechanics',
            description: 'Build smart contracts for token issuance, transfers, and perk unlocking.',
            duration: '2 weeks'
        },
        {
            step: 3,
            title: 'Platform Integration',
            description: 'Connect token-gating to Discord, websites, and content platforms.',
            duration: '1-2 weeks'
        },
        {
            step: 4,
            title: 'Community Launch',
            description: 'Issue tokens, onboard initial holders, and activate engagement features.',
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
                        <div className="w-16 h-16 bg-pink-500/20 rounded-lg flex items-center justify-center">
                            <Heart className="w-8 h-8 text-pink-400" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight">
                            Social Tokens
                        </h1>
                    </div>
                    <p className="text-2xl text-white/60 mb-4">
                        Creator Economies & Community Access
                    </p>
                    <p className="text-xl text-white/80 max-w-3xl">
                        Tokenize personal brands, creator communities, and fan relationships. Give your audience ownership in your success with tokens they can trade, collect, and benefit from.
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <p className="text-3xl font-bold mb-2">3-5</p>
                        <p className="text-sm text-white/60 uppercase tracking-wider">Weeks to Market</p>
                    </div>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <p className="text-3xl font-bold mb-2">Medium</p>
                        <p className="text-sm text-white/60 uppercase tracking-wider">Complexity</p>
                    </div>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <p className="text-3xl font-bold mb-2">∞</p>
                        <p className="text-sm text-white/60 uppercase tracking-wider">Fan Capacity</p>
                    </div>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <p className="text-3xl font-bold mb-2">24/7</p>
                        <p className="text-sm text-white/60 uppercase tracking-wider">Trading Active</p>
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
                                <div className="bg-pink-500/10 border-l-4 border-pink-500 p-3 rounded">
                                    <p className="text-sm text-white/60">Example:</p>
                                    <p className="text-sm text-white">{useCase.example}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* BSV Advantages */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold mb-8 uppercase tracking-tight">Why BSV for Social Tokens?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {bsvAdvantages.map((advantage, index) => (
                            <div key={index} className="bg-gradient-to-b from-pink-500/10 to-white/5 border border-white/20 rounded-lg p-6 text-center">
                                <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <advantage.icon className="w-6 h-6 text-pink-400" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{advantage.title}</h3>
                                <p className="text-sm text-white/60">{advantage.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Creator Economy */}
                <section className="mb-16 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-white/20 rounded-lg p-8">
                    <h2 className="text-3xl font-bold mb-6 uppercase tracking-tight">The Creator Economy Revolution</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-3">Platform-Dependent Model</h3>
                            <ul className="space-y-2 text-white/80">
                                <li>• Platforms take 30-50% of creator revenue</li>
                                <li>• Fans don't own their access—it can be revoked</li>
                                <li>• No portability when platforms change</li>
                                <li>• Creators compete for algorithm attention</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-3">Creator-Owned Model</h3>
                            <ul className="space-y-2 text-white/80">
                                <li>• Creators keep 100% of token sales</li>
                                <li>• Fans own tokens—true asset ownership</li>
                                <li>• Portable across any platform</li>
                                <li>• Direct creator-to-fan relationships</li>
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
                                        <span className="inline-block bg-pink-500/20 text-pink-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                                            {example.industry}
                                        </span>
                                        <h3 className="text-xl font-bold">{example.useCase}</h3>
                                    </div>
                                    <span className="text-2xl font-bold text-white/20">0{index + 1}</span>
                                </div>
                                <p className="text-white/80 mb-3">{example.description}</p>
                                <div className="bg-pink-500/10 px-4 py-2 rounded inline-block">
                                    <p className="text-sm font-mono text-pink-400">{example.metrics}</p>
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
                            <div key={step.step} className="flex gap-6 border-l-4 border-pink-500/40 pl-6 pb-6">
                                <div className="flex-shrink-0 w-12 h-12 bg-pink-500 text-black rounded-lg flex items-center justify-center font-bold text-xl -ml-9 mt-1">
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
                <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/10 border border-white/20 rounded-lg p-8 md:p-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Build Your Community Token?
                    </h2>
                    <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
                        Give your fans ownership in your success. Launch a social token that grows with your community.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/agent/chat"
                            className="bg-pink-500 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-pink-400 transition-colors inline-flex items-center justify-center gap-2"
                        >
                            <Heart className="w-5 h-5" />
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
