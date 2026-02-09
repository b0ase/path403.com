'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { User, Fingerprint, Key, BadgeCheck } from 'lucide-react';

export default function IdentityTokensPage() {
    const useCases = [
        {
            title: 'Digital Identity',
            description: 'Self-sovereign identity tokens that users control and selectively share.',
            example: 'KYC verification done once, reused across platforms'
        },
        {
            title: 'Professional Credentials',
            description: 'Verifiable certifications, degrees, and professional licenses.',
            example: 'Medical licenses that employers can instantly verify'
        },
        {
            title: 'Access Credentials',
            description: 'Token-based authentication replacing passwords and physical keys.',
            example: 'Building access via wallet instead of keycards'
        },
        {
            title: 'Reputation Systems',
            description: 'Portable reputation scores and endorsements across platforms.',
            example: 'Freelancer reviews that transfer between marketplaces'
        }
    ];

    const bsvAdvantages = [
        {
            title: 'Self-Sovereign',
            description: 'Users own their identity data, not platforms or governments.',
            icon: Key
        },
        {
            title: 'Selective Disclosure',
            description: 'Share only what\'s needed—prove age without revealing birthday.',
            icon: Fingerprint
        },
        {
            title: 'Instant Verification',
            description: 'Verify credentials in milliseconds without contacting issuers.',
            icon: BadgeCheck
        },
        {
            title: 'Fraud Prevention',
            description: 'Cryptographic proofs make credential forgery impossible.',
            icon: User
        }
    ];

    const realWorldExamples = [
        {
            industry: 'Finance',
            useCase: 'KYC/AML Compliance',
            description: 'Complete KYC once, share verification tokens with any financial service. Banks verify instantly without re-collecting documents.',
            metrics: '90% reduction in KYC time'
        },
        {
            industry: 'Education',
            useCase: 'Academic Credentials',
            description: 'Universities issue degrees as tokens. Employers verify authenticity instantly without contacting institutions.',
            metrics: 'Eliminates diploma fraud'
        },
        {
            industry: 'Healthcare',
            useCase: 'Medical Credentials',
            description: 'Doctors carry verified credentials in their wallet. Hospitals verify licenses, specializations, and standing instantly.',
            metrics: 'Real-time credentialing'
        },
        {
            industry: 'Gaming/Metaverse',
            useCase: 'Avatar Identity',
            description: 'Persistent identity across games and virtual worlds. Achievements, reputation, and assets linked to a single identity token.',
            metrics: 'Cross-platform avatars'
        }
    ];

    const implementationSteps = [
        {
            step: 1,
            title: 'Identity Schema Design',
            description: 'Define identity attributes, verification levels, and disclosure policies.',
            duration: '1 week'
        },
        {
            step: 2,
            title: 'Credential Issuance System',
            description: 'Build secure credential minting with issuer verification.',
            duration: '2 weeks'
        },
        {
            step: 3,
            title: 'Verification Integration',
            description: 'Create verification endpoints for relying parties to check credentials.',
            duration: '1-2 weeks'
        },
        {
            step: 4,
            title: 'User Wallet & UX',
            description: 'Deploy user-facing wallet for managing and sharing identity tokens.',
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
                        <div className="w-16 h-16 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <Fingerprint className="w-8 h-8 text-green-400" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight">
                            Identity Tokens
                        </h1>
                    </div>
                    <p className="text-2xl text-white/60 mb-4">
                        Digital Identity & Credentials
                    </p>
                    <p className="text-xl text-white/80 max-w-3xl">
                        Self-sovereign identity tokens give users control over their personal data. Verify credentials instantly, share selectively, and eliminate identity fraud with blockchain-backed authentication.
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <p className="text-3xl font-bold mb-2">4-7</p>
                        <p className="text-sm text-white/60 uppercase tracking-wider">Weeks to Market</p>
                    </div>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <p className="text-3xl font-bold mb-2">High</p>
                        <p className="text-sm text-white/60 uppercase tracking-wider">Complexity</p>
                    </div>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <p className="text-3xl font-bold mb-2">&lt;1s</p>
                        <p className="text-sm text-white/60 uppercase tracking-wider">Verification Time</p>
                    </div>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                        <p className="text-3xl font-bold mb-2">100%</p>
                        <p className="text-sm text-white/60 uppercase tracking-wider">User Control</p>
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
                                <div className="bg-green-500/10 border-l-4 border-green-500 p-3 rounded">
                                    <p className="text-sm text-white/60">Example:</p>
                                    <p className="text-sm text-white">{useCase.example}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* BSV Advantages */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold mb-8 uppercase tracking-tight">Why BSV for Identity Tokens?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {bsvAdvantages.map((advantage, index) => (
                            <div key={index} className="bg-gradient-to-b from-green-500/10 to-white/5 border border-white/20 rounded-lg p-6 text-center">
                                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <advantage.icon className="w-6 h-6 text-green-400" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{advantage.title}</h3>
                                <p className="text-sm text-white/60">{advantage.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Identity Revolution */}
                <section className="mb-16 bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-white/20 rounded-lg p-8">
                    <h2 className="text-3xl font-bold mb-6 uppercase tracking-tight">The Identity Problem</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-3">Today's Reality</h3>
                            <ul className="space-y-2 text-white/80">
                                <li>• Hundreds of logins and passwords</li>
                                <li>• Repeated KYC for every service</li>
                                <li>• Data breaches expose personal info</li>
                                <li>• No way to prove credentials online</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-3">With Identity Tokens</h3>
                            <ul className="space-y-2 text-white/80">
                                <li>• One identity, unlimited uses</li>
                                <li>• Verify once, share token everywhere</li>
                                <li>• You control what data is shared</li>
                                <li>• Instant cryptographic proof</li>
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
                                        <span className="inline-block bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                                            {example.industry}
                                        </span>
                                        <h3 className="text-xl font-bold">{example.useCase}</h3>
                                    </div>
                                    <span className="text-2xl font-bold text-white/20">0{index + 1}</span>
                                </div>
                                <p className="text-white/80 mb-3">{example.description}</p>
                                <div className="bg-green-500/10 px-4 py-2 rounded inline-block">
                                    <p className="text-sm font-mono text-green-400">{example.metrics}</p>
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
                            <div key={step.step} className="flex gap-6 border-l-4 border-green-500/40 pl-6 pb-6">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-500 text-black rounded-lg flex items-center justify-center font-bold text-xl -ml-9 mt-1">
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
                <div className="bg-gradient-to-r from-green-500/20 to-teal-500/10 border border-white/20 rounded-lg p-8 md:p-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Build Self-Sovereign Identity?
                    </h2>
                    <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
                        Give your users control over their identity. Create verifiable credentials that work everywhere.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/agent/chat"
                            className="bg-green-500 text-black px-8 py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-green-400 transition-colors inline-flex items-center justify-center gap-2"
                        >
                            <Fingerprint className="w-5 h-5" />
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
