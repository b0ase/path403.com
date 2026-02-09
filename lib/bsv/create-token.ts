/**
 * BSV Repo Tokenization Utility
 * 
 * This module provides the core logic for tokenizing GitHub repositories
 * using the BSV-21 (1Sat Ordinals) protocol.
 */

import { deployToken, DeployConfig, DeployResult } from '../bsv-deploy-token';

/**
 * Creates a new BSV-21 token for a repository.
 * 
 * @param params - Token parameters
 * @returns Deployment result including tokenId and transaction hash
 */
export async function createBSVRepoToken(params: {
    symbol: string;
    totalSupply: number;
    description?: string;
    repoUrl?: string;
}): Promise<DeployResult> {
    console.log(`[createBSVRepoToken] Initializing tokenization for ${params.symbol}`);

    // We use the underlying deployToken utility to handle the heavy lifting
    // of UTXO management and inscription creation.
    const config: DeployConfig = {
        symbol: params.symbol,
        totalSupply: params.totalSupply,
        // Future expansion: Add repo metadata as part of the inscription
    };

    try {
        const result = await deployToken(config);
        return result;
    } catch (error) {
        console.error('[createBSVRepoToken] Tokenization error:', error);
        throw error;
    }
}

/**
 * Validates a token symbol for BSV-21.
 * Must be 3-6 uppercase letters.
 */
export function isValidTokenSymbol(symbol: string): boolean {
    return /^[A-Z]{3,6}$/.test(symbol);
}
