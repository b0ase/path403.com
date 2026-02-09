import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Load traffic light data
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('robust_ae_content')
      .select('data')
      .eq('id', 999) // Use a specific ID for traffic lights
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Supabase error fetching traffic lights:', error);
      return NextResponse.json({ error: 'Failed to fetch traffic lights', details: error.message }, { status: 500 });
    }

    const trafficLights = data?.data?.trafficLights || {};
    return NextResponse.json({ trafficLights });
  } catch (err: any) {
    console.error('Error in traffic lights GET:', err);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}

// POST - Save traffic light data
export async function POST(request: NextRequest) {
  try {
    const { projectId, lightIndex, status } = await request.json();

    if (!projectId || lightIndex === undefined || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (![0, 1, 2].includes(lightIndex)) {
      return NextResponse.json({ error: 'Invalid light index' }, { status: 400 });
    }

    if (!['red', 'orange', 'green'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Get current traffic lights data
    const { data: currentData } = await supabase
      .from('robust_ae_content')
      .select('data')
      .eq('id', 999)
      .single();

    const trafficLights = currentData?.data?.trafficLights || {};

    // Initialize project if it doesn't exist
    if (!trafficLights[projectId]) {
      trafficLights[projectId] = ['red', 'red', 'red'];
    }

    // Update the specific light
    trafficLights[projectId][lightIndex] = status;

    // Save back to database
    const { error } = await supabase
      .from('robust_ae_content')
      .upsert({
        id: 999,
        data: { trafficLights },
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating traffic light:', error);
      return NextResponse.json({ error: 'Failed to update traffic light' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in traffic lights POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 