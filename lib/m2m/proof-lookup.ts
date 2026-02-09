/**
 * Proof Lookup Service
 *
 * The PROVE layer of: capture → normalise → commit → prove → settle
 *
 * Looks up BSV anchors for external events and verifies proofs.
 */

import { getPrisma } from '@/lib/prisma'

// Get prisma instance - lazy loaded
const prisma = () => getPrisma()
import { createHash } from 'crypto'
import { getMerkleProof } from './batch-committer'

export interface AnchorProof {
  // External reference
  source: string
  externalId: string
  externalType?: string

  // BSV anchor
  bsvTxid: string
  bsvVout: number

  // Merkle proof (if batched)
  merkleRoot?: string
  merkleProof?: string[]
  contentHash?: string

  // Verification
  verified: boolean
  verifiedAt?: Date

  // Timestamps
  eventTimestamp?: Date
  anchoredAt: Date
}

export interface VerificationResult {
  valid: boolean
  proof?: AnchorProof
  error?: string
  explorerUrl?: string
}

/**
 * Look up anchor for an external event
 */
export async function lookupAnchor(
  source: string,
  externalId: string
): Promise<AnchorProof | null> {
  // Check anchor mappings
  const anchor = await prisma().anchor_mappings.findUnique({
    where: {
      source_external_id: { source, external_id: externalId }
    }
  })

  if (!anchor) {
    return null
  }

  // Get merkle proof if batched
  let merkleProof: string[] | undefined
  let merkleRoot: string | undefined

  if (anchor.batch_id) {
    const event = await prisma().captured_events.findFirst({
      where: {
        source,
        source_id: externalId
      }
    })

    if (event) {
      const proofData = await getMerkleProof(event.id)
      if (proofData) {
        merkleProof = proofData.proof
        merkleRoot = proofData.root
      }
    }
  }

  return {
    source: anchor.source,
    externalId: anchor.external_id,
    externalType: anchor.external_type || undefined,
    bsvTxid: anchor.bsv_txid,
    bsvVout: anchor.bsv_vout || 0,
    merkleRoot,
    merkleProof,
    contentHash: anchor.content_hash || undefined,
    verified: anchor.verified,
    verifiedAt: anchor.verified_at || undefined,
    anchoredAt: anchor.created_at
  }
}

/**
 * Verify an anchor exists on BSV
 */
export async function verifyAnchor(
  source: string,
  externalId: string
): Promise<VerificationResult> {
  // Look up anchor
  const anchor = await lookupAnchor(source, externalId)

  if (!anchor) {
    return {
      valid: false,
      error: 'No anchor found for this event'
    }
  }

  // Verify transaction exists on chain
  const txExists = await verifyTxOnChain(anchor.bsvTxid)

  if (!txExists) {
    return {
      valid: false,
      proof: anchor,
      error: 'Transaction not found on blockchain'
    }
  }

  // Mark as verified if not already
  if (!anchor.verified) {
    await prisma().anchor_mappings.update({
      where: {
        source_external_id: { source, external_id: externalId }
      },
      data: {
        verified: true,
        verified_at: new Date()
      }
    })
    anchor.verified = true
    anchor.verifiedAt = new Date()
  }

  return {
    valid: true,
    proof: anchor,
    explorerUrl: `https://whatsonchain.com/tx/${anchor.bsvTxid}`
  }
}

/**
 * Verify merkle proof
 */
export function verifyMerkleProof(
  contentHash: string,
  proof: string[],
  root: string
): boolean {
  let current = contentHash

  for (const sibling of proof) {
    // Combine in consistent order
    const combined = current < sibling
      ? current + sibling
      : sibling + current

    current = createHash('sha256').update(combined).digest('hex')
  }

  return current === root
}

/**
 * Get all anchors for a source
 */
export async function getAnchorsForSource(
  source: string,
  limit: number = 100
): Promise<AnchorProof[]> {
  const anchors = await prisma().anchor_mappings.findMany({
    where: { source },
    orderBy: { created_at: 'desc' },
    take: limit
  })

  return anchors.map(a => ({
    source: a.source,
    externalId: a.external_id,
    externalType: a.external_type || undefined,
    bsvTxid: a.bsv_txid,
    bsvVout: a.bsv_vout || 0,
    contentHash: a.content_hash || undefined,
    verified: a.verified,
    verifiedAt: a.verified_at || undefined,
    anchoredAt: a.created_at
  }))
}

/**
 * Get anchor stats
 */
export async function getAnchorStats(): Promise<{
  total: number
  verified: number
  bySource: Record<string, number>
  last24h: number
}> {
  const [total, verified, bySource, last24h] = await Promise.all([
    prisma.anchor_mappings.count(),

    prisma.anchor_mappings.count({
      where: { verified: true }
    }),

    prisma.anchor_mappings.groupBy({
      by: ['source'],
      _count: { id: true }
    }),

    prisma.anchor_mappings.count({
      where: {
        created_at: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })
  ])

  const sourceMap: Record<string, number> = {}
  for (const s of bySource) {
    sourceMap[s.source] = s._count.id
  }

  return {
    total,
    verified,
    bySource: sourceMap,
    last24h
  }
}

// ============================================
// Chain Verification
// ============================================

const WHATSONCHAIN_API = 'https://api.whatsonchain.com/v1/bsv/main'

async function verifyTxOnChain(txid: string): Promise<boolean> {
  try {
    const response = await fetch(`${WHATSONCHAIN_API}/tx/${txid}`)
    return response.ok
  } catch {
    return false
  }
}

/**
 * Get transaction details from chain
 */
export async function getTxDetails(txid: string): Promise<{
  confirmations: number
  blockHeight?: number
  timestamp?: Date
  outputs: { value: number; script: string }[]
} | null> {
  try {
    const response = await fetch(`${WHATSONCHAIN_API}/tx/${txid}`)
    if (!response.ok) return null

    const tx = await response.json()

    return {
      confirmations: tx.confirmations || 0,
      blockHeight: tx.blockheight,
      timestamp: tx.time ? new Date(tx.time * 1000) : undefined,
      outputs: tx.vout?.map((o: any) => ({
        value: o.value,
        script: o.scriptPubKey?.hex
      })) || []
    }
  } catch {
    return null
  }
}

/**
 * Extract OP_RETURN data from transaction
 */
export async function getOpReturnData(txid: string): Promise<string | null> {
  const details = await getTxDetails(txid)
  if (!details) return null

  for (const output of details.outputs) {
    // OP_RETURN outputs have value 0 and start with 6a (OP_RETURN)
    if (output.value === 0 && output.script.startsWith('6a')) {
      // Parse OP_RETURN data
      const hex = output.script.slice(2)  // Remove 6a
      try {
        // Simple parsing - in reality would need proper script parsing
        return Buffer.from(hex, 'hex').toString('utf8')
      } catch {
        return hex
      }
    }
  }

  return null
}

// ============================================
// Public API Responses
// ============================================

/**
 * Format proof for public API response
 */
export function formatProofResponse(proof: AnchorProof): {
  event: { source: string; id: string; type?: string }
  anchor: { txid: string; verified: boolean; explorer_url: string }
  merkle?: { root: string; proof: string[]; content_hash: string }
  timestamps: { anchored_at: string; verified_at?: string }
} {
  return {
    event: {
      source: proof.source,
      id: proof.externalId,
      type: proof.externalType
    },
    anchor: {
      txid: proof.bsvTxid,
      verified: proof.verified,
      explorer_url: `https://whatsonchain.com/tx/${proof.bsvTxid}`
    },
    merkle: proof.merkleRoot ? {
      root: proof.merkleRoot,
      proof: proof.merkleProof || [],
      content_hash: proof.contentHash || ''
    } : undefined,
    timestamps: {
      anchored_at: proof.anchoredAt.toISOString(),
      verified_at: proof.verifiedAt?.toISOString()
    }
  }
}
