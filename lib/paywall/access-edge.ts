// Edge-compatible access token verification for middleware
// Uses jose library instead of jsonwebtoken for Edge runtime compatibility

import { jwtVerify, SignJWT } from 'jose';
import { PAYWALL_CONFIG } from './config';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'paywall-secret'
);

export interface AccessToken {
    handle: string;
    paidAt: number;
    expiresAt: number;
    tokensAwarded: number;
}

// Verify an access token (Edge-compatible)
export async function verifyAccessTokenEdge(token: string): Promise<AccessToken | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);

        const decoded = payload as unknown as AccessToken;

        // Check expiration
        if (decoded.expiresAt < Date.now()) {
            return null;
        }

        return decoded;
    } catch {
        return null;
    }
}

// Generate an access token (Edge-compatible)
export async function generateAccessTokenEdge(handle: string): Promise<string> {
    const now = Date.now();
    const expiresAt = now + (PAYWALL_CONFIG.accessDurationDays * 24 * 60 * 60 * 1000);

    const token = await new SignJWT({
        handle,
        paidAt: now,
        expiresAt,
        tokensAwarded: PAYWALL_CONFIG.tokenReward,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(`${PAYWALL_CONFIG.accessDurationDays}d`)
        .sign(JWT_SECRET);

    return token;
}
