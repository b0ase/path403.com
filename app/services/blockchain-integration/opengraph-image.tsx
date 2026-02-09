import { generateOgImage } from '@/lib/og-generator';

export const runtime = 'edge';
export const alt = 'B0ASE - Blockchain Integration';
export const contentType = 'image/png';

export default async function Image() {
    return generateOgImage('BLOCKCHAIN INTEGRATION', 'Web3 & Smart Contracts');
}
