import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Cron endpoint to finalize expired proposals
 *
 * This runs periodically (every 5 minutes) to:
 * 1. Find proposals that have ended but are still 'active'
 * 2. Calculate final results
 * 3. Update status to 'passed' or 'rejected'
 *
 * Configured in vercel.json with schedule: every 5 minutes
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret for security (Vercel sets this header)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Allow in development, require secret in production
    if (process.env.NODE_ENV === 'production' && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Find expired active proposals
    const { data: expiredProposals, error: fetchError } = await supabase
      .from('boardroom_proposals')
      .select('*')
      .eq('status', 'active')
      .lt('ends_at', new Date().toISOString());

    if (fetchError) {
      console.error('[cron/finalize] Fetch error:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!expiredProposals || expiredProposals.length === 0) {
      return NextResponse.json({
        message: 'No expired proposals to finalize',
        processed: 0
      });
    }

    console.log(`[cron/finalize] Processing ${expiredProposals.length} expired proposals`);

    const results = [];

    for (const proposal of expiredProposals) {
      try {
        // Get all votes for this proposal
        const { data: votes, error: votesError } = await supabase
          .from('boardroom_votes')
          .select('*')
          .eq('proposal_id', proposal.id);

        if (votesError) {
          console.error(`[cron/finalize] Error fetching votes for ${proposal.id}:`, votesError);
          continue;
        }

        // Calculate results
        const calculatedResults = calculateResults(proposal.options, votes || []);

        // Determine outcome
        // For simple yes/no votes, 'Yes' wins needs majority
        // For multiple choice, highest vote count wins
        let finalStatus: 'passed' | 'rejected';

        if (proposal.voting_type === 'simple') {
          // Simple majority - Yes must have more power than No
          const yesPower = calculatedResults.byPower['Yes'] || 0;
          const noPower = calculatedResults.byPower['No'] || 0;
          finalStatus = yesPower > noPower ? 'passed' : 'rejected';
        } else {
          // For multiple choice, we just mark as 'passed' (completed voting)
          // The results show the breakdown
          finalStatus = calculatedResults.totalVotes > 0 ? 'passed' : 'rejected';
        }

        // Update proposal
        const { error: updateError } = await supabase
          .from('boardroom_proposals')
          .update({
            status: finalStatus,
            result: calculatedResults,
            total_votes: calculatedResults.totalVotes,
            total_voting_power: calculatedResults.totalPower,
            updated_at: new Date().toISOString()
          })
          .eq('id', proposal.id);

        if (updateError) {
          console.error(`[cron/finalize] Error updating ${proposal.id}:`, updateError);
          results.push({
            id: proposal.id,
            title: proposal.title,
            status: 'error',
            error: updateError.message
          });
          continue;
        }

        results.push({
          id: proposal.id,
          title: proposal.title,
          status: finalStatus,
          totalVotes: calculatedResults.totalVotes,
          totalPower: calculatedResults.totalPower
        });

        console.log(`[cron/finalize] Finalized ${proposal.id} as ${finalStatus}`);

      } catch (error) {
        console.error(`[cron/finalize] Error processing ${proposal.id}:`, error);
        results.push({
          id: proposal.id,
          title: proposal.title,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: `Finalized ${results.filter(r => r.status !== 'error').length} proposals`,
      processed: results.length,
      results
    });

  } catch (error) {
    console.error('[cron/finalize] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal error'
    }, { status: 500 });
  }
}

/**
 * Calculate voting results
 */
function calculateResults(options: string[], votes: any[]) {
  const byOption: Record<string, number> = {};
  const byPower: Record<string, number> = {};

  // Initialize
  options.forEach((opt) => {
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
    totalPower,
    finalizedAt: new Date().toISOString()
  };
}

// Also handle POST for manual triggers
export async function POST(req: NextRequest) {
  return GET(req);
}
