import { generateOgImage } from '@/lib/og-generator';

export const runtime = 'edge';
export const alt = 'B0ASE - Web Design';
export const contentType = 'image/png';

export default async function Image() {
    return generateOgImage('WEB DESIGN', 'UI/UX & Digital Brand Identity');
}
