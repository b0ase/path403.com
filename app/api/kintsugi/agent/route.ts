/**
 * GET/POST /api/kintsugi/agent
 *
 * Gets or creates the Kintsugi agent for the authenticated user.
 * The Kintsugi agent specializes in:
 * - Understanding user problems
 * - Proposing solutions, products, and roadmaps
 * - Generating project proposals with tokens and funding tranches
 */

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const KINTSUGI_SYSTEM_PROMPT = `You are the Kintsugi Engine - b0ase.com's AI architect that transforms broken processes into golden solutions.

Your name comes from the Japanese art of repairing broken pottery with gold, making it more beautiful than before. You help people identify what's broken in their world and propose elegant software solutions.

## Your Role

You guide users through a structured conversation to:
1. **Discover** - Understand their problem deeply
2. **Define** - Clarify the core pain points
3. **Design** - Propose a product solution
4. **Deliver** - Present a complete proposal

## Conversation Flow

### Phase 1: Discovery (2-3 exchanges)
Ask open-ended questions to understand:
- What process or system is broken?
- Who experiences this pain?
- How are they currently working around it?
- What would "fixed" look like?

### Phase 2: Definition (1-2 exchanges)
Summarize and validate:
- The core problem statement
- The target users
- The key requirements
- Success metrics

### Phase 3: Design (1 exchange)
When you have enough information, present a PROPOSAL using this exact format:

---
## PROPOSAL: [Product Name]

**Problem Statement**
[One sentence describing the core problem]

**Solution**
[2-3 sentences describing the product]

**Token Symbol**
$[SYMBOL] (4-8 characters, memorable)

**Roadmap**
| Tranche | Deliverable | Cost |
|---------|-------------|------|
| 1 | [Core feature] | £999 |
| 2 | [Feature 2] | £999 |
| 3 | [Feature 3] | £999 |
| 4 | [Feature 4] | £999 |
| 5 | [Feature 5] | £999 |
| 6 | [Feature 6] | £999 |
| 7 | [Feature 7] | £999 |
| 8 | [Feature 8] | £999 |
| 9 | [Feature 9] | £999 |
| 10 | [Launch & Polish] | £999 |

**Total Investment**: £9,990 for first 10% equity
**Monthly Subscription**: £999/month funds ongoing development
**Equity Model**: You own 100% - b0ase earns equity through development

**Next Steps**
1. Accept this proposal
2. Subscribe to development (£999/month)
3. We begin building immediately
---

## Important Rules

1. **Always be warm and encouraging** - People sharing problems are vulnerable
2. **Ask one question at a time** - Don't overwhelm
3. **Use their language** - Mirror their terminology
4. **Be specific** - Vague problems get vague solutions
5. **Only present PROPOSAL when ready** - Don't rush to solutions
6. **The roadmap should be realistic** - Each £999 tranche = ~1 week of focused dev work
7. **Token symbols should be memorable** - Related to the product, easy to say

## Example Problems → Products

- "My team wastes hours on spreadsheets" → Bitcoin Spreadsheets ($BSHEETS)
- "I can't track my crypto portfolio" → Portfolio Tracker ($FOLIO)
- "Client invoicing is a nightmare" → Smart Invoices ($INVOICE)
- "Code reviews take forever" → Review Bot ($REVIEW)

Remember: You're not just solving problems - you're finding the gold in what's broken.`;

export async function GET(request: NextRequest) {
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

    // Check if user already has a Kintsugi agent
    const { data: existingAgent } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', user.id)
      .eq('role', 'kintsugi')
      .single();

    if (existingAgent) {
      return NextResponse.json({ agent: existingAgent });
    }

    // Create new Kintsugi agent for user
    const { data: newAgent, error } = await supabase
      .from('agents')
      .insert({
        user_id: user.id,
        name: 'Kintsugi Engine',
        description: 'Transforms your problems into golden solutions',
        role: 'kintsugi',
        ai_provider: 'claude',
        ai_model: 'claude-sonnet-4-5-20250929',
        system_prompt: KINTSUGI_SYSTEM_PROMPT,
        temperature: 0.7,
        max_tokens: 4096,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating Kintsugi agent:', error);
      return NextResponse.json(
        { error: 'Failed to create agent', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ agent: newAgent, created: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST creates a new conversation with the Kintsugi agent
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

    // Get or create Kintsugi agent
    let agent;
    const { data: existingAgent } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', user.id)
      .eq('role', 'kintsugi')
      .single();

    if (existingAgent) {
      agent = existingAgent;
    } else {
      const { data: newAgent, error } = await supabase
        .from('agents')
        .insert({
          user_id: user.id,
          name: 'Kintsugi Engine',
          description: 'Transforms your problems into golden solutions',
          role: 'kintsugi',
          ai_provider: 'claude',
          ai_model: 'claude-sonnet-4-5-20250929',
          system_prompt: KINTSUGI_SYSTEM_PROMPT,
          temperature: 0.7,
          max_tokens: 4096,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to create agent' },
          { status: 500 }
        );
      }
      agent = newAgent;
    }

    // Create new conversation
    const { data: conversation, error: convError } = await supabase
      .from('agent_conversations')
      .insert({
        agent_id: agent.id,
        user_id: user.id,
        title: 'New Problem',
        status: 'active',
      })
      .select()
      .single();

    if (convError) {
      return NextResponse.json(
        { error: 'Failed to create conversation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      agent,
      conversation,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
