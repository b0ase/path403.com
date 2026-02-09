/**
 * Kintsugi Engine API
 *
 * POST /api/kintsugi/engine - Send message to Kintsugi
 * GET /api/kintsugi/engine - Get session info
 */

import { NextRequest, NextResponse } from 'next/server'
import { createKintsugiEngine, KintsugiSession, PartyRole } from '@/lib/kintsugi'

// In-memory session storage (TODO: move to Redis/database for production)
const sessions = new Map<string, KintsugiSession>()

// Create engine instance
const engine = createKintsugiEngine({
  mode: 'agent'
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, sessionId, message, senderId, participants } = body

    switch (action) {
      case 'start': {
        // Start a new session
        if (!participants || !Array.isArray(participants)) {
          return NextResponse.json(
            { error: 'participants array required' },
            { status: 400 }
          )
        }

        const session = await engine.startSession(participants)
        sessions.set(session.id, session)

        return NextResponse.json({
          success: true,
          session: engine.getSessionSummary(session),
          provider: engine.getProviderInfo()
        })
      }

      case 'chat': {
        // Send a message
        if (!sessionId || !message || !senderId) {
          return NextResponse.json(
            { error: 'sessionId, message, and senderId required' },
            { status: 400 }
          )
        }

        const session = sessions.get(sessionId)
        if (!session) {
          return NextResponse.json(
            { error: 'Session not found' },
            { status: 404 }
          )
        }

        const result = await engine.chat(session, message, senderId)
        sessions.set(sessionId, result.session)

        return NextResponse.json({
          success: true,
          response: result.response,
          reasoning: result.reasoning,
          toolsUsed: result.toolsUsed,
          session: engine.getSessionSummary(result.session)
        })
      }

      case 'status': {
        // Update session status
        if (!sessionId) {
          return NextResponse.json(
            { error: 'sessionId required' },
            { status: 400 }
          )
        }

        const session = sessions.get(sessionId)
        if (!session) {
          return NextResponse.json(
            { error: 'Session not found' },
            { status: 404 }
          )
        }

        const { newStatus, reason } = body
        const updatedSession = await engine.updateStatus(session, newStatus, reason)
        sessions.set(sessionId, updatedSession)

        return NextResponse.json({
          success: true,
          session: engine.getSessionSummary(updatedSession)
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: start, chat, or status' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('[kintsugi-engine] Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')

  if (sessionId) {
    const session = sessions.get(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      session: engine.getSessionSummary(session),
      provider: engine.getProviderInfo()
    })
  }

  // List all sessions
  const sessionList = Array.from(sessions.values()).map(s =>
    engine.getSessionSummary(s)
  )

  return NextResponse.json({
    sessions: sessionList,
    count: sessionList.length,
    provider: engine.getProviderInfo()
  })
}
