import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Database Statistics API
 * Returns row counts and size estimates for all tables
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const secretParam = searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET;

    const isAuthorized = authHeader === `Bearer ${cronSecret}` ||
                         secretParam === cronSecret ||
                         process.env.NODE_ENV === 'development';

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrisma();

    // Get row counts for major tables using Prisma
    const stats: Record<string, number> = {};

    // Core tables
    const counts = await Promise.allSettled([
      prisma.profiles.count().then(c => ({ profiles: c })),
      prisma.agents.count().then(c => ({ agents: c })),
      prisma.agent_tasks.count().then(c => ({ agent_tasks: c })),
      prisma.agent_inscriptions.count().then(c => ({ agent_inscriptions: c })),
      prisma.projects.count().then(c => ({ projects: c })),
      prisma.blog_posts.count().then(c => ({ blog_posts: c })),
      prisma.content_ideas.count().then(c => ({ content_ideas: c })),
      prisma.identity_tokens.count().then(c => ({ identity_tokens: c })),
      prisma.clients.count().then(c => ({ clients: c })),
      prisma.audio.count().then(c => ({ audio: c })),
      prisma.video.count().then(c => ({ video: c })),
      prisma.autoBook.count().then(c => ({ autoBook: c })),
      prisma.autoBookChapter.count().then(c => ({ autoBookChapter: c })),
      prisma.boardroom_proposals.count().then(c => ({ boardroom_proposals: c })),
      prisma.boardroom_votes.count().then(c => ({ boardroom_votes: c })),
      prisma.boardroom_members.count().then(c => ({ boardroom_members: c })),
      prisma.user_wallets.count().then(c => ({ user_wallets: c })),
      prisma.service_contracts.count().then(c => ({ service_contracts: c })),
      prisma.contract_milestones.count().then(c => ({ contract_milestones: c })),
    ]);

    counts.forEach(result => {
      if (result.status === 'fulfilled') {
        Object.assign(stats, result.value);
      }
    });

    // Get actual database size using raw SQL
    let dbSize = null;
    try {
      const sizeResult = await prisma.$queryRaw<[{ pg_database_size: bigint }]>`
        SELECT pg_database_size(current_database())
      `;
      dbSize = Number(sizeResult[0]?.pg_database_size) || null;
    } catch (e) {
      console.warn('Could not get database size:', e);
    }

    // Get table sizes
    let tableSizes: { table_name: string; size_bytes: bigint }[] = [];
    try {
      tableSizes = await prisma.$queryRaw<{ table_name: string; size_bytes: bigint }[]>`
        SELECT
          tablename as table_name,
          pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename)) as size_bytes
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY size_bytes DESC
        LIMIT 30
      `;
    } catch (e) {
      console.warn('Could not get table sizes:', e);
    }

    const totalRows = Object.values(stats).reduce((a, b) => a + b, 0);

    // Format sizes
    const formatBytes = (bytes: number) => {
      if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
      if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
      if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
      return `${bytes} bytes`;
    };

    return NextResponse.json({
      success: true,
      database: {
        sizeBytes: dbSize,
        sizeFormatted: dbSize ? formatBytes(dbSize) : 'Unknown',
      },
      tables: {
        rowCounts: stats,
        totalRows,
        tableCount: Object.keys(stats).length,
      },
      topTablesBySize: tableSizes.slice(0, 15).map(t => ({
        name: t.table_name,
        sizeBytes: Number(t.size_bytes),
        sizeFormatted: formatBytes(Number(t.size_bytes))
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Database Stats] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
