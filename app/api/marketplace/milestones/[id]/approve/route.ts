/**
 * Milestone Approval API
 *
 * POST /api/marketplace/milestones/[id]/approve
 * Client approves a submitted milestone, triggering:
 * 1. Escrow release (cash to developer)
 * 2. Token bonus credit (tokens to developer)
 *
 * Developer receives: 95% cash + equivalent tokens
 * Token calculation: 1 token per $0.001 USD
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPrisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { releaseEscrow } from '@/lib/escrow-manager';
import { sendNotification, NotificationType } from '@/lib/notification-service';
import { TOKEN_PRICING, calculateTokensFromUsd } from '@/lib/moneybutton/constants';

const approveSchema = z.object({
  feedback: z.string().max(1000).optional(),
  rating: z.number().min(1).max(5).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: milestoneId } = await params;
    const body = await request.json();
    const data = approveSchema.parse(body);

    // Get current user (from session)
    const cookieStore = await import('next/headers').then((m) => m.cookies());
    const sessionCookie = (await cookieStore).get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = sessionCookie.value;
    const prisma = getPrisma();

    // Fetch milestone with contract
    const milestone = await prisma.contract_milestones.findUnique({
      where: { id: milestoneId },
      include: {
        marketplace_contracts: {
          include: {
            payout_preferences_payout_preferences_user_idToprofiles: true,
          },
        },
      },
    });

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    // Verify user is the client
    if (milestone.marketplace_contracts.client_user_id !== userId) {
      return NextResponse.json(
        { error: 'Only the client can approve milestones' },
        { status: 403 }
      );
    }

    // Verify milestone is in correct state
    if (milestone.status !== 'submitted') {
      return NextResponse.json(
        { error: `Milestone cannot be approved. Current status: ${milestone.status}` },
        { status: 400 }
      );
    }

    // Verify contract has escrow
    if (milestone.marketplace_contracts.escrow_status !== 'escrowed') {
      return NextResponse.json(
        { error: 'Contract escrow not found' },
        { status: 400 }
      );
    }

    // Calculate amounts
    const milestoneAmount = parseFloat(milestone.amount.toString());
    const platformFee = milestoneAmount * 0.05; // 5% platform fee
    const developerAmount = milestoneAmount - platformFee;

    // Release escrow to developer
    const payoutResult = await releaseEscrow({
      contractId: milestone.contract_id,
      milestoneId: milestone.id,
      amount: developerAmount,
      platformFee,
      paymentMethod: milestone.marketplace_contracts.payment_method,
      stripePaymentIntentId: milestone.marketplace_contracts.stripe_payment_intent_id || undefined,
      paypalOrderId: milestone.marketplace_contracts.paypal_order_id || undefined,
      developerUserId: milestone.marketplace_contracts.developer_user_id!,
    });

    // Update milestone
    const updatedMilestone = await prisma.contract_milestones.update({
      where: { id: milestoneId },
      data: {
        status: 'completed',
        client_feedback: data.feedback,
        client_rating: data.rating,
        approved_at: new Date(),
        payout_txid: payoutResult.transactionId,
      },
    });

    // Check if all milestones completed
    const allMilestones = await prisma.contract_milestones.findMany({
      where: { contract_id: milestone.contract_id },
    });

    const allCompleted = allMilestones.every((m) => m.status === 'completed');

    // If all milestones completed, mark contract as completed
    if (allCompleted) {
      await prisma.marketplace_contracts.update({
        where: { id: milestone.contract_id },
        data: {
          contract_status: 'completed',
          completed_at: new Date(),
        },
      });
    }

    // Credit token bonus to developer
    // Get project's token price or use default ($0.01 per token)
    let tokenPriceUsd = TOKEN_PRICING.DEFAULT_PRICE_USD;
    const supabase = await createClient();

    if (milestone.marketplace_contracts.project_slug) {
      const { data: projectConfig } = await supabase
        .from('projects')
        .select('token_price_usd')
        .eq('slug', milestone.marketplace_contracts.project_slug)
        .single();

      if (projectConfig?.token_price_usd) {
        tokenPriceUsd = Number(projectConfig.token_price_usd);
      }
    }

    // Calculate tokens: Default $0.01/token = 100 tokens per dollar
    const tokensEarned = calculateTokensFromUsd(developerAmount, tokenPriceUsd);
    const tokenSymbol = milestone.marketplace_contracts.project_slug
      ? `$${milestone.marketplace_contracts.project_slug.toUpperCase().slice(0, 10)}`
      : '$DEV';

    let tokenBonus = null;

    if (tokensEarned > 0 && milestone.marketplace_contracts.developer_user_id) {
      // Get developer's HandCash handle if available
      const { data: developerPayout } = await supabase
        .from('payout_preferences')
        .select('handcash_handle')
        .eq('user_id', milestone.marketplace_contracts.developer_user_id)
        .single();

      // Record token bonus
      const { data: bonus, error: bonusError } = await supabase
        .from('developer_token_bonuses')
        .insert({
          developer_user_id: milestone.marketplace_contracts.developer_user_id,
          developer_handcash: developerPayout?.handcash_handle || null,
          contract_id: milestone.contract_id,
          milestone_id: milestone.id,
          project_slug: milestone.marketplace_contracts.project_slug || 'general',
          token_symbol: tokenSymbol,
          tokens_earned: tokensEarned,
          token_value_usd: tokensEarned * tokenPriceUsd,
          cash_amount_usd: developerAmount,
          payout_txid: payoutResult.transactionId || null,
          status: 'credited',
          credited_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!bonusError && bonus) {
        tokenBonus = {
          id: bonus.id,
          tokens: tokensEarned,
          symbol: tokenSymbol,
          valueUsd: tokensEarned * tokenPriceUsd,
        };

        // Also credit to moneybutton_balances if developer has HandCash
        if (developerPayout?.handcash_handle) {
          await supabase.rpc('credit_moneybutton_tokens', {
            p_handcash_handle: developerPayout.handcash_handle,
            p_token_symbol: tokenSymbol,
            p_amount: tokensEarned,
          });
        }
      }

      // Update escrow pool allocation as released (if using pool funding)
      if (milestone.marketplace_contracts.project_slug) {
        const { data: allocation } = await supabase
          .from('escrow_pool_allocations')
          .select('id')
          .eq('contract_id', milestone.contract_id)
          .eq('status', 'active')
          .single();

        if (allocation) {
          await supabase.rpc('release_allocation', { p_allocation_id: allocation.id });
        }
      }
    }

    // Send notification to developer
    const developerProfile = await prisma.profiles.findUnique({
      where: { id: milestone.marketplace_contracts.developer_user_id! },
      select: { email: true, full_name: true },
    });

    if (developerProfile?.email) {
      await sendNotification(NotificationType.MILESTONE_APPROVED, {
        recipientEmail: developerProfile.email,
        recipientName: developerProfile.full_name || 'Developer',
        contractId: milestone.contract_id,
        contractTitle: milestone.marketplace_contracts.service_title || 'Service Contract',
        contractUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/contracts/${milestone.contract_id}`,
        additionalData: {
          milestoneTitle: milestone.title,
          payoutAmount: `${milestone.marketplace_contracts.currency}${developerAmount.toFixed(2)}`,
          tokenBonus: tokenBonus
            ? `+${tokenBonus.tokens.toLocaleString()} ${tokenBonus.symbol} tokens`
            : null,
          feedback: data.feedback,
          rating: data.rating,
        },
      });
    }

    // TODO: Create contract review entry if rating provided

    return NextResponse.json({
      success: true,
      milestone: {
        id: updatedMilestone.id,
        status: updatedMilestone.status,
        approvedAt: updatedMilestone.approved_at,
      },
      payout: {
        amount: developerAmount,
        platformFee,
        transactionId: payoutResult.transactionId,
      },
      tokenBonus: tokenBonus || null,
      contractCompleted: allCompleted,
    });
  } catch (error) {
    console.error('[milestone-approve] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to approve milestone', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
