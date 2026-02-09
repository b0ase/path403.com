import React from 'react';
import Link from 'next/link';
import { FiFileText, FiClock, FiEdit3 } from 'react-icons/fi';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export const dynamic = 'force-dynamic';

interface DraftInfo {
  slug: string;
  title: string;
  revisions: number[];
  latestRevision: number;
  excerpt?: string;
  date?: string;
}

async function getDrafts(): Promise<DraftInfo[]> {
  const draftsDir = path.join(process.cwd(), 'content', 'drafts');

  if (!fs.existsSync(draftsDir)) {
    return [];
  }

  const draftFolders = fs.readdirSync(draftsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const drafts: DraftInfo[] = [];

  for (const slug of draftFolders) {
    const draftPath = path.join(draftsDir, slug);
    const files = fs.readdirSync(draftPath)
      .filter(f => f.endsWith('.md'))
      .map(f => parseInt(f.replace('.md', '')))
      .filter(n => !isNaN(n))
      .sort((a, b) => b - a); // Descending order

    if (files.length === 0) continue;

    const latestRevision = files[0];
    const latestFile = path.join(draftPath, `${latestRevision}.md`);

    try {
      const content = fs.readFileSync(latestFile, 'utf-8');
      const { data } = matter(content);

      drafts.push({
        slug,
        title: data.title || slug.replace(/-/g, ' '),
        revisions: files,
        latestRevision,
        excerpt: data.excerpt,
        date: data.date,
      });
    } catch {
      drafts.push({
        slug,
        title: slug.replace(/-/g, ' '),
        revisions: files,
        latestRevision,
      });
    }
  }

  return drafts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export default async function DraftsPage() {
  const drafts = await getDrafts();

  return (
    <div className="min-h-screen bg-black text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-2 text-yellow-500 mb-4">
            <FiEdit3 className="w-5 h-5" />
            <span className="text-sm font-mono uppercase tracking-wider">Internal Only</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Blog Drafts</h1>
          <p className="text-gray-400">
            Unpublished posts and revisions. These pages are not indexed and not linked from the public blog.
          </p>
        </header>

        {drafts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiFileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No drafts yet.</p>
            <p className="text-sm mt-2">Create a folder in <code className="bg-gray-800 px-2 py-1 rounded">content/drafts/</code></p>
          </div>
        ) : (
          <div className="space-y-6">
            {drafts.map((draft) => (
              <article
                key={draft.slug}
                className="border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link
                      href={`/blog/drafts/${draft.slug}/${draft.latestRevision}`}
                      className="text-xl font-semibold text-white hover:text-sky-400 transition-colors"
                    >
                      {draft.title}
                    </Link>
                    {draft.excerpt && (
                      <p className="mt-2 text-gray-400 line-clamp-2">{draft.excerpt}</p>
                    )}
                    {draft.date && (
                      <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                        <FiClock className="w-4 h-4" />
                        <span>{draft.date}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-2">
                      {draft.revisions.length} revision{draft.revisions.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {draft.revisions.map((rev) => (
                        <Link
                          key={rev}
                          href={`/blog/drafts/${draft.slug}/${rev}`}
                          className={`px-2 py-1 text-xs rounded ${
                            rev === draft.latestRevision
                              ? 'bg-sky-600 text-white'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          v{rev}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <footer className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>Drafts are stored in <code className="bg-gray-800 px-2 py-1 rounded">content/drafts/[slug]/[n].md</code></p>
          <Link href="/blog" className="text-sky-400 hover:text-sky-300 mt-4 inline-block">
            ← Back to published blog
          </Link>
        </footer>
      </div>
    </div>
  );
}
