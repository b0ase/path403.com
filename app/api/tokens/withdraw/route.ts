import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { transferTokens as transferBsvTokens } from '@/lib/bsv-tokens'
import { transferTokens as transferEthTokens, isValidEthAddress } from '@/lib/eth-tokens'
import { transferTokens as transferSolTokens, isValidSolAddress } from '@/lib/sol-tokens'

// House wallet credentials (tokens are held here until withdrawal)
const BSV_PRIVATE_KEY = process.env.BSV_ORDINALS_PRIVATE_KEY
const BSV_HOUSE_ADDRESS = process.env.BSV_ORDINALS_ADDRESS
const ETH_PRIVATE_KEY = process.env.ETH_PRIVATE_KEY
const SOL_PRIVATE_KEY = process.env.SOL_PRIVATE_KEY

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tokenSymbol, amount, toAddress, blockchain } = body

    // Validate input
    if (!tokenSymbol || typeof tokenSymbol !== 'string') {
      return NextResponse.json({ error: 'Token symbol required' }, { status: 400 })
    }
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount required' }, { status: 400 })
    }
    if (!toAddress || typeof toAddress !== 'string') {
      return NextResponse.json({ error: 'Destination address required' }, { status: 400 })
    }
    if (!blockchain || !['bsv', 'eth', 'sol'].includes(blockchain)) {
      return NextResponse.json({ error: 'Valid blockchain required (bsv, eth, sol)' }, { status: 400 })
    }

    // Get user's balance
    const { data: balance, error: balanceError } = await supabase
      .from('user_token_balances')
      .select('balance')
      .eq('user_id', user.id)
      .eq('token_symbol', tokenSymbol)
      .single()

    if (balanceError || !balance) {
      return NextResponse.json({ error: 'No balance found for this token' }, { status: 404 })
    }

    if (balance.balance < amount) {
      return NextResponse.json({
        error: 'Insufficient balance',
        balance: balance.balance,
        requested: amount
      }, { status: 402 })
    }

    // Get token info for on-chain transfer
    const { data: token, error: tokenError } = await supabase
      .from('issued_tokens')
      .select('*')
      .eq('symbol', tokenSymbol)
      .single()

    if (tokenError || !token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 })
    }

    // Create withdrawal log (pending)
    const { data: withdrawalLog, error: logError } = await supabase
      .from('withdrawal_logs')
      .insert({
        user_id: user.id,
        token_symbol: tokenSymbol,
        amount,
        to_address: toAddress,
        blockchain,
        status: 'pending'
      })
      .select()
      .single()

    if (logError) {
      console.error('Failed to create withdrawal log:', logError)
      return NextResponse.json({ error: 'Failed to initiate withdrawal' }, { status: 500 })
    }

    let txId: string | null = null
    let changeOutpoint: string | null = null

    // Execute on-chain transfer based on blockchain
    if (blockchain === 'bsv') {
      // BSV withdrawal via js-1sat-ord
      if (!BSV_PRIVATE_KEY || !BSV_HOUSE_ADDRESS) {
        await updateWithdrawalStatus(supabase, withdrawalLog.id, 'failed', 'BSV wallet not configured')
        return NextResponse.json({ error: 'BSV withdrawals not configured' }, { status: 503 })
      }

      if (!token.token_id || !token.is_deployed) {
        await updateWithdrawalStatus(supabase, withdrawalLog.id, 'failed', 'Token not deployed on-chain')
        return NextResponse.json({ error: 'Token not deployed on BSV chain' }, { status: 400 })
      }

      // Validate BSV address format (starts with 1 or 3, 26+ chars)
      if (!/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(toAddress)) {
        await updateWithdrawalStatus(supabase, withdrawalLog.id, 'failed', 'Invalid BSV address')
        return NextResponse.json({ error: 'Invalid BSV address format' }, { status: 400 })
      }

      try {
        const result = await transferBsvTokens(
          BSV_PRIVATE_KEY,
          token.token_id,
          BigInt(amount),
          toAddress,
          BSV_HOUSE_ADDRESS
        )
        txId = result.txid
        changeOutpoint = result.changeOutpoint
      } catch (transferError) {
        const errorMessage = transferError instanceof Error ? transferError.message : 'Unknown error'
        console.error('BSV transfer failed:', errorMessage)
        await updateWithdrawalStatus(supabase, withdrawalLog.id, 'failed', errorMessage)
        return NextResponse.json({ error: `Transfer failed: ${errorMessage}` }, { status: 500 })
      }

    } else if (blockchain === 'eth') {
      // ETH withdrawal via ethers.js
      if (!ETH_PRIVATE_KEY) {
        await updateWithdrawalStatus(supabase, withdrawalLog.id, 'failed', 'ETH wallet not configured')
        return NextResponse.json({ error: 'ETH withdrawals not configured' }, { status: 503 })
      }

      if (!token.token_id || !token.is_deployed) {
        await updateWithdrawalStatus(supabase, withdrawalLog.id, 'failed', 'Token not deployed on-chain')
        return NextResponse.json({ error: 'Token not deployed on ETH chain' }, { status: 400 })
      }

      // Validate ETH address format
      if (!isValidEthAddress(toAddress)) {
        await updateWithdrawalStatus(supabase, withdrawalLog.id, 'failed', 'Invalid ETH address')
        return NextResponse.json({ error: 'Invalid ETH address format' }, { status: 400 })
      }

      try {
        const result = await transferEthTokens(
          ETH_PRIVATE_KEY,
          token.token_id, // ERC-20 contract address
          toAddress,
          BigInt(amount)
        )
        txId = result.txHash
      } catch (transferError) {
        const errorMessage = transferError instanceof Error ? transferError.message : 'Unknown error'
        console.error('ETH transfer failed:', errorMessage)
        await updateWithdrawalStatus(supabase, withdrawalLog.id, 'failed', errorMessage)
        return NextResponse.json({ error: `Transfer failed: ${errorMessage}` }, { status: 500 })
      }

    } else if (blockchain === 'sol') {
      // SOL withdrawal via @solana/web3.js
      if (!SOL_PRIVATE_KEY) {
        await updateWithdrawalStatus(supabase, withdrawalLog.id, 'failed', 'SOL wallet not configured')
        return NextResponse.json({ error: 'SOL withdrawals not configured' }, { status: 503 })
      }

      if (!token.token_id || !token.is_deployed) {
        await updateWithdrawalStatus(supabase, withdrawalLog.id, 'failed', 'Token not deployed on-chain')
        return NextResponse.json({ error: 'Token not deployed on SOL chain' }, { status: 400 })
      }

      // Validate SOL address format
      if (!isValidSolAddress(toAddress)) {
        await updateWithdrawalStatus(supabase, withdrawalLog.id, 'failed', 'Invalid SOL address')
        return NextResponse.json({ error: 'Invalid SOL address format' }, { status: 400 })
      }

      try {
        const result = await transferSolTokens(
          SOL_PRIVATE_KEY,
          token.token_id, // SPL token mint address
          toAddress,
          BigInt(amount)
        )
        txId = result.txSignature
      } catch (transferError) {
        const errorMessage = transferError instanceof Error ? transferError.message : 'Unknown error'
        console.error('SOL transfer failed:', errorMessage)
        await updateWithdrawalStatus(supabase, withdrawalLog.id, 'failed', errorMessage)
        return NextResponse.json({ error: `Transfer failed: ${errorMessage}` }, { status: 500 })
      }
    }

    // Debit user's balance
    const { error: debitError } = await supabase.rpc('debit_tokens', {
      p_user_id: user.id,
      p_token_symbol: tokenSymbol,
      p_amount: amount
    })

    if (debitError) {
      console.error('Failed to debit balance:', debitError)
      // Transaction already sent - log the issue but don't fail
      await updateWithdrawalStatus(supabase, withdrawalLog.id, 'completed', null, txId)
      return NextResponse.json({
        success: true,
        warning: 'Balance update failed but transaction was sent',
        txId
      })
    }

    // Update issued_tokens with new UTXO info
    if (changeOutpoint) {
      await supabase
        .from('issued_tokens')
        .update({
          current_utxo: changeOutpoint,
          on_chain_balance: token.on_chain_balance - amount
        })
        .eq('symbol', tokenSymbol)
    }

    // Mark withdrawal as completed
    await updateWithdrawalStatus(supabase, withdrawalLog.id, 'completed', null, txId)

    return NextResponse.json({
      success: true,
      txId,
      tokenSymbol,
      amount,
      toAddress,
      blockchain
    })

  } catch (error) {
    console.error('Withdrawal API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function updateWithdrawalStatus(
  supabase: any,
  withdrawalId: string,
  status: string,
  errorMessage: string | null,
  txId?: string
) {
  await supabase
    .from('withdrawal_logs')
    .update({
      status,
      error_message: errorMessage,
      tx_id: txId || null,
      completed_at: status === 'completed' ? new Date().toISOString() : null
    })
    .eq('id', withdrawalId)
}
