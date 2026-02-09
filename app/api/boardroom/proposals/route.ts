import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  verifyVotingPower,
  meetsTokenRequirement,
  formatVotingPower
} from '@/lib/boardroom/token-verification';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Proposal {
  id: string;
  room_id: string;
  title: string;
  description: string;
  proposer_wallet: string;
  proposer_name?: string;
  voting_type: 'simple' | 'multiple_choice' | 'ranked';
  options: string[];
  token_weighted: boolean;
  required_token?: string;
  starts_at: string;
  ends_at: string;
  status: 'draft' | 'active' | 'passed' | 'rejected' | 'cancelled';
  result?: Record<string, number>;
  total_votes: number;
  total_voting_power: number;
}

/**
 * GET /api/boardroom/proposals
 *
 * Get proposals for a room, or a specific proposal
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId') || 'general';
    const proposalId = searchParams.get('id');
    const status = searchParams.get('status'); // 'active', 'passed', 'rejected', 'all'

    // Get specific proposal
    if (proposalId) {
      const { data: proposal, error } = await supabase
        .from('boardroom_proposals')
        .select('*')
        .eq('id', proposalId)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
      }

      // Get votes for this proposal
      const { data: votes } = await supabase
        .from('boardroom_votes')
        .select('*')
        .eq('proposal_id', proposalId);

      // Calculate results
      const results = calculateResults(proposal.options, votes || []);

      return NextResponse.json({
        proposal: {
          ...proposal,
          results,
          votes: votes?.length || 0
        }
      });
    }

    // Get proposals for room
    let query = supabase
      .from('boardroom_proposals')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: proposals, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get vote counts for each proposal
    const proposalsWithCounts = await Promise.all(
      (proposals || []).map(async (p) => {
        const { count } = await supabase
          .from('boardroom_votes')
          .select('*', { count: 'exact', head: true })
          .eq('proposal_id', p.id);

        return { ...p, vote_count: count || 0 };
      })
    );

    return NextResponse.json({ proposals: proposalsWithCounts });

  } catch (error) {
    console.error('[proposals] GET error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/boardroom/proposals
 *
 * Create a new proposal or cast a vote
 */
export async function POST(req: NextRequest) {
  try {
    const walletAddress = req.cookies.get('b0ase_wallet_address')?.value;

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet connection required' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    // Create new proposal
    if (action === 'create') {
      const { roomId, title, description, options, endsAt, tokenWeighted, requiredToken, minTokensToPropose } = body;

      if (!roomId || !title || !description || !endsAt) {
        return NextResponse.json({
          error: 'roomId, title, description, and endsAt required'
        }, { status: 400 });
      }

      // Verify proposer has tokens to create proposals
      const proposerTokens = await verifyVotingPower(walletAddress, requiredToken || undefined);

      if (!proposerTokens.verified || proposerTokens.votingPower <= BigInt(0)) {
        return NextResponse.json({
          error: 'You must hold tokens to create proposals',
          tokenSymbol: proposerTokens.tokenSymbol
        }, { status: 403 });
      }

      // Check minimum token requirement if specified
      const minRequired = BigInt(minTokensToPropose || 1);
      if (proposerTokens.votingPower < minRequired) {
        return NextResponse.json({
          error: `Minimum ${minRequired.toString()} tokens required to create proposals`,
          currentBalance: proposerTokens.votingPower.toString(),
          tokenSymbol: proposerTokens.tokenSymbol
        }, { status: 403 });
      }

      const { data: proposal, error } = await supabase
        .from('boardroom_proposals')
        .insert({
          room_id: roomId,
          title,
          description,
          proposer_wallet: walletAddress,
          options: options || ['Yes', 'No'],
          voting_type: options && options.length > 2 ? 'multiple_choice' : 'simple',
          token_weighted: tokenWeighted !== false,
          required_token: requiredToken,
          min_tokens_to_propose: Number(minRequired),
          ends_at: new Date(endsAt).toISOString(),
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        proposal,
        proposerVotingPower: formatVotingPower(proposerTokens.votingPower),
        tokenSymbol: proposerTokens.tokenSymbol
      });
    }

    // Cast a vote
    if (action === 'vote') {
      const { proposalId, choice } = body;

      if (!proposalId || choice === undefined) {
        return NextResponse.json({
          error: 'proposalId and choice required'
        }, { status: 400 });
      }

      // Check proposal exists and is active
      const { data: proposal } = await supabase
        .from('boardroom_proposals')
        .select('*')
        .eq('id', proposalId)
        .single();

      if (!proposal) {
        return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
      }

      if (proposal.status !== 'active') {
        return NextResponse.json({ error: 'Proposal is not active' }, { status: 400 });
      }

      if (new Date(proposal.ends_at) < new Date()) {
        return NextResponse.json({ error: 'Voting has ended' }, { status: 400 });
      }

      // Check valid choice
      if (choice < 0 || choice >= proposal.options.length) {
        return NextResponse.json({ error: 'Invalid choice' }, { status: 400 });
      }

      // VERIFY TOKEN OWNERSHIP ON-CHAIN
      // This is the critical security check - we verify the voter actually owns tokens
      const votingResult = await verifyVotingPower(
        walletAddress,
        proposal.required_token || undefined
      );

      if (!votingResult.verified || votingResult.votingPower <= BigInt(0)) {
        return NextResponse.json({
          error: votingResult.error || 'No voting power. You must hold tokens to vote.',
          tokenSymbol: votingResult.tokenSymbol,
          requiredToken: proposal.required_token
        }, { status: 403 });
      }

      // For token-weighted voting, use actual token balance
      // For non-weighted voting, each holder gets 1 vote regardless of balance
      const verifiedVotingPower = proposal.token_weighted
        ? Number(votingResult.votingPower)
        : 1;

      // Insert or update vote with VERIFIED voting power
      const { data: vote, error } = await supabase
        .from('boardroom_votes')
        .upsert({
          proposal_id: proposalId,
          voter_wallet: walletAddress,
          choice,
          voting_power: verifiedVotingPower,
          token_balance: votingResult.tokenBalance.toString(),
          verified_at: new Date().toISOString()
        }, {
          onConflict: 'proposal_id,voter_wallet'
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update proposal vote counts
      const { data: allVotes } = await supabase
        .from('boardroom_votes')
        .select('*')
        .eq('proposal_id', proposalId);

      const totalVotes = allVotes?.length || 0;
      const totalVotingPower = allVotes?.reduce((sum, v) => sum + (v.voting_power || 1), 0) || 0;

      await supabase
        .from('boardroom_proposals')
        .update({
          total_votes: totalVotes,
          total_voting_power: totalVotingPower,
          updated_at: new Date().toISOString()
        })
        .eq('id', proposalId);

      return NextResponse.json({
        success: true,
        vote,
        verifiedVotingPower: formatVotingPower(votingResult.votingPower),
        tokenBalance: votingResult.tokenBalance.toString(),
        tokenSymbol: votingResult.tokenSymbol,
        message: `Vote cast for "${proposal.options[choice]}" with ${formatVotingPower(votingResult.votingPower)} voting power`
      });
    }

    // Close proposal and calculate results
    if (action === 'close') {
      const { proposalId } = body;

      const { data: proposal } = await supabase
        .from('boardroom_proposals')
        .select('*')
        .eq('id', proposalId)
        .single();

      if (!proposal) {
        return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
      }

      // Only proposer or admin can close
      if (proposal.proposer_wallet !== walletAddress) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }

      // Get all votes
      const { data: votes } = await supabase
        .from('boardroom_votes')
        .select('*')
        .eq('proposal_id', proposalId);

      // Calculate results
      const results = calculateResults(proposal.options, votes || []);
      const winningChoice = Object.entries(results.byOption)
        .sort((a, b) => b[1] - a[1])[0];

      // Determine status
      const status = winningChoice[0] === 'Yes' ? 'passed' : 'rejected';

      // Update proposal
      const { data: updated, error } = await supabase
        .from('boardroom_proposals')
        .update({
          status,
          result: results,
          updated_at: new Date().toISOString()
        })
        .eq('id', proposalId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        proposal: updated,
        results
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('[proposals] POST error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * Calculate voting results
 */
function calculateResults(options: string[], votes: any[]) {
  const byOption: Record<string, number> = {};
  const byPower: Record<string, number> = {};

  // Initialize
  options.forEach((opt, i) => {
    byOption[opt] = 0;
    byPower[opt] = 0;
  });

  // Count votes
  votes.forEach(vote => {
    const opt = options[vote.choice];
    if (opt) {
      byOption[opt]++;
      byPower[opt] += vote.voting_power || 1;
    }
  });

  const totalVotes = votes.length;
  const totalPower = votes.reduce((sum, v) => sum + (v.voting_power || 1), 0);

  // Calculate percentages
  const percentages: Record<string, number> = {};
  const powerPercentages: Record<string, number> = {};

  options.forEach(opt => {
    percentages[opt] = totalVotes > 0 ? (byOption[opt] / totalVotes) * 100 : 0;
    powerPercentages[opt] = totalPower > 0 ? (byPower[opt] / totalPower) * 100 : 0;
  });

  return {
    byOption,
    byPower,
    percentages,
    powerPercentages,
    totalVotes,
    totalPower
  };
}
