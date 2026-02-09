/**
 * Milestone Submission API
 *
 * POST /api/marketplace/milestones/[id]/submit
 * Developer submits a completed milestone for client review
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPrisma } from '@/lib/prisma';
import { sendNotification, NotificationType } from '@/lib/notification-service';
import { createClient } from '@/lib/supabase/server';

const submitSchema = z.object({
  deliverableDescription: z.string().min(1).max(2000),
  deliverableUrls: z.array(z.string().url()).optional(),
  notes: z.string().max(2000).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: milestoneId } = await params;
    const body = await request.json();
    const data = submitSchema.parse(body);

    // Get current user from Supabase auth (secure - validated JWT)
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = user.id;
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

    // Verify user is the developer
    if (milestone.marketplace_contracts.developer_user_id !== userId) {
      return NextResponse.json(
        { error: 'Only the developer can submit milestones' },
        { status: 403 }
      );
    }

    // Verify milestone is in correct state
    if (milestone.status !== 'pending') {
      return NextResponse.json(
        { error: `Milestone cannot be submitted. Current status: ${milestone.status}` },
        { status: 400 }
      );
    }

    // Update milestone
    const updatedMilestone = await prisma.contract_milestones.update({
      where: { id: milestoneId },
      data: {
        status: 'submitted',
        deliverable_description: data.deliverableDescription,
        deliverable_urls: data.deliverableUrls || [],
        developer_notes: data.notes,
        submitted_at: new Date(),
      },
    });

    // Send notification to client
    const clientProfile = await prisma.profiles.findUnique({
      where: { id: milestone.marketplace_contracts.client_user_id },
      select: { email: true, full_name: true },
    });

    if (clientProfile?.email) {
      await sendNotification(NotificationType.MILESTONE_SUBMITTED, {
        recipientEmail: clientProfile.email,
        recipientName: clientProfile.full_name || 'Client',
        contractId: milestone.contract_id,
        contractTitle: milestone.marketplace_contracts.service_title || 'Service Contract',
        contractUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/contracts/${milestone.contract_id}`,
        additionalData: {
          milestoneTitle: milestone.title,
          deliverableDescription: data.deliverableDescription,
        },
      });
    }

    return NextResponse.json({
      success: true,
      milestone: {
        id: updatedMilestone.id,
        status: updatedMilestone.status,
        submittedAt: updatedMilestone.submitted_at,
      },
    });
  } catch (error) {
    console.error('[milestone-submit] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit milestone' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
