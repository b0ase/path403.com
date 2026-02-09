'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { KintsugiHero } from './KintsugiHero';

interface BlogContentProps {
    content: string;
}

/**
 * Shared blog content renderer - ensures consistent styling across all blog posts
 *
 * CRITICAL RULES:
 * - Exactly 2 font sizes in readable content: text-3xl (headings) and text-xl (body)
 * - Optimised for mobile readability (larger text for those with glasses)
 * - NO different sizes for H1/H2/H3 - all use text-3xl
 * - This component is the SINGLE SOURCE OF TRUTH for blog rendering
 * - Both database posts and static markdown posts MUST use this component
 */
export default function BlogContent({ content }: BlogContentProps) {
    return (
        <div className="prose prose-invert max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // All headings: text-3xl - larger for readability
                    h1: ({ node, ...props }) => (
                        <h1 className="text-3xl font-bold text-white mt-12 md:mt-16 mb-6 md:mb-8" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                        <h2 className="text-3xl font-bold text-white mt-12 md:mt-16 mb-6 md:mb-8 border-b border-zinc-800 pb-3 clear-both" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                        <h3 className="text-3xl font-bold text-white mt-12 md:mt-16 mb-6 md:mb-8" {...props} />
                    ),

                    // All body content: text-xl - larger for readability (20px)
                    // Check if paragraph only contains an image - if so, render as div to avoid hydration error
                    p: ({ node, children, ...props }) => {
                        // Check AST node for image-only paragraph
                        const nodeChildren = (node as any)?.children || [];
                        const hasOnlyImage = nodeChildren.length === 1 &&
                            nodeChildren[0]?.tagName === 'img';

                        if (hasOnlyImage) {
                            // No wrapper needed for floated images
                            return <>{children}</>;
                        }
                        return <p className="text-xl text-zinc-300 leading-relaxed mb-6" {...props}>{children}</p>;
                    },
                    ul: ({ node, ...props }) => (
                        <ul className="text-xl text-zinc-300 leading-relaxed mb-6 space-y-3" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                        <ol className="text-xl text-zinc-300 leading-relaxed mb-6 space-y-3 list-decimal pl-6" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                        <li className="text-xl text-zinc-300 leading-relaxed" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                        <blockquote className="text-xl text-zinc-200 border-l-2 border-white bg-zinc-900/30 px-6 py-4 my-6" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                        <strong className="text-white font-semibold" {...props} />
                    ),
                    code: ({ node, ...props }) => (
                        <code className="text-xl text-zinc-200 bg-zinc-800 px-2 py-1 rounded font-mono" {...props} />
                    ),
                    pre: ({ node, ...props }) => (
                        <pre className="text-lg bg-zinc-900 border border-zinc-800 p-4 md:p-6 my-6 rounded overflow-x-auto" {...props} />
                    ),
                    a: ({ node, ...props }) => (
                        <a className="text-white underline underline-offset-4 decoration-zinc-600 hover:decoration-white transition-colors" {...props} />
                    ),
                    img: ({ node, ...props }) => {
                        const isSkull = props.src === '/images/blog/quishing-skull.png';
                        const isKintsugiBowl = props.src?.includes('kintsugi-bowl');
                        const isKintsugi2 = props.src?.includes('kintsugi-2');
                        const isKintsugi3 = props.src?.includes('kintsugi-3');

                        return (
                            //eslint-disable-next-line @next/next/no-img-element
                            <img
                                {...props}
                                className={`rounded-lg ${isSkull ? '!w-1/4 float-left mr-8 mb-4' : 'w-full my-8'}`}
                                alt={props.alt || ''}
                            />
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
