import { cookies } from 'next/headers';
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

// Generate an access token after payment
export async function generateAccessToken(handle: string): Promise<string> {
    const now = Date.now();
    const expiresAt = now + (PAYWALL_CONFIG.accessDurationDays * 24 * 60 * 60 * 1000);

    const token = await new SignJWT({
        handle,
        paidAt: now,
        expiresAt,
        tokensAwarded: PAYWALL_CONFIG.tokenReward,
    } as AccessToken)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(`${PAYWALL_CONFIG.accessDurationDays}d`)
        .sign(JWT_SECRET);

    return token;
}

// Verify an access token
export async function verifyAccessToken(token: string): Promise<AccessToken | null> {
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

// Check if user has valid access (server-side)
export async function hasValidAccess(): Promise<{ valid: boolean; access?: AccessToken }> {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get(PAYWALL_CONFIG.accessCookieName)?.value;

        if (!accessToken) {
            return { valid: false };
        }

        const access = await verifyAccessToken(accessToken);
        if (!access) {
            return { valid: false };
        }

        return { valid: true, access };
    } catch {
        return { valid: false };
    }
}

// Set access cookie (server-side)
export async function setAccessCookie(token: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(PAYWALL_CONFIG.accessCookieName, token, {
        httpOnly: false,  // Must be false so JavaScript can check it
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: PAYWALL_CONFIG.accessDurationDays * 24 * 60 * 60,
        path: '/',
    });
}
