
import { NextRequest, NextResponse } from 'next/server';
import { handcashService } from '@/lib/handcash-service';
import { getPrisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { sessionId, amount, description } = await req.json();
        const authToken = req.cookies.get('b0ase_auth_token')?.value;

        if (!authToken) {
            return NextResponse.json({ error: 'Unauthorized: HandCash not connected' }, { status: 401 });
        }

        if (!sessionId || !amount) {
            return NextResponse.json({ error: 'Missing sessionId or amount' }, { status: 400 });
        }

        // Destination for Setup Fee - platform address or handle
        // Using the BSV_ADDRESS from env as target if possible, 
        // but HandCash sendPayment usually expects a handle or destination object.
        const destination = "b0ase"; // Typical platform handle

        console.log(`Processing HandCash payment: ${amount} to ${destination} for session ${sessionId}`);

        // Initiating payment from user's account
        const paymentResult = await handcashService.sendPayment(authToken, {
            destination: destination,
            amount: amount,
            currency: 'GBP', // User mentioned £999
            description: description || `Kintsugi Setup Fee - Session ${sessionId}`
        });

        // Log payment in DB
        const prisma = getPrisma();
        await prisma.kintsugiSession.update({
            where: { sessionId },
            data: {
                // We don't have a direct 'paid' field in the analyzed schema, 
                // but we can store it in context or lastTxid
                lastTxid: paymentResult.transactionId,
                context: {
                    upsert: {
                        paymentStatus: 'paid',
                        paymentTxid: paymentResult.transactionId,
                        paidAmount: amount,
                        paidAt: new Date().toISOString()
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            txid: paymentResult.transactionId,
            message: 'Payment successful'
        });

    } catch (error: any) {
        console.error('HandCash Payment Error:', error);
        return NextResponse.json({
            error: error.message || 'Payment failed',
            details: error.response?.data || error
        }, { status: 500 });
    }
}
