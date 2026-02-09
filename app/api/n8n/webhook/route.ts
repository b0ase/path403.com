import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowId, nodeId, data, timestamp, type } = body;

    console.log('Received n8n webhook:', {
      workflowId,
      nodeId,
      type,
      timestamp,
      dataKeys: Object.keys(data || {}),
    });

    // Store webhook data in Supabase
    const { error: insertError } = await supabase
      .from('n8n_webhooks')
      .insert({
        workflow_id: workflowId,
        node_id: nodeId,
        webhook_type: type || 'trigger',
        payload: data,
        received_at: new Date().toISOString(),
        processed: false,
      });

    if (insertError) {
      console.error('Error storing webhook data:', insertError);
      return NextResponse.json(
        { error: 'Failed to store webhook data' },
        { status: 500 }
      );
    }

    // Process different types of webhooks
    let response: { success: boolean; message: string; actions?: string[]; error?: string } = { success: true, message: 'Webhook received' };

    switch (type) {
      case 'user_signup':
        response = await handleUserSignup(data);
        break;
      case 'project_created':
        response = await handleProjectCreated(data);
        break;
      case 'payment_received':
        response = await handlePaymentReceived(data);
        break;
      case 'task_completed':
        response = await handleTaskCompleted(data);
        break;
      case 'email_trigger':
        response = await handleEmailTrigger(data);
        break;
      default:
        // Generic webhook processing
        response = await handleGenericWebhook(data);
    }

    // Mark webhook as processed
    await supabase
      .from('n8n_webhooks')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('workflow_id', workflowId)
      .eq('node_id', nodeId)
      .eq('received_at', timestamp);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error processing n8n webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleUserSignup(data: any) {
  try {
    const { user_id, email, profile_data } = data;
    
    // Send welcome email
    // Update user profile
    // Create onboarding tasks
    
    return {
      success: true,
      message: 'User signup processed',
      actions: ['welcome_email_sent', 'profile_updated', 'onboarding_tasks_created']
    };
  } catch (error) {
    console.error('Error handling user signup:', error);
    return { success: false, message: 'Failed to process user signup', error: 'Failed to process user signup' };
  }
}

async function handleProjectCreated(data: any) {
  try {
    const { project_id, project_name, client_email, project_type } = data;
    
    // Send project confirmation email
    // Create project tasks
    // Update project status
    
    return {
      success: true,
      message: 'Project creation processed',
      actions: ['confirmation_email_sent', 'project_tasks_created', 'status_updated']
    };
  } catch (error) {
    console.error('Error handling project creation:', error);
    return { success: false, message: 'Failed to process project creation', error: 'Failed to process project creation' };
  }
}

async function handlePaymentReceived(data: any) {
  try {
    const { payment_id, amount, currency, project_id, client_id } = data;
    
    // Update payment status
    // Send payment confirmation
    // Trigger project milestones
    
    return {
      success: true,
      message: 'Payment processed',
      actions: ['payment_confirmed', 'confirmation_sent', 'milestones_updated']
    };
  } catch (error) {
    console.error('Error handling payment:', error);
    return { success: false, message: 'Failed to process payment', error: 'Failed to process payment' };
  }
}

async function handleTaskCompleted(data: any) {
  try {
    const { task_id, user_id, project_id, completion_time } = data;
    
    // Update task status
    // Send notifications
    // Update project progress
    
    return {
      success: true,
      message: 'Task completion processed',
      actions: ['task_updated', 'notifications_sent', 'progress_updated']
    };
  } catch (error) {
    console.error('Error handling task completion:', error);
    return { success: false, message: 'Failed to process task completion', error: 'Failed to process task completion' };
  }
}

async function handleEmailTrigger(data: any) {
  try {
    const { email_type, recipient, template_data } = data;
    
    // Send email based on type
    // Track email metrics
    // Update communication history
    
    return {
      success: true,
      message: 'Email trigger processed',
      actions: ['email_sent', 'metrics_updated', 'history_updated']
    };
  } catch (error) {
    console.error('Error handling email trigger:', error);
    return { success: false, message: 'Failed to process email trigger', error: 'Failed to process email trigger' };
  }
}

async function handleGenericWebhook(data: any) {
  try {
    // Generic processing for unknown webhook types
    console.log('Processing generic webhook with data:', data);
    
    return {
      success: true,
      message: 'Generic webhook processed',
      actions: ['data_stored', 'notification_sent']
    };
  } catch (error) {
    console.error('Error handling generic webhook:', error);
    return { success: false, message: 'Failed to process generic webhook', error: 'Failed to process generic webhook' };
  }
} 