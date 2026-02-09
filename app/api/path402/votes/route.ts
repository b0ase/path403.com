/**
 * $402 Votes API
 *
 * GET - List votes for a token
 * POST - Create a new vote (issuer only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - List votes
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenId = searchParams.get('token');
    const status = searchParams.get('status'); // active, closed, all

    const supabase = await createClient();

    let query = supabase
      .from('votes')
      .select(`
        id,
        token_id,
        title,
        description,
        vote_type,
        options,
        status,
        starts_at,
        ends_at,
        min_tokens_to_vote,
        created_by,
        created_at,
        token:path402_tokens!inner (
          id,
          dollar_address,
          title
        )
      `)
      .order('created_at', { ascending: false });

    if (tokenId) {
      query = query.eq('token_id', tokenId);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: votes, error } = await query;

    if (error) {
      console.error('[Votes] Query error:', error);
      return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 });
    }

    // Get vote counts for each vote
    const voteIds = votes?.map(v => v.id) || [];
    let voteCounts: Record<string, { total: number; byOption: Record<number, number> }> = {};

    if (voteIds.length > 0) {
      const { data: ballots } = await supabase
        .from('vote_ballots')
        .select('vote_id, selected_option, vote_weight')
        .in('vote_id', voteIds);

      if (ballots) {
        voteCounts = ballots.reduce((acc, b) => {
          if (!acc[b.vote_id]) {
            acc[b.vote_id] = { total: 0, byOption: {} };
          }
          acc[b.vote_id].total += b.vote_weight;
          acc[b.vote_id].byOption[b.selected_option] =
            (acc[b.vote_id].byOption[b.selected_option] || 0) + b.vote_weight;
          return acc;
        }, {} as Record<string, { total: number; byOption: Record<number, number> }>);
      }
    }

    return NextResponse.json({
      votes: votes?.map(v => {
        const counts = voteCounts[v.id] || { total: 0, byOption: {} };
        return {
          id: v.id,
          tokenId: v.token_id,
          tokenAddress: (v.token as any).dollar_address,
          tokenName: (v.token as any).title,
          title: v.title,
          description: v.description,
          voteType: v.vote_type,
          options: v.options,
          status: v.status,
          startsAt: v.starts_at,
          endsAt: v.ends_at,
          minTokensToVote: v.min_tokens_to_vote,
          createdBy: v.created_by,
          createdAt: v.created_at,
          totalVoteWeight: counts.total,
          results: v.options.map((opt: string, i: number) => ({
            option: opt,
            weight: counts.byOption[i] || 0,
            percentage: counts.total > 0
              ? Math.round((counts.byOption[i] || 0) / counts.total * 100)
              : 0,
          })),
        };
      }) || [],
    });
  } catch (error) {
    console.error('[Votes] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new vote (issuer only)
export async function POST(req: NextRequest) {
  try {
    const userHandle = req.cookies.get('b0ase_user_handle')?.value;

    if (!userHandle) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { tokenId, title, description, options, voteType, startsAt, endsAt, minTokensToVote } = body;

    // Validate required fields
    if (!tokenId || !title || !options || !endsAt) {
      return NextResponse.json({
        error: 'Missing required fields: tokenId, title, options, endsAt',
      }, { status: 400 });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json({
        error: 'Options must be an array with at least 2 choices',
      }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify user is the issuer and token has voting rights
    const { data: token } = await supabase
      .from('path402_tokens')
      .select('id, issuer_handle, confers_voting')
      .eq('id', tokenId)
      .single();

    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    if (token.issuer_handle !== userHandle) {
      return NextResponse.json({ error: 'Only token issuer can create votes' }, { status: 403 });
    }

    if (!token.confers_voting) {
      return NextResponse.json({ error: 'Token does not confer voting rights' }, { status: 400 });
    }

    const now = new Date();
    const start = startsAt ? new Date(startsAt) : now;
    const end = new Date(endsAt);

    if (end <= start) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    // Create vote
    const { data: vote, error } = await supabase
      .from('votes')
      .insert({
        token_id: tokenId,
        title,
        description,
        vote_type: voteType || 'weighted',
        options,
        status: start <= now ? 'active' : 'draft',
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        min_tokens_to_vote: minTokensToVote || 1,
        created_by: userHandle,
      })
      .select()
      .single();

    if (error) {
      console.error('[Votes] Create error:', error);
      return NextResponse.json({ error: 'Failed to create vote' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      vote: {
        id: vote.id,
        title: vote.title,
        status: vote.status,
        startsAt: vote.starts_at,
        endsAt: vote.ends_at,
        options: vote.options,
      },
      message: `Vote created. Status: ${vote.status}`,
    });
  } catch (error) {
    console.error('[Votes] POST Error:', error);
    return NextResponse.json({ error: 'Failed to create vote' }, { status: 500 });
  }
}
