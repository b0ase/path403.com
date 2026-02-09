import axios, { AxiosInstance } from 'axios';

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any[];
  settings: any;
  staticData: any;
  tags: string[];
  versionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface N8nExecution {
  id: string;
  finished: boolean;
  mode: string;
  retryOf: string | null;
  retrySuccessId: string | null;
  startedAt: string;
  stoppedAt: string | null;
  waitTill: string | null;
  workflowId: string;
  workflowData: {
    id: string;
    name: string;
    nodes: any[];
    connections: any[];
  };
  data: any;
  status: 'running' | 'success' | 'error' | 'waiting';
}

export interface N8nWebhookPayload {
  workflowId: string;
  nodeId: string;
  data: any;
  timestamp: string;
}

export class N8nClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  // Get all workflows
  async getWorkflows(): Promise<N8nWorkflow[]> {
    try {
      const response = await this.client.get('/api/v1/workflows');
      return response.data;
    } catch (error) {
      console.error('Error fetching n8n workflows:', error);
      throw error;
    }
  }

  // Get a specific workflow by ID
  async getWorkflow(id: string): Promise<N8nWorkflow> {
    try {
      const response = await this.client.get(`/api/v1/workflows/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching n8n workflow ${id}:`, error);
      throw error;
    }
  }

  // Activate a workflow
  async activateWorkflow(id: string): Promise<void> {
    try {
      await this.client.post(`/api/v1/workflows/${id}/activate`);
    } catch (error) {
      console.error(`Error activating n8n workflow ${id}:`, error);
      throw error;
    }
  }

  // Deactivate a workflow
  async deactivateWorkflow(id: string): Promise<void> {
    try {
      await this.client.post(`/api/v1/workflows/${id}/deactivate`);
    } catch (error) {
      console.error(`Error deactivating n8n workflow ${id}:`, error);
      throw error;
    }
  }

  // Execute a workflow
  async executeWorkflow(id: string, data?: any): Promise<N8nExecution> {
    try {
      const response = await this.client.post(`/api/v1/workflows/${id}/execute`, {
        data,
      });
      return response.data;
    } catch (error) {
      console.error(`Error executing n8n workflow ${id}:`, error);
      throw error;
    }
  }

  // Get workflow executions
  async getExecutions(workflowId?: string, limit: number = 50): Promise<N8nExecution[]> {
    try {
      const params: any = { limit };
      if (workflowId) {
        params.workflowId = workflowId;
      }
      
      const response = await this.client.get('/api/v1/executions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching n8n executions:', error);
      throw error;
    }
  }

  // Get a specific execution
  async getExecution(id: string): Promise<N8nExecution> {
    try {
      const response = await this.client.get(`/api/v1/executions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching n8n execution ${id}:`, error);
      throw error;
    }
  }

  // Delete an execution
  async deleteExecution(id: string): Promise<void> {
    try {
      await this.client.delete(`/api/v1/executions/${id}`);
    } catch (error) {
      console.error(`Error deleting n8n execution ${id}:`, error);
      throw error;
    }
  }

  // Test webhook endpoint
  async testWebhook(webhookUrl: string, data: any): Promise<any> {
    try {
      const response = await axios.post(webhookUrl, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error testing webhook:', error);
      throw error;
    }
  }
}

// Create a singleton instance
let n8nClient: N8nClient | null = null;

export function getN8nClient(): N8nClient {
  if (!n8nClient) {
    const baseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
    const apiKey = process.env.N8N_API_KEY || '';
    
    if (!apiKey) {
      throw new Error('N8N_API_KEY environment variable is required');
    }
    
    n8nClient = new N8nClient(baseUrl, apiKey);
  }
  
  return n8nClient;
} 