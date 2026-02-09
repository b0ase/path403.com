import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Lists for generating random names
const firstNames = [
    "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy",
    "Kyle", "Laura", "Mike", "Nancy", "Oscar", "Pam", "Quinn", "Rachel", "Steve", "Tina"
];

const lastNames = [
    "Smith", "Jones", "Williams", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson",
    "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson", "Clark"
];

function getRandomName(): string {
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${randomFirstName} ${randomLastName}`;
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const founders = await prisma.profiles.findMany({
            select: {
                id: true,
                full_name: true,
                username: true, // Including username for potential future use in links
            },
            // For now, assuming all profiles are founders or we will add a role later.
            // Example: where: { role: 'Founder' }
        });

        // Structure data to match mockFounderCategories for easier integration
        const founderCategories = [
            {
                category: "All Founders",
                founders: founders.map(founder => ({
                    id: founder.id,
                    name: getRandomName(), // Use generated random name
                    founderId: founder.id, // Use the actual founder ID for linking
                })),
            },
        ];

        return NextResponse.json(founderCategories);

    } catch (error) {
        console.error('Error fetching founders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch founders' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
