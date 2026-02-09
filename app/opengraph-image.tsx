import { generateOgImage } from '@/lib/og-generator';

export const runtime = 'edge';
export const alt = 'B0ASE - Venture Studio';
export const contentType = 'image/png';

export default async function Image() {
    return generateOgImage('VENTURE STUDIO', 'Building companies from concept to exit');
}
