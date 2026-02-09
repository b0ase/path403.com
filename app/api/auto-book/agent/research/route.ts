import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { ResearchAgent } from '@/lib/auto-book/agents';
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
        const { bookId } = body;

        if (!bookId) {
            return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
        }

        // 3. Get Book Details
        const book = await prisma.autoBook.findUnique({
            where: { id: bookId },
        });

        if (!book) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        // 4. Create Task
        const task = await prisma.autoBookTask.create({
            data: {
                bookId,
                type: 'RESEARCH',
                status: 'IN_PROGRESS',
            }
        });

        // 5. Run Agent (This could be offloaded to a background job in prod, but inline for now)
        // NOTE: In Vercel serverless, long running tasks might timeout. 
        // Ideally this should be a separate worker, but for MVP/V0 this is acceptable if research is fast enough.
        // We update status immediately to let UI know it started.

        // We perform the research
        console.log(`Starting research for book: ${book.title}`);

        try {
            const researchData = await ResearchAgent.conductResearch(
                book.title,
                book.subject,
                "General Audience" // Needs to be added to model if we want it variable
            );

            // 6. Save Results
            await prisma.autoBook.update({
                where: { id: bookId },
                data: {
                    researchData: researchData as any, // Cast to any for Json field compatibility
                    status: 'RESEARCH_COMPLETE'
                }
            });

            // 7. Initialize Chapters
            if (researchData.outline && Array.isArray(researchData.outline)) {
                // Delete existing chapters to avoid duplicates on re-run (optional strategy)
                await prisma.autoBookChapter.deleteMany({
                    where: { bookId }
                });

                // Bulk create chapters
                // Note: Prisma createMany is not supported on all DBs, but standard Postgres supports it.
                // If safely needed, use a transaction or loop. 
                // We'll use a transaction for safety.

                const chaptersToCreate = researchData.outline.map((chapter: any, index: number) => ({
                    bookId,
                    title: chapter.chapterTitle,
                    description: chapter.chapterDescription,
                    orderIndex: index,
                    status: 'DRAFT'
                }));

                await prisma.autoBookChapter.createMany({
                    data: chaptersToCreate
                });
            }

            // 8. Complete Task
            await prisma.autoBookTask.update({
                where: { id: task.id },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                    result: 'Research completed and chapters initialized.'
                }
            });

            return NextResponse.json({ success: true, data: researchData });

        } catch (agentError: any) {
            console.error("Agent Error:", agentError);

            await prisma.autoBookTask.update({
                where: { id: task.id },
                data: {
                    status: 'FAILED',
                    error: agentError.message || 'Unknown agent error'
                }
            });

            return NextResponse.json({ error: 'Agent failed to complete research' }, { status: 500 });
        }

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
