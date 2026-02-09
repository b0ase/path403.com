
/**
 * Kintsugi Crypto Utilities
 * Handles encryption/decryption of chat logs for on-chain storage.
 */

/**
 * Encrypts a string using AES-GCM with a provided key.
 * @param text The text to encrypt
 * @param secret The secret key (as a string)
 * @returns Encrypted data as base64 string
 */
export async function encryptChat(text: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    // Hash the secret to ensure it's a valid key length
    const keyBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(secret));
    const key = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts a base64 string using AES-GCM.
 * @param base64 The encrypted data
 * @param secret The secret key
 */
export async function decryptChat(base64: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const combined = new Uint8Array(
        atob(base64).split('').map(c => c.charCodeAt(0))
    );

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const keyBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(secret));
    const key = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
    );

    return decoder.decode(decrypted);
}
