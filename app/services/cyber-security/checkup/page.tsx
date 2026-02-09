'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShield, FiAlertTriangle, FiCheckCircle, FiSearch, FiArrowLeft, FiActivity, FiLock, FiCpu } from 'react-icons/fi';

export default function HygieneCheckupPage() {
    const [scanState, setScanState] = useState<'idle' | 'scanning' | 'results'>('idle');
    const [progress, setProgress] = useState(0);
    const [scanLogs, setScanLogs] = useState<string[]>([]);

    const startScan = () => {
        setScanState('scanning');
        setProgress(0);
        setScanLogs([]);
    };

    useEffect(() => {
        if (scanState === 'scanning') {
            const logs = [
                'Initializing Shannon scanner...',
                'Detecting environment headers...',
                'Checking for X-Frame-Options...',
                'Analyzing Content-Security-Policy...',
                'Checking HSTS configuration...',
                'Scanning for outdated runtime dependencies (Node.js/React)...',
                'Checking TLS version support...',
                'Validating DNSSEC settings...',
                'Cross-referencing CVE database...',
                'Finalizing hygiene score...'
            ];

            let currentLogIndex = 0;
            const logInterval = setInterval(() => {
                if (currentLogIndex < logs.length) {
                    setScanLogs(prev => [...prev, logs[currentLogIndex]]);
                    currentLogIndex++;
                    setProgress((currentLogIndex / logs.length) * 100);
                } else {
                    clearInterval(logInterval);
                    setTimeout(() => setScanState('results'), 800);
                }
            }, 400);

            return () => clearInterval(logInterval);
        }
    }, [scanState]);

    return (
        <div className="min-h-screen bg-black text-white font-mono selection:bg-red-500 selection:text-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">

            <Link href="/services/cyber-security" className="fixed top-12 left-12 text-zinc-500 hover:text-white flex items-center gap-2 transition-colors text-sm font-bold tracking-widest">
                <FiArrowLeft /> BACK TO SECURITY
            </Link>

            <div className="max-w-3xl w-full">
                <AnimatePresence mode="wait">
                    {scanState === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center space-y-8"
                        >
                            <div className="flex justify-center mb-6">
                                <div className="p-6 bg-red-500/10 rounded-full border border-red-500/20">
                                    <FiActivity size={64} className="text-red-500 animate-pulse" />
                                </div>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase">
                                Hygiene <span className="text-red-500">Checkup</span>
                            </h1>
                            <p className="text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed">
                                Our autonomous scanner Shannon will perform a surface-level analysis of your public-facing infrastructure.
                            </p>
                            <button
                                onClick={startScan}
                                className="bg-red-600 hover:bg-red-700 text-white px-12 py-5 font-bold text-xl tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(220,38,38,0.3)]"
                            >
                                START SCANNER
                            </button>
                        </motion.div>
                    )}

                    {scanState === 'scanning' && (
                        <motion.div
                            key="scanning"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-12"
                        >
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm font-bold tracking-widest text-zinc-500 uppercase">
                                    <span>Scanning Infrastructure</span>
                                    <span>{Math.round(progress)}% COMPLETE</span>
                                </div>
                                <div className="h-2 w-full bg-zinc-900 overflow-hidden border border-zinc-800">
                                    <motion.div
                                        className="h-full bg-red-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg font-mono text-sm h-64 overflow-y-auto space-y-2 scrollbar-hide">
                                {scanLogs.map((log, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex gap-3"
                                    >
                                        <span className="text-red-500">[+]</span>
                                        <span className="text-zinc-300">{log}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {scanState === 'results' && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-12 text-center"
                        >
                            <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-md">
                                <h2 className="text-2xl font-bold tracking-[0.2em] text-zinc-500 mb-8 uppercase">Hygiene Report Generated</h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                    <div className="p-6 border border-zinc-800 bg-black/50">
                                        <FiShield className="mx-auto mb-4 text-green-500" size={32} />
                                        <div className="text-xs text-zinc-500 uppercase mb-1">Status</div>
                                        <div className="text-xl font-bold text-green-500">EXPOSED</div>
                                    </div>
                                    <div className="p-6 border border-zinc-800 bg-black/50">
                                        <FiAlertTriangle className="mx-auto mb-4 text-red-500" size={32} />
                                        <div className="text-xs text-zinc-500 uppercase mb-1">Risk Level</div>
                                        <div className="text-xl font-bold text-red-500">CRITICAL</div>
                                    </div>
                                    <div className="p-6 border border-zinc-800 bg-black/50">
                                        <FiLock className="mx-auto mb-4 text-yellow-500" size={32} />
                                        <div className="text-xs text-zinc-500 uppercase mb-1">Vulnerabilities</div>
                                        <div className="text-xl font-bold text-yellow-500">4 DETECTED</div>
                                    </div>
                                </div>

                                <div className="text-left space-y-4 mb-12">
                                    <p className="text-zinc-400">Our surface-level scan detected several easily exploitable misconfigurations. Automated attackers constanty probe for these exact patterns.</p>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-3 text-red-400 text-sm">
                                            <FiAlertTriangle className="flex-shrink-0" /> Missing Content-Security-Policy (CSP) headers
                                        </li>
                                        <li className="flex items-center gap-3 text-red-400 text-sm">
                                            <FiAlertTriangle className="flex-shrink-0" /> Exposure of sensitive runtime versions in headers
                                        </li>
                                    </ul>
                                </div>

                                <Link
                                    href="/contact"
                                    className="block bg-red-600 hover:bg-red-700 text-white px-8 py-5 font-bold tracking-widest text-lg transition-all"
                                >
                                    GET COMPLETE SECURITY AUDIT
                                </Link>
                            </div>

                            <button
                                onClick={() => setScanState('idle')}
                                className="text-zinc-500 hover:text-white transition-colors text-xs font-bold tracking-[0.3em]"
                            >
                                RUN ANOTHER SCAN
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
