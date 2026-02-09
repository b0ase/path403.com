import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { fetchRepoManifest } from '@/lib/repo-manifest';

export async function POST(request: Request) {
    const prisma = getPrisma();

    try {
        const body = await request.json();
        const { repoUrl } = body;

        if (!repoUrl) {
            return NextResponse.json({ error: 'Missing repoUrl' }, { status: 400 });
        }

        // 1. Fetch & Validate Manifest directly from GitHub
        const manifest = await fetchRepoManifest(repoUrl);

        if (!manifest) {
            return NextResponse.json({ error: 'Failed to fetch or validate token.json' }, { status: 400 });
        }

        // 2. Parse GitHub Details for ID (simple parsing for now, ideally we use GitHub API ID)
        // cleanUrl removes .git and trailing slashes
        const cleanUrl = repoUrl.replace(/\.git$/, '').replace(/\/$/, '');
        const urlParts = new URL(cleanUrl);
        const pathSegments = urlParts.pathname.split('/').filter(Boolean);
        const owner = pathSegments[0];
        const repoName = pathSegments[1];
        const githubFullName = `${owner}/${repoName}`;

        // Note: In a real app, we should fetch the numeric github_repo_id from GitHub API here.
        // For now, we will assume one doesn't exist or use a fast-hash or 0 if optional.
        // The schema has `github_repo_id BigInt @unique`. 
        // Let's use a dummy ID or fetch it if possible. 
        // For robustness, let's try to fetch the real ID.

        let githubId = BigInt(0);
        try {
            const ghToken = process.env.GITHUB_TOKEN;
            const ghHeaders: any = { 'User-Agent': 'b0ase-indexer' };
            if (ghToken) ghHeaders['Authorization'] = `Bearer ${ghToken}`;

            const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, { headers: ghHeaders });
            if (ghRes.ok) {
                const ghData = await ghRes.json();
                githubId = BigInt(ghData.id);
            } else {
                // Fallback if we can't get the ID (rate limits etc), though unique constraint might fail if we use 0 collision
                console.warn("Could not fetch real GitHub ID, using fallback");
            }
        } catch (e) {
            console.warn("GitHub API error", e);
        }

        // 3. Database Updates (Transaction)
        await prisma.$transaction(async (tx) => {
            // A. Upsert Repository
            const repo = await tx.tokenized_repositories.upsert({
                where: {
                    github_repo_id: githubId !== BigInt(0) ? githubId : undefined, // Only use where if we have a valid ID, relying on other unique fields? 
                    // Actually, if we don't have the ID, upsert is tricky on that field.
                    // Let's fallback to finding by token_symbol if unique, or just assume we have the ID.
                    // Schema: github_repo_id is @unique.
                    // If we failed to get ID, we probably shouldn't proceed or valid DB constraint will fail.
                    // Let's try to find by another unique field? Schema says `token_symbol` is unique.
                    token_symbol: manifest.asset.ticker
                },
                update: {
                    github_repo_name: repoName,
                    github_owner: owner,
                    github_full_name: githubFullName,
                    github_description: manifest.project.description,
                    github_url: cleanUrl,
                    is_tokenized: true,
                    token_symbol: manifest.asset.ticker,
                    token_chain: manifest.asset.chain,
                    token_contract_address: manifest.asset.contract_address,
                    token_supply: BigInt(manifest.asset.supply),
                    manifest_url: `${cleanUrl}/blob/main/token.json`, // Approximation
                    manifest_data: manifest as any,
                    upstream_enabled: manifest.upstream_covenant?.enabled || false,
                    last_synced_at: new Date()
                },
                create: {
                    unified_user_id: '00000000-0000-0000-0000-000000000000', // System user fallback
                    github_repo_id: githubId,
                    github_repo_name: repoName,
                    github_owner: owner,
                    github_full_name: githubFullName,
                    github_description: manifest.project.description,
                    github_url: cleanUrl,
                    is_tokenized: true,
                    token_symbol: manifest.asset.ticker,
                    token_chain: manifest.asset.chain,
                    token_contract_address: manifest.asset.contract_address,
                    token_supply: BigInt(manifest.asset.supply),
                    manifest_url: `${cleanUrl}/blob/main/token.json`,
                    manifest_data: manifest as any,
                    upstream_enabled: manifest.upstream_covenant?.enabled || false,
                }
            });

            // B. Update Beneficiaries
            // First, remove existing ones for this repo to ensure clean state
            await tx.repository_beneficiaries.deleteMany({
                where: { source_repo_id: repo.id }
            });

            // Second, add new ones from manifest
            if (manifest.upstream_covenant?.enabled && manifest.upstream_covenant.beneficiaries) {
                for (const beneficiary of manifest.upstream_covenant.beneficiaries) {
                    await tx.repository_beneficiaries.create({
                        data: {
                            source_repo_id: repo.id,
                            target_repo_url: beneficiary.repo,
                            allocation_percent: beneficiary.allocation_percent,
                            type: beneficiary.type
                        }
                    });
                }
            }

            return repo;
        });

        return NextResponse.json({ success: true, message: 'Repo indexed successfully', repo: githubFullName });

    } catch (error: any) {
        console.error('Indexing Error:', error);
        return NextResponse.json({ error: error.message || 'Indexing failed' }, { status: 500 });
    }
}
