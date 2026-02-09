const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Banner config - matches existing Bitcoin app style
// Bitcoin App Color Guide - inferred from existing apps and user guidance
// Writer: Orange (#FF6600), Drive: Green (#00FF00), Email: Red (#E53935)
// Spreadsheet: Blue (#2196F3), Code: Green, Chat: Dark Blue, Calendar: Purple/Magenta
// 3D: Hot Pink, Social: Orange (#F7931A)
const apps = [
  { name: 'Art', subtitle: 'Digital Art Creation on the Blockchain', color: '#9B59B6' },      // Purple - creative
  { name: 'Paint', subtitle: 'Creative Canvas on Bitcoin', color: '#E91E63' },               // Pink - artistic
  { name: 'Radio', subtitle: 'Decentralized Audio Streaming', color: '#E74C3C' },            // Red - audio/broadcast
  { name: 'Code', subtitle: 'Development Environment on Bitcoin', color: '#00FF00' },        // Green - terminal (user confirmed)
  { name: 'Chat', subtitle: 'Encrypted Messaging on Bitcoin', color: '#1E5799' },            // Dark Blue (user confirmed)
  { name: 'Education', subtitle: 'Learn and Earn on the Blockchain', color: '#F1C40F' },     // Yellow/Gold - knowledge
  { name: 'Identity', subtitle: 'Self-Sovereign Identity on Bitcoin', color: '#1ABC9C' },    // Teal - trust/security
  { name: 'Maps', subtitle: 'Decentralized Location Services', color: '#27AE60' },           // Green - nature/maps
  { name: 'Photos', subtitle: 'Immutable Photo Storage on Bitcoin', color: '#E91E63' },      // Pink - vibrant/visual
  { name: 'Jobs', subtitle: 'Decentralized Job Marketplace', color: '#00BCD4' },             // Cyan - professional
  { name: 'Calendar', subtitle: 'Scheduling and Events on Bitcoin', color: '#9C27B0' },      // Purple/Magenta (user confirmed)
  { name: '3D', subtitle: '3D Creation and NFTs on Bitcoin', color: '#FF1493' },             // Hot Pink (user confirmed)
  { name: 'DNS', subtitle: 'Decentralized Name Service', color: '#4CAF50' },                 // Green - technical
  { name: 'Browser', subtitle: 'Web3 Browser for Bitcoin', color: '#2196F3' },               // Blue - web
  { name: 'Gaming', subtitle: 'Play-to-Earn Gaming on Bitcoin', color: '#FF5722' },          // Deep Orange - fun/gaming
  { name: 'Social', subtitle: 'Decentralized Social Network', color: '#F7931A' },            // Bitcoin Orange (confirmed)
  { name: 'Books', subtitle: 'E-Books and Publishing on Bitcoin', color: '#8D6E63' },        // Brown - books/paper
  { name: 'Marketplace', subtitle: 'Buy and Sell with Bitcoin', color: '#FFC107' },          // Gold - commerce
  { name: 'Exchange', subtitle: 'Decentralized Token Trading', color: '#26C6DA' },           // Teal/Cyan - finance
];

const WIDTH = 1700;
const HEIGHT = 480;

async function generateBanner(app) {
  const slug = `bitcoin-${app.name.toLowerCase().replace(' ', '-')}`;

  const svg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&amp;display=swap');
        </style>
      </defs>
      <rect width="100%" height="100%" fill="#000000"/>
      <text x="50%" y="45%" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="120" font-weight="300">
        <tspan fill="${app.color}">Bitcoin</tspan>
        <tspan fill="#FFFFFF" dx="20">${app.name}</tspan>
      </text>
      <text x="50%" y="62%" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="36" font-style="italic" fill="#888888">
        ${app.subtitle}
      </text>
    </svg>
  `;

  const outputPath = path.join(__dirname, '..', 'public', 'images', 'bitcoin-os', `${slug}.png`);

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);

  console.log(`Generated: ${slug}.png`);
}

async function main() {
  const outputDir = path.join(__dirname, '..', 'public', 'images', 'bitcoin-os');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const app of apps) {
    await generateBanner(app);
  }

  console.log('\nAll banners generated!');
}

main().catch(console.error);
