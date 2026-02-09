import { Utils, Script, PrivateKey, PublicKey, Hash, OP } from '@bsv/sdk';
import { getPrisma } from '@/lib/prisma';

// Types
export interface VaultConfig {
    userId: string;
    userPublicKey: string; // Hex
}

/**
 * VaultManager
 *
 * Handles the creation and interaction with 2-of-2 Multisig Vaults.
 *
 * Key Model:
 * - Key 1: Investor's wallet key (they control)
 * - Key 2: b0ase.com platform key (we control)
 *
 * Both parties must sign to move tokens. This ensures:
 * - Investors cannot transfer shares without b0ase approval (regulatory compliance)
 * - b0ase cannot unilaterally seize investor tokens
 * - All transfers are mutually agreed upon
 */
export class VaultManager {

    // In production, these should be securely injected or derived from a master seed.
    private static MASTER_SEED = process.env.HANDCASH_APP_SECRET || 'default-secret-seed-dev-only';

    /**
     * Creates a new 2-of-2 Multisig Vault for an investor.
     * Combines investor's public key with platform-derived key.
     */
    static async createVault(userId: string, userPubKeyHex: string) {
        const prisma = getPrisma();

        // 1. Derive Platform Key deterministically from userId
        // This ensures we can always recreate it for signing
        const appPrivKey = PrivateKey.fromWif(this.deriveAppKeyWif(userId));
        const appPubKey = appPrivKey.toPublicKey();

        // 2. User/Investor Key
        const userPubKey = PublicKey.fromString(userPubKeyHex);

        // 3. Create 2-of-2 Script
        // Sort keys via standard BIP67 (lexicographical) for deterministic script
        const pubKeys = [userPubKey, appPubKey];
        pubKeys.sort((a, b) => a.toString().localeCompare(b.toString()));

        // Construct P2MS (Pay To Multi Sig) Locking Script (Redeem Script)
        // P2MS: OP_M <pubKey1> <pubKey2> OP_N OP_CHECKMULTISIG
        const redeemScript = new Script();
        redeemScript.writeOpCode(OP.OP_2); // M = 2 (requires 2 signatures)
        for (const pk of pubKeys) {
             redeemScript.writeBin(Utils.toArray(pk.toString(), 'hex'));
        }
        redeemScript.writeOpCode(OP.OP_2); // N = 2 (total keys)
        redeemScript.writeOpCode(OP.OP_CHECKMULTISIG);

        const redeemScriptHex = redeemScript.toHex();

        // P2SH Address generation
        // 1. Hash160(RedeemScript)
        // 2. Prepend Version Byte (0x05 for Mainnet P2SH)
        // 3. Base58Check Encode

        const scriptHash = Hash.hash160(redeemScript.toBinary());
        const version = 0x05;
        const payload = [version, ...scriptHash];
        const p2shAddress = Utils.toBase58Check(payload);

        // 4. Store in DB
        const vault = await (prisma as unknown as {
            vault: {
                upsert: (args: {
                    where: { userId: string };
                    update: Record<string, string>;
                    create: Record<string, string>;
                }) => Promise<{
                    id: string;
                    userId: string;
                    address: string;
                    redeemScript: string;
                    userPublicKey: string;
                    appPublicKey: string;
                    appKeyPath: string;
                }>;
            };
        }).vault.upsert({
            where: { userId },
            update: {
                userPublicKey: userPubKeyHex,
                appPublicKey: appPubKey.toString(),
                redeemScript: redeemScriptHex,
                address: p2shAddress,
            },
            create: {
                userId,
                userPublicKey: userPubKeyHex,
                appPublicKey: appPubKey.toString(),
                appKeyPath: `m/0/${userId}`, // logical derivation path
                redeemScript: redeemScriptHex,
                address: p2shAddress,
            }
        });

        return vault;
    }

    /**
     * Helper to derive platform key for a user (deterministic)
     */
    private static deriveAppKeyWif(userId: string): string {
        // Hash(MASTER + userId) -> PrivKey
        const hash = Hash.sha256(Utils.toArray(this.MASTER_SEED + userId));
        return PrivateKey.fromHex(Utils.toHex(hash)).toWif();
    }

    /**
     * Get the platform's public key for a user's vault
     */
    static getAppPublicKey(userId: string): string {
        const appPrivKey = PrivateKey.fromWif(this.deriveAppKeyWif(userId));
        return appPrivKey.toPublicKey().toString();
    }
}
