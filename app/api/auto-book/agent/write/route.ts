import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { WritingAgent } from '@/lib/auto-book/agents';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        // 1. Auth check
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const prisma = getPrisma();

        // 2. Validate request
        const body = await request.json();
        const { chapterId, bookId } = body;

        if (!chapterId || !bookId) {
            return NextResponse.json({ error: 'Chapter ID and Book ID are required' }, { status: 400 });
        }

        // 3. Get Data
        const book = await prisma.autoBook.findUnique({
            where: { id: bookId },
        });

        const chapter = await prisma.autoBookChapter.findUnique({
            where: { id: chapterId }
        });

        if (!book || !chapter) {
            return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }

        // 4. Create Task
        const task = await prisma.autoBookTask.create({
            data: {
                bookId,
                type: 'WRITE_CHAPTER',
                status: 'IN_PROGRESS',
            }
        });

        console.log(`Starting writing for chapter: ${chapter.title}`);

        try {
            // Prepare context
            const researchData = book.researchData as any;
            const outlineContext = researchData?.outline?.find((o: any) => o.chapterTitle === chapter.title);
            const keyPoints = outlineContext?.keyPoints || [];

            // Context string from other parts of research
            const globalContext = `
            Book Title: ${book.title}
            Subject: ${book.subject}
            Target Audience: ${researchData?.targetAudience || 'General'}
            Key Concepts: ${researchData?.keyConcepts?.join(', ') || ''}
            Tone: ${researchData?.tone || 'Professional'}
        `;

            const content = await WritingAgent.writeChapter(
                book.title,
                chapter.title,
                chapter.description || "",
                keyPoints,
                researchData?.tone || "Professional",
                globalContext
            );

            // 6. Save Results
            await prisma.autoBookChapter.update({
                where: { id: chapterId },
                data: {
                    content: content,
                    status: 'COMPLETED'
                }
            });

            // 7. Complete Task
            await prisma.autoBookTask.update({
                where: { id: task.id },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                    result: `Chapter "${chapter.title}" written.`
                }
            });

            return NextResponse.json({ success: true, data: { content } });

        } catch (agentError: any) {
            console.error("Agent Error:", agentError);

            await prisma.autoBookTask.update({
                where: { id: task.id },
                data: {
                    status: 'FAILED',
                    error: agentError.message || 'Unknown agent error'
                }
            });

            return NextResponse.json({ error: 'Agent failed to write chapter' }, { status: 500 });
        }

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
