/**
 * Agent Task Executor
 *
 * Executes agent tasks based on their configuration.
 * Supports multiple task types: tweet, blog, analysis, webhook, inscription, custom
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { inscribeAndSaveAgentOutput } from './agent-inscription';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface TaskExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  tokens_used?: number;
  duration_ms?: number;
}

export interface AgentTask {
  id: string;
  agent_id: string;
  task_name: string;
  task_description: string | null;
  task_type: string;
  cron_expression: string | null;
  next_run_at: string | null;
  last_run_at: string | null;
  task_config: Record<string, unknown>;
  priority: number;
  retry_count: number;
  timeout_seconds: number;
  is_enabled: boolean;
  execution_count: number;
  success_count: number;
  failure_count: number;
}

export interface Agent {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  role: string;
  ai_provider: string;
  ai_model: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string | null;
  is_active: boolean;
}

export interface AgentProject {
  project_id: string;
  can_read: boolean;
  can_write: boolean;
  can_deploy: boolean;
  is_active: boolean;
  project: {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    status: string | null;
    url: string | null;
  };
}

/**
 * Get linked projects for an agent
 */
async function getAgentProjects(agentId: string): Promise<AgentProject[]> {
  const { data } = await supabase
    .from('agent_projects')
    .select(`
      project_id,
      can_read,
      can_write,
      can_deploy,
      is_active,
      projects (
        id,
        name,
        description,
        category,
        status,
        url
      )
    `)
    .eq('agent_id', agentId)
    .eq('is_active', true);

  if (!data) return [];

  return data
    .filter((ap) => ap.projects)
    .map((ap) => ({
      project_id: ap.project_id,
      can_read: ap.can_read ?? true,
      can_write: ap.can_write ?? false,
      can_deploy: ap.can_deploy ?? false,
      is_active: ap.is_active ?? true,
      project: ap.projects as unknown as AgentProject['project'],
    }));
}

/**
 * Build project context string for system prompts
 */
function buildProjectContext(projects: AgentProject[]): string {
  if (!projects.length) return '';

  const projectList = projects
    .map((ap) => {
      const permissions: string[] = [];
      if (ap.can_read) permissions.push('read');
      if (ap.can_write) permissions.push('write');
      if (ap.can_deploy) permissions.push('deploy');
      return `- ${ap.project.name}${ap.project.description ? ` (${ap.project.description})` : ''} [${permissions.join(', ')}]${ap.project.url ? ` - ${ap.project.url}` : ''}`;
    })
    .join('\n');

  return `\n\n## Linked Projects\nYou have access to the following projects:\n${projectList}\n\nConsider these projects when executing tasks.`;
}

/**
 * Execute a single agent task
 */
export async function executeAgentTask(taskId: string): Promise<TaskExecutionResult> {
  const startTime = Date.now();

  try {
    // Fetch task with agent info
    const { data: task, error: taskError } = await supabase
      .from('agent_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    // Fetch agent
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', task.agent_id)
      .single();

    if (agentError || !agent) {
      throw new Error(`Agent not found for task: ${taskId}`);
    }

    if (!agent.is_active) {
      throw new Error(`Agent ${agent.name} is not active`);
    }

    // Fetch linked projects for context
    const projects = await getAgentProjects(agent.id);
    const projectContext = buildProjectContext(projects);

    console.log(`[AgentExecutor] Executing task: ${task.task_name} for agent: ${agent.name} (${projects.length} projects)`);

    // Execute based on task type
    let result: TaskExecutionResult;
    const config = task.task_config || {};
    const taskType = (config.task_type as string) || task.task_type;

    switch (taskType) {
      case 'tweet':
        result = await executeTweetTask(agent, task, config, projectContext);
        break;

      case 'blog':
        result = await executeBlogTask(agent, task, config, projectContext);
        break;

      case 'analysis':
        result = await executeAnalysisTask(agent, task, config, projectContext);
        break;

      case 'webhook':
        result = await executeWebhookTask(agent, task, config);
        break;

      case 'ai_generate':
        result = await executeAIGenerateTask(agent, task, config, projectContext);
        break;

      case 'inscription':
        result = await executeInscriptionTask(agent, task, config, projectContext);
        break;

      default:
        result = await executeCustomTask(agent, task, config);
    }

    // Update task stats
    const duration = Date.now() - startTime;
    await updateTaskStats(task.id, result.success, duration);

    // Save output
    if (result.output) {
      await saveTaskOutput(agent.id, task.id, taskType, result.output);
    }

    // Update agent last_active_at
    await supabase
      .from('agents')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', agent.id);

    return {
      ...result,
      duration_ms: duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[AgentExecutor] Task execution failed:`, error);

    // Update failure stats
    await updateTaskStats(taskId, false, duration);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: duration,
    };
  }
}

/**
 * Execute a tweet generation/posting task
 */
async function executeTweetTask(
  agent: Agent,
  task: AgentTask,
  config: Record<string, unknown>,
  projectContext: string = ''
): Promise<TaskExecutionResult> {
  try {
    const topic = config.topic as string || task.task_description || 'something interesting';
    const style = config.style as string || 'informative and engaging';

    // Generate tweet content using Claude
    const prompt = `Generate a tweet about: ${topic}
Style: ${style}
Requirements:
- Maximum 280 characters
- No hashtags unless specifically relevant
- Engaging and on-brand
- No quotation marks around the tweet

Just output the tweet text, nothing else.`;

    const systemPrompt = (agent.system_prompt || 'You are a social media expert who writes engaging tweets.') + projectContext;

    const message = await anthropic.messages.create({
      model: agent.ai_model || 'claude-sonnet-4-5-20250929',
      max_tokens: 100,
      temperature: agent.temperature || 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    const tweetContent = message.content[0].type === 'text'
      ? message.content[0].text.trim()
      : '';

    // Check if we should actually post (config.auto_post)
    if (config.auto_post && config.social_account_id) {
      // Add to post queue
      await supabase.from('post_queue').insert({
        social_account_id: config.social_account_id,
        post_content: tweetContent.substring(0, 280),
        status: 'queued',
      });
    }

    return {
      success: true,
      output: tweetContent,
      tokens_used: message.usage.input_tokens + message.usage.output_tokens,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Tweet generation failed',
    };
  }
}

/**
 * Execute a blog post generation task
 */
async function executeBlogTask(
  agent: Agent,
  task: AgentTask,
  config: Record<string, unknown>,
  projectContext: string = ''
): Promise<TaskExecutionResult> {
  try {
    const topic = config.topic as string || task.task_description || 'technology';
    const wordCount = config.word_count as number || 800;

    const prompt = `Write a blog post about: ${topic}

Requirements:
- Approximately ${wordCount} words
- Use only ## for section headings (H2), never # or ###
- Include an engaging introduction
- Include 3-5 main sections
- Include a conclusion
- Professional but approachable tone
- No frontmatter - just the content

Write the blog post now.`;

    const systemPrompt = (agent.system_prompt || 'You are an expert blog writer for b0ase.com, a venture studio that builds web apps, AI agents, and blockchain integrations.') + projectContext;

    const message = await anthropic.messages.create({
      model: agent.ai_model || 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      temperature: agent.temperature || 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    const blogContent = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    return {
      success: true,
      output: blogContent,
      tokens_used: message.usage.input_tokens + message.usage.output_tokens,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Blog generation failed',
    };
  }
}

/**
 * Execute an analysis task
 */
async function executeAnalysisTask(
  agent: Agent,
  task: AgentTask,
  config: Record<string, unknown>,
  projectContext: string = ''
): Promise<TaskExecutionResult> {
  try {
    const analysisType = config.analysis_type as string || 'general';
    const data = config.data as string || '';

    const prompt = `Perform a ${analysisType} analysis.
${data ? `Data to analyze:\n${data}` : 'Analyze current trends and provide insights.'}

Provide:
1. Key findings
2. Actionable recommendations
3. Potential risks or concerns
4. Next steps`;

    const systemPrompt = (agent.system_prompt || 'You are a business analyst providing data-driven insights.') + projectContext;

    const message = await anthropic.messages.create({
      model: agent.ai_model || 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      temperature: agent.temperature || 0.5,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    const analysis = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    return {
      success: true,
      output: analysis,
      tokens_used: message.usage.input_tokens + message.usage.output_tokens,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Analysis failed',
    };
  }
}

/**
 * Execute a webhook task (call external API)
 */
async function executeWebhookTask(
  agent: Agent,
  task: AgentTask,
  config: Record<string, unknown>
): Promise<TaskExecutionResult> {
  try {
    const url = config.webhook_url as string;
    const method = (config.method as string) || 'POST';
    const headers = (config.headers as Record<string, string>) || {};
    const body = config.body as Record<string, unknown>;

    if (!url) {
      throw new Error('Webhook URL is required');
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseText = await response.text();

    return {
      success: response.ok,
      output: responseText,
      error: response.ok ? undefined : `HTTP ${response.status}: ${responseText}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Webhook execution failed',
    };
  }
}

/**
 * Execute an AI generation task with custom prompt
 */
async function executeAIGenerateTask(
  agent: Agent,
  task: AgentTask,
  config: Record<string, unknown>,
  projectContext: string = ''
): Promise<TaskExecutionResult> {
  try {
    const prompt = config.prompt as string || task.task_description || '';

    if (!prompt) {
      throw new Error('Prompt is required for AI generation task');
    }

    const systemPrompt = (agent.system_prompt || 'You are a helpful AI assistant.') + projectContext;

    const message = await anthropic.messages.create({
      model: agent.ai_model || 'claude-sonnet-4-5-20250929',
      max_tokens: (config.max_tokens as number) || agent.max_tokens || 4096,
      temperature: (config.temperature as number) || agent.temperature || 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    const output = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    return {
      success: true,
      output,
      tokens_used: message.usage.input_tokens + message.usage.output_tokens,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'AI generation failed',
    };
  }
}

/**
 * Execute an inscription task (inscribe content on BSV blockchain)
 */
async function executeInscriptionTask(
  agent: Agent,
  task: AgentTask,
  config: Record<string, unknown>,
  projectContext: string = ''
): Promise<TaskExecutionResult> {
  try {
    // Check if BSV key is configured
    if (!process.env.BOASE_TREASURY_PRIVATE_KEY && !process.env.MONEYBUTTON_BSV_ORDINALS_PRIVATE_KEY) {
      throw new Error('BSV inscription not configured - BOASE_TREASURY_PRIVATE_KEY missing');
    }

    // Determine what to inscribe
    const contentSource = config.content_source as string || 'generate';
    let content: string;
    let contentType: 'text/plain' | 'text/markdown' | 'application/json' = 'text/plain';

    if (contentSource === 'generate') {
      // Generate content using AI
      const prompt = config.prompt as string || task.task_description || 'Generate a summary';

      const systemPrompt = (agent.system_prompt || 'You are a helpful AI assistant.') + projectContext;

      const message = await anthropic.messages.create({
        model: agent.ai_model || 'claude-sonnet-4-5-20250929',
        max_tokens: (config.max_tokens as number) || 2048,
        temperature: (config.temperature as number) || agent.temperature || 0.7,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });

      content = message.content[0].type === 'text' ? message.content[0].text : '';
      contentType = 'text/markdown';
    } else if (contentSource === 'static') {
      // Use static content from config
      content = config.content as string || '';
      contentType = (config.content_type as typeof contentType) || 'text/plain';
    } else if (contentSource === 'latest_output') {
      // Fetch latest agent output
      const { data: output } = await supabase
        .from('agent_outputs')
        .select('content, output_type')
        .eq('agent_id', agent.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!output) {
        throw new Error('No recent output found to inscribe');
      }
      content = output.content;
      contentType = output.output_type === 'json' ? 'application/json' : 'text/markdown';
    } else {
      throw new Error(`Unknown content_source: ${contentSource}`);
    }

    if (!content) {
      throw new Error('No content to inscribe');
    }

    // Inscribe on blockchain
    const result = await inscribeAndSaveAgentOutput({
      agentId: agent.id,
      agentName: agent.name,
      content,
      contentType,
      modelName: agent.ai_model,
      taskName: task.task_name,
      metadata: {
        taskId: task.id,
        contentSource,
        inscribedAt: new Date().toISOString(),
      },
    });

    return {
      success: true,
      output: JSON.stringify({
        txid: result.txid,
        inscriptionId: result.inscriptionId,
        contentHash: result.contentHash,
        explorerUrl: result.blockchainExplorerUrl,
      }),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Inscription failed',
    };
  }
}

/**
 * Execute a custom/manual task
 */
async function executeCustomTask(
  agent: Agent,
  task: AgentTask,
  config: Record<string, unknown>
): Promise<TaskExecutionResult> {
  // For custom tasks, we just log and return success
  // Users can extend this based on their needs
  console.log(`[AgentExecutor] Custom task executed: ${task.task_name}`);

  return {
    success: true,
    output: `Custom task "${task.task_name}" executed at ${new Date().toISOString()}`,
  };
}

/**
 * Update task execution statistics
 */
async function updateTaskStats(taskId: string, success: boolean, durationMs: number) {
  const incrementField = success ? 'success_count' : 'failure_count';

  // Get current task to increment counts
  const { data: task } = await supabase
    .from('agent_tasks')
    .select('execution_count, success_count, failure_count')
    .eq('id', taskId)
    .single();

  if (task) {
    await supabase
      .from('agent_tasks')
      .update({
        last_run_at: new Date().toISOString(),
        execution_count: (task.execution_count || 0) + 1,
        [incrementField]: (task[incrementField as keyof typeof task] as number || 0) + 1,
      })
      .eq('id', taskId);
  }
}

/**
 * Save task output to agent_outputs table
 */
async function saveTaskOutput(
  agentId: string,
  taskId: string,
  outputType: string,
  content: string
) {
  await supabase.from('agent_outputs').insert({
    agent_id: agentId,
    task_id: taskId,
    output_type: outputType,
    content,
    status: 'draft',
  });
}

/**
 * Get all due tasks (for cron execution)
 */
export async function getDueTasks(): Promise<AgentTask[]> {
  const now = new Date().toISOString();

  const { data: tasks, error } = await supabase
    .from('agent_tasks')
    .select('*')
    .eq('is_enabled', true)
    .lte('next_run_at', now)
    .order('priority', { ascending: false });

  if (error) {
    console.error('[AgentExecutor] Error fetching due tasks:', error);
    return [];
  }

  return tasks || [];
}

/**
 * Execute all due tasks
 */
export async function executeAllDueTasks(): Promise<{
  executed: number;
  succeeded: number;
  failed: number;
  results: TaskExecutionResult[];
}> {
  const tasks = await getDueTasks();
  const results: TaskExecutionResult[] = [];
  let succeeded = 0;
  let failed = 0;

  for (const task of tasks) {
    const result = await executeAgentTask(task.id);
    results.push(result);

    if (result.success) {
      succeeded++;
    } else {
      failed++;
    }

    // Calculate and update next_run_at for cron tasks
    if (task.cron_expression && task.task_type === 'cron') {
      const { calculateNextRun } = await import('./cron-scheduler');
      const nextRun = calculateNextRun(task.cron_expression);

      if (nextRun) {
        await supabase
          .from('agent_tasks')
          .update({ next_run_at: nextRun.toISOString() })
          .eq('id', task.id);
      }
    }
  }

  return {
    executed: tasks.length,
    succeeded,
    failed,
    results,
  };
}
