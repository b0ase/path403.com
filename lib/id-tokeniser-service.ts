
import { PrivateKey, Script } from '@bsv/sdk';
import { createOrdinals, deployBsv21Token, Utxo } from 'js-1sat-ord';
import crypto from 'crypto';

const MOCK_MAX_SUPPLY = 21000000;

export interface TokenisePreparationResult {
    inscriptionTxHex: string;
    tokenTxHex: string;
    encryptedHash: string;
    symbol: string;
    inscriptionTxid: string; // Calculated ahead of time
    tokenId: string;         // Calculated ahead of time
}

/**
 * Prepare Identity Tokenisation (Unsigned)
 * 
 * 1. Accpets ALREADY ENCRYPTED data from client (Zero Knowledge).
 * 2. Creates an UNSIGNED inscription transaction using user's UTXOs.
 * 3. Creates an UNSIGNED token deployment transaction using user's UTXOs.
 */
export async function prepareIdentityTokenisation(
    encryptedBase64: string,
    userAddress: string,
    userUtxos: Utxo[]
): Promise<TokenisePreparationResult> {

    if (!userUtxos || userUtxos.length === 0) {
        throw new Error('No UTXOs provided. Please fund your wallet.');
    }

    // 1. Calculate SHA-256 Hash of the encrypted data (for verification/symbol)
    const hash = crypto.createHash('sha256').update(encryptedBase64).digest('hex');
    const shortHash = hash.substring(0, 8).toUpperCase();
    const tokenSymbol = `ID-${shortHash}`;

    console.log(`[ID-Tokeniser] Preparing for ${userAddress}. Hash: ${hash}`);

    // 2. Prepare Inscription TX (Unsigned)
    const inscriptionConfig = {
        utxos: userUtxos,
        destinations: [
            {
                address: userAddress,
                inscription: {
                    dataB64: encryptedBase64,
                    contentType: 'application/octet-stream', // Generic encrypted binary
                },
            },
        ],
        changeAddress: userAddress,
        signInputs: false // Ask library not to sign
    };

    const { tx: inscriptionTx, payChange } = await createOrdinals(inscriptionConfig);
    const inscriptionTxHex = inscriptionTx.toHex();
    const inscriptionTxid = inscriptionTx.id('hex'); // Calculate ID

    // 3. Prepare Token Deployment TX (Unsigned)
    // Chain the change output from inscription TX to the token TX

    const nextUtxos: Utxo[] = [];
    if (payChange) {
        nextUtxos.push(payChange);
    }

    if (nextUtxos.length === 0) {
        throw new Error('Insufficient funds/UTXOs to chain transactions. Please ensure you have multiple UTXOs or enough funds.');
    }

    // Token Icon
    const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#000"/><text x="50" y="50" font-family="monospace" font-size="10" fill="#fff" text-anchor="middle">ID</text><text x="50" y="65" font-family="monospace" font-size="6" fill="#666" text-anchor="middle">${shortHash}</text></svg>`;
    const iconB64 = Buffer.from(iconSvg).toString('base64');

    const { tx: deployTx } = await deployBsv21Token({
        symbol: tokenSymbol,
        icon: {
            dataB64: iconB64,
            contentType: 'image/svg+xml'
        },
        utxos: nextUtxos, // Chain the change
        initialDistribution: {
            address: userAddress,
            tokens: MOCK_MAX_SUPPLY
        },
        destinationAddress: userAddress,
        changeAddress: userAddress,
        satsPerKb: 1,
        signInputs: false
    });

    const tokenTxHex = deployTx.toHex();
    const tokenTxid = deployTx.id('hex');
    const tokenId = `${tokenTxid}_0`;

    return {
        inscriptionTxHex,
        tokenTxHex,
        encryptedHash: hash,
        symbol: tokenSymbol,
        inscriptionTxid,
        tokenId
    };
}
