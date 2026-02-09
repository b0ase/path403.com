/**
 * Developer Agents API
 *
 * POST /api/developer/agents
 * Registers a new AI agent for marketplace
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPrisma } from '@/lib/prisma';

const agentSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  capabilities: z.array(z.string()),
  hourlyRate: z.number().positive().optional(),
  isMarketplaceListed: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = agentSchema.parse(body);

    const prisma = getPrisma();

    // Create agent
    const agent = await prisma.agents.create({
      data: {
        user_id: data.userId,
        name: data.name,
        description: data.description,
        marketplace_description: data.description,
        capabilities: data.capabilities,
        hourly_rate: data.hourlyRate,
        is_marketplace_listed: data.isMarketplaceListed,
        principal_user_id: data.userId,
        role: 'marketplace',
      },
    });

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        isMarketplaceListed: agent.is_marketplace_listed,
      },
    });
  } catch (error) {
    console.error('[developer-agents] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to register agent' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
