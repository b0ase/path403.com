import { Pool } from 'pg';

/**
 * Shared PostgreSQL connection pool
 *
 * Usage:
 *   import { getDbPool } from '@/lib/database/pool';
 *   const pool = getDbPool();
 *   const result = await pool.query('SELECT * FROM table');
 *
 * Benefits:
 * - Single connection pool shared across all API routes
 * - Prevents connection pool exhaustion
 * - Consistent configuration
 * - Automatic reconnection handling
 */

let _pool: Pool | null = null;

/**
 * Get or create the shared database connection pool
 * Lazy initialization - pool is created on first use
 */
export function getDbPool(): Pool {
  if (!_pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Connection pool configuration
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection cannot be established
    });

    // Handle pool errors
    _pool.on('error', (err) => {
      console.error('Unexpected error on idle database client', err);
    });

    console.log('[Database] Connection pool initialized');
  }

  return _pool;
}

/**
 * Close the connection pool
 * Call this when shutting down the application
 */
export async function closeDbPool(): Promise<void> {
  if (_pool) {
    await _pool.end();
    _pool = null;
    console.log('[Database] Connection pool closed');
  }
}

/**
 * Demo mode detection
 */
export function isDemoMode(): boolean {
  return !process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}
