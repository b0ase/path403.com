import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ developerId: string; username: string }> }) {
    const { username } = await params;
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
        console.error('GITHUB_TOKEN is not set.');
        return NextResponse.json({ error: 'Server configuration error: GITHUB_TOKEN is missing.' }, { status: 500 });
    }

    try {
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

        // We can filter or map the repo data here if needed, but for now, we return it as is.
        return NextResponse.json(repos);

    } catch (error) {
        console.error(`Error fetching repos for ${username}:`, error);
        return NextResponse.json(
            { error: 'Failed to fetch repositories' },
            { status: 500 }
        );
    }
}
