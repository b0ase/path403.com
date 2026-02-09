'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/Providers';
import {
    FiPlus,
    FiBook,
    FiCalendar,
    FiCheckCircle,
    FiClock,
    FiAlertCircle,
    FiArrowRight,
    FiArrowLeft,
    FiBell,
    FiEdit3,
    FiSearch,
    FiImage,
    FiLayers
} from 'react-icons/fi';
import { sendNotification, requestNotificationPermission } from '@/lib/notifications';

interface Book {
    id: string;
    title: string;
    subject: string;
    status: 'DRAFT' | 'RESEARCHING' | 'WRITING' | 'EDITING' | 'PUBLISHED';
    releaseDate: string | null;
    createdAt: string;
}

export default function AutoBookDashboard() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [books, setBooks] = useState<Book[]>([]);
    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
        // Check notification status
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setIsNotificationsEnabled(Notification.permission === 'granted');
        }

        // Fetch real books from API
        const fetchBooks = async () => {
            try {
                const response = await fetch('/api/auto-book');
                if (response.ok) {
                    const data = await response.json();
                    setBooks(data);
                }
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        };

        if (user) {
            fetchBooks();
        }
    }, [user, loading, router]);

    const handleEnableNotifications = async () => {
        const granted = await requestNotificationPermission();
        setIsNotificationsEnabled(granted);
        if (granted) {
            sendNotification("B0ASE AUTO-BOOK", {
                body: "Weekly publishing alerts active. We'll tell you when to write and when to publish.",
                icon: "/favicon.ico"
            });
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return <FiCheckCircle className="text-green-500" />;
            case 'WRITING': return <FiEdit3 className="text-blue-500" />;
            case 'RESEARCHING': return <FiSearch className="text-cyan-500" />;
            case 'EDITING': return <FiClock className="text-yellow-500" />;
            default: return <FiAlertCircle className="text-gray-500" />;
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-black text-white font-mono relative">
            <div className="px-4 md:px-8 py-16">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm mb-6"
                >
                    <FiArrowLeft /> Back to Dashboard
                </Link>

                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">AUTO-BOOK SYSTEM</h1>
                        <p className="text-xs text-gray-500 tracking-widest uppercase">High-Frequency Publishing Engine</p>
                    </div>
                    <div className="flex gap-4">
                        {!isNotificationsEnabled && (
                            <button
                                onClick={handleEnableNotifications}
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all text-xs"
                            >
                                <FiBell /> ENABLE ALERTS
                            </button>
                        )}
                        <button
                            onClick={() => router.push('/dashboard/auto-book/monitor')}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all text-xs"
                        >
                            <FiClock /> MONITOR
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/auto-book/review')}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all text-xs"
                        >
                            <FiCheckCircle /> REVIEW QUEUE
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/auto-book/ideas')}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all text-xs"
                        >
                            <FiLayers /> CONTENT IDEAS
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/auto-book/new')}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold hover:bg-gray-200 transition-all text-xs"
                        >
                            <FiPlus /> NEW PROJECT
                        </button>
                    </div>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Release Schedule / Queue */}
                    <div className="lg:col-span-2">
                        <h2 className="text-sm text-gray-500 mb-6 uppercase tracking-tighter flex items-center gap-2">
                            <FiCalendar /> PRODUCTION QUEUE
                        </h2>

                        <div className="space-y-4">
                            {books.length === 0 ? (
                                <div className="border border-zinc-900 p-12 text-center text-gray-600">
                                    NO ACTIVE PROJECTS IN PIPELINE
                                </div>
                            ) : (
                                books.map((book) => (
                                    <div
                                        key={book.id}
                                        onClick={() => router.push(`/dashboard/auto-book/${book.id}`)}
                                        className="group cursor-pointer border border-zinc-900 p-6 hover:border-zinc-700 transition-all bg-zinc-950/20"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold group-hover:text-cyan-400 transition-colors">{book.title.toUpperCase()}</h3>
                                                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">{book.subject}</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-bold px-2 py-1 bg-zinc-900">
                                                {getStatusIcon(book.status)}
                                                {book.status}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-end bg-black/40 p-3">
                                            <div className="flex gap-6">
                                                <div>
                                                    <p className="text-[9px] text-gray-600 mb-1">RELEASE DATE</p>
                                                    <p className="text-xs font-bold">{book.releaseDate || 'TBD'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-gray-600 mb-1">PROGESS</p>
                                                    <div className="w-24 h-1 bg-zinc-800 mt-2">
                                                        <div
                                                            className="h-full bg-cyan-500"
                                                            style={{ width: book.status === 'PUBLISHED' ? '100%' : book.status === 'WRITING' ? '60%' : '30%' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <FiArrowRight className="text-gray-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* System Stats & Guides */}
                    <div className="space-y-8">
                        <div className="border border-zinc-900 p-6">
                            <h2 className="text-xs font-bold mb-6 text-gray-400 uppercase tracking-widest">EDITORIAL BOT OPS</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between border-b border-zinc-900 pb-2">
                                    <span className="text-xs text-gray-500 italic">Research Agents</span>
                                    <span className="text-xs text-green-500 font-bold">ONLINE</span>
                                </div>
                                <div className="flex justify-between border-b border-zinc-900 pb-2">
                                    <span className="text-xs text-gray-500 italic">Prose Synthesizer</span>
                                    <span className="text-xs text-green-500 font-bold">ONLINE</span>
                                </div>
                                <div className="flex justify-between border-b border-zinc-900 pb-2">
                                    <span className="text-xs text-gray-500 italic">Cover Generator</span>
                                    <span className="text-xs text-green-500 font-bold">ONLINE</span>
                                </div>
                                <div className="flex justify-between border-b border-zinc-900 pb-2">
                                    <span className="text-xs text-gray-500 italic">KDP Sync Mode</span>
                                    <span className="text-xs text-yellow-500 font-bold">MANUAL</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-950 p-6 border border-zinc-800">
                            <h2 className="text-xs font-bold mb-4 text-white">KDP PUBLISHING GUIDE</h2>
                            <div className="space-y-3 text-[11px] text-gray-400">
                                <p>1. <span className="text-white font-bold">EXPORT:</span> Download your EPUB and Cover from the project view.</p>
                                <p>2. <span className="text-white font-bold">KDP LOGO:</span> Log in to kdp.amazon.com.</p>
                                <p>3. <span className="text-white font-bold">CREATION:</span> Click 'Create' {`->`} 'Kindle eBook'.</p>
                                <p>4. <span className="text-white font-bold">DATA:</span> Copy the meta-description from our generator.</p>
                                <p>5. <span className="text-white font-bold">AI BOX:</span> Check the box confirming 'AI-generated content'.</p>
                            </div>
                        </div>

                        <div className="p-6 border border-cyan-900/30 bg-cyan-950/10">
                            <h2 className="text-xs font-bold mb-2 text-cyan-400">NEXT TASK</h2>
                            <p className="text-[11px] text-gray-300 mb-4 italic">Confirm the research findings for "The AI Engineering Handbook" to trigger the chapter writing phase.</p>
                            <button className="w-full py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold hover:bg-cyan-500/30 transition-all">
                                BEGIN REVIEW
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
