import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { BookGenerator } from '@/lib/auto-book/book-generator';

export const dynamic = 'force-dynamic';

const prisma = getPrisma();

/**
 * GET /api/auto-book/[id]/export
 * Export a book as markdown or other format
 * Query params:
 *   format: 'markdown' | 'json' | 'html' (default: 'markdown')
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'markdown';

    // Fetch book with chapters
    const book = await prisma.autoBook.findUnique({
      where: { id },
      include: {
        AutoBookChapter: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Compile book if not already compiled
    let markdown = (book.content as any)?.markdown;
    if (!markdown) {
      markdown = await BookGenerator.compileBook(id);
    }

    switch (format) {
      case 'json':
        return NextResponse.json({
          title: book.title,
          subject: book.subject,
          status: book.status,
          chapters: book.AutoBookChapter.map(ch => ({
            title: ch.title,
            description: ch.description,
            content: ch.content,
            orderIndex: ch.orderIndex,
          })),
          markdown,
          createdAt: book.createdAt,
          updatedAt: book.updatedAt,
        });

      case 'html':
        // Convert markdown to basic HTML
        const html = markdownToHtml(markdown, book.title);
        return new NextResponse(html, {
          headers: {
            'Content-Type': 'text/html',
            'Content-Disposition': `attachment; filename="${slugify(book.title)}.html"`,
          },
        });

      case 'markdown':
      default:
        return new NextResponse(markdown, {
          headers: {
            'Content-Type': 'text/markdown',
            'Content-Disposition': `attachment; filename="${slugify(book.title)}.md"`,
          },
        });
    }
  } catch (error) {
    console.error('[Book Export] Error:', error);
    return NextResponse.json(
      { error: 'Failed to export book' },
      { status: 500 }
    );
  }
}

/**
 * Simple markdown to HTML converter
 */
function markdownToHtml(markdown: string, title: string): string {
  // Basic markdown to HTML conversion
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
    // Code blocks
    .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    // Blockquotes
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    // Horizontal rules
    .replace(/^---$/gim, '<hr />')
    // Paragraphs
    .replace(/\n\n/gim, '</p><p>')
    // Line breaks
    .replace(/\n/gim, '<br />');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      font-family: Georgia, 'Times New Roman', serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      line-height: 1.8;
      color: #333;
    }
    h1 { font-size: 2.5em; margin-bottom: 0.5em; border-bottom: 2px solid #333; padding-bottom: 0.3em; }
    h2 { font-size: 1.8em; margin-top: 2em; color: #444; }
    h3 { font-size: 1.4em; margin-top: 1.5em; color: #555; }
    p { margin: 1em 0; text-align: justify; }
    blockquote { border-left: 4px solid #ddd; margin: 1em 0; padding-left: 1em; color: #666; font-style: italic; }
    pre { background: #f5f5f5; padding: 1em; overflow-x: auto; }
    code { background: #f5f5f5; padding: 0.2em 0.4em; font-family: 'Courier New', monospace; }
    hr { border: none; border-top: 1px solid #ddd; margin: 2em 0; }
    a { color: #0066cc; }
    @media print {
      body { max-width: none; }
      h1, h2 { page-break-after: avoid; }
      pre, blockquote { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <p>${html}</p>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
