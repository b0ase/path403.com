import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Allow up to 5 minutes for backup

/**
 * Daily Database Backup
 *
 * This cron job runs daily at 3 AM UTC to:
 * 1. Export critical tables to JSON
 * 2. Store backup in Supabase Storage (backups bucket)
 * 3. Delete backups older than 7 days
 *
 * Trigger: Vercel Cron at "0 3 * * *"
 * Manual: GET /api/cron/database-backup?secret=CRON_SECRET
 */

// Critical tables to backup (using actual table names from schema)
const TABLES_TO_BACKUP = [
  'profiles',
  'agents',
  'agent_tasks',
  'agent_inscriptions',
  'agent_conversations',
  'agent_messages',
  'projects',
  'blog_posts',
  'blog_categories',
  'content_ideas',
  'identity_tokens',
  'token_market_data',
  'token_trades',
  'developer_token_holders',
  'service_contracts',
  'contract_milestones',
  'contract_escrow',
  'boardroom_proposals',
  'boardroom_votes',
  'boardroom_members',
  'user_wallets',
  'clients',
  'Audio',
  'Video',
  'AutoBook',
  'AutoBookChapter',
];

const RETENTION_DAYS = 7;

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const secretParam = searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET;

    const isVercelCron = authHeader === `Bearer ${cronSecret}`;
    const isManualWithSecret = secretParam === cronSecret;

    // Security: Always require authentication, even in development
    // Database backups are sensitive operations that should never bypass auth
    if (!isVercelCron && !isManualWithSecret) {
      return NextResponse.json(
        { error: 'Unauthorized. Provide valid CRON_SECRET.' },
        { status: 401 }
      );
    }

    console.log('[Database Backup] Starting backup...');

    // Initialize Supabase with service role key for full access
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}`;

    // Collect all table data
    const backupData: Record<string, any[]> = {};
    const tableStats: Record<string, number> = {};
    let totalRows = 0;

    for (const table of TABLES_TO_BACKUP) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(50000); // Safety limit per table

        if (error) {
          console.warn(`[Database Backup] Warning: Could not backup ${table}:`, error.message);
          tableStats[table] = -1; // Mark as failed
          continue;
        }

        backupData[table] = data || [];
        tableStats[table] = data?.length || 0;
        totalRows += data?.length || 0;
        console.log(`[Database Backup] Backed up ${table}: ${data?.length || 0} rows`);
      } catch (tableError) {
        console.warn(`[Database Backup] Error backing up ${table}:`, tableError);
        tableStats[table] = -1;
      }
    }

    // Create backup JSON
    const backupJson = JSON.stringify({
      timestamp: new Date().toISOString(),
      tables: TABLES_TO_BACKUP,
      data: backupData,
      stats: {
        totalRows,
        tableStats,
        backupDuration: Date.now() - startTime
      }
    }, null, 2);

    // Store backup in Supabase Storage
    const bucketName = 'backups';

    // Ensure bucket exists (create if not)
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucketName);

    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: false,
        allowedMimeTypes: ['application/json'],
        fileSizeLimit: 100 * 1024 * 1024 // 100MB limit
      });
      if (createError && !createError.message.includes('already exists')) {
        throw new Error(`Failed to create backup bucket: ${createError.message}`);
      }
    }

    // Upload backup
    const backupPath = `${backupName}.json`;
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(backupPath, backupJson, {
        contentType: 'application/json',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Failed to upload backup: ${uploadError.message}`);
    }

    console.log(`[Database Backup] Uploaded backup: ${backupPath}`);

    // Clean up old backups (older than RETENTION_DAYS)
    const { data: existingBackups } = await supabase.storage
      .from(bucketName)
      .list();

    let deletedCount = 0;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

    if (existingBackups) {
      for (const file of existingBackups) {
        if (file.name.startsWith('backup-') && file.created_at) {
          const fileDate = new Date(file.created_at);
          if (fileDate < cutoffDate) {
            const { error: deleteError } = await supabase.storage
              .from(bucketName)
              .remove([file.name]);

            if (!deleteError) {
              deletedCount++;
              console.log(`[Database Backup] Deleted old backup: ${file.name}`);
            }
          }
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Database Backup] Complete in ${duration}ms. Total rows: ${totalRows}`);

    return NextResponse.json({
      success: true,
      message: 'Database backup completed successfully',
      backup: {
        name: backupName,
        path: backupPath,
        totalRows,
        tableStats,
        sizeBytes: Buffer.byteLength(backupJson, 'utf8'),
        durationMs: duration
      },
      cleanup: {
        retentionDays: RETENTION_DAYS,
        deletedBackups: deletedCount
      }
    });
  } catch (error) {
    console.error('[Database Backup] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs: Date.now() - startTime
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to get backup status or restore
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { secret, action } = body;

    // Verify secret
    if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'list') {
      // List all backups
      const { data: backups, error } = await supabase.storage
        .from('backups')
        .list();

      if (error) {
        throw new Error(`Failed to list backups: ${error.message}`);
      }

      const backupList = backups
        ?.filter(f => f.name.startsWith('backup-'))
        .map(f => ({
          name: f.name,
          created: f.created_at,
          size: f.metadata?.size
        }))
        .sort((a, b) => new Date(b.created || 0).getTime() - new Date(a.created || 0).getTime());

      return NextResponse.json({
        success: true,
        backups: backupList,
        count: backupList?.length || 0,
        retentionDays: RETENTION_DAYS
      });
    }

    if (action === 'size') {
      // Get database size statistics
      const tableSizes: Record<string, number> = {};

      for (const table of TABLES_TO_BACKUP) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

          if (!error) {
            tableSizes[table] = count || 0;
          }
        } catch (e) {
          tableSizes[table] = -1;
        }
      }

      const totalRows = Object.values(tableSizes).filter(v => v > 0).reduce((a, b) => a + b, 0);

      return NextResponse.json({
        success: true,
        tables: tableSizes,
        totalRows,
        tablesCount: TABLES_TO_BACKUP.length
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Use action: "list" to see backups or "size" to check database size'
    });
  } catch (error) {
    console.error('[Database Backup POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
