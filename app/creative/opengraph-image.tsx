import { generateOgImage } from '@/lib/og-generator';

export const runtime = 'edge';
export const alt = 'B0ASE - Creative';
export const contentType = 'image/png';

export default async function Image() {
    return generateOgImage('CREATIVE', 'Digital art, video, & design');
}
