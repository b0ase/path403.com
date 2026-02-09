import { ResearchAgent, WritingAgent, ResearchData } from './agents';
import { createClient } from '@supabase/supabase-js';
import { getPrisma } from '@/lib/prisma';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const prisma = getPrisma();

export interface BookGenerationResult {
  success: boolean;
  bookId?: string;
  title?: string;
  chapters?: number;
  error?: string;
}

/**
 * Book Generator
 *
 * Generates full books using the ResearchAgent and WritingAgent.
 * Process:
 * 1. Pick a queued book from AutoBook table
 * 2. Run ResearchAgent to create outline
 * 3. Run WritingAgent for each chapter
 * 4. Save chapters to AutoBookChapter
 * 5. Update book status to WRITING/PUBLISHED
 */
export class BookGenerator {
  /**
   * Get the next queued book for processing
   */
  static async getNextQueuedBook() {
    const book = await prisma.autoBook.findFirst({
      where: {
        status: { in: ['DRAFT', 'QUEUED'] },
      },
      orderBy: [
        { createdAt: 'asc' },
      ],
    });

    return book;
  }

  /**
   * Generate research/outline for a book
   */
  static async generateResearch(
    bookId: string,
    title: string,
    subject: string,
    targetAudience: string = 'Developers, founders, and tech-savvy business owners'
  ): Promise<ResearchData> {
    // Update status to RESEARCHING
    await prisma.autoBook.update({
      where: { id: bookId },
      data: { status: 'RESEARCHING' },
    });

    // Run research agent
    const research = await ResearchAgent.conductResearch(title, subject, targetAudience);

    // Save research data
    await prisma.autoBook.update({
      where: { id: bookId },
      data: {
        researchData: research as any,
        status: 'WRITING',
      },
    });

    // Create chapter placeholders
    for (let i = 0; i < research.outline.length; i++) {
      const chapter = research.outline[i];
      await prisma.autoBookChapter.create({
        data: {
          bookId,
          title: chapter.chapterTitle,
          description: chapter.chapterDescription,
          orderIndex: i,
          status: 'DRAFT',
        },
      });
    }

    // Update task status
    await prisma.autoBookTask.updateMany({
      where: { bookId, type: 'RESEARCH' },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    await prisma.autoBookTask.updateMany({
      where: { bookId, type: 'OUTLINE' },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    return research;
  }

  /**
   * Generate a single chapter
   */
  static async generateChapter(
    bookId: string,
    chapterId: string,
    bookTitle: string,
    research: ResearchData
  ): Promise<string> {
    const chapter = await prisma.autoBookChapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new Error(`Chapter ${chapterId} not found`);
    }

    // Find the chapter in research outline
    const outlineChapter = research.outline.find(c => c.chapterTitle === chapter.title);
    if (!outlineChapter) {
      throw new Error(`Chapter "${chapter.title}" not found in research outline`);
    }

    // Generate context from key concepts
    const context = `
Key Concepts for the Book:
${research.keyConcepts.map(c => `- ${c}`).join('\n')}

References to consider:
${research.references.map(r => `- ${r}`).join('\n')}
    `.trim();

    // Generate chapter content
    const content = await WritingAgent.writeChapter(
      bookTitle,
      chapter.title,
      chapter.description || outlineChapter.chapterDescription,
      outlineChapter.keyPoints,
      research.tone,
      context
    );

    // Save chapter content
    await prisma.autoBookChapter.update({
      where: { id: chapterId },
      data: {
        content,
        status: 'COMPLETED',
      },
    });

    return content;
  }

  /**
   * Generate all chapters for a book
   */
  static async generateAllChapters(bookId: string): Promise<number> {
    const book = await prisma.autoBook.findUnique({
      where: { id: bookId },
      include: { AutoBookChapter: { orderBy: { orderIndex: 'asc' } } },
    });

    if (!book || !book.researchData) {
      throw new Error('Book not found or research not complete');
    }

    const research = book.researchData as unknown as ResearchData;
    let generatedCount = 0;

    for (const chapter of book.AutoBookChapter) {
      if (chapter.status === 'COMPLETED' && chapter.content) {
        continue; // Skip already generated chapters
      }

      console.log(`[BookGenerator] Generating chapter: ${chapter.title}`);
      await this.generateChapter(bookId, chapter.id, book.title, research);
      generatedCount++;

      // Add a small delay between chapters to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Update task status
    await prisma.autoBookTask.updateMany({
      where: { bookId, type: 'PROSE' },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    return generatedCount;
  }

  /**
   * Compile all chapters into a single markdown document
   */
  static async compileBook(bookId: string): Promise<string> {
    const book = await prisma.autoBook.findUnique({
      where: { id: bookId },
      include: { AutoBookChapter: { orderBy: { orderIndex: 'asc' } } },
    });

    if (!book) {
      throw new Error('Book not found');
    }

    const research = book.researchData as unknown as ResearchData;

    // Build the book markdown
    let markdown = `# ${book.title}\n\n`;
    markdown += `> ${book.subject}\n\n`;
    markdown += `---\n\n`;

    // Table of Contents
    markdown += `## Table of Contents\n\n`;
    for (let i = 0; i < book.AutoBookChapter.length; i++) {
      const chapter = book.AutoBookChapter[i];
      markdown += `${i + 1}. [${chapter.title}](#chapter-${i + 1})\n`;
    }
    markdown += `\n---\n\n`;

    // Chapters
    for (let i = 0; i < book.AutoBookChapter.length; i++) {
      const chapter = book.AutoBookChapter[i];
      markdown += `<a name="chapter-${i + 1}"></a>\n\n`;
      markdown += chapter.content || `## ${chapter.title}\n\n*Content not generated yet.*\n`;
      markdown += `\n\n---\n\n`;
    }

    // Save compiled content
    await prisma.autoBook.update({
      where: { id: bookId },
      data: {
        content: { markdown },
        status: 'EDITING',
      },
    });

    return markdown;
  }

  /**
   * Full pipeline: research -> chapters -> compile
   */
  static async generateFullBook(bookId: string): Promise<BookGenerationResult> {
    try {
      const book = await prisma.autoBook.findUnique({
        where: { id: bookId },
      });

      if (!book) {
        return { success: false, error: 'Book not found' };
      }

      console.log(`[BookGenerator] Starting full generation for: ${book.title}`);

      // Step 1: Research (if not done)
      let research = book.researchData as unknown as ResearchData;
      if (!research || !research.outline) {
        console.log('[BookGenerator] Running research phase...');
        research = await this.generateResearch(
          bookId,
          book.title,
          book.subject,
          'Developers, founders, and tech-savvy business owners'
        );
      }

      // Step 2: Generate chapters
      console.log('[BookGenerator] Generating chapters...');
      const chaptersGenerated = await this.generateAllChapters(bookId);

      // Step 3: Compile
      console.log('[BookGenerator] Compiling book...');
      await this.compileBook(bookId);

      // Mark as complete
      await prisma.autoBook.update({
        where: { id: bookId },
        data: { status: 'PUBLISHED' },
      });

      return {
        success: true,
        bookId,
        title: book.title,
        chapters: chaptersGenerated,
      };
    } catch (error) {
      console.error('[BookGenerator] Error:', error);

      // Update book status to failed
      await prisma.autoBook.update({
        where: { id: bookId },
        data: { status: 'DRAFT' }, // Reset to draft so it can be retried
      });

      return {
        success: false,
        bookId,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Process the next queued book (for cron job)
   */
  static async processNextBook(): Promise<BookGenerationResult> {
    const book = await this.getNextQueuedBook();

    if (!book) {
      return { success: false, error: 'No queued books to process' };
    }

    return this.generateFullBook(book.id);
  }
}
