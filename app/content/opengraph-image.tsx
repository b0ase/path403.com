import { generateOgImage } from '@/lib/og-generator';

export const runtime = 'edge';
export const alt = 'B0ASE - Content';
export const contentType = 'image/png';

export default async function Image() {
    return generateOgImage('CONTENT', 'Digital Strategy & Production');
}
