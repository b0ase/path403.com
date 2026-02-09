import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { withRateLimit, rateLimitPresets } from '@/lib/rate-limit';

// Verify user authentication - supports Supabase auth, bot API key, or unified user
async function verifyBoardroomAuth(request: NextRequest, body?: any): Promise<{
  isAuthenticated: boolean;
  userId?: string;
  username?: string;
  authMethod?: string;
  error?: string;
}> {
  // Check for bot API key (for Telegram bot)
  const botApiKey = request.headers.get('x-bot-api-key');
  const expectedBotKey = process.env.BOARDROOM_BOT_API_KEY;

  if (botApiKey && expectedBotKey && botApiKey === expectedBotKey) {
    return {
      isAuthenticated: true,
      userId: body?.userId || 'boardroom_bot',
      username: body?.username || 'BoardroomBot',
      authMethod: 'bot_api_key'
    };
  }

  // Check for Supabase session
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    if (!error && user) {
      return {
        isAuthenticated: true,
        userId: user.id,
        username: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
        authMethod: 'supabase'
      };
    }
  } catch (err) {
    console.warn('Supabase auth check failed:', err);
  }

  // Check for unified user auth token
  const authToken = request.headers.get('authorization')?.replace('Bearer ', '');
  if (authToken) {
    // TODO: Implement unified user token verification
    // For now, reject tokens until proper verification is implemented
    return { isAuthenticated: false, error: 'Token authentication not yet implemented' };
  }

  return { isAuthenticated: false, error: 'Authentication required' };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId') || 'general';

    // GET is public for now - messages in public rooms can be read
    // Token-gated rooms should filter on the client based on user's tokens
    const supabase = createAdminClient();

    const { data: messages, error } = await supabase
      .from('boardroom_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(100); // Limit to prevent abuse

    if (error) {
      console.warn('Supabase query warning:', error.message);
      return NextResponse.json({ success: true, messages: [] });
    }

    return NextResponse.json({ success: true, messages: messages || [] });
  } catch (error) {
    console.error('Error in GET /api/boardroom/chat:', error);
    return NextResponse.json({ success: true, messages: [] });
  }
}

async function boardroomChatHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, roomId = 'general', tokens = [] } = body;

    // Validate required fields
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Verify authentication
    const auth = await verifyBoardroomAuth(request, body);

    if (!auth.isAuthenticated) {
      return NextResponse.json({
        error: auth.error || 'Authentication required',
        botMessage: '🔐 Please sign in to access the chat.'
      }, { status: 401 });
    }

    // Sanitize message content (basic XSS prevention)
    const sanitizedMessage = message
      .slice(0, 2000) // Max 2000 chars
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, ''); // Strip HTML tags

    // Create new message object
    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      room_id: roomId,
      user_id: auth.userId,
      username: auth.username,
      message: sanitizedMessage,
      tokens: tokens,
      created_at: new Date().toISOString()
    };

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('boardroom_messages')
      .insert(newMessage);

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error('Error in POST /api/boardroom/chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Rate limit: 30 requests per minute (standard for authenticated chat)
export const POST = withRateLimit(boardroomChatHandler, rateLimitPresets.standard);
