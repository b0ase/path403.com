import { generateOgImage } from '@/lib/og-generator';

export const runtime = 'edge';
export const alt = 'B0ASE - Components';
export const contentType = 'image/png';

export default async function Image() {
    return generateOgImage('COMPONENTS', 'UI Library & Logic Blocks');
}
