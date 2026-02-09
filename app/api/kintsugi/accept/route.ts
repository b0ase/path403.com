/**
 * POST /api/kintsugi/accept
 *
 * Accepts a Kintsugi proposal and creates:
 * - The project in portfolio
 * - The funding tranches (10 x £999)
 * - Links the problem owner as 100% equity holder
 * - Returns subscription checkout URL
 */

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const proposalSchema = z.object({
  conversationId: z.string().uuid(),
  productName: z.string().min(2).max(100),
  problemStatement: z.string().min(10),
  solution: z.string().min(10),
  tokenSymbol: z.string().min(2).max(10).regex(/^\$?[A-Z0-9]+$/),
  roadmap: z.array(z.object({
    tranche: z.number(),
    deliverable: z.string(),
    cost: z.number(),
  })).min(1).max(20),
});

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = proposalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid proposal data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const {
      conversationId,
      productName,
      problemStatement,
      solution,
      tokenSymbol,
      roadmap,
    } = validation.data;

    // Generate slug from product name
    const slug = productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug already exists
    const { data: existingProject } = await supabase
      .from('portfolio')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingProject) {
      return NextResponse.json(
        { error: 'A project with this name already exists' },
        { status: 409 }
      );
    }

    // Create project
    const projectId = crypto.randomUUID();
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        id: projectId,
        name: productName,
        slug,
        description: `${problemStatement}\n\n${solution}`,
        category: 'kintsugi',
        status: 'active',
        owner_user_id: user.id,
        created_by: user.id,
        social_links: {
          tokenSymbol: tokenSymbol.replace('$', ''),
          conversationId,
          createdVia: 'kintsugi-engine',
        },
      })
      .select()
      .single();

    if (projectError) {
      console.error('Error creating project:', projectError);
      return NextResponse.json(
        { error: 'Failed to create project', details: projectError.message },
        { status: 500 }
      );
    }

    // Create funding tranches
    const tranchesToInsert = roadmap.map((item, index) => ({
      project_slug: slug,
      tranche_number: item.tranche || index + 1,
      name: `Tranche ${item.tranche || index + 1}`,
      description: item.deliverable,
      target_amount_gbp: item.cost,
      raised_amount_gbp: 0,
      price_per_percent: item.cost, // Each tranche = 1%
      equity_offered: 1.00, // 1% per tranche
      status: index === 0 ? 'open' : 'upcoming',
    }));

    const { error: tranchesError } = await supabase
      .from('funding_tranches')
      .insert(tranchesToInsert);

    if (tranchesError) {
      console.error('Error creating tranches:', tranchesError);
      // Rollback project creation
      await supabase.from('projects').delete().eq('id', projectId);
      return NextResponse.json(
        { error: 'Failed to create tranches', details: tranchesError.message },
        { status: 500 }
      );
    }

    // Add user as project member with owner role
    await supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: user.id,
        role: 'owner',
        equity_share: 100.00,
      })
      .catch(() => {
        // Non-fatal - project already has owner_user_id set
      });

    // Update conversation title
    await supabase
      .from('agent_conversations')
      .update({ title: productName, status: 'proposal_accepted' })
      .eq('id', conversationId);

    // TODO: Create Stripe subscription checkout session
    // For now, return the project details

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: productName,
        slug,
        tokenSymbol,
      },
      tranches: tranchesToInsert.length,
      totalInvestment: roadmap.reduce((sum, r) => sum + r.cost, 0),
      nextStep: `/invest/${slug}`,
      // subscriptionUrl: checkout.url, // TODO: Stripe
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Helper to parse proposal from conversation
 * Called from frontend to extract structured data from AI response
 */
export async function parseProposalFromMessage(content: string) {
  const proposal: {
    productName?: string;
    problemStatement?: string;
    solution?: string;
    tokenSymbol?: string;
    roadmap: Array<{ tranche: number; deliverable: string; cost: number }>;
  } = { roadmap: [] };

  // Extract product name from "## PROPOSAL: [Name]"
  const nameMatch = content.match(/## PROPOSAL:\s*(.+)/);
  if (nameMatch) {
    proposal.productName = nameMatch[1].trim();
  }

  // Extract token symbol from "$SYMBOL" pattern
  const tokenMatch = content.match(/\$([A-Z0-9]{2,10})/);
  if (tokenMatch) {
    proposal.tokenSymbol = `$${tokenMatch[1]}`;
  }

  // Extract problem statement
  const problemMatch = content.match(/\*\*Problem Statement\*\*\s*\n([^\n*]+)/);
  if (problemMatch) {
    proposal.problemStatement = problemMatch[1].trim();
  }

  // Extract solution
  const solutionMatch = content.match(/\*\*Solution\*\*\s*\n([^\n*]+(?:\n[^\n*]+)*)/);
  if (solutionMatch) {
    proposal.solution = solutionMatch[1].trim();
  }

  // Extract roadmap table
  const tableMatch = content.match(/\| Tranche \| Deliverable \| Cost \|\n\|[-|]+\|\n([\s\S]*?)(?=\n\n|\*\*|$)/);
  if (tableMatch) {
    const rows = tableMatch[1].trim().split('\n');
    rows.forEach(row => {
      const cells = row.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 3) {
        const tranche = parseInt(cells[0]) || proposal.roadmap.length + 1;
        const deliverable = cells[1];
        const cost = parseInt(cells[2].replace(/[£,]/g, '')) || 999;
        proposal.roadmap.push({ tranche, deliverable, cost });
      }
    });
  }

  return proposal;
}
