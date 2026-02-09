import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch all pipeline stages for a project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params;

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('sb-access-token')?.value;

        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user } } = await supabase.auth.getUser(accessToken);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify user owns this project
        const { data: project } = await supabase
            .from('projects')
            .select('id')
            .eq('id', projectId)
            .eq('user_id', user.id)
            .single();

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Fetch stages with task counts
        const { data: stages, error } = await supabase
            .from('pipeline_stages')
            .select(`
        *,
        fundraising_rounds(*),
        tasks:stage_tasks(count),
        completed_tasks:stage_tasks(count).filter(is_completed.eq.true)
      `)
            .eq('project_id', projectId)
            .order('stage_order', { ascending: true });

        if (error) {
            console.error('Error fetching stages:', error);
            return NextResponse.json({ error: 'Failed to fetch stages' }, { status: 500 });
        }

        return NextResponse.json({ stages: stages || [] });
    } catch (error) {
        console.error('Error in GET /api/pipeline/[projectId]/stages:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Initialize pipeline stages for a project
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params;

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('sb-access-token')?.value;

        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user } } = await supabase.auth.getUser(accessToken);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify user owns this project
        const { data: project } = await supabase
            .from('projects')
            .select('id')
            .eq('id', projectId)
            .eq('user_id', user.id)
            .single();

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Check if stages already exist
        const { data: existingStages } = await supabase
            .from('pipeline_stages')
            .select('id')
            .eq('project_id', projectId)
            .limit(1);

        if (existingStages && existingStages.length > 0) {
            return NextResponse.json({ error: 'Pipeline already initialized' }, { status: 400 });
        }

        // Initialize all 7 stages
        const stageDefinitions = [
            { stage_name: 'discovery', stage_order: 1 },
            { stage_name: 'specification', stage_order: 2 },
            { stage_name: 'design', stage_order: 3 },
            { stage_name: 'development', stage_order: 4 },
            { stage_name: 'testing', stage_order: 5 },
            { stage_name: 'deployment', stage_order: 6 },
            { stage_name: 'post_launch', stage_order: 7 },
        ];

        const { data: stages, error } = await supabase
            .from('pipeline_stages')
            .insert(stageDefinitions.map(s => ({ ...s, project_id: projectId })))
            .select();

        if (error) {
            console.error('Error creating stages:', error);
            return NextResponse.json({ error: 'Failed to create stages' }, { status: 500 });
        }

        return NextResponse.json({ stages, message: 'Pipeline initialized' }, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/pipeline/[projectId]/stages:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
