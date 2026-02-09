'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiPlus, FiTerminal, FiBook, FiCalendar } from 'react-icons/fi';

export default function NewBookPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        releaseDate: '',
        tone: 'founder-engineer'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/auto-book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                router.push('/dashboard/auto-book');
            } else {
                console.error('Failed to create book');
            }
        } catch (error) {
            console.error('Error creating book:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-mono p-8">
            <header className="mb-12">
                <button
                    onClick={() => router.push('/dashboard/auto-book')}
                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-white mb-6 transition-all"
                >
                    <FiArrowLeft /> BACK TO FLEET
                </button>
                <h1 className="text-2xl font-bold uppercase">Initialize New Asset</h1>
                <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">Registering book core in production queue</p>
            </header>

            <main className="max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Metadata Section */}
                    <section className="space-y-6">
                        <h2 className="text-[10px] font-black text-gray-600 tracking-[.4em] uppercase">01 / Metadata</h2>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Book Title</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. THE FUTURE OF DECENTRALIZED DATA"
                                className="w-full bg-zinc-950 border border-zinc-900 focus:border-cyan-500 outline-none p-4 text-sm transition-all text-white placeholder:text-zinc-800"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Subject Area / Core Thesis</label>
                            <textarea
                                required
                                rows={3}
                                placeholder="Briefly describe what this book aims to solve or explain..."
                                className="w-full bg-zinc-950 border border-zinc-900 focus:border-cyan-500 outline-none p-4 text-sm transition-all text-white placeholder:text-zinc-800 resize-none"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            />
                        </div>
                    </section>

                    {/* Schedule Section */}
                    <section className="space-y-6">
                        <h2 className="text-[10px] font-black text-gray-600 tracking-[.4em] uppercase">02 / Publication Schedule</h2>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Target Release Date</label>
                                <div className="relative">
                                    <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="date"
                                        className="w-full bg-zinc-950 border border-zinc-900 focus:border-cyan-500 outline-none p-4 pl-12 text-sm transition-all text-white [color-scheme:dark]"
                                        value={formData.releaseDate}
                                        onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Writing Tone</label>
                                <select
                                    className="w-full bg-zinc-950 border border-zinc-900 focus:border-cyan-500 outline-none p-4 text-sm transition-all text-white appearance-none"
                                    value={formData.tone}
                                    onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                                >
                                    <option value="founder-engineer">@B0ASE FOUNDER-ENGINEER</option>
                                    <option value="technical">DEEP TECHNICAL</option>
                                    <option value="philosophical">CYBER-PHILOSOPHICAL</option>
                                    <option value="minimalist">MINIMALIST CASE STUDY</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Initial Agents */}
                    <section className="space-y-6">
                        <h2 className="text-[10px] font-black text-gray-600 tracking-[.4em] uppercase">03 / Agent Activation</h2>
                        <div className="border border-zinc-900 p-6 bg-zinc-950/40 space-y-4">
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                <div className="p-2 bg-zinc-900 rounded-md">
                                    <FiTerminal size={14} />
                                </div>
                                <div>
                                    <p className="font-bold text-white">RESEARCH-BOT BOOTSTRAPPING</p>
                                    <p className="text-[10px] text-gray-600">Will automatically begin crawling ArXiv, GitHub, and Twitter upon creation.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-400 opacity-50">
                                <div className="p-2 bg-zinc-900 rounded-md">
                                    <FiBook size={14} />
                                </div>
                                <div>
                                    <p className="font-bold">PROSE SPREADSHEET GENERATION</p>
                                    <p className="text-[10px]">Awaits Research-Bot completion.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <button
                        type="submit"
                        className="w-full py-6 bg-cyan-600 text-white font-black text-sm tracking-widest hover:bg-cyan-500 transition-all uppercase flex items-center justify-center gap-3"
                    >
                        <FiPlus size={20} /> INITIALIZE ASSET PIPELINE
                    </button>
                </form>
            </main>
        </div>
    );
}
