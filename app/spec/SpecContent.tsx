'use client';

import { marked } from 'marked';
import { motion } from 'framer-motion';

export function SpecContent({ markdown }: { markdown: string }) {
  const html = marked.parse(markdown, { async: false }) as string;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto px-6 md:px-16 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2">
              Technical Specification
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 font-display">
              $403<span className="text-zinc-300 dark:text-zinc-700">.SPEC</span>
            </h1>
          </div>

          <article
            className="prose prose-zinc dark:prose-invert prose-sm max-w-none
              prose-headings:font-display prose-headings:font-black prose-headings:tracking-tight prose-headings:uppercase
              prose-h1:text-2xl prose-h2:text-xl prose-h3:text-base
              prose-code:text-amber-500 prose-code:bg-zinc-100 dark:prose-code:bg-zinc-900 prose-code:px-1 prose-code:py-0.5 prose-code:text-xs prose-code:font-mono
              prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 prose-pre:text-xs
              prose-table:text-xs prose-th:text-[9px] prose-th:uppercase prose-th:tracking-widest prose-th:font-mono
              prose-a:text-amber-500 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-zinc-900 dark:prose-strong:text-white
              prose-hr:border-zinc-200 dark:prose-hr:border-zinc-800"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </motion.div>
      </div>
    </div>
  );
}
