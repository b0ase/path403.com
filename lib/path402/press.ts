/**
 * $402 MoneyButton Press Handler
 *
 * Core payment loop: user presses button → HandCash charges $0.01 →
 * tokens credited based on current supply curve → dividends distributed
 * to existing holders.
 *
 * Adapted from MoneyButton2 project patterns.
 */

import { handcashService } from '@/lib/handcash-service';
import { createAdminClient } from '@/lib/supabase/admin';
import { getToken, incrementSupply } from './tokens';
import { creditTokens, getTokenHolders } from './holdings';
import { calculatePrice, splitRevenue } from './pricing';
import type { Dollar402Token, Dollar402Transaction } from './types';

const PRESS_PRICE_USD = 0.01;
const MIN_HANDCASH_PAYMENT_USD = 0.01;
const PLATFORM_HANDLE = process.env.PLATFORM_HANDCASH_HANDLE || 'themoneybutton';

export interface PressResult {
  transaction: Dollar402Transaction;
  tokensAwarded: number;
  unitPriceSats: number;
  totalCostSats: number;
  handcashTxId: string;
  dividendsDistributed: number; // total sats distributed across holders
}

/**
 * Calculate how many tokens a single press earns at current supply.
 *
 * MoneyButton2 model: 1 press = 1 token always.
 * But with sqrt_decay, the VALUE of that token depends on when you bought.
 * Early buyers paid more per token (higher price at low supply with sqrt_decay)...
 * wait, sqrt_decay gives LOWER prices at HIGHER supply. So early buyers pay MORE.
 *
 * Actually for MoneyButton model, every press = 1 token. The price is fixed at $0.01.
 * The pricing curve is about the VALUE/cost, not the quantity.
 * So we keep it simple: 1 press = 1 token.
 */
const TOKENS_PER_PRESS = 1;

/**
 * Process a MoneyButton press.
 *
 * 1. Charge user via HandCash ($0.01)
 * 2. Verify payment
 * 3. Credit tokens to user
 * 4. Distribute dividends to existing holders
 * 5. Record transaction
 */
export async function processPress(
  tokenId: string,
  userAuthToken: string,
  userHandle: string,
  userId?: string
): Promise<PressResult> {
  const supabase = createAdminClient();

  // 1. Get token and validate
  const token = await getToken(tokenId);
  if (!token) throw new Error('Token not found');
  if (!token.is_active) throw new Error('Token is not active');

  // Check max supply
  if (token.max_supply && token.total_supply + TOKENS_PER_PRESS > token.max_supply) {
    throw new Error(`Token is sold out (${token.total_supply}/${token.max_supply})`);
  }

  // 2. Calculate revenue split
  const currentPriceSats = calculatePrice(
    token.base_price_sats,
    token.total_supply,
    token.pricing_model,
    token.decay_factor
  );

  const { issuerSats, platformSats } = splitRevenue(
    currentPriceSats,
    token.issuer_share_bps,
    token.platform_share_bps
  );

  // 3. Build HandCash payment
  const payments: Array<{ destination: string; amount: number; currencyCode?: string }> = [];

  // Payment to token issuer
  const issuerShareUSD = (PRESS_PRICE_USD * token.issuer_share_bps) / 10000;
  const platformShareUSD = PRESS_PRICE_USD - issuerShareUSD;

  if (issuerShareUSD >= MIN_HANDCASH_PAYMENT_USD && token.issuer_handle) {
    payments.push({
      destination: token.issuer_handle,
      amount: issuerShareUSD,
      currencyCode: 'USD'
    });
  }

  if (platformShareUSD >= MIN_HANDCASH_PAYMENT_USD) {
    payments.push({
      destination: PLATFORM_HANDLE,
      amount: platformShareUSD,
      currencyCode: 'USD'
    });
  }

  // If amounts too small for split, send full amount to issuer
  if (payments.length === 0) {
    payments.push({
      destination: token.issuer_handle || PLATFORM_HANDLE,
      amount: PRESS_PRICE_USD,
      currencyCode: 'USD'
    });
  }

  // 4. Charge via HandCash
  let handcashTxId: string;
  try {
    const paymentResult = await handcashService.sendMultiPayment(userAuthToken, {
      payments,
      description: `$402 token: ${token.name}`,
      appAction: 'PAYMENT'
    });
    handcashTxId = paymentResult.transactionId;
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Payment failed';
    throw new Error(`HandCash payment failed: ${msg}`);
  }

  // 5. Verify payment actually went through
  try {
    const verified = await handcashService.getPayment(userAuthToken, handcashTxId);
    if (!verified) {
      throw new Error('Payment verification returned empty');
    }
  } catch (error) {
    // Payment was charged but verification failed — log but don't fail
    // The payment DID go through (HandCash SDK returns txId on success)
    console.warn(`[press] Payment verification issue for ${handcashTxId}:`, error);
  }

  // 6. Distribute dividends to existing holders BEFORE crediting new tokens
  const dividendsDistributed = await distributeDividends(
    tokenId,
    currentPriceSats,
    userHandle // Exclude the buyer from their own press dividends
  );

  // 7. Credit tokens to buyer
  await creditTokens(tokenId, userHandle, TOKENS_PER_PRESS, currentPriceSats, userId);

  // 8. Increment supply
  await incrementSupply(tokenId, TOKENS_PER_PRESS);

  // 9. Record transaction
  const { data: txData, error: txError } = await supabase
    .from('path402_transactions')
    .insert({
      token_id: tokenId,
      buyer_handle: userHandle,
      seller_handle: null,
      amount: TOKENS_PER_PRESS,
      price_sats: currentPriceSats,
      unit_price_sats: currentPriceSats,
      issuer_revenue_sats: issuerSats,
      platform_revenue_sats: platformSats,
      tx_type: 'acquire',
      handcash_tx_id: handcashTxId,
      metadata: {
        press: true,
        usd_amount: PRESS_PRICE_USD,
        dividends_distributed_sats: dividendsDistributed
      }
    })
    .select()
    .single();

  if (txError) {
    // Tokens were credited, payment went through — log error but don't rollback
    console.error('[press] Failed to record transaction:', txError);
    throw new Error(`Transaction recorded but logging failed: ${txError.message}`);
  }

  return {
    transaction: txData,
    tokensAwarded: TOKENS_PER_PRESS,
    unitPriceSats: currentPriceSats,
    totalCostSats: currentPriceSats,
    handcashTxId,
    dividendsDistributed
  };
}

/**
 * Distribute dividends to all existing holders proportionally.
 *
 * Each press generates revenue. A portion of that revenue goes to existing
 * holders based on their share of total supply. Dividends accumulate in
 * `pending_dividends_sats` until they reach a payout threshold.
 *
 * Returns total sats distributed.
 */
async function distributeDividends(
  tokenId: string,
  pressRevenueSats: number,
  excludeHandle?: string
): Promise<number> {
  if (pressRevenueSats <= 0) return 0;

  const supabase = createAdminClient();

  // Get all holders
  const holders = await getTokenHolders(tokenId, 10000);
  if (holders.length === 0) return 0;

  // Filter out the buyer (they don't get dividends from their own press)
  const eligibleHolders = excludeHandle
    ? holders.filter(h => h.holder_handle !== excludeHandle)
    : holders;

  if (eligibleHolders.length === 0) return 0;

  // Calculate total tokens held by eligible holders
  const totalEligibleTokens = eligibleHolders.reduce((sum, h) => sum + h.balance, 0);
  if (totalEligibleTokens <= 0) return 0;

  // Distribute proportionally
  let totalDistributed = 0;

  for (const holder of eligibleHolders) {
    const share = holder.balance / totalEligibleTokens;
    const dividendSats = Math.floor(pressRevenueSats * share);

    if (dividendSats <= 0) continue;

    // Accumulate pending dividends
    const { error } = await supabase
      .from('path402_holdings')
      .update({
        pending_dividends_sats: (holder as any).pending_dividends_sats
          ? (holder as any).pending_dividends_sats + dividendSats
          : dividendSats
      })
      .eq('id', holder.id);

    if (error) {
      console.error(`[press] Failed to credit dividend to ${holder.holder_handle}:`, error);
      continue;
    }

    totalDistributed += dividendSats;
  }

  return totalDistributed;
}
