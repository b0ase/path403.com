import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const prisma = getPrisma();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getUserId() {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('sb-access-token')?.value;

        if (!accessToken) return null;

        const { data: { user }, error } = await supabase.auth.getUser(accessToken);
        if (error || !user) return null;

        return user.id;
    } catch (error) {
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { sessionId, sessionCode, title, messages, context, lastTxid } = body;

        if (!sessionId || !sessionCode) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const userId = await getUserId();

        const upsertedSession = await prisma.kintsugi_chat_sessions.upsert({
            where: { session_id: sessionId },
            update: {
                title,
                messages,
                context: context || {},
                last_txid: lastTxid,
                user_id: userId || undefined,
                updated_at: new Date(),
            },
            create: {
                session_id: sessionId,
                session_code: sessionCode,
                title,
                messages,
                context: context || {},
                last_txid: lastTxid,
                user_id: userId || null,
                created_at: new Date(),
                updated_at: new Date(),
            },
        });

        return NextResponse.json({ success: true, session: upsertedSession });
    } catch (error) {
        console.error('[sync-session] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    try {
        const userId = await getUserId();

        if (sessionId) {
            const chatSession = await prisma.kintsugi_chat_sessions.findUnique({
                where: { session_id: sessionId },
            });

            if (!chatSession) {
                return NextResponse.json({ error: 'Session not found' }, { status: 404 });
            }

            // Security check: if session has a user_id, it must match current user (if any)
            if (chatSession.user_id && chatSession.user_id !== userId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }

            return NextResponse.json({ session: chatSession });
        }

        // If no sessionId, fetch all sessions for the logged-in user
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sessions = await prisma.kintsugi_chat_sessions.findMany({
            where: { user_id: userId },
            orderBy: { updated_at: 'desc' },
        });

        return NextResponse.json({ sessions });
    } catch (error) {
        console.error('[sync-session] Error fetching session(s):', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

