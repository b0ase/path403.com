import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const prisma = getPrisma();
    try {
        const repos = await prisma.tokenized_repositories.findMany({
            where: {
                // We list all cached/indexed repos that are "claimed" or "tokenized"
                // Adjust filter as needed
            },
            select: {
                id: true,
                github_repo_name: true,
                github_owner: true,
                github_full_name: true,
                github_description: true,
                github_stars: true,
                token_symbol: true,
                token_chain: true,
                price_per_star: true,
                token_supply: true,
                is_tokenized: true
            },
            orderBy: {
                github_stars: 'desc'
            }
        });

        // Transform for UI if needed, but returning raw is fine for now
        return NextResponse.json(repos);
    } catch (error) {
        console.error('Error fetching repos:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
