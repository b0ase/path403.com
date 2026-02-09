import { NextRequest, NextResponse } from 'next/server';
import { getN8nClient } from '@/lib/n8n/client';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';
    const workflowId = searchParams.get('workflowId');
    
    const n8nClient = getN8nClient();
    const executions = await n8nClient.getExecutions(
      workflowId || undefined, 
      parseInt(limit)
    );
    
    return NextResponse.json({ executions });
  } catch (error: any) {
    console.error('Error fetching n8n executions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch executions', details: error.message },
      { status: 500 }
    );
  }
} 