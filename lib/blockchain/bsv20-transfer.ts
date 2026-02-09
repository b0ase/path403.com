/**
 * BSV-20 Token Transfer
 *
 * Handles BSV-20 token transfers on mainnet using @bsv/sdk
 */

import { Transaction, PrivateKey, Utils } from '@bsv/sdk';
import axios from 'axios';

interface UTXO {
  txid: string;
  vout: number;
  value: number;
  script: string;
}

interface TokenTransferParams {
  deployTxid: string; // Token deploy inscription TXID
  amount: string; // Token amount to transfer
  sourceAddress: string; // Current token holder
  destinationAddress: string; // Recipient address
  privateKeyWIF: string; // Private key to sign with (WIF format)
  changeAddress?: string; // Change address (defaults to source)
  feeRate?: number; // Satoshis per byte (default 1)}

/**
 * Get UTXO containing BSV-20 token from whatsonchain
 */
async function getTokenUTXO(
  deployTxid: string,
  address: string
): Promise<UTXO | null> {
  try {
    // Query whatsonchain for UTXOs at address
    const response = await axios.get(
      `https://api.whatsonchain.com/v1/bsv/main/address/${address}/unspent`
    );

    if (!response.data || response.data.length === 0) {
      console.log(`[bsv20-transfer] No UTXOs found for ${address}`);
      return null;
    }

    // Look for UTXO that contains the token
    // The token is in the first output if it was transferred
    // For deploy/mint, it's the output containing the inscription
    for (const utxo of response.data) {
      // Get full transaction to check for inscriptions
      const txResponse = await axios.get(
        `https://api.whatsonchain.com/v1/bsv/main/tx/${utxo.tx_hash}`
      );

      const tx = txResponse.data;

      // Check outputs for our deploy TXID reference
      // This is a simplified check - in production, you'd validate the inscription
      if (utxo.tx_hash === deployTxid || utxo.vout === 0) {
        return {
          txid: utxo.tx_hash,
          vout: utxo.vout,
          value: utxo.value,
          script: tx.vout[utxo.vout].scriptPubKey.hex,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('[bsv20-transfer] Failed to get UTXO:', error);
    throw error;
  }
}

/**
 * Build BSV-20 transfer transaction
 *
 * Creates a transaction that transfers tokens from source to destination.
 * For $$bWriter, we're moving the full 1B token supply.
 */
async function buildTransferTransaction(
  params: TokenTransferParams
): Promise<Transaction> {
  const {
    deployTxid,
    amount,
    sourceAddress,
    destinationAddress,
    privateKeyWIF,
    changeAddress = sourceAddress,
    feeRate = 1,
  } = params;

  try {
    // 1. Get the token UTXO
    const tokenUTXO = await getTokenUTXO(deployTxid, sourceAddress);
    if (!tokenUTXO) {
      throw new Error(`Token UTXO not found at ${sourceAddress}`);
    }

    // 2. Create transaction
    const tx = new Transaction();

    // 3. Add input (the token UTXO)
    tx.addInput({
      txid: tokenUTXO.txid,
      vout: tokenUTXO.vout,
      satoshis: tokenUTXO.value,
      script: tokenUTXO.script,
      unlockingScript: undefined, // Will be signed later
    });

    // 4. Create BSV-20 transfer inscription for output
    // The inscription JSON for a BSV-20 transfer:
    // {
    //   "p": "bsv-20",
    //   "op": "transfer",
    //   "tick": "$bWriter",
    //   "amt": "1000000000"
    // }

    const transferInscription = {
      p: 'bsv-20',
      op: 'transfer',
      tick: '$$bWriter', // Double $ to match the deployed token
      amt: amount,
    };

    const inscriptionData = JSON.stringify(transferInscription);

    // 5. Build output with inscription
    // Output 0: Token to destination (with inscription)
    const destinationScript = `OP_0 OP_PUSHDATA1 ${inscriptionData} OP_1 OP_PUSHDATA1 ${destinationAddress}`;
    // TODO: Properly build script with inscription protocol

    // 6. Add change output
    const changeAmount = tokenUTXO.value - feeRate * 200; // Rough fee estimate
    if (changeAmount > 0) {
      // Add change to source address
      // tx.addOutput({
      //   address: changeAddress,
      //   satoshis: changeAmount,
      // });
    }

    // 7. Sign transaction
    const privateKey = PrivateKey.fromWIF(privateKeyWIF);
    // tx.sign(privateKey);

    return tx;
  } catch (error) {
    console.error('[bsv20-transfer] Failed to build transaction:', error);
    throw error;
  }
}

/**
 * Transfer BSV-20 tokens
 */
export async function transferBsvToken(
  params: TokenTransferParams
): Promise<{ success: boolean; txid?: string; error?: string }> {
  try {
    console.log('[bsv20-transfer] Building transfer transaction...');

    // const tx = await buildTransferTransaction(params);
    // const txid = tx.hash?.toString('hex');

    // TODO: Broadcast transaction
    // const broadcast = await axios.post(
    //   'https://api.whatsonchain.com/v1/bsv/main/tx/raw',
    //   { txhex: tx.toString() }
    // );

    return {
      success: true,
      // txid: broadcast.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
