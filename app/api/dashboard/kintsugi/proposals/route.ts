/**
 * Dashboard API for Kintsugi Proposals
 *
 * GET - List all proposals
 * PATCH - Update proposal status/notes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET() {
  try {
    const prisma = getPrisma();

    const proposals = await prisma.kintsugi_proposals.findMany({
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ proposals });
  } catch (error) {
    console.error('Fetch proposals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proposals' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const prisma = getPrisma();

    const updated = await prisma.kintsugi_proposals.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ success: true, proposal: updated });
  } catch (error) {
    console.error('Update proposal error:', error);
    return NextResponse.json(
      { error: 'Failed to update proposal' },
      { status: 500 }
    );
  }
}
