# n8n Integration Guide

This document explains how to set up and use the n8n integration with your b0ase.com application.

## Overview

The n8n integration provides:
- **Workflow Management**: View, activate, deactivate, and execute n8n workflows
- **Execution Monitoring**: Track workflow executions and their status
- **Webhook Processing**: Handle incoming webhooks from n8n workflows
- **Admin Interface**: Manage workflows through a web-based admin panel

## Prerequisites

1. **n8n Instance**: You need a running n8n instance
2. **API Access**: n8n API key for authentication
3. **Database**: Supabase database with the required tables

## Setup Instructions

### 1. Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# n8n Configuration
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key_here

# Supabase (if not already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Database Setup

Run the database migration to create the required tables:

```bash
# Apply the migration
npx supabase db push
```

This creates:
- `n8n_webhooks` - Stores incoming webhook data
- `n8n_workflows` - Stores workflow metadata
- `n8n_executions` - Stores execution history

### 3. n8n Configuration

#### API Key Setup

1. In your n8n instance, go to Settings → API
2. Generate a new API key
3. Add the key to your environment variables

#### Webhook Configuration

Configure your n8n workflows to send webhooks to:
```
https://your-domain.com/api/n8n/webhook
```

Webhook payload format:
```json
{
  "workflowId": "workflow-id",
  "nodeId": "node-id",
  "type": "webhook_type",
  "data": {
    // Your webhook data
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Usage

### Admin Interface

Access the n8n admin panel at `/admin/n8n` (admin users only).

Features:
- **Workflows Tab**: View and manage all workflows
- **Executions Tab**: Monitor recent executions
- **Webhook Logs Tab**: View incoming webhook data

### API Endpoints

#### Get All Workflows
```bash
GET /api/n8n/workflows
```

#### Execute Workflow
```bash
POST /api/n8n/workflows
{
  "workflowId": "workflow-id",
  "data": { /* optional data */ }
}
```

#### Workflow Actions
```bash
POST /api/n8n/workflows/{id}
{
  "action": "activate|deactivate|execute",
  "data": { /* optional data for execute */ }
}
```

#### Get Executions
```bash
GET /api/n8n/executions?workflowId={id}&limit=50
```

### React Components

#### N8nWorkflowTrigger Component

Use this component to trigger workflows from your UI:

```tsx
import N8nWorkflowTrigger from '@/app/components/N8nWorkflowTrigger';

function MyComponent() {
  return (
    <N8nWorkflowTrigger
      workflowId="your-workflow-id"
      workflowName="My Workflow"
      defaultData={{ key: "value" }}
      onSuccess={(execution) => console.log('Success:', execution)}
      onError={(error) => console.error('Error:', error)}
      showDataInput={true}
      buttonText="Run Workflow"
    />
  );
}
```

#### useN8n Hook

Use the custom hook for programmatic access:

```tsx
import { useN8n } from '@/lib/hooks/useN8n';

function MyComponent() {
  const { 
    workflows, 
    executions, 
    loading, 
    error,
    loadWorkflows,
    executeWorkflow,
    activateWorkflow 
  } = useN8n();

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  const handleExecute = async () => {
    const execution = await executeWorkflow('workflow-id', { data: 'value' });
    if (execution) {
      console.log('Workflow executed:', execution);
    }
  };

  return (
    <div>
      {/* Your UI */}
    </div>
  );
}
```

## Webhook Types

The system supports these predefined webhook types:

### 1. User Signup
```json
{
  "type": "user_signup",
  "data": {
    "user_id": "user-uuid",
    "email": "user@example.com",
    "profile_data": { /* profile info */ }
  }
}
```

### 2. Project Created
```json
{
  "type": "project_created",
  "data": {
    "project_id": "project-uuid",
    "project_name": "Project Name",
    "client_email": "client@example.com",
    "project_type": "web_development"
  }
}
```

### 3. Payment Received
```json
{
  "type": "payment_received",
  "data": {
    "payment_id": "payment-uuid",
    "amount": 1000,
    "currency": "USD",
    "project_id": "project-uuid",
    "client_id": "client-uuid"
  }
}
```

### 4. Task Completed
```json
{
  "type": "task_completed",
  "data": {
    "task_id": "task-uuid",
    "user_id": "user-uuid",
    "project_id": "project-uuid",
    "completion_time": "2024-01-01T00:00:00Z"
  }
}
```

### 5. Email Trigger
```json
{
  "type": "email_trigger",
  "data": {
    "email_type": "welcome|notification|reminder",
    "recipient": "user@example.com",
    "template_data": { /* email template data */ }
  }
}
```

## Example Workflows

### 1. User Onboarding Workflow

Create an n8n workflow that:
1. Triggers on user signup
2. Sends welcome email
3. Creates onboarding tasks
4. Updates user profile

Webhook URL: `https://your-domain.com/api/n8n/webhook`

### 2. Project Management Workflow

Create an n8n workflow that:
1. Triggers on project creation
2. Sends confirmation email to client
3. Creates project tasks
4. Notifies team members

### 3. Payment Processing Workflow

Create an n8n workflow that:
1. Triggers on payment received
2. Updates project status
3. Sends payment confirmation
4. Triggers milestone completion

## Security

### Authentication
- Admin interface requires admin role
- API endpoints use service role for database operations
- Webhook endpoints validate incoming data

### Row Level Security (RLS)
- Only admins can read n8n data
- Service role can manage all n8n data
- Webhook data is stored securely

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check N8N_BASE_URL and N8N_API_KEY
   - Verify n8n instance is running
   - Check firewall settings

2. **Webhook Not Received**
   - Verify webhook URL is correct
   - Check n8n workflow configuration
   - Review webhook logs in admin panel

3. **Database Errors**
   - Run database migrations
   - Check Supabase connection
   - Verify RLS policies

### Debugging

1. **Check Logs**
   - Browser console for frontend errors
   - Server logs for API errors
   - n8n execution logs

2. **Test Webhook**
   - Use the webhook testing feature in n8n
   - Check webhook logs in admin panel
   - Verify payload format

3. **API Testing**
   - Test API endpoints with curl or Postman
   - Verify authentication headers
   - Check response status codes

## Best Practices

1. **Workflow Design**
   - Use descriptive workflow names
   - Add proper error handling
   - Include logging and monitoring

2. **Webhook Security**
   - Validate incoming data
   - Use HTTPS for webhook URLs
   - Implement rate limiting

3. **Performance**
   - Keep workflows efficient
   - Monitor execution times
   - Clean up old execution logs

4. **Monitoring**
   - Regular check of webhook logs
   - Monitor workflow success rates
   - Set up alerts for failures

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review n8n documentation
3. Check application logs
4. Contact the development team 