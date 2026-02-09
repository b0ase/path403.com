'use client';

import React from 'react';
import SmartTokenButton from '@/components/SmartTokenButton';
import { FiBookOpen, FiUser, FiClock } from 'react-icons/fi';

/**
 * Page designed for 1200x630 OG image capture.
 * Uses direct UI elements from the landing page.
 */
export default function OGPreviewPage() {
    return (
        <div className="w-[1200px] h-[630px] bg-black text-white p-0 m-0 overflow-hidden flex items-center justify-center font-mono relative">
            {/* Background Decorative Grid */}
            <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-5xl grid grid-cols-2 gap-12 items-center">

                {/* Left Side: $BOASE Button and Identity */}
                <div className="flex flex-col items-center gap-8">
                    <div className="scale-[2.5]">
                        <SmartTokenButton
                            isDark={true}
                            standalone={true}
                            staticMode={true}
                            size="lg"
                        />
                    </div>
                    <div className="mt-16 text-center">
                        <h1 className="text-7xl font-black tracking-tighter mb-2"
                            style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            $BOASE
                        </h1>
                        <p className="text-xl text-zinc-500 uppercase tracking-widest">
                            Digital Atelier & Venture Studio
                        </p>
                    </div>
                </div>

                {/* Right Side: Technical Specs & Directory */}
                <div className="flex flex-col gap-6">
                    <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-xl">
                        <div className="text-xs text-zinc-600 mb-4 uppercase tracking-tighter">System Status: Active</div>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4 border-b border-zinc-800/50 pb-4">
                                <div className="bg-zinc-800 p-3 rounded-lg"><FiBookOpen className="text-2xl" /></div>
                                <div>
                                    <div className="text-sm font-bold text-white">AGENTIC MODELS</div>
                                    <div className="text-xs text-zinc-500">Autonomous workflow integration</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 border-b border-zinc-800/50 pb-4">
                                <div className="bg-zinc-800 p-3 rounded-lg"><FiClock className="text-2xl" /></div>
                                <div>
                                    <div className="text-sm font-bold text-white">RELIABILITY SCALE</div>
                                    <div className="text-xs text-zinc-500">Production-ready deployments</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-zinc-800 p-3 rounded-lg"><FiUser className="text-2xl" /></div>
                                <div>
                                    <div className="text-sm font-bold text-white">KINTSUGI ENGINE</div>
                                    <div className="text-xs text-zinc-500">Low-cost startup infrastructure</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl text-center">
                            <div className="text-[10px] text-zinc-600 uppercase mb-1">Architecture</div>
                            <div className="text-sm font-bold">BRUTALIST</div>
                        </div>
                        <div className="flex-1 p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl text-center">
                            <div className="text-[10px] text-zinc-600 uppercase mb-1">Philosophy</div>
                            <div className="text-sm font-bold">AGENTIC</div>
                        </div>
                        <div className="flex-1 p-4 bg-zinc-00/30 border border-zinc-800 rounded-xl text-center">
                            <div className="text-[10px] text-zinc-600 uppercase mb-1">Standard</div>
                            <div className="text-sm font-bold">3RD AUDIENCE</div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Decorative Corners */}
            <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-zinc-800" />
            <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-zinc-800" />
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-zinc-800" />
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-zinc-800" />
        </div>
    );
}
