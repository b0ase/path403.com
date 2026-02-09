import { generateOgImage } from '@/lib/og-generator';

export const runtime = 'edge';
export const alt = 'B0ASE - Market';
export const contentType = 'image/png';

export default async function Image() {
    return generateOgImage('MARKET', 'Digital assets marketplace');
}
