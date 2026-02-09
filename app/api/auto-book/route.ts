import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

const prisma = getPrisma();

// GET all books
export async function GET() {
    try {
        const books = await prisma.autoBook.findMany({
            orderBy: { createdAt: 'desc' },
            include: { tasks: true }
        });
        return NextResponse.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
    }
}

// POST new book
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, subject, releaseDate } = body;

        const book = await prisma.autoBook.create({
            data: {
                title,
                subject,
                releaseDate: releaseDate ? new Date(releaseDate) : null,
                status: 'DRAFT',
                tasks: {
                    create: [
                        { type: 'RESEARCH', status: 'PENDING' },
                        { type: 'OUTLINE', status: 'PENDING' },
                        { type: 'PROSE', status: 'PENDING' },
                        { type: 'COVER', status: 'PENDING' },
                        { type: 'REVIEW', status: 'PENDING' }
                    ]
                }
            }
        });

        return NextResponse.json(book);
    } catch (error) {
        console.error('Error creating book:', error);
        return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
    }
}
