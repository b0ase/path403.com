import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/admin';
import { z } from 'zod';

const cancelSchema = z.object({
  purchaseId: z.string().uuid(),
  reason: z.string().min(1).max(500),
});

/**
 * POST /api/admin/purchases/cancel
 *
 * Cancel a pending purchase.
 * Only admins can cancel purchases.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = cancelSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid request',
        details: validation.error.issues,
      }, { status: 400 });
    }

    const { purchaseId, reason } = validation.data;

    // Get the purchase
    const { data: purchase, error: purchaseError } = await supabase
      .from('token_purchases')
      .select('*')
      .eq('id', purchaseId)
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    if (purchase.status !== 'pending') {
      return NextResponse.json({
        error: `Cannot cancel purchase with status: ${purchase.status}`,
      }, { status: 400 });
    }

    // Get admin's unified_user_id for audit trail
    const { data: adminIdentity } = await supabase
      .from('user_identities')
      .select('unified_user_id')
      .eq('provider', 'supabase')
      .eq('provider_user_id', user.id)
      .limit(1);

    const adminUnifiedId = adminIdentity?.[0]?.unified_user_id;

    // Update purchase status
    const { error: updateError } = await supabase
      .from('token_purchases')
      .update({
        status: 'cancelled',
        confirmed_by: adminUnifiedId, // Track who cancelled
        notes: purchase.notes
          ? `${purchase.notes}\n[Cancelled] ${reason}`
          : `[Cancelled] ${reason}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', purchaseId);

    if (updateError) {
      console.error('[admin/purchases/cancel] Failed to cancel purchase:', updateError);
      return NextResponse.json({ error: 'Failed to cancel purchase' }, { status: 500 });
    }

    console.log(`[admin/purchases/cancel] Purchase ${purchaseId} cancelled by admin. Reason: ${reason}`);

    return NextResponse.json({
      success: true,
      message: 'Purchase cancelled',
      purchase: {
        id: purchaseId,
        status: 'cancelled',
        reason,
      },
    });
  } catch (error) {
    console.error('[admin/purchases/cancel] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
