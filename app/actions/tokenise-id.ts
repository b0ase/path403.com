'use server';

import { prepareIdentityTokenisation } from '@/lib/id-tokeniser-service';
import { Utxo } from 'js-1sat-ord';

export async function tokeniseIdAction(formData: FormData) {
    try {
        const encryptedBase64 = formData.get('encryptedBase64') as string;
        const address = formData.get('address') as string;
        const utxosJson = formData.get('utxos') as string;

        if (!encryptedBase64) throw new Error('No encrypted data provided');
        if (!address) throw new Error('No wallet address provided');
        if (!utxosJson) throw new Error('No UTXOs provided');

        const utxos = JSON.parse(utxosJson) as Utxo[];

        // Zero Knowledge: We receive the data ALREADY encrypted.
        // We treat it as a generic octet stream.

        // Call service to prepare UNSIGNED transactions
        const result = await prepareIdentityTokenisation(encryptedBase64, address, utxos);

        return { success: true, data: result };
    } catch (error) {
        console.error('Tokenisation preparation failed:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
