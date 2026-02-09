/**
 * Seed Funding Tranches Script
 *
 * Populates the funding_tranches table with default tranches for all projects.
 * Each project gets 10 tranches representing standard development phases.
 *
 * Run: npx ts-node scripts/seed-funding-tranches.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Standard development phases - these apply to most software projects
const standardTranches = [
  { name: 'Foundation', description: 'Project setup, architecture, and core infrastructure' },
  { name: 'Core Features', description: 'Primary functionality and MVP features' },
  { name: 'User Interface', description: 'UI/UX design implementation and polish' },
  { name: 'Data & Storage', description: 'Database integration, state management, and persistence' },
  { name: 'Authentication', description: 'User auth, permissions, and security features' },
  { name: 'API & Integration', description: 'External APIs, third-party integrations' },
  { name: 'Blockchain', description: 'BSV blockchain integration and token functionality' },
  { name: 'Testing & QA', description: 'Comprehensive testing, bug fixes, and optimization' },
  { name: 'Documentation', description: 'User guides, API docs, and developer documentation' },
  { name: 'Launch & Scale', description: 'Production deployment, monitoring, and scaling' },
];

// All projects from lib/data.ts that should have funding tranches
const projects = [
  // Bitcoin OS Apps (Open Source)
  { slug: 'bitcoin-email', category: 'bitcoin-app' },
  { slug: 'bitcoin-os', category: 'bitcoin-os' },
  { slug: 'bitcoin-drive', category: 'bitcoin-app' },
  { slug: 'bitcoin-spreadsheets', category: 'bitcoin-app' }, // Already has tranches - skip
  { slug: 'bitcoin-writer', category: 'bitcoin-app' },
  { slug: 'bitcoin-music', category: 'bitcoin-app' },
  { slug: 'bitcoin-file-utility', category: 'bitcoin-app' },
  { slug: 'bitcoin-art', category: 'bitcoin-app' },
  { slug: 'bitcoin-paint', category: 'bitcoin-app' },
  { slug: 'bitcoin-radio', category: 'bitcoin-app' },
  { slug: 'bitcoin-code', category: 'bitcoin-app' },
  { slug: 'bitcoin-chat', category: 'bitcoin-app' },
  { slug: 'bitcoin-education', category: 'bitcoin-app' },
  { slug: 'bitcoin-identity', category: 'bitcoin-app' },
  { slug: 'bitcoin-maps', category: 'bitcoin-app' },
  { slug: 'bitcoin-photos', category: 'bitcoin-app' },
  { slug: 'bitcoin-jobs', category: 'bitcoin-app' },
  { slug: 'bitcoin-calendar', category: 'bitcoin-app' },
  { slug: 'bitcoin-3d', category: 'bitcoin-app' },
  { slug: 'bitcoin-dns-app', category: 'bitcoin-app' },
  { slug: 'bitcoin-browser', category: 'bitcoin-app' },
  { slug: 'bitcoin-gaming', category: 'bitcoin-app' },
  { slug: 'bitcoin-social', category: 'bitcoin-app' },
  { slug: 'bitcoin-books', category: 'bitcoin-app' },
  { slug: 'bitcoin-marketplace', category: 'bitcoin-app' },
  { slug: 'bitcoin-exchange-app', category: 'bitcoin-app' },

  // Commercial Projects
  { slug: 'aibuildersclub-website', category: 'website' },
  { slug: 'aigirlfriends-website', category: 'website' },
  { slug: 'aivj-website', category: 'website' },
  { slug: 'audex-website', category: 'website' },
  { slug: 'beauty-queen-ai-com', category: 'website' },
  { slug: 'bitcdn-website', category: 'website' },
  { slug: 'bitdns-website', category: 'website' },
  { slug: 'bsvapi-com', category: 'website' },
  { slug: 'bsvex-com', category: 'website' },
  { slug: 'cashboard-website', category: 'website' },
  { slug: 'cashhandletoken-store', category: 'ecommerce' },
  { slug: 'coursekings-website', category: 'website' },
  { slug: 'dns-dex', category: 'defi' },
  { slug: 'divvy', category: 'app' },
  { slug: 'floop', category: 'defi' },
  { slug: 'future-of-blockchain-research', category: 'website' },
  { slug: 'kintsugi', category: 'app' },
  { slug: 'libertascoffee-store', category: 'ecommerce' },
  { slug: 'mayu-dog-care-website', category: 'website' },
  { slug: 'metagraph-app', category: 'app' },
  { slug: 'mikrocosm-com', category: 'website' },
  { slug: 'minecraftparty-website', category: 'website' },
  { slug: 'moneybutton-store', category: 'ecommerce' },
  { slug: 'npg-red', category: 'nft' },
  { slug: 'npgx-website', category: 'nft' },
  { slug: 'oneshotcomics', category: 'nft' },
  { slug: 'osinka-kalaso', category: 'website' },
  { slug: 'overnerd-website', category: 'website' },
  { slug: 'rafskitchen-website', category: 'website' },
  { slug: 'repository-tokenizer', category: 'app' },
  { slug: 'robust-ae-com', category: 'website' },
  { slug: 'senseii-zeta.vercel.app', category: 'app' },
  { slug: 'v01d-store', category: 'ecommerce' },
  { slug: 'vexvoid-av-client', category: 'app' },
  { slug: 'vexvoid-com', category: 'website' },
  { slug: 'websitestrategypro2025', category: 'website' },
  { slug: 'zerodice-store', category: 'ecommerce' },
  { slug: 'cherry-x', category: 'app' },
  { slug: 'penshun', category: 'app' },
  { slug: 'weight', category: 'app' },
  { slug: 'yourcash', category: 'app' },
  { slug: 'index-token', category: 'defi' },
  { slug: 'wordpress-design-london', category: 'website' },
];

// Category-specific tranche customizations
function getTrancheDetails(trancheIndex: number, category: string) {
  const base = standardTranches[trancheIndex];

  // Customize descriptions based on project category
  const customizations: Record<string, Record<number, { name?: string; description?: string }>> = {
    'bitcoin-app': {
      0: { description: 'React/Next.js setup, BSV SDK integration, wallet connectivity' },
      6: { name: 'Token Economics', description: 'BSV-20 token integration, on-chain data, micro-transactions' },
    },
    'bitcoin-os': {
      0: { description: 'Operating system kernel, process management, file system' },
      1: { description: 'Window manager, app launcher, system services' },
      6: { description: 'Native BSV wallet, on-chain file storage, identity management' },
    },
    'nft': {
      0: { description: 'Smart contract development, metadata standards, minting infrastructure' },
      1: { description: 'Collection generation, trait system, rarity distribution' },
      6: { name: 'Marketplace', description: 'NFT marketplace integration, trading, royalties' },
    },
    'defi': {
      0: { description: 'Smart contract architecture, security audit preparation' },
      1: { description: 'Core DeFi mechanics, liquidity pools, swaps' },
      6: { name: 'Tokenomics', description: 'Token distribution, staking, governance' },
    },
    'ecommerce': {
      0: { description: 'E-commerce platform setup, product catalog, inventory' },
      1: { description: 'Shopping cart, checkout flow, order management' },
      6: { name: 'Payments', description: 'Payment gateway integration, BSV payments, multi-currency' },
    },
  };

  const categoryCustom = customizations[category]?.[trancheIndex] || {};

  return {
    name: categoryCustom.name || base.name,
    description: categoryCustom.description || base.description,
  };
}

async function seedTranches() {
  console.log('Starting tranche seeding...\n');

  let created = 0;
  let skipped = 0;

  for (const project of projects) {
    // Check if project already has tranches
    const existingTranches = await prisma.funding_tranches.findMany({
      where: { project_slug: project.slug },
    });

    if (existingTranches.length > 0) {
      console.log(`⏭️  ${project.slug}: Already has ${existingTranches.length} tranches, skipping`);
      skipped++;
      continue;
    }

    console.log(`📊 ${project.slug}: Creating 10 tranches...`);

    // Create 10 tranches for this project
    for (let i = 0; i < 10; i++) {
      const details = getTrancheDetails(i, project.category);

      await prisma.funding_tranches.create({
        data: {
          project_slug: project.slug,
          tranche_number: i + 1,
          name: `Tranche ${i + 1}: ${details.name}`,
          description: details.description,
          target_amount_gbp: 999, // £999 per tranche
          raised_amount_gbp: 0,
          price_per_percent: 999, // £999 per 1%
          equity_offered: 1, // 1% per tranche
          status: i === 0 ? 'open' : 'upcoming', // First tranche open, rest upcoming
        },
      });
    }

    created++;
    console.log(`   ✅ Created 10 tranches for ${project.slug}`);
  }

  console.log(`\n✨ Seeding complete!`);
  console.log(`   Created tranches for: ${created} projects`);
  console.log(`   Skipped (already had tranches): ${skipped} projects`);
}

async function main() {
  try {
    await seedTranches();
  } catch (error) {
    console.error('Error seeding tranches:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
