/**
 * Developer Profile API
 *
 * GET /api/developer/profile - Get developer profile
 * POST /api/developer/profile - Create/update developer profile
 * PUT /api/developer/profile - Update developer profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPrisma } from '@/lib/prisma';

const updateProfileSchema = z.object({
  userId: z.string().uuid(),
  bio: z.string().max(500).optional(),
  skills: z.array(z.string()).optional(),
  hourlyRate: z.number().positive().optional(),
  portfolioUrls: z.array(z.string().url()).max(10).optional(),
  availability: z.enum(['immediate', 'within_week', 'within_month', 'not_available']).optional(),
  website: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const username = searchParams.get('username');

    if (!userId && !username) {
      return NextResponse.json(
        { error: 'userId or username required' },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    const profile = await prisma.profiles.findFirst({
      where: userId ? { id: userId } : { username },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get developer services
    const services = await prisma.developer_services.findMany({
      where: {
        developer_id: profile.id,
        is_active: true,
      },
    });

    // Get payout preferences
    const payoutPreferences = await prisma.payout_preferences.findUnique({
      where: { user_id: profile.id },
    });

    // Get marketplace agents
    const agents = await prisma.agents.findMany({
      where: {
        user_id: profile.id,
        is_marketplace_listed: true,
      },
    });

    return NextResponse.json({
      profile: {
        id: profile.id,
        username: profile.username,
        fullName: profile.full_name,
        bio: profile.bio,
        avatarUrl: profile.avatar_url,
        website: profile.website,
        skills: profile.skills,
        hourlyRate: profile.hourly_rate,
        portfolioUrls: profile.portfolio_urls,
        availability: profile.developer_availability,
        githubVerified: profile.github_verified,
        githubStars: profile.github_stars,
        isMarketplaceDeveloper: profile.is_marketplace_developer,
      },
      services,
      agents,
      payoutPreferences: payoutPreferences
        ? {
            method: payoutPreferences.payout_method,
            verified: payoutPreferences.verified,
          }
        : null,
    });
  } catch (error) {
    console.error('[developer-profile] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = updateProfileSchema.parse(body);

    const prisma = getPrisma();

    // Update profile
    const profile = await prisma.profiles.update({
      where: { id: data.userId },
      data: {
        bio: data.bio,
        skills: data.skills,
        hourly_rate: data.hourlyRate,
        portfolio_urls: data.portfolioUrls,
        developer_availability: data.availability,
        website: data.website,
        is_marketplace_developer: true,
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        username: profile.username,
        bio: profile.bio,
        skills: profile.skills,
        hourlyRate: profile.hourly_rate,
        portfolioUrls: profile.portfolio_urls,
        availability: profile.developer_availability,
      },
    });
  } catch (error) {
    console.error('[developer-profile] POST error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
