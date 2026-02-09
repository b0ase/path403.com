/**
 * Custody Module
 *
 * Non-custodial 2-of-3 multisig token custody for b0ase.com
 *
 * Architecture:
 * - User holds 2 keys (user key + backup key)
 * - Platform holds 1 key (app key)
 * - User can always withdraw without platform assistance
 * - Platform is NOT a custodian (regulatory compliance)
 */

export { VaultManager, type VaultConfig } from './vault-manager';
export { MultisigCoordinator } from './multisig-coordinator';
export {
  getVaultBalance,
  transferFromVault,
  buildMultisigTokenTx,
  completeMultisigTx,
  broadcastTransaction,
  type MultisigTransferResult,
  type VaultBalance
} from './multisig-tokens';
