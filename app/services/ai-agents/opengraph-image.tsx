import { generateOgImage } from '@/lib/og-generator';

export const runtime = 'edge';
export const alt = 'B0ASE - AI Agents';
export const contentType = 'image/png';

export default async function Image() {
    return generateOgImage('AI AGENTS', 'Autonomous Workforce Solutions');
}
