'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { MessageSquare, Clock, Archive, Sparkles } from 'lucide-react';

export default function ConversationTokensPage() {
    const useCases = [
        {
            title: 'Expert Consultations',
            description: 'Tokenize paid advice sessions. Each conversation becomes an owned, referenceable asset.',
            example: 'Legal or medical advice sessions with proof of delivery'
        },
        {
            title: 'WhatsApp Monetization',
            description: 'Transform valuable chat threads into tradeable assets with provable history.',
            example: 'Business deal negotiations preserved and valued'
        },
        {
            title: 'Interview Transcripts',
            description: 'Journalists tokenize exclusive interviews as collectible, ownable records.',
            example: 'Celebrity interviews sold as limited edition conversation NFTs'
        },
        {
            title: 'Historic Correspondence',
            description: 'Archive significant communications with cryptographic proof of authenticity.',
            example: 'Leadership email chains preserved for corporate history'
        }
    ];

    const bsvAdvantages = [
        {
            title: 'Message-Level Fees',
            description: 'Only BSV can economically inscribe individual messages at scale.',
            icon: MessageSquare
        },
        {
            title: 'Permanent Archive',
            description: 'Conversations exist forever on-chain, never deleted or altered.',
            icon: Archive
        },
        {
            title: 'Timestamped History',
            description: 'Every message cryptographically timestamped for authenticity.',
            icon: Clock
        },
        {
            title: 'Novel Asset Class',
            description: 'Create value from previously unmonetizable communication.',
            icon: Sparkles
        }
    ];

    const realWorldExamples = [
        {
            industry: 'Consulting',
            useCase: 'Advisory Sessions',
            description: 'Consultants tokenize client advice sessions. Clients own proof of guidance received, consultants have liability protection.',
            metrics: 'Provable advice delivery'
        },
        {
            industry: 'Journalism',
            useCase: 'Source Interviews',
            description: 'Journalists inscribe interview transcripts. Original sources can verify authenticity. Collectors own historic journalism.',
            metrics: 'Authentic source material'
        },
        {
            industry: 'Customer Support',
            useCase: 'Support Transcripts',
            description: 'Companies tokenize support conversations. Customers own their interaction history. Disputes resolved via on-chain record.',
            metrics: 'Immutable support logs'
        },
        {
            industry: 'Education',
            useCase: 'Tutoring Sessions',
            description: 'Tutors inscribe lesson transcripts. Students build a permanent learning record. Parents can verify education delivered.',
            metrics: 'Educational proof'
        }
    ];

    const implementationSteps = [
        {
            step: 1,
            title: 'Conversation Mapping',
            description: 'Define which messages to capture, privacy rules, and monetization model.',
            duration: '2 weeks'
        },
        {
            step: 2,
            title: 'Capture Integration',
            description: 'Build integrations with messaging platforms (WhatsApp, Telegram, email, custom).',
            duration: '4-6 weeks'
        },
        {
            step: 3,
            title: 'Inscription Engine',
            description: 'Develop efficient message batching and inscription for cost-effective on-chain storage.',
            duration: '3-4 weeks'
        },
        {
            step: 4,
            title: 'Marketplace & Access',
            description: 'Build token marketplace and viewer for trading and accessing conversation tokens.',
            duration: '2-4 weeks'
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

                {/* Novel Badge */}
                <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-wider">
                    ✨ Novel Use Case
                </div>

                <div className="mb-12 border-b border-white/20 pb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-8 h-8 text-purple-400" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight">
                            Conversation Tokens
                        </h1>
                    </div>
                    <p className="text-2xl text-white/60 mb-4">
                        Tokenized Communications & Chat History
                    </p>
                    <p className="text-xl text-white/80 max-w-3xl">
                        A revolutionary new asset class: transform conversations into ownable, tradeable tokens. From WhatsApp threads to expert consultations, monetize every meaningful exchange.
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <p className="text-3xl font-bold mb-2">12-16</p>
                        <p className="text-sm text-white/60 uppercase tracking-wider">Weeks to Market</p>
                    </div>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <p className="text-3xl font-bold mb-2">Very High</p>
                        <p className="text-sm text-white/60 uppercase tracking-wider">Complexity</p>
                    </div>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <p className="text-3xl font-bold mb-2">BSV Only</p>
                        <p className="text-sm text-white/60 uppercase tracking-wider">Economically Viable</p>
                    </div>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <p className="text-3xl font-bold mb-2">Novel</p>
                        <p className="text-sm text-white/60 uppercase tracking-wider">Asset Class</p>
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
                                <div className="bg-purple-500/10 border-l-4 border-purple-500 p-3 rounded">
                                    <p className="text-sm text-white/60">Example:</p>
                                    <p className="text-sm text-white">{useCase.example}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* BSV Advantages */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold mb-8 uppercase tracking-tight">Why Only BSV Can Do This</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {bsvAdvantages.map((advantage, index) => (
                            <div key={index} className="bg-gradient-to-b from-purple-500/10 to-white/5 border border-white/20 rounded-lg p-6 text-center">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <advantage.icon className="w-6 h-6 text-purple-400" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{advantage.title}</h3>
                                <p className="text-sm text-white/60">{advantage.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Why This Is Novel */}
                <section className="mb-16 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-white/20 rounded-lg p-8">
                    <h2 className="text-3xl font-bold mb-6 uppercase tracking-tight">A New Market</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-3">Why Didn't This Exist Before?</h3>
                            <ul className="space-y-2 text-white/80">
                                <li>• Other blockchains: $5-50 per message inscription</li>
                                <li>• Makes conversation tokenization economically impossible</li>
                                <li>• No blockchain could store individual messages affordably</li>
                                <li>• Conversations had no way to become assets</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-3">BSV Changes Everything</h3>
                            <ul className="space-y-2 text-white/80">
                                <li>• $0.001 or less per message inscription</li>
                                <li>• Entire conversations become affordable to archive</li>
                                <li>• New asset class: communication as property</li>
                                <li>• First mover advantage in untapped market</li>
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
                                        <span className="inline-block bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                                            {example.industry}
                                        </span>
                                        <h3 className="text-xl font-bold">{example.useCase}</h3>
                                    </div>
                                    <span className="text-2xl font-bold text-white/20">0{index + 1}</span>
                                </div>
                                <p className="text-white/80 mb-3">{example.description}</p>
                                <div className="bg-purple-500/10 px-4 py-2 rounded inline-block">
                                    <p className="text-sm font-mono text-purple-400">{example.metrics}</p>
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
                            <div key={step.step} className="flex gap-6 border-l-4 border-purple-500/40 pl-6 pb-6">
                                <div className="flex-shrink-0 w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center font-bold text-xl -ml-9 mt-1">
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
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/10 border border-white/20 rounded-lg p-8 md:p-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Pioneer Conversation Tokens?
                    </h2>
                    <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
                        Be first in a new market. Transform your communications into valuable, ownable assets.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/agent/chat"
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-wider hover:opacity-90 transition-colors inline-flex items-center justify-center gap-2"
                        >
                            <Sparkles className="w-5 h-5" />
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
