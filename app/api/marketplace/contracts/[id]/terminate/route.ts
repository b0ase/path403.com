/**
 * Contract Termination API
 *
 * POST /api/marketplace/contracts/[id]/terminate
 * Terminates a contract and handles escrow refund/return to pool
 *
 * Types:
 * - developer_failure: Developer failed to deliver, funds return to pool for re-tender
 * - client_cancel: Client cancels, partial refund based on completed work
 * - mutual: Both parties agree to terminate
 * - dispute: Contract disputed, requires admin resolution
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getPrisma } from '@/lib/prisma';
import { refundEscrow } from '@/lib/escrow-manager';
import { sendNotification, NotificationType } from '@/lib/notification-service';

const terminateSchema = z.object({
  terminationType: z.enum(['developer_failure', 'client_cancel', 'mutual', 'dispute']),
  reason: z.string().min(10).max(2000),
  refundToPool: z.boolean().default(true), // Return to project escrow pool for re-tender
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: contractId } = await params;
    const body = await request.json();
    const data = terminateSchema.parse(body);

    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const prisma = getPrisma();

    // Get contract with milestones
    const contract = await prisma.marketplace_contracts.findUnique({
      where: { id: contractId },
      include: {
        contract_milestones: true,
      },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Verify user is authorized (client or developer)
    const isClient = contract.client_user_id === user.id;
    const isDeveloper = contract.developer_user_id === user.id;

    if (!isClient && !isDeveloper) {
      return NextResponse.json({ error: 'Not authorized to terminate this contract' }, { status: 403 });
    }

    // Check termination type permissions
    if (data.terminationType === 'developer_failure' && !isClient) {
      return NextResponse.json({ error: 'Only client can mark developer failure' }, { status: 403 });
    }

    if (data.terminationType === 'client_cancel' && !isClient) {
      return NextResponse.json({ error: 'Only client can cancel contract' }, { status: 403 });
    }

    // Check contract status
    if (contract.contract_status === 'completed') {
      return NextResponse.json({ error: 'Cannot terminate completed contract' }, { status: 400 });
    }

    if (contract.contract_status === 'terminated') {
      return NextResponse.json({ error: 'Contract already terminated' }, { status: 400 });
    }

    // Calculate amounts
    const completedMilestones = contract.contract_milestones.filter(m => m.status === 'completed');
    const pendingMilestones = contract.contract_milestones.filter(m => m.status !== 'completed');

    const completedAmount = completedMilestones.reduce((sum, m) => sum + Number(m.amount), 0);
    const pendingAmount = pendingMilestones.reduce((sum, m) => sum + Number(m.amount), 0);
    const totalAmount = Number(contract.total_amount || 0);

    let refundAmount = pendingAmount;
    let escrowAction = 'refund_to_pool';

    // Determine refund action based on termination type
    if (data.terminationType === 'developer_failure') {
      // Full pending amount returns to pool for re-tender
      refundAmount = pendingAmount;
      escrowAction = 'refund_to_pool';
    } else if (data.terminationType === 'client_cancel') {
      // Partial refund, may need to pay developer for work done
      refundAmount = pendingAmount;
      escrowAction = data.refundToPool ? 'refund_to_pool' : 'refund_to_client';
    } else if (data.terminationType === 'mutual') {
      // Negotiated split - for now, return pending to pool
      refundAmount = pendingAmount;
      escrowAction = 'refund_to_pool';
    } else if (data.terminationType === 'dispute') {
      // Hold until admin resolution
      refundAmount = 0;
      escrowAction = 'pending_resolution';
    }

    // Handle escrow refund if contract has escrowed funds
    let refundResult = null;
    if (contract.escrow_status === 'escrowed' && refundAmount > 0 && escrowAction !== 'pending_resolution') {
      if (data.refundToPool && contract.project_slug) {
        // Get the allocation for this contract
        const { data: allocation } = await supabase
          .from('escrow_pool_allocations')
          .select('*')
          .eq('contract_id', contractId)
          .eq('status', 'active')
          .single();

        if (allocation) {
          // Refund to pool using the function
          const { data: refundSuccess, error: refundError } = await supabase.rpc(
            'refund_allocation_to_pool',
            { p_allocation_id: allocation.id }
          );

          if (refundError) {
            console.error('[contract-terminate] Escrow pool refund error:', refundError);
          } else {
            refundResult = { refundedToPool: true, amount: refundAmount };
          }
        }
      } else {
        // Refund via payment provider (Stripe/PayPal)
        try {
          const paymentMethod = contract.payment_method as 'stripe' | 'paypal' | 'crypto';
          const providerId = contract.stripe_checkout_session_id || contract.paypal_order_id || '';

          if (providerId) {
            refundResult = await refundEscrow(paymentMethod, providerId, data.reason);
          }
        } catch (refundError) {
          console.error('[contract-terminate] Payment refund error:', refundError);
        }
      }
    }

    // Update contract status
    await prisma.marketplace_contracts.update({
      where: { id: contractId },
      data: {
        contract_status: 'terminated',
        escrow_status: escrowAction === 'pending_resolution' ? 'disputed' : 'refunded',
        updated_at: new Date(),
      },
    });

    // Create termination record
    const { data: termination, error: termError } = await supabase
      .from('contract_terminations')
      .insert({
        contract_id: contractId,
        terminated_by: user.id,
        termination_reason: data.reason,
        termination_type: data.terminationType,
        escrow_action: escrowAction,
        refunded_amount_usd: refundAmount,
        released_amount_usd: completedAmount,
        eligible_for_retender: data.terminationType === 'developer_failure' && data.refundToPool,
      })
      .select()
      .single();

    // Notify the other party
    const otherPartyId = isClient ? contract.developer_user_id : contract.client_user_id;
    if (otherPartyId) {
      const otherProfile = await prisma.profiles.findUnique({
        where: { id: otherPartyId },
        select: { email: true, full_name: true },
      });

      if (otherProfile?.email) {
        await sendNotification(NotificationType.CONTRACT_TERMINATED, {
          recipientEmail: otherProfile.email,
          recipientName: otherProfile.full_name || 'User',
          contractId,
          contractTitle: contract.service_title || 'Service Contract',
          contractUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/contracts/${contractId}`,
          additionalData: {
            terminationType: data.terminationType,
            reason: data.reason,
            refundAmount: refundAmount.toFixed(2),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      termination: {
        id: termination?.id,
        type: data.terminationType,
        reason: data.reason,
      },
      escrow: {
        action: escrowAction,
        completedAmount,
        refundedAmount: refundAmount,
        eligibleForRetender: data.terminationType === 'developer_failure' && data.refundToPool,
      },
      refundResult,
    });
  } catch (error) {
    console.error('[contract-terminate] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to terminate contract', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
