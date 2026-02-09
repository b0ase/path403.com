/**
 * /api/tranches
 *
 * GET - List all tranches (optionally filtered by project_slug)
 * POST - Create a new funding tranche
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createFundingTranche, getProjectTranches } from '@/lib/github-issue-sync';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const createTrancheSchema = z.object({
  projectSlug: z.string().min(1),
  trancheNumber: z.number().int().min(0),
  name: z.string().min(1),
  description: z.string().optional(),
  targetAmountGbp: z.number().positive(),
  pricePerPercent: z.number().positive(),
  equityOffered: z.number().positive().max(100),
  status: z.enum(['upcoming', 'open', 'funded', 'completed']).optional(),
  milestoneSummary: z.string().optional(),
  fundraisingRoundId: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectSlug = searchParams.get('project_slug');

    if (projectSlug) {
      const tranches = await getProjectTranches(projectSlug);
      return NextResponse.json({ tranches });
    }

    // Return all tranches if no filter
    const prisma = getPrisma();
    const tranches = await prisma.funding_tranches.findMany({
      orderBy: [
        { project_slug: 'asc' },
        { tranche_number: 'asc' },
      ],
    });

    return NextResponse.json({ tranches });
  } catch (error) {
    console.error('Error fetching tranches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tranches' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createTrancheSchema.parse(body);

    const tranche = await createFundingTranche(validated);

    return NextResponse.json({ tranche }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating tranche:', error);
    return NextResponse.json(
      { error: 'Failed to create tranche' },
      { status: 500 }
    );
  }
}
