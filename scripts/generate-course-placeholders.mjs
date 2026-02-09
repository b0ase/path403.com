/**
 * Generate placeholder course thumbnail images
 * Uses sharp to create dark tech-style placeholders with text
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../public/images/courses');

// Course thumbnails to generate (using simple ASCII icons to avoid XML issues)
const PLACEHOLDERS = [
  {
    filename: 'pre-commit-cicd.png',
    title: 'PRE-COMMIT',
    subtitle: 'AND CI/CD',
    icon: 'GIT',
    colors: { primary: '#a855f7', secondary: '#22c55e' } // purple + green
  },
  {
    filename: 'nextjs-apps.png',
    title: 'NEXT.JS',
    subtitle: 'APPS',
    icon: 'N',
    colors: { primary: '#ffffff', secondary: '#0070f3' } // white + blue
  },
  {
    filename: 'ai-agents.png',
    title: 'AI AGENTS',
    subtitle: 'BUILD',
    icon: 'AI',
    colors: { primary: '#f97316', secondary: '#8b5cf6' } // orange + violet
  },
  {
    filename: 'full-stack.png',
    title: 'FULL STACK',
    subtitle: 'KINTSUGI',
    icon: 'FS',
    colors: { primary: '#ef4444', secondary: '#f59e0b' } // red + amber
  }
];

async function generatePlaceholder({ filename, title, subtitle, icon, colors }) {
  const width = 1280;
  const height = 720;

  // Create SVG with gradient background and text
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0a0a0a;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#171717;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0a0a0a;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bg)"/>

      <!-- Grid pattern -->
      <g opacity="0.1">
        ${Array.from({length: 20}, (_, i) => `<line x1="${i * 64}" y1="0" x2="${i * 64}" y2="${height}" stroke="${colors.primary}" stroke-width="1"/>`).join('')}
        ${Array.from({length: 12}, (_, i) => `<line x1="0" y1="${i * 60}" x2="${width}" y2="${i * 60}" stroke="${colors.primary}" stroke-width="1"/>`).join('')}
      </g>

      <!-- Accent line top -->
      <rect x="0" y="0" width="${width}" height="4" fill="url(#accent)"/>

      <!-- Icon circle -->
      <circle cx="${width/2}" cy="240" r="80" fill="none" stroke="url(#accent)" stroke-width="3" opacity="0.6"/>
      <text x="${width/2}" y="260" font-family="Arial Black, Arial, sans-serif" font-size="48" font-weight="900" fill="url(#accent)" text-anchor="middle">${icon}</text>

      <!-- Main title -->
      <text x="${width/2}" y="420" font-family="Arial Black, Arial, sans-serif" font-size="96" font-weight="900" fill="url(#accent)" text-anchor="middle" filter="url(#glow)">${title}</text>

      <!-- Subtitle -->
      <text x="${width/2}" y="500" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#9ca3af" text-anchor="middle" letter-spacing="8">${subtitle}</text>

      <!-- Bottom bar -->
      <rect x="0" y="${height - 80}" width="${width}" height="80" fill="rgba(0,0,0,0.8)"/>
      <rect x="0" y="${height - 80}" width="${width}" height="2" fill="url(#accent)" opacity="0.5"/>

      <!-- Course badge -->
      <rect x="40" y="${height - 60}" width="120" height="40" rx="4" fill="${colors.primary}" opacity="0.2"/>
      <rect x="40" y="${height - 60}" width="120" height="40" rx="4" stroke="${colors.primary}" stroke-width="1" fill="none"/>
      <text x="100" y="${height - 33}" font-family="monospace" font-size="14" fill="${colors.primary}" text-anchor="middle">COURSE</text>

      <!-- b0ase branding -->
      <text x="${width - 60}" y="${height - 33}" font-family="monospace" font-size="18" fill="#4b5563" text-anchor="end">b0ase.com</text>

      <!-- Corner accents -->
      <path d="M 0 40 L 0 0 L 40 0" stroke="${colors.primary}" stroke-width="3" fill="none" opacity="0.6"/>
      <path d="M ${width-40} 0 L ${width} 0 L ${width} 40" stroke="${colors.secondary}" stroke-width="3" fill="none" opacity="0.6"/>
      <path d="M 0 ${height-40} L 0 ${height} L 40 ${height}" stroke="${colors.secondary}" stroke-width="3" fill="none" opacity="0.6"/>
      <path d="M ${width-40} ${height} L ${width} ${height} L ${width} ${height-40}" stroke="${colors.primary}" stroke-width="3" fill="none" opacity="0.6"/>
    </svg>
  `;

  const outputPath = path.join(OUTPUT_DIR, filename);

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);

  console.log(`✅ Generated: ${filename}`);
  return outputPath;
}

async function main() {
  console.log('🎨 Generating course placeholder images...\n');

  for (const placeholder of PLACEHOLDERS) {
    try {
      await generatePlaceholder(placeholder);
    } catch (error) {
      console.error(`❌ Failed to generate ${placeholder.filename}:`, error.message);
    }
  }

  console.log('\n✨ Done! Placeholder images created.');
  console.log('📍 Location:', OUTPUT_DIR);
  console.log('\n💡 Run the Gemini retry script later to replace with AI-generated images.');
}

main().catch(console.error);
