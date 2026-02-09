'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    GitBranch,
    Users,
    Zap,
    FileText,
    Database,
    ArrowLeft,
    Layers,
    MousePointer
} from 'lucide-react';

// Correct flow: User → App (with MoneyButton UI) → Exchange → Cashboard → Divvy
const NODES = {
    user: { x: 80, y: 180 },
    app: { x: 240, y: 180 },
    moneybutton: { x: 240, y: 100 }, // MoneyButton sits ON TOP of app
    exchange: { x: 420, y: 180 },
    cashboard: { x: 600, y: 180 },
    divvy: { x: 780, y: 180 },
};

export default function ExchangePatternSchematic() {
    const [selectedNode, setSelectedNode] = useState<string | null>(null);

    const nodeInfo: Record<string, { title: string; description: string; packages: string[]; standalone?: boolean }> = {
        user: {
            title: 'User',
            description: 'The human interacting with the app. First point of contact is always through a MoneyButton.',
            packages: []
        },
        app: {
            title: 'App (Frontend)',
            description: 'Bitcoin Writer, Drive, Spreadsheet, Chat, etc. The UI that users interact with. Every app has MoneyButtons embedded in its interface.',
            packages: ['@b0ase/handcash', '@b0ase/inscription-service', '@b0ase/crypto-utils']
        },
        moneybutton: {
            title: 'MoneyButton (UI Layer)',
            description: 'UI component that sits on top of every app. First point of contact for users. Clicking a MoneyButton initiates a payment action.',
            packages: ['@b0ase/moneybutton', '@b0ase/payments', '@b0ase/dopamine'],
            standalone: true
        },
        exchange: {
            title: 'Exchange (Backend)',
            description: 'Embedded exchange backend. Every action has economic value. Handles token buy/sell, price curves, and transaction building.',
            packages: ['@b0ase/bonding-curve', '@b0ase/price-service', '@b0ase/ledger', '@b0ase/tx-builder']
        },
        cashboard: {
            title: 'Cashboard (Routing)',
            description: 'Routes payments according to rules. Determines where money flows: to dividends, treasury, operations, etc.',
            packages: ['@b0ase/validation', '@b0ase/queue-manager', '@b0ase/routing-engine'],
            standalone: true
        },
        divvy: {
            title: 'Divvy (Distribution)',
            description: 'Standalone dividend splitter. Any token can use Divvy to distribute payments to holders. Not tied to any specific token.',
            packages: ['@b0ase/dividend-engine', '@b0ase/token-distributor', '@b0ase/payout-service'],
            standalone: true
        },
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
                            <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                                <Layers className="w-6 h-6 text-orange-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-light tracking-tight">The Exchange Pattern</h1>
                                <p className="text-sm text-gray-500 font-mono">Universal Backend Architecture</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Key Insights */}
                <div className="mb-8 space-y-4">
                    <div className="p-4 border border-orange-500/30 rounded-lg bg-orange-950/20">
                        <p className="text-sm text-gray-300">
                            <span className="text-orange-400 font-medium">Key insight:</span> MoneyButtons are UI elements on top of apps —
                            the first point of contact for users. Every button is a potential transaction.
                        </p>
                    </div>
                    <div className="p-4 border border-purple-500/30 rounded-lg bg-purple-950/20">
                        <p className="text-sm text-gray-300">
                            <span className="text-purple-400 font-medium">Standalone primitives:</span> Divvy, Cashboard, and MoneyButton
                            are standalone products. Any business can use them for their own tokens.
                        </p>
                    </div>
                </div>

                {/* Flow Diagram */}
                <div className="relative border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-100/50 dark:bg-gray-900/30 overflow-hidden mb-8" style={{ height: '320px' }}>
                    {/* Grid Background */}
                    <div className="absolute inset-0 opacity-10 dark:opacity-10" style={{
                        backgroundImage: 'radial-gradient(circle, #999 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }} />

                    {/* App container showing MoneyButton is ON the app */}
                    <div
                        className="absolute border-2 border-dashed border-blue-500/30 rounded-xl"
                        style={{ left: 170, top: 70, width: 140, height: 160 }}
                    >
                        <span className="absolute -top-3 left-4 px-2 bg-gray-50 dark:bg-black text-[10px] font-mono text-blue-500 dark:text-blue-400">
                            App + MoneyButton
                        </span>
                    </div>

                    {/* SVG Connections */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {/* User → App */}
                        <line x1={NODES.user.x} y1={NODES.user.y} x2={NODES.app.x - 70} y2={NODES.app.y}
                              stroke="rgba(156, 163, 175, 0.4)" strokeWidth="2" strokeDasharray="6,6">
                            <animate attributeName="stroke-dashoffset" from="12" to="0" dur="1s" repeatCount="indefinite" />
                        </line>

                        {/* MoneyButton → Exchange (main action flow) */}
                        <line x1={NODES.moneybutton.x + 60} y1={NODES.moneybutton.y + 30} x2={NODES.exchange.x - 50} y2={NODES.exchange.y - 30}
                              stroke="rgba(34, 197, 94, 0.5)" strokeWidth="3" strokeDasharray="8,4">
                            <animate attributeName="stroke-dashoffset" from="12" to="0" dur="0.5s" repeatCount="indefinite" />
                        </line>

                        {/* Exchange → Cashboard */}
                        <line x1={NODES.exchange.x + 50} y1={NODES.exchange.y} x2={NODES.cashboard.x - 50} y2={NODES.cashboard.y}
                              stroke="rgba(168, 85, 247, 0.4)" strokeWidth="2" strokeDasharray="6,6">
                            <animate attributeName="stroke-dashoffset" from="12" to="0" dur="0.7s" repeatCount="indefinite" />
                        </line>

                        {/* Cashboard → Divvy */}
                        <line x1={NODES.cashboard.x + 50} y1={NODES.cashboard.y} x2={NODES.divvy.x - 50} y2={NODES.divvy.y}
                              stroke="rgba(236, 72, 153, 0.4)" strokeWidth="2" strokeDasharray="6,6">
                            <animate attributeName="stroke-dashoffset" from="12" to="0" dur="0.7s" repeatCount="indefinite" />
                        </line>
                    </svg>

                    {/* Nodes */}
                    <FlowNode
                        x={NODES.user.x} y={NODES.user.y}
                        label="User" sublabel="Human"
                        icon={<MousePointer className="w-4 h-4" />}
                        color="gray"
                        selected={selectedNode === 'user'}
                        onClick={() => setSelectedNode(selectedNode === 'user' ? null : 'user')}
                    />
                    <FlowNode
                        x={NODES.moneybutton.x} y={NODES.moneybutton.y}
                        label="MoneyButton" sublabel="UI Trigger"
                        icon={<Zap className="w-4 h-4" />}
                        color="green"
                        selected={selectedNode === 'moneybutton'}
                        onClick={() => setSelectedNode(selectedNode === 'moneybutton' ? null : 'moneybutton')}
                    />
                    <FlowNode
                        x={NODES.app.x} y={NODES.app.y}
                        label="App" sublabel="Frontend"
                        icon={<FileText className="w-4 h-4" />}
                        color="blue"
                        selected={selectedNode === 'app'}
                        onClick={() => setSelectedNode(selectedNode === 'app' ? null : 'app')}
                    />
                    <FlowNode
                        x={NODES.exchange.x} y={NODES.exchange.y}
                        label="Exchange" sublabel="Backend"
                        icon={<Database className="w-4 h-4" />}
                        color="orange"
                        selected={selectedNode === 'exchange'}
                        onClick={() => setSelectedNode(selectedNode === 'exchange' ? null : 'exchange')}
                    />
                    <FlowNode
                        x={NODES.cashboard.x} y={NODES.cashboard.y}
                        label="Cashboard" sublabel="Routing"
                        icon={<GitBranch className="w-4 h-4" />}
                        color="purple"
                        selected={selectedNode === 'cashboard'}
                        onClick={() => setSelectedNode(selectedNode === 'cashboard' ? null : 'cashboard')}
                    />
                    <FlowNode
                        x={NODES.divvy.x} y={NODES.divvy.y}
                        label="Divvy" sublabel="Dividends"
                        icon={<Users className="w-4 h-4" />}
                        color="pink"
                        selected={selectedNode === 'divvy'}
                        onClick={() => setSelectedNode(selectedNode === 'divvy' ? null : 'divvy')}
                    />
                </div>

                {/* Selected Node Info */}
                {selectedNode && (
                    <div className="mb-8 p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-100/50 dark:bg-gray-900/50">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-light">{nodeInfo[selectedNode].title}</h3>
                            {nodeInfo[selectedNode].standalone && (
                                <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 rounded">
                                    Standalone Product
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-400 mb-4">{nodeInfo[selectedNode].description}</p>
                        {nodeInfo[selectedNode].packages.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {nodeInfo[selectedNode].packages.map(pkg => (
                                    <span key={pkg} className="px-2 py-1 text-xs font-mono bg-lime-500/10 text-lime-400 rounded">
                                        {pkg}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Standalone Products */}
                <div className="mb-8">
                    <h3 className="text-sm font-mono text-gray-500 uppercase tracking-wider mb-4">Standalone Primitives</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { name: 'MoneyButton', desc: 'UI payment trigger for any app', link: '/moneybuttons' },
                            { name: 'Cashboard', desc: 'Payment routing for any business', link: '/cashboard' },
                            { name: 'Divvy', desc: 'Dividend splitter for any token', link: '/cashboard/dividends' },
                        ].map(product => (
                            <Link key={product.name} href={product.link} className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
                                <div className="text-sm font-medium text-white">{product.name}</div>
                                <div className="text-xs text-gray-500 mt-1">{product.desc}</div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Apps Using This Pattern */}
                <div className="mb-8">
                    <h3 className="text-sm font-mono text-gray-500 uppercase tracking-wider mb-4">Apps Using This Pattern</h3>
                    <div className="grid grid-cols-4 gap-4">
                        {[
                            { name: 'Bitcoin Writer', token: '$WRITER', status: '90%' },
                            { name: 'Bitcoin Drive', token: '$DRIVE', status: '50%' },
                            { name: 'Bitcoin Spreadsheet', token: '$SHEET', status: '20%' },
                            { name: 'Bitcoin Chat', token: '$CHAT', status: 'Planned' },
                        ].map(app => (
                            <div key={app.name} className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                                <div className="text-sm font-medium">{app.name}</div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-xs font-mono text-gray-500">{app.token}</span>
                                    <span className="text-xs font-mono text-gray-600">{app.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Related Links */}
                <div className="flex gap-4">
                    <Link href="/cashboard" className="px-6 py-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors text-sm">
                        Open Cashboard →
                    </Link>
                    <Link href="/schematics/infrastructure-flow" className="px-6 py-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors text-sm">
                        View Infrastructure Flow →
                    </Link>
                    <Link href="/dividends" className="px-6 py-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 transition-colors text-sm">
                        View Primitives →
                    </Link>
                </div>
            </div>
        </div>
    );
}

function FlowNode({
    x, y, label, sublabel, icon, color, selected, onClick
}: {
    x: number;
    y: number;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    color: 'green' | 'purple' | 'yellow' | 'pink' | 'blue' | 'orange' | 'gray';
    selected?: boolean;
    onClick?: () => void;
}) {
    const colors = {
        green: 'bg-green-500/20 border-green-500/30 text-green-400',
        purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
        yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
        pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
        blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
        orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
        gray: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
    };

    return (
        <button
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${colors[color]} border rounded-lg px-3 py-2 text-center transition-all cursor-pointer hover:scale-105 ${
                selected ? 'ring-2 ring-white/50 scale-105' : ''
            }`}
            style={{ left: x, top: y }}
            onClick={onClick}
        >
            <div className="flex items-center gap-2">
                <div className="w-4 h-4">{icon}</div>
                <div>
                    <div className="text-xs font-medium text-gray-900 dark:text-white">{label}</div>
                    <div className="text-[10px] opacity-60">{sublabel}</div>
                </div>
            </div>
        </button>
    );
}
