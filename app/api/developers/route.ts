import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const prisma = getPrisma();
    try {
        // Get GitHub identity tokens with profile data for verification status
        const tokens = await prisma.identity_tokens.findMany({
            where: {
                source: 'github'
            },
            select: {
                id: true,
                identity: true, // This is the username
                display_name: true,
                user_id: true
            }
        });

        // Get profile data for verification status
        const userIds = tokens.map(t => t.user_id).filter(Boolean) as string[];
        const profiles = await prisma.profiles.findMany({
            where: {
                id: { in: userIds }
            },
            select: {
                id: true,
                github_verified: true,
                is_marketplace_developer: true
            }
        });

        // Create a map for quick lookup
        const profileMap = new Map(profiles.map(p => [p.id, p]));

        const developers = tokens.map(token => {
            const profile = token.user_id ? profileMap.get(token.user_id) : null;
            return {
                id: token.id,
                username: token.identity,
                full_name: token.display_name,
                developerId: token.user_id,
                github_verified: profile?.github_verified || false,
                is_marketplace_developer: profile?.is_marketplace_developer || false
            };
        });

        return NextResponse.json(developers);

    } catch (error) {
        console.error('Error fetching developers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch developers' },
            { status: 500 }
        );
    }
}
