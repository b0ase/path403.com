import { NextRequest, NextResponse } from 'next/server';
import { createGrokClient } from '@/lib/grok-api/client';
import { getSupabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const supabase = getSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get usage stats from Grok API
    const grokClient = createGrokClient();
    const grokUsage = await grokClient.getUsageStats();

    // Get user's usage stats from database
    const { data: userUsage, error: dbError } = await supabase
      .from('automation_usage')
      .select('automation_type, credits_used, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    // Calculate usage statistics
    const usageStats = {
      total_generations: userUsage?.length || 0,
      total_credits_used: userUsage?.reduce((sum, usage) => sum + (usage.credits_used || 0), 0) || 0,
      usage_by_type: userUsage?.reduce((acc, usage) => {
        acc[usage.automation_type] = (acc[usage.automation_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      recent_activity: userUsage?.slice(0, 10) || [],
      grok_api_usage: grokUsage.success ? grokUsage.data : null,
    };

    return NextResponse.json({
      success: true,
      data: usageStats,
    });

  } catch (error) {
    console.error('Usage stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}