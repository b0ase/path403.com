/**
 * Kimi K2.5 Client - OpenAI-compatible API wrapper
 *
 * Supports multiple providers:
 * - Moonshot Direct (platform.moonshot.ai)
 * - OpenRouter (openrouter.ai)
 * - Together AI (api.together.xyz)
 * - NVIDIA (integrate.api.nvidia.com)
 */

import OpenAI from 'openai'

export type KimiProvider = 'moonshot' | 'openrouter' | 'together' | 'nvidia'

export type KimiMode = 'instant' | 'thinking' | 'agent' | 'swarm'

interface KimiConfig {
  provider: KimiProvider
  apiKey: string
  mode?: KimiMode
}

interface ProviderConfig {
  baseURL: string
  model: string
  defaultHeaders?: Record<string, string>
}

const PROVIDER_CONFIGS: Record<KimiProvider, ProviderConfig> = {
  moonshot: {
    baseURL: 'https://api.moonshot.cn/v1',
    model: 'kimi-k2.5'
  },
  openrouter: {
    baseURL: 'https://openrouter.ai/api/v1',
    model: 'moonshotai/kimi-k2.5',
    defaultHeaders: {
      'HTTP-Referer': 'https://b0ase.com',
      'X-Title': 'Kintsugi Engine'
    }
  },
  together: {
    baseURL: 'https://api.together.xyz/v1',
    model: 'moonshotai/Kimi-K2.5'
  },
  nvidia: {
    baseURL: 'https://integrate.api.nvidia.com/v1',
    model: 'moonshotai/kimi-k2.5'
  }
}

// Pricing per million tokens (for metering)
export const KIMI_PRICING = {
  input: 0.50,  // $0.50 per million input tokens
  output: 2.80  // $2.80 per million output tokens
}

export interface KimiMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  name?: string
  tool_call_id?: string
  tool_calls?: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]
}

export interface KimiTool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export interface KimiCompletionOptions {
  messages: KimiMessage[]
  tools?: KimiTool[]
  mode?: KimiMode
  temperature?: number
  top_p?: number
  max_tokens?: number
  stream?: boolean
}

export interface KimiResponse {
  id: string
  content: string
  reasoning?: string
  tool_calls?: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  cost: {
    input: number
    output: number
    total: number
  }
}

export class KimiClient {
  private client: OpenAI
  private model: string
  private mode: KimiMode
  private provider: KimiProvider

  constructor(config: KimiConfig) {
    const providerConfig = PROVIDER_CONFIGS[config.provider]

    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: providerConfig.baseURL,
      defaultHeaders: providerConfig.defaultHeaders
    })

    this.model = providerConfig.model
    this.mode = config.mode || 'instant'
    this.provider = config.provider
  }

  /**
   * Calculate cost from token usage
   */
  private calculateCost(promptTokens: number, completionTokens: number) {
    const inputCost = (promptTokens / 1_000_000) * KIMI_PRICING.input
    const outputCost = (completionTokens / 1_000_000) * KIMI_PRICING.output
    return {
      input: inputCost,
      output: outputCost,
      total: inputCost + outputCost
    }
  }

  /**
   * Get mode-specific parameters
   */
  private getModeParams(mode: KimiMode): Record<string, unknown> {
    switch (mode) {
      case 'thinking':
        return {
          temperature: 1.0,
          top_p: 0.95
        }
      case 'instant':
        return {
          temperature: 0.6,
          top_p: 0.95,
          extra_body: {
            chat_template_kwargs: { thinking: false }
          }
        }
      case 'agent':
        return {
          temperature: 0.7,
          top_p: 0.95
        }
      case 'swarm':
        return {
          temperature: 0.7,
          top_p: 0.95,
          // Agent Swarm mode - enables parallel sub-agent coordination
          extra_body: {
            agent_swarm: true,
            max_agents: 10 // Up to 100 supported, start conservative
          }
        }
      default:
        return {}
    }
  }

  /**
   * Send a completion request
   */
  async complete(options: KimiCompletionOptions): Promise<KimiResponse> {
    const mode = options.mode || this.mode
    const modeParams = this.getModeParams(mode)

    const requestParams: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
      model: this.model,
      messages: options.messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: options.temperature ?? (modeParams.temperature as number) ?? 0.7,
      top_p: options.top_p ?? (modeParams.top_p as number) ?? 0.95,
      max_tokens: options.max_tokens ?? 4096,
      stream: false
    }

    // Add tools if provided
    if (options.tools && options.tools.length > 0) {
      requestParams.tools = options.tools as OpenAI.Chat.Completions.ChatCompletionTool[]
      requestParams.tool_choice = 'auto'
    }

    const response = await this.client.chat.completions.create(requestParams)

    const message = response.choices[0]?.message
    const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }

    return {
      id: response.id,
      content: message?.content || '',
      reasoning: (message as unknown as Record<string, unknown>)?.reasoning_content as string | undefined,
      tool_calls: message?.tool_calls,
      usage: {
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
        total_tokens: usage.total_tokens
      },
      cost: this.calculateCost(usage.prompt_tokens, usage.completion_tokens)
    }
  }

  /**
   * Stream a completion request
   */
  async *stream(options: KimiCompletionOptions): AsyncGenerator<{
    content?: string
    reasoning?: string
    tool_calls?: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]
    done: boolean
  }> {
    const mode = options.mode || this.mode
    const modeParams = this.getModeParams(mode)

    const requestParams: OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming = {
      model: this.model,
      messages: options.messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: options.temperature ?? (modeParams.temperature as number) ?? 0.7,
      top_p: options.top_p ?? (modeParams.top_p as number) ?? 0.95,
      max_tokens: options.max_tokens ?? 4096,
      stream: true
    }

    if (options.tools && options.tools.length > 0) {
      requestParams.tools = options.tools as OpenAI.Chat.Completions.ChatCompletionTool[]
      requestParams.tool_choice = 'auto'
    }

    const stream = await this.client.chat.completions.create(requestParams)

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta
      yield {
        content: delta?.content || undefined,
        reasoning: (delta as Record<string, unknown>)?.reasoning_content as string | undefined,
        tool_calls: delta?.tool_calls as OpenAI.Chat.Completions.ChatCompletionMessageToolCall[] | undefined,
        done: chunk.choices[0]?.finish_reason !== null
      }
    }
  }

  /**
   * Get provider info
   */
  getProviderInfo() {
    return {
      provider: this.provider,
      model: this.model,
      mode: this.mode,
      pricing: KIMI_PRICING
    }
  }
}

/**
 * Create a Kimi client from environment variables
 */
export function createKimiClient(mode?: KimiMode): KimiClient {
  // Try providers in order of preference
  const providers: { key: string; provider: KimiProvider }[] = [
    { key: 'KIMI_API_KEY', provider: 'moonshot' },      // Primary - Moonshot direct
    { key: 'MOONSHOT_API_KEY', provider: 'moonshot' },  // Alias
    { key: 'OPENROUTER_API_KEY', provider: 'openrouter' },
    { key: 'TOGETHER_API_KEY', provider: 'together' },
    { key: 'NVIDIA_API_KEY', provider: 'nvidia' }
  ]

  for (const { key, provider } of providers) {
    const apiKey = process.env[key]
    if (apiKey) {
      console.log(`[kimi-client] Using ${key} with provider: ${provider}`)
      return new KimiClient({ provider, apiKey, mode })
    }
  }

  throw new Error(
    'No Kimi API key found. Set one of: KIMI_API_KEY, MOONSHOT_API_KEY, OPENROUTER_API_KEY, TOGETHER_API_KEY, NVIDIA_API_KEY'
  )
}
