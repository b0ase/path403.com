import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/investors/agreements/[id]/performance - Log performance update
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

    // Fetch agreement
    const { data: agreement, error: fetchError } = await supabase
      .from('investor_agreements')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
    }

    // Check user has access
    const isFounder = agreement.founder_user_id === user.id;
    const isInvestor = agreement.user_id === user.id;

    if (!isFounder && !isInvestor) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();

    const {
      log_type, // 'capital_raised', 'work_completed', 'pro_rata_participated', 'equity_funded', 'sync_call', 'review', 'other'
      description,
      amount_usd,
      amount_bsv,
      evidence_url,
      evidence_type,
      obligation_met, // Which obligation was met: 'option_a', 'option_b', 'option_c', 'option_d'
      metadata = {},
    } = body;

    // Validation
    if (!log_type || !description) {
      return NextResponse.json({
        error: 'Missing required fields',
        required: ['log_type', 'description']
      }, { status: 400 });
    }

    // Create performance log
    const { data: log, error: logError } = await supabase
      .from('agreement_performance_logs')
      .insert({
        agreement_id: id,
        log_type,
        description,
        amount_usd,
        amount_bsv,
        evidence_url,
        evidence_type,
        logged_by_user_id: user.id,
        logged_by_name: isFounder ? 'Founder' : agreement.investor_name,
        metadata: {
          ...metadata,
          obligation_met,
          logged_by_role: isFounder ? 'founder' : 'investor'
        }
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating performance log:', logError);
      return NextResponse.json({ error: 'Failed to log performance update' }, { status: 500 });
    }

    // If an obligation was marked as met, update the agreement
    if (obligation_met && isFounder) {
      const obligations = agreement.performance_obligations || {};

      // Mark the obligation as met
      if (obligations[obligation_met]) {
        obligations[obligation_met].met = true;
        obligations[obligation_met].met_date = new Date().toISOString();
        obligations[obligation_met].evidence = evidence_url;
      }

      // Determine new performance status
      const metObligations = Object.entries(obligations).filter(([_, v]: [string, { met?: boolean }]) => v.met);
      let newStatus = agreement.performance_status;

      if (metObligations.length > 1) {
        newStatus = 'multiple_met';
      } else if (metObligations.length === 1) {
        newStatus = `${metObligations[0][0]}_met`;
      }

      // Update agreement
      const { error: updateError } = await supabase
        .from('investor_agreements')
        .update({
          performance_obligations: obligations,
          performance_status: newStatus,
          clawback_status: metObligations.length > 0 ? 'waived' : 'active',
        })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating agreement status:', updateError);
      }
    }

    // Add to performance evidence array
    const existingEvidence = agreement.performance_evidence || [];
    existingEvidence.push({
      log_id: log.id,
      date: new Date().toISOString(),
      type: log_type,
      description,
      amount_usd,
      evidence_url,
    });

    await supabase
      .from('investor_agreements')
      .update({ performance_evidence: existingEvidence })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      log,
      message: obligation_met
        ? `Performance obligation ${obligation_met} marked as met`
        : 'Performance update logged'
    }, { status: 201 });

  } catch (error) {
    console.error('Performance POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/investors/agreements/[id]/performance - Get performance history
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

    // Fetch agreement to verify access
    const { data: agreement, error: fetchError } = await supabase
      .from('investor_agreements')
      .select('user_id, founder_user_id, performance_obligations, performance_status')
      .eq('id', id)
      .single();

    if (fetchError || !agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
    }

    // Check user has access
    if (agreement.user_id !== user.id && agreement.founder_user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch performance logs
    const { data: logs, error: logsError } = await supabase
      .from('agreement_performance_logs')
      .select('*')
      .eq('agreement_id', id)
      .order('log_date', { ascending: false });

    if (logsError) {
      console.error('Error fetching performance logs:', logsError);
      return NextResponse.json({ error: 'Failed to fetch performance history' }, { status: 500 });
    }

    // Calculate summary stats
    const capitalRaised = logs
      ?.filter(l => l.log_type === 'capital_raised')
      .reduce((sum, l) => sum + (parseFloat(l.amount_usd) || 0), 0) || 0;

    const workCompletedCount = logs?.filter(l => l.log_type === 'work_completed').length || 0;
    const syncCallsCount = logs?.filter(l => l.log_type === 'sync_call').length || 0;

    return NextResponse.json({
      logs,
      summary: {
        total_logs: logs?.length || 0,
        capital_raised_usd: capitalRaised,
        work_items_completed: workCompletedCount,
        sync_calls_held: syncCallsCount,
        performance_status: agreement.performance_status,
        obligations_met: Object.entries(agreement.performance_obligations || {})
          .filter(([_, v]: [string, { met?: boolean }]) => v.met)
          .map(([k]) => k),
      }
    });

  } catch (error) {
    console.error('Performance GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
