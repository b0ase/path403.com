import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPrisma } from '@/lib/prisma';
import { getContractTitle } from '@/lib/contract-titles';
import { inscribeAndSaveAgentOutput } from '@/lib/agent-inscription';

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // Corrected signature
) {
    const { id: roundId } = await context.params;
    const body = await request.json();
    const { amount } = body; // Assume mock payment

    const prisma = getPrisma();
    const supabase = await createClient();

    try {
        // 1. Auth Check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Transaction
        const result = await prisma.$transaction(async (tx) => {
            // Fetch Round
            const round = await tx.fundraising_rounds.findUnique({
                where: { id: roundId },
                include: {
                    pipeline_stages: {
                        include: {
                            projects: true
                        }
                    }
                }
            });

            if (!round) throw new Error('Round not found');
            if (round.status !== 'open') throw new Error('Round not open for funding');

            // 3. Create/Get Token
            // Logic: Projects don't have company_id directly. We need to find a company owned by the user
            // or create a default one for this project.

            let company = await tx.companies.findFirst({
                where: { user_id: round.pipeline_stages.projects.owner_user_id || round.pipeline_stages.projects.created_by }
            });

            if (!company) {
                // Create a default company for the project owner
                const ownerId = round.pipeline_stages.projects.owner_user_id || round.pipeline_stages.projects.created_by;
                if (!ownerId) throw new Error('Project has no owner');

                company = await tx.companies.create({
                    data: {
                        name: `${round.pipeline_stages.projects.name} Ltd`, // Mock Company Name
                        user_id: ownerId,
                        status: 'active'
                    }
                });
            }

            let token = await tx.company_tokens.findFirst({
                where: { company_id: company.id }
            });

            if (!token) {
                // Determine token name
                const symbol = '$' + round.pipeline_stages.projects.name.substring(0, 3).toUpperCase();
                token = await tx.company_tokens.create({
                    data: {
                        company_id: company.id,
                        name: round.pipeline_stages.projects.name,
                        symbol: symbol,
                        total_supply: 1000000,
                    }
                });
            }

            // 4. Create Investor Allocation
            const allocation = await tx.investor_allocations.create({
                data: {
                    round_id: roundId,
                    investor_user_id: user.id,
                    amount: amount,
                    status: 'paid' // Mock: Immediately paid
                }
            });

            // 5. Update Round Progress
            const newRaised = (Number(round.raised_amount) || 0) + Number(amount);
            const target = Number(round.target_amount);

            let updatedRound = await tx.fundraising_rounds.update({
                where: { id: roundId },
                data: { raised_amount: newRaised }
            });

            // 6. Check if Fully Funded
            if (newRaised >= target) {
                updatedRound = await tx.fundraising_rounds.update({
                    where: { id: roundId },
                    data: { status: 'fully_funded' }
                });

                // 7. Trigger Logic: Automatic Contract Generation
                const contractTitle = getContractTitle(round.pipeline_stages.stage_name);
                const contractContent = `
# Service Agreement: ${contractTitle}

**Date:** ${new Date().toISOString()}
**Project:** ${round.pipeline_stages.projects.name}
**Budget:** $${target}

## Scope of Work
The Developer agrees to deliver the "${round.pipeline_stages.stage_name}" stage.

## Terms
1. Payment held in escrow.
2. 50% released upon verified milestone completion.
3. 50% released upon final delivery.

**Signed (Automated):** b0ase Protocol
                `.trim();

                // Save Contract DB
                const contract = await tx.contracts.create({
                    data: {
                        title: `Agreement: ${round.pipeline_stages.stage_name}`,
                        content: contractContent,
                        status: 'draft', // Draft until Developer signs
                        type: 'service_agreement'
                    }
                });

                // 8. Create Market Tender Linked to Contract
                await tx.marketplace_tenders.create({
                    data: {
                        stage_id: round.stage_id,
                        budget_max: target,
                        status: 'open',
                        contract_id: contract.id
                    }
                });

                // 9. Inscribe Contract (Async - handled outside TX usually, but for reliability we do it here linearly or via job. 
                // Since this is a Proof of Concept, we will try to fire-and-forget or await if fast enough. 
                // Given the transaction wrapper, we MUST be careful. 
                // ideally we queue a job. For now, we'll log it.)
                // Note: Real implementation would force this off-chain or use a "ContractAgent".
                // We will add a TODO for the Agent inscription part to be triggered by a "ContractAgent".

                /* 
                // Inscription Logic (Commented out to prevent TX timeout, moving to separate call or background job)
                await inscribeAndSaveAgentOutput({
                     agentId: 'system-contract-agent',
                     agentName: 'Contract Agent',
                     content: contractContent,
                     contentType: 'text/markdown',
                     metadata: { contractId: contract.id }
                });
                */

                // 10. Issue Equity (Cap Table)
                await tx.cap_table_entries.create({
                    data: {
                        token_id: token.id,
                        holder_name: user.email || 'Investor',
                        holder_user_id: user.id,
                        shares_held: Math.floor((Number(amount) / 100)),
                        notes: `Seed Round - ${round.pipeline_stages.stage_name}`
                    }
                });
            }

            return { updatedRound, allocation };
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Error funding round:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
