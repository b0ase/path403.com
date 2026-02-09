import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createBSVRepoToken } from '@/lib/bsv/create-token';

export const dynamic = 'force-dynamic';

/**
 * POST /api/repos/[repoId]/tokenize
 * 
 * Tokenize a claimed GitHub repository on the BSV blockchain (1Sat Ordinals).
 * 
 * Body:
 * - tokenSymbol: 3-6 uppercase letters (e.g., "REPO")
 * - tokenSupply: Total supply to mint (default 1M)
 * - handcashHandle: Optional HandCash handle for receiving funds
 * - yoursAddress: Optional Yours wallet address for receiving funds
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ repoId: string }> }
) {
    try {
        const { repoId } = await params;
        const body = await request.json();
        const {
            tokenSymbol,
            tokenSupply = 1000000,
            handcashHandle,
            yoursAddress
        } = body;

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Get repo from database to verify it exists and is claimed by this user
        const { data: repo, error: repoError } = await supabase
            .from('tokenized_repositories')
            .select('*')
            .eq('github_repo_id', repoId)
            .eq('unified_user_id', user.id)
            .single();

        if (repoError || !repo) {
            console.error('Repo check error:', repoError);
            return NextResponse.json({
                error: 'Repository not found or you do not have permission to tokenize it. Make sure you claim it first.'
            }, { status: 404 });
        }

        if (repo.is_tokenized) {
            return NextResponse.json({
                error: 'Repository already tokenized',
                tokenSymbol: repo.token_symbol,
                contractAddress: repo.token_contract_address
            }, { status: 409 });
        }

        // 2. Validate token symbol (3-6 uppercase letters)
        if (!tokenSymbol || !/^[A-Z]{3,6}$/.test(tokenSymbol)) {
            return NextResponse.json({
                error: 'Invalid token symbol. Must be 3-6 uppercase letters.'
            }, { status: 400 });
        }

        // 3. Check if symbol is already taken in our system
        const { data: existingSymbol } = await supabase
            .from('tokenized_repositories')
            .select('id')
            .eq('token_symbol', tokenSymbol)
            .single();

        if (existingSymbol) {
            return NextResponse.json({
                error: `Token symbol ${tokenSymbol} is already taken by another project.`
            }, { status: 409 });
        }

        // 4. Deploy the token on BSV blockchain
        console.log(`🚀 Tokenizing repo ${repo.github_full_name} with symbol ${tokenSymbol}...`);

        try {
            const deployResult = await createBSVRepoToken({
                symbol: tokenSymbol,
                totalSupply: tokenSupply,
                description: repo.github_description,
                repoUrl: repo.github_url
            });

            console.log(`✅ Token deployed! ID: ${deployResult.tokenId}, TXID: ${deployResult.txid}`);

            // 5. Update database with tokenization results
            const { data: updated, error: updateError } = await supabase
                .from('tokenized_repositories')
                .update({
                    is_tokenized: true,
                    token_symbol: tokenSymbol,
                    token_chain: 'BSV',
                    token_contract_address: deployResult.tokenId,
                    token_supply: tokenSupply,
                    handcash_handle: handcashHandle,
                    yours_wallet_address: yoursAddress,
                    tokenized_at: new Date().toISOString(),
                    last_synced_at: new Date().toISOString()
                })
                .eq('github_repo_id', repoId)
                .select()
                .single();

            if (updateError) {
                console.error('Error updating record after tokenization:', updateError);
                // Note: The token is already on-chain, so this is a sync issue
                return NextResponse.json({
                    success: true,
                    token: deployResult,
                    warning: 'Token deployed but failed to update local record. Please contact support.',
                    details: updateError.message
                });
            }

            return NextResponse.json({
                success: true,
                repo: {
                    id: updated.id,
                    tokenSymbol: updated.token_symbol,
                    contractAddress: updated.token_contract_address,
                    txid: deployResult.txid,
                    explorer: `https://whatsonchain.com/tx/${deployResult.txid}`
                }
            });

        } catch (deployError) {
            console.error('Token deployment failed:', deployError);
            return NextResponse.json({
                error: 'Failed to deploy token on blockchain',
                details: deployError instanceof Error ? deployError.message : String(deployError)
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Error in tokenize repo:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
