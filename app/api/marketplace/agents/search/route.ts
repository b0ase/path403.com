/**
 * Agent Search API
 *
 * GET /api/marketplace/agents/search
 * Search and filter AI agents with query parameters
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const capabilities = searchParams.get('capabilities')?.split(',').filter(Boolean) || [];
    const model = searchParams.get('model'); // e.g., 'claude-sonnet-4.5', 'gpt-4'
    const minRate = searchParams.get('minRate')
      ? parseFloat(searchParams.get('minRate')!)
      : undefined;
    const maxRate = searchParams.get('maxRate')
      ? parseFloat(searchParams.get('maxRate')!)
      : undefined;
    const sort = searchParams.get('sort') || 'recent'; // 'recent', 'contracts'
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const prisma = getPrisma();

    // Build where clause
    const where: any = {
      is_marketplace_listed: true,
      role: 'marketplace',
    };

    // Capabilities filter (check JSONB field)
    if (capabilities.length > 0) {
      // In PostgreSQL with Prisma, we'd use JSON path queries
      // For now, we'll filter in-memory after fetch
      // In production, use raw SQL or Prisma's jsonb operators
    }

    // Model filter (partial match)
    if (model) {
      where.name = {
        contains: model,
        mode: 'insensitive',
      };
    }

    // Hourly rate filter
    if (minRate !== undefined || maxRate !== undefined) {
      where.hourly_rate = {};
      if (minRate !== undefined) {
        where.hourly_rate.gte = minRate;
      }
      if (maxRate !== undefined) {
        where.hourly_rate.lte = maxRate;
      }
    }

    // Fetch agents
    let orderBy: any = { created_at: 'desc' }; // Default: recent

    if (sort === 'contracts') {
      // Sort by number of closed contracts
      // In production, use aggregation
      orderBy = { created_at: 'desc' };
    }

    const agents = await prisma.agents.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        description: true,
        marketplace_description: true,
        capabilities: true,
        hourly_rate: true,
        principal_user_id: true,
        created_at: true,
      },
    });

    // Fetch principal users (developers who control the agents)
    const principalUserIds = agents
      .map((a) => a.principal_user_id)
      .filter((id): id is string => id !== null);

    const principals = await prisma.profiles.findMany({
      where: {
        id: {
          in: principalUserIds,
        },
      },
      select: {
        id: true,
        username: true,
        full_name: true,
      },
    });

    const principalsMap = new Map(
      principals.map((p) => [
        p.id,
        {
          username: p.username,
          humanName: p.full_name,
          profileUrl: `/contracts/developers/${p.username}`,
        },
      ])
    );

    // Get total count for pagination
    const total = await prisma.agents.count({ where });

    // Format response
    let results = agents.map((agent) => {
      const principal = agent.principal_user_id
        ? principalsMap.get(agent.principal_user_id)
        : null;

      return {
        id: agent.id,
        name: agent.name,
        model: agent.name, // Extract model name from agent name
        description: agent.marketplace_description || agent.description,
        capabilities: (agent.capabilities as any)?.capabilities || [],
        hourlyRate: agent.hourly_rate?.toString(),
        controlledBy: principal || {
          username: 'unknown',
          humanName: 'Unknown',
          profileUrl: '#',
        },
        closedContracts: 0, // TODO: Calculate from marketplace_contracts
      };
    });

    // Filter by capabilities in-memory (if needed)
    if (capabilities.length > 0) {
      results = results.filter((agent) =>
        capabilities.some((cap) =>
          agent.capabilities.some((agentCap: string) =>
            agentCap.toLowerCase().includes(cap.toLowerCase())
          )
        )
      );
    }

    return NextResponse.json({
      results,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('[agents-search] Error:', error);
    return NextResponse.json(
      { error: 'Failed to search agents' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
