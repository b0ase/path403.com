import { generateOgImage } from '@/lib/og-generator';

export const runtime = 'edge';
export const alt = 'B0ASE - Mint';
export const contentType = 'image/png';

export default async function Image() {
    return generateOgImage('MINT', 'Create digital collectibles');
}
