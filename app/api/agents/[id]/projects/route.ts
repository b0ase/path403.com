/**
 * Agent Projects API Routes
 *
 * Manages project linking for agents. Agents can be linked to projects
 * with specific permissions (read, write, deploy) for context-aware assistance.
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
 * GET /api/agents/[id]/projects
 *
 * List all projects linked to an agent with their permissions.
 *
 * @requires Authentication via session cookie
 * @param {string} id - Agent UUID (path parameter)
 * @returns {object} { projects: AgentProjectLink[] }
 * @throws {401} Unauthorized
 * @throws {404} Agent not found
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: agentId } = await params;

        // Get auth token from cookies
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('sb-access-token')?.value;

        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify user owns this agent
        const { data: { user } } = await supabase.auth.getUser(accessToken);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: agent } = await supabase
            .from('agents')
            .select('id')
            .eq('id', agentId)
            .eq('user_id', user.id)
            .single();

        if (!agent) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        }

        // Fetch linked projects with project details
        const { data: agentProjects, error } = await supabase
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
            .eq('agent_id', agentId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching agent projects:', error);
            return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
        }

        return NextResponse.json({ projects: agentProjects });
    } catch (error) {
        console.error('Error in GET /api/agents/[id]/projects:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/agents/[id]/projects
 *
 * Link a project to an agent with specified permissions.
 *
 * @requires Authentication via session cookie
 * @param {string} id - Agent UUID (path parameter)
 * @body {object} { project_id: string, can_read?: boolean, can_write?: boolean, can_deploy?: boolean }
 * @returns {object} { project: AgentProjectLink } (201 Created)
 * @throws {400} Project ID is required
 * @throws {401} Unauthorized
 * @throws {404} Agent not found / Project not found
 * @throws {409} Project is already linked to this agent
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: agentId } = await params;
        const body = await request.json();

        // Get auth token from cookies
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('sb-access-token')?.value;

        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify user owns this agent
        const { data: { user } } = await supabase.auth.getUser(accessToken);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: agent } = await supabase
            .from('agents')
            .select('id')
            .eq('id', agentId)
            .eq('user_id', user.id)
            .single();

        if (!agent) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        }

        // Validate required fields
        const { project_id, can_read, can_write, can_deploy } = body;

        if (!project_id) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        // Verify project exists and user has access to it
        const { data: project } = await supabase
            .from('projects')
            .select('id, name')
            .eq('id', project_id)
            .single();

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Check if link already exists
        const { data: existingLink } = await supabase
            .from('agent_projects')
            .select('id')
            .eq('agent_id', agentId)
            .eq('project_id', project_id)
            .single();

        if (existingLink) {
            return NextResponse.json(
                { error: 'Project is already linked to this agent' },
                { status: 409 }
            );
        }

        // Create the link
        const { data: agentProject, error } = await supabase
            .from('agent_projects')
            .insert({
                agent_id: agentId,
                project_id,
                can_read: can_read !== false, // Default true
                can_write: can_write === true, // Default false
                can_deploy: can_deploy === true, // Default false
                is_active: true,
            })
            .select(`
                id,
                project_id,
                can_read,
                can_write,
                can_deploy,
                is_active,
                created_at,
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
            console.error('Error linking project:', error);
            return NextResponse.json({ error: 'Failed to link project' }, { status: 500 });
        }

        return NextResponse.json({ project: agentProject }, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/agents/[id]/projects:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
