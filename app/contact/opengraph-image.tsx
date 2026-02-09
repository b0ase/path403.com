import { generateOgImage } from '@/lib/og-generator';

export const runtime = 'edge';
export const alt = 'B0ASE - Contact';
export const contentType = 'image/png';

export default async function Image() {
    return generateOgImage('CONTACT', 'Get in touch to build the future');
}
