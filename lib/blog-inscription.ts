/**
 * BSV Blog Inscription Library
 *
 * Inscribes blog posts on BSV blockchain for immutable proof of publication.
 * Uses @bsv/sdk to create OP_RETURN transactions with blog content.
 */

import { PrivateKey, Transaction, P2PKH, Script } from '@bsv/sdk';

const WHATSONCHAIN_API = 'https://api.whatsonchain.com/v1/bsv/main';
const FETCH_TIMEOUT_MS = 30000;
const PROTOCOL_ID = 'b0ase-blog';

/**
 * Blog post data to be inscribed
 */
export interface BlogInscriptionData {
  slug: string;
  title: string;
  author: string;
  date: string;
  excerpt?: string;
  tags?: string[];
  content: string;
  contentHash?: string;
}

/**
 * Result of blog inscription
 */
export interface BlogInscriptionResult {
  txid: string;
  inscriptionId: string;
  inscriptionUrl: string;
  contentHash: string;
  blockchainExplorerUrl: string;
  ordinalUrl: string;
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
  console.log(`[blog-inscription] Fetching UTXOs from: ${url}`);

  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch UTXOs: ${response.statusText}`);
  }

  const utxos = await response.json();
  console.log(`[blog-inscription] Found ${utxos.length} UTXOs`);
  return utxos;
}

/**
 * Broadcast transaction to BSV network
 */
async function broadcastTransaction(rawTx: string): Promise<string> {
  const url = `${WHATSONCHAIN_API}/tx/raw`;
  console.log(`[blog-inscription] Broadcasting transaction...`);

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
  console.log(`[blog-inscription] Transaction broadcast successfully: ${txid}`);
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
export function generateBlogInscriptionDocument(data: BlogInscriptionData): string {
  const timestamp = new Date().toISOString();

  const document = {
    protocol: PROTOCOL_ID,
    version: '1.0',
    timestamp,
    blog: {
      slug: data.slug,
      title: data.title,
      author: data.author,
      date: data.date,
      excerpt: data.excerpt || null,
      tags: data.tags || [],
    },
    content: {
      type: 'text/markdown',
      data: data.content,
    },
    platform: {
      name: 'b0ase.com',
      url: 'https://b0ase.com',
      blogUrl: `https://b0ase.com/blog/${data.slug}`,
    },
  };

  return JSON.stringify(document);
}

/**
 * Inscribe blog post on BSV blockchain
 *
 * Creates a transaction with OP_RETURN output containing the blog post.
 * Returns the transaction ID for proof of inscription.
 */
export async function inscribeBlogPost(
  data: BlogInscriptionData,
  privateKeyWif?: string
): Promise<BlogInscriptionResult> {
  try {
    // Generate inscription document
    const document = generateBlogInscriptionDocument(data);

    // Calculate content hash
    const contentHash = await hashContent(document);

    console.log(`[blog-inscription] Content hash: ${contentHash}`);
    console.log(`[blog-inscription] Document size: ${document.length} bytes`);

    // Check document size (BSV allows large OP_RETURN but be reasonable)
    if (document.length > 100000) {
      throw new Error('Blog post too large for inscription (max 100KB)');
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

    console.log(`[blog-inscription] Inscribing from address: ${address}`);

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

    // Create OP_RETURN script with blog data
    // Format: OP_RETURN <protocol> <content-type> <data>
    const protocol = Buffer.from(PROTOCOL_ID, 'utf8');
    const contentType = Buffer.from('application/json', 'utf8');
    const contentData = Buffer.from(document, 'utf8');

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

    // Calculate fee based on transaction size (0.5 sat/byte typical for BSV)
    const estimatedSize = document.length + 200; // content + overhead
    const minerFee = Math.max(500, Math.ceil(estimatedSize * 0.5));
    const inputSatoshis = utxo.value;
    const changeSatoshis = inputSatoshis - minerFee;

    if (changeSatoshis < 0) {
      throw new Error(`Insufficient satoshis for miner fee. Need ${minerFee}, have ${inputSatoshis}`);
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
      ordinalUrl: `https://1satordinals.com/inscription/${inscriptionId}`,
    };
  } catch (error) {
    console.error('[blog-inscription] Error:', error);
    throw error;
  }
}

/**
 * Verify blog inscription on blockchain
 */
export async function verifyBlogInscription(txid: string): Promise<{
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
    console.error('[blog-inscription] Verify error:', error);
    return { found: false };
  }
}

/**
 * Parse markdown frontmatter and content
 */
export function parseMarkdownBlogPost(markdown: string): {
  frontmatter: Record<string, any>;
  content: string;
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, content: markdown };
  }

  const frontmatterStr = match[1];
  const content = match[2].trim();

  // Simple YAML-like parsing
  const frontmatter: Record<string, any> = {};
  const lines = frontmatterStr.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Parse arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        const arrayValue = value.slice(1, -1).split(',').map(v => v.trim().replace(/['"]/g, ''));
        frontmatter[key] = arrayValue;
      } else {
        frontmatter[key] = value;
      }
    }
  }

  return { frontmatter, content };
}

/**
 * Create BlogInscriptionData from a markdown file
 */
export function createBlogInscriptionDataFromMarkdown(
  slug: string,
  markdown: string
): BlogInscriptionData {
  const { frontmatter, content } = parseMarkdownBlogPost(markdown);

  return {
    slug,
    title: frontmatter.title || slug,
    author: frontmatter.author || 'b0ase.com',
    date: frontmatter.date || new Date().toISOString().split('T')[0],
    excerpt: frontmatter.excerpt || frontmatter.description,
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    content,
  };
}
