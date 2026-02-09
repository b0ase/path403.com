import React from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiEdit3, FiAlertTriangle } from 'react-icons/fi';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import BlogContent from '@/components/blog/BlogContent';

export const dynamic = 'force-dynamic';

interface DraftData {
  title: string;
  date?: string;
  author?: string;
  excerpt?: string;
  content: string;
  revisions: number[];
  currentRevision: number;
}

async function getDraft(slug: string, revision: string): Promise<DraftData | null> {
  const draftDir = path.join(process.cwd(), 'content', 'drafts', slug);

  if (!fs.existsSync(draftDir)) {
    return null;
  }

  const revisionNum = parseInt(revision);
  if (isNaN(revisionNum)) {
    return null;
  }

  const filePath = path.join(draftDir, `${revisionNum}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  // Get all revisions for navigation
  const allRevisions = fs.readdirSync(draftDir)
    .filter(f => f.endsWith('.md'))
    .map(f => parseInt(f.replace('.md', '')))
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b);

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    return {
      title: data.title || slug.replace(/-/g, ' '),
      date: data.date,
      author: data.author,
      excerpt: data.excerpt,
      content,
      revisions: allRevisions,
      currentRevision: revisionNum,
    };
  } catch {
    return null;
  }
}

export default async function DraftPage({
  params
}: {
  params: Promise<{ slug: string; revision: string }>
}) {
  const { slug, revision } = await params;
  const draft = await getDraft(slug, revision);

  if (!draft) {
    notFound();
  }

  const latestRevision = Math.max(...draft.revisions);
  const isLatest = draft.currentRevision === latestRevision;

  return (
    <div className="min-h-screen bg-black text-gray-300">
      {/* Draft Warning Banner */}
      <div className="bg-yellow-900/50 border-b border-yellow-700">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-yellow-400">
            <FiAlertTriangle className="w-5 h-5" />
            <span className="font-medium">DRAFT</span>
            <span className="text-yellow-500/70">— Not published</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-yellow-500/70">Revision:</span>
            {draft.revisions.map((rev) => (
              <Link
                key={rev}
                href={`/blog/drafts/${slug}/${rev}`}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  rev === draft.currentRevision
                    ? 'bg-yellow-600 text-white'
                    : 'bg-yellow-900/50 text-yellow-400 hover:bg-yellow-800/50'
                }`}
              >
                v{rev}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Not Latest Warning */}
      {!isLatest && (
        <div className="bg-red-900/30 border-b border-red-800">
          <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
            <span className="text-red-400">You're viewing an older revision</span>
            <Link
              href={`/blog/drafts/${slug}/${latestRevision}`}
              className="text-red-300 hover:text-white underline"
            >
              View latest (v{latestRevision})
            </Link>
          </div>
        </div>
      )}

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Navigation */}
          <nav className="mb-8">
            <Link
              href="/blog/drafts"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>All Drafts</span>
            </Link>
          </nav>

          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-2 text-yellow-500 mb-4">
              <FiEdit3 className="w-4 h-4" />
              <span className="text-sm font-mono">
                {slug}/v{draft.currentRevision}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              {draft.title}
            </h1>
            {draft.excerpt && (
              <p className="text-xl text-gray-400">{draft.excerpt}</p>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
              {draft.author && <span>By {draft.author}</span>}
              {draft.date && <span>{draft.date}</span>}
            </div>
          </header>

          {/* Content */}
          <article className="prose prose-invert prose-lg max-w-none">
            <BlogContent content={draft.content} />
          </article>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <Link
                href="/blog/drafts"
                className="text-sky-400 hover:text-sky-300"
              >
                ← All Drafts
              </Link>
              <div className="flex items-center gap-4">
                {draft.currentRevision > 1 && (
                  <Link
                    href={`/blog/drafts/${slug}/${draft.currentRevision - 1}`}
                    className="text-gray-400 hover:text-white"
                  >
                    ← Previous
                  </Link>
                )}
                {draft.currentRevision < latestRevision && (
                  <Link
                    href={`/blog/drafts/${slug}/${draft.currentRevision + 1}`}
                    className="text-gray-400 hover:text-white"
                  >
                    Next →
                  </Link>
                )}
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
