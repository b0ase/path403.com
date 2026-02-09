import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/agents/create
 * Creates a new autonomous agent for the authenticated user
 */
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

    // Parse request body
    const body = await request.json();
    const {
      name,
      description,
      role = 'custom',
      ai_provider = 'claude',
      ai_model = 'claude-sonnet-4-5-20250929',
      system_prompt,
      temperature = 0.7,
      max_tokens = 4096,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Agent name is required' },
        { status: 400 }
      );
    }

    // Get default system prompt based on role if not provided
    const finalSystemPrompt = system_prompt || getDefaultSystemPrompt(role);

    // Create agent in database
    const { data: agent, error } = await supabase
      .from('agents')
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        role,
        ai_provider,
        ai_model,
        system_prompt: finalSystemPrompt,
        temperature,
        max_tokens,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating agent:', error);
      return NextResponse.json(
        { error: 'Failed to create agent', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        agent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error creating agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get default system prompt based on agent role
 */
function getDefaultSystemPrompt(role: string): string {
  const prompts: Record<string, string> = {
    developer: `You are an expert software developer specializing in modern web technologies. You help users with:
- Writing clean, efficient code
- Debugging and troubleshooting issues
- Implementing features and best practices
- Code reviews and optimization suggestions

Always provide clear explanations and code examples when helpful.`,

    marketer: `You are a skilled digital marketing expert specializing in social media and content strategy. You help users with:
- Crafting engaging social media posts
- Developing content calendars
- Analyzing engagement metrics
- Creating marketing campaigns

Focus on actionable strategies that drive engagement and growth.`,

    content: `You are a professional content creator and copywriter. You help users with:
- Writing blog posts and articles
- Creating compelling copy
- Editing and proofreading content
- Developing content strategies

Maintain a clear, engaging voice appropriate for the target audience.`,

    support: `You are a friendly and knowledgeable customer support specialist. You help users with:
- Answering questions clearly and patiently
- Troubleshooting common issues
- Providing step-by-step guidance
- Escalating complex problems when needed

Always prioritize user satisfaction and clear communication.`,

    custom: `You are a helpful AI assistant. Provide clear, accurate, and thoughtful responses to user queries. Be professional, concise, and friendly.`,
  };

  return prompts[role] || prompts.custom;
}
