"use client";

import { motion } from "framer-motion";
import {
    FiCheck,
    FiClock,
    FiTerminal,
} from 'react-icons/fi';
import Link from 'next/link';

interface RoadmapStep {
    title: string;
    description: string;
    status: 'completed' | 'in-progress' | 'planned';
    time: string;
    cost: string;
    tags: string[];
}

interface RoadmapPhase {
    phaseId: string;
    title: string;
    period: string;
    steps: RoadmapStep[];
}

const roadmapData: RoadmapPhase[] = [
    {
        phaseId: "01",
        title: "FOUNDATION LAYERING",
        period: "Q4 2025",
        steps: [
            {
                title: "Unified Identity Protocol",
                description: "Merger of Supabase Auth with HandCash $handles and GitHub OIDC. Single-session cross-chain identity.",
                status: "completed",
                time: "160h",
                cost: "£12.5k",
                tags: ["Auth"]
            },
            {
                title: "Company Registry Engine",
                description: "Digital incorporation workflow with automated UK standard legal document injection.",
                status: "completed",
                time: "120h",
                cost: "£8.0k",
                tags: ["Legal"]
            },
            {
                title: "GitHub Permission Matrix",
                description: "Scoping of public_repo permissions for verified repository ownership confirmation.",
                status: "completed",
                time: "40h",
                cost: "£2.5k",
                tags: ["API"]
            }
        ]
    },
    {
        phaseId: "02",
        title: "TOKENISATION ARCHITECTURE",
        period: "Q1 2026",
        steps: [
            {
                title: "BSV-21 Token Deployment",
                description: "Implementation of @bsv/sdk for deploying BSV-20/21 tokens on the 1Sat Ordinals protocol.",
                status: "in-progress",
                time: "200h",
                cost: "£15.0k",
                tags: ["BSV"]
            },
            {
                title: "Repository Claim Logic",
                description: "Cryptographic proof of repo ownership via GitHub token exchange and on-chain inscription.",
                status: "in-progress",
                time: "80h",
                cost: "£6.5k",
                tags: ["Logic"]
            },
            {
                title: "Ordinals Inscription API",
                description: "On-chain system for inscribing project whitepapers and brand assets directly into BSV satoshis using B-protocol.",
                status: "in-progress",
                time: "100h",
                cost: "£7.5k",
                tags: ["Data", "B-map"]
            }
        ]
    },
    {
        phaseId: "03",
        title: "LIQUIDITY & COMPLIANCE",
        period: "Q2 2026",
        steps: [
            {
                title: "P2P Orderbook Engine",
                description: "Non-custodial exchange for trading equity-backed tokens via SPV.",
                status: "planned",
                time: "320h",
                cost: "£25.0k",
                tags: ["DeFi"]
            },
            {
                title: "Legal Wrapper Automation",
                description: "Automated issuance of UK Digital Share Certificates mapped to on-chain token balances.",
                status: "planned",
                time: "240h",
                cost: "£18.0k",
                tags: ["Compliance"]
            }
        ]
    },
    {
        phaseId: "04",
        title: "AUTONOMOUS OPERATING SYSTEM",
        period: "Q3-Q4 2026",
        steps: [
            {
                title: "Agentic Project Management",
                description: "AI Agents capable of executing pipeline tasks and managing social updates.",
                status: "planned",
                time: "480h",
                cost: "£40.0k",
                tags: ["AI"]
            },
            {
                title: "RAG Knowledge Mesh",
                description: "Distributed Long-Term Memory for agents using vector embeddings.",
                status: "planned",
                time: "200h",
                cost: "£15.0k",
                tags: ["Data"]
            },
            {
                title: "Multi-Chain Bridge",
                description: "Bridging b0ase assets to Solana and Ethereum for increased liquidity.",
                status: "planned",
                time: "300h",
                cost: "£22.5k",
                tags: ["Bridge"]
            }
        ]
    }
];

export default function RoadmapPage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5,
            },
        },
    };

    return (
        <motion.div
            className="min-h-screen bg-black text-white"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <section className="px-4 md:px-8 py-16">
                <div className="w-full">
                    {/* Header */}
                    <motion.div
                        className="mb-12 border-b border-zinc-900 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4"
                        variants={itemVariants}
                    >
                        <div>
                            <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter uppercase">
                                ROADMAP<span className="text-zinc-600">.ISO</span>
                            </h1>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2 font-mono">
                                System Evolution Manifest · {roadmapData.reduce((acc, phase) => acc + phase.steps.length, 0)} Atomic Tasks
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold font-mono text-emerald-500 uppercase tracking-widest">Active_Build</span>
                            </div>
                            <span className="text-[10px] text-zinc-700 font-mono uppercase tracking-tighter">V_1.0.4-LTS</span>
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        className="flex flex-wrap gap-2 mb-12"
                        variants={itemVariants}
                    >
                        {roadmapData.map((phase, i) => (
                            <a
                                key={i}
                                href={`#phase-${phase.phaseId}`}
                                className="px-3 py-1 text-[10px] border border-zinc-900 text-zinc-500 hover:border-white hover:text-white hover:bg-zinc-900/50 transition-all font-mono uppercase tracking-tight"
                            >
                                P-{phase.phaseId}: {phase.title}
                            </a>
                        ))}
                    </motion.div>

                    {/* Roadmap Tables */}
                    {roadmapData.map((phase, i) => (
                        <motion.div
                            key={i}
                            id={`phase-${phase.phaseId}`}
                            className="mb-16 scroll-mt-32"
                            variants={itemVariants}
                        >
                            <h2 className="text-xl font-bold uppercase tracking-tight mb-4 text-zinc-300">
                                <span className="text-zinc-600 mr-2 font-mono">{phase.phaseId}</span>
                                {phase.title.replace(/\s+/g, '_')}
                                <span className="ml-4 text-[10px] font-mono text-zinc-500 bg-zinc-900/50 px-2 py-0.5 tracking-widest">{phase.period}</span>
                            </h2>

                            <div className="border border-zinc-900">
                                {/* Table Header */}
                                <div className="grid grid-cols-12 px-4 py-2 border-b border-zinc-900 bg-zinc-900/10">
                                    <div className="col-span-6 text-[10px] text-zinc-600 uppercase tracking-widest font-mono font-bold">
                                        Task / Specification
                                    </div>
                                    <div className="col-span-2 text-[10px] text-zinc-600 uppercase tracking-widest text-center font-mono font-bold">
                                        Status
                                    </div>
                                    <div className="col-span-2 text-[10px] text-zinc-600 uppercase tracking-widest text-right font-mono font-bold">
                                        Time
                                    </div>
                                    <div className="col-span-2 text-[10px] text-zinc-600 uppercase tracking-widest text-right font-mono font-bold">
                                        Cost
                                    </div>
                                </div>

                                {/* Table Rows */}
                                <div className="divide-y divide-zinc-900">
                                    {phase.steps.map((step, j) => (
                                        <motion.div
                                            key={j}
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: j * 0.05 }}
                                            className="grid grid-cols-12 px-4 py-3 hover:bg-zinc-900/50 transition-colors group"
                                        >
                                            <div className="col-span-6 pr-4">
                                                <div className="text-sm text-zinc-400 group-hover:text-white transition-colors uppercase font-bold tracking-tight mb-1">
                                                    {step.title}
                                                </div>
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    <p className="text-[10px] text-zinc-600 font-mono leading-tight group-hover:text-zinc-500">
                                                        {step.description}
                                                    </p>
                                                    {step.tags.map(tag => (
                                                        <span key={tag} className="text-[8px] px-1 py-px border border-zinc-900 text-zinc-700 uppercase font-mono group-hover:border-zinc-800 transition-colors">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="col-span-2 flex items-center justify-center">
                                                {step.status === 'completed' ? (
                                                    <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase tracking-tighter">
                                                        <FiCheck /> DONE
                                                    </div>
                                                ) : step.status === 'in-progress' ? (
                                                    <div className="flex items-center gap-1 text-[9px] font-bold text-amber-600 animate-pulse uppercase tracking-tighter">
                                                        <FiTerminal /> LIVE
                                                    </div>
                                                ) : (
                                                    <div className="text-[9px] font-bold text-zinc-800 uppercase tracking-tighter">
                                                        WAITING
                                                    </div>
                                                )}
                                            </div>

                                            <div className="col-span-2 flex items-center justify-end text-sm font-bold font-mono text-zinc-400 group-hover:text-white">
                                                {step.time}
                                            </div>

                                            <div className="col-span-2 flex items-center justify-end text-sm font-bold font-mono text-zinc-400 group-hover:text-white">
                                                {step.status === 'planned' ? step.cost : '--'}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Snapshot Footer */}
                    <motion.div
                        className="mt-16 pt-8 border-t border-zinc-900"
                        variants={itemVariants}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                            <div>
                                <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono font-bold block mb-2">Aggregate_Time</span>
                                <div className="flex items-baseline">
                                    <span className="text-3xl font-bold">2,180</span>
                                    <span className="text-xs text-zinc-700 ml-1 font-mono uppercase">hrs</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono font-bold block mb-2">Total_Capex</span>
                                <div className="flex items-baseline">
                                    <span className="text-3xl font-bold">175,000</span>
                                    <span className="text-xs text-zinc-700 ml-1 font-mono uppercase">gbp</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono font-bold block mb-2">Chain_Ops</span>
                                <div className="flex items-baseline">
                                    <span className="text-3xl font-bold">100.0</span>
                                    <span className="text-xs text-zinc-700 ml-1 font-mono uppercase">%</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono font-bold block mb-2">Readiness</span>
                                <div className="flex items-baseline">
                                    <span className="text-3xl font-bold text-emerald-500">L2</span>
                                    <span className="text-xs text-zinc-700 ml-1 font-mono uppercase">std</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="max-w-2xl">
                                <p className="text-xs text-zinc-500 mb-2 font-mono uppercase leading-relaxed">
                                    The b0ase system is the strategy. Every venture built here follows this blueprint. We deploy technical infrastructure for the next generation of digital equity.
                                </p>
                                <div className="p-3 border border-zinc-900 bg-zinc-900/10 inline-block">
                                    <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-tight">
                                        <span className="text-white font-bold underline">Venture Capital Note:</span> Planned tasks (Waiting) are open for individual funding. Investors receive $BOASE tokens in proportion to their contribution.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Link
                                    href="/portfolio/repos"
                                    className="px-6 py-3 border border-zinc-900 text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:border-white hover:text-white transition-all font-mono"
                                >
                                    Repos
                                </Link>
                                <Link
                                    href="/contact"
                                    className="px-6 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono"
                                >
                                    Fund Development
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <style jsx global>{`
        .font-darktech {
          font-family: 'DarkTech', monospace;
        }
      `}</style>
        </motion.div>
    );
}
