/**
 * Create Marketplace Contract API
 *
 * POST /api/marketplace/contracts/create
 * Creates a new marketplace contract and initiates payment flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPrisma } from '@/lib/prisma';
import { createEscrow, PaymentMethod } from '@/lib/escrow-manager';
import { getAuthenticatedUser } from '@/lib/investors/auth';

const createContractSchema = z.object({
  contractSlug: z.string().min(1),
  clientUserId: z.string().uuid(),
  developerUserId: z.string().uuid().optional(),
  agentId: z.string().uuid().optional(),
  contractType: z.enum(['service', 'agent', 'custom']).default('service'),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  totalAmount: z.number().positive(),
  currency: z.string().default('USD'),
  paymentMethod: z.enum(['stripe', 'paypal', 'crypto']),
  terms: z.record(z.any()).optional(),
  metadata: z.record(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication - verify user is logged in
    const authContext = await getAuthenticatedUser();
    if (!authContext) {
      return NextResponse.json(
        { error: 'Authentication required to create contracts' },
        { status: 401 }
      );
    }

    const { unifiedUser } = authContext;

    // Parse and validate request body
    const body = await request.json();
    const data = createContractSchema.parse(body);

    // 2. Authorization - verify clientUserId matches authenticated user
    // (or allow if user is creating contract for themselves)
    if (data.clientUserId !== unifiedUser.id) {
      return NextResponse.json(
        { error: 'Cannot create contracts for other users' },
        { status: 403 }
      );
    }

    // Validate: must have either developer or agent
    if (!data.developerUserId && !data.agentId) {
      return NextResponse.json(
        { error: 'Either developerUserId or agentId is required' },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    // Create contract in database
    const contract = await prisma.marketplace_contracts.create({
      data: {
        contract_slug: data.contractSlug,
        client_user_id: data.clientUserId,
        developer_user_id: data.developerUserId || null,
        agent_id: data.agentId || null,
        contract_type: data.contractType,
        title: data.title,
        description: data.description || null,
        total_amount: data.totalAmount,
        currency: data.currency,
        payment_method: data.paymentMethod,
        escrow_status: 'pending',
        contract_status: 'draft',
        terms: data.terms || {},
        metadata: data.metadata || {},
        platform_fee: 5.0, // 5% platform fee
      },
    });

    // Create default milestones (50% upfront, 50% on delivery)
    const upfrontAmount = data.totalAmount * 0.5;
    const deliveryAmount = data.totalAmount * 0.5;

    await prisma.contract_milestones.createMany({
      data: [
        {
          contract_id: contract.id,
          milestone_number: 1,
          title: 'Initial Payment (50%)',
          description: 'Upfront payment to begin work',
          amount: upfrontAmount,
          status: 'pending',
        },
        {
          contract_id: contract.id,
          milestone_number: 2,
          title: 'Final Payment (50%)',
          description: 'Payment upon completion and delivery',
          amount: deliveryAmount,
          status: 'pending',
        },
      ],
    });

    // Generate success and cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/dashboard/contracts/${contract.id}/success`;
    const cancelUrl = `${baseUrl}/dashboard/contracts/${contract.id}/cancel`;

    // Initialize escrow payment
    const escrowResult = await createEscrow({
      paymentMethod: data.paymentMethod as PaymentMethod,
      contractId: contract.id,
      clientUserId: data.clientUserId,
      developerUserId: data.developerUserId || '',
      amount: data.totalAmount,
      currency: data.currency,
      contractTitle: data.title,
      contractDescription: data.description,
      successUrl,
      cancelUrl,
      metadata: {
        contract_slug: data.contractSlug,
        ...data.metadata,
      },
    });

    // Update contract with payment provider ID
    await prisma.marketplace_contracts.update({
      where: { id: contract.id },
      data: {
        payment_provider_id: escrowResult.providerId,
        contract_status: 'active',
      },
    });

    return NextResponse.json({
      success: true,
      contract: {
        id: contract.id,
        title: contract.title,
        totalAmount: contract.total_amount,
        currency: contract.currency,
        status: 'active',
      },
      payment: {
        method: escrowResult.paymentMethod,
        providerId: escrowResult.providerId,
        approvalUrl: escrowResult.approvalUrl,
        status: escrowResult.status,
      },
    });
  } catch (error) {
    console.error('[marketplace] Contract creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create contract',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
