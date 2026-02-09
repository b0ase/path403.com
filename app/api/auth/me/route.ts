/**
 * Get Current User API
 *
 * GET /api/auth/me
 * Returns the currently authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPrisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Parse session data (implement your session logic here)
    // For now, returning a mock user for development
    // In production, decode JWT or fetch from session store

    const prisma = getPrisma();

    // TODO: Replace with actual session handling
    // This is a placeholder - you'll need to implement proper session validation
    const userId = sessionCookie.value; // Assuming session cookie contains user ID

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error('[auth/me] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
