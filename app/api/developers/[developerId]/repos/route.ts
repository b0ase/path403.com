import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ developerId: string }> }) {
    const prisma = getPrisma();
    const { developerId } = await params;
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
        console.error('GITHUB_TOKEN is not set.');
        return NextResponse.json({ error: 'Server configuration error: GITHUB_TOKEN is missing.' }, { status: 500 });
    }

    try {
        // Step 1: Fetch the developer's GitHub username from identity_tokens
        // This ensures we get the connected GitHub account handle
        const identityToken = await prisma.identity_tokens.findFirst({
            where: {
                user_id: developerId, // This might be a UUID
                source: 'github' // Explicitly GitHub
            },
            select: { identity: true }
        });

        // Fallback: Check profiles if not found (legacy support)
        let username = identityToken?.identity;

        if (!username) {
            const profile = await prisma.profiles.findUnique({
                where: { id: developerId },
                select: { username: true } // Assuming this field exists based on previous code
            });
            username = profile?.username || undefined; // Handle null/undefined
        }

        if (!username) {
            return NextResponse.json({ error: 'Developer not found or GitHub username is missing.' }, { status: 404 });
        }

        // Step 2: Fetch repositories from GitHub using the username
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&direction=desc`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-GitHub-Api-Version': '2022-11-28',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`GitHub API error for user ${username}:`, errorData);
            return NextResponse.json(
                { error: `Failed to fetch repositories for ${username}.`, details: errorData.message },
                { status: response.status }
            );
        }

        const repos = await response.json();
        return NextResponse.json(repos);

    } catch (error) {
        console.error(`Error fetching repos for developer ${developerId}:`, error);
        return NextResponse.json(
            { error: 'Failed to fetch repositories' },
            { status: 500 }
        );
    }
}
