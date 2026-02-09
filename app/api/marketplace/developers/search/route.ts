/**
 * Developer Search API
 *
 * GET /api/marketplace/developers/search
 * Search and filter developers with query parameters
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

console.log('[developers-search] Module loaded');

export async function GET(request: NextRequest) {
  try {
    console.log('[developers-search] Endpoint called');
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const skills = searchParams.get('skills')?.split(',').filter(Boolean) || [];
    const minRate = searchParams.get('minRate')
      ? parseFloat(searchParams.get('minRate')!)
      : undefined;
    const maxRate = searchParams.get('maxRate')
      ? parseFloat(searchParams.get('maxRate')!)
      : undefined;
    const availability = searchParams.get('availability'); // 'immediate', 'within_week', 'within_month'
    const minRating = searchParams.get('minRating')
      ? parseFloat(searchParams.get('minRating')!)
      : undefined;
    const sort = searchParams.get('sort') || 'recent'; // 'recent', 'contracts', 'rating'
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const prisma = getPrisma();

    // Build where clause
    const where: any = {
      is_marketplace_developer: true,
      github_verified: true,
    };

    // Skills filter (at least one matching skill)
    if (skills.length > 0) {
      where.skills = {
        hasSome: skills,
      };
    }

    // Hourly rate filter
    if (minRate !== undefined || maxRate !== undefined) {
      where.hourly_rate = {};
      if (minRate !== undefined) {
        where.hourly_rate.gte = minRate;
      }
      if (maxRate !== undefined) {
        where.hourly_rate.lte = maxRate;
      }
    }

    // Availability filter
    if (availability) {
      where.developer_availability = availability;
    }

    // Fetch developers
    let orderBy: any = { created_at: 'desc' }; // Default: recent

    if (sort === 'contracts') {
      // Sort by number of closed contracts (need to count via relation)
      // For now, we'll use a placeholder - in production, use aggregation
      orderBy = { created_at: 'desc' };
    } else if (sort === 'rating') {
      // Sort by average rating (need to calculate from reviews)
      // For now, we'll use a placeholder - in production, use aggregation
      orderBy = { created_at: 'desc' };
    }

    const developers = await prisma.profiles.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      select: {
        id: true,
        username: true,
        full_name: true,
        bio: true,
        skills: true,
        hourly_rate: true,
        portfolio_urls: true,
        developer_availability: true,
        github_verified: true,
        github_stars: true,
        created_at: true,
      },
    });

    // Get total count for pagination
    const total = await prisma.profiles.count({ where });

    // Format response
    const results = developers.map((dev) => ({
      id: dev.id,
      username: dev.username,
      humanName: dev.full_name,
      bio: dev.bio,
      skills: dev.skills || [],
      hourlyRate: dev.hourly_rate?.toString(),
      portfolioUrls: dev.portfolio_urls || [],
      availability: dev.developer_availability,
      githubVerified: dev.github_verified,
      githubStars: dev.github_stars,
      profileUrl: `/contracts/developers/${dev.username}`,
      closedContracts: 0, // TODO: Calculate from marketplace_contracts
      averageRating: 0, // TODO: Calculate from contract_reviews
    }));

    return NextResponse.json({
      results,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('[developers-search] Error:', error);
    console.error('[developers-search] Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('[developers-search] Error message:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      {
        error: 'Failed to search developers',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
