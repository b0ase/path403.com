'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiShield, FiLock, FiSearch, FiCode, FiCpu, FiAlertCircle, FiArrowLeft, FiCheck } from 'react-icons/fi';

export default function CyberSecurityPage() {
    return (
        <div className="min-h-screen bg-black text-white font-mono selection:bg-red-500 selection:text-white">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-900">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/services" className="text-gray-500 hover:text-white flex items-center gap-2 transition-colors">
                        <FiArrowLeft /> BACK TO SERVICES
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-bold tracking-widest text-sm">SECURE. AUDIT. PROTECT.</span>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20">
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-6 mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl"
                    >
                        <div className="flex items-center gap-3 text-red-500 mb-6">
                            <FiShield size={32} />
                            <span className="text-sm font-bold tracking-[0.3em]">CYBER SECURITY DIVISION</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                            ELIMINATE<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600">VULNERABILITIES</span><br />
                            BEFORE THEY EXPLOIT YOU.
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl leading-relaxed mb-12">
                            Comprehensive penetration testing, security audits, and automated vulnerability scanning for modern web applications and smart contracts.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/contact"
                                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 font-bold text-sm tracking-widest transition-all"
                            >
                                REQUEST AUDIT
                            </Link>
                            <Link
                                href="/services/cyber-security/checkup"
                                className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-8 py-4 font-bold text-sm tracking-widest transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                            >
                                FREE HYGIENE CHECKUP
                            </Link>
                        </div>
                    </motion.div>
                </section>

                {/* Services Grid */}
                <section className="border-t border-gray-900 bg-gray-950/30 py-32">
                    <div className="max-w-7xl mx-auto px-6">
                        <h2 className="text-3xl font-bold mb-16 flex items-center gap-4">
                            <FiCode className="text-red-500" />
                            OFFENSIVE SECURITY SERVICES
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <FiSearch size={32} />,
                                    title: 'PENETRATION TESTING',
                                    desc: 'Simulated cyberattacks against your computer system to check for exploitable vulnerabilities. We use the same tools as the hackers.',
                                    features: ['Web App Testing', 'Network Infrastructure', 'Social Engineering']
                                },
                                {
                                    icon: <FiLock size={32} />,
                                    title: 'SMART CONTRACT AUDITS',
                                    desc: ' rigorous analysis of blockchain smart contracts to discover errors, issues, and security vulnerabilities in the code.',
                                    features: ['Gas Optimization', 'Logic Verification', 'Funds Safety']
                                },
                                {
                                    icon: <FiCpu size={32} />,
                                    title: 'AUTOMATED AGENTS',
                                    desc: 'Deploy "Shannon", our autonomous security agent that continuously scans your infrastructure for new threats.',
                                    features: ['24/7 Monitoring', 'Real-time Alerts', 'Auto-Patching']
                                }
                            ].map((service, index) => (
                                <div key={index} className="bg-black border border-gray-900 p-8 hover:border-red-500/50 transition-colors group">
                                    <div className="text-red-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                                        {service.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                                        {service.desc}
                                    </p>
                                    <ul className="space-y-3">
                                        {service.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                                                <FiCheck className="text-green-500" size={14} />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Methodology */}
                <section className="py-32">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl font-bold mb-8">THE SHANNON METHODOLOGY</h2>
                                <div className="space-y-8">
                                    {[
                                        { title: 'RECONNAISSANCE', desc: 'Gathering intelligence to understand the target environment.' },
                                        { title: 'SCANNING', desc: 'Using technical tools to further understand the target.' },
                                        { title: 'EXPLOITATION', desc: 'Attacking the target to uncover vulnerabilities.' },
                                        { title: 'REPORTING', desc: 'detailed documentation of findings and remediation steps.' }
                                    ].map((step, i) => (
                                        <div key={i} className="flex gap-6">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 rounded-full bg-red-900/30 text-red-500 flex items-center justify-center font-bold text-sm border border-red-500/30">
                                                    {i + 1}
                                                </div>
                                                {i !== 3 && <div className="w-0.5 h-full bg-gray-900 my-2" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg mb-1">{step.title}</h4>
                                                <p className="text-gray-500 text-sm">{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-500/5 blur-3xl rounded-full" />
                                <div className="border border-gray-800 bg-gray-900/50 p-8 backdrop-blur-sm relative">
                                    <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-4">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                        <span className="text-xs text-gray-500 ml-2">shannon-cli — v1.0.4</span>
                                    </div>
                                    <pre className="font-mono text-xs leading-relaxed text-green-400">
                                        {`$ shannon scan --target=production

[+] Target determined: 192.168.1.105
[+] Port scan started...
[+] Open ports found: 80, 443, 8080
[!] VULNERABILITY DETECTED
    Type: SQL Injection
    Severity: HIGH
    Location: /api/login

[+] Generative report...
[+] Patch suggestion generated.
`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 bg-red-600 text-white text-center">
                    <div className="max-w-4xl mx-auto px-6">
                        <FiAlertCircle size={48} className="mx-auto mb-6 opacity-80" />
                        <h2 className="text-4xl font-bold mb-6">DON'T WAIT FOR A BREACH.</h2>
                        <p className="text-xl mb-10 opacity-90">Secure your digital assets with professional-grade auditing and autonomous defense.</p>
                        <Link
                            href="/dashboard/agents"
                            className="inline-block bg-white text-red-600 px-8 py-4 font-bold text-sm tracking-widest hover:bg-gray-100 transition-colors"
                        >
                            DEPLOY SECURITY AGENT
                        </Link>
                    </div>
                </section>

            </main>
        </div>
    );
}
