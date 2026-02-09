import { generateOgImage } from '@/lib/og-generator';

export const runtime = 'edge';
export const alt = 'B0ASE - App Development';
export const contentType = 'image/png';

export default async function Image() {
    return generateOgImage('APP DEVELOPMENT', 'iOS, Android, & Web Apps');
}
