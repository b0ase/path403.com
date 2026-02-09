import { generateOgImage } from '@/lib/og-generator';

export const runtime = 'edge';
export const alt = 'B0ASE - Docs';
export const contentType = 'image/png';

export default async function Image() {
    return generateOgImage('DOCS', 'Documentation & Guides');
}
