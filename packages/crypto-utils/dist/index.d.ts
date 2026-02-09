/**
 * @b0ase/crypto-utils
 *
 * Common cryptographic utilities for hashing, encoding, and key operations.
 *
 * @packageDocumentation
 */
/** Hash algorithm */
type HashAlgorithm = 'sha256' | 'sha512' | 'sha1' | 'md5' | 'ripemd160';
/** Encoding type */
type EncodingType = 'hex' | 'base64' | 'base58' | 'utf8';
/** Key type */
type KeyType = 'private' | 'public' | 'extended';
/** Network type */
type NetworkType = 'mainnet' | 'testnet';
/** Key pair */
interface KeyPair {
    privateKey: string;
    publicKey: string;
    address?: string;
}
/** Extended key */
interface ExtendedKey {
    key: string;
    chainCode: string;
    depth: number;
    index: number;
    parentFingerprint: string;
}
/** Signature */
interface Signature {
    r: string;
    s: string;
    recovery?: number;
}
/** Verification result */
interface VerificationResult {
    valid: boolean;
    publicKey?: string;
    error?: string;
}
declare const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
declare const HEX_CHARS = "0123456789abcdef";
declare const ADDRESS_VERSIONS: {
    readonly mainnet: {
        readonly p2pkh: 0;
        readonly p2sh: 5;
        readonly wif: 128;
    };
    readonly testnet: {
        readonly p2pkh: 111;
        readonly p2sh: 196;
        readonly wif: 239;
    };
};
declare function hexToBytes(hex: string): Uint8Array;
declare function bytesToHex(bytes: Uint8Array): string;
declare function isValidHex(str: string): boolean;
declare function reverseHex(hex: string): string;
declare function base64Encode(bytes: Uint8Array): string;
declare function base64Decode(str: string): Uint8Array;
declare function base64UrlEncode(bytes: Uint8Array): string;
declare function base64UrlDecode(str: string): Uint8Array;
declare function base58Encode(bytes: Uint8Array): string;
declare function base58Decode(str: string): Uint8Array;
declare function isValidBase58(str: string): boolean;
declare function base58CheckEncode(payload: Uint8Array): string;
declare function base58CheckDecode(str: string): Uint8Array;
declare function isValidBase58Check(str: string): boolean;
declare function sha256(data: Uint8Array): Uint8Array;
declare function sha256d(data: Uint8Array): Uint8Array;
declare function sha256Hex(data: string | Uint8Array): string;
declare function ripemd160(data: Uint8Array): Uint8Array;
declare function hash160(data: Uint8Array): Uint8Array;
declare function hash160Hex(data: string | Uint8Array): string;
declare function publicKeyToAddress(publicKey: string, network?: NetworkType): string;
declare function addressToHash160(address: string): string;
declare function isValidAddress(address: string, network?: NetworkType): boolean;
declare function getAddressType(address: string): 'p2pkh' | 'p2sh' | null;
declare function privateKeyToWIF(privateKey: string, compressed?: boolean, network?: NetworkType): string;
declare function wifToPrivateKey(wif: string): {
    privateKey: string;
    compressed: boolean;
    network: NetworkType;
};
declare function isValidWIF(wif: string): boolean;
declare function randomBytes(length: number): Uint8Array;
declare function randomHex(length: number): string;
declare function generateId(length?: number): string;
declare function constantTimeCompare(a: Uint8Array, b: Uint8Array): boolean;
declare function secureZero(data: Uint8Array): void;

export { ADDRESS_VERSIONS, BASE58_ALPHABET, type EncodingType, type ExtendedKey, HEX_CHARS, type HashAlgorithm, type KeyPair, type KeyType, type NetworkType, type Signature, type VerificationResult, addressToHash160, base58CheckDecode, base58CheckEncode, base58Decode, base58Encode, base64Decode, base64Encode, base64UrlDecode, base64UrlEncode, bytesToHex, constantTimeCompare, generateId, getAddressType, hash160, hash160Hex, hexToBytes, isValidAddress, isValidBase58, isValidBase58Check, isValidHex, isValidWIF, privateKeyToWIF, publicKeyToAddress, randomBytes, randomHex, reverseHex, ripemd160, secureZero, sha256, sha256Hex, sha256d, wifToPrivateKey };
