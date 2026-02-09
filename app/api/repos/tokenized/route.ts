import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withRateLimit, rateLimitPresets } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * GET /api/repos/tokenized
 *
 * Public endpoint to list all tokenized repositories.
 * Returns repositories that have been claimed and tokenized with their token info.
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - sort: Sort field (default: 'tokenized_at')
 * - order: Sort order 'asc' | 'desc' (default: 'desc')
 * - chain: Filter by chain (BSV, ETH, SOL)
 * - verified: Filter by verification status (true/false)
 *
 * Rate limited: 60 requests per minute (standard preset)
 */
const tokenizedReposHandler = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    // Sorting
    const validSortFields = ['tokenized_at', 'github_stars', 'github_forks', 'token_symbol'];
    const sort = validSortFields.includes(searchParams.get('sort') || '')
      ? searchParams.get('sort')!
      : 'tokenized_at';
    const order = searchParams.get('order') === 'asc' ? true : false; // ascending if true

    // Filters
    const chain = searchParams.get('chain');
    const verified = searchParams.get('verified');

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('tokenized_repositories')
      .select(`
        id,
        github_repo_name,
        github_owner,
        github_full_name,
        github_description,
        github_stars,
        github_forks,
        github_language,
        github_url,
        token_symbol,
        token_chain,
        token_contract_address,
        token_supply,
        verification_level,
        verification_method,
        verified_at,
        has_repo_attestation,
        tokenized_at,
        created_at
      `, { count: 'exact' })
      .eq('is_tokenized', true);

    // Apply filters
    if (chain) {
      query = query.eq('token_chain', chain.toUpperCase());
    }

    if (verified === 'true') {
      query = query.in('verification_level', ['verified_owner', 'repo_attested']);
    } else if (verified === 'false') {
      query = query.or('verification_level.is.null,verification_level.eq.unverified');
    }

    // Apply sorting and pagination
    query = query
      .order(sort, { ascending: order })
      .range(offset, offset + limit - 1);

    const { data: repos, error, count } = await query;

    if (error) {
      console.error('[/api/repos/tokenized] Query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tokenized repositories' },
        { status: 500 }
      );
    }

    // Transform for public API
    const publicRepos = (repos || []).map(repo => ({
      id: repo.id,
      repository: {
        name: repo.github_repo_name,
        owner: repo.github_owner,
        fullName: repo.github_full_name,
        description: repo.github_description,
        language: repo.github_language,
        stars: repo.github_stars,
        forks: repo.github_forks,
        url: repo.github_url,
      },
      token: {
        symbol: repo.token_symbol,
        chain: repo.token_chain,
        contractAddress: repo.token_contract_address,
        totalSupply: repo.token_supply?.toString(),
      },
      verification: {
        level: repo.verification_level || 'unverified',
        method: repo.verification_method,
        verifiedAt: repo.verified_at,
        hasRepoAttestation: repo.has_repo_attestation || false,
      },
      tokenizedAt: repo.tokenized_at,
    }));

    return NextResponse.json({
      repos: publicRepos,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: offset + limit < (count || 0),
      },
      filters: {
        chain: chain || null,
        verified: verified || null,
        sort,
        order: order ? 'asc' : 'desc',
      },
    });
  } catch (error) {
    console.error('[/api/repos/tokenized] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tokenized repositories' },
      { status: 500 }
    );
  }
};

// Apply rate limiting
export const GET = withRateLimit(tokenizedReposHandler, rateLimitPresets.standard);
