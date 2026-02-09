import { generateOgImage } from '@/lib/og-generator';

export const runtime = 'edge';
export const alt = 'B0ASE - Work';
export const contentType = 'image/png';

export default async function Image() {
    return generateOgImage('WORK', 'Case studies & projects');
}
