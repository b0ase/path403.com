'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { Database, Shield, FileText, BarChart3 } from 'lucide-react';

export default function DataTokensPage() {
    const useCases = [
        {
            title: 'Dataset Ownership',
            description: 'Tokenize proprietary datasets with verifiable provenance and usage tracking.',
            example: 'AI training data sold with per-use licensing'
        },
        {
            title: 'IoT Sensor Data',
            description: 'Stream real-time sensor data as tokenized micro-transactions.',
            example: 'Weather stations selling data feeds to apps'
        },
        {
            title: 'Analytics & Insights',
            description: 'Package and sell business intelligence with on-chain access control.',
            example: 'Market research firms tokenizing reports'
        },
        {
            title: 'Personal Data Monetization',
            description: 'Enable individuals to own and monetize their personal data securely.',
            example: 'Health data shared with researchers for tokens'
        }
    ];

    const bsvAdvantages = [
        {
            title: 'Immutable Provenance',
            description: 'Every data update timestamped on-chain creates an unalterable audit trail.',
            icon: Shield
        },
        {
            title: 'Granular Access Control',
            description: 'Token-gated access at the record level enables precise data sharing.',
            icon: Database
        },
        {
            title: 'Data Integrity Proofs',
            description: 'Cryptographic hashes verify data hasn\'t been tampered with post-inscription.',
            icon: FileText
        },
        {
            title: 'Usage Analytics',
            description: 'Track every access, query, and download on-chain for transparent royalties.',
            icon: BarChart3
        }
    ];

    const realWorldExamples = [
        {
            industry: 'Healthcare',
            useCase: 'Medical Records',
            description: 'Patients control access to medical records via tokens. Researchers pay per-access for anonymized data with automatic patient royalties.',
            metrics: 'HIPAA-compliant data sharing'
        },
        {
            industry: 'Finance',
            useCase: 'Market Data',
            description: 'Real-time and historical trading data tokenized for instant access. Pay-per-query or subscription tokens available.',
            metrics: '1M+ queries/day supported'
        },
        {
            industry: 'AI/ML',
            useCase: 'Training Datasets',
            description: 'Curated training data with provenance tracking. Model trainers gain verifiable rights to use data in AI systems.',
            metrics: 'Audit trail for AI compliance'
        },
        {
            industry: 'Supply Chain',
            useCase: 'Logistics Data',
            description: 'Track goods from origin to destination with tokenized checkpoints. Each scan creates an immutable record.',
            metrics: '100% chain-of-custody tracking'
        }
    ];

    const implementationSteps = [
        {
            step: 1,
            title: 'Data Architecture Review',
            description: 'Analyze your data structures, privacy requirements, and monetization goals.',
            duration: '1 week'
        },
        {
            step: 2,
            title: 'Schema Design & Hashing',
            description: 'Design token schema with cryptographic hashing for data integrity verification.',
            duration: '1-2 weeks'
        },
        {
            step: 3,
            title: 'Access Control Layer',
            description: 'Build token-gated access with granular permissions and usage tracking.',
            duration: '2 weeks'
        },
        {
            step: 4,
            title: 'Integration & Launch',
            description: 'Connect to existing data systems, test thoroughly, and deploy to mainnet.',
            duration: '1-2 weeks'
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
                        <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Database className="w-8 h-8 text-blue-400" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight">
                            Data Tokens
                        </h1>
                    </div>
                    <p className="text-2xl text-white/60 mb-4">
                        Verifiable Information & Digital Assets
                    </p>
                    <p className="text-xl text-white/80 max-w-3xl">
                        Data tokens transform information into verifiable, tradeable assets. From IoT streams to medical records, tokenize any data with provenance, access control, and monetization built-in.
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <p className="text-3xl font-bold mb-2">4-6</p>
                        <p className="text-sm text-white/60 uppercase tracking-wider">Weeks to Market</p>
                    </div>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <p className="text-3xl font-bold mb-2">High</p>
                        <p className="text-sm text-white/60 uppercase tracking-wider">Complexity</p>
                    </div>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <p className="text-3xl font-bold mb-2">100%</p>
                        <p className="text-sm text-white/60 uppercase tracking-wider">Audit Trail</p>
                    </div>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <p className="text-3xl font-bold mb-2">∞</p>
                        <p className="text-sm text-white/60 uppercase tracking-wider">Data Capacity</p>
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
                                <div className="bg-blue-500/10 border-l-4 border-blue-500 p-3 rounded">
                                    <p className="text-sm text-white/60">Example:</p>
                                    <p className="text-sm text-white">{useCase.example}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* BSV Advantages */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold mb-8 uppercase tracking-tight">Why BSV for Data Tokens?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {bsvAdvantages.map((advantage, index) => (
                            <div key={index} className="bg-gradient-to-b from-blue-500/10 to-white/5 border border-white/20 rounded-lg p-6 text-center">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <advantage.icon className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{advantage.title}</h3>
                                <p className="text-sm text-white/60">{advantage.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Why This Matters - New Section */}
                <section className="mb-16 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/20 rounded-lg p-8">
                    <h2 className="text-3xl font-bold mb-6 uppercase tracking-tight">The Data Economy Revolution</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-3">Current Problem</h3>
                            <ul className="space-y-2 text-white/80">
                                <li>• Tech giants monetize your data without consent</li>
                                <li>• No way to verify data hasn't been altered</li>
                                <li>• Complex licensing for data sharing</li>
                                <li>• No trail when data is accessed or used</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-3">Tokenized Solution</h3>
                            <ul className="space-y-2 text-white/80">
                                <li>• Data owners control and profit from their data</li>
                                <li>• Cryptographic proof of data integrity</li>
                                <li>• Automatic access via token ownership</li>
                                <li>• Complete on-chain usage history</li>
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
                                        <span className="inline-block bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                                            {example.industry}
                                        </span>
                                        <h3 className="text-xl font-bold">{example.useCase}</h3>
                                    </div>
                                    <span className="text-2xl font-bold text-white/20">0{index + 1}</span>
                                </div>
                                <p className="text-white/80 mb-3">{example.description}</p>
                                <div className="bg-blue-500/10 px-4 py-2 rounded inline-block">
                                    <p className="text-sm font-mono text-blue-400">{example.metrics}</p>
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
                            <div key={step.step} className="flex gap-6 border-l-4 border-blue-500/40 pl-6 pb-6">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-500 text-black rounded-lg flex items-center justify-center font-bold text-xl -ml-9 mt-1">
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
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/10 border border-white/20 rounded-lg p-8 md:p-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Tokenize Your Data?
                    </h2>
                    <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
                        Transform your data into a verifiable, monetizable asset. We'll help you design the perfect data tokenization strategy.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/agent/chat"
                            className="bg-blue-500 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-blue-400 transition-colors inline-flex items-center justify-center gap-2"
                        >
                            <Database className="w-5 h-5" />
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
