/**
 * User Contracts API
 *
 * GET /api/marketplace/contracts/user
 * Fetches all contracts for the current user (as client or developer)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Get current user from Supabase auth (secure - validated JWT)
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = user.id;
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // 'client', 'developer', or null for all
    const status = searchParams.get('status'); // 'active', 'completed', 'cancelled', or null for all

    const prisma = getPrisma();

    // Build where clause
    const where: any = {
      OR: [
        { client_user_id: userId },
        { developer_user_id: userId },
      ],
    };

    // Filter by role
    if (role === 'client') {
      where.AND = [{ client_user_id: userId }];
      delete where.OR;
    } else if (role === 'developer') {
      where.AND = [{ developer_user_id: userId }];
      delete where.OR;
    }

    // Filter by status
    if (status) {
      where.contract_status = status;
    }

    // Fetch contracts
    const contracts = await prisma.marketplace_contracts.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        profiles_marketplace_contracts_client_user_idToprofiles: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
        profiles_marketplace_contracts_developer_user_idToprofiles: {
          select: {
            id: true,
            full_name: true,
            username: true,
          },
        },
        contract_milestones: {
          orderBy: { created_at: 'asc' },
        },
      },
    });

    // Format response
    const formattedContracts = contracts.map((contract) => ({
      id: contract.id,
      contractSlug: contract.contract_slug,
      serviceTitle: contract.service_title,
      serviceDescription: contract.service_description,
      totalAmount: parseFloat(contract.total_amount.toString()),
      currency: contract.currency,
      paymentMethod: contract.payment_method,
      contractStatus: contract.contract_status,
      escrowStatus: contract.escrow_status,
      createdAt: contract.created_at,
      startDate: contract.start_date,
      completedAt: contract.completed_at,
      inscriptionTxid: contract.inscription_txid,
      inscriptionUrl: contract.inscription_url,
      client: {
        id: contract.profiles_marketplace_contracts_client_user_idToprofiles?.id,
        name: contract.profiles_marketplace_contracts_client_user_idToprofiles?.full_name,
        email: contract.profiles_marketplace_contracts_client_user_idToprofiles?.email,
      },
      developer: contract.developer_user_id
        ? {
            id: contract.profiles_marketplace_contracts_developer_user_idToprofiles?.id,
            name: contract.profiles_marketplace_contracts_developer_user_idToprofiles?.full_name,
            username: contract.profiles_marketplace_contracts_developer_user_idToprofiles?.username,
          }
        : null,
      milestones: contract.contract_milestones.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        amount: parseFloat(m.amount.toString()),
        status: m.status,
        submittedAt: m.submitted_at,
        approvedAt: m.approved_at,
      })),
      userRole: contract.client_user_id === userId ? 'client' : 'developer',
    }));

    return NextResponse.json({
      contracts: formattedContracts,
      total: formattedContracts.length,
    });
  } catch (error) {
    console.error('[user-contracts] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contracts' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
