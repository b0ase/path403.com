'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    FiBook,
    FiZap,
    FiArrowRight,
    FiLock
} from 'react-icons/fi';

export default function PublicAutoBookPage() {
    const [bookTitle, setBookTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [showConcept, setShowConcept] = useState(false);

    const handleGenerate = () => {
        if (bookTitle && subject) {
            setShowConcept(true);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-mono p-8 selection:bg-white selection:text-black">
            <header className="mb-12">
                <Link href="/tools" className="text-xs text-gray-500 hover:text-white mb-4 inline-block">
                    ← BACK TO TOOLS
                </Link>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">
                            AUTO-BOOK<span className="text-zinc-800">.PLAN</span>
                        </h1>
                        <p className="text-zinc-500 uppercase text-xs tracking-widest">AI-Powered Bibliographic Unit</p>
                    </div>
                </div>
            </header>

            <main className="max-w-pillar">
                {/* Demo Notice */}
                <div className="mb-8 p-4 border border-cyan-900/30 bg-cyan-950/10 rounded-pillar">
                    <div className="flex items-start gap-3">
                        <FiLock className="text-cyan-400 mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="text-xs font-bold text-cyan-400 mb-1">PUBLIC DEMO VERSION</h3>
                            <p className="text-[11px] text-gray-300">
                                This is a concept generator. For full access to AI research agents, automated writing,
                                cover generation, and KDP publishing tools, <Link href="/login" className="text-cyan-400 hover:underline">sign in</Link> or <Link href="/clients" className="text-cyan-400 hover:underline">become a client</Link>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Input Form */}
                <div className="border border-zinc-900 p-8 mb-8 rounded-pillar bg-zinc-950/50">
                    <h2 className="text-[10px] font-bold mb-6 text-zinc-600 uppercase tracking-widest border-b border-zinc-900 pb-2">INPUT_SPECIFICATIONS</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider">Book Title</label>
                            <input
                                type="text"
                                value={bookTitle}
                                onChange={(e) => setBookTitle(e.target.value)}
                                placeholder="e.g., The AI Engineering Handbook"
                                className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm focus:border-white focus:outline-none transition-colors rounded-pillar placeholder:text-zinc-800"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider">Subject / Topic</label>
                            <textarea
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g., Practical guide to building AI systems with modern tools and frameworks"
                                rows={4}
                                className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={!bookTitle || !subject}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-black font-bold hover:bg-zinc-200 transition-all text-xs tracking-widest uppercase disabled:bg-zinc-800 disabled:text-zinc-600 rounded-pillar"
                        >
                            <FiZap /> INITIALIZE_COMPILATION
                        </button>
                    </div>
                </div>

                {/* Generated Concept */}
                {showConcept && (
                    <div className="border border-zinc-900 p-8 bg-zinc-950/20 rounded-pillar">
                        <div className="flex items-center gap-2 mb-6">
                            <FiBook className="text-cyan-400" />
                            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Generated Concept</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold mb-2">{bookTitle}</h3>
                                <p className="text-xs text-gray-500 mb-4">{subject}</p>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">Suggested Chapter Outline</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex gap-3 text-gray-400">
                                        <span className="text-gray-600">01.</span>
                                        <span>Introduction to {bookTitle.split(' ')[0]}</span>
                                    </div>
                                    <div className="flex gap-3 text-gray-400">
                                        <span className="text-gray-600">02.</span>
                                        <span>Core Concepts and Fundamentals</span>
                                    </div>
                                    <div className="flex gap-3 text-gray-400">
                                        <span className="text-gray-600">03.</span>
                                        <span>Practical Applications</span>
                                    </div>
                                    <div className="flex gap-3 text-gray-400">
                                        <span className="text-gray-600">04.</span>
                                        <span>Advanced Techniques</span>
                                    </div>
                                    <div className="flex gap-3 text-gray-400">
                                        <span className="text-gray-600">05.</span>
                                        <span>Case Studies and Examples</span>
                                    </div>
                                    <div className="flex gap-3 text-gray-400">
                                        <span className="text-gray-600">06.</span>
                                        <span>Future Trends and Conclusion</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-zinc-900">
                                <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">Target Audience</h4>
                                <p className="text-sm text-gray-500">
                                    Professionals and enthusiasts interested in {subject.toLowerCase()}
                                </p>
                            </div>

                            <div className="pt-6 border-t border-zinc-900">
                                <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">Estimated Length</h4>
                                <p className="text-sm text-gray-500">
                                    150-200 pages • 40,000-50,000 words
                                </p>
                            </div>
                        </div>

                        {/* Upgrade CTA */}
                        <div className="mt-8 p-6 border border-cyan-900/30 bg-cyan-950/10 rounded-pillar">
                            <h3 className="text-xs font-bold mb-2 text-cyan-400">UNLOCK FULL AUTO-BOOK SYSTEM</h3>
                            <p className="text-[11px] text-gray-300 mb-4">
                                Get AI-powered research, automated chapter writing, cover generation, and direct KDP publishing integration.
                            </p>
                            <div className="flex gap-3">
                                <Link
                                    href="/clients"
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-500/30 transition-all rounded-pillar"
                                >
                                    BECOME A CLIENT <FiArrowRight />
                                </Link>
                                <Link
                                    href="/login"
                                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-zinc-800 text-white text-xs font-bold hover:border-zinc-700 transition-all rounded-pillar"
                                >
                                    SIGN IN
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Features Preview */}
                <div className="mt-12 grid md:grid-cols-3 gap-6">
                    <div className="border border-zinc-900 p-6 rounded-pillar">
                        <h3 className="text-xs font-bold mb-2 text-white">AI RESEARCH AGENTS</h3>
                        <p className="text-[11px] text-gray-500">
                            Automated research gathering from multiple sources with citation tracking.
                        </p>
                        <div className="mt-3 text-[10px] text-gray-600 uppercase">Full Version Only</div>
                    </div>
                    <div className="border border-zinc-900 p-6 rounded-pillar">
                        <h3 className="text-xs font-bold mb-2 text-white">AUTOMATED WRITING</h3>
                        <p className="text-[11px] text-gray-500">
                            AI-powered chapter generation with your voice and style preferences.
                        </p>
                        <div className="mt-3 text-[10px] text-gray-600 uppercase">Full Version Only</div>
                    </div>
                    <div className="border border-zinc-900 p-6 rounded-pillar">
                        <h3 className="text-xs font-bold mb-2 text-white">KDP PUBLISHING</h3>
                        <p className="text-[11px] text-gray-500">
                            Direct integration with Amazon KDP for seamless book publishing.
                        </p>
                        <div className="mt-3 text-[10px] text-gray-600 uppercase">Full Version Only</div>
                    </div>
                </div>
            </main>
        </div>
    );
}
