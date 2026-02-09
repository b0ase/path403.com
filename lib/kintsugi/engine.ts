/**
 * Kintsugi Engine
 *
 * The core coordination engine that mediates three-party negotiations
 * between founders, developers, and investors.
 *
 * Pattern: capture → negotiate → commit → meter → settle
 */

import { KimiClient, createKimiClient, KimiMessage, KimiMode, KimiResponse } from './kimi-client'
import { allKintsugiTools, toolCategories } from './tools'
import { executeTool, executeTools, ToolExecutionContext } from './tool-executor'
import { meterApiCall, captureEvent } from '@/lib/m2m'
import OpenAI from 'openai'

export type PartyRole = 'founder' | 'developer' | 'investor' | 'observer'

export interface KintsugiSession {
  id: string
  participants: {
    id: string
    role: PartyRole
    name: string
  }[]
  status: 'negotiating' | 'contracted' | 'executing' | 'completed' | 'disputed'
  contractId?: string
  messages: KimiMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface KintsugiEngineConfig {
  mode?: KimiMode
  maxToolIterations?: number
  systemPrompt?: string
}

const DEFAULT_SYSTEM_PROMPT = `You are Kintsugi, an AI agent that mediates economic coordination between three parties: founders, developers, and investors.

Your role is NOT to be creative or make decisions. Your role is:
1. CAPTURE - Record commitments, agreements, and intentions
2. NEGOTIATE - Help parties reach mutual agreement on terms
3. COMMIT - Lock in agreements as structured contracts
4. METER - Track progress against milestones
5. SETTLE - Release capital and equity when conditions are met

You have access to tools for:
- Creating and managing contracts
- Tracking milestones and deliverables
- Managing escrow and payments
- Resolving disputes fairly
- Facilitating negotiations

IMPORTANT RULES:
1. Never make decisions on behalf of parties - always ask for explicit confirmation
2. Always capture commitments precisely - no ambiguity
3. Be neutral - represent all parties' interests fairly
4. Enforce agreed terms - once committed, terms are binding
5. Flag risks and concerns proactively
6. Keep an audit trail of all significant actions

When parties disagree, facilitate discussion. When they agree, capture and commit.
When milestones are delivered, verify and release. When disputes arise, mediate fairly.

You are the neutral system of record. Parties don't need to trust each other - they trust you.`

export class KintsugiEngine {
  private client: KimiClient
  private config: KintsugiEngineConfig
  private systemPrompt: string

  constructor(config: KintsugiEngineConfig = {}) {
    this.config = {
      mode: config.mode || 'agent',
      maxToolIterations: config.maxToolIterations || 10,
      systemPrompt: config.systemPrompt || DEFAULT_SYSTEM_PROMPT
    }

    this.client = createKimiClient(this.config.mode)
    this.systemPrompt = this.config.systemPrompt
  }

  /**
   * Start a new Kintsugi session
   */
  async startSession(participants: KintsugiSession['participants']): Promise<KintsugiSession> {
    const session: KintsugiSession = {
      id: `ks_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      participants,
      status: 'negotiating',
      messages: [
        {
          role: 'system',
          content: this.systemPrompt
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Capture session start
    await captureEvent({
      source: 'kintsugi_agent',
      eventType: 'session_started',
      externalId: session.id,
      payload: { participants },
      metadata: { sessionId: session.id }
    })

    return session
  }

  /**
   * Send a message in a session and get a response
   */
  async chat(
    session: KintsugiSession,
    message: string,
    senderId: string
  ): Promise<{
    response: string
    reasoning?: string
    toolsUsed: string[]
    session: KintsugiSession
  }> {
    const sender = session.participants.find(p => p.id === senderId)
    const senderLabel = sender ? `[${sender.role.toUpperCase()}: ${sender.name}]` : `[User: ${senderId}]`

    // Add user message
    session.messages.push({
      role: 'user',
      content: `${senderLabel}\n${message}`
    })

    // Meter the API call
    await meterApiCall('kintsugi_engine', session.id)

    const context: ToolExecutionContext = {
      userId: senderId,
      sessionId: session.id,
      contractId: session.contractId
    }

    // Get appropriate tools based on session status
    const tools = this.getToolsForStatus(session.status)

    let response: KimiResponse
    const toolsUsed: string[] = []
    let iterations = 0

    // Tool execution loop
    while (iterations < (this.config.maxToolIterations || 10)) {
      response = await this.client.complete({
        messages: session.messages,
        tools,
        mode: this.config.mode
      })

      // If no tool calls, we're done
      if (!response.tool_calls || response.tool_calls.length === 0) {
        break
      }

      // Execute tools
      const toolResults = await executeTools(response.tool_calls, context)

      // Add assistant message with tool calls
      session.messages.push({
        role: 'assistant',
        content: response.content || '',
        tool_calls: response.tool_calls
      })

      // Add tool results
      for (const [toolCallId, result] of Array.from(toolResults.entries())) {
        const toolCall = response.tool_calls.find(tc => tc.id === toolCallId)
        if (toolCall) {
          toolsUsed.push(toolCall.function.name)
          session.messages.push({
            role: 'tool',
            content: JSON.stringify(result),
            tool_call_id: toolCallId
          })
        }
      }

      iterations++
    }

    // Add final response
    session.messages.push({
      role: 'assistant',
      content: response!.content
    })

    session.updatedAt = new Date()

    // Capture the interaction
    await captureEvent({
      source: 'kintsugi_agent',
      eventType: 'chat_turn',
      externalId: `turn_${Date.now()}`,
      payload: {
        senderId,
        message,
        response: response!.content,
        toolsUsed,
        tokenUsage: response!.usage
      },
      metadata: { sessionId: session.id }
    })

    return {
      response: response!.content,
      reasoning: response!.reasoning,
      toolsUsed,
      session
    }
  }

  /**
   * Stream a chat response
   */
  async *streamChat(
    session: KintsugiSession,
    message: string,
    senderId: string
  ): AsyncGenerator<{
    type: 'content' | 'reasoning' | 'tool_call' | 'done'
    data: string
  }> {
    const sender = session.participants.find(p => p.id === senderId)
    const senderLabel = sender ? `[${sender.role.toUpperCase()}: ${sender.name}]` : `[User: ${senderId}]`

    session.messages.push({
      role: 'user',
      content: `${senderLabel}\n${message}`
    })

    await meterApiCall('kintsugi_engine', session.id)

    const tools = this.getToolsForStatus(session.status)
    let fullContent = ''
    let fullReasoning = ''

    for await (const chunk of this.client.stream({
      messages: session.messages,
      tools,
      mode: this.config.mode
    })) {
      if (chunk.content) {
        fullContent += chunk.content
        yield { type: 'content', data: chunk.content }
      }
      if (chunk.reasoning) {
        fullReasoning += chunk.reasoning
        yield { type: 'reasoning', data: chunk.reasoning }
      }
      if (chunk.tool_calls) {
        for (const tc of chunk.tool_calls) {
          yield { type: 'tool_call', data: tc.function.name }
        }
      }
      if (chunk.done) {
        yield { type: 'done', data: '' }
      }
    }

    session.messages.push({
      role: 'assistant',
      content: fullContent
    })
    session.updatedAt = new Date()
  }

  /**
   * Get appropriate tools based on session status
   */
  private getToolsForStatus(status: KintsugiSession['status']) {
    switch (status) {
      case 'negotiating':
        return [...toolCategories.negotiation, ...toolCategories.contract]
      case 'contracted':
        return [...toolCategories.contract, ...toolCategories.payment]
      case 'executing':
        return [...toolCategories.milestone, ...toolCategories.payment, ...toolCategories.dispute]
      case 'disputed':
        return [...toolCategories.dispute, ...toolCategories.payment]
      case 'completed':
        return toolCategories.contract // Read-only access
      default:
        return allKintsugiTools
    }
  }

  /**
   * Update session status
   */
  async updateStatus(
    session: KintsugiSession,
    newStatus: KintsugiSession['status'],
    reason: string
  ): Promise<KintsugiSession> {
    const oldStatus = session.status
    session.status = newStatus
    session.updatedAt = new Date()

    await captureEvent({
      source: 'kintsugi_agent',
      eventType: 'status_changed',
      externalId: `status_${Date.now()}`,
      payload: { oldStatus, newStatus, reason },
      metadata: { sessionId: session.id }
    })

    return session
  }

  /**
   * Link a contract to the session
   */
  async linkContract(session: KintsugiSession, contractId: string): Promise<KintsugiSession> {
    session.contractId = contractId
    session.status = 'contracted'
    session.updatedAt = new Date()

    await captureEvent({
      source: 'kintsugi_agent',
      eventType: 'contract_linked',
      externalId: contractId,
      payload: { sessionId: session.id, contractId },
      metadata: { sessionId: session.id }
    })

    return session
  }

  /**
   * Get session summary for external use
   */
  getSessionSummary(session: KintsugiSession) {
    return {
      id: session.id,
      status: session.status,
      participants: session.participants.map(p => ({
        name: p.name,
        role: p.role
      })),
      contractId: session.contractId,
      messageCount: session.messages.filter(m => m.role !== 'system').length,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    }
  }

  /**
   * Get client info
   */
  getProviderInfo() {
    return this.client.getProviderInfo()
  }
}

/**
 * Create a Kintsugi engine with default configuration
 */
export function createKintsugiEngine(config?: KintsugiEngineConfig): KintsugiEngine {
  return new KintsugiEngine(config)
}
