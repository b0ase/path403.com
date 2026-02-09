'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    GitBranch,
    Users,
    Zap,
    ArrowLeft,
    Layers,
    Play,
    Pause,
    RotateCcw,
    MousePointer,
    Building2,
    Wallet
} from 'lucide-react';

// Flow: User clicks MoneyButton → Payment flows to Cashboard → Routed to Divvy → Distributed to token holders
const NODES = {
    user: { x: 80, y: 200 },
    moneybutton: { x: 220, y: 200 },
    cashboard: { x: 420, y: 200 },
    // Cashboard routes to multiple destinations
    treasury: { x: 620, y: 120 },
    operations: { x: 620, y: 200 },
    divvy: { x: 620, y: 280 },
    // Divvy pays token holders
    holders: { x: 820, y: 280 },
};

interface Particle {
    id: number;
    path: 'user-mb' | 'mb-cb' | 'cb-treasury' | 'cb-ops' | 'cb-divvy' | 'divvy-holders';
    progress: number;
}

export default function InfrastructureFlowSchematic() {
    const [isPlaying, setIsPlaying] = useState(true);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [stats, setStats] = useState({
        totalProcessed: 0,
        toTreasury: 0,
        toOperations: 0,
        toDividends: 0,
    });

    // Animation loop
    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            // Spawn new particle from user
            if (Math.random() > 0.7) {
                const id = Date.now();
                setParticles(prev => [...prev, { id, path: 'user-mb', progress: 0 }]);
            }

            // Update particle positions
            setParticles(prev => {
                const updated: Particle[] = [];

                prev.forEach(p => {
                    const newProgress = p.progress + 0.03;

                    if (newProgress >= 1) {
                        // Transition to next path
                        if (p.path === 'user-mb') {
                            updated.push({ ...p, path: 'mb-cb', progress: 0 });
                        } else if (p.path === 'mb-cb') {
                            // Cashboard routes based on configured split
                            const rand = Math.random();
                            if (rand < 0.3) {
                                updated.push({ ...p, path: 'cb-treasury', progress: 0 });
                            } else if (rand < 0.6) {
                                updated.push({ ...p, path: 'cb-ops', progress: 0 });
                            } else {
                                updated.push({ ...p, path: 'cb-divvy', progress: 0 });
                            }
                            setStats(s => ({ ...s, totalProcessed: s.totalProcessed + 1 }));
                        } else if (p.path === 'cb-treasury') {
                            setStats(s => ({ ...s, toTreasury: s.toTreasury + 1 }));
                            // Particle ends at treasury
                        } else if (p.path === 'cb-ops') {
                            setStats(s => ({ ...s, toOperations: s.toOperations + 1 }));
                            // Particle ends at operations
                        } else if (p.path === 'cb-divvy') {
                            updated.push({ ...p, path: 'divvy-holders', progress: 0 });
                            setStats(s => ({ ...s, toDividends: s.toDividends + 1 }));
                        }
                        // divvy-holders particles just disappear (distributed to holders)
                    } else {
                        updated.push({ ...p, progress: newProgress });
                    }
                });

                return updated;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [isPlaying]);

    const reset = () => {
        setParticles([]);
        setStats({ totalProcessed: 0, toTreasury: 0, toOperations: 0, toDividends: 0 });
    };

    const getParticlePosition = (particle: Particle) => {
        const paths = {
            'user-mb': { start: NODES.user, end: NODES.moneybutton },
            'mb-cb': { start: NODES.moneybutton, end: NODES.cashboard },
            'cb-treasury': { start: NODES.cashboard, end: NODES.treasury },
            'cb-ops': { start: NODES.cashboard, end: NODES.operations },
            'cb-divvy': { start: NODES.cashboard, end: NODES.divvy },
            'divvy-holders': { start: NODES.divvy, end: NODES.holders },
        };

        const path = paths[particle.path];
        return {
            x: path.start.x + (path.end.x - path.start.x) * particle.progress,
            y: path.start.y + (path.end.y - path.start.y) * particle.progress,
        };
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/schematics" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </Link>
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                                <Layers className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-light tracking-tight">Infrastructure Flow</h1>
                                <p className="text-sm text-gray-500 font-mono">MoneyButton → Cashboard → Divvy</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                            >
                                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={reset}
                                className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Key Insight */}
                <div className="mb-8 p-4 border border-purple-500/30 rounded-lg bg-purple-950/20">
                    <p className="text-sm text-gray-300">
                        <span className="text-purple-400 font-medium">How it works:</span> User clicks a MoneyButton →
                        Payment goes to Cashboard for routing → Cashboard splits funds to Treasury, Operations, and Divvy →
                        Divvy distributes dividends to token holders.
                    </p>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-100/50 dark:bg-gray-900/30">
                        <div className="text-xs font-mono text-gray-500 uppercase">Total Processed</div>
                        <div className="text-2xl font-light">{stats.totalProcessed}</div>
                    </div>
                    <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-100/50 dark:bg-gray-900/30">
                        <div className="text-xs font-mono text-gray-500 uppercase">To Treasury</div>
                        <div className="text-2xl font-light text-blue-400">{stats.toTreasury}</div>
                    </div>
                    <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-100/50 dark:bg-gray-900/30">
                        <div className="text-xs font-mono text-gray-500 uppercase">To Operations</div>
                        <div className="text-2xl font-light text-orange-400">{stats.toOperations}</div>
                    </div>
                    <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-100/50 dark:bg-gray-900/30">
                        <div className="text-xs font-mono text-gray-500 uppercase">To Dividends</div>
                        <div className="text-2xl font-light text-pink-400">{stats.toDividends}</div>
                    </div>
                </div>

                {/* Flow Diagram */}
                <div className="relative border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-100/50 dark:bg-gray-900/30 overflow-hidden mb-8" style={{ height: '400px' }}>
                    {/* Grid Background */}
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }} />

                    {/* SVG Connections */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {/* User → MoneyButton */}
                        <line x1={NODES.user.x} y1={NODES.user.y} x2={NODES.moneybutton.x - 50} y2={NODES.moneybutton.y}
                              stroke="rgba(156, 163, 175, 0.3)" strokeWidth="2" strokeDasharray="6,6">
                            <animate attributeName="stroke-dashoffset" from="12" to="0" dur="1s" repeatCount="indefinite" />
                        </line>

                        {/* MoneyButton → Cashboard */}
                        <line x1={NODES.moneybutton.x + 50} y1={NODES.moneybutton.y} x2={NODES.cashboard.x - 50} y2={NODES.cashboard.y}
                              stroke="rgba(34, 197, 94, 0.4)" strokeWidth="3" strokeDasharray="8,4">
                            <animate attributeName="stroke-dashoffset" from="12" to="0" dur="0.5s" repeatCount="indefinite" />
                        </line>

                        {/* Cashboard → Treasury */}
                        <line x1={NODES.cashboard.x + 50} y1={NODES.cashboard.y - 20} x2={NODES.treasury.x - 50} y2={NODES.treasury.y}
                              stroke="rgba(59, 130, 246, 0.4)" strokeWidth="2" strokeDasharray="6,6">
                            <animate attributeName="stroke-dashoffset" from="12" to="0" dur="0.7s" repeatCount="indefinite" />
                        </line>

                        {/* Cashboard → Operations */}
                        <line x1={NODES.cashboard.x + 50} y1={NODES.cashboard.y} x2={NODES.operations.x - 50} y2={NODES.operations.y}
                              stroke="rgba(249, 115, 22, 0.4)" strokeWidth="2" strokeDasharray="6,6">
                            <animate attributeName="stroke-dashoffset" from="12" to="0" dur="0.7s" repeatCount="indefinite" />
                        </line>

                        {/* Cashboard → Divvy */}
                        <line x1={NODES.cashboard.x + 50} y1={NODES.cashboard.y + 20} x2={NODES.divvy.x - 50} y2={NODES.divvy.y}
                              stroke="rgba(236, 72, 153, 0.4)" strokeWidth="2" strokeDasharray="6,6">
                            <animate attributeName="stroke-dashoffset" from="12" to="0" dur="0.7s" repeatCount="indefinite" />
                        </line>

                        {/* Divvy → Holders */}
                        <line x1={NODES.divvy.x + 50} y1={NODES.divvy.y} x2={NODES.holders.x - 50} y2={NODES.holders.y}
                              stroke="rgba(236, 72, 153, 0.3)" strokeWidth="2" strokeDasharray="4,4">
                            <animate attributeName="stroke-dashoffset" from="8" to="0" dur="0.8s" repeatCount="indefinite" />
                        </line>

                        {/* Animated Particles */}
                        {particles.map(p => {
                            const pos = getParticlePosition(p);
                            const colors = {
                                'user-mb': '#9ca3af',
                                'mb-cb': '#22c55e',
                                'cb-treasury': '#3b82f6',
                                'cb-ops': '#f97316',
                                'cb-divvy': '#ec4899',
                                'divvy-holders': '#ec4899',
                            };
                            return (
                                <circle
                                    key={p.id}
                                    cx={pos.x}
                                    cy={pos.y}
                                    r="4"
                                    fill={colors[p.path]}
                                    opacity="0.8"
                                />
                            );
                        })}
                    </svg>

                    {/* Nodes */}
                    <FlowNode
                        x={NODES.user.x} y={NODES.user.y}
                        label="User" sublabel="Click"
                        icon={<MousePointer className="w-4 h-4" />}
                        color="gray"
                    />
                    <FlowNode
                        x={NODES.moneybutton.x} y={NODES.moneybutton.y}
                        label="MoneyButton" sublabel="Trigger"
                        icon={<Zap className="w-4 h-4" />}
                        color="green"
                    />
                    <FlowNode
                        x={NODES.cashboard.x} y={NODES.cashboard.y}
                        label="Cashboard" sublabel="Router"
                        icon={<GitBranch className="w-4 h-4" />}
                        color="purple"
                    />
                    <FlowNode
                        x={NODES.treasury.x} y={NODES.treasury.y}
                        label="Treasury" sublabel="30%"
                        icon={<Building2 className="w-4 h-4" />}
                        color="blue"
                    />
                    <FlowNode
                        x={NODES.operations.x} y={NODES.operations.y}
                        label="Operations" sublabel="30%"
                        icon={<Wallet className="w-4 h-4" />}
                        color="orange"
                    />
                    <FlowNode
                        x={NODES.divvy.x} y={NODES.divvy.y}
                        label="Divvy" sublabel="40%"
                        icon={<Users className="w-4 h-4" />}
                        color="pink"
                    />
                    <FlowNode
                        x={NODES.holders.x} y={NODES.holders.y}
                        label="Holders" sublabel="Dividends"
                        icon={<Users className="w-4 h-4" />}
                        color="pink"
                    />
                </div>

                {/* Explanation */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-green-400" />
                            </div>
                            <h3 className="text-sm font-medium">MoneyButton</h3>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            UI component that triggers payments. Sits on top of apps. First point of contact for users.
                            Any app can integrate MoneyButtons.
                        </p>
                    </div>
                    <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                                <GitBranch className="w-4 h-4 text-purple-400" />
                            </div>
                            <h3 className="text-sm font-medium">Cashboard</h3>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Routes payments according to configurable rules. Any business can use Cashboard
                            to split funds between treasury, operations, and dividends.
                        </p>
                    </div>
                    <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
                                <Users className="w-4 h-4 text-pink-400" />
                            </div>
                            <h3 className="text-sm font-medium">Divvy</h3>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Standalone dividend distribution engine. Any token can use Divvy to automatically
                            distribute payments to token holders based on their holdings.
                        </p>
                    </div>
                </div>

                {/* Related Links */}
                <div className="flex gap-4">
                    <Link href="/cashboard" className="px-6 py-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors text-sm">
                        Open Cashboard →
                    </Link>
                    <Link href="/schematics/exchange-pattern" className="px-6 py-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors text-sm">
                        View Exchange Pattern →
                    </Link>
                    <Link href="/moneybuttons" className="px-6 py-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors text-sm">
                        View MoneyButtons →
                    </Link>
                </div>
            </div>
        </div>
    );
}

function FlowNode({
    x, y, label, sublabel, icon, color
}: {
    x: number;
    y: number;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    color: 'green' | 'purple' | 'yellow' | 'pink' | 'blue' | 'orange' | 'gray';
}) {
    const colors = {
        green: 'bg-green-500/20 border-green-500/30 text-green-400',
        purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
        yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
        pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
        blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
        orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
        gray: 'bg-gray-500/20 border-gray-500/30 text-gray-500 dark:text-gray-400',
    };

    return (
        <div
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${colors[color]} border rounded-lg px-3 py-2 text-center`}
            style={{ left: x, top: y }}
        >
            <div className="flex items-center gap-2">
                <div className="w-4 h-4">{icon}</div>
                <div>
                    <div className="text-xs font-medium text-gray-900 dark:text-white">{label}</div>
                    <div className="text-[10px] opacity-60">{sublabel}</div>
                </div>
            </div>
        </div>
    );
}
