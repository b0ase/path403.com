import React from 'react';
import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
    const docsDir = path.join(process.cwd(), 'docs');
    const files = fs.readdirSync(docsDir).filter(file => file.endsWith('.md'));

    return files.map((file) => ({
        slug: file.replace('.md', ''),
    }));
}

async function getDocContent(slug: string): Promise<string | null> {
    try {
        const filePath = path.join(process.cwd(), 'docs', `${slug}.md`);
        const content = fs.readFileSync(filePath, 'utf-8');
        return content;
    } catch {
        return null;
    }
}

function formatTitle(slug: string): string {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const content = await getDocContent(slug);

    if (!content) {
        notFound();
    }

    const title = formatTitle(slug);

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="w-full px-4 md:px-8 py-16">
                {/* Back Link */}
                <Link
                    href="/docs"
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-xs uppercase tracking-widest mb-12 transition-colors font-mono"
                >
                    <FiArrowLeft />
                    Back to Docs
                </Link>

                {/* Header */}
                <header className="mb-16 pb-8 border-b border-zinc-800">
                    <h1 className="text-5xl md:text-7xl font-bold text-white leading-none tracking-tighter uppercase break-words">
                        {title}
                    </h1>
                </header>

                {/* Content */}
                <div className="
                    prose prose-lg prose-invert
                    max-w-4xl
                    
                    prose-headings:font-bold
                    prose-headings:tracking-tighter
                    prose-headings:text-white
                    prose-headings:uppercase

                    prose-h1:text-4xl
                    prose-h1:mt-16
                    prose-h1:mb-8

                    prose-h2:text-3xl
                    prose-h2:mt-16
                    prose-h2:mb-6
                    prose-h2:pb-3
                    prose-h2:border-b
                    prose-h2:border-zinc-800

                    prose-h3:text-xl
                    prose-h3:mt-12
                    prose-h3:mb-4
                    prose-h3:text-zinc-400
                    prose-h3:tracking-wide

                    prose-h4:text-lg
                    prose-h4:mt-8
                    prose-h4:mb-3
                    prose-h4:text-zinc-500

                    prose-p:text-zinc-400
                    prose-p:text-base
                    prose-p:leading-loose
                    prose-p:mb-8

                    prose-a:text-blue-400
                    prose-a:no-underline
                    hover:prose-a:underline
                    prose-a:font-mono

                    prose-strong:text-white
                    prose-strong:font-bold

                    prose-blockquote:border-l-2
                    prose-blockquote:border-white
                    prose-blockquote:bg-zinc-900/30
                    prose-blockquote:px-6
                    prose-blockquote:py-4
                    prose-blockquote:not-italic
                    prose-blockquote:text-zinc-300
                    prose-blockquote:my-8

                    prose-code:text-white
                    prose-code:bg-zinc-900
                    prose-code:px-1.5
                    prose-code:py-0.5
                    prose-code:before:content-none
                    prose-code:after:content-none
                    prose-code:text-sm
                    prose-code:font-mono

                    prose-pre:bg-zinc-900
                    prose-pre:border
                    prose-pre:border-zinc-800
                    prose-pre:p-6
                    prose-pre:my-8
                    prose-pre:overflow-x-auto
                    prose-pre:rounded-none

                    prose-ul:text-zinc-400
                    prose-ul:leading-relaxed
                    prose-ul:my-6
                    prose-ul:list-square
                    prose-ul:pl-6
                    prose-ul:marker:text-zinc-600

                    prose-ol:text-zinc-400
                    prose-ol:leading-relaxed
                    prose-ol:my-6
                    prose-ol:list-decimal
                    prose-ol:pl-6
                    prose-ol:marker:text-zinc-600

                    prose-li:my-2
                    prose-li:pl-2

                    prose-hr:border-zinc-800
                    prose-hr:my-16

                    prose-table:border
                    prose-table:border-zinc-800
                    prose-table:my-8
                    prose-table:w-full
                    prose-table:text-sm

                    prose-thead:border-b
                    prose-thead:border-zinc-800
                    prose-thead:bg-zinc-900/50

                    prose-th:px-4
                    prose-th:py-3
                    prose-th:text-left
                    prose-th:font-bold
                    prose-th:text-white
                    prose-th:uppercase
                    prose-th:tracking-wider
                    prose-th:text-xs

                    prose-td:px-4
                    prose-td:py-4
                    prose-td:text-zinc-400
                    prose-td:border-b
                    prose-td:border-b-zinc-800

                    prose-tr:hover:bg-zinc-900/30
                    prose-tr:transition-colors
                ">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                    </ReactMarkdown>
                </div>

                {/* Footer */}
                <footer className="mt-20 pt-8 border-t border-zinc-800">
                    <Link
                        href="/docs"
                        className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-mono text-xs uppercase tracking-widest"
                    >
                        <FiArrowLeft />
                        Back to Docs
                    </Link>
                </footer>
            </div>
        </div>
    );
}
