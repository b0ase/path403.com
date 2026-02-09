/**
 * Auth System Audit Script
 *
 * Counts users across all authentication systems to understand migration scope.
 *
 * Usage: npx ts-node scripts/audit-auth-users.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function auditAuthUsers() {
  console.log('\n========================================');
  console.log('  AUTH SYSTEM AUDIT');
  console.log('========================================\n');

  // 1. Count unified_users
  console.log('1. UNIFIED USERS (preferred system)');
  console.log('-----------------------------------');
  const { count: unifiedCount, error: e1 } = await supabase
    .from('unified_users')
    .select('*', { count: 'exact', head: true });

  if (e1) {
    console.log('   Error:', e1.message);
  } else {
    console.log(`   Total: ${unifiedCount} users`);
  }

  // Count merged (tombstone) users
  const { count: mergedCount } = await supabase
    .from('unified_users')
    .select('*', { count: 'exact', head: true })
    .not('merged_into_id', 'is', null);
  console.log(`   Merged (tombstones): ${mergedCount || 0}`);
  console.log(`   Active: ${(unifiedCount || 0) - (mergedCount || 0)}\n`);

  // 2. Count user_identities by provider
  console.log('2. USER IDENTITIES (by provider)');
  console.log('---------------------------------');
  const { data: identities, error: e2 } = await supabase
    .from('user_identities')
    .select('provider, oauth_provider');

  if (e2) {
    console.log('   Error:', e2.message);
  } else {
    const providerCounts: Record<string, number> = {};
    identities?.forEach((i: any) => {
      const key = i.oauth_provider ? `${i.provider}/${i.oauth_provider}` : i.provider;
      providerCounts[key] = (providerCounts[key] || 0) + 1;
    });

    Object.entries(providerCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([provider, count]) => {
        console.log(`   ${provider}: ${count}`);
      });
    console.log(`   TOTAL: ${identities?.length || 0}\n`);
  }

  // 3. Count simple_users (legacy)
  console.log('3. SIMPLE USERS (legacy - to migrate)');
  console.log('-------------------------------------');
  const { count: simpleCount, error: e3 } = await supabase
    .from('simple_users')
    .select('*', { count: 'exact', head: true });

  if (e3) {
    if (e3.code === 'PGRST116' || e3.message.includes('does not exist')) {
      console.log('   Table does not exist (good - already cleaned up)\n');
    } else {
      console.log('   Error:', e3.message, '\n');
    }
  } else {
    console.log(`   Total: ${simpleCount} users\n`);
  }

  // 4. Count auth_methods (legacy)
  console.log('4. AUTH METHODS (legacy - to migrate)');
  console.log('-------------------------------------');
  const { data: authMethods, error: e4 } = await supabase
    .from('auth_methods')
    .select('provider, purpose');

  if (e4) {
    if (e4.code === 'PGRST116' || e4.message.includes('does not exist')) {
      console.log('   Table does not exist (good - already cleaned up)\n');
    } else {
      console.log('   Error:', e4.message, '\n');
    }
  } else {
    const methodCounts: Record<string, number> = {};
    authMethods?.forEach((m: any) => {
      const key = `${m.provider} (${m.purpose})`;
      methodCounts[key] = (methodCounts[key] || 0) + 1;
    });

    Object.entries(methodCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([method, count]) => {
        console.log(`   ${method}: ${count}`);
      });
    console.log(`   TOTAL: ${authMethods?.length || 0}\n`);
  }

  // 5. Count profiles (legacy HandCash)
  console.log('5. PROFILES (legacy HandCash)');
  console.log('-----------------------------');
  const { count: profilesCount, error: e5 } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (e5) {
    console.log('   Error:', e5.message, '\n');
  } else {
    console.log(`   Total: ${profilesCount} profiles`);
  }

  // Count with handcash_handle
  const { count: handcashProfiles } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .not('handcash_handle', 'is', null);
  console.log(`   With HandCash: ${handcashProfiles || 0}\n`);

  // 6. Summary
  console.log('========================================');
  console.log('  SUMMARY');
  console.log('========================================');
  console.log(`
  PREFERRED SYSTEM (keep):
    unified_users:    ${unifiedCount || 0}
    user_identities:  ${identities?.length || 0}

  LEGACY (to migrate/delete):
    simple_users:     ${simpleCount || 'N/A'}
    auth_methods:     ${authMethods?.length || 'N/A'}
    profiles:         ${profilesCount || 0}
  `);

  // 7. Check for users that might be in multiple systems
  console.log('========================================');
  console.log('  OVERLAP DETECTION');
  console.log('========================================\n');

  // Check if any emails appear in both unified_users and simple_users
  if (simpleCount && simpleCount > 0) {
    const { data: simpleEmails } = await supabase
      .from('simple_users')
      .select('email')
      .not('email', 'is', null);

    const { data: unifiedEmails } = await supabase
      .from('unified_users')
      .select('primary_email')
      .not('primary_email', 'is', null);

    const simpleEmailSet = new Set(simpleEmails?.map((u: any) => u.email?.toLowerCase()));
    const overlap = unifiedEmails?.filter((u: any) =>
      simpleEmailSet.has(u.primary_email?.toLowerCase())
    );

    console.log(`  Users in BOTH systems (by email): ${overlap?.length || 0}`);
    if (overlap && overlap.length > 0 && overlap.length <= 10) {
      console.log('  Overlapping emails:', overlap.map((u: any) => u.primary_email));
    }
  } else {
    console.log('  No simple_users to check for overlap');
  }

  console.log('\n========================================\n');
}

auditAuthUsers().catch(console.error);
