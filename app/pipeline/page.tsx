'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    FiArrowRight,
    FiCheck,
    FiClock,
    FiPlay,
    FiSearch,
    FiDollarSign,
    FiTrendingUp,
    FiLayers,
} from 'react-icons/fi';
import { portfolioData } from '@/lib/data';

// Map project status to pipeline phase
const getPhaseFromStatus = (status: string): { phase: string; order: number } => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'concept' || statusLower === 'idea') return { phase: 'Concept', order: 1 };
    if (statusLower === 'demo' || statusLower === 'prototype') return { phase: 'Seed', order: 2 };
    if (statusLower === 'beta' || statusLower === 'development') return { phase: 'Build', order: 3 };
    if (statusLower === 'live' || statusLower === 'launched') return { phase: 'Launch', order: 4 };
    if (statusLower === 'ltd' || statusLower === 'scaling' || statusLower === 'growth') return { phase: 'Scale', order: 5 };
    // Default based on token progress
    return { phase: 'Concept', order: 1 };
};

// Calculate overall progress percentage based on phase
const getProgressFromPhase = (phaseOrder: number, tokenProgress: number): number => {
    const baseProgress = (phaseOrder - 1) * 20; // Each phase is 20%
    const phaseBonus = Math.min(tokenProgress / 5, 20); // Token progress adds up to 20% within phase
    return Math.min(baseProgress + phaseBonus, 100);
};

const phaseColors: Record<string, string> = {
    'Concept': 'text-gray-400 border-gray-600',
    'Seed': 'text-blue-400 border-blue-600',
    'Build': 'text-yellow-400 border-yellow-600',
    'Launch': 'text-green-400 border-green-600',
    'Scale': 'text-purple-400 border-purple-600',
};

const PHASES = ['All', 'Concept', 'Seed', 'Build', 'Launch', 'Scale'];

export default function PipelineIndexPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPhase, setSelectedPhase] = useState('All');

    // Transform portfolio projects into pipeline items
    const pipelineProjects = useMemo(() => {
        return portfolioData.projects
            .filter(p => p.tokenName) // Only show projects with tokens
            .map(project => {
                const { phase, order } = getPhaseFromStatus(project.status);
                const progress = getProgressFromPhase(order, project.tokenProgressPercent || 0);
                return {
                    ...project,
                    phase,
                    phaseOrder: order,
                    progress,
                };
            })
            .sort((a, b) => b.progress - a.progress); // Sort by progress descending
    }, []);

    // Filter projects
    const filteredProjects = useMemo(() => {
        return pipelineProjects.filter(project => {
            const matchesSearch =
                project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (project.tokenName?.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesPhase = selectedPhase === 'All' || project.phase === selectedPhase;
            return matchesSearch && matchesPhase;
        });
    }, [pipelineProjects, searchTerm, selectedPhase]);

    // Stats
    const stats = useMemo(() => {
        const total = pipelineProjects.length;
        const launched = pipelineProjects.filter(p => p.phaseOrder >= 4).length;
        const inProgress = pipelineProjects.filter(p => p.phaseOrder === 2 || p.phaseOrder === 3).length;
        const avgProgress = Math.round(pipelineProjects.reduce((acc, p) => acc + p.progress, 0) / total);
        return { total, launched, inProgress, avgProgress };
    }, [pipelineProjects]);

    return (
        <div className="min-h-screen bg-black text-white font-mono">
            <div className="px-4 md:px-8 py-16">
                {/* Header */}
                <div className="mb-8 border-b border-gray-800 pb-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-2">
                                PIPELINE<span className="text-gray-600">_</span>
                            </h1>
                            <p className="text-gray-500 text-sm uppercase tracking-widest">
                                Project Development & Funding Tracker
                            </p>
                        </div>
                        <Link
                            href="/kintsugi"
                            className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-200 transition-colors text-sm font-bold"
                        >
                            <FiLayers size={16} />
                            Submit Project
                        </Link>
                    </div>
                </div>

                {/* Intro */}
                <div className="mb-8 p-6 border border-gray-800 bg-gray-900/30">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-800 flex items-center justify-center flex-shrink-0">
                            <FiTrendingUp className="text-green-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-2">Kintsugi Pipeline</h2>
                            <p className="text-gray-400 text-sm">
                                Every project moves through 5 funding phases: <strong>Concept → Seed → Build → Launch → Scale</strong>.
                                Investors can drop in at any stage to fund the next milestone. Each phase unlocks as funding targets are hit.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 bg-gray-900/50 border border-gray-800">
                        <p className="text-3xl font-bold">{stats.total}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Projects</p>
                    </div>
                    <div className="p-4 bg-gray-900/50 border border-gray-800">
                        <p className="text-3xl font-bold text-green-400">{stats.launched}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Launched</p>
                    </div>
                    <div className="p-4 bg-gray-900/50 border border-gray-800">
                        <p className="text-3xl font-bold text-blue-400">{stats.inProgress}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Building</p>
                    </div>
                    <div className="p-4 bg-gray-900/50 border border-gray-800">
                        <p className="text-3xl font-bold">{stats.avgProgress}%</p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Avg Progress</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                        <input
                            type="text"
                            placeholder="Search projects or tokens..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black border border-gray-800 pl-10 pr-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white transition-colors"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {PHASES.map((phase) => (
                            <button
                                key={phase}
                                onClick={() => setSelectedPhase(phase)}
                                className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                                    selectedPhase === phase
                                        ? 'bg-white text-black'
                                        : 'border border-gray-800 text-gray-500 hover:text-white hover:border-white'
                                }`}
                            >
                                {phase}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results count */}
                <div className="text-gray-600 text-xs mb-4">
                    {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} in pipeline
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                    {filteredProjects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link href={`/mint/launch/${project.slug}/roadmap`}>
                                <div className="p-6 bg-gray-900/30 border border-gray-800 hover:border-gray-600 transition-all group">
                                    {/* Project Header */}
                                    <div className="flex items-start gap-4 mb-4">
                                        {/* Project Image */}
                                        {project.cardImageUrls?.[0] && (
                                            <div className="w-16 h-16 relative flex-shrink-0 bg-gray-800 overflow-hidden">
                                                <Image
                                                    src={project.cardImageUrls[0]}
                                                    alt={project.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors truncate">
                                                {project.title}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                {project.tokenName && (
                                                    <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400">
                                                        {project.tokenName}
                                                    </span>
                                                )}
                                                <span className={`text-xs px-2 py-0.5 border ${phaseColors[project.phase]}`}>
                                                    {project.phase}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-2xl font-bold">{project.progress}%</span>
                                            <FiArrowRight className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-500 text-xs line-clamp-2 mb-4">
                                        {project.description}
                                    </p>

                                    {/* Progress Bar */}
                                    <div className="h-2 bg-gray-800 rounded-full mb-4 overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${project.progress}%` }}
                                            transition={{ delay: index * 0.05 + 0.3, duration: 0.5 }}
                                        />
                                    </div>

                                    {/* Phase Pills */}
                                    <div className="flex gap-1">
                                        {['Concept', 'Seed', 'Build', 'Launch', 'Scale'].map((phase, i) => {
                                            const phaseOrder = i + 1;
                                            const isComplete = project.phaseOrder > phaseOrder;
                                            const isCurrent = project.phaseOrder === phaseOrder;
                                            return (
                                                <div
                                                    key={phase}
                                                    className={`flex-1 h-1 ${
                                                        isComplete
                                                            ? 'bg-green-500'
                                                            : isCurrent
                                                            ? 'bg-blue-500'
                                                            : 'bg-gray-800'
                                                    }`}
                                                    title={phase}
                                                />
                                            );
                                        })}
                                    </div>

                                    {/* Footer */}
                                    <div className="pt-4 mt-4 border-t border-gray-800 flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            {project.price && (
                                                <span className="flex items-center gap-1">
                                                    <FiDollarSign size={12} />
                                                    {project.price.toLocaleString()}
                                                </span>
                                            )}
                                            <span>{project.status}</span>
                                        </div>
                                        <span className="text-xs text-blue-400 group-hover:underline">
                                            View Roadmap →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredProjects.length === 0 && (
                    <div className="text-center py-16 border border-gray-800">
                        <p className="text-gray-500 mb-4">No projects found matching your search.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedPhase('All'); }}
                            className="text-white hover:underline text-sm"
                        >
                            Clear filters
                        </button>
                    </div>
                )}

                {/* Pipeline Phases Legend */}
                <div className="p-6 bg-gray-900/30 border border-gray-800">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
                        Funding Phases
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {[
                            { phase: 'Concept', funding: '$0', desc: 'Idea validation & research' },
                            { phase: 'Seed', funding: '$10K', desc: 'Token launch & MVP' },
                            { phase: 'Build', funding: '$50K', desc: 'Full product development' },
                            { phase: 'Launch', funding: '$100K', desc: 'Public release & marketing' },
                            { phase: 'Scale', funding: '$250K', desc: 'Team expansion & growth' },
                        ].map((item, index) => (
                            <div key={item.phase} className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {index + 1}
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${phaseColors[item.phase]?.split(' ')[0] || 'text-white'}`}>
                                        {item.phase}
                                    </p>
                                    <p className="text-xs text-gray-600">{item.funding}</p>
                                    <p className="text-xs text-gray-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MoneyButton CTA */}
                <div className="mt-8 p-6 border border-yellow-500/30 bg-yellow-900/10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold mb-1">Fund Projects with MoneyButton</h3>
                            <p className="text-gray-400 text-sm">
                                Every press costs less than a penny. Every press mints tokens.
                                <Link href="/blog/moneybutton-path-to-10-million" className="text-yellow-400 hover:underline ml-1">
                                    Read the $10M thesis →
                                </Link>
                            </p>
                        </div>
                        <Link
                            href="/moneybuttons"
                            className="px-4 py-2 bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400 transition-colors whitespace-nowrap"
                        >
                            Press MoneyButton
                        </Link>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-8 p-8 border border-gray-800 text-center">
                    <h2 className="text-xl font-bold uppercase tracking-tight mb-2">Want to fund a project?</h2>
                    <p className="text-gray-500 text-sm mb-6 max-w-lg mx-auto">
                        Click any project to view its roadmap and funding milestones.
                        Early investors get the best token prices.
                    </p>
                    <Link
                        href="/treasury"
                        className="inline-block px-6 py-3 bg-white text-black font-bold uppercase tracking-wider text-sm hover:bg-gray-200 transition-colors"
                    >
                        View Treasury
                    </Link>
                </div>
            </div>
        </div>
    );
}
