/**
 * BSV Contract Inscription Library
 *
 * Inscribes marketplace contracts on BSV blockchain for proof of existence.
 * Uses @bsv/sdk to create OP_RETURN transactions with contract data.
 */

import { PrivateKey, Transaction, P2PKH, Script } from '@bsv/sdk';

const WHATSONCHAIN_API = 'https://api.whatsonchain.com/v1/bsv/main';
const FETCH_TIMEOUT_MS = 30000;

/**
 * Contract data to be inscribed
 */
export interface ContractInscriptionData {
  contractId: string;
  clientUserId: string;
  developerUserId: string;
  clientName?: string;
  developerName: string;
  contractSlug: string;
  serviceTitle: string;
  serviceDescription: string;
  totalAmount: number;
  currency: string;
  paymentTerms: string;
  acceptanceCriteria: string;
  createdAt: string;
  platformUrl: string;
}

/**
 * Result of inscription
 */
export interface InscriptionResult {
  txid: string;
  inscriptionUrl: string;
  contractHash: string;
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
  console.log(`[bsv-inscription] Fetching UTXOs from: ${url}`);

  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch UTXOs: ${response.statusText}`);
  }

  const utxos = await response.json();
  console.log(`[bsv-inscription] Found ${utxos.length} UTXOs`);
  return utxos;
}

/**
 * Broadcast transaction to BSV network
 */
async function broadcastTransaction(rawTx: string): Promise<string> {
  const url = `${WHATSONCHAIN_API}/tx/raw`;
  console.log(`[bsv-inscription] Broadcasting transaction...`);

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
  console.log(`[bsv-inscription] Transaction broadcast successfully: ${txid}`);
  return txid.replace(/"/g, ''); // Remove quotes if present
}

/**
 * Generate markdown contract document
 */
export function generateContractMarkdown(data: ContractInscriptionData): string {
  const markdown = `# MARKETPLACE CONTRACT

**Contract ID:** ${data.contractId}
**Date:** ${data.createdAt}
**Platform:** ${data.platformUrl}

---

## PARTIES

**Client:**
- User ID: ${data.clientUserId}
${data.clientName ? `- Name: ${data.clientName}` : ''}

**Developer:**
- User ID: ${data.developerUserId}
- Name: ${data.developerName}

---

## SERVICE

**Title:** ${data.serviceTitle}

**Description:**
${data.serviceDescription}

**Contract Slug:** ${data.contractSlug}

---

## PAYMENT TERMS

**Total Amount:** ${data.currency}${data.totalAmount}

**Payment Structure:**
${data.paymentTerms}

**Platform Fee:** 5% (deducted from total)

---

## ACCEPTANCE CRITERIA

${data.acceptanceCriteria}

---

## TERMS

1. **Delivery:** The developer agrees to deliver the service as described above.
2. **Acceptance:** The client will review deliverables and approve or request revision.
3. **Payment:** Payment is held in escrow and released upon client approval.
4. **Accountability:** The developer is the legal counterparty and is fully accountable for delivery.
5. **Disputes:** Any disputes will be resolved according to platform terms of service.

---

## BLOCKCHAIN PROOF

This contract has been inscribed on the BSV blockchain for immutable proof of existence.

**Contract Hash:** [Generated on inscription]
**Inscription Date:** ${new Date().toISOString()}

---

*This is a binding agreement between the parties listed above.*
*Inscribed via b0ase.com marketplace platform.*
`;

  return markdown;
}

/**
 * Calculate SHA-256 hash of contract data
 */
export async function hashContract(markdown: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(markdown);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Inscribe contract on BSV blockchain
 *
 * Creates a transaction with OP_RETURN output containing the contract markdown.
 * Returns the transaction ID for proof of inscription.
 */
export async function inscribeContract(
  data: ContractInscriptionData,
  privateKeyWif?: string
): Promise<InscriptionResult> {
  try {
    // Generate contract markdown
    const markdown = generateContractMarkdown(data);

    // Calculate contract hash
    const contractHash = await hashContract(markdown);

    console.log(`[bsv-inscription] Contract hash: ${contractHash}`);
    console.log(`[bsv-inscription] Contract size: ${markdown.length} bytes`);

    // Use platform private key if not provided
    const wif = privateKeyWif || process.env.BOASE_TREASURY_PRIVATE_KEY || process.env.MONEYBUTTON_BSV_ORDINALS_PRIVATE_KEY;
    if (!wif) {
      throw new Error('BSV private key not found in environment variables');
    }

    // Create private key
    const privateKey = PrivateKey.fromWif(wif);
    const publicKey = privateKey.toPublicKey();
    const address = publicKey.toAddress();

    console.log(`[bsv-inscription] Inscribing from address: ${address}`);

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

    // Create OP_RETURN script with contract data
    // Format: OP_RETURN <protocol> <content-type> <data>
    const protocol = Buffer.from('b0ase-contract', 'utf8');
    const contentType = Buffer.from('text/markdown', 'utf8');
    const contractData = Buffer.from(markdown, 'utf8');

    const opReturnScript = new Script();
    opReturnScript.writeOpCode(106); // OP_RETURN
    opReturnScript.writeData(protocol);
    opReturnScript.writeData(contentType);
    opReturnScript.writeData(contractData);

    // Add OP_RETURN output (0 satoshis)
    tx.addOutput({
      lockingScript: opReturnScript,
      satoshis: 0,
    });

    // Calculate change
    const minerFee = 500; // 500 satoshis
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

    // Return result
    return {
      txid,
      inscriptionUrl: `${WHATSONCHAIN_API}/tx/${txid}`,
      contractHash,
      blockchainExplorerUrl: `https://whatsonchain.com/tx/${txid}`,
    };
  } catch (error) {
    console.error('[bsv-inscription] Error:', error);
    throw error;
  }
}

/**
 * Verify contract inscription on blockchain
 *
 * Fetches the transaction and extracts the inscribed contract data.
 */
export async function verifyInscription(txid: string): Promise<{
  found: boolean;
  contractMarkdown?: string;
  contractHash?: string;
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
      const script = output.lockingScript;
      const chunks = script.chunks;

      // Check if OP_RETURN
      if (chunks.length > 0 && chunks[0].op === 106) {
        // Check protocol identifier
        if (chunks.length >= 4) {
          const protocol = chunks[1].data?.toString('utf8');
          if (protocol === 'b0ase-contract') {
            const contractMarkdown = chunks[3].data?.toString('utf8');
            if (contractMarkdown) {
              const contractHash = await hashContract(contractMarkdown);
              return {
                found: true,
                contractMarkdown,
                contractHash,
              };
            }
          }
        }
      }
    }

    return { found: false };
  } catch (error) {
    console.error('[bsv-inscription] Verify error:', error);
    return { found: false };
  }
}

/**
 * Pipeline Contract Inscription Data
 * Extended data structure for signed pipeline contracts
 */
export interface PipelineContractInscriptionData {
  contractId: string;
  templateId: string;
  templateVersion: string;
  phase: string;

  // Parties
  client: {
    name: string;
    email: string;
    wallet?: string;
    companyName?: string;
    companyNumber?: string;
  };
  contractor: {
    name: string;
    email: string;
    wallet?: string;
    linkedIn?: string;
  };

  // Contract details
  title: string;
  contentHash: string;

  // Payment
  paymentAmount: number;
  paymentCurrency: string;
  paymentSchedule: string;

  // Signatures
  signatures: {
    partyType: 'client' | 'contractor';
    partyName: string;
    signedAt: string;
    signatureHash: string;
    signatureMethod: string;
    walletType?: string;
  }[];

  // Metadata
  createdAt: string;
  source: {
    type: string;
    sourceId?: string;
    sourceName?: string;
  };
}

/**
 * Generate markdown for pipeline contract inscription
 */
export function generatePipelineContractMarkdown(data: PipelineContractInscriptionData): string {
  const signaturesSection = data.signatures.map(sig => `
**${sig.partyType === 'client' ? 'Client' : 'Contractor'} Signature:**
- Name: ${sig.partyName}
- Signed At: ${sig.signedAt}
- Method: ${sig.signatureMethod}${sig.walletType ? ` (${sig.walletType})` : ''}
- Signature Hash: ${sig.signatureHash}
`).join('\n');

  const markdown = `# b0ase PIPELINE CONTRACT

**Protocol:** b0ase-pipeline-v1
**Contract ID:** ${data.contractId}
**Inscription Date:** ${new Date().toISOString()}

---

## CONTRACT DETAILS

**Title:** ${data.title}
**Template:** ${data.templateId} (v${data.templateVersion})
**Phase:** ${data.phase}
**Created:** ${data.createdAt}

---

## PARTIES

**Client:**
- Name: ${data.client.name}
- Email: ${data.client.email}
${data.client.wallet ? `- Wallet: ${data.client.wallet}` : ''}
${data.client.companyName ? `- Company: ${data.client.companyName}` : ''}
${data.client.companyNumber ? `- Companies House: ${data.client.companyNumber}` : ''}

**Contractor:**
- Name: ${data.contractor.name}
- Email: ${data.contractor.email}
${data.contractor.wallet ? `- Wallet: ${data.contractor.wallet}` : ''}
${data.contractor.linkedIn ? `- LinkedIn: ${data.contractor.linkedIn}` : ''}

---

## PAYMENT TERMS

**Amount:** ${data.paymentCurrency === 'GBP' ? '£' : ''}${data.paymentAmount} ${data.paymentCurrency}
**Schedule:** ${data.paymentSchedule}

---

## SIGNATURES

${signaturesSection}

---

## VERIFICATION

**Content Hash (SHA-256):** ${data.contentHash}

This hash can be used to verify that the full contract content matches what was agreed upon by both parties.

---

## SOURCE

**Origin:** ${data.source.type}
${data.source.sourceId ? `**Source ID:** ${data.source.sourceId}` : ''}
${data.source.sourceName ? `**Source Name:** ${data.source.sourceName}` : ''}

---

## LEGAL NOTICE

This contract has been digitally signed by both parties and inscribed on the BSV blockchain as a 1Sat Ordinal. This creates an immutable, timestamped proof of:

1. The contract terms agreed upon
2. The identities of the signing parties
3. The exact time of signing
4. The cryptographic signatures of each party

This inscription serves as legal evidence of the agreement between the parties.

---

*Inscribed via b0ase Pipeline System*
*Platform: https://b0ase.com*
`;

  return markdown;
}

/**
 * Inscribe a signed pipeline contract on BSV blockchain
 *
 * Creates a 1Sat Ordinal inscription with full contract details and signatures.
 */
export async function inscribePipelineContract(
  data: PipelineContractInscriptionData,
  privateKeyWif?: string
): Promise<InscriptionResult> {
  try {
    // Generate pipeline contract markdown
    const markdown = generatePipelineContractMarkdown(data);

    // Calculate hash of the inscription
    const inscriptionHash = await hashContract(markdown);

    console.log(`[bsv-inscription] Pipeline contract hash: ${inscriptionHash}`);
    console.log(`[bsv-inscription] Pipeline contract size: ${markdown.length} bytes`);
    console.log(`[bsv-inscription] Signatures: ${data.signatures.length}`);

    // Use platform private key if not provided
    const wif = privateKeyWif || process.env.BOASE_TREASURY_PRIVATE_KEY || process.env.MONEYBUTTON_BSV_ORDINALS_PRIVATE_KEY;
    if (!wif) {
      throw new Error('BSV private key not found in environment variables');
    }

    // Create private key
    const privateKey = PrivateKey.fromWif(wif);
    const publicKey = privateKey.toPublicKey();
    const address = publicKey.toAddress();

    console.log(`[bsv-inscription] Inscribing pipeline contract from address: ${address}`);

    // Fetch UTXOs
    const utxos = await fetchUtxos(address);
    if (utxos.length === 0) {
      throw new Error('No UTXOs found for inscription. Please fund the address.');
    }

    // Create transaction
    const tx = new Transaction();

    // Add inputs (use first UTXO)
    const utxo = utxos[0];
    tx.addInput({
      sourceTXID: utxo.tx_hash,
      sourceOutputIndex: utxo.tx_pos,
      unlockingScriptTemplate: new P2PKH().unlock(privateKey),
    });

    // Create 1Sat Ordinal inscription
    // Format: OP_RETURN <protocol> <content-type> <ordinal-envelope> <data>
    const protocol = Buffer.from('b0ase-pipeline', 'utf8');
    const contentType = Buffer.from('text/markdown;charset=utf-8', 'utf8');
    const ordinalEnvelope = Buffer.from(`ord:${data.contractId}`, 'utf8');
    const contractData = Buffer.from(markdown, 'utf8');

    const opReturnScript = new Script();
    opReturnScript.writeOpCode(106); // OP_RETURN
    opReturnScript.writeData(protocol);
    opReturnScript.writeData(contentType);
    opReturnScript.writeData(ordinalEnvelope);
    opReturnScript.writeData(contractData);

    // Add OP_RETURN output (0 satoshis for data, but 1 sat for ordinal)
    tx.addOutput({
      lockingScript: opReturnScript,
      satoshis: 1, // 1Sat Ordinal
    });

    // Calculate change
    const minerFee = 500;
    const ordinalFee = 1;
    const inputSatoshis = utxo.value;
    const changeSatoshis = inputSatoshis - minerFee - ordinalFee;

    if (changeSatoshis < 0) {
      throw new Error('Insufficient satoshis for inscription');
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

    console.log(`[bsv-inscription] Pipeline contract inscribed: ${txid}`);

    // Return result
    return {
      txid,
      inscriptionUrl: `${WHATSONCHAIN_API}/tx/${txid}`,
      contractHash: data.contentHash,
      blockchainExplorerUrl: `https://whatsonchain.com/tx/${txid}`,
    };
  } catch (error) {
    console.error('[bsv-inscription] Pipeline inscription error:', error);
    throw error;
  }
}

/**
 * Convert a PipelineContract object to inscription data
 */
export function pipelineContractToInscriptionData(
  contract: {
    id: string;
    templateId: string;
    templateVersion: string;
    phase: string;
    client: {
      name: string;
      email: string;
      wallet?: string;
      companyName?: string;
      companyNumber?: string;
    };
    contractor: {
      name: string;
      email: string;
      wallet?: string;
      linkedIn?: string;
    };
    title: string;
    contentHash: string;
    paymentTerms: {
      totalAmount: number;
      currency: string;
      paymentSchedule: string;
    };
    signatures: {
      partyType: 'client' | 'contractor';
      partyName: string;
      signedAt?: Date;
      signatureHash?: string;
      signatureMethod: string;
      walletType?: string;
    }[];
    createdAt: Date;
    source: {
      type: string;
      sourceId?: string;
      sourceName?: string;
    };
  }
): PipelineContractInscriptionData {
  return {
    contractId: contract.id,
    templateId: contract.templateId,
    templateVersion: contract.templateVersion,
    phase: contract.phase,
    client: contract.client,
    contractor: contract.contractor,
    title: contract.title,
    contentHash: contract.contentHash,
    paymentAmount: contract.paymentTerms.totalAmount,
    paymentCurrency: contract.paymentTerms.currency,
    paymentSchedule: contract.paymentTerms.paymentSchedule,
    signatures: contract.signatures.map(sig => ({
      partyType: sig.partyType,
      partyName: sig.partyName,
      signedAt: sig.signedAt?.toISOString() || new Date().toISOString(),
      signatureHash: sig.signatureHash || '',
      signatureMethod: sig.signatureMethod,
      walletType: sig.walletType,
    })),
    createdAt: contract.createdAt.toISOString(),
    source: contract.source,
  };
}
