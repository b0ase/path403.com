'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    FiArrowLeft,
    FiSearch,
    FiEdit3,
    FiImage,
    FiSend,
    FiDownload,
    FiCheckCircle,
    FiTerminal,
    FiLoader,
    FiBriefcase
} from 'react-icons/fi';

export default function BookProjectDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'RESEARCH' | 'WRITING' | 'COVER' | 'PUBLISH'>('RESEARCH');
    const [book, setBook] = useState<any>(null);
    const [loadingBook, setLoadingBook] = useState(true);
    const [researching, setResearching] = useState(false);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const response = await fetch(`/api/auto-book/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setBook(data);
                } else {
                    setBook(null); // Explicitly set to null if not found
                }
            } catch (error) {
                console.error('Error fetching book:', error);
                setBook(null); // Set to null on error
            } finally {
                setLoadingBook(false);
            }
        };

        if (id) {
            fetchBook();
        }
    }, [id]);

    if (loadingBook) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center font-mono">
                <div className="text-white text-sm animate-pulse tracking-[.5em]">INITIALIZING ASSET...</div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono space-y-4">
                <div className="text-red-500 text-sm">ERROR: ASSET NOT FOUND</div>
                <button onClick={() => router.push('/dashboard/auto-book')} className="text-xs text-gray-500 hover:text-white transition-all underline">RETURN TO FLEET</button>
            </div>
        );
    }

    const tabs = [
        { id: 'RESEARCH', icon: FiSearch, label: 'Research' },
        { id: 'WRITING', icon: FiEdit3, label: 'Writing' },
        { id: 'COVER', icon: FiImage, label: 'Cover Art' },
        { id: 'PUBLISH', icon: FiSend, label: 'Publishing' },
    ];

    const handleStartResearch = () => {
        setResearching(true);
        setTimeout(() => setResearching(false), 3000);
    };

    return (
        <div className="min-h-screen bg-black text-white font-mono flex flex-col">
            {/* Header */}
            <header className="border-b border-zinc-900 p-6 flex justify-between items-center bg-zinc-950/50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard/auto-book')}
                        className="p-2 hover:bg-zinc-900 rounded-full transition-all text-gray-500 hover:text-white"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold uppercase tracking-tight">{book.title}</h1>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">{book.subject}</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-cyan-950/30 border border-cyan-800/30 text-[10px] text-cyan-400 font-bold rounded">
                        <FiLoader className="animate-spin" /> {book.status}
                    </div>
                    <button className="px-4 py-2 bg-white text-black text-xs font-bold hover:bg-gray-200 transition-all">
                        SAVE DRAFT
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex border-b border-zinc-900 bg-black sticky top-0 z-10">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-8 py-4 text-xs font-bold transition-all border-b-2 ${activeTab === tab.id
                            ? 'border-cyan-500 text-white bg-zinc-900/40'
                            : 'border-transparent text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <tab.icon size={14} /> {tab.label.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <main className="flex-1 p-8 overflow-y-auto">
                {activeTab === 'RESEARCH' && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-lg font-bold mb-2">STORM RESEARCH AGENT</h2>
                                <p className="text-[11px] text-gray-500 max-w-lg">
                                    Aggregating data from key concepts, structuring comprehensive outlines, and identifying target audience metrics using Gemini 1.5 Pro.
                                </p>
                            </div>
                            <button
                                onClick={async () => {
                                    setResearching(true);
                                    try {
                                        const res = await fetch('/api/auto-book/agent/research', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ bookId: id })
                                        });
                                        if (res.ok) {
                                            const data = await res.json();
                                            // Refresh book data to show results
                                            const bookRes = await fetch(`/api/auto-book/${id}`);
                                            if (bookRes.ok) {
                                                const bookData = await bookRes.json();
                                                setBook(bookData);
                                            }
                                        } else {
                                            console.error('Research failed');
                                            alert('Research agent failed to initialize. Check console.');
                                        }
                                    } catch (e) {
                                        console.error(e);
                                    } finally {
                                        setResearching(false);
                                    }
                                }}
                                disabled={researching || book.status === 'RESEARCH_COMPLETE'}
                                className={`px-6 py-2 transition-all text-xs font-bold uppercase rounded ${researching || book.status === 'RESEARCH_COMPLETE'
                                    ? 'bg-zinc-800 text-gray-500 cursor-not-allowed'
                                    : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                                    }`}
                            >
                                {researching ? (
                                    <span className="flex items-center gap-2"><FiLoader className="animate-spin" /> RUNNING AGENT...</span>
                                ) : book.status === 'RESEARCH_COMPLETE' ? (
                                    <span className="flex items-center gap-2"><FiCheckCircle /> RESEARCH COMPLETE</span>
                                ) : (
                                    'START RESEARCH AGENT'
                                )}
                            </button>
                        </div>

                        {book.researchData ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                                <div className="border border-zinc-900 p-6 bg-zinc-950/20">
                                    <h3 className="text-xs font-bold text-gray-400 mb-4 border-b border-zinc-900 pb-2 flex items-center gap-2">
                                        <FiTerminal size={12} /> ARCHITECTURE & STRATEGY
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Target Audience</span>
                                            <p className="text-sm font-semibold text-cyan-400">{(book.researchData as any).targetAudience}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Tone & Voice</span>
                                            <p className="text-sm text-gray-300">{(book.researchData as any).tone}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Core Concepts</span>
                                            <div className="flex flex-wrap gap-2">
                                                {(book.researchData as any).keyConcepts?.map((concept: string, i: number) => (
                                                    <span key={i} className="text-[10px] px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-gray-400">
                                                        {concept}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border border-zinc-900 p-6">
                                    <h3 className="text-xs font-bold text-gray-400 mb-4 border-b border-zinc-900 pb-2">CHAPTER OUTLINE</h3>
                                    <ul className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {(book.researchData as any).outline?.map((chapter: any, i: number) => (
                                            <li key={i} className="flex gap-3 p-2 hover:bg-zinc-900/50 rounded transition-colors">
                                                <div className="text-cyan-600 font-mono text-xs mt-0.5">0{i + 1}</div>
                                                <div>
                                                    <p className="text-xs font-bold">{chapter.chapterTitle}</p>
                                                    <p className="text-[10px] text-gray-500 mt-1">{chapter.chapterDescription}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="border border-dashed border-zinc-800 rounded-lg p-12 text-center text-gray-600">
                                <FiBriefcase className="mx-auto text-4xl mb-4 opacity-50" />
                                <p className="text-sm">Research data not initialized.</p>
                                <p className="text-xs mt-2">Run the agent to generate market analysis and outlines.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'WRITING' && (
                    <div className="max-w-6xl mx-auto h-[700px] flex gap-6">
                        {/* Chapter List */}
                        <div className="w-72 border-r border-zinc-900 pr-6 overflow-y-auto custom-scrollbar">
                            <h3 className="text-xs font-bold text-gray-500 mb-6 uppercase tracking-widest sticky top-0 bg-black py-2">Chapter Index</h3>
                            <div className="space-y-2">
                                {book.chapters && book.chapters.length > 0 ? (
                                    book.chapters.sort((a: any, b: any) => a.orderIndex - b.orderIndex).map((ch: any, i: number) => (
                                        <div key={ch.id} className="group relative">
                                            <button
                                                onClick={() => {
                                                    // Add selected chapter state logic via url param or local state if we had it
                                                    // For now, we'll implement a local selectedChapter state in a moment
                                                    // BUT since I can't easily add state in this tool call, I will assume a default or add state in next call.
                                                    // Actually, let's just make this button trigger a state update. 
                                                    // I'll need to add `selectedChapter` state to the component.
                                                    // For this replacement, I'll refer to a `selectedChapter` variable I will add.
                                                    window.dispatchEvent(new CustomEvent('selectChapter', { detail: ch }));
                                                }}
                                                className={`w-full text-left px-4 py-3 text-[11px] font-bold border transition-all rounded 
                                                    ${ch.status === 'COMPLETED' ? 'border-green-900/30 text-green-500 bg-green-950/10' : 'border-zinc-800 text-gray-400 hover:border-zinc-600 hover:text-gray-200'}
                                                `}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span>CH {String(i + 1).padStart(2, '0')}</span>
                                                    {ch.status === 'COMPLETED' && <FiCheckCircle size={10} />}
                                                </div>
                                                <div className="truncate opacity-80">{ch.title}</div>
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-xs text-gray-600 italic p-4 text-center">
                                        No chapters found. Run research agent first.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* writing area */}
                        <div className="flex-1 flex flex-col bg-zinc-950/30 border border-zinc-900 rounded-lg overflow-hidden relative">
                            <ChapterEditor bookId={id as string} />
                        </div>
                    </div>
                )}

                {activeTab === 'COVER' && (
                    <div className="max-w-4xl mx-auto text-center space-y-12">
                        <div className="border-4 border-zinc-900 inline-block p-4 shadow-2xl shadow-cyan-900/20">
                            <div className="w-[300px] h-[450px] bg-zinc-900 relative flex flex-col justify-between p-8 overflow-hidden">
                                <div className="absolute inset-0 opacity-40">
                                    <div className="h-full w-full bg-gradient-to-br from-cyan-900 via-black to-purple-900"></div>
                                </div>
                                <div className="relative z-10 text-left">
                                    <p className="text-[10px] font-black tracking-[.3em] mb-4 text-cyan-400">RICHARD BOASE</p>
                                    <h1 className="text-4xl font-extrabold leading-tight tracking-tighter">THE AI <br />ENGINEERING <br />HANDBOOK</h1>
                                </div>
                                <div className="relative z-10 text-right border-t border-white/20 pt-4">
                                    <p className="text-[8px] italic text-gray-400 font-serif">A b0ase system report</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <button className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 text-xs font-bold hover:border-zinc-600 transition-all">
                                <FiTerminal /> TWEAK PROMPT
                            </button>
                            <button className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500 transition-all">
                                <FiDownload /> DOWNLOAD HI-RES JPG
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'PUBLISH' && (
                    <PublishTab bookId={id as string} bookTitle={book.title} />
                )}
            </main>
        </div>
    );
}

function PublishTab({ bookId, bookTitle }: { bookId: string; bookTitle: string }) {
    const [exporting, setExporting] = useState<string | null>(null);
    const [checklist, setChecklist] = useState<boolean[]>([false, false, false, false, false]);

    const handleExport = async (format: 'markdown' | 'html' | 'pdf') => {
        setExporting(format);
        try {
            if (format === 'pdf') {
                // For PDF, we'll use the HTML export and trigger browser print
                const response = await fetch(`/api/auto-book/${bookId}/export?format=html`);
                if (response.ok) {
                    const html = await response.text();
                    // Open in new window for printing
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                        printWindow.document.write(html);
                        printWindow.document.close();
                        printWindow.onload = () => {
                            printWindow.print();
                        };
                    }
                }
            } else {
                // Direct download for markdown/html
                const response = await fetch(`/api/auto-book/${bookId}/export?format=${format}`);
                if (response.ok) {
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${bookTitle.toLowerCase().replace(/\s+/g, '-')}.${format === 'markdown' ? 'md' : 'html'}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        }
        setExporting(null);
    };

    const toggleChecklist = (index: number) => {
        const newChecklist = [...checklist];
        newChecklist[index] = !newChecklist[index];
        setChecklist(newChecklist);
    };

    const steps = [
        "Export complete book (Markdown, HTML, or PDF)",
        "Review AI Checklist (Amazon requires disclosure)",
        "Upload cover image (hi-res JPEG 2560px height)",
        "Set Price ($4.99 - $9.99 recommended)",
        "Submit for Review (typically 24-48 hours)"
    ];

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-yellow-950/10 border border-yellow-900/40 p-6 rounded-lg">
                <h3 className="text-sm font-bold text-yellow-500 mb-2 flex items-center gap-2">
                    <FiBriefcase /> AMAZON KDP STEPS
                </h3>
                <p className="text-xs text-yellow-600 mb-4">
                    Amazon does not allow direct API publishing. Follow our 1-a-week checklist below to ensure your metadata is optimized for discovery.
                </p>
            </div>

            {/* Export Options */}
            <div className="border border-zinc-900 p-6 bg-zinc-950/40">
                <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">EXPORT OPTIONS</h3>
                <div className="grid grid-cols-3 gap-4">
                    <button
                        onClick={() => handleExport('markdown')}
                        disabled={exporting !== null}
                        className="p-4 border border-zinc-800 hover:border-cyan-500 transition-all text-center disabled:opacity-50"
                    >
                        <FiDownload className="mx-auto mb-2" size={24} />
                        <span className="text-xs font-bold block">MARKDOWN</span>
                        <span className="text-[10px] text-gray-500">.md file</span>
                    </button>
                    <button
                        onClick={() => handleExport('html')}
                        disabled={exporting !== null}
                        className="p-4 border border-zinc-800 hover:border-cyan-500 transition-all text-center disabled:opacity-50"
                    >
                        <FiDownload className="mx-auto mb-2" size={24} />
                        <span className="text-xs font-bold block">HTML</span>
                        <span className="text-[10px] text-gray-500">.html file</span>
                    </button>
                    <button
                        onClick={() => handleExport('pdf')}
                        disabled={exporting !== null}
                        className="p-4 border border-zinc-800 hover:border-cyan-500 transition-all text-center disabled:opacity-50"
                    >
                        <FiDownload className="mx-auto mb-2" size={24} />
                        <span className="text-xs font-bold block">PDF</span>
                        <span className="text-[10px] text-gray-500">Print to PDF</span>
                    </button>
                </div>
                {exporting && (
                    <p className="text-xs text-cyan-400 mt-4 text-center animate-pulse">
                        <FiLoader className="inline animate-spin mr-2" />
                        Exporting {exporting.toUpperCase()}...
                    </p>
                )}
            </div>

            {/* Checklist */}
            <div className="space-y-4">
                {steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border border-zinc-900 bg-zinc-950/40">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${checklist[i] ? 'bg-green-600 text-white' : 'bg-zinc-900'}`}>
                            {checklist[i] ? <FiCheckCircle /> : `0${i + 1}`}
                        </div>
                        <span className={`text-xs font-bold flex-1 ${checklist[i] ? 'text-gray-500 line-through' : ''}`}>
                            {step.toUpperCase()}
                        </span>
                        <button
                            onClick={() => toggleChecklist(i)}
                            className="text-[10px] text-cyan-500 hover:underline"
                        >
                            {checklist[i] ? 'UNDO' : 'MARK DONE'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Progress */}
            <div className="border border-zinc-900 p-4 bg-zinc-950/40">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">PUBLISHING PROGRESS</span>
                    <span className="text-xs font-bold text-cyan-400">
                        {checklist.filter(Boolean).length}/{checklist.length} COMPLETE
                    </span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-green-500 transition-all"
                        style={{ width: `${(checklist.filter(Boolean).length / checklist.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

function ChapterEditor({ bookId }: { bookId: string }) {
    const [selectedChapter, setSelectedChapter] = useState<any>(null);
    const [generating, setGenerating] = useState(false);
    const [content, setContent] = useState('');

    useEffect(() => {
        const handleSelect = (e: CustomEvent) => {
            setSelectedChapter(e.detail);
            setContent(e.detail.content || '');
        };
        window.addEventListener('selectChapter', handleSelect as any);
        return () => window.removeEventListener('selectChapter', handleSelect as any);
    }, []);

    const handleGenerate = async () => {
        if (!selectedChapter) return;
        setGenerating(true);
        try {
            const res = await fetch('/api/auto-book/agent/write', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookId, chapterId: selectedChapter.id })
            });
            if (res.ok) {
                const data = await res.json();
                setContent(data.data.content);
                // Update local chapter status visually
                setSelectedChapter({ ...selectedChapter, status: 'COMPLETED', content: data.data.content });
                // Force a reload of the book data to update the sidebar list
                // (Optimally we'd use a context or SWR, but page reload is fine for MVP)
                window.location.reload();
            } else {
                alert('Generation failed');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setGenerating(false);
        }
    };

    if (!selectedChapter) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-600">
                <FiEdit3 className="text-4xl mb-4 opacity-30" />
                <p className="text-sm">Select a chapter to begin writing.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-zinc-900 bg-zinc-950 flex justify-between items-center">
                <div>
                    <h2 className="text-sm font-bold uppercase">{selectedChapter.title}</h2>
                    <p className="text-[10px] text-gray-500 truncate max-w-md">{selectedChapter.chapterDescription}</p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-zinc-800 disabled:text-gray-600 text-[10px] font-bold uppercase rounded transition-all flex items-center gap-2"
                >
                    {generating ? <FiLoader className="animate-spin" /> : <FiTerminal />}
                    {generating ? 'GENERATING CONTENT...' : selectedChapter.content ? 'REGENERATE CHAPTER' : 'WRITE CHAPTER'}
                </button>
            </div>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Content will appear here..."
                className="flex-1 bg-black p-8 text-sm leading-relaxed outline-none resize-none font-serif text-gray-300 focus:bg-zinc-950/50 transition-colors"
                spellCheck={false}
            />
            <div className="p-2 border-t border-zinc-900 bg-zinc-950 text-[10px] text-gray-600 flex justify-between">
                <span>WORDS: {content.split(' ').length}</span>
                <span>MARKDOWN MODE</span>
            </div>
        </div>
    );
}
