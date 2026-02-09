import { NextRequest, NextResponse } from 'next/server';
import { getN8nClient } from '@/lib/n8n/client';

export async function GET(request: NextRequest) {
  try {
    const n8nClient = getN8nClient();
    const workflows = await n8nClient.getWorkflows();
    
    return NextResponse.json({
      success: true,
      workflows,
      count: workflows.length
    });
  } catch (error) {
    console.error('Error fetching n8n workflows:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowId, data } = body;
    
    if (!workflowId) {
      return NextResponse.json(
        { success: false, error: 'Workflow ID is required' },
        { status: 400 }
      );
    }
    
    const n8nClient = getN8nClient();
    const execution = await n8nClient.executeWorkflow(workflowId, data);
    
    return NextResponse.json({
      success: true,
      execution,
      message: 'Workflow executed successfully'
    });
  } catch (error) {
    console.error('Error executing n8n workflow:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to execute workflow' },
      { status: 500 }
    );
  }
} 