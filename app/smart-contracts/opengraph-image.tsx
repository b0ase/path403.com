import { generateOgImage } from '@/lib/og-generator';

export const runtime = 'edge';
export const alt = 'B0ASE - Smart Contracts';
export const contentType = 'image/png';

export default async function Image() {
    return generateOgImage('SMART CONTRACTS', 'Secure, audited on-chain agreements');
}
