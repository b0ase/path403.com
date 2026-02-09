import { NextRequest, NextResponse } from 'next/server';
import { createPrivateRepo } from '@/lib/github';

export async function POST(req: NextRequest) {
    try {
        const { projectTitle, sessionCode } = await req.json();

        if (!projectTitle || !sessionCode) {
            return NextResponse.json({ error: 'Missing projectTitle or sessionCode' }, { status: 400 });
        }

        // Sanitize repo name: lowercase, replace spaces/special chars with hyphens
        const repoName = projectTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || `kintsugi-${sessionCode.toLowerCase()}`;

        // Add session code suffix to ensure uniqueness
        const finalRepoName = `${repoName}-${sessionCode.toLowerCase()}`;

        console.log(`Creating repo: ${finalRepoName}`);

        // Create Repo
        const repo = await createPrivateRepo(finalRepoName, `Kintsugi Project: ${projectTitle}`);

        return NextResponse.json({
            success: true,
            repoUrl: repo.html_url,
            repoName: finalRepoName,
            cloneUrl: repo.clone_url
        });

    } catch (error: any) {
        console.error('Create Repo Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
