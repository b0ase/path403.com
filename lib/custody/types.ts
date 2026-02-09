/**
 * Interface definitions for the 2-of-3 Multisig Vault System.
 * Technology: @bsv/sdk (P2SH)
 */

export interface VaultKeys {
    userPublicKey: string;   // Hex string
    appPublicKey: string;    // Hex string
    backupPublicKey: string; // Hex string
}

export interface UnlockedVault {
    address: string;         // The Deposit Address (P2SH)
    redeemScript: string;    // The full redeem script (Hex)
    derivationPath: string;  // Path used for App Key derivation (e.g. m/0/1)
}

export interface MultisigTransaction {
    txId: string;
    rawTx: string;
    inputs: {
        txId: string;
        outputIndex: number;
        satoshis: number;
        script: string;
    }[];
    signatures: {
        user?: string;
        app?: string;
        backup?: string;
    };
    status: 'PENDING_SIGNATURES' | 'BROADCASTED' | 'FAILED';
}

export interface CustodyProvider {
    /**
     * Creates a new vault for a user.
     * @param userId The unique ID of the user
     * @param userPublicKey The public key provided by the user's wallet
     */
    createVault(userId: string, userPublicKey: string): Promise<UnlockedVault>;

    /**
     * Signs a transaction with the App Key if business rules pass.
     * @param tx The transaction object
     * @param userId The requesting user
     */
    coSignTransaction(tx: MultisigTransaction, userId: string): Promise<string>; // Returns signature
}
