/**
 * Milestone Rejection API
 *
 * POST /api/marketplace/milestones/[id]/reject
 * Client rejects a submitted milestone, requesting revision
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPrisma } from '@/lib/prisma';
import { sendNotification, NotificationType } from '@/lib/notification-service';

const rejectSchema = z.object({
  reason: z.string().min(10).max(2000),
  requestedChanges: z.string().min(10).max(2000),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: milestoneId } = await params;
    const body = await request.json();
    const data = rejectSchema.parse(body);

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
        marketplace_contracts: true,
      },
    });

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    // Verify user is the client
    if (milestone.marketplace_contracts.client_user_id !== userId) {
      return NextResponse.json(
        { error: 'Only the client can reject milestones' },
        { status: 403 }
      );
    }

    // Verify milestone is in correct state
    if (milestone.status !== 'submitted') {
      return NextResponse.json(
        { error: `Milestone cannot be rejected. Current status: ${milestone.status}` },
        { status: 400 }
      );
    }

    // Update milestone
    const updatedMilestone = await prisma.contract_milestones.update({
      where: { id: milestoneId },
      data: {
        status: 'revision_requested',
        rejection_reason: data.reason,
        requested_changes: data.requestedChanges,
        rejected_at: new Date(),
      },
    });

    // Send notification to developer
    const developerProfile = await prisma.profiles.findUnique({
      where: { id: milestone.marketplace_contracts.developer_user_id! },
      select: { email: true, full_name: true },
    });

    if (developerProfile?.email) {
      await sendNotification(NotificationType.MILESTONE_REJECTED, {
        recipientEmail: developerProfile.email,
        recipientName: developerProfile.full_name || 'Developer',
        contractId: milestone.contract_id,
        contractTitle: milestone.marketplace_contracts.service_title || 'Service Contract',
        contractUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/contracts/${milestone.contract_id}`,
        additionalData: {
          milestoneTitle: milestone.title,
          rejectionReason: data.reason,
          requestedChanges: data.requestedChanges,
        },
      });
    }

    return NextResponse.json({
      success: true,
      milestone: {
        id: updatedMilestone.id,
        status: updatedMilestone.status,
        rejectedAt: updatedMilestone.rejected_at,
      },
    });
  } catch (error) {
    console.error('[milestone-reject] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to reject milestone' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
