
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPrisma } from '@/lib/prisma';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Params is a promise in Next.js 15+
) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params; // Await params
        const prisma = getPrisma();

        // 1. Check if tender exists and is open
        const tender = await prisma.marketplace_tenders.findUnique({
            where: { id },
            include: {
                pipeline_stages: {
                    include: {
                        projects: true
                    }
                }
            }
        });

        if (!tender) {
            return NextResponse.json({ error: 'Tender not found' }, { status: 404 });
        }

        if (tender.status !== 'open') {
            return NextResponse.json({ error: 'Tender is no longer open' }, { status: 400 });
        }

        // 2. Assign to developer (Claim)
        // In a real marketplace, this might create an 'application' record.
        // Here, we are implementing a "Claim" model for speed/automation.
        const updatedTender = await prisma.marketplace_tenders.update({
            where: { id },
            data: {
                status: 'in_progress', // Move to in-progress
                awarded_developer_id: user.id
            }
        });

        // 3. Update the Pipeline Stage status too
        await prisma.pipeline_stages.update({
            where: { id: tender.stage_id },
            data: {
                status: 'in_progress',
                started_at: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            tender: updatedTender,
            message: 'Gig claimed successfully!'
        });

    } catch (error: any) {
        console.error('Apply Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
