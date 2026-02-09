/**
 * Seed venture_tokens table from TOKEN_REGISTRY
 *
 * Run with: npx tsx scripts/seed-venture-tokens.ts
 *
 * This creates database entries for all tokens.
 * NO on-chain minting happens - tokens are internal ledger entries.
 */

import { createClient } from '@supabase/supabase-js';
import { TOKEN_REGISTRY, DEFAULT_SUPPLY, type TokenInfo } from '../lib/token-registry';

// Load env
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Price mapping based on token status/category
function getTokenPrice(token: TokenInfo): number {
  if (token.pricing?.marketCap && token.pricing?.supply) {
    // Calculate from actual data
    return token.pricing.marketCap / token.pricing.supply;
  }

  // Default prices by category
  switch (token.category) {
    case 'company':
      return 0.024; // $0.024 for company tokens
    case 'venture':
      return 0.01;  // $0.01 for venture tokens
    case 'bApps':
      return 0.005; // $0.005 for bApps
    default:
      return 0.001; // $0.001 for utility/content
  }
}

async function seedVentureTokens() {
  console.log('🌱 Seeding venture_tokens table from TOKEN_REGISTRY...\n');

  const tokens = Object.values(TOKEN_REGISTRY);
  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const token of tokens) {
    const ticker = token.symbol.replace('$', ''); // Remove $ prefix
    const priceUsd = getTokenPrice(token);
    const priceGbp = priceUsd * 0.79; // USD to GBP

    const ventureToken = {
      ticker,
      name: token.name,
      description: token.description || null,
      total_supply: DEFAULT_SUPPLY,
      price_usd: priceUsd,
      price_gbp: priceGbp,
      blockchain: 'BSV',
      token_id: token.marketUrl ? `bsv21_${ticker.toLowerCase()}` : null,
      is_deployed: token.status === 'minted',
      tokens_sold: 0,
      tokens_available: DEFAULT_SUPPLY,
      treasury_balance: 0,
      portfolio_slug: token.projectSlug || null,
      is_active: true,
      is_public: token.status === 'minted',
    };

    // Upsert (insert or update)
    const { error } = await supabase
      .from('venture_tokens')
      .upsert(ventureToken, {
        onConflict: 'ticker',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error(`❌ Error for ${token.symbol}: ${error.message}`);
      errors++;
    } else {
      const status = token.status === 'minted' ? '🟢 LIVE' : '⚪ CONCEPT';
      console.log(`✅ ${token.symbol.padEnd(12)} ${status} - $${priceUsd.toFixed(4)}/token`);
      created++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Summary:`);
  console.log(`   Created/Updated: ${created}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total tokens in registry: ${tokens.length}`);
  console.log('='.repeat(50));

  // Show live tokens
  const liveTokens = tokens.filter(t => t.status === 'minted');
  console.log(`\n🟢 Live tokens ready for purchase:`);
  for (const t of liveTokens) {
    console.log(`   ${t.symbol} - ${t.name}`);
  }
}

// Also seed the $BOASE token to cap_table_shareholders if needed
async function ensureBoaseInCapTable() {
  console.log('\n📋 Checking cap_table_settings...');

  const { data: settings, error } = await supabase
    .from('cap_table_settings')
    .select('*')
    .single();

  if (error && error.code === 'PGRST116') {
    // Not found, create it
    const { error: insertError } = await supabase
      .from('cap_table_settings')
      .insert({
        token_name: '$BOASE',
        token_symbol: 'BOASE',
        total_supply: DEFAULT_SUPPLY,
        token_price: 0.024,
        price_currency: 'USD',
        company_name: 'b0ase.com Ltd',
        company_jurisdiction: 'United Kingdom',
        share_class_default: 'ordinary',
      });

    if (insertError) {
      console.error('❌ Failed to create cap_table_settings:', insertError.message);
    } else {
      console.log('✅ Created cap_table_settings for $BOASE');
    }
  } else if (settings) {
    console.log('✅ cap_table_settings already exists');
  }
}

async function main() {
  console.log('🚀 Starting venture token seeding...\n');

  await seedVentureTokens();
  await ensureBoaseInCapTable();

  console.log('\n✨ Done! Tokens exist in database only - no on-chain minting performed.');
  console.log('   Users can now purchase tokens, balances tracked in user_token_balances.');
}

main().catch(console.error);
