import fs from 'fs';
import path from 'path';
import Link from 'next/link';

type Block =
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'code'; lang?: string; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] };

function parseMarkdown(md: string): Block[] {
  const lines = md.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim() || undefined;
      i += 1;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push({ type: 'code', lang, text: codeLines.join('\n') });
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      i += 1;
      continue;
    }

    const ulMatch = line.match(/^\s*[-*]\s+(.*)$/);
    if (ulMatch) {
      const items: string[] = [];
      while (i < lines.length) {
        const m = lines[i].match(/^\s*[-*]\s+(.*)$/);
        if (!m) break;
        items.push(m[1].trim());
        i += 1;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    const olMatch = line.match(/^\s*\d+\.\s+(.*)$/);
    if (olMatch) {
      const items: string[] = [];
      while (i < lines.length) {
        const m = lines[i].match(/^\s*\d+\.\s+(.*)$/);
        if (!m) break;
        items.push(m[1].trim());
        i += 1;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    if (line.trim() === '') {
      i += 1;
      continue;
    }

    const paragraphLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].trim().startsWith('```') && !lines[i].match(/^(#{1,6})\s+/)) {
      paragraphLines.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ type: 'paragraph', text: paragraphLines.join(' ') });
  }

  return blocks;
}

export default function DomainVerificationDocPage() {
  const filePath = path.join(process.cwd(), 'docs', 'DOMAIN_VERIFICATION.md');
  const raw = fs.readFileSync(filePath, 'utf8');
  const blocks = parseMarkdown(raw);

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-20">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-10">
          <Link href="/docs" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-sm mb-4 inline-block">
            ← Back to Docs
          </Link>
          <h1 className="text-5xl font-bold text-zinc-900 dark:text-white">Domain Verification</h1>
        </div>

        <div className="space-y-6">
          {blocks.map((block, idx) => {
            if (block.type === 'heading') {
              const level = Math.min(block.level + 1, 6);
              const Tag = level === 2 ? 'h2' : level === 3 ? 'h3' : level === 4 ? 'h4' : level === 5 ? 'h5' : 'h6';
              return (
                <Tag key={idx} className="text-zinc-900 dark:text-white font-bold text-2xl">
                  {block.text}
                </Tag>
              );
            }
            if (block.type === 'paragraph') {
              return (
                <p key={idx} className="text-zinc-400 leading-relaxed">
                  {block.text}
                </p>
              );
            }
            if (block.type === 'code') {
              return (
                <pre key={idx} className="bg-zinc-900 text-zinc-200 text-sm p-4 overflow-x-auto">
                  {block.text}
                </pre>
              );
            }
            if (block.type === 'ul') {
              return (
                <ul key={idx} className="list-disc list-inside text-zinc-400 space-y-2">
                  {block.items.map((item, itemIdx) => (
                    <li key={itemIdx}>{item}</li>
                  ))}
                </ul>
              );
            }
            if (block.type === 'ol') {
              return (
                <ol key={idx} className="list-decimal list-inside text-zinc-400 space-y-2">
                  {block.items.map((item, itemIdx) => (
                    <li key={itemIdx}>{item}</li>
                  ))}
                </ol>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
