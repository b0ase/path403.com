
import { Octokit } from '@octokit/rest';
import { createClient } from '@/lib/supabase/server';
import { getPrisma } from '@/lib/prisma';
import { getUserGitHubToken } from '@/lib/github-token';
import { getContractTitle } from '@/lib/contract-titles';

interface ImportResult {
    success: boolean;
    tenderId?: string;
    contractId?: string;
    error?: string;
}

export class GithubContractImportService {
    private userId: string;

    constructor(userId: string) {
        this.userId = userId;
    }

    /**
     * Import a GitHub Issue as a Funded Tender
     */
    async importIssueAsContract(repoOwner: string, repoName: string, issueNumber: number): Promise<ImportResult> {
        try {
            const token = await getUserGitHubToken(this.userId);
            if (!token) {
                throw new Error('User not connected to GitHub');
            }

            const octokit = new Octokit({ auth: token });
            const { data: issue } = await octokit.issues.get({
                owner: repoOwner,
                repo: repoName,
                issue_number: issueNumber,
            });

            if (!issue.body) {
                throw new Error('Issue has no content');
            }

            // 1. Parse Markdown for Compensation
            const compensationMatch = issue.body.match(/\*\*Token Reward:\*\*\s*([\d,]+)/i);
            const budget = compensationMatch ? parseInt(compensationMatch[1].replace(/,/g, ''), 10) : 0;

            if (budget === 0) {
                throw new Error('Could not parse Token Reward from issue body');
            }

            // 2. Parse Category/Stage
            const categoryMatch = issue.body.match(/\*\*Category:\*\*\s*(.*)/i);
            const category = categoryMatch ? categoryMatch[1].trim() : 'General';

            const prisma = getPrisma();

            // 3. Find or Create Project (based on Repo Name)
            // For now, we simple-match or create a new "Imported Project"
            let project = await prisma.projects.findFirst({
                where: { name: repoName } // Simple match
            });

            if (!project) {
                project = await prisma.projects.create({
                    data: {
                        name: repoName,
                        description: `Imported from GitHub: ${repoOwner}/${repoName}`,
                        owner_user_id: this.userId,
                        created_by: this.userId,
                        status: 'active'
                    }
                });
            }

            // 4. Create Pipeline Stage
            const stage = await prisma.pipeline_stages.create({
                data: {
                    project_id: project.id,
                    stage_name: issue.title,
                    stage_order: 99, // Append to end
                    status: 'not_started',
                    description: `Imported form Issue #${issueNumber}`
                }
            });

            // 5. Create Fully Funded Round (Mock Funding)
            const round = await prisma.fundraising_rounds.create({
                data: {
                    stage_id: stage.id,
                    target_amount: budget,
                    raised_amount: budget,
                    status: 'fully_funded',
                    min_investment: 0,
                    max_investment: budget,
                }
            });

            // 6. Create Contract Record
            const contractContent = `
# Imported Contract: ${issue.title}
**Added from:** GitHub Issue #${issueNumber}
**Repo:** ${repoOwner}/${repoName}
**Budget:** ${budget} Tokens

## Original Requirements
${issue.body}

**Signed (Automated):** b0ase Protocol (GitHub Import Agent)
      `.trim();

            const contract = await prisma.contracts.create({
                data: {
                    title: `GitHub Issue #${issueNumber}: ${issue.title}`,
                    content: contractContent,
                    status: 'draft',
                    type: 'github_import'
                }
            });

            // 7. Create Marketplace Tender
            const tender = await prisma.marketplace_tenders.create({
                data: {
                    stage_id: stage.id,
                    budget_max: budget,
                    status: 'open',
                    contract_id: contract.id,
                    // We could link back to the issue URL here if we had a field
                }
            });

            // 8. Inscribe on BSV (Fire and Forget)
            // TODO: Call agent inscription service here

            return {
                success: true,
                tenderId: tender.id,
                contractId: contract.id
            };

        } catch (error: any) {
            console.error('Import failed:', error);
            return { success: false, error: error.message };
        }
    }
}
