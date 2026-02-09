import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { handCashConnect } from '@/lib/handcash';

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('b0ase_auth_token')?.value;

        if (!authToken) {
            return NextResponse.json({ 
                error: 'Not authenticated',
                suggestion: 'Sign in with HandCash'
            }, { status: 401 });
        }

        // Get theme/project from request body if available, fallback to 'tech'
        let theme = 'tech';
        try {
            const body = await request.json();
            if (body.theme) theme = body.theme;
        } catch (e) {
            // No body or invalid JSON, ignore
        }

        const account = handCashConnect.getAccountFromAuthToken(authToken);
        
        // Define payment parameters
        // The destination should be the House account or a specific platform address
        // For now, we'll try to pay the "App" (which usually means the App ID owner)
        const paymentParameters = {
            payments: [
                {
                    destination: 'b0ase', // Replace with your house handle or use a config
                    currencyCode: 'USD' as any,
                    sendAmount: 0.01,
                },
            ],
            attachment: {
                theme: theme,
                action: 'button_press'
            } as any,
            description: `B0ase Execute: ${theme.toUpperCase()}`,
        };

        const paymentResult = await account.wallet.pay(paymentParameters);
        
        console.log('💰 HandCash Payment Success:', paymentResult.transactionId);

        return NextResponse.json({
            success: true,
            transactionId: paymentResult.transactionId,
            theme: theme,
            message: 'Payment initiated'
        });

    } catch (error: any) {
        console.error('[press] Error:', error);
        
        // Handle specific HandCash errors
        if (error.message?.includes('insufficient')) {
            return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
        }

        return NextResponse.json({ 
            error: error.message || 'Payment failed',
            details: error.toString()
        }, { status: 500 });
    }
}
