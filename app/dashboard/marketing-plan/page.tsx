import React from 'react';
import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiArrowLeft, FiFileText } from 'react-icons/fi';
import Link from 'next/link';

export default async function MarketingPlanPage() {
    const filePath = path.join(process.cwd(), 'MARKETING_PLAN.md');
    let content = '';

    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error('Error reading MARKETING_PLAN.md:', error);
        content = '# Error\nCould not load marketing plan.';
    }

    return (
        <div className="min-h-screen bg-black text-white font-mono relative">
            <div className="px-4 md:px-8 py-16">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm mb-6"
                >
                    <FiArrowLeft /> Back to Dashboard
                </Link>

                <header className="mb-12">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-zinc-900">
                            <FiFileText size={24} className="text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold uppercase tracking-tight">MARKETING STRATEGY</h1>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Version 1.0 - Alpha Release</p>
                        </div>
                    </div>
                </header>

                <main className="w-full">
                    <div className="prose prose-invert prose-zinc max-w-none
          prose-headings:font-mono prose-headings:uppercase prose-headings:tracking-tighter
          prose-h1:text-3xl prose-h2:text-xl prose-h2:border-b prose-h2:border-zinc-800 prose-h2:pb-2 prose-h2:mt-12
          prose-p:text-sm prose-p:leading-relaxed prose-p:text-zinc-400
          prose-li:text-sm prose-li:text-zinc-400
          prose-strong:text-white prose-strong:font-bold
          prose-table:border prose-table:border-zinc-900
          prose-th:bg-zinc-900 prose-th:px-4 prose-th:py-2 prose-th:text-[10px] prose-th:uppercase prose-th:text-gray-500
          prose-td:px-4 prose-td:py-2 prose-td:border-t prose-td:border-zinc-900 prose-td:text-xs
          prose-hr:border-zinc-900">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                    </div>
                </main>

                <footer className="mt-20 pt-8 border-t border-zinc-900 text-center">
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                        © 2026 B0ASE SYSTEM OPERATIONS - CONFIDENTIAL
                    </p>
                </footer>
            </div>
        </div>
    );
}
