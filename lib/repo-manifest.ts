
import { z } from 'zod';

export const RepoManifestSchema = z.object({
    version: z.string(),
    project: z.object({
        name: z.string(),
        description: z.string(),
        repo_url: z.string().url(),
        license: z.string(),
        website: z.string().url().optional(),
    }),
    asset: z.object({
        ticker: z.string(),
        supply: z.number(),
        chain: z.enum(['BSV']),
        protocol: z.enum(['BSV-20']),
        contract_address: z.string(),
    }),
    economics: z.object({
        treasury_wallet: z.string(),
        model: z.enum(['DIVIDEND', 'BUYBACK_BURN', 'LIQUIDATION']),
        payout_frequency: z.enum(['QUARTERLY', 'MONTHLY', 'ANNUALLY', 'MANUAL']).optional(),
    }),
    upstream_covenant: z.object({
        enabled: z.boolean(),
        description: z.string().optional(),
        beneficiaries: z.array(z.object({
            repo: z.string().url(),
            allocation_percent: z.number().min(0).max(100),
            type: z.enum(['EQUITY', 'REVENUE']),
        })).optional(),
    }).optional(),
    governance: z.object({
        method: z.enum(['DAO_VOTE', 'OWNER_DICTATORSHIP']),
        statement: z.string(),
    }),
});

export type RepoManifest = z.infer<typeof RepoManifestSchema>;

export async function fetchRepoManifest(repoUrl: string): Promise<RepoManifest | null> {
    try {
        // 1. Parse URL to extract owner and repo
        // Expected format: https://github.com/owner/repo or similar
        // We remove trailing .git if present
        const cleanUrl = repoUrl.replace(/\.git$/, '');
        const urlParts = new URL(cleanUrl);

        if (urlParts.hostname !== 'github.com') {
            console.error('Only github.com repositories are currently supported');
            return null;
        }

        const pathSegments = urlParts.pathname.split('/').filter(Boolean);
        if (pathSegments.length < 2) {
            console.error('Invalid GitHub URL format');
            return null;
        }

        const owner = pathSegments[0];
        const repo = pathSegments[1];

        // 2. Try fetching from main, then master
        const branches = ['main', 'master'];
        let manifestData: unknown = null;

        for (const branch of branches) {
            const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/token.json`;
            console.log(`Attempting to fetch manifest from: ${rawUrl}`);

            try {
                const response = await fetch(rawUrl);
                if (response.ok) {
                    manifestData = await response.json();
                    break; // Found it
                }
            } catch (e) {
                console.warn(`Failed to fetch from ${branch}:`, e);
            }
        }

        if (!manifestData) {
            console.error('token.json not found in main or master branch');
            return null;
        }

        // 3. Validate against schema
        const result = RepoManifestSchema.safeParse(manifestData);

        if (!result.success) {
            console.error('Invalid token.json schema:', result.error);
            return null;
        }

        return result.data;

    } catch (error) {
        console.error('Error in fetchRepoManifest:', error);
        return null;
    }
}
