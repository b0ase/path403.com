import { readFileSync } from 'fs';
import { resolve } from 'path';
import { marked } from 'marked';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DNS vs SDK: The x402 Question — $403',
  description: 'Coinbase built an SDK for HTTP 402 payments. We built three DNS records. Here\'s why DNS wins.',
  openGraph: {
    title: 'DNS vs SDK: The x402 Question',
    description: 'Coinbase built an SDK for HTTP 402 payments. We built three DNS records. Here\'s why DNS wins.',
    url: 'https://path403.com/blog/dns-vs-sdk',
    siteName: '$403',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DNS vs SDK: The x402 Question',
    description: 'Coinbase built an SDK for HTTP 402 payments. We built three DNS records.',
  },
};

function getContent() {
  const filePath = resolve(process.cwd(), 'content/dns-vs-sdk.md');
  const markdown = readFileSync(filePath, 'utf-8');
  return marked.parse(markdown);
}

export default function DnsVsSdkPage() {
  const html = getContent() as string;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white">
      {/* Header bar */}
      <div className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">
              $403
            </a>
            <span className="text-zinc-700">/</span>
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-500">
              Blog
            </span>
          </div>
          <a
            href="https://path401.com/x-protocol"
            className="text-[9px] font-mono text-green-500 hover:text-green-400 uppercase tracking-widest transition-colors"
          >
            X Protocol Whitepaper &rarr;
          </a>
        </div>
      </div>

      {/* Hero videos */}
      <div className="max-w-4xl mx-auto px-4 pt-8 md:pt-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full rounded-lg border border-zinc-800"
          >
            <source src="/x-lights.mp4" type="video/mp4" />
          </video>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full rounded-lg border border-zinc-800"
          >
            <source src="/x-junction-lights.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      {/* Article content */}
      <article className="max-w-4xl mx-auto px-4 pb-14">
        <style>{`
          .blog h2 {
            font-family: var(--font-orbitron), monospace;
            font-weight: 900;
            font-size: 1.75rem;
            letter-spacing: -0.02em;
            margin-top: 3rem;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid rgba(63, 63, 70, 0.5);
            color: white;
          }
          .blog h3 {
            font-family: var(--font-orbitron), monospace;
            font-weight: 700;
            font-size: 1.3rem;
            margin-top: 2rem;
            margin-bottom: 0.75rem;
            color: rgb(228, 228, 231);
          }
          .blog p {
            font-family: var(--font-inter), sans-serif;
            font-size: 1.15rem;
            line-height: 1.85;
            color: rgb(161, 161, 170);
            margin-bottom: 1.25rem;
          }
          .blog p em { color: rgb(212, 212, 216); font-style: italic; }
          .blog strong { color: rgb(244, 244, 245); font-weight: 700; }
          .blog ul, .blog ol {
            margin-bottom: 1.25rem;
            padding-left: 1.5rem;
          }
          .blog li {
            font-family: var(--font-inter), sans-serif;
            font-size: 1.1rem;
            line-height: 1.75;
            color: rgb(161, 161, 170);
            margin-bottom: 0.4rem;
          }
          .blog li strong { color: rgb(244, 244, 245); }
          .blog a { color: rgb(34, 197, 94); text-decoration: none; transition: color 0.15s; }
          .blog a:hover { color: rgb(74, 222, 128); }
          .blog code {
            font-family: var(--font-jetbrains-mono), monospace;
            font-size: 0.95rem;
            background: rgb(24, 24, 27);
            border: 1px solid rgb(39, 39, 42);
            color: rgb(74, 222, 128);
            padding: 0.15rem 0.4rem;
            border-radius: 3px;
          }
          .blog pre {
            background: rgb(9, 9, 11);
            border: 1px solid rgb(39, 39, 42);
            border-radius: 6px;
            padding: 1.25rem;
            margin-bottom: 1.5rem;
            overflow-x: auto;
          }
          .blog pre code {
            background: none;
            border: none;
            padding: 0;
            font-size: 0.9rem;
            line-height: 1.6;
            color: rgb(161, 161, 170);
          }
          .blog blockquote {
            border-left: 3px solid rgba(34, 197, 94, 0.3);
            padding-left: 1.25rem;
            margin: 1.5rem 0;
            color: rgb(113, 113, 122);
          }
          .blog hr {
            border: none;
            border-top: 1px solid rgb(39, 39, 42);
            margin: 3rem 0;
          }
        `}</style>
        <div
          className="blog"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>

      {/* Cross-links */}
      <div className="border-t border-zinc-800 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <a href="https://path401.com/x-protocol" className="block border border-zinc-800 rounded p-4 hover:border-green-500/30 transition-colors">
              <div className="text-green-500 font-mono text-sm font-bold mb-1">$401</div>
              <div className="text-zinc-500 text-xs font-mono">Identity</div>
            </a>
            <a href="https://path402.com" className="block border border-zinc-800 rounded p-4 hover:border-green-500/30 transition-colors">
              <div className="text-green-500 font-mono text-sm font-bold mb-1">$402</div>
              <div className="text-zinc-500 text-xs font-mono">Payment</div>
            </a>
            <a href="https://path403.com" className="block border border-green-500/30 rounded p-4 bg-green-500/5">
              <div className="text-green-500 font-mono text-sm font-bold mb-1">$403</div>
              <div className="text-zinc-500 text-xs font-mono">Conditions</div>
            </a>
          </div>
          <p className="text-[8px] font-mono text-zinc-600 mt-6 text-center">
            Also available at <a href="https://b0ase.com/blog/dns-vs-sdk-the-x402-question" className="text-green-500 hover:text-green-400">b0ase.com</a> and <a href="https://path401.com/x-protocol" className="text-green-500 hover:text-green-400">path401.com/x-protocol</a>
          </p>
        </div>
      </div>
    </div>
  );
}
