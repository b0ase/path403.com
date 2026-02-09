import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/investors/agreements/[id] - Get specific agreement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch agreement with related data
    const { data: agreement, error } = await supabase
      .from('investor_agreements')
      .select(`
        *,
        domain_exit_tokens (*),
        agreement_performance_logs (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching agreement:', error);
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
    }

    // Check user has access (is investor or founder)
    if (agreement.user_id !== user.id && agreement.founder_user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Determine user's role
    const userRole = agreement.founder_user_id === user.id ? 'founder' : 'investor';

    // Calculate days until deadline
    const deadline = new Date(agreement.performance_deadline);
    const now = new Date();
    const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return NextResponse.json({
      agreement,
      user_role: userRole,
      days_until_deadline: daysUntilDeadline,
      is_past_deadline: daysUntilDeadline < 0,
    });

  } catch (error) {
    console.error('Agreement GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/investors/agreements/[id] - Update agreement
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch agreement to check permissions
    const { data: existing, error: fetchError } = await supabase
      .from('investor_agreements')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
    }

    // Only founder can update most fields
    const isFounder = existing.founder_user_id === user.id;
    const isInvestor = existing.user_id === user.id;

    if (!isFounder && !isInvestor) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();

    // Fields that founders can update
    const founderUpdatableFields = [
      'performance_status',
      'performance_notes',
      'performance_evidence',
      'performance_obligations',
      'clawback_status',
      'clawback_triggered_at',
      'clawback_reason',
      'contract_txid',
      'contract_inscription_id',
      'monthly_sync_history',
      'next_sync_date',
      'six_month_review_status',
      'twelve_month_decision',
      'current_equity_percentage',
    ];

    // Fields that investors can update (limited)
    const investorUpdatableFields = [
      'investor_wallet_address',
    ];

    // Build update object based on role
    const allowedFields = isFounder ? founderUpdatableFields : investorUpdatableFields;
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Update agreement
    const { data: updated, error: updateError } = await supabase
      .from('investor_agreements')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating agreement:', updateError);
      return NextResponse.json({ error: 'Failed to update agreement' }, { status: 500 });
    }

    // Log the update
    await supabase
      .from('agreement_performance_logs')
      .insert({
        agreement_id: id,
        log_type: 'other',
        description: `Agreement updated: ${Object.keys(updateData).join(', ')}`,
        logged_by_user_id: user.id,
        logged_by_name: isFounder ? 'Founder' : 'Investor',
        metadata: { updated_fields: Object.keys(updateData), previous_values: existing }
      });

    return NextResponse.json({
      success: true,
      agreement: updated,
      updated_fields: Object.keys(updateData)
    });

  } catch (error) {
    console.error('Agreement PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/investors/agreements/[id] - Delete agreement (founders only, draft only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch agreement to check permissions
    const { data: existing, error: fetchError } = await supabase
      .from('investor_agreements')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
    }

    // Only founder can delete
    if (existing.founder_user_id !== user.id) {
      return NextResponse.json({ error: 'Only founder can delete agreements' }, { status: 403 });
    }

    // Can only delete if not yet inscribed on blockchain
    if (existing.contract_txid) {
      return NextResponse.json({
        error: 'Cannot delete agreement that has been inscribed on blockchain'
      }, { status: 400 });
    }

    // Delete (cascades to tokens and logs)
    const { error: deleteError } = await supabase
      .from('investor_agreements')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting agreement:', deleteError);
      return NextResponse.json({ error: 'Failed to delete agreement' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Agreement deleted'
    });

  } catch (error) {
    console.error('Agreement DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
