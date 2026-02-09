/**
 * Agent Detail API Routes
 *
 * Handles GET, PATCH, DELETE operations for individual agents.
 * All routes require authentication and verify agent ownership.
 *
 * @see /docs/AGENTS_API_REFERENCE.md for full documentation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/agents/[id]
 *
 * Retrieve a specific agent by ID.
 *
 * @requires Authentication via session cookie
 * @param {string} id - Agent UUID (path parameter)
 * @returns {object} { agent: AgentObject }
 * @throws {401} Unauthorized - Not logged in
 * @throws {404} Agent not found - Invalid ID or not owner
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

        const { data: agent, error } = await supabase
            .from('agents')
            .select('*')
            .eq('id', agentId)
            .eq('user_id', user.id)
            .single();

        if (error || !agent) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        }

        return NextResponse.json({ agent });
    } catch (error) {
        console.error('Error in GET /api/agents/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PATCH /api/agents/[id]
 *
 * Update an agent's configuration.
 *
 * @requires Authentication via session cookie
 * @param {string} id - Agent UUID (path parameter)
 * @body {object} Update fields (name, description, role, ai_model, temperature, max_tokens, system_prompt, is_active)
 * @returns {object} { agent: UpdatedAgentObject }
 * @throws {400} No valid fields to update
 * @throws {401} Unauthorized
 * @throws {404} Agent not found
 */
export async function PATCH(
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

        // Verify ownership
        const { data: existingAgent } = await supabase
            .from('agents')
            .select('id')
            .eq('id', agentId)
            .eq('user_id', user.id)
            .single();

        if (!existingAgent) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        }

        // Build update object
        const updateData: Record<string, unknown> = {};
        const allowedFields = [
            'name',
            'description',
            'role',
            'ai_model',
            'temperature',
            'max_tokens',
            'system_prompt',
            'is_active',
        ];

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const { data: agent, error } = await supabase
            .from('agents')
            .update(updateData)
            .eq('id', agentId)
            .select()
            .single();

        if (error) {
            console.error('Error updating agent:', error);
            return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
        }

        return NextResponse.json({ agent });
    } catch (error) {
        console.error('Error in PATCH /api/agents/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/agents/[id]
 *
 * Delete an agent and all associated data (conversations, tasks, outputs).
 *
 * @requires Authentication via session cookie
 * @param {string} id - Agent UUID (path parameter)
 * @returns {object} { success: true }
 * @throws {401} Unauthorized
 * @throws {404} Agent not found
 */
export async function DELETE(
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

        // Verify ownership
        const { data: existingAgent } = await supabase
            .from('agents')
            .select('id')
            .eq('id', agentId)
            .eq('user_id', user.id)
            .single();

        if (!existingAgent) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        }

        const { error } = await supabase
            .from('agents')
            .delete()
            .eq('id', agentId);

        if (error) {
            console.error('Error deleting agent:', error);
            return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/agents/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
