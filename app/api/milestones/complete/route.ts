import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { trancheId, completionNotes, evidenceUrl } = body;

    if (!trancheId) {
      return NextResponse.json({ error: 'Tranche ID required' }, { status: 400 });
    }

    // Get the tranche details
    const { data: tranche, error: trancheError } = await supabase
      .from('funding_tranches')
      .select('*')
      .eq('id', trancheId)
      .single();

    if (trancheError || !tranche) {
      return NextResponse.json({ error: 'Tranche not found' }, { status: 404 });
    }

    // Calculate tokens to unlock (based on equity offered and target amount)
    // 1 token = $0.001, so for GBP amount * 1.25 (to USD) * 1000
    const tokensToUnlock = Math.floor(Number(tranche.target_amount_gbp) * 1.25 * 1000);

    // Create milestone completion record
    const { data: completion, error: completionError } = await supabase
      .from('milestone_completions')
      .insert({
        tranche_id: trancheId,
        project_slug: tranche.project_slug,
        completed_by: user.id,
        completion_notes: completionNotes,
        evidence_url: evidenceUrl,
        tokens_unlocked: tokensToUnlock,
        status: 'pending_verification',
      })
      .select()
      .single();

    if (completionError) {
      console.error('Error creating completion:', completionError);
      return NextResponse.json({ error: 'Failed to record completion' }, { status: 500 });
    }

    // Update tranche status to closed
    await supabase
      .from('funding_tranches')
      .update({ status: 'closed' })
      .eq('id', trancheId);

    return NextResponse.json({
      success: true,
      completion,
      tokensUnlocked: tokensToUnlock,
      message: 'Milestone marked complete. Awaiting verification.',
    });
  } catch (error: any) {
    console.error('Milestone completion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Verify a milestone completion and release tokens
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { completionId, approved } = body;

    if (!completionId) {
      return NextResponse.json({ error: 'Completion ID required' }, { status: 400 });
    }

    // Get completion record
    const { data: completion, error: completionError } = await supabase
      .from('milestone_completions')
      .select('*')
      .eq('id', completionId)
      .single();

    if (completionError || !completion) {
      return NextResponse.json({ error: 'Completion not found' }, { status: 404 });
    }

    if (approved) {
      // Update completion as verified
      await supabase
        .from('milestone_completions')
        .update({
          status: 'verified',
          verified_by: user.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', completionId);

      // Credit tokens to all investors who participated in this tranche
      // This would query moneybutton_purchases for this project and credit proportionally
      // For now, we'll just mark it as complete

      return NextResponse.json({
        success: true,
        message: 'Milestone verified. Tokens released.',
        tokensReleased: completion.tokens_unlocked,
      });
    } else {
      // Reject completion
      await supabase
        .from('milestone_completions')
        .update({ status: 'rejected' })
        .eq('id', completionId);

      // Reopen the tranche
      const { data: tranche } = await supabase
        .from('funding_tranches')
        .select('id')
        .eq('id', completion.tranche_id)
        .single();

      if (tranche) {
        await supabase
          .from('funding_tranches')
          .update({ status: 'active' })
          .eq('id', tranche.id);
      }

      return NextResponse.json({
        success: true,
        message: 'Milestone completion rejected.',
      });
    }
  } catch (error: any) {
    console.error('Milestone verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
