
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    // Fetch open marketplace tenders with related project/stage info
    const { data, error } = await supabase
        .from('marketplace_tenders')
        .select(`
      *,
      pipeline_stages (
        stage_name,
        projects (
            id,
            name,
            category
        )
      )
    `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
