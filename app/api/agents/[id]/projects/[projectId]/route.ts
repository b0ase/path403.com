import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch a single project link
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; projectId: string }> }
) {
    try {
        const { id: agentId, projectId } = await params;

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('sb-access-token')?.value;

        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user } } = await supabase.auth.getUser(accessToken);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership and fetch project link
        const { data: agentProject, error } = await supabase
            .from('agent_projects')
            .select(`
                id,
                project_id,
                can_read,
                can_write,
                can_deploy,
                is_active,
                created_at,
                updated_at,
                agents!inner(id, user_id),
                projects (
                    id,
                    name,
                    description,
                    category,
                    status,
                    url,
                    is_active
                )
            `)
            .eq('id', projectId)
            .eq('agent_id', agentId)
            .eq('agents.user_id', user.id)
            .single();

        if (error || !agentProject) {
            return NextResponse.json({ error: 'Project link not found' }, { status: 404 });
        }

        return NextResponse.json({ project: agentProject });
    } catch (error) {
        console.error('Error in GET /api/agents/[id]/projects/[projectId]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH: Update project link permissions
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; projectId: string }> }
) {
    try {
        const { id: agentId, projectId } = await params;
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
        const { data: existingLink } = await supabase
            .from('agent_projects')
            .select(`
                id,
                agents!inner(id, user_id)
            `)
            .eq('id', projectId)
            .eq('agent_id', agentId)
            .eq('agents.user_id', user.id)
            .single();

        if (!existingLink) {
            return NextResponse.json({ error: 'Project link not found' }, { status: 404 });
        }

        // Build update object
        const updateData: Record<string, unknown> = {};
        const allowedFields = ['can_read', 'can_write', 'can_deploy', 'is_active'];

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        // Update link
        const { data: agentProject, error } = await supabase
            .from('agent_projects')
            .update(updateData)
            .eq('id', projectId)
            .select(`
                id,
                project_id,
                can_read,
                can_write,
                can_deploy,
                is_active,
                created_at,
                updated_at,
                projects (
                    id,
                    name,
                    description,
                    category,
                    status
                )
            `)
            .single();

        if (error) {
            console.error('Error updating project link:', error);
            return NextResponse.json({ error: 'Failed to update project link' }, { status: 500 });
        }

        return NextResponse.json({ project: agentProject });
    } catch (error) {
        console.error('Error in PATCH /api/agents/[id]/projects/[projectId]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Unlink a project from an agent
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; projectId: string }> }
) {
    try {
        const { id: agentId, projectId } = await params;

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
        const { data: existingLink } = await supabase
            .from('agent_projects')
            .select(`
                id,
                agents!inner(id, user_id)
            `)
            .eq('id', projectId)
            .eq('agent_id', agentId)
            .eq('agents.user_id', user.id)
            .single();

        if (!existingLink) {
            return NextResponse.json({ error: 'Project link not found' }, { status: 404 });
        }

        // Delete the link
        const { error } = await supabase
            .from('agent_projects')
            .delete()
            .eq('id', projectId);

        if (error) {
            console.error('Error deleting project link:', error);
            return NextResponse.json({ error: 'Failed to unlink project' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/agents/[id]/projects/[projectId]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
