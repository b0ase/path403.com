/**
 * Contract Re-tender API
 *
 * POST /api/marketplace/contracts/[id]/retender
 * Creates a new contract from a terminated one, using returned escrow funds
 *
 * Flow:
 * 1. Original contract fails → funds return to pool
 * 2. Project owner calls re-tender
 * 3. New contract created with same scope, ready for new developer
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getPrisma } from '@/lib/prisma';
import { sendNotification, NotificationType } from '@/lib/notification-service';

const retenderSchema = z.object({
  adjustedAmount: z.number().positive().optional(), // Optionally adjust the budget
  adjustedDescription: z.string().max(5000).optional(),
  additionalRequirements: z.string().max(2000).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: contractId } = await params;
    const body = await request.json();
    const data = retenderSchema.parse(body);

    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const prisma = getPrisma();

    // Get original contract
    const originalContract = await prisma.marketplace_contracts.findUnique({
      where: { id: contractId },
      include: {
        contract_milestones: true,
      },
    });

    if (!originalContract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Verify user is the client (project owner)
    if (originalContract.client_user_id !== user.id) {
      return NextResponse.json({ error: 'Only the client can re-tender a contract' }, { status: 403 });
    }

    // Verify contract was terminated and eligible for re-tender
    if (originalContract.contract_status !== 'terminated') {
      return NextResponse.json({ error: 'Only terminated contracts can be re-tendered' }, { status: 400 });
    }

    // Check termination record
    const { data: termination } = await supabase
      .from('contract_terminations')
      .select('*')
      .eq('contract_id', contractId)
      .single();

    if (!termination?.eligible_for_retender) {
      return NextResponse.json({ error: 'This contract is not eligible for re-tender' }, { status: 400 });
    }

    if (termination.retendered_at) {
      return NextResponse.json({
        error: 'This contract has already been re-tendered',
        newContractId: termination.new_contract_id,
      }, { status: 400 });
    }

    // Calculate new contract amount
    const pendingMilestones = originalContract.contract_milestones.filter(
      m => m.status !== 'completed'
    );
    const pendingAmount = pendingMilestones.reduce((sum, m) => sum + Number(m.amount), 0);
    const newAmount = data.adjustedAmount || pendingAmount;

    // Verify funds available in pool
    if (originalContract.project_slug) {
      const { data: pool } = await supabase
        .from('project_escrow_pools')
        .select('*')
        .eq('project_slug', originalContract.project_slug)
        .single();

      if (!pool || Number(pool.available_balance_usd) < newAmount) {
        return NextResponse.json({
          error: 'Insufficient funds in escrow pool',
          available: pool?.available_balance_usd || 0,
          required: newAmount,
        }, { status: 400 });
      }
    }

    // Create new contract
    const newContract = await prisma.marketplace_contracts.create({
      data: {
        service_id: originalContract.service_id,
        service_title: originalContract.service_title,
        client_user_id: originalContract.client_user_id,
        developer_user_id: null, // Open for new developer
        total_amount: newAmount,
        currency: originalContract.currency,
        contract_status: 'pending', // Ready for developer acceptance
        escrow_status: 'pending',
        payment_method: originalContract.payment_method,
        project_slug: originalContract.project_slug,
        requirements: data.adjustedDescription || originalContract.requirements,
        deliverables: originalContract.deliverables,
        timeline_days: originalContract.timeline_days,
        original_contract_id: contractId, // Link to original
      },
    });

    // Create milestones for new contract (copy pending ones)
    for (const milestone of pendingMilestones) {
      const milestoneAmount = data.adjustedAmount
        ? (Number(milestone.amount) / pendingAmount) * newAmount
        : Number(milestone.amount);

      await prisma.contract_milestones.create({
        data: {
          contract_id: newContract.id,
          title: milestone.title,
          description: data.additionalRequirements
            ? `${milestone.description}\n\nAdditional requirements:\n${data.additionalRequirements}`
            : milestone.description,
          amount: milestoneAmount,
          due_date: milestone.due_date
            ? new Date(Date.now() + (new Date(milestone.due_date).getTime() - new Date(originalContract.created_at!).getTime()))
            : null,
          milestone_order: milestone.milestone_order,
          status: 'pending',
        },
      });
    }

    // Update termination record
    await supabase
      .from('contract_terminations')
      .update({
        retendered_at: new Date().toISOString(),
        new_contract_id: newContract.id,
      })
      .eq('id', termination.id);

    // Send notifications to developers who might be interested
    // (Could integrate with developer matching/notification system)

    return NextResponse.json({
      success: true,
      newContract: {
        id: newContract.id,
        amount: newAmount,
        status: newContract.contract_status,
        milestonesCount: pendingMilestones.length,
      },
      originalContract: {
        id: contractId,
        refundedAmount: pendingAmount,
      },
      message: 'Contract re-tendered successfully. Ready for new developer bids.',
    });
  } catch (error) {
    console.error('[contract-retender] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to re-tender contract', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
