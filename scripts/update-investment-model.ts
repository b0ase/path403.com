
import { PrismaClient } from '@prisma/client';
import { portfolioData } from '../lib/data';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting investment tranche update for ALL projects (Tiered Model)...');

    // Fetch all projects from data.ts
    const allProjects = portfolioData.projects;
    console.log(`Found ${allProjects.length} projects in portfolio.`);

    for (const project of allProjects) {
        console.log(`Processing: ${project.title} (${project.slug})`);

        let tranches: { number: number; target: number; equity: number; description: string }[] = [];

        // Determine Base Price per 1%
        let basePrice = 1000; // Standard Track 1 (£1k for 1%)
        let trackName = 'Standard';

        if (project.slug === 'boase') {
            basePrice = 10000; // Elite Track 1 (£10k for 1%)
            trackName = 'Elite';
        } else if (project.slug === 'bitcoin-corp' || project.slug === 'ninja-punk-girls') {
            // Premium is now same price as Standard Track 1, but we can label it differently if needed
            basePrice = 1000;
            trackName = 'Premium';
        }

        console.log(`  -> Applying ${trackName} Tracks (Base: £${basePrice}/1%)`);

        // Generate 20 Tranches (2 Tracks of 10)
        for (let i = 1; i <= 20; i++) {
            let price = basePrice;
            let track = 1;

            // Track 2 (Tranches 11-20) - 10x Price
            if (i > 10) {
                price = basePrice * 10;
                track = 2;
            }

            tranches.push({
                number: i,
                target: price,
                equity: 1.0, // Always 1% slice
                description: `${trackName} Track ${track} - Tranche ${i}`,
            });
        }

        // Upsert tranches
        for (const t of tranches) {
            if (t.equity === 0) continue; // Avoid divide by zero
            const pricePerPercent = t.target / t.equity;

            try {
                await prisma.funding_tranches.upsert({
                    where: {
                        project_slug_tranche_number: {
                            project_slug: project.slug,
                            tranche_number: t.number,
                        },
                    },
                    update: {
                        target_amount_gbp: t.target,
                        equity_offered: t.equity,
                        price_per_percent: pricePerPercent,
                        name: `Tranche ${t.number}`,
                    },
                    create: {
                        project_slug: project.slug,
                        tranche_number: t.number,
                        name: `Tranche ${t.number}`,
                        description: t.description,
                        target_amount_gbp: t.target,
                        equity_offered: t.equity,
                        price_per_percent: pricePerPercent,
                        status: t.number === 1 ? 'open' : 'upcoming',
                        raised_amount_gbp: 0,
                    },
                });
            } catch (error) {
                console.error(`  - Error updating Tranche ${t.number} for ${project.slug}:`, error);
            }
        }
    }

    console.log('Update complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
