import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { handcashService } from '@/lib/handcash-service';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    const prisma = getPrisma();
    const cookieStore = await cookies();
    const authToken = cookieStore.get('b0ase_auth_token')?.value;

    if (!authToken) {
        return NextResponse.json({ error: 'Unauthorized: Please login with HandCash first.' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { repoUrl, amount, currency } = body; // amount in USD (number)

        if (!repoUrl || !amount) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // 1. Find the Repository
        // Normalize URL roughly
        const cleanUrl = repoUrl.replace(/\.git$/, '').replace(/\/$/, '');

        const repo = await prisma.tokenized_repositories.findFirst({
            where: { github_url: cleanUrl },
            include: {
                upstream_beneficiaries: true
            }
        });

        if (!repo) {
            return NextResponse.json({ error: 'Repository not indexed on b0ase.' }, { status: 404 });
        }

        const repoOwnerWallet = (repo.manifest_data as any)?.economics?.treasury_wallet;

        if (!repoOwnerWallet) {
            return NextResponse.json({ error: 'Repository has no treasury wallet configured.' }, { status: 400 });
        }

        // 2. Calculate Splits
        const payments: any[] = [];
        let distributedAmount = 0;
        const totalAmount = Number(amount);

        // Process Beneficiaries
        if (repo.upstream_enabled && repo.upstream_beneficiaries.length > 0) {
            for (const ben of repo.upstream_beneficiaries) {
                // Find upstream repo wallet
                // We search by exact URL match for now
                const upstreamRepo = await prisma.tokenized_repositories.findFirst({
                    where: { github_url: ben.target_repo_url || '' }
                });

                if (upstreamRepo) {
                    const upstreamWallet = (upstreamRepo.manifest_data as any)?.economics?.treasury_wallet;
                    if (upstreamWallet) {
                        const share = totalAmount * (Number(ben.allocation_percent) / 100);
                        if (share > 0.01) { // Min threshold 1 cent
                            payments.push({
                                destination: upstreamWallet, // HandCash handle or BSV Address
                                amount: share,
                                currencyCode: currency || 'USD'
                            });
                            distributedAmount += share;
                        }
                    }
                }
                // If upstream not found, we skip (reverting funds to main owner effectively)
                // TODO: Store in escrow?
            }
        }

        // 3. Add Main Payment (Remainder)
        const remainder = totalAmount - distributedAmount;
        if (remainder > 0) {
            payments.push({
                destination: repoOwnerWallet,
                amount: remainder,
                currencyCode: currency || 'USD'
            });
        }

        // 4. Validate Logic
        if (payments.length === 0) {
            return NextResponse.json({ error: 'No valid payment destinations resolved.' }, { status: 400 });
        }

        // 5. Execute Payment via HandCash Connect
        const paymentResult = await handcashService.sendMultiPayment(authToken, {
            description: `Contribution to ${repo.github_full_name}`,
            appAction: 'CONTRIBUTION',
            payments: payments
        });

        return NextResponse.json({
            success: true,
            transactionId: paymentResult.transactionId,
            splits: payments
        });

    } catch (error: any) {
        console.error('Payment Error:', error);
        return NextResponse.json({ error: error.message || 'Payment execution failed' }, { status: 500 });
    }
}
