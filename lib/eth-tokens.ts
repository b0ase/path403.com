/**
 * ETH ERC-20 Token Transfer Library for b0ase.com
 *
 * Handles ERC-20 token transfers on Ethereum mainnet.
 */

import { ethers } from 'ethers'

// Standard ERC-20 ABI for transfer function
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
]

// Default to Ethereum mainnet, can be overridden
const DEFAULT_RPC = 'https://eth.llamarpc.com'

export interface TransferResult {
  txHash: string
  blockNumber?: number
}

export interface TokenInfo {
  name: string
  symbol: string
  decimals: number
  balance: bigint
}

/**
 * Get provider for Ethereum network
 */
function getProvider(rpcUrl?: string): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(rpcUrl || process.env.ETH_RPC_URL || DEFAULT_RPC)
}

/**
 * Get signer from private key
 */
function getSigner(privateKey: string, rpcUrl?: string): ethers.Wallet {
  const provider = getProvider(rpcUrl)
  return new ethers.Wallet(privateKey, provider)
}

/**
 * Get ERC-20 token info
 */
export async function getTokenInfo(
  tokenAddress: string,
  holderAddress: string,
  rpcUrl?: string
): Promise<TokenInfo> {
  const provider = getProvider(rpcUrl)
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)

  const [name, symbol, decimals, balance] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.decimals(),
    contract.balanceOf(holderAddress),
  ])

  return {
    name,
    symbol,
    decimals: Number(decimals),
    balance: BigInt(balance),
  }
}

/**
 * Get ETH balance of an address
 */
export async function getEthBalance(address: string, rpcUrl?: string): Promise<bigint> {
  const provider = getProvider(rpcUrl)
  return await provider.getBalance(address)
}

/**
 * Transfer ERC-20 tokens
 *
 * @param privateKey - House wallet private key (hex, with or without 0x prefix)
 * @param tokenAddress - ERC-20 contract address
 * @param recipientAddress - Recipient's ETH address
 * @param amount - Amount to transfer (in token's smallest unit, considering decimals)
 * @param rpcUrl - Optional RPC URL override
 */
export async function transferTokens(
  privateKey: string,
  tokenAddress: string,
  recipientAddress: string,
  amount: bigint,
  rpcUrl?: string
): Promise<TransferResult> {
  // Validate addresses
  if (!ethers.isAddress(tokenAddress)) {
    throw new Error('Invalid token contract address')
  }
  if (!ethers.isAddress(recipientAddress)) {
    throw new Error('Invalid recipient address')
  }
  if (amount <= BigInt(0)) {
    throw new Error('Transfer amount must be positive')
  }

  console.log(`[eth] Transferring ${amount} tokens to ${recipientAddress}`)
  console.log(`[eth] Token contract: ${tokenAddress}`)

  const signer = getSigner(privateKey, rpcUrl)
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer)

  // Check balance
  const signerAddress = await signer.getAddress()
  const balance = await contract.balanceOf(signerAddress)
  console.log(`[eth] House wallet balance: ${balance}`)

  if (BigInt(balance) < amount) {
    throw new Error(`Insufficient token balance: ${balance} available, ${amount} requested`)
  }

  // Execute transfer
  console.log(`[eth] Executing transfer...`)
  const tx = await contract.transfer(recipientAddress, amount)
  console.log(`[eth] Transaction submitted: ${tx.hash}`)

  // Wait for confirmation
  const receipt = await tx.wait()
  console.log(`[eth] Transaction confirmed in block ${receipt.blockNumber}`)

  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
  }
}

/**
 * Transfer native ETH
 */
export async function transferEth(
  privateKey: string,
  recipientAddress: string,
  amountWei: bigint,
  rpcUrl?: string
): Promise<TransferResult> {
  if (!ethers.isAddress(recipientAddress)) {
    throw new Error('Invalid recipient address')
  }

  const signer = getSigner(privateKey, rpcUrl)

  const tx = await signer.sendTransaction({
    to: recipientAddress,
    value: amountWei,
  })

  const receipt = await tx.wait()

  return {
    txHash: tx.hash,
    blockNumber: receipt?.blockNumber,
  }
}

/**
 * Validate Ethereum address format
 */
export function isValidEthAddress(address: string): boolean {
  return ethers.isAddress(address)
}

/**
 * Format amount with decimals for display
 */
export function formatTokenAmount(amount: bigint, decimals: number): string {
  return ethers.formatUnits(amount, decimals)
}

/**
 * Parse token amount from human-readable to raw
 */
export function parseTokenAmount(amount: string, decimals: number): bigint {
  return ethers.parseUnits(amount, decimals)
}
