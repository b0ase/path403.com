/**
 * GET /api/m2m/prove/:source/:externalId
 *
 * Look up BSV anchor for an external event.
 * Returns proof that can be independently verified.
 */

import { NextRequest, NextResponse } from 'next/server'
import { lookupAnchor, verifyAnchor, formatProofResponse } from '@/lib/m2m'

interface RouteParams {
  params: Promise<{
    source: string
    externalId: string
  }>
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { source, externalId } = await context.params

    // Check if verification requested
    const verify = request.nextUrl.searchParams.get('verify') === 'true'

    if (verify) {
      // Verify on chain
      const result = await verifyAnchor(source, externalId)

      if (!result.valid) {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
            proof: result.proof ? formatProofResponse(result.proof) : null
          },
          { status: result.proof ? 200 : 404 }
        )
      }

      return NextResponse.json({
        success: true,
        verified: true,
        proof: formatProofResponse(result.proof!),
        explorer_url: result.explorerUrl
      })
    }

    // Just lookup
    const anchor = await lookupAnchor(source, externalId)

    if (!anchor) {
      return NextResponse.json(
        { success: false, error: 'No anchor found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      proof: formatProofResponse(anchor)
    })
  } catch (error) {
    console.error('Proof lookup error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to lookup proof' },
      { status: 500 }
    )
  }
}
