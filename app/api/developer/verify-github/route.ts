/**
 * Verify GitHub Developer Account API
 *
 * POST /api/developer/verify-github
 * Verifies a GitHub account meets marketplace developer criteria
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPrisma } from '@/lib/prisma';
import {
  verifyGitHubDeveloper,
  getDeveloperLanguages,
  getTopRepositories,
} from '@/lib/github-verification';

const verifySchema = z.object({
  username: z.string().min(1),
  userId: z.string().uuid(),
  accessToken: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = verifySchema.parse(body);

    // Verify GitHub account
    const verificationResult = await verifyGitHubDeveloper(
      data.username,
      data.accessToken
    );

    if (!verificationResult.verified) {
      return NextResponse.json(
        {
          verified: false,
          reasons: verificationResult.reasons,
          accountAge: verificationResult.accountAge,
          publicRepos: verificationResult.publicRepos,
        },
        { status: 400 }
      );
    }

    // Get additional developer data
    const languages = await getDeveloperLanguages(data.username, data.accessToken);
    const topRepos = await getTopRepositories(data.username, 5, data.accessToken);

    const prisma = getPrisma();

    // Update profile with GitHub verification
    await prisma.profiles.update({
      where: { id: data.userId },
      data: {
        github_verified: true,
        github_verified_at: new Date(),
        github_stars: verificationResult.totalStars,
        is_marketplace_developer: true,
      },
    });

    return NextResponse.json({
      verified: true,
      username: verificationResult.username,
      accountAge: verificationResult.accountAge,
      publicRepos: verificationResult.publicRepos,
      totalStars: verificationResult.totalStars,
      totalForks: verificationResult.totalForks,
      languages,
      topRepositories: topRepos,
      profile: verificationResult.profileData,
    });
  } catch (error) {
    console.error('[verify-github] Verification error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Verification failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
