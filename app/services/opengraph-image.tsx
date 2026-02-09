import { generateOgImage } from '@/lib/og-generator';

export const runtime = 'edge';
export const alt = 'B0ASE - Services';
export const contentType = 'image/png';

export default async function Image() {
    return generateOgImage('SERVICES', 'Web3, AI, & Digital Product Development');
}
