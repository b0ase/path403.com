import { NextRequest, NextResponse } from 'next/server';
import { getN8nClient } from '@/lib/n8n/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const n8nClient = getN8nClient();
    const workflow = await n8nClient.getWorkflow(id);
    
    return NextResponse.json({
      success: true,
      workflow
    });
  } catch (error) {
    console.error(`Error fetching n8n workflow ${(await params).id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workflow' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, data } = body;
    
    const n8nClient = getN8nClient();
    
    switch (action) {
      case 'activate':
        await n8nClient.activateWorkflow(id);
        return NextResponse.json({
          success: true,
          message: 'Workflow activated successfully'
        });
        
      case 'deactivate':
        await n8nClient.deactivateWorkflow(id);
        return NextResponse.json({
          success: true,
          message: 'Workflow deactivated successfully'
        });
        
      case 'execute':
        const execution = await n8nClient.executeWorkflow(id, data);
        return NextResponse.json({
          success: true,
          execution,
          message: 'Workflow executed successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error(`Error performing action on n8n workflow ${id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform action on workflow' },
      { status: 500 }
    );
  }
} 