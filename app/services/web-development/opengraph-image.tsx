import { generateOgImage } from '@/lib/og-generator';

export const runtime = 'edge';
export const alt = 'B0ASE - Web Development';
export const contentType = 'image/png';

export default async function Image() {
    return generateOgImage('WEB DEVELOPMENT', 'Full-Stack Scalable Solutions');
}
