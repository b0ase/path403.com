/**
 * $402 Vote Cast API
 *
 * POST - Cast a vote (token holder only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: voteId } = await params;
    const userHandle = req.cookies.get('b0ase_user_handle')?.value;

    if (!userHandle) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { selectedOption } = body;

    if (selectedOption === undefined || selectedOption === null) {
      return NextResponse.json({ error: 'selectedOption is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get vote details
    const { data: vote } = await supabase
      .from('votes')
      .select('id, token_id, status, options, vote_type, min_tokens_to_vote, starts_at, ends_at')
      .eq('id', voteId)
      .single();

    if (!vote) {
      return NextResponse.json({ error: 'Vote not found' }, { status: 404 });
    }

    // Check vote is active
    const now = new Date();
    const startsAt = new Date(vote.starts_at);
    const endsAt = new Date(vote.ends_at);

    if (now < startsAt) {
      return NextResponse.json({ error: 'Vote has not started yet' }, { status: 400 });
    }

    if (now > endsAt || vote.status === 'closed') {
      return NextResponse.json({ error: 'Vote has ended' }, { status: 400 });
    }

    if (vote.status === 'cancelled') {
      return NextResponse.json({ error: 'Vote has been cancelled' }, { status: 400 });
    }

    // Validate option
    if (selectedOption < 0 || selectedOption >= vote.options.length) {
      return NextResponse.json({
        error: `Invalid option. Must be 0-${vote.options.length - 1}`,
      }, { status: 400 });
    }

    // Get user's holding
    const { data: holding } = await supabase
      .from('path402_holdings')
      .select('id, quantity, registered')
      .eq('token_id', vote.token_id)
      .eq('user_handle', userHandle)
      .single();

    if (!holding) {
      return NextResponse.json({
        error: 'You do not hold any tokens for this vote',
      }, { status: 403 });
    }

    if (holding.quantity < vote.min_tokens_to_vote) {
      return NextResponse.json({
        error: `Minimum ${vote.min_tokens_to_vote} tokens required to vote`,
      }, { status: 403 });
    }

    // Check for existing ballot
    const { data: existingBallot } = await supabase
      .from('vote_ballots')
      .select('id')
      .eq('vote_id', voteId)
      .eq('user_handle', userHandle)
      .single();

    if (existingBallot) {
      return NextResponse.json({
        error: 'You have already voted',
      }, { status: 400 });
    }

    // Calculate vote weight based on vote type
    let voteWeight = 1;
    switch (vote.vote_type) {
      case 'simple':
        voteWeight = 1;
        break;
      case 'weighted':
        voteWeight = holding.quantity;
        break;
      case 'quadratic':
        voteWeight = Math.floor(Math.sqrt(holding.quantity));
        break;
    }

    // Cast the ballot
    const { data: ballot, error } = await supabase
      .from('vote_ballots')
      .insert({
        vote_id: voteId,
        user_handle: userHandle,
        holding_id: holding.id,
        selected_option: selectedOption,
        vote_weight: voteWeight,
        cast_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[Votes] Cast error:', error);
      return NextResponse.json({ error: 'Failed to cast vote' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      ballot: {
        id: ballot.id,
        selectedOption,
        optionText: vote.options[selectedOption],
        voteWeight,
        voteType: vote.vote_type,
      },
      message: `Vote cast successfully for "${vote.options[selectedOption]}" with weight ${voteWeight}`,
    });
  } catch (error) {
    console.error('[Votes] Cast Error:', error);
    return NextResponse.json({ error: 'Failed to cast vote' }, { status: 500 });
  }
}
