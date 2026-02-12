import { readFileSync } from 'fs';
import { resolve } from 'path';
import { marked } from 'marked';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '$403 — The Forbidden Path: x401 / x402 / x403',
  description: 'Three DNS records. Three subdomains. Identity (x401), Payment (x402), and Conditions (x403) for any website on earth. Programmable rules anchored to the blockchain.',
  openGraph: {
    title: '$403 — The Forbidden Path',
    description: 'x401 / x402 / x403 — Three DNS records give any website identity, payment, and programmable conditions. The MX record for the programmable web.',
    url: 'https://path403.com/x-protocol',
    siteName: '$403',
  },
  twitter: {
    card: 'summary_large_image',
    title: '$403 — The Forbidden Path',
    description: 'x401 / x402 / x403 — Three DNS records. Identity, payment, and conditions for any website on earth.',
  },
};

function getWhitepaper() {
  const filePath = resolve(process.cwd(), 'docs/X-PROTOCOL-WHITEPAPER.md');
  const markdown = readFileSync(filePath, 'utf-8');
  return marked.parse(markdown);
}

export default function XProtocolPage() {
  const html = getWhitepaper() as string;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header bar */}
      <div className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-3 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-500">
              Inscribed on BSV
            </span>
          </div>
          <a
            href="https://whatsonchain.com/tx/7036e33a106357fcb816f8e56c56e090deb43396fc2066a16fafe865b294df67"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-mono text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors"
          >
            Verify on-chain &rarr;
          </a>
        </div>
      </div>

      {/* Whitepaper content */}
      <article className="max-w-6xl mx-auto px-3 py-8 md:py-14">
        <style>{`
          .wp h1 {
            font-family: var(--font-orbitron), monospace;
            font-weight: 900;
            font-size: 3rem;
            line-height: 1.1;
            letter-spacing: -0.03em;
            margin-bottom: 0.75rem;
            color: white;
          }
          @media (min-width: 768px) {
            .wp h1 { font-size: 4rem; }
          }
          .wp h2 {
            font-family: var(--font-orbitron), monospace;
            font-weight: 900;
            font-size: 1.75rem;
            letter-spacing: -0.02em;
            margin-top: 3.5rem;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid rgba(63, 63, 70, 0.5);
            color: white;
          }
          .wp h3 {
            font-family: var(--font-orbitron), monospace;
            font-weight: 700;
            font-size: 1.3rem;
            letter-spacing: -0.01em;
            margin-top: 2.5rem;
            margin-bottom: 0.75rem;
            color: rgb(228, 228, 231);
          }
          .wp h4 {
            font-family: var(--font-jetbrains-mono), monospace;
            font-weight: 700;
            font-size: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-top: 2rem;
            margin-bottom: 0.5rem;
            color: rgb(239, 68, 68);
          }
          .wp p {
            font-family: var(--font-inter), sans-serif;
            font-size: 1.15rem;
            line-height: 1.85;
            color: rgb(161, 161, 170);
            margin-bottom: 1.25rem;
          }
          .wp p em {
            color: rgb(212, 212, 216);
            font-style: italic;
          }
          .wp strong {
            color: rgb(244, 244, 245);
            font-weight: 700;
          }
          .wp ul, .wp ol {
            margin-bottom: 1.25rem;
            padding-left: 1.5rem;
          }
          .wp li {
            font-family: var(--font-inter), sans-serif;
            font-size: 1.1rem;
            line-height: 1.75;
            color: rgb(161, 161, 170);
            margin-bottom: 0.4rem;
          }
          .wp li strong {
            color: rgb(244, 244, 245);
          }
          .wp a {
            color: rgb(239, 68, 68);
            text-decoration: none;
            transition: color 0.15s;
          }
          .wp a:hover {
            color: rgb(248, 113, 113);
          }
          .wp code {
            font-family: var(--font-jetbrains-mono), monospace;
            font-size: 0.95rem;
            background: rgb(24, 24, 27);
            border: 1px solid rgb(39, 39, 42);
            color: rgb(248, 113, 113);
            padding: 0.15rem 0.4rem;
            border-radius: 3px;
          }
          .wp pre {
            background: rgb(9, 9, 11);
            border: 1px solid rgb(39, 39, 42);
            border-radius: 6px;
            padding: 1.25rem;
            margin-bottom: 1.5rem;
            overflow-x: auto;
          }
          .wp pre code {
            background: none;
            border: none;
            padding: 0;
            font-size: 0.9rem;
            line-height: 1.6;
            color: rgb(161, 161, 170);
          }
          .wp blockquote {
            border-left: 3px solid rgba(239, 68, 68, 0.3);
            padding-left: 1.25rem;
            margin: 1.5rem 0;
            color: rgb(113, 113, 122);
          }
          .wp hr {
            border: none;
            border-top: 1px solid rgb(39, 39, 42);
            margin: 3rem 0;
          }
          .wp table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1.5rem;
            font-family: var(--font-jetbrains-mono), monospace;
            font-size: 0.95rem;
          }
          .wp thead {
            background: rgb(9, 9, 11);
          }
          .wp th {
            text-align: left;
            padding: 0.75rem 1rem;
            font-size: 0.8rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            color: rgb(113, 113, 122);
            border-bottom: 1px solid rgb(39, 39, 42);
          }
          .wp td {
            padding: 0.65rem 1rem;
            border-bottom: 1px solid rgb(24, 24, 27);
            color: rgb(161, 161, 170);
            vertical-align: top;
          }
          .wp tbody tr:hover {
            background: rgba(239, 68, 68, 0.03);
          }
        `}</style>
        <div
          className="wp"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>

      {/* Footer inscription proof */}
      <div className="border-t border-zinc-800 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-3 py-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-[0.2em]">
              Permanently inscribed on the Bitcoin blockchain
            </span>
          </div>
          <div className="border border-zinc-800 bg-zinc-950 p-4 rounded text-left font-mono text-[10px] space-y-1.5">
            <div className="flex gap-3">
              <span className="text-zinc-600 shrink-0">TXID</span>
              <a
                href="https://whatsonchain.com/tx/7036e33a106357fcb816f8e56c56e090deb43396fc2066a16fafe865b294df67"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-500 hover:text-red-400 break-all transition-colors"
              >
                7036e33a106357fcb816f8e56c56e090deb43396fc2066a16fafe865b294df67
              </a>
            </div>
            <div className="flex gap-3">
              <span className="text-zinc-600 shrink-0">SHA-256</span>
              <span className="text-zinc-400 break-all">
                f4770d86fea19f5731e3d58ef4b19ed6d433b64cebbabbe4220e910fe64b5d14
              </span>
            </div>
            <div className="flex gap-3">
              <span className="text-zinc-600 shrink-0">FORMAT</span>
              <span className="text-zinc-400">Bitcoin Schema (B + MAP + AIP)</span>
            </div>
            <div className="flex gap-3">
              <span className="text-zinc-600 shrink-0">DATE</span>
              <span className="text-zinc-400">February 12, 2026</span>
            </div>
          </div>
          <p className="text-[8px] font-mono text-zinc-600 mt-4">
            Open BSV License v4. This document cannot be edited or deleted.
          </p>
        </div>
      </div>
    </div>
  );
}
