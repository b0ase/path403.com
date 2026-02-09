import { generateOgImage } from '@/lib/og-generator';

export const runtime = 'edge';
export const alt = 'B0ASE - Dividends';
export const contentType = 'image/png';

export default async function Image() {
    return generateOgImage('DIVIDENDS', 'Real-time revenue sharing');
}
