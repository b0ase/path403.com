/**
 * GitHub OAuth Debugging Script
 *
 * Run this to diagnose GitHub connection issues:
 * npx tsx scripts/debug-github-oauth.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugGitHubOAuth() {
  console.log('🔍 GitHub OAuth Diagnostics\n');

  // 1. Check environment
  console.log('1️⃣ Environment Check:');
  console.log(`   Supabase URL: ${supabaseUrl}`);
  console.log(`   Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);
  console.log('');

  // 2. Check current session
  console.log('2️⃣ Session Check:');
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.log(`   ❌ Error: ${sessionError.message}`);
  } else if (session) {
    console.log(`   ✅ Active session found`);
    console.log(`   User ID: ${session.user.id}`);
    console.log(`   Email: ${session.user.email}`);
    console.log(`   Provider: ${session.user.app_metadata?.provider}`);
  } else {
    console.log(`   ⚠️  No active session (not logged in)`);
  }
  console.log('');

  // 3. Check GitHub identities
  if (session) {
    console.log('3️⃣ GitHub Identity Check:');
    const { data: identities, error: identitiesError } = await supabase
      .from('user_identities')
      .select('*')
      .eq('unified_user_id', session.user.id)
      .eq('oauth_provider', 'github');

    if (identitiesError) {
      console.log(`   ❌ Error querying identities: ${identitiesError.message}`);
    } else if (identities && identities.length > 0) {
      console.log(`   ✅ Found ${identities.length} GitHub identity record(s)`);
      identities.forEach((identity, i) => {
        console.log(`   Identity #${i + 1}:`);
        console.log(`     Provider Handle: ${identity.provider_handle}`);
        console.log(`     Has Access Token: ${!!identity.access_token}`);
        console.log(`     Token Expires: ${identity.token_expires_at || 'N/A'}`);
      });
    } else {
      console.log(`   ⚠️  No GitHub identity found for this user`);
      console.log(`   This means GitHub has not been connected yet.`);
    }
    console.log('');

    // 4. Check all identities for this user
    console.log('4️⃣ All Identities for User:');
    const { data: allIdentities, error: allIdentitiesError } = await supabase
      .from('user_identities')
      .select('provider, oauth_provider, provider_handle')
      .eq('unified_user_id', session.user.id);

    if (allIdentitiesError) {
      console.log(`   ❌ Error: ${allIdentitiesError.message}`);
    } else if (allIdentities) {
      console.log(`   Found ${allIdentities.length} total identity record(s):`);
      allIdentities.forEach((identity, i) => {
        console.log(`   ${i + 1}. ${identity.provider} ${identity.oauth_provider ? `(${identity.oauth_provider})` : ''} - ${identity.provider_handle || 'N/A'}`);
      });
    }
  }
  console.log('');

  // 5. Recommendations
  console.log('📋 Next Steps:');
  if (!session) {
    console.log('   1. Log in first at http://localhost:3000');
    console.log('   2. Run this script again');
  } else {
    console.log('   1. Go to http://localhost:3000/user/account?tab=repos');
    console.log('   2. Click "Connect GitHub"');
    console.log('   3. Check browser console for errors');
    console.log('   4. Check if you\'re redirected to GitHub OAuth');
    console.log('   5. After OAuth, check if tokens are stored (run this script again)');
  }
  console.log('');

  console.log('🔧 Common Issues:');
  console.log('   - GitHub OAuth not configured in Supabase Dashboard');
  console.log('   - Redirect URL mismatch in GitHub App settings');
  console.log('   - Missing scopes in OAuth request');
  console.log('   - Migration not applied to database');
  console.log('');
}

debugGitHubOAuth().catch(console.error);
