'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Building, Coins, Droplets, Zap, Users, Shield } from 'lucide-react';

const nodes = [
    { id: 'source', label: 'B0ASE CORE', icon: Brain, x: 50, y: 10, type: 'source' },
    { id: 'inc1', label: 'BTC CORP', icon: Building, x: 25, y: 40, type: 'incubator' },
    { id: 'inc2', label: 'NINJA PUNK GIRLS', icon: Building, x: 75, y: 40, type: 'incubator' },
    { id: 'biz1', label: 'BITCOIN VIDEO', icon: Zap, x: 10, y: 75, type: 'business' },
    { id: 'biz2', label: 'DEFI SUITE', icon: Zap, x: 40, y: 75, type: 'business' },
    { id: 'biz3', label: 'NPG GAME', icon: Zap, x: 60, y: 75, type: 'business' },
    { id: 'biz4', label: 'AI GF PLATFORM', icon: Zap, x: 90, y: 75, type: 'business' },
];

const connections = [
    { from: 'biz1', to: 'inc1' },
    { from: 'biz2', to: 'inc1' },
    { from: 'biz3', to: 'inc2' },
    { from: 'biz4', to: 'inc2' },
    { from: 'inc1', to: 'source' },
    { from: 'inc2', to: 'source' },
];

export default function DividendIrrigation() {
    return (
        <div className="relative w-full aspect-[16/10] bg-black/40 border border-gray-800 rounded-lg overflow-hidden p-8">
            <div className="absolute top-4 left-4 flex items-center gap-2">
                <Droplets className="text-blue-500 animate-pulse" size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Live Irrigation Logic</span>
            </div>

            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(59, 130, 246, 0.5)" />
                        <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
                    </linearGradient>
                </defs>
                {connections.map((conn, i) => {
                    const fromNode = nodes.find(n => n.id === conn.from)!;
                    const toNode = nodes.find(n => n.id === conn.to)!;
                    return (
                        <motion.line
                            key={i}
                            x1={`${fromNode.x}%`}
                            y1={`${fromNode.y}%`}
                            x2={`${toNode.x}%`}
                            y2={`${toNode.y}%`}
                            stroke="url(#lineGrad)"
                            strokeWidth="2"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, delay: i * 0.2, repeat: Infinity, repeatType: 'reverse', repeatDelay: 1 }}
                        />
                    );
                })}
            </svg>

            {nodes.map((node) => (
                <motion.div
                    key={node.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <div className={`p-4 rounded-full border-2 bg-black/80 backdrop-blur-md relative z-10 
            ${node.type === 'source' ? 'border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]' :
                            node.type === 'incubator' ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' :
                                'border-gray-800'}`}
                    >
                        <node.icon className={`w-6 h-6 ${node.type === 'source' ? 'text-white' : node.type === 'incubator' ? 'text-blue-400' : 'text-gray-500'}`} />

                        {/* Pulsing rings for flow direction */}
                        {node.type === 'source' && (
                            <motion.div
                                className="absolute inset-0 rounded-full border border-white/50"
                                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        )}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white whitespace-nowrap bg-black/60 px-2 py-1 border border-gray-800 rounded">
                        {node.label}
                    </span>
                    {node.type === 'source' && (
                        <div className="flex items-center gap-2 mt-2">
                            <Users size={12} className="text-white" />
                            <span className="text-[10px] font-bold text-white tracking-widest">$BOASE SHAREHOLDERS</span>
                        </div>
                    )}
                </motion.div>
            ))}

            <div className="absolute bottom-4 right-4 text-right">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest max-w-[200px] leading-loose">
                    Irrigation model: Each layer filters dividends up to the $BOASE Core holders.
                </p>
            </div>
        </div>
    );
}
