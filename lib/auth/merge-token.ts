import { SignJWT, jwtVerify } from 'jose';

const MERGE_TOKEN_SECRET = new TextEncoder().encode(
    process.env.SUPABASE_JWT_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'fallback_secret_do_not_use_in_prod'
);

export interface MergeTokenPayload {
    source_user_id: string; // The user to be merged FROM (e.g. the Twitter user)
    target_user_id: string; // The user to be merged INTO (e.g. the currently logged in user)
    provider: string;       // Verification method (e.g. 'twitter')
}

export async function createMergeToken(payload: MergeTokenPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('10m') // Token valid for 10 minutes
        .sign(MERGE_TOKEN_SECRET);
}

export async function verifyMergeToken(token: string): Promise<MergeTokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, MERGE_TOKEN_SECRET);
        return payload as unknown as MergeTokenPayload;
    } catch (error) {
        console.error('Merge token verification failed:', error);
        return null;
    }
}
