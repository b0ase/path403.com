
import { PrismaClient } from '@prisma/client';
import { portfolioData } from '../lib/data';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting investment tranche update for Bitcoin apps...');

    // 1. Identify Bitcoin Apps
    // Filter projects that have "Bitcoin" in their title or slug
    const bitcoinProjects = portfolioData.projects.filter(p =>
        p.title.toLowerCase().includes('bitcoin') ||
        p.slug.toLowerCase().includes('bitcoin')
    );

    console.log(`Found ${bitcoinProjects.length} Bitcoin projects.`);

    for (const project of bitcoinProjects) {
        console.log(`Processing: ${project.title} (${project.slug})`);

        // Define the standardized tranches
        const tranches = [
            {
                number: 1,
                target: 999,
                equity: 9,
                description: 'Seed Tranche - Initial Funding',
            },
            {
                number: 2,
                target: 2000,
                equity: 4.5,
                description: 'Second Tranche - Development Phase',
            },
            {
                number: 3,
                target: 4000,
                equity: 2.25,
                description: 'Third Tranche - Growth Phase',
            },
            // You can add more tranches here if the pattern continues (doubling target, halving equity)
            {
                number: 4,
                target: 8000,
                equity: 1.125,
                description: 'Fourth Tranche - Scaling Phase',
            }
        ];

        for (const t of tranches) {
            // Calculate price per percent for data integrity
            const pricePerPercent = t.target / t.equity;

            // Upsert the tranche
            // We use a composite unique key if one exists, or logically find it.
            // The schema has @@unique([project_slug, tranche_number])

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
                        // We don't overwrite raised_amount_gbp or status if it exists, to preserve history if any.
                        // But if the user wants to RESET, we might need to be more aggressive. 
                        // The prompt says "update... so we're not all over the place". 
                        // Assuming we want to ENFORCE these values.
                    },
                    create: {
                        project_slug: project.slug,
                        tranche_number: t.number,
                        name: `Tranche ${t.number}`,
                        description: t.description,
                        target_amount_gbp: t.target,
                        equity_offered: t.equity,
                        price_per_percent: pricePerPercent,
                        status: t.number === 1 ? 'open' : 'upcoming', // Default first one to open if new
                        raised_amount_gbp: 0,
                    },
                });
                // console.log(`  - Tranche ${t.number} updated.`);
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
