/**
 * Batch Committer
 *
 * The COMMIT layer of: capture → normalise → commit → prove → settle
 *
 * Batches multiple events into a single BSV inscription using a Merkle tree.
 * One UTXO can commit 1000+ events efficiently.
 */

import { getPrisma } from '@/lib/prisma'

// Get prisma instance - lazy loaded
const prisma = () => getPrisma()
import { createHash } from 'crypto'
import { getPendingEvents, markEventsBatched, markEventsCommitted, type CapturedEvent } from './event-capture'

// BSV transaction building
import { PrivateKey, Transaction, Script, P2PKH } from '@bsv/sdk'

const WHATSONCHAIN_API = 'https://api.whatsonchain.com/v1/bsv/main'

export interface MerkleNode {
  hash: string
  left?: MerkleNode
  right?: MerkleNode
  eventId?: string  // Leaf nodes have event ID
}

export interface CommitBatch {
  id: string
  eventCount: number
  merkleRoot: string
  merkleTree: MerkleNode
  eventIds: string[]
  status: 'pending' | 'building' | 'signed' | 'broadcast' | 'confirmed' | 'failed'
  txid?: string
  error?: string
}

/**
 * Create a batch from pending events
 */
export async function createBatch(maxEvents: number = 1000): Promise<CommitBatch | null> {
  // Get pending events
  const events = await getPendingEvents(maxEvents)

  if (events.length === 0) {
    return null
  }

  // Build merkle tree from content hashes
  const leaves = events.map(e => ({
    hash: e.contentHash!,
    eventId: e.id
  }))

  const merkleTree = buildMerkleTree(leaves)
  const merkleRoot = merkleTree.hash

  // Create batch record
  const batch = await prisma().commit_batches.create({
    data: {
      event_count: events.length,
      merkle_root: merkleRoot,
      merkle_tree: merkleTree as any,
      status: 'pending'
    }
  })

  // Mark events as batched
  const eventIds = events.map(e => e.id)
  await markEventsBatched(eventIds, batch.id)

  return {
    id: batch.id,
    eventCount: events.length,
    merkleRoot,
    merkleTree,
    eventIds,
    status: 'pending'
  }
}

/**
 * Commit a batch to BSV
 */
export async function commitBatch(batchId: string): Promise<CommitBatch> {
  const batch = await prisma().commit_batches.findUnique({
    where: { id: batchId }
  })

  if (!batch) {
    throw new Error(`Batch not found: ${batchId}`)
  }

  // Update status
  await prisma().commit_batches.update({
    where: { id: batchId },
    data: { status: 'building' }
  })

  try {
    // Build and broadcast transaction
    const txid = await inscribeBatch(
      batch.merkle_root,
      batch.event_count,
      batchId
    )

    // Update batch with txid
    await prisma().commit_batches.update({
      where: { id: batchId },
      data: {
        txid,
        status: 'broadcast',
        broadcast_at: new Date()
      }
    })

    // Mark all events as committed
    await markEventsCommitted(batchId, txid)

    // Create anchor mappings for each event
    await createAnchorMappings(batchId, txid)

    return {
      id: batchId,
      eventCount: batch.event_count,
      merkleRoot: batch.merkle_root,
      merkleTree: batch.merkle_tree as unknown as MerkleNode,
      eventIds: [],  // Would need to fetch
      status: 'broadcast',
      txid
    }
  } catch (error) {
    await prisma().commit_batches.update({
      where: { id: batchId },
      data: {
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      }
    })

    throw error
  }
}

/**
 * Create and commit a batch in one step
 */
export async function captureAndCommit(maxEvents: number = 1000): Promise<CommitBatch | null> {
  const batch = await createBatch(maxEvents)
  if (!batch) return null

  return commitBatch(batch.id)
}

/**
 * Get merkle proof for an event
 */
export async function getMerkleProof(eventId: string): Promise<{
  eventHash: string
  proof: string[]
  root: string
  txid: string
} | null> {
  const event = await prisma().captured_events.findUnique({
    where: { id: eventId }
  })

  if (!event || !event.batch_id || !event.content_hash) {
    return null
  }

  const batch = await prisma().commit_batches.findUnique({
    where: { id: event.batch_id }
  })

  if (!batch || !batch.txid) {
    return null
  }

  // Build proof path from merkle tree
  const tree = batch.merkle_tree as unknown as MerkleNode
  const proof = findProofPath(tree, event.content_hash)

  return {
    eventHash: event.content_hash,
    proof,
    root: batch.merkle_root,
    txid: batch.txid
  }
}

// ============================================
// Merkle Tree Functions
// ============================================

function buildMerkleTree(leaves: { hash: string; eventId?: string }[]): MerkleNode {
  if (leaves.length === 0) {
    throw new Error('Cannot build tree from empty leaves')
  }

  if (leaves.length === 1) {
    return {
      hash: leaves[0].hash,
      eventId: leaves[0].eventId
    }
  }

  // Ensure even number of leaves
  if (leaves.length % 2 === 1) {
    leaves.push(leaves[leaves.length - 1])  // Duplicate last
  }

  // Build parent level
  const parents: MerkleNode[] = []
  for (let i = 0; i < leaves.length; i += 2) {
    const left: MerkleNode = { hash: leaves[i].hash, eventId: leaves[i].eventId }
    const right: MerkleNode = { hash: leaves[i + 1].hash, eventId: leaves[i + 1].eventId }

    const combined = hashPair(left.hash, right.hash)
    parents.push({
      hash: combined,
      left,
      right
    })
  }

  // Recursively build tree
  return buildMerkleTree(parents.map(p => ({ hash: p.hash })))
    ? { ...buildMerkleTree(parents), left: parents[0]?.left, right: parents[0]?.right }
    : parents[0]
}

function hashPair(left: string, right: string): string {
  const combined = left < right ? left + right : right + left
  return createHash('sha256').update(combined).digest('hex')
}

function findProofPath(node: MerkleNode, targetHash: string, path: string[] = []): string[] {
  if (!node) return []

  // Found the leaf
  if (node.hash === targetHash && !node.left && !node.right) {
    return path
  }

  // Search left subtree
  if (node.left) {
    const leftPath = findProofPath(node.left, targetHash, [...path, node.right?.hash || ''])
    if (leftPath.length > 0) return leftPath
  }

  // Search right subtree
  if (node.right) {
    const rightPath = findProofPath(node.right, targetHash, [...path, node.left?.hash || ''])
    if (rightPath.length > 0) return rightPath
  }

  return []
}

// ============================================
// BSV Transaction Functions
// ============================================

async function inscribeBatch(
  merkleRoot: string,
  eventCount: number,
  batchId: string
): Promise<string> {
  const privateKeyWif = process.env.BOASE_TREASURY_PRIVATE_KEY || process.env.MONEYBUTTON_BSV_ORDINALS_PRIVATE_KEY
  const address = process.env.BOASE_TREASURY_ORD_ADDRESS || process.env.MONEYBUTTON_BSV_ORDINALS_ADDRESS

  if (!privateKeyWif || !address) {
    throw new Error('BSV wallet not configured')
  }

  // Fetch UTXOs
  const utxos = await fetchUtxos(address)
  if (utxos.length === 0) {
    throw new Error('No UTXOs available')
  }

  const privateKey = PrivateKey.fromWif(privateKeyWif)

  // Build inscription data
  const inscriptionData = JSON.stringify({
    protocol: 'b0ase-batch-v1',
    type: 'merkle_commit',
    merkle_root: merkleRoot,
    event_count: eventCount,
    batch_id: batchId,
    timestamp: new Date().toISOString()
  })

  // Build OP_RETURN script
  const opReturnScript = new Script()
  opReturnScript.writeOpCode(106)  // OP_RETURN
  opReturnScript.writeData(Buffer.from('b0ase-batch', 'utf8'))
  opReturnScript.writeData(Buffer.from(merkleRoot, 'hex'))
  opReturnScript.writeData(Buffer.from(inscriptionData, 'utf8'))

  // Build transaction
  const tx = new Transaction()

  // Add input
  const utxo = utxos[0]
  tx.addInput({
    sourceTXID: utxo.tx_hash,
    sourceOutputIndex: utxo.tx_pos,
    unlockingScriptTemplate: new P2PKH().unlock(privateKey),
    sequence: 0xffffffff
  })

  // Add OP_RETURN output
  tx.addOutput({
    lockingScript: opReturnScript,
    satoshis: 0
  })

  // Add change output
  const fee = 500  // Generous fee
  const changeAmount = utxo.value - fee
  if (changeAmount > 546) {
    tx.addOutput({
      lockingScript: new P2PKH().lock(privateKey.toAddress()),
      satoshis: changeAmount
    })
  }

  // Sign and broadcast
  await tx.sign()
  const rawTx = tx.toHex()
  const txid = await broadcastTx(rawTx)

  // Track UTXO as spent
  await trackUtxoSpent(utxo.tx_hash, utxo.tx_pos, txid)

  return txid
}

async function fetchUtxos(address: string): Promise<any[]> {
  const response = await fetch(`${WHATSONCHAIN_API}/address/${address}/unspent`)
  if (!response.ok) {
    throw new Error(`Failed to fetch UTXOs: ${response.statusText}`)
  }
  return response.json()
}

async function broadcastTx(rawTx: string): Promise<string> {
  const response = await fetch(`${WHATSONCHAIN_API}/tx/raw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ txhex: rawTx })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Broadcast failed: ${error}`)
  }

  return response.text()  // Returns txid
}

async function trackUtxoSpent(txid: string, vout: number, spentInTxid: string): Promise<void> {
  // Update UTXO pool if we're tracking it
  await prisma().utxo_pool.updateMany({
    where: { txid, vout },
    data: {
      status: 'spent',
      spent_at: new Date(),
      spent_in_txid: spentInTxid
    }
  }).catch(() => {
    // Ignore if not in pool
  })
}

// ============================================
// Anchor Mapping
// ============================================

async function createAnchorMappings(batchId: string, txid: string): Promise<void> {
  // Get all events in this batch
  const events = await prisma().captured_events.findMany({
    where: { batch_id: batchId }
  })

  // Create anchor mapping for each
  for (const event of events) {
    await prisma().anchor_mappings.upsert({
      where: {
        source_external_id: {
          source: event.source,
          external_id: event.source_id
        }
      },
      create: {
        source: event.source,
        external_id: event.source_id,
        external_type: event.event_type,
        bsv_txid: txid,
        batch_id: batchId,
        content_hash: event.content_hash
      },
      update: {
        bsv_txid: txid,
        batch_id: batchId
      }
    })
  }
}

// ============================================
// Background Processing
// ============================================

/**
 * Process pending batches - call this from a cron job
 */
export async function processPendingBatches(): Promise<{
  batchesCreated: number
  batchesCommitted: number
  errors: string[]
}> {
  const errors: string[] = []
  let batchesCreated = 0
  let batchesCommitted = 0

  // Commit any pending batches first
  const pendingBatches = await prisma().commit_batches.findMany({
    where: { status: 'pending' }
  })

  for (const batch of pendingBatches) {
    try {
      await commitBatch(batch.id)
      batchesCommitted++
    } catch (error) {
      errors.push(`Batch ${batch.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Create new batch if we have pending events
  const pendingEvents = await getPendingEvents(1)
  if (pendingEvents.length > 0) {
    try {
      const batch = await createBatch(1000)
      if (batch) {
        batchesCreated++
        await commitBatch(batch.id)
        batchesCommitted++
      }
    } catch (error) {
      errors.push(`New batch: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return { batchesCreated, batchesCommitted, errors }
}
