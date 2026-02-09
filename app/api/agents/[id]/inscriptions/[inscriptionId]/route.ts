import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { verifyAgentInscription } from '@/lib/agent-inscription';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Get a specific inscription with blockchain verification
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; inscriptionId: string }> }
) {
  try {
    const { id: agentId, inscriptionId } = await params;

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch inscription with agent ownership check
    const { data: inscription, error } = await supabase
      .from('agent_inscriptions')
      .select(`
        *,
        agents!inner(id, user_id, name)
      `)
      .eq('id', inscriptionId)
      .eq('agent_id', agentId)
      .eq('agents.user_id', user.id)
      .single();

    if (error || !inscription) {
      return NextResponse.json({ error: 'Inscription not found' }, { status: 404 });
    }

    // Optionally verify on blockchain
    const verify = request.nextUrl.searchParams.get('verify') === 'true';
    let blockchainVerification: {
      verified: boolean;
      contentHashMatch: boolean;
      document: Record<string, unknown> | undefined;
    } | null = null;

    if (verify && inscription.transaction_id) {
      const verification = await verifyAgentInscription(inscription.transaction_id);
      blockchainVerification = {
        verified: verification.found,
        contentHashMatch: verification.contentHash === inscription.content_hash,
        document: verification.document,
      };
    }

    return NextResponse.json({
      inscription: {
        id: inscription.id,
        agentId: inscription.agent_id,
        conversationId: inscription.conversation_id,
        outputId: inscription.output_id,
        inscriptionId: inscription.inscription_id,
        transactionId: inscription.transaction_id,
        contentHash: inscription.content_hash,
        inscriptionUrl: inscription.inscription_url,
        inscriptionType: inscription.inscription_type,
        createdAt: inscription.created_at,
      },
      blockchainVerification,
    });
  } catch (error) {
    console.error('Error in GET /api/agents/[id]/inscriptions/[inscriptionId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
