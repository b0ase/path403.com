import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { handcashService } from '@/lib/handcash-service';
import { createClient } from '@/lib/supabase/server';

// Platform destination for payments
const PLATFORM_HANDLE = process.env.PLATFORM_HANDCASH_HANDLE || 'b0ase';

export async function POST(req: NextRequest) {
    try {
        const { priceUSD = 0.01, tokenReward = 1 } = await req.json();

        // Get HandCash auth token from cookie
        const cookieStore = await cookies();
        const authToken = cookieStore.get('b0ase_handcash_token')?.value;

        if (!authToken) {
            return NextResponse.json(
                { error: 'HandCash wallet not connected', code: 'NO_WALLET' },
                { status: 401 }
            );
        }

        // Get user profile
        let userProfile;
        try {
            userProfile = await handcashService.getUserProfile(authToken);
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid HandCash session. Please reconnect.', code: 'INVALID_SESSION' },
                { status: 401 }
            );
        }

        const handle = userProfile.handle;

        // Process micropayment: User pays to platform
        let paymentResult;
        try {
            paymentResult = await handcashService.sendPayment(authToken, {
                destination: PLATFORM_HANDLE,
                amount: priceUSD,
                currency: 'USD',
                description: `b0ase.com micropayment - ${tokenReward} $BOASE`,
            });
        } catch (error: any) {
            // Check for insufficient funds
            if (error.message?.toLowerCase().includes('insufficient')) {
                return NextResponse.json(
                    { error: 'Insufficient funds', code: 'INSUFFICIENT_FUNDS' },
                    { status: 402 }
                );
            }
            console.error('Micropayment failed:', error);
            return NextResponse.json(
                { error: error.message || 'Payment failed', code: 'PAYMENT_FAILED' },
                { status: 400 }
            );
        }

        // Credit $BOASE tokens to user's account
        try {
            const supabase = await createClient();

            // Record the transaction
            await supabase.from('micropay_transactions').insert({
                handle,
                amount_usd: priceUSD,
                tokens_earned: tokenReward,
                transaction_id: paymentResult.transactionId,
                created_at: new Date().toISOString(),
            });

            // Update or create user's token balance
            const { data: existing } = await supabase
                .from('user_token_balances')
                .select('balance')
                .eq('handle', handle)
                .eq('token_symbol', 'BOASE')
                .single();

            if (existing) {
                await supabase
                    .from('user_token_balances')
                    .update({
                        balance: existing.balance + tokenReward,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('handle', handle)
                    .eq('token_symbol', 'BOASE');
            } else {
                await supabase
                    .from('user_token_balances')
                    .insert({
                        handle,
                        token_symbol: 'BOASE',
                        balance: tokenReward,
                        staked: 0,
                        created_at: new Date().toISOString(),
                    });
            }
        } catch (dbError) {
            // Log but don't fail - payment already processed
            console.error('Failed to record micropayment:', dbError);
        }

        return NextResponse.json({
            success: true,
            handle,
            tokensEarned: tokenReward,
            transactionId: paymentResult.transactionId,
            newBalance: null, // Could fetch updated balance here
        });
    } catch (error: any) {
        console.error('Micropayment error:', error);
        return NextResponse.json(
            { error: 'Payment processing failed', code: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
}

// Get user's current $BOASE balance
export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('b0ase_handcash_token')?.value;

        if (!authToken) {
            return NextResponse.json(
                { error: 'Not authenticated', code: 'NO_WALLET' },
                { status: 401 }
            );
        }

        // Get user profile
        let userProfile;
        try {
            userProfile = await handcashService.getUserProfile(authToken);
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid session', code: 'INVALID_SESSION' },
                { status: 401 }
            );
        }

        const handle = userProfile.handle;

        // Get balance
        const supabase = await createClient();
        const { data: balance } = await supabase
            .from('user_token_balances')
            .select('balance, staked')
            .eq('handle', handle)
            .eq('token_symbol', 'BOASE')
            .single();

        return NextResponse.json({
            handle,
            balance: balance?.balance || 0,
            staked: balance?.staked || 0,
            available: (balance?.balance || 0) - (balance?.staked || 0),
        });
    } catch (error: any) {
        console.error('Balance check error:', error);
        return NextResponse.json(
            { error: 'Failed to get balance' },
            { status: 500 }
        );
    }
}
