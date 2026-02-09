/**
 * SOL SPL Token Transfer Library for b0ase.com
 *
 * Handles SPL token transfers on Solana mainnet.
 */

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  clusterApiUrl,
} from '@solana/web3.js'
import {
  getOrCreateAssociatedTokenAccount,
  transfer,
  getAccount,
  getMint,
} from '@solana/spl-token'
import bs58 from 'bs58'

// Default to Solana mainnet
const DEFAULT_RPC = 'https://api.mainnet-beta.solana.com'

export interface TransferResult {
  txSignature: string
}

export interface TokenInfo {
  mint: string
  decimals: number
  balance: bigint
}

/**
 * Get Solana connection
 */
function getConnection(rpcUrl?: string): Connection {
  return new Connection(rpcUrl || process.env.SOL_RPC_URL || DEFAULT_RPC, 'confirmed')
}

/**
 * Get keypair from private key (base58 or byte array)
 */
function getKeypair(privateKey: string): Keypair {
  // Handle base58 encoded private key
  if (privateKey.length === 88 || privateKey.length === 87) {
    return Keypair.fromSecretKey(bs58.decode(privateKey))
  }
  // Handle hex encoded or JSON array
  if (privateKey.startsWith('[')) {
    const bytes = JSON.parse(privateKey)
    return Keypair.fromSecretKey(new Uint8Array(bytes))
  }
  // Handle hex
  const bytes = Buffer.from(privateKey.replace('0x', ''), 'hex')
  return Keypair.fromSecretKey(bytes)
}

/**
 * Get SPL token info for a holder
 */
export async function getTokenInfo(
  mintAddress: string,
  holderAddress: string,
  rpcUrl?: string
): Promise<TokenInfo> {
  const connection = getConnection(rpcUrl)
  const mint = new PublicKey(mintAddress)
  const holder = new PublicKey(holderAddress)

  const mintInfo = await getMint(connection, mint)

  // Get associated token account
  try {
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      Keypair.generate(), // Dummy payer for read-only
      mint,
      holder
    )
    const accountInfo = await getAccount(connection, tokenAccount.address)

    return {
      mint: mintAddress,
      decimals: mintInfo.decimals,
      balance: accountInfo.amount,
    }
  } catch {
    // No token account exists
    return {
      mint: mintAddress,
      decimals: mintInfo.decimals,
      balance: BigInt(0),
    }
  }
}

/**
 * Get SOL balance of an address
 */
export async function getSolBalance(address: string, rpcUrl?: string): Promise<bigint> {
  const connection = getConnection(rpcUrl)
  const pubkey = new PublicKey(address)
  const balance = await connection.getBalance(pubkey)
  return BigInt(balance)
}

/**
 * Transfer SPL tokens
 *
 * @param privateKey - House wallet private key (base58 encoded)
 * @param mintAddress - SPL token mint address
 * @param recipientAddress - Recipient's Solana address
 * @param amount - Amount to transfer (in token's smallest unit)
 * @param rpcUrl - Optional RPC URL override
 */
export async function transferTokens(
  privateKey: string,
  mintAddress: string,
  recipientAddress: string,
  amount: bigint,
  rpcUrl?: string
): Promise<TransferResult> {
  // Validate
  if (amount <= BigInt(0)) {
    throw new Error('Transfer amount must be positive')
  }

  let mint: PublicKey
  let recipient: PublicKey

  try {
    mint = new PublicKey(mintAddress)
  } catch {
    throw new Error('Invalid token mint address')
  }

  try {
    recipient = new PublicKey(recipientAddress)
  } catch {
    throw new Error('Invalid recipient address')
  }

  console.log(`[sol] Transferring ${amount} tokens to ${recipientAddress}`)
  console.log(`[sol] Token mint: ${mintAddress}`)

  const connection = getConnection(rpcUrl)
  const payer = getKeypair(privateKey)

  console.log(`[sol] House wallet: ${payer.publicKey.toBase58()}`)

  // Get or create source token account
  const sourceAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  )

  console.log(`[sol] Source token account: ${sourceAccount.address.toBase58()}`)
  console.log(`[sol] Source balance: ${sourceAccount.amount}`)

  if (sourceAccount.amount < amount) {
    throw new Error(`Insufficient token balance: ${sourceAccount.amount} available, ${amount} requested`)
  }

  // Get or create destination token account
  const destinationAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    recipient
  )

  console.log(`[sol] Destination token account: ${destinationAccount.address.toBase58()}`)

  // Execute transfer
  console.log(`[sol] Executing transfer...`)
  const txSignature = await transfer(
    connection,
    payer,
    sourceAccount.address,
    destinationAccount.address,
    payer,
    amount
  )

  console.log(`[sol] Transaction confirmed: ${txSignature}`)

  return {
    txSignature,
  }
}

/**
 * Transfer native SOL
 */
export async function transferSol(
  privateKey: string,
  recipientAddress: string,
  amountLamports: bigint,
  rpcUrl?: string
): Promise<TransferResult> {
  let recipient: PublicKey
  try {
    recipient = new PublicKey(recipientAddress)
  } catch {
    throw new Error('Invalid recipient address')
  }

  const connection = getConnection(rpcUrl)
  const payer = getKeypair(privateKey)

  const transaction = new Transaction().add(
    require('@solana/web3.js').SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: recipient,
      lamports: amountLamports,
    })
  )

  const txSignature = await sendAndConfirmTransaction(connection, transaction, [payer])

  return {
    txSignature,
  }
}

/**
 * Validate Solana address format
 */
export function isValidSolAddress(address: string): boolean {
  try {
    new PublicKey(address)
    return true
  } catch {
    return false
  }
}
