import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

const prisma = getPrisma();

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title');

    if (!title) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    try {
        const existingProject = await prisma.kintsugi_chat_sessions.findFirst({
            where: {
                title: {
                    equals: title,
                    mode: 'insensitive' // Optional: case-insensitive check
                }
            }
        });

        return NextResponse.json({
            available: !existingProject,
            suggested: existingProject ? `${title} ${Math.floor(Math.random() * 1000)}` : null
        });
    } catch (error) {
        console.error('[check-name] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
