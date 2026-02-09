import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ developerId: string }> }) {
    const prisma = getPrisma();
    const { developerId } = await params;

    try {
        const developer = await prisma.profiles.findUnique({
            where: {
                id: developerId,
            },
            select: {
                id: true,
                username: true,
                full_name: true,
                avatar_url: true,
                social_links: true,
            },
        });

        if (!developer) {
            return NextResponse.json({ error: 'Developer not found' }, { status: 404 });
        }

        return NextResponse.json(developer);

    } catch (error) {
        console.error(`Error fetching developer ${developerId}:`, error);
        return NextResponse.json(
            { error: 'Failed to fetch developer' },
            { status: 500 }
        );
    }
}
