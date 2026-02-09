/**
 * Exchange Settlement System
 *
 * Handles off-chain and on-chain settlement of trades:
 * - Off-chain: Debit/credit clearing balances (fast)
 * - On-chain: BSV-20 transfer after settlement (optional)
 */

import { createClient } from '@/lib/supabase/server'

export interface SettleTradeInput {
  tradeId: string
  buyerId: string
  sellerId: string
  tokenId: string
  tokenSymbol: string
  amount: number
  totalSats: number
  settleOnChain?: boolean
}

export interface SettlementResult {
  success: boolean
  error?: string
  txHash?: string
}

/**
 * Settle a trade by transferring balances
 */
export async function settleTrade(input: SettleTradeInput): Promise<SettlementResult> {
  const { tradeId, buyerId, sellerId, tokenId, tokenSymbol, amount, totalSats, settleOnChain } = input
  const supabase = await createClient()

  try {
    // 1. Debit buyer's locked sats (was locked when order created)
    const { data: buyerBalance, error: buyerFetchError } = await supabase
      .from('exchange_clearing_balances')
      .select('*')
      .eq('user_id', buyerId)
      .single()

    if (buyerFetchError || !buyerBalance) {
      throw new Error(`Buyer balance not found: ${buyerId}`)
    }

    // Move sats from locked to spent
    const { error: buyerUpdateError } = await supabase
      .from('exchange_clearing_balances')
      .update({
        locked_sats: Math.max(0, buyerBalance.locked_sats - totalSats),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', buyerId)

    if (buyerUpdateError) {
      throw new Error(`Failed to debit buyer: ${buyerUpdateError.message}`)
    }

    // 2. Credit seller's available sats
    const { data: sellerBalance } = await supabase
      .from('exchange_clearing_balances')
      .select('*')
      .eq('user_id', sellerId)
      .single()

    if (sellerBalance) {
      const { error: sellerUpdateError } = await supabase
        .from('exchange_clearing_balances')
        .update({
          available_sats: sellerBalance.available_sats + totalSats,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', sellerId)

      if (sellerUpdateError) {
        throw new Error(`Failed to credit seller: ${sellerUpdateError.message}`)
      }
    } else {
      // Create balance record for seller
      const { error: sellerCreateError } = await supabase
        .from('exchange_clearing_balances')
        .insert({
          user_id: sellerId,
          available_sats: totalSats,
          locked_sats: 0,
          total_deposited: 0,
          total_withdrawn: 0
        })

      if (sellerCreateError) {
        throw new Error(`Failed to create seller balance: ${sellerCreateError.message}`)
      }
    }

    // 3. Transfer tokens from seller's locked to buyer's available
    const { data: sellerTokens, error: sellerTokensFetchError } = await supabase
      .from('exchange_token_balances')
      .select('*')
      .eq('user_id', sellerId)
      .eq('token_id', tokenId)
      .single()

    if (sellerTokensFetchError || !sellerTokens) {
      throw new Error(`Seller token balance not found for ${tokenId}`)
    }

    // Deduct from seller's locked tokens
    const { error: sellerTokensUpdateError } = await supabase
      .from('exchange_token_balances')
      .update({
        locked_amount: Math.max(0, sellerTokens.locked_amount - amount),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', sellerId)
      .eq('token_id', tokenId)

    if (sellerTokensUpdateError) {
      throw new Error(`Failed to deduct seller tokens: ${sellerTokensUpdateError.message}`)
    }

    // Credit buyer's token balance
    const { data: buyerTokens } = await supabase
      .from('exchange_token_balances')
      .select('*')
      .eq('user_id', buyerId)
      .eq('token_id', tokenId)
      .single()

    if (buyerTokens) {
      const { error: buyerTokensUpdateError } = await supabase
        .from('exchange_token_balances')
        .update({
          available_amount: buyerTokens.available_amount + amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', buyerId)
        .eq('token_id', tokenId)

      if (buyerTokensUpdateError) {
        throw new Error(`Failed to credit buyer tokens: ${buyerTokensUpdateError.message}`)
      }
    } else {
      // Create token balance record for buyer
      const { error: buyerTokensCreateError } = await supabase
        .from('exchange_token_balances')
        .insert({
          user_id: buyerId,
          token_id: tokenId,
          token_symbol: tokenSymbol,
          available_amount: amount,
          locked_amount: 0
        })

      if (buyerTokensCreateError) {
        throw new Error(`Failed to create buyer token balance: ${buyerTokensCreateError.message}`)
      }
    }

    // 4. Update trade as settled
    let txHash: string | undefined

    if (settleOnChain) {
      // TODO: Implement on-chain BSV-20 transfer via GorillaPool
      // txHash = await transferBsv20Tokens(tokenId, sellerAddress, buyerAddress, amount)
      console.log('On-chain settlement not yet implemented')
    }

    const { error: tradeUpdateError } = await supabase
      .from('exchange_trades')
      .update({
        settlement_type: settleOnChain ? 'onchain' : 'offchain',
        settled_at: new Date().toISOString(),
        tx_hash: txHash
      })
      .eq('id', tradeId)

    if (tradeUpdateError) {
      console.error('Failed to update trade settlement status:', tradeUpdateError)
    }

    return { success: true, txHash }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Settlement failed'
    console.error('Settlement error:', message)
    return { success: false, error: message }
  }
}

/**
 * Lock sats for a buy order
 */
export async function lockSatsForBuyOrder(
  userId: string,
  totalSats: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const { data: balance, error: fetchError } = await supabase
      .from('exchange_clearing_balances')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      // Create balance if not exists
      if (fetchError.code === 'PGRST116') {
        return { success: false, error: 'Insufficient balance. Please deposit sats first.' }
      }
      throw fetchError
    }

    if (balance.available_sats < totalSats) {
      return {
        success: false,
        error: `Insufficient balance. Need ${totalSats} sats, have ${balance.available_sats}`
      }
    }

    const { error: updateError } = await supabase
      .from('exchange_clearing_balances')
      .update({
        available_sats: balance.available_sats - totalSats,
        locked_sats: balance.locked_sats + totalSats,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (updateError) throw updateError

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to lock sats'
    return { success: false, error: message }
  }
}

/**
 * Unlock sats when a buy order is cancelled
 */
export async function unlockSatsForCancelledOrder(
  userId: string,
  totalSats: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const { data: balance, error: fetchError } = await supabase
      .from('exchange_clearing_balances')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (fetchError || !balance) {
      throw new Error('Balance not found')
    }

    const { error: updateError } = await supabase
      .from('exchange_clearing_balances')
      .update({
        available_sats: balance.available_sats + totalSats,
        locked_sats: Math.max(0, balance.locked_sats - totalSats),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (updateError) throw updateError

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to unlock sats'
    return { success: false, error: message }
  }
}

/**
 * Lock tokens for a sell order
 */
export async function lockTokensForSellOrder(
  userId: string,
  tokenId: string,
  tokenSymbol: string,
  amount: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const { data: balance, error: fetchError } = await supabase
      .from('exchange_token_balances')
      .select('*')
      .eq('user_id', userId)
      .eq('token_id', tokenId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return { success: false, error: `No ${tokenSymbol} tokens available to sell` }
      }
      throw fetchError
    }

    if (balance.available_amount < amount) {
      return {
        success: false,
        error: `Insufficient tokens. Need ${amount} ${tokenSymbol}, have ${balance.available_amount}`
      }
    }

    const { error: updateError } = await supabase
      .from('exchange_token_balances')
      .update({
        available_amount: balance.available_amount - amount,
        locked_amount: balance.locked_amount + amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('token_id', tokenId)

    if (updateError) throw updateError

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to lock tokens'
    return { success: false, error: message }
  }
}

/**
 * Unlock tokens when a sell order is cancelled
 */
export async function unlockTokensForCancelledOrder(
  userId: string,
  tokenId: string,
  amount: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const { data: balance, error: fetchError } = await supabase
      .from('exchange_token_balances')
      .select('*')
      .eq('user_id', userId)
      .eq('token_id', tokenId)
      .single()

    if (fetchError || !balance) {
      throw new Error('Token balance not found')
    }

    const { error: updateError } = await supabase
      .from('exchange_token_balances')
      .update({
        available_amount: balance.available_amount + amount,
        locked_amount: Math.max(0, balance.locked_amount - amount),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('token_id', tokenId)

    if (updateError) throw updateError

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to unlock tokens'
    return { success: false, error: message }
  }
}

/**
 * Get user's clearing balance
 */
export async function getClearingBalance(userId: string): Promise<{
  available_sats: number
  locked_sats: number
  total_sats: number
} | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('exchange_clearing_balances')
    .select('available_sats, locked_sats')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null

  return {
    available_sats: data.available_sats,
    locked_sats: data.locked_sats,
    total_sats: data.available_sats + data.locked_sats
  }
}

/**
 * Get user's token balances
 */
export async function getTokenBalances(userId: string): Promise<{
  token_id: string
  token_symbol: string
  available_amount: number
  locked_amount: number
}[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('exchange_token_balances')
    .select('token_id, token_symbol, available_amount, locked_amount')
    .eq('user_id', userId)

  if (error || !data) return []

  return data
}

/**
 * Deposit sats to clearing balance
 */
export async function depositSats(
  userId: string,
  userHandle: string | null,
  amount: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const { data: existing } = await supabase
      .from('exchange_clearing_balances')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existing) {
      const { error } = await supabase
        .from('exchange_clearing_balances')
        .update({
          available_sats: existing.available_sats + amount,
          total_deposited: existing.total_deposited + amount,
          user_handle: userHandle,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('exchange_clearing_balances')
        .insert({
          user_id: userId,
          user_handle: userHandle,
          available_sats: amount,
          locked_sats: 0,
          total_deposited: amount,
          total_withdrawn: 0
        })

      if (error) throw error
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Deposit failed'
    return { success: false, error: message }
  }
}

/**
 * Deposit tokens to exchange (typically synced from on-chain)
 */
export async function depositTokens(
  userId: string,
  userHandle: string | null,
  tokenId: string,
  tokenSymbol: string,
  amount: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const { data: existing } = await supabase
      .from('exchange_token_balances')
      .select('*')
      .eq('user_id', userId)
      .eq('token_id', tokenId)
      .single()

    if (existing) {
      const { error } = await supabase
        .from('exchange_token_balances')
        .update({
          available_amount: existing.available_amount + amount,
          user_handle: userHandle,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('token_id', tokenId)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('exchange_token_balances')
        .insert({
          user_id: userId,
          user_handle: userHandle,
          token_id: tokenId,
          token_symbol: tokenSymbol,
          available_amount: amount,
          locked_amount: 0
        })

      if (error) throw error
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token deposit failed'
    return { success: false, error: message }
  }
}
