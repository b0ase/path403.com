import { NextRequest, NextResponse } from 'next/server';
import {
  BOASE_TOKEN,
  PRICING_TIERS,
  calculatePrice,
  convertUsdToCrypto,
  getTreasuryBalance,
  getCapTable,
  executeTreasurySale,
  PAYMENT_METHODS
} from '@/lib/treasury';
import { createClient } from '@/lib/supabase/server';
import {
  verifyPayment,
  createPendingPurchase,
  toSmallestUnit,
  generatePurchaseId
} from '@/lib/payment-verification';

/**
 * GET /api/treasury
 *
 * Get treasury info, balance, pricing, and cap table
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    // Get cap table
    if (action === 'captable') {
      const tokenId = searchParams.get('tokenId') || BOASE_TOKEN.tokenId;
      const capTable = await getCapTable(tokenId);
      return NextResponse.json({
        tokenId,
        capTable,
        totalSupply: BOASE_TOKEN.totalSupply
      });
    }

    // Get price quote
    if (action === 'quote') {
      const amount = parseInt(searchParams.get('amount') || '1000');
      const currency = (searchParams.get('currency') || 'BSV') as 'BSV' | 'ETH' | 'SOL';

      const pricing = calculatePrice(amount);
      const cryptoAmount = await convertUsdToCrypto(pricing.priceUsd, currency);

      return NextResponse.json({
        tokenAmount: amount,
        priceUsd: pricing.priceUsd,
        pricePerToken: pricing.pricePerToken,
        discount: pricing.tier.discount,
        savings: pricing.savings,
        payment: {
          currency,
          amount: cryptoAmount,
          address: PAYMENT_METHODS.find(p => p.currency === currency)?.address
        }
      });
    }

    // Default: Get treasury overview
    const balance = await getTreasuryBalance();
    const capTable = await getCapTable(BOASE_TOKEN.tokenId);

    return NextResponse.json({
      token: {
        ...BOASE_TOKEN,
        treasuryBalance: balance?.tokenBalance || 0,
        bsvBalance: balance?.bsvBalance || 0
      },
      pricing: {
        tiers: PRICING_TIERS,
        paymentMethods: PAYMENT_METHODS.map(p => ({
          method: p.method,
          currency: p.currency,
          minAmount: p.minAmount
        }))
      },
      capTable: capTable.slice(0, 10), // Top 10 holders
      circulatingSupply: BOASE_TOKEN.totalSupply - (balance?.tokenBalance || 0)
    });

  } catch (error) {
    console.error('[treasury] GET error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal error'
    }, { status: 500 });
  }
}

/**
 * POST /api/treasury
 *
 * Handle treasury purchases with payment verification
 *
 * Actions:
 * - initiate: Create a pending purchase, return payment instructions
 * - verify: Verify payment and execute token transfer
 * - status: Check purchase status
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check for wallet cookies as fallback auth
    const walletAddress = req.cookies.get('b0ase_wallet_address')?.value;

    if (!user && !walletAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    // INITIATE: Create pending purchase
    if (action === 'initiate' || action === 'purchase') {
      const { tokenAmount, recipientAddress, currency = 'BSV' } = body;

      // Validate request
      if (!tokenAmount || !recipientAddress) {
        return NextResponse.json({
          error: 'tokenAmount and recipientAddress required'
        }, { status: 400 });
      }

      if (tokenAmount < 1000) {
        return NextResponse.json({
          error: 'Minimum purchase is 1000 tokens'
        }, { status: 400 });
      }

      // Check treasury balance
      const balance = await getTreasuryBalance();
      if (!balance || balance.tokenBalance < tokenAmount) {
        return NextResponse.json({
          error: 'Insufficient tokens in treasury'
        }, { status: 400 });
      }

      // Calculate price
      const pricing = calculatePrice(tokenAmount);
      const cryptoAmount = await convertUsdToCrypto(pricing.priceUsd, currency);
      const paymentMethod = PAYMENT_METHODS.find(p => p.currency === currency);

      if (!paymentMethod) {
        return NextResponse.json({
          error: `Payment method ${currency} not supported`
        }, { status: 400 });
      }

      // Create pending purchase record
      const purchaseId = generatePurchaseId();
      const expectedAmountSmallest = toSmallestUnit(cryptoAmount, currency);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

      // Store in database
      const { error: insertError } = await supabase
        .from('treasury_purchases')
        .insert({
          id: purchaseId,
          token_amount: tokenAmount,
          recipient_address: recipientAddress,
          payment_currency: currency,
          expected_amount: expectedAmountSmallest,
          payment_address: paymentMethod.address,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
          price_usd: pricing.priceUsd,
          price_per_token: pricing.pricePerToken,
          user_id: user?.id || null
        });

      if (insertError) {
        console.error('[treasury] Insert error:', insertError);
        // Continue even if DB insert fails - return instructions
      }

      // Log the initiation
      await supabase.from('treasury_audit_log').insert({
        purchase_id: purchaseId,
        action: 'initiated',
        details: { tokenAmount, currency, priceUsd: pricing.priceUsd }
      });

      return NextResponse.json({
        status: 'awaiting_payment',
        purchaseId,
        instructions: {
          amount: cryptoAmount,
          amountSmallest: expectedAmountSmallest,
          currency,
          address: paymentMethod.address,
          memo: `BOASE_${purchaseId}`,
          priceUsd: pricing.priceUsd,
          expiresAt: expiresAt.toISOString()
        },
        message: `Send ${cryptoAmount.toFixed(8)} ${currency} to complete purchase`
      });
    }

    // VERIFY: Verify payment and execute transfer
    if (action === 'verify') {
      const { purchaseId, paymentTxid } = body;

      if (!purchaseId || !paymentTxid) {
        return NextResponse.json({
          error: 'purchaseId and paymentTxid required'
        }, { status: 400 });
      }

      // Get pending purchase
      const { data: purchase, error: fetchError } = await supabase
        .from('treasury_purchases')
        .select('*')
        .eq('id', purchaseId)
        .single();

      if (fetchError || !purchase) {
        return NextResponse.json({
          error: 'Purchase not found'
        }, { status: 404 });
      }

      // Check status
      if (purchase.status === 'completed') {
        return NextResponse.json({
          status: 'completed',
          message: 'Purchase already completed',
          transferTxid: purchase.transfer_txid
        });
      }

      if (purchase.status === 'expired') {
        return NextResponse.json({
          error: 'Purchase expired'
        }, { status: 400 });
      }

      // Check if expired
      if (new Date(purchase.expires_at) < new Date()) {
        await supabase
          .from('treasury_purchases')
          .update({ status: 'expired' })
          .eq('id', purchaseId);

        return NextResponse.json({
          error: 'Purchase expired'
        }, { status: 400 });
      }

      // Update status to verifying
      await supabase
        .from('treasury_purchases')
        .update({ status: 'verifying', payment_txid: paymentTxid })
        .eq('id', purchaseId);

      // Verify payment on-chain
      const verification = await verifyPayment(
        paymentTxid,
        purchase.payment_currency as 'BSV' | 'ETH' | 'SOL',
        purchase.payment_address,
        Number(purchase.expected_amount)
      );

      // Log verification attempt
      await supabase.from('treasury_audit_log').insert({
        purchase_id: purchaseId,
        action: 'verification_attempt',
        details: {
          txid: paymentTxid,
          verified: verification.verified,
          confirmations: verification.confirmations,
          error: verification.error
        }
      });

      if (!verification.verified) {
        await supabase
          .from('treasury_purchases')
          .update({
            status: 'pending',
            error_message: verification.error,
            confirmations: verification.confirmations
          })
          .eq('id', purchaseId);

        return NextResponse.json({
          status: 'verification_failed',
          error: verification.error,
          confirmations: verification.confirmations,
          message: 'Payment not yet verified. Try again in a few minutes.'
        }, { status: 400 });
      }

      // Payment verified! Update purchase record
      await supabase
        .from('treasury_purchases')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          confirmations: verification.confirmations,
          verified_amount: verification.amount,
          sender_address: verification.senderAddress
        })
        .eq('id', purchaseId);

      // Execute the token transfer
      const result = await executeTreasurySale(
        purchase.recipient_address,
        purchase.token_amount
      );

      if (!result.success) {
        await supabase
          .from('treasury_purchases')
          .update({
            status: 'failed',
            error_message: result.error
          })
          .eq('id', purchaseId);

        await supabase.from('treasury_audit_log').insert({
          purchase_id: purchaseId,
          action: 'transfer_failed',
          details: { error: result.error }
        });

        return NextResponse.json({
          error: result.error || 'Token transfer failed'
        }, { status: 500 });
      }

      // Success! Update purchase as completed
      await supabase
        .from('treasury_purchases')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          transfer_txid: result.txid
        })
        .eq('id', purchaseId);

      await supabase.from('treasury_audit_log').insert({
        purchase_id: purchaseId,
        action: 'completed',
        details: { transferTxid: result.txid, tokenAmount: purchase.token_amount }
      });

      return NextResponse.json({
        success: true,
        status: 'completed',
        purchaseId,
        transferTxid: result.txid,
        tokenAmount: purchase.token_amount,
        recipientAddress: purchase.recipient_address,
        message: `Successfully transferred ${purchase.token_amount.toLocaleString()} $BOASE tokens`
      });
    }

    // STATUS: Check purchase status
    if (action === 'status') {
      const { purchaseId } = body;

      if (!purchaseId) {
        return NextResponse.json({
          error: 'purchaseId required'
        }, { status: 400 });
      }

      const { data: purchase, error } = await supabase
        .from('treasury_purchases')
        .select('*')
        .eq('id', purchaseId)
        .single();

      if (error || !purchase) {
        return NextResponse.json({
          error: 'Purchase not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        purchaseId: purchase.id,
        status: purchase.status,
        tokenAmount: purchase.token_amount,
        recipientAddress: purchase.recipient_address,
        paymentCurrency: purchase.payment_currency,
        expectedAmount: purchase.expected_amount,
        paymentAddress: purchase.payment_address,
        paymentTxid: purchase.payment_txid,
        transferTxid: purchase.transfer_txid,
        confirmations: purchase.confirmations,
        expiresAt: purchase.expires_at,
        createdAt: purchase.created_at,
        completedAt: purchase.completed_at,
        error: purchase.error_message
      });
    }

    return NextResponse.json({
      error: 'Invalid action. Use "initiate", "verify", or "status"'
    }, { status: 400 });

  } catch (error) {
    console.error('[treasury] POST error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal error'
    }, { status: 500 });
  }
}
