/**
 * Kintsugi Engine Streaming API
 *
 * POST /api/kintsugi/engine/stream - Stream chat response
 */

import { NextRequest } from 'next/server'
import { createKintsugiEngine, KintsugiSession } from '@/lib/kintsugi'

// In-memory session storage (shared with main route in production, use Redis)
const sessions = new Map<string, KintsugiSession>()

const engine = createKintsugiEngine({
  mode: 'agent'
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, message, senderId, participants } = body

    let session: KintsugiSession

    // Start new session if no sessionId provided
    if (!sessionId) {
      if (!participants || !Array.isArray(participants)) {
        return new Response(
          JSON.stringify({ error: 'participants array required for new session' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
      session = await engine.startSession(participants)
      sessions.set(session.id, session)
    } else {
      const existingSession = sessions.get(sessionId)
      if (!existingSession) {
        return new Response(
          JSON.stringify({ error: 'Session not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        )
      }
      session = existingSession
    }

    if (!message || !senderId) {
      return new Response(
        JSON.stringify({ error: 'message and senderId required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send session ID first
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'session', sessionId: session.id })}\n\n`)
          )

          // Stream the response
          for await (const chunk of engine.streamChat(session, message, senderId)) {
            const data = JSON.stringify(chunk)
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }

          // Update session in storage
          sessions.set(session.id, session)

          // Send final session summary
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'session_update',
              session: engine.getSessionSummary(session)
            })}\n\n`)
          )

          controller.close()
        } catch (error) {
          console.error('[kintsugi-stream] Error:', error)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              error: error instanceof Error ? error.message : 'Unknown error'
            })}\n\n`)
          )
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error) {
    console.error('[kintsugi-stream] Error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
