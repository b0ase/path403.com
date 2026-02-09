import { useState, useCallback } from 'react';
import { N8nWorkflow, N8nExecution } from '@/lib/n8n/client';

interface UseN8nReturn {
  // State
  workflows: N8nWorkflow[];
  executions: N8nExecution[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadWorkflows: () => Promise<void>;
  loadExecutions: (workflowId?: string, limit?: number) => Promise<void>;
  executeWorkflow: (workflowId: string, data?: any) => Promise<N8nExecution | null>;
  activateWorkflow: (workflowId: string) => Promise<boolean>;
  deactivateWorkflow: (workflowId: string) => Promise<boolean>;
  getWorkflow: (workflowId: string) => Promise<N8nWorkflow | null>;
  getExecution: (executionId: string) => Promise<N8nExecution | null>;
}

export function useN8n(): UseN8nReturn {
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>([]);
  const [executions, setExecutions] = useState<N8nExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWorkflows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/n8n/workflows');
      const data = await response.json();
      
      if (data.success) {
        setWorkflows(data.workflows);
      } else {
        setError(data.error || 'Failed to load workflows');
      }
    } catch (err) {
      setError('Failed to load workflows');
      console.error('Error loading workflows:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadExecutions = useCallback(async (workflowId?: string, limit: number = 50) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (workflowId) params.append('workflowId', workflowId);
      params.append('limit', limit.toString());
      
      const response = await fetch(`/api/n8n/executions?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setExecutions(data.executions);
      } else {
        setError(data.error || 'Failed to load executions');
      }
    } catch (err) {
      setError('Failed to load executions');
      console.error('Error loading executions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const executeWorkflow = useCallback(async (workflowId: string, data?: any): Promise<N8nExecution | null> => {
    setError(null);
    try {
      const response = await fetch('/api/n8n/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId, data })
      });
      
      const result = await response.json();
      if (result.success) {
        return result.execution;
      } else {
        setError(result.error || 'Failed to execute workflow');
        return null;
      }
    } catch (err) {
      setError('Failed to execute workflow');
      console.error('Error executing workflow:', err);
      return null;
    }
  }, []);

  const activateWorkflow = useCallback(async (workflowId: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await fetch(`/api/n8n/workflows/${workflowId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate' })
      });
      
      const result = await response.json();
      if (result.success) {
        // Refresh workflows to get updated status
        await loadWorkflows();
        return true;
      } else {
        setError(result.error || 'Failed to activate workflow');
        return false;
      }
    } catch (err) {
      setError('Failed to activate workflow');
      console.error('Error activating workflow:', err);
      return false;
    }
  }, [loadWorkflows]);

  const deactivateWorkflow = useCallback(async (workflowId: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await fetch(`/api/n8n/workflows/${workflowId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deactivate' })
      });
      
      const result = await response.json();
      if (result.success) {
        // Refresh workflows to get updated status
        await loadWorkflows();
        return true;
      } else {
        setError(result.error || 'Failed to deactivate workflow');
        return false;
      }
    } catch (err) {
      setError('Failed to deactivate workflow');
      console.error('Error deactivating workflow:', err);
      return false;
    }
  }, [loadWorkflows]);

  const getWorkflow = useCallback(async (workflowId: string): Promise<N8nWorkflow | null> => {
    setError(null);
    try {
      const response = await fetch(`/api/n8n/workflows/${workflowId}`);
      const data = await response.json();
      
      if (data.success) {
        return data.workflow;
      } else {
        setError(data.error || 'Failed to get workflow');
        return null;
      }
    } catch (err) {
      setError('Failed to get workflow');
      console.error('Error getting workflow:', err);
      return null;
    }
  }, []);

  const getExecution = useCallback(async (executionId: string): Promise<N8nExecution | null> => {
    setError(null);
    try {
      const response = await fetch(`/api/n8n/executions/${executionId}`);
      const data = await response.json();
      
      if (data.success) {
        return data.execution;
      } else {
        setError(data.error || 'Failed to get execution');
        return null;
      }
    } catch (err) {
      setError('Failed to get execution');
      console.error('Error getting execution:', err);
      return null;
    }
  }, []);

  return {
    workflows,
    executions,
    loading,
    error,
    loadWorkflows,
    loadExecutions,
    executeWorkflow,
    activateWorkflow,
    deactivateWorkflow,
    getWorkflow,
    getExecution,
  };
} 