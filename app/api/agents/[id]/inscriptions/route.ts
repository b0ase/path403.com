/**
 * Agent Inscriptions API Routes
 *
 * Manages BSV blockchain inscriptions for agent outputs.
 * Inscriptions provide permanent, verifiable proof of AI-generated content.
 *
 * @see /docs/AGENTS_API_REFERENCE.md for full documentation
 * @see /lib/agent-inscription.ts for inscription implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import {
  inscribeAndSaveAgentOutput,
  getAgentInscriptions,
  InscriptionContentType,
} from '@/lib/agent-inscription';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/agents/[id]/inscriptions
 *
 * List all BSV blockchain inscriptions for an agent.
 *
 * @requires Authentication via session cookie
 * @param {string} id - Agent UUID (path parameter)
 * @returns {object} { inscriptions: InscriptionRecord[] }
 * @throws {401} Unauthorized
 * @throws {404} Agent not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns this agent
    const { data: agent } = await supabase
      .from('agents')
      .select('id, name')
      .eq('id', agentId)
      .eq('user_id', user.id)
      .single();

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Fetch inscriptions
    const inscriptions = await getAgentInscriptions(agentId);

    return NextResponse.json({ inscriptions });
  } catch (error) {
    console.error('Error in GET /api/agents/[id]/inscriptions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/agents/[id]/inscriptions
 *
 * Inscribe agent content permanently on the BSV blockchain.
 * Creates an OP_RETURN transaction with the content wrapped in protocol metadata.
 *
 * @requires Authentication via session cookie
 * @requires BSV_PRIVATE_KEY environment variable
 * @param {string} id - Agent UUID (path parameter)
 * @body {object} { content: string, contentType?: string, conversationId?: string, outputId?: string, taskName?: string, metadata?: object }
 * @returns {object} { success: true, inscription: { txid, inscriptionId, contentHash, explorerUrl } } (201 Created)
 * @throws {400} Content is required / Content too large
 * @throws {401} Unauthorized
 * @throws {404} Agent not found
 * @throws {409} This output has already been inscribed
 * @throws {503} BSV inscription not configured / Insufficient funds
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    const body = await request.json();

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns this agent
    const { data: agent } = await supabase
      .from('agents')
      .select('id, name, ai_model')
      .eq('id', agentId)
      .eq('user_id', user.id)
      .single();

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Validate required fields
    const { content, contentType, conversationId, outputId, taskName, metadata } = body;

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Validate content type
    const validContentTypes: InscriptionContentType[] = ['text/plain', 'text/markdown', 'application/json'];
    const actualContentType = validContentTypes.includes(contentType) ? contentType : 'text/plain';

    // Check if BSV key is configured
    if (!process.env.BSV_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'BSV inscription is not configured on this platform' },
        { status: 503 }
      );
    }

    console.log(`[Inscriptions] Creating inscription for agent: ${agent.name}`);

    // Create inscription
    const result = await inscribeAndSaveAgentOutput({
      agentId,
      agentName: agent.name,
      conversationId: conversationId || undefined,
      outputId: outputId || undefined,
      content,
      contentType: actualContentType,
      modelName: agent.ai_model,
      taskName: taskName || undefined,
      metadata: metadata || undefined,
    });

    console.log(`[Inscriptions] Inscription created: ${result.txid}`);

    return NextResponse.json({
      success: true,
      inscription: {
        txid: result.txid,
        inscriptionId: result.inscriptionId,
        contentHash: result.contentHash,
        explorerUrl: result.blockchainExplorerUrl,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/agents/[id]/inscriptions:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('already been inscribed')) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      if (error.message.includes('No UTXOs found')) {
        return NextResponse.json(
          { error: 'Insufficient funds for inscription. Please contact support.' },
          { status: 503 }
        );
      }
      if (error.message.includes('too large')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
