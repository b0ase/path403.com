/**
 * Project Escrow Pool API
 *
 * GET /api/projects/[slug]/escrow-pool
 * Get the escrow pool status for a project
 *
 * POST /api/projects/[slug]/escrow-pool
 * Allocate funds from pool to a new contract
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET - Get escrow pool status
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const supabase = await createClient();

    // Get pool info
    const { data: pool, error: poolError } = await supabase
      .from('project_escrow_pools')
      .select('*')
      .eq('project_slug', slug)
      .single();

    if (poolError && poolError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to fetch pool' }, { status: 500 });
    }

    // Get recent contributions
    const { data: contributions } = pool?.id
      ? await supabase
          .from('escrow_pool_contributions')
          .select('*')
          .eq('pool_id', pool.id)
          .order('created_at', { ascending: false })
          .limit(10)
      : { data: [] };

    // Get active allocations (contracts)
    const { data: allocations } = pool?.id
      ? await supabase
          .from('escrow_pool_allocations')
          .select('*')
          .eq('pool_id', pool.id)
          .eq('status', 'active')
      : { data: [] };

    return NextResponse.json({
      success: true,
      pool: pool ? {
        projectSlug: pool.project_slug,
        totalInvestedUsd: Number(pool.total_invested_usd),
        availableBalanceUsd: Number(pool.available_balance_usd),
        escrowedInContractsUsd: Number(pool.escrowed_in_contracts_usd),
        paidToDevelopersUsd: Number(pool.paid_to_developers_usd),
        createdAt: pool.created_at,
        updatedAt: pool.updated_at,
      } : {
        projectSlug: slug,
        totalInvestedUsd: 0,
        availableBalanceUsd: 0,
        escrowedInContractsUsd: 0,
        paidToDevelopersUsd: 0,
        createdAt: null,
        updatedAt: null,
      },
      recentContributions: contributions?.map(c => ({
        id: c.id,
        contributorHandcash: c.contributor_handcash,
        amountUsd: Number(c.contribution_amount_usd),
        createdAt: c.created_at,
      })) || [],
      activeAllocations: allocations?.map(a => ({
        id: a.id,
        contractId: a.contract_id,
        amountUsd: Number(a.allocated_amount_usd),
        createdAt: a.created_at,
      })) || [],
    });
  } catch (error) {
    console.error('[escrow-pool] GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const allocateSchema = z.object({
  contractId: z.string().uuid(),
  amountUsd: z.number().positive(),
});

// POST - Allocate funds to a contract
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const data = allocateSchema.parse(body);

    const supabase = await createClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify user is project owner
    const { data: project } = await supabase
      .from('projects')
      .select('owner_user_id')
      .eq('slug', slug)
      .single();

    if (!project || project.owner_user_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Allocate from pool
    const { data: allocationId, error: allocError } = await supabase.rpc(
      'allocate_escrow_to_contract',
      {
        p_project_slug: slug,
        p_contract_id: data.contractId,
        p_amount_usd: data.amountUsd,
      }
    );

    if (allocError) {
      console.error('[escrow-pool] Allocation error:', allocError);
      return NextResponse.json({
        error: 'Failed to allocate funds',
        details: allocError.message,
      }, { status: 400 });
    }

    // Get updated pool info
    const { data: pool } = await supabase
      .from('project_escrow_pools')
      .select('*')
      .eq('project_slug', slug)
      .single();

    return NextResponse.json({
      success: true,
      allocationId,
      pool: pool ? {
        availableBalanceUsd: Number(pool.available_balance_usd),
        escrowedInContractsUsd: Number(pool.escrowed_in_contracts_usd),
      } : null,
      message: `Allocated $${data.amountUsd.toFixed(2)} to contract`,
    });
  } catch (error) {
    console.error('[escrow-pool] POST Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
