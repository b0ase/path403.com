import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { handcashService } from '@/lib/handcash-service';
import { PLATFORM_HANDCASH_HANDLE, FEE_SPLIT, TOKEN_PRICING, calculateTokensFromUsd } from '@/lib/moneybutton/constants';

interface PurchaseRequest {
  buttonLabel: string;
  priceUsd: number;
  projectSlug?: string; // Optional - for project-specific tokens
  tokenPriceUsd?: number; // Custom token price (default: $0.01)
  authToken: string; // HandCash auth token
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: PurchaseRequest = await request.json();

    // Validate input
    if (!body.buttonLabel || typeof body.buttonLabel !== 'string') {
      return NextResponse.json({ error: 'Button label required' }, { status: 400 });
    }
    if (!body.priceUsd || typeof body.priceUsd !== 'number' || body.priceUsd <= 0) {
      return NextResponse.json({ error: 'Valid price required' }, { status: 400 });
    }
    if (!body.authToken) {
      return NextResponse.json({ error: 'HandCash auth token required' }, { status: 400 });
    }

    // Clean button label to create token symbol
    const tokenSymbol = body.buttonLabel.startsWith('$')
      ? body.buttonLabel
      : `$${body.buttonLabel}`;

    // Get buyer's HandCash profile
    let buyerHandle: string;
    try {
      const profile = await handcashService.getUserProfile(body.authToken);
      buyerHandle = profile.handle;
    } catch (err: any) {
      return NextResponse.json({
        error: 'Failed to get HandCash profile',
        details: err.message
      }, { status: 401 });
    }

    // Calculate fee split
    const platformAmount = Number((body.priceUsd * FEE_SPLIT.PLATFORM_PERCENTAGE).toFixed(4));
    const projectAmount = Number((body.priceUsd * FEE_SPLIT.SELLER_PERCENTAGE).toFixed(4));

    // Determine project recipient (default to platform if no project specified)
    let projectRecipient = PLATFORM_HANDCASH_HANDLE;

    if (body.projectSlug) {
      // Look up project owner's HandCash handle
      const { data: project } = await supabase
        .from('projects')
        .select('owner_user_id')
        .eq('slug', body.projectSlug)
        .single();

      if (project?.owner_user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('handcash_handle')
          .eq('id', project.owner_user_id)
          .single();

        if (profile?.handcash_handle) {
          projectRecipient = profile.handcash_handle;
        }
      }
    }

    // Process payment via HandCash
    let paymentResult;
    try {
      // If project recipient is same as platform, send full amount to platform
      if (projectRecipient === PLATFORM_HANDCASH_HANDLE) {
        paymentResult = await handcashService.sendPayment(body.authToken, {
          destination: PLATFORM_HANDCASH_HANDLE,
          amount: body.priceUsd,
          currency: 'USD',
          description: `MoneyButton: ${tokenSymbol} token purchase`,
        });
      } else {
        // Split payment between project and platform
        paymentResult = await handcashService.sendMultiPayment(body.authToken, {
          description: `MoneyButton: ${tokenSymbol} token purchase`,
          appAction: 'PURCHASE',
          payments: [
            {
              destination: projectRecipient,
              amount: projectAmount,
              currencyCode: 'USD',
            },
            {
              destination: PLATFORM_HANDCASH_HANDLE,
              amount: platformAmount,
              currencyCode: 'USD',
            },
          ],
        });
      }
    } catch (err: any) {
      return NextResponse.json({
        error: 'Payment failed',
        details: err.message
      }, { status: 402 });
    }

    // Get project's custom token price or use default ($0.01)
    let tokenPriceUsd = body.tokenPriceUsd || TOKEN_PRICING.DEFAULT_PRICE_USD;

    // If project specified, check for custom token price
    if (body.projectSlug) {
      const { data: projectConfig } = await supabase
        .from('projects')
        .select('token_price_usd')
        .eq('slug', body.projectSlug)
        .single();

      if (projectConfig?.token_price_usd) {
        tokenPriceUsd = Number(projectConfig.token_price_usd);
      }
    }

    // Calculate tokens to credit using configured price
    // Default: 1 token = $0.01 (100 tokens per dollar)
    const tokensToCredit = calculateTokensFromUsd(body.priceUsd, tokenPriceUsd);

    // Get or create user by HandCash handle
    let userId: string | null = null;

    // First check if there's a profile with this handcash handle
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('handcash_handle', buyerHandle)
      .single();

    if (existingProfile) {
      userId = existingProfile.id;
    }

    // Record the purchase in moneybutton_purchases table
    const { data: purchase, error: purchaseError } = await supabase
      .from('moneybutton_purchases')
      .insert({
        token_symbol: tokenSymbol,
        buyer_handcash: buyerHandle,
        buyer_user_id: userId,
        amount_usd: body.priceUsd,
        tokens_credited: tokensToCredit,
        handcash_txid: paymentResult?.transactionId || null,
        project_slug: body.projectSlug || null,
        project_amount: body.projectSlug ? projectAmount : null,
        platform_amount: platformAmount,
        status: 'completed',
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('Error recording purchase:', purchaseError);
      // Payment succeeded but recording failed - log for manual reconciliation
    }

    // Credit tokens to buyer using the moneybutton function
    const { data: newBalance, error: creditError } = await supabase.rpc(
      'credit_moneybutton_tokens',
      {
        p_handcash_handle: buyerHandle,
        p_token_symbol: tokenSymbol,
        p_amount: tokensToCredit,
      }
    );

    if (creditError) {
      console.error('Error crediting tokens:', creditError);
      // Fallback: direct insert/update
      const { data: existing } = await supabase
        .from('moneybutton_balances')
        .select('id, balance')
        .eq('handcash_handle', buyerHandle)
        .eq('token_symbol', tokenSymbol)
        .single();

      if (existing) {
        await supabase
          .from('moneybutton_balances')
          .update({
            balance: (existing.balance || 0) + tokensToCredit,
            total_purchased: (existing.balance || 0) + tokensToCredit,
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('moneybutton_balances')
          .insert({
            handcash_handle: buyerHandle,
            token_symbol: tokenSymbol,
            balance: tokensToCredit,
            total_purchased: tokensToCredit,
          });
      }
    }

    // Contribute to project escrow pool (funds developer contracts)
    // A portion of each investment goes to the escrow pool
    // Currently using projectAmount (95%) as the escrow contribution
    let escrowPoolId: string | null = null;
    if (body.projectSlug && projectAmount > 0) {
      try {
        const { data: poolResult, error: poolError } = await supabase.rpc(
          'add_investment_to_escrow_pool',
          {
            p_project_slug: body.projectSlug,
            p_contributor_handcash: buyerHandle,
            p_amount_usd: projectAmount,
            p_purchase_id: purchase?.id || null,
          }
        );

        if (poolError) {
          console.error('Error adding to escrow pool:', poolError);
        } else {
          escrowPoolId = poolResult;
        }
      } catch (err) {
        console.error('Escrow pool contribution failed:', err);
      }
    }

    return NextResponse.json({
      success: true,
      tokenSymbol,
      tokensCredited: tokensToCredit,
      tokenPriceUsd,
      priceUsd: body.priceUsd,
      transactionId: paymentResult?.transactionId,
      purchaseId: purchase?.id,
      escrowPool: body.projectSlug ? {
        projectSlug: body.projectSlug,
        contributedAmount: projectAmount,
        poolId: escrowPoolId,
      } : null,
      message: `Successfully purchased ${tokensToCredit} ${tokenSymbol} tokens at $${tokenPriceUsd}/token`,
    });

  } catch (error: any) {
    console.error('Token purchase error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
