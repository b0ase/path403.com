/**
 * MultisigCoordinator
 *
 * Handles 2-of-2 P2SH multisig signature coordination for investor token custody.
 *
 * Key Model:
 * - Key 1: Investor's key (from their wallet)
 * - Key 2: Platform key (deterministically derived, b0ase.com holds)
 *
 * Both parties must sign to move tokens. This ensures:
 * - Investors cannot transfer shares without b0ase approval (Reg D compliance)
 * - b0ase cannot unilaterally seize investor tokens
 * - All transfers are mutually authorized
 */

import {
  Utils,
  Script,
  Transaction,
  PrivateKey,
  Hash,
  OP,
  P2PKH
} from '@bsv/sdk';
import { getPrisma } from '@/lib/prisma';

const MASTER_SEED = process.env.HANDCASH_APP_SECRET || 'default-secret-seed-dev-only';

export interface WithdrawalRequest {
  vaultAddress: string;
  tokenId: string;
  amount: bigint;
  recipient: string;
  userId: string;
}

export interface SignedWithdrawal {
  txHex: string;
  txid: string;
  status: 'ready_for_broadcast' | 'broadcast_pending' | 'confirmed';
}

export interface PartiallySignedTx {
  txHex: string;
  inputIndex: number;
  redeemScript: string;
  sighashType: number;
  preimage: string; // Sighash preimage for user to sign
}

/**
 * Derive the platform private key for a user (deterministic)
 */
function deriveAppKeyWif(userId: string): string {
  const hash = Hash.sha256(Utils.toArray(MASTER_SEED + userId));
  return PrivateKey.fromHex(Utils.toHex(hash)).toWif();
}

/**
 * Create a P2SH unlocking script for 2-of-2 multisig
 */
function createMultisigUnlocker(
  sig1: number[],
  sig2: number[],
  redeemScript: number[]
): Script {
  const unlocker = new Script();
  // OP_0 is required due to CHECKMULTISIG off-by-one bug
  unlocker.writeOpCode(OP.OP_0);
  unlocker.writeBin(sig1);
  unlocker.writeBin(sig2);
  unlocker.writeBin(redeemScript);
  return unlocker;
}

/**
 * MultisigCoordinator class
 */
export class MultisigCoordinator {

  /**
   * Step 1: Create a withdrawal transaction draft for user signing
   * Returns the sighash preimage that the user needs to sign
   *
   * Note: For 2-of-2, both investor AND platform must approve.
   * This is typically initiated by the investor requesting a withdrawal,
   * then reviewed/approved by b0ase before platform co-signs.
   */
  static async createWithdrawalDraft(
    request: WithdrawalRequest
  ): Promise<PartiallySignedTx> {
    const prisma = getPrisma();

    // Get vault details
    const vault = await (prisma as unknown as {
      vault: {
        findFirst: (args: { where: { address: string; userId: string } }) => Promise<{
          redeemScript: string;
          userPublicKey: string;
          appPublicKey: string;
        } | null>;
      };
    }).vault.findFirst({
      where: { address: request.vaultAddress, userId: request.userId }
    });

    if (!vault) {
      throw new Error('Vault not found');
    }

    // Build transaction structure
    // This is a template - actual UTXO fetching would be needed
    const tx = new Transaction();

    // Add placeholder input (to be filled with actual UTXO)
    // In production, fetch UTXOs from the vault address
    const input = {
      sourceTXID: '0'.repeat(64), // Placeholder
      sourceOutputIndex: 0,
      sequence: 0xffffffff,
      unlockingScript: new Script() // Empty, to be filled
    };
    tx.addInput(input);

    // Add output to recipient
    const recipientScript = new P2PKH().lock(request.recipient);
    tx.addOutput({
      lockingScript: recipientScript,
      satoshis: 1 // Token outputs are 1 satoshi
    });

    // Get sighash preimage for user signing
    const sighashType = 0x41; // SIGHASH_ALL | SIGHASH_FORKID

    // Calculate preimage
    const preimage = tx.toHex(); // Simplified - actual preimage calculation needed

    return {
      txHex: tx.toHex(),
      inputIndex: 0,
      redeemScript: vault.redeemScript,
      sighashType,
      preimage
    };
  }

  /**
   * Step 2: Complete the transaction with user signature and platform co-signature
   *
   * This should only be called after b0ase has approved the withdrawal request
   * (e.g., verified it complies with transfer restrictions, holding periods, etc.)
   */
  static async completeWithdrawal(
    userId: string,
    vaultAddress: string,
    txHex: string,
    userSignature: string,
    inputIndex: number
  ): Promise<SignedWithdrawal> {
    const prisma = getPrisma();

    // Get vault
    const vault = await (prisma as unknown as {
      vault: {
        findFirst: (args: { where: { address: string; userId: string } }) => Promise<{
          redeemScript: string;
        } | null>;
      };
    }).vault.findFirst({
      where: { address: vaultAddress, userId }
    });

    if (!vault) {
      throw new Error('Vault not found');
    }

    // Get platform private key
    const appPrivKey = PrivateKey.fromWif(deriveAppKeyWif(userId));

    // Reconstruct transaction
    const tx = Transaction.fromHex(txHex);

    // Sign with platform key
    const redeemScriptBytes = Utils.toArray(vault.redeemScript, 'hex');
    const sighashType = 0x41;

    // Get sighash for signing
    const sighash = tx.inputs[inputIndex].sourceTXID; // Simplified
    const appSig = appPrivKey.sign(Utils.toArray(sighash, 'hex'));
    const appSigDer = appSig.toDER();

    // Create unlocking script with both signatures
    const userSigBytes = Utils.toArray(userSignature, 'hex');
    const unlocker = createMultisigUnlocker(
      [...userSigBytes, sighashType],
      [...appSigDer, sighashType],
      redeemScriptBytes
    );

    // Set unlocking script
    tx.inputs[inputIndex].unlockingScript = unlocker;

    const finalTxHex = tx.toHex();
    const txid = tx.id('hex');

    // Log for audit
    await this.logWithdrawal(userId, vaultAddress, txid, 'completed');

    return {
      txHex: finalTxHex,
      txid,
      status: 'ready_for_broadcast'
    };
  }

  /**
   * Audit logging for regulatory compliance
   */
  private static async logWithdrawal(
    userId: string,
    vaultAddress: string,
    txid: string,
    status: string
  ): Promise<void> {
    const prisma = getPrisma();

    try {
      await (prisma as unknown as {
        auditLog: {
          create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
        };
      }).auditLog.create({
        data: {
          userId,
          action: 'multisig_withdrawal',
          details: JSON.stringify({
            vaultAddress,
            txid,
            status,
            timestamp: new Date().toISOString()
          })
        }
      });
    } catch (error) {
      // Don't fail withdrawal if audit log fails
      console.error('[multisig] Audit log failed:', error);
    }
  }

  /**
   * Validate that a vault exists and belongs to user
   */
  static async validateVaultOwnership(
    userId: string,
    vaultAddress: string
  ): Promise<boolean> {
    const prisma = getPrisma();

    const vault = await (prisma as unknown as {
      vault: {
        findFirst: (args: { where: { address: string; userId: string } }) => Promise<unknown | null>;
      };
    }).vault.findFirst({
      where: { address: vaultAddress, userId }
    });

    return !!vault;
  }

  /**
   * Get vault details for a user
   */
  static async getVault(userId: string): Promise<{
    address: string;
    redeemScript: string;
    userPublicKey: string;
    appPublicKey: string;
  } | null> {
    const prisma = getPrisma();

    const vault = await (prisma as unknown as {
      vault: {
        findFirst: (args: { where: { userId: string } }) => Promise<{
          address: string;
          redeemScript: string;
          userPublicKey: string;
          appPublicKey: string;
        } | null>;
      };
    }).vault.findFirst({
      where: { userId }
    });

    if (!vault) return null;

    return {
      address: vault.address,
      redeemScript: vault.redeemScript,
      userPublicKey: vault.userPublicKey,
      appPublicKey: vault.appPublicKey
    };
  }
}
