'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { Scale, FileText, Shield, Lock } from 'lucide-react';

export default function LegalTokensPage() {
    const useCases = [
        {
            title: 'Contract Management',
            description: 'Immutable contracts with versioned amendments and timestamped signatures.',
            example: 'Service agreements inscribed on-chain with automatic renewal tracking'
        },
        {
            title: 'Compliance Documentation',
            description: 'Regulatory filings and certifications that can\'t be altered or backdated.',
            example: 'GDPR compliance certificates with audit trails'
        },
        {
            title: 'Intellectual Property',
            description: 'Patents, trademarks, and copyrights registered with provable timestamps.',
            example: 'Prior art documentation for patent disputes'
        },
        {
            title: 'Court Records',
            description: 'Legal proceedings, judgments, and evidence with tamper-proof integrity.',
            example: 'Evidence chain of custody for criminal cases'
        }
    ];

    const bsvAdvantages = [
        {
            title: 'Immutable Evidence',
            description: 'Once inscribed, records cannot be altered, deleted, or backdated.',
            icon: Shield
        },
        {
            title: 'Timestamped Forever',
            description: 'Every document has a cryptographically provable timestamp.',
            icon: FileText
        },
        {
            title: 'Global Accessibility',
            description: 'Access legal records from anywhere with internet connectivity.',
            icon: Lock
        },
        {
            title: 'Court Admissible',
            description: 'Meets evidentiary standards for digital records in most jurisdictions.',
            icon: Scale
        }
    ];

    const realWorldExamples = [
        {
            industry: 'Corporate Law',
            useCase: 'Shareholder Agreements',
            description: 'Multi-party shareholder agreements with on-chain voting records, dividend distributions, and amendment history.',
            metrics: 'Complete version history'
        },
        {
            industry: 'Real Estate',
            useCase: 'Property Deeds',
            description: 'Title deeds, transfer records, and encumbrance documentation with provable chain of ownership.',
            metrics: 'Eliminates title disputes'
        },
        {
            industry: 'Employment',
            useCase: 'Employment Contracts',
            description: 'Offer letters, NDAs, and termination notices with employee acknowledgment timestamps.',
            metrics: 'HR dispute prevention'
        },
        {
            industry: 'Insurance',
            useCase: 'Policy Documents',
            description: 'Insurance policies with claims history, amendments, and payout records on-chain.',
            metrics: 'Fraud-proof claims'
        }
    ];

    const implementationSteps = [
        {
            step: 1,
            title: 'Legal Design Workshop',
            description: 'Work with your legal team to understand document requirements and jurisdictional needs.',
            duration: '1 week'
        },
        {
            step: 2,
            title: 'Template Development',
            description: 'Create smart contract templates for your specific legal document types.',
            duration: '2 weeks'
        },
        {
            step: 3,
            title: 'Signature Integration',
            description: 'Implement multi-party digital signatures with identity verification.',
            duration: '1-2 weeks'
        },
        {
            step: 4,
            title: 'Deployment & Training',
            description: 'Launch system and train your team on creating and managing legal tokens.',
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
                        <div className="w-16 h-16 bg-amber-500/20 rounded-lg flex items-center justify-center">
                            <Scale className="w-8 h-8 text-amber-400" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight">
                            Legal Record Tokens
                        </h1>
                    </div>
                    <p className="text-2xl text-white/60 mb-4">
                        Contracts & Compliance Documents
                    </p>
                    <p className="text-xl text-white/80 max-w-3xl">
                        Transform legal documents into immutable, timestamped records on the blockchain. From contracts to compliance certificates, create tamper-proof legal evidence that holds up in court.
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <p className="text-3xl font-bold mb-2">5-8</p>
                        <p className="text-sm text-white/60 uppercase tracking-wider">Weeks to Market</p>
                    </div>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <p className="text-3xl font-bold mb-2">High</p>
                        <p className="text-sm text-white/60 uppercase tracking-wider">Complexity</p>
                    </div>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <p className="text-3xl font-bold mb-2">Forever</p>
                        <p className="text-sm text-white/60 uppercase tracking-wider">Record Retention</p>
                    </div>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <p className="text-3xl font-bold mb-2">Court</p>
                        <p className="text-sm text-white/60 uppercase tracking-wider">Admissible</p>
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
                                <div className="bg-amber-500/10 border-l-4 border-amber-500 p-3 rounded">
                                    <p className="text-sm text-white/60">Example:</p>
                                    <p className="text-sm text-white">{useCase.example}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* BSV Advantages */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold mb-8 uppercase tracking-tight">Why BSV for Legal Records?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {bsvAdvantages.map((advantage, index) => (
                            <div key={index} className="bg-gradient-to-b from-amber-500/10 to-white/5 border border-white/20 rounded-lg p-6 text-center">
                                <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <advantage.icon className="w-6 h-6 text-amber-400" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{advantage.title}</h3>
                                <p className="text-sm text-white/60">{advantage.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Legal Technology Context */}
                <section className="mb-16 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-white/20 rounded-lg p-8">
                    <h2 className="text-3xl font-bold mb-6 uppercase tracking-tight">The Future of Legal Documentation</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-3">Current Problems</h3>
                            <ul className="space-y-2 text-white/80">
                                <li>• Documents can be backdated or altered</li>
                                <li>• Version control is manual and error-prone</li>
                                <li>• Multi-party signatures hard to verify</li>
                                <li>• Disputes over "who signed what, when"</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-3">Blockchain Solution</h3>
                            <ul className="space-y-2 text-white/80">
                                <li>• Cryptographic timestamps prove document date</li>
                                <li>• Every version permanently inscribed</li>
                                <li>• Verifiable digital signatures on-chain</li>
                                <li>• Complete audit trail for every action</li>
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
                                        <span className="inline-block bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                                            {example.industry}
                                        </span>
                                        <h3 className="text-xl font-bold">{example.useCase}</h3>
                                    </div>
                                    <span className="text-2xl font-bold text-white/20">0{index + 1}</span>
                                </div>
                                <p className="text-white/80 mb-3">{example.description}</p>
                                <div className="bg-amber-500/10 px-4 py-2 rounded inline-block">
                                    <p className="text-sm font-mono text-amber-400">{example.metrics}</p>
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
                            <div key={step.step} className="flex gap-6 border-l-4 border-amber-500/40 pl-6 pb-6">
                                <div className="flex-shrink-0 w-12 h-12 bg-amber-500 text-black rounded-lg flex items-center justify-center font-bold text-xl -ml-9 mt-1">
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
                <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-white/20 rounded-lg p-8 md:p-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Digitize Your Legal Records?
                    </h2>
                    <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
                        Create immutable legal documentation with cryptographic proof. Protect your organization with blockchain-backed records.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/agent/chat"
                            className="bg-amber-500 text-black px-8 py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-amber-400 transition-colors inline-flex items-center justify-center gap-2"
                        >
                            <Scale className="w-5 h-5" />
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
