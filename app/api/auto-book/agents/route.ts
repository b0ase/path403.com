import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

const prisma = getPrisma();

export async function POST(request: Request) {
    try {
        const { bookId, taskType } = await request.json();

        // In a real implementation, this would trigger background workers (STORM, etc.)
        // For now, we update the task to IN_PROGRESS to simulate activation
        const task = await prisma.autoBookTask.updateMany({
            where: {
                bookId,
                type: taskType
            },
            data: {
                status: 'IN_PROGRESS',
                updatedAt: new Date()
            }
        });

        // We also update the book status
        await prisma.autoBook.update({
            where: { id: bookId },
            data: { status: taskType === 'RESEARCH' ? 'RESEARCHING' : 'WRITING' }
        });

        return NextResponse.json({ success: true, message: `Started ${taskType} cycle.` });
    } catch (error) {
        console.error('Error triggering agent:', error);
        return NextResponse.json({ error: 'Failed to trigger agent' }, { status: 500 });
    }
}
