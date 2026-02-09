/**
 * BSV Agent Inscription Library
 *
 * Inscribes AI agent outputs on BSV blockchain for immutable proof and provenance.
 * Uses @bsv/sdk to create OP_RETURN transactions with agent-generated content.
 */

import { PrivateKey, Transaction, P2PKH, Script } from '@bsv/sdk';
import { createClient } from '@supabase/supabase-js';

const WHATSONCHAIN_API = 'https://api.whatsonchain.com/v1/bsv/main';
const FETCH_TIMEOUT_MS = 30000;
const PROTOCOL_ID = 'b0ase-agent';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Content types supported for inscription
 */
export type InscriptionContentType = 'text/plain' | 'text/markdown' | 'application/json';

/**
 * Agent inscription input data
 */
export interface AgentInscriptionData {
  agentId: string;
  agentName: string;
  conversationId?: string;
  outputId?: string;
  content: string;
  contentType: InscriptionContentType;
  modelName?: string;
  taskName?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Result of agent inscription
 */
export interface AgentInscriptionResult {
  txid: string;
  inscriptionId: string;
  inscriptionUrl: string;
  contentHash: string;
  blockchainExplorerUrl: string;
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Fetch UTXOs for an address from WhatsOnChain
 */
async function fetchUtxos(address: string): Promise<any[]> {
  const url = `${WHATSONCHAIN_API}/address/${address}/unspent`;
  console.log(`[agent-inscription] Fetching UTXOs from: ${url}`);

  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch UTXOs: ${response.statusText}`);
  }

  const utxos = await response.json();
  console.log(`[agent-inscription] Found ${utxos.length} UTXOs`);
  return utxos;
}

/**
 * Broadcast transaction to BSV network
 */
async function broadcastTransaction(rawTx: string): Promise<string> {
  const url = `${WHATSONCHAIN_API}/tx/raw`;
  console.log(`[agent-inscription] Broadcasting transaction...`);

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ txhex: rawTx }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to broadcast transaction: ${response.statusText} - ${errorText}`);
  }

  const txid = await response.text();
  console.log(`[agent-inscription] Transaction broadcast successfully: ${txid}`);
  return txid.replace(/"/g, '');
}

/**
 * Calculate SHA-256 hash of content
 */
export async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Generate inscription document with metadata wrapper
 */
export function generateInscriptionDocument(data: AgentInscriptionData): string {
  const timestamp = new Date().toISOString();

  const document = {
    protocol: PROTOCOL_ID,
    version: '1.0',
    timestamp,
    agent: {
      id: data.agentId,
      name: data.agentName,
      model: data.modelName || 'unknown',
    },
    context: {
      conversationId: data.conversationId || null,
      outputId: data.outputId || null,
      taskName: data.taskName || null,
    },
    content: {
      type: data.contentType,
      data: data.content,
    },
    metadata: data.metadata || {},
    platform: {
      name: 'b0ase.com',
      url: process.env.NEXT_PUBLIC_BASE_URL || 'https://b0ase.com',
    },
  };

  return JSON.stringify(document, null, 2);
}

/**
 * Inscribe agent output on BSV blockchain
 *
 * Creates a transaction with OP_RETURN output containing the agent's output.
 * Returns the transaction ID for proof of inscription.
 */
export async function inscribeAgentOutput(
  data: AgentInscriptionData,
  privateKeyWif?: string
): Promise<AgentInscriptionResult> {
  try {
    // Generate inscription document
    const document = generateInscriptionDocument(data);

    // Calculate content hash
    const contentHash = await hashContent(document);

    console.log(`[agent-inscription] Content hash: ${contentHash}`);
    console.log(`[agent-inscription] Document size: ${document.length} bytes`);

    // Check document size (BSV allows large OP_RETURN but we should be reasonable)
    if (document.length > 100000) {
      throw new Error('Content too large for inscription (max 100KB)');
    }

    // Use platform private key if not provided
    const wif = privateKeyWif || process.env.BOASE_TREASURY_PRIVATE_KEY || process.env.MONEYBUTTON_BSV_ORDINALS_PRIVATE_KEY;
    if (!wif) {
      throw new Error('BOASE_TREASURY_PRIVATE_KEY not configured');
    }

    // Create private key
    const privateKey = PrivateKey.fromWif(wif);
    const publicKey = privateKey.toPublicKey();
    const address = publicKey.toAddress();

    console.log(`[agent-inscription] Inscribing from address: ${address}`);

    // Fetch UTXOs
    const utxos = await fetchUtxos(address);
    if (utxos.length === 0) {
      throw new Error('No UTXOs found for inscription. Please fund the address.');
    }

    // Create transaction
    const tx = new Transaction();

    // Add inputs (use first UTXO for simplicity)
    const utxo = utxos[0];
    tx.addInput({
      sourceTXID: utxo.tx_hash,
      sourceOutputIndex: utxo.tx_pos,
      unlockingScriptTemplate: new P2PKH().unlock(privateKey),
    });

    // Create OP_RETURN script with agent data
    // Format: OP_RETURN <protocol> <content-type> <data>
    const protocol = Buffer.from(PROTOCOL_ID, 'utf8');
    const contentType = Buffer.from('application/json', 'utf8');
    const contentData = Buffer.from(document, 'utf8');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const opReturnScript = new Script() as any;
    opReturnScript.writeOpCode(106); // OP_RETURN
    opReturnScript.writeData(protocol);
    opReturnScript.writeData(contentType);
    opReturnScript.writeData(contentData);

    // Add OP_RETURN output (0 satoshis)
    tx.addOutput({
      lockingScript: opReturnScript,
      satoshis: 0,
    });

    // Calculate fee based on transaction size (1 sat/byte is typical)
    const estimatedSize = document.length + 200; // content + overhead
    const minerFee = Math.max(500, Math.ceil(estimatedSize * 0.5)); // min 500 sats
    const inputSatoshis = utxo.value;
    const changeSatoshis = inputSatoshis - minerFee;

    if (changeSatoshis < 0) {
      throw new Error('Insufficient satoshis for miner fee');
    }

    // Add change output
    if (changeSatoshis > 0) {
      tx.addOutput({
        lockingScript: new P2PKH().lock(address),
        satoshis: changeSatoshis,
      });
    }

    // Sign transaction
    await tx.sign();

    // Broadcast transaction
    const rawTx = tx.toHex();
    const txid = await broadcastTransaction(rawTx);

    // Inscription ID is txid_0 (first output)
    const inscriptionId = `${txid}_0`;

    // Return result
    return {
      txid,
      inscriptionId,
      inscriptionUrl: `${WHATSONCHAIN_API}/tx/${txid}`,
      contentHash,
      blockchainExplorerUrl: `https://whatsonchain.com/tx/${txid}`,
    };
  } catch (error) {
    console.error('[agent-inscription] Error:', error);
    throw error;
  }
}

/**
 * Verify agent inscription on blockchain
 */
export async function verifyAgentInscription(txid: string): Promise<{
  found: boolean;
  document?: Record<string, unknown>;
  contentHash?: string;
}> {
  try {
    const url = `${WHATSONCHAIN_API}/tx/${txid}/hex`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      return { found: false };
    }

    const txHex = await response.text();
    const tx = Transaction.fromHex(txHex);

    // Look for OP_RETURN output with our protocol
    for (const output of tx.outputs) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const script = output.lockingScript as any;
      const chunks = script.chunks;

      // Check if OP_RETURN
      if (chunks.length > 0 && chunks[0].op === 106) {
        // Check protocol identifier
        if (chunks.length >= 4) {
          const protocolData = chunks[1].data;
          const protocol = protocolData ? Buffer.from(protocolData).toString('utf8') : '';
          if (protocol === PROTOCOL_ID) {
            const docData = chunks[3].data;
            const documentStr = docData ? Buffer.from(docData).toString('utf8') : '';
            if (documentStr) {
              const document = JSON.parse(documentStr);
              const contentHash = await hashContent(documentStr);
              return {
                found: true,
                document,
                contentHash,
              };
            }
          }
        }
      }
    }

    return { found: false };
  } catch (error) {
    console.error('[agent-inscription] Verify error:', error);
    return { found: false };
  }
}

/**
 * Save inscription record to database
 */
export async function saveInscriptionRecord(
  data: AgentInscriptionData,
  result: AgentInscriptionResult
): Promise<void> {
  const { error } = await supabase.from('agent_inscriptions').insert({
    agent_id: data.agentId,
    conversation_id: data.conversationId || null,
    output_id: data.outputId || null,
    inscription_id: result.inscriptionId,
    transaction_id: result.txid,
    content_hash: result.contentHash,
    inscription_url: result.blockchainExplorerUrl,
    inscription_type: data.contentType,
  });

  if (error) {
    console.error('[agent-inscription] Failed to save record:', error);
    throw new Error('Failed to save inscription record');
  }
}

/**
 * Get inscriptions for an agent
 */
export async function getAgentInscriptions(agentId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('agent_inscriptions')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[agent-inscription] Failed to fetch inscriptions:', error);
    return [];
  }

  return data || [];
}

/**
 * Check if output is already inscribed
 */
export async function isOutputInscribed(outputId: string): Promise<boolean> {
  const { data } = await supabase
    .from('agent_inscriptions')
    .select('id')
    .eq('output_id', outputId)
    .single();

  return !!data;
}

/**
 * Inscribe and save agent output in one operation
 */
export async function inscribeAndSaveAgentOutput(
  data: AgentInscriptionData
): Promise<AgentInscriptionResult> {
  // Check if already inscribed (by output_id if provided)
  if (data.outputId) {
    const alreadyInscribed = await isOutputInscribed(data.outputId);
    if (alreadyInscribed) {
      throw new Error('This output has already been inscribed');
    }
  }

  // Inscribe on blockchain
  const result = await inscribeAgentOutput(data);

  // Save to database
  await saveInscriptionRecord(data, result);

  return result;
}
