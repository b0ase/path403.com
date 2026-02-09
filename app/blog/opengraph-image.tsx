import { generateOgImage } from '@/lib/og-generator';

export const runtime = 'edge';
export const alt = 'B0ASE - Blog';
export const contentType = 'image/png';

export default async function Image() {
    return generateOgImage('BLOG', 'Insights on AI, Web3, & Ventures');
}
