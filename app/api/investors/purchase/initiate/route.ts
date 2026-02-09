import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/investors/auth';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { getCurrentRates } from '@/lib/crypto-pricing';
import { withRateLimit, rateLimitPresets } from '@/lib/rate-limit';

const purchaseSchema = z.object({
  amount: z.number().min(0.01).max(10000000), // Min $0.01, Max $10M (supports $bWriter penny tokens)
  currency: z.enum(['USD', 'GBP', 'EUR']).default('USD'),
  paymentMethod: z.enum(['stripe', 'wire', 'crypto', 'handcash']).default('stripe'),
  cryptoCurrency: z.enum(['BSV', 'ETH', 'SOL']).optional(),
  tokenTicker: z.string().default('BOASE'), // Which venture token to buy
  // Tranche investment fields
  investmentType: z.enum(['token', 'tranche']).default('token'),
  trancheId: z.string().uuid().optional(),
  projectSlug: z.string().optional(),
  equityPercent: z.number().min(0.5).max(100).optional(),
});

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY required');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  });
}

/**
 * POST /api/investors/purchase/initiate
 *
 * Initiate a token purchase for any venture token.
 * Simplified flow:
 * - Stripe: Redirect to checkout, webhook confirms and credits
 * - Crypto/Wire: Create pending purchase, admin confirms later
 *
 * Rate limited: 10 requests per minute (strict preset - financial)
 */
const purchaseInitiateHandler = async (request: NextRequest) => {
  try {
    // 1. Authentication
    const authContext = await getAuthenticatedUser();
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { unifiedUser } = authContext;

    // 2. Validate request
    const body = await request.json();
    console.log('[purchase] Request body:', JSON.stringify(body, null, 2));

    const validation = purchaseSchema.safeParse(body);

    if (!validation.success) {
      console.log('[purchase] Validation failed:', validation.error.issues);
      return NextResponse.json({
        error: 'Invalid request',
        details: validation.error.issues,
      }, { status: 400 });
    }

    console.log('[purchase] Validation passed, processing:', { amount: validation.data.amount, paymentMethod: validation.data.paymentMethod, tokenTicker: validation.data.tokenTicker });

    const { amount, currency, paymentMethod, tokenTicker, investmentType, trancheId, projectSlug, equityPercent } = validation.data;

    const supabase = await createClient();

    // TRANCHE INVESTMENT MODE
    if (investmentType === 'tranche' && trancheId) {
      // Get tranche details
      const { data: tranche, error: trancheError } = await supabase
        .from('funding_tranches')
        .select('*')
        .eq('id', trancheId)
        .single();

      if (trancheError || !tranche) {
        return NextResponse.json({ error: 'Tranche not found' }, { status: 404 });
      }

      if (tranche.status !== 'open') {
        return NextResponse.json({ error: 'This tranche is not open for investment' }, { status: 400 });
      }

      // Calculate remaining capacity
      const remaining = Number(tranche.target_amount_gbp) - Number(tranche.raised_amount_gbp);
      if (amount > remaining) {
        return NextResponse.json({
          error: `Only £${remaining.toLocaleString()} capacity remaining in this tranche`,
        }, { status: 400 });
      }

      // Create investor allocation record
      const { data: allocation, error: allocError } = await supabase
        .from('investor_allocations')
        .insert({
          investor_id: unifiedUser.id,
          tranche_id: trancheId,
          project_slug: tranche.project_slug,
          amount_gbp: amount,
          equity_percent: equityPercent || (amount / Number(tranche.price_per_percent)),
          payment_method: paymentMethod,
          payment_status: 'pending',
          escrow_status: 'pending',
        })
        .select()
        .single();

      if (allocError) {
        console.error('[purchase/initiate] Failed to create allocation:', allocError);
        // If table doesn't exist, fall through to token purchase
        if (!allocError.message?.includes('relation') && !allocError.message?.includes('does not exist')) {
          return NextResponse.json({ error: 'Failed to create investment allocation' }, { status: 500 });
        }
      }

      // Handle Stripe payment for tranche
      if (paymentMethod === 'stripe') {
        const stripe = getStripe();

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'gbp',
                product_data: {
                  name: `${tranche.project_slug} - ${tranche.name}`,
                  description: `${equityPercent || (amount / Number(tranche.price_per_percent)).toFixed(2)}% equity in ${tranche.name} tranche`,
                },
                unit_amount: Math.round(amount * 100),
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://b0ase.com'}/investors/purchase/success?session_id={CHECKOUT_SESSION_ID}&type=tranche`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://b0ase.com'}/invest/${tranche.project_slug}?cancelled=true`,
          metadata: {
            type: 'tranche_investment',
            user_id: unifiedUser.id,
            tranche_id: trancheId,
            project_slug: tranche.project_slug,
            amount_gbp: amount.toString(),
            equity_percent: (equityPercent || (amount / Number(tranche.price_per_percent))).toString(),
            allocation_id: allocation?.id || '',
          },
          customer_email: unifiedUser.primary_email || undefined,
        });

        return NextResponse.json({
          success: true,
          investmentType: 'tranche',
          paymentMethod: 'stripe',
          checkoutUrl: session.url,
          sessionId: session.id,
          investment: {
            trancheId,
            projectSlug: tranche.project_slug,
            trancheName: tranche.name,
            amountGbp: amount,
            equityPercent: equityPercent || (amount / Number(tranche.price_per_percent)),
          },
        });
      }

      // Handle crypto/wire for tranche (simplified - same as token but with tranche metadata)
      if (paymentMethod === 'wire') {
        return NextResponse.json({
          success: true,
          investmentType: 'tranche',
          paymentMethod: 'wire',
          purchaseId: allocation?.id || trancheId,
          wireInstructions: {
            bankName: 'Barclays Bank UK',
            accountName: 'b0ase.com Ltd',
            sortCode: 'XX-XX-XX',
            accountNumber: 'XXXXXXXX',
            iban: 'GB00 BARC XXXX XXXX XXXX XX',
            swift: 'BARCGB22',
            reference: `TRANCHE-${trancheId.slice(0, 8).toUpperCase()}`,
            amount,
            currency: 'GBP',
          },
          investment: {
            trancheId,
            projectSlug: tranche.project_slug,
            trancheName: tranche.name,
            amountGbp: amount,
            equityPercent: equityPercent || (amount / Number(tranche.price_per_percent)),
          },
        });
      }

      if (paymentMethod === 'crypto') {
        const cryptoCurrency = validation.data.cryptoCurrency || 'BSV';
        const rates = await getCurrentRates();
        const rate = rates[cryptoCurrency];

        if (!rate) {
          return NextResponse.json({ error: `Unable to get ${cryptoCurrency} rate` }, { status: 500 });
        }

        const cryptoAmount = amount / rate; // GBP to crypto

        const treasuryAddresses: Record<'BSV' | 'ETH' | 'SOL', string> = {
          BSV: process.env.TREASURY_BSV_ADDRESS || '1BoaseTreasuryXXXXXXXXXXXXXXXXXXX',
          ETH: process.env.TREASURY_ETH_ADDRESS || '0xBoaseTreasuryXXXXXXXXXXXXXXXXXXX',
          SOL: process.env.TREASURY_SOL_ADDRESS || 'BoaseTreasurySolanaXXXXXXXXXXXXXXX',
        };

        return NextResponse.json({
          success: true,
          investmentType: 'tranche',
          paymentMethod: 'crypto',
          purchaseId: allocation?.id || trancheId,
          cryptoPayment: {
            currency: cryptoCurrency,
            address: treasuryAddresses[cryptoCurrency],
            amount: cryptoAmount.toFixed(8),
            exchangeRate: rate,
            gbpAmount: amount,
          },
          investment: {
            trancheId,
            projectSlug: tranche.project_slug,
            trancheName: tranche.name,
            amountGbp: amount,
            equityPercent: equityPercent || (amount / Number(tranche.price_per_percent)),
          },
        });
      }
    }

    // STANDARD TOKEN PURCHASE MODE
    // 3. Get the venture token
    console.log('[purchase] Looking for token with ticker:', tokenTicker);

    const { data: ventureToken, error: tokenError } = await supabase
      .from('venture_tokens')
      .select('*')
      .eq('ticker', tokenTicker)
      .eq('is_active', true)
      .single();

    if (tokenError || !ventureToken) {
      console.log('[purchase] Token not found:', { tokenTicker, error: tokenError?.message });
      return NextResponse.json({
        error: `Token ${tokenTicker} not found or not available for purchase`,
      }, { status: 404 });
    }

    console.log('[purchase] Token found:', { ticker: ventureToken.ticker, name: ventureToken.name });

    // 4. SPECIAL HANDLING FOR $bWriter TOKEN
    // Check both with $ and without $ for compatibility
    const isBWriter = tokenTicker === '$bWriter' || tokenTicker === 'BWRITER' || tokenTicker?.toLowerCase().includes('bwriter');
    if (isBWriter) {
      // $bWriter purchases are processed by bitcoin-corp-website API via HandCash
      // This is required because:
      // - Stripe is blocked for $bWriter
      // - Users have their own HandCash handles
      // - Tokens are managed on the Bitcoin blockchain (BSV-20)

      // Use handle from auth context (cookie/session) as primary source
      const handCashHandle = authContext.handcashHandle || unifiedUser.handcash_handle;

      console.log('[purchase/initiate] Auth Debug:', {
        authContextHandle: authContext.handcashHandle,
        unifiedUserHandle: unifiedUser.handcash_handle,
        finalHandle: handCashHandle,
        cookies: request.cookies.getAll().map(c => c.name),
        b0ase_user_handle_cookie: request.cookies.get('b0ase_user_handle')?.value
      });

      if (!handCashHandle) {
        return NextResponse.json({
          error: 'You must link your HandCash handle to purchase $bWriter tokens',
          debug: {
            authContextKeys: Object.keys(authContext),
            hasUnifiedUser: !!unifiedUser,
            cookies: request.cookies.getAll().map(c => c.name)
          }
        }, { status: 400 });
      }

      // Get user's HandCash auth token from cookies
      const cookieStore = request.cookies;
      const authToken = cookieStore.get('b0ase_handcash_token')?.value || cookieStore.get('b0ase_auth_token')?.value;

      if (!authToken) {
        return NextResponse.json({
          error: 'HandCash authentication required to purchase $bWriter tokens',
        }, { status: 401 });
      }

      // Call bitcoin-corp-website API to process purchase
      try {
        console.log('[purchase/initiate] Calling bitcoin-corp API...', { userHandle: handCashHandle, amount });
        const bitcoinCorpResponse = await fetch(
          'https://www.thebitcoincorporation.website/api/shared/bwriter/purchase/initiate',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.BWRITER_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userHandle: handCashHandle,
              amount: amount,
              authToken: authToken,
            }),
          }
        );

        const responseText = await bitcoinCorpResponse.text();
        console.log('[purchase/initiate] bitcoin-corp response:', { status: bitcoinCorpResponse.status, body: responseText });

        let result;
        try {
          if (!responseText) {
            result = {};
          } else {
            result = JSON.parse(responseText);
          }
        } catch (e) {
          console.error('[purchase/initiate] upstream invalid JSON:', responseText);
          throw new Error(`Upstream API Error (${bitcoinCorpResponse.status}): ${responseText.slice(0, 100)}`);
        }

        if (!bitcoinCorpResponse.ok) {
          return NextResponse.json(result, { status: bitcoinCorpResponse.status });
        }

        return NextResponse.json(result);
      } catch (error) {
        console.error('[purchase/initiate] bitcoin-corp API error:', error);
        return NextResponse.json({
          error: 'Failed to process $bWriter purchase',
          message: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
      }
    }

    // 4. Calculate tokens at current price
    const pricePerToken = parseFloat(ventureToken.price_usd);
    const tokenAmount = Math.floor(amount / pricePerToken);

    if (tokenAmount <= 0) {
      return NextResponse.json({
        error: 'Amount too small to purchase any tokens',
      }, { status: 400 });
    }

    // Check availability
    if (tokenAmount > Number(ventureToken.tokens_available)) {
      return NextResponse.json({
        error: `Only ${ventureToken.tokens_available} tokens available`,
      }, { status: 400 });
    }

    // 5. Handle payment method
    if (paymentMethod === 'stripe') {
      const stripe = getStripe();

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: `$${tokenTicker} Token Purchase`,
                description: `${tokenAmount.toLocaleString()} $${tokenTicker} tokens at $${pricePerToken}/token`,
              },
              unit_amount: Math.round(amount * 100), // Stripe uses cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://b0ase.com'}/investors/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://b0ase.com'}/investors/purchase?cancelled=true`,
        metadata: {
          type: 'venture_token_purchase',
          user_id: unifiedUser.id,
          token_ticker: tokenTicker,
          token_id: ventureToken.id,
          token_amount: tokenAmount.toString(),
          usd_amount: amount.toString(),
          price_per_token: pricePerToken.toString(),
        },
        customer_email: unifiedUser.primary_email || undefined,
      });

      // Create pending purchase record
      await supabase.from('token_purchases').insert({
        user_id: unifiedUser.id,
        token_id: ventureToken.id,
        token_amount: tokenAmount,
        usd_amount: amount,
        price_per_token: pricePerToken,
        payment_method: 'stripe',
        payment_currency: currency,
        payment_amount: amount,
        stripe_session_id: session.id,
        status: 'pending',
      });

      return NextResponse.json({
        success: true,
        paymentMethod: 'stripe',
        checkoutUrl: session.url,
        sessionId: session.id,
        purchase: {
          amount,
          currency,
          tokenAmount,
          tokenTicker,
          pricePerToken,
        },
      });
    }

    if (paymentMethod === 'wire') {
      // Create pending purchase for wire transfer
      const { data: purchase, error: insertError } = await supabase
        .from('token_purchases')
        .insert({
          user_id: unifiedUser.id,
          token_id: ventureToken.id,
          token_amount: tokenAmount,
          usd_amount: amount,
          price_per_token: pricePerToken,
          payment_method: 'wire',
          payment_currency: currency,
          payment_amount: amount,
          status: 'pending',
          notes: `Wire transfer - awaiting funds`,
        })
        .select()
        .single();

      if (insertError) {
        console.error('[purchase/initiate] Failed to create purchase:', insertError);
        return NextResponse.json({ error: 'Failed to create purchase' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        paymentMethod: 'wire',
        purchaseId: purchase.id,
        wireInstructions: {
          bankName: 'Barclays Bank UK',
          accountName: 'b0ase.com Ltd',
          sortCode: 'XX-XX-XX', // Replace with real
          accountNumber: 'XXXXXXXX', // Replace with real
          iban: 'GB00 BARC XXXX XXXX XXXX XX', // Replace with real
          swift: 'BARCGB22',
          reference: `TOKEN-${purchase.id.slice(0, 8).toUpperCase()}`,
          amount,
          currency,
        },
        purchase: {
          id: purchase.id,
          amount,
          currency,
          tokenAmount,
          tokenTicker,
          pricePerToken,
        },
        message: 'Please use the reference number in your wire transfer. Tokens will be allocated once we confirm receipt (usually 1-2 business days).',
      });
    }

    if (paymentMethod === 'crypto') {
      const cryptoCurrency = validation.data.cryptoCurrency || 'BSV';

      // Get live crypto rates
      const rates = await getCurrentRates();
      const rate = rates[cryptoCurrency];

      if (!rate) {
        return NextResponse.json({
          error: `Unable to get ${cryptoCurrency} exchange rate`,
        }, { status: 500 });
      }

      // Convert USD to crypto
      // Rates are in GBP, assume 1 USD ≈ 0.79 GBP
      const usdToGbpRate = 0.79;
      const amountGbp = amount * usdToGbpRate;
      const cryptoAmount = amountGbp / rate;

      // Treasury addresses
      const treasuryAddresses: Record<'BSV' | 'ETH' | 'SOL', string> = {
        BSV: process.env.TREASURY_BSV_ADDRESS || '1BoaseTreasuryXXXXXXXXXXXXXXXXXXX',
        ETH: process.env.TREASURY_ETH_ADDRESS || '0xBoaseTreasuryXXXXXXXXXXXXXXXXXXX',
        SOL: process.env.TREASURY_SOL_ADDRESS || 'BoaseTreasurySolanaXXXXXXXXXXXXXXX',
      };

      const paymentAddress = treasuryAddresses[cryptoCurrency];

      // Create pending purchase
      const { data: purchase, error: insertError } = await supabase
        .from('token_purchases')
        .insert({
          user_id: unifiedUser.id,
          token_id: ventureToken.id,
          token_amount: tokenAmount,
          usd_amount: amount,
          price_per_token: pricePerToken,
          payment_method: `crypto_${cryptoCurrency.toLowerCase()}`,
          payment_currency: cryptoCurrency,
          payment_amount: cryptoAmount,
          crypto_address: paymentAddress,
          status: 'pending',
          notes: `Crypto payment - send ${cryptoAmount.toFixed(8)} ${cryptoCurrency} to ${paymentAddress}`,
        })
        .select()
        .single();

      if (insertError) {
        console.error('[purchase/initiate] Failed to create purchase:', insertError);
        return NextResponse.json({ error: 'Failed to create purchase' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        paymentMethod: 'crypto',
        purchaseId: purchase.id,
        cryptoPayment: {
          currency: cryptoCurrency,
          address: paymentAddress,
          amount: cryptoAmount.toFixed(8),
          exchangeRate: rate,
          usdAmount: amount,
        },
        purchase: {
          id: purchase.id,
          amount,
          tokenAmount,
          tokenTicker,
          pricePerToken,
        },
        instructions: [
          `Send exactly ${cryptoAmount.toFixed(8)} ${cryptoCurrency} to:`,
          paymentAddress,
          '',
          'After sending, click "I\'ve sent payment" below.',
          'We\'ll verify receipt and allocate your tokens (usually within a few hours).',
        ],
      });
    }

    return NextResponse.json({
      error: 'Invalid payment method',
    }, { status: 400 });

  } catch (error) {
    console.error('[purchase/initiate] Error:', error);
    return NextResponse.json({
      error: 'Failed to initiate purchase',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
};

// Apply rate limiting to purchase initiation
export const POST = withRateLimit(purchaseInitiateHandler, rateLimitPresets.strict);

/**
 * GET /api/investors/purchase/initiate
 *
 * Get available venture tokens and purchase info
 */
export async function GET() {
  try {
    const authContext = await getAuthenticatedUser();
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get all active venture tokens
    const { data: tokens, error } = await supabase
      .from('venture_tokens')
      .select('ticker, name, description, price_usd, total_supply, tokens_available, is_public, portfolio_slug')
      .eq('is_active', true)
      .order('ticker');

    if (error) {
      console.error('[purchase/initiate] Failed to fetch tokens:', error);
      return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 });
    }

    return NextResponse.json({
      tokens: tokens || [],
      minimumInvestment: 100,
      maximumInvestment: 10000000,
      availablePaymentMethods: ['stripe', 'wire', 'crypto'],
      cryptoCurrencies: ['BSV', 'ETH', 'SOL'],
      currencies: ['USD', 'GBP', 'EUR'],
    });
  } catch (error) {
    console.error('[purchase/initiate] GET Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch purchase info',
    }, { status: 500 });
  }
}
