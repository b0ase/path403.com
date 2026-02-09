import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateHolder, createPurchase, processPurchaseImmediate, getTokenStats, PAYMENT_ADDRESS } from '@/lib/store';
import { getInstance, Connect } from '@handcash/sdk';
import type { Client as HandcashClient } from '@handcash/sdk/dist/client/client/types.js';
import { executeTransfer } from '@/lib/bsv20-transfer';
import { supabase, isDbConnected } from '@/lib/supabase';

// sqrt_decay pricing: price = BASE / sqrt(remaining + 1)
// Price INCREASES as treasury depletes - rewards early buyers
const BASE_PRICE_SATS = 223_610; // ~10 sats/token at 500M treasury, 1 BSV = 1% of supply

function calculateSqrtDecayPrice(treasuryRemaining: number): number {
  // price = base / sqrt(remaining + 1)
  // When 500M remain: price = 100M / sqrt(500M) ≈ 141 sats (cheap!)
  // When 1 remains: price = 100M / sqrt(2) ≈ 70M sats (expensive!)
  return Math.ceil(BASE_PRICE_SATS / Math.sqrt(treasuryRemaining + 1));
}

function calculateTotalCost(treasuryRemaining: number, amount: number): { totalSats: number; avgPrice: number } {
  // For bulk purchases, integrate the price curve
  // Each token purchased reduces treasury, increasing price for next
  let totalSats = 0;
  for (let i = 0; i < amount; i++) {
    // Treasury shrinks by 1 for each token bought
    totalSats += calculateSqrtDecayPrice(treasuryRemaining - i);
  }
  return {
    totalSats,
    avgPrice: Math.ceil(totalSats / amount),
  };
}

// Reverse calculation: given spend amount, calculate how many tokens you get
// Buys cheapest tokens first (highest treasury remaining = lowest price)
function calculateTokensForSpend(treasuryRemaining: number, spendSats: number): {
  tokenCount: number;
  totalCost: number;
  avgPrice: number;
  remainingSats: number;
} {
  let tokenCount = 0;
  let totalCost = 0;

  while (treasuryRemaining - tokenCount > 0) {
    const nextTokenPrice = calculateSqrtDecayPrice(treasuryRemaining - tokenCount);
    if (totalCost + nextTokenPrice > spendSats) {
      break; // Can't afford the next token
    }
    totalCost += nextTokenPrice;
    tokenCount++;
  }

  return {
    tokenCount,
    totalCost,
    avgPrice: tokenCount > 0 ? Math.ceil(totalCost / tokenCount) : 0,
    remainingSats: spendSats - totalCost,
  };
}

export async function POST(request: NextRequest) {
  try {
    const address = request.headers.get('x-wallet-address');
    const provider = request.headers.get('x-wallet-provider') as 'yours' | 'handcash';
    const handle = request.headers.get('x-wallet-handle');

    if (!provider) {
      return NextResponse.json({ error: 'Wallet not connected' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, spendSats } = body;

    // Get current treasury state
    const stats = await getTokenStats();
    const treasuryRemaining = stats.treasuryBalance;
    const currentPrice = calculateSqrtDecayPrice(treasuryRemaining);

    let tokenAmount: number;
    let totalSats: number;
    let avgPrice: number;

    if (spendSats && spendSats > 0) {
      // New mode: user specifies how much to spend, we calculate tokens
      const result = calculateTokensForSpend(treasuryRemaining, spendSats);
      if (result.tokenCount === 0) {
        return NextResponse.json({
          error: 'Insufficient funds',
          details: `Minimum purchase at current price is ${currentPrice.toLocaleString()} sats for 1 token`,
          currentPrice,
        }, { status: 400 });
      }
      tokenAmount = result.tokenCount;
      totalSats = result.totalCost;
      avgPrice = result.avgPrice;
    } else if (amount && amount > 0) {
      // Old mode: user specifies token count, we calculate cost
      tokenAmount = amount;
      const costResult = calculateTotalCost(treasuryRemaining, amount);
      totalSats = costResult.totalSats;
      avgPrice = costResult.avgPrice;
    } else {
      return NextResponse.json({ error: 'Specify either amount (tokens) or spendSats' }, { status: 400 });
    }

    // Check treasury has enough tokens
    if (stats.treasuryBalance < tokenAmount) {
      return NextResponse.json({ error: 'Insufficient tokens available' }, { status: 400 });
    }

    // Get or create holder
    const holder = await getOrCreateHolder(
      address || '',
      provider,
      address || undefined,
      handle || undefined
    );

    // For HandCash, REQUIRE derived ordinals address before purchase
    let ordinalsAddress: string | null = null;
    if (provider === 'handcash' && handle && isDbConnected() && supabase) {
      const { data: wallet } = await supabase
        .from('user_wallets')
        .select('address')
        .ilike('handle', handle)
        .single();

      if (wallet) {
        ordinalsAddress = wallet.address;
      }
    }

    // REQUIRE address derivation before purchase
    if (provider === 'handcash' && !ordinalsAddress) {
      return NextResponse.json({
        error: 'Address derivation required',
        code: 'NO_ORDINALS_ADDRESS',
        details: 'You must derive your on-chain address before purchasing tokens.',
        action: 'Go to Account page and click "Derive My Address" first.',
        redirectTo: '/account',
      }, { status: 400 });
    }

    if (provider === 'yours') {
      // For Yours Wallet, create pending purchase and return payment details
      const purchase = await createPurchase(holder.id, tokenAmount, avgPrice);

      return NextResponse.json({
        purchaseId: purchase.id,
        amount: tokenAmount,
        pricingModel: 'sqrt_decay',
        currentPrice,
        avgPrice,
        totalSats,
        treasuryRemaining,
        paymentAddress: PAYMENT_ADDRESS,
        status: 'pending_payment',
      });
    } else if (provider === 'handcash') {
      // For HandCash, we need to initiate payment using the SDK
      const authToken = request.cookies.get('hc_token')?.value;

      if (!authToken) {
        return NextResponse.json({ error: 'HandCash session expired, please reconnect' }, { status: 401 });
      }

      const appId = process.env.HANDCASH_APP_ID?.trim();
      const appSecret = process.env.HANDCASH_APP_SECRET?.trim();

      if (!appId || !appSecret) {
        return NextResponse.json({ error: 'HandCash not configured' }, { status: 500 });
      }

      // Initialize HandCash SDK and make payment
      const sdk = getInstance({ appId, appSecret });
      const client = sdk.getAccountClient(authToken) as HandcashClient;

      // Convert sats to USD for HandCash payment
      // BSV ~= $17, so sats to USD = sats * 17 / 100_000_000
      // Round to 2 decimal places (cents) for clean payment
      const BSV_PRICE_USD = 17;
      const usdAmount = Math.max(0.01, Math.round((totalSats * BSV_PRICE_USD) / 1_000_000) / 100);

      try {
        const paymentResult = await Connect.pay({
          client,
          body: {
            instrumentCurrencyCode: 'BSV',
            denominationCurrencyCode: 'USD',
            receivers: [{
              sendAmount: usdAmount,
              destination: PAYMENT_ADDRESS, // Treasury BSV address
            }],
            note: 'PATH402 purchase',
          }
        });

        if (paymentResult.error) {
          console.error('HandCash payment failed:', paymentResult.error);
          return NextResponse.json({
            error: 'Payment failed',
            details: typeof paymentResult.error === 'string' ? paymentResult.error : JSON.stringify(paymentResult.error)
          }, { status: 400 });
        }

        // Payment succeeded, credit tokens in database
        const purchase = await processPurchaseImmediate(holder.id, tokenAmount, avgPrice);

        // If user has a derived ordinals address, transfer tokens on-chain
        let transferTxId: string | null = null;
        let transferError: string | null = null;

        if (ordinalsAddress) {
          console.log(`Transferring ${tokenAmount} tokens to ${ordinalsAddress}`);
          const transferResult = await executeTransfer(tokenAmount, ordinalsAddress);

          if (transferResult.success && transferResult.txId) {
            transferTxId = transferResult.txId;
            console.log(`BSV-20 transfer successful: ${transferTxId}`);

            // IMMEDIATELY record the transfer in path402_transfers
            // This is the source of truth - don't wait for indexer
            if (isDbConnected() && supabase) {
              await supabase
                .from('path402_transfers')
                .insert({
                  holder_id: holder.id,
                  to_address: ordinalsAddress,
                  amount: tokenAmount,
                  tx_id: transferTxId,
                  status: 'confirmed',
                });

              // Zero out database balance - tokens are now on-chain
              await supabase
                .from('path402_holders')
                .update({ balance: 0 })
                .eq('id', holder.id);

              console.log(`Recorded transfer and zeroed database balance for ${holder.id}`);
            }
          } else {
            // Transfer failed - tokens remain in database balance, user can withdraw later
            transferError = transferResult.error || 'Unknown transfer error';
            console.error('BSV-20 transfer failed:', transferError);
          }
        }

        return NextResponse.json({
          purchaseId: purchase.id,
          amount: tokenAmount,
          pricingModel: 'sqrt_decay',
          currentPrice,
          avgPrice,
          totalSats,
          treasuryRemaining,
          status: 'confirmed',
          txId: paymentResult.data?.transactionId,
          transferTxId,
          transferError,
          newBalance: holder.balance + tokenAmount,
          ordinalsAddress,
          note: transferTxId
            ? `Tokens transferred to your ordinals address: ${ordinalsAddress}`
            : `Payment confirmed. Token transfer pending - withdraw from Account page.`,
        });
      } catch (paymentError) {
        console.error('HandCash payment exception:', paymentError);
        return NextResponse.json({
          error: 'Payment failed',
          details: paymentError instanceof Error ? paymentError.message : 'Unknown error'
        }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
  } catch (error) {
    console.error('Error processing purchase:', error);
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 });
  }
}
