import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/investors/agreements/[id]/clawback - Execute clawback (founders only)
export async function POST(
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

    // Fetch agreement with tokens
    const { data: agreement, error: fetchError } = await supabase
      .from('investor_agreements')
      .select(`
        *,
        domain_exit_tokens (*)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
    }

    // Only founder can execute clawback
    if (agreement.founder_user_id !== user.id) {
      return NextResponse.json({ error: 'Only founder can execute clawback' }, { status: 403 });
    }

    // Check if clawback can be triggered
    if (agreement.clawback_status === 'triggered') {
      return NextResponse.json({ error: 'Clawback has already been executed' }, { status: 400 });
    }

    if (agreement.clawback_status === 'waived') {
      return NextResponse.json({
        error: 'Clawback has been waived because investor met performance obligations'
      }, { status: 400 });
    }

    // Check if any obligation was met
    const obligations = agreement.performance_obligations || {};
    const anyObligationMet = Object.values(obligations).some((o: { met?: boolean }) => o.met);

    if (anyObligationMet) {
      return NextResponse.json({
        error: 'Cannot execute clawback - investor has met at least one performance obligation',
        obligations_met: Object.entries(obligations)
          .filter(([_, v]: [string, { met?: boolean }]) => v.met)
          .map(([k]) => k)
      }, { status: 400 });
    }

    // Check if we're past the performance deadline
    const deadline = new Date(agreement.performance_deadline);
    const now = new Date();

    if (now < deadline) {
      const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return NextResponse.json({
        error: `Cannot execute clawback - ${daysRemaining} days remaining until performance deadline`,
        deadline: agreement.performance_deadline,
        days_remaining: daysRemaining
      }, { status: 400 });
    }

    const body = await request.json();
    const { reason, force = false } = body;

    if (!reason) {
      return NextResponse.json({ error: 'Clawback reason is required' }, { status: 400 });
    }

    // Execute clawback - update agreement
    const { error: updateError } = await supabase
      .from('investor_agreements')
      .update({
        clawback_status: 'triggered',
        clawback_triggered_at: new Date().toISOString(),
        clawback_reason: reason,
        performance_status: 'failed',
        current_equity_percentage: 0, // Investor loses all equity
        twelve_month_decision: 'clawback_executed',
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error executing clawback:', updateError);
      return NextResponse.json({ error: 'Failed to execute clawback' }, { status: 500 });
    }

    // Update all domain tokens to forfeited
    const { error: tokensError } = await supabase
      .from('domain_exit_tokens')
      .update({
        token_status: 'forfeited',
        forfeited_at: new Date().toISOString(),
        forfeited_reason: reason,
      })
      .eq('agreement_id', id);

    if (tokensError) {
      console.error('Error forfeiting tokens:', tokensError);
    }

    // Log the clawback
    await supabase
      .from('agreement_performance_logs')
      .insert({
        agreement_id: id,
        log_type: 'clawback',
        description: `CLAWBACK EXECUTED: ${reason}. Investor ${agreement.investor_name}'s tokens for ${(agreement.properties as string[]).join(', ')} have been forfeited.`,
        logged_by_user_id: user.id,
        logged_by_name: 'Founder',
        metadata: {
          action: 'clawback_executed',
          reason,
          tokens_forfeited: agreement.domain_exit_tokens?.map((t: { domain_name: string; investor_tokens: number }) => ({
            domain: t.domain_name,
            tokens: t.investor_tokens
          })),
          previous_equity: agreement.current_equity_percentage,
        }
      });

    return NextResponse.json({
      success: true,
      message: 'Clawback executed successfully',
      clawback_details: {
        agreement_id: id,
        investor_name: agreement.investor_name,
        reason,
        triggered_at: new Date().toISOString(),
        tokens_forfeited: agreement.domain_exit_tokens?.length || 0,
        domains_affected: agreement.properties,
      }
    });

  } catch (error) {
    console.error('Clawback POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/investors/agreements/[id]/clawback - Get clawback status
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

    // Fetch agreement
    const { data: agreement, error: fetchError } = await supabase
      .from('investor_agreements')
      .select(`
        id,
        investor_name,
        properties,
        performance_deadline,
        performance_status,
        performance_obligations,
        clawback_status,
        clawback_triggered_at,
        clawback_reason,
        current_equity_percentage,
        user_id,
        founder_user_id
      `)
      .eq('id', id)
      .single();

    if (fetchError || !agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
    }

    // Check user has access
    if (agreement.user_id !== user.id && agreement.founder_user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const deadline = new Date(agreement.performance_deadline);
    const now = new Date();
    const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Check which obligations are met
    const obligations = agreement.performance_obligations || {};
    const metObligations = Object.entries(obligations)
      .filter(([_, v]: [string, { met?: boolean }]) => v.met)
      .map(([k]) => k);

    // Determine if clawback can be executed
    const canExecuteClawback =
      agreement.clawback_status === 'active' &&
      metObligations.length === 0 &&
      daysUntilDeadline <= 0;

    return NextResponse.json({
      agreement_id: agreement.id,
      investor_name: agreement.investor_name,
      clawback_status: agreement.clawback_status,
      clawback_triggered_at: agreement.clawback_triggered_at,
      clawback_reason: agreement.clawback_reason,
      performance_deadline: agreement.performance_deadline,
      days_until_deadline: daysUntilDeadline,
      is_past_deadline: daysUntilDeadline <= 0,
      performance_status: agreement.performance_status,
      obligations_met: metObligations,
      can_execute_clawback: canExecuteClawback,
      current_equity_percentage: agreement.current_equity_percentage,
      why_clawback_blocked: !canExecuteClawback
        ? agreement.clawback_status === 'triggered'
          ? 'Clawback already executed'
          : agreement.clawback_status === 'waived'
            ? 'Investor met obligations'
            : metObligations.length > 0
              ? `Investor met obligations: ${metObligations.join(', ')}`
              : daysUntilDeadline > 0
                ? `${daysUntilDeadline} days until deadline`
                : null
        : null,
    });

  } catch (error) {
    console.error('Clawback GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
