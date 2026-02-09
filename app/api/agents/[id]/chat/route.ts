import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;
  if (!accessToken) return null;
  const { data: { user } } = await supabase.auth.getUser(accessToken);
  return user;
}

/**
 * POST /api/agents/[id]/chat
 * Send a message to an agent and get streaming response via SSE
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: agentId } = await params;

    // Parse request body
    const { message, conversationId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Verify agent exists and belongs to user
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .eq('user_id', user.id)
      .single();

    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found or access denied' },
        { status: 404 }
      );
    }

    // Fetch linked projects for context
    const { data: agentProjects } = await supabase
      .from('agent_projects')
      .select(`
        project_id,
        can_read,
        can_write,
        can_deploy,
        is_active,
        projects (
          id,
          name,
          description,
          category,
          status,
          url
        )
      `)
      .eq('agent_id', agentId)
      .eq('is_active', true);

    // Build project context for system prompt
    let projectContext = '';
    if (agentProjects && agentProjects.length > 0) {
      const projectList = agentProjects
        .filter((ap) => ap.projects)
        .map((ap) => {
          // Supabase returns nested object, not array for single joins
          const p = ap.projects as unknown as { name: string; description: string | null; url: string | null };
          const permissions: string[] = [];
          if (ap.can_read) permissions.push('read');
          if (ap.can_write) permissions.push('write');
          if (ap.can_deploy) permissions.push('deploy');
          return `- ${p.name}${p.description ? ` (${p.description})` : ''} [${permissions.join(', ')}]${p.url ? ` - ${p.url}` : ''}`;
        })
        .join('\n');

      projectContext = `\n\n## Linked Projects\nYou have access to the following projects:\n${projectList}\n\nWhen discussing tasks, you can reference these projects and their capabilities based on your permissions.`;
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      const { data: existingConv } = await supabase
        .from('agent_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('agent_id', agentId)
        .eq('user_id', user.id)
        .single();

      conversation = existingConv;
    }

    if (!conversation) {
      const { data: newConv, error: convError } = await supabase
        .from('agent_conversations')
        .insert({
          agent_id: agentId,
          user_id: user.id,
          title: message.substring(0, 100),
          status: 'active',
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        return NextResponse.json(
          { error: 'Failed to create conversation' },
          { status: 500 }
        );
      }

      conversation = newConv;
    }

    // Save user message
    const { error: userMsgError } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: conversation.id,
        role: 'user',
        content: message,
      });

    if (userMsgError) {
      console.error('Error saving user message:', userMsgError);
    }

    // Get conversation history for context
    const { data: history } = await supabase
      .from('conversation_messages')
      .select('role, content')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .limit(50);

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Build messages array for Claude
          const messages: Anthropic.MessageParam[] = (history || []).map(
            (msg) => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
            })
          );

          // Build enhanced system prompt with project context
          const enhancedSystemPrompt = agent.system_prompt + projectContext;

          // Stream response from Claude
          const claudeStream = await anthropic.messages.create({
            model: agent.ai_model,
            max_tokens: agent.max_tokens || 4096,
            temperature: agent.temperature || 0.7,
            system: enhancedSystemPrompt,
            messages,
            stream: true,
          });

          let fullResponse = '';
          let inputTokens = 0;
          let outputTokens = 0;

          for await (const chunk of claudeStream) {
            if (chunk.type === 'message_start') {
              const usage = (chunk as any).message?.usage;
              if (usage) {
                inputTokens = usage.input_tokens || 0;
              }
            } else if (chunk.type === 'content_block_delta') {
              const delta = (chunk as any).delta;
              if (delta?.text) {
                fullResponse += delta.text;
                // Send chunk to client
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ text: delta.text, type: 'content' })}\n\n`
                  )
                );
              }
            } else if (chunk.type === 'message_delta') {
              const usage = (chunk as any).usage;
              if (usage) {
                outputTokens = usage.output_tokens || 0;
              }
            }
          }

          // Save assistant response to database
          const totalTokens = inputTokens + outputTokens;
          const costPerMillionTokens = 3.0; // Claude Sonnet 4.5 pricing
          const costUsd = (totalTokens / 1000000) * costPerMillionTokens;

          await supabase.from('conversation_messages').insert({
            conversation_id: conversation.id,
            role: 'assistant',
            content: fullResponse,
            tokens_used: totalTokens,
            cost_usd: costUsd,
          });

          // Send completion event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'done',
                conversationId: conversation.id,
                tokens: totalTokens,
                cost: costUsd,
              })}\n\n`
            )
          );

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Unexpected error in chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
