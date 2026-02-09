#!/usr/bin/env node

/**
 * Quick Analysis Script for Vexvoid Database
 * Checks what tables and storage buckets exist in vexvoid.com
 * 
 * Usage:
 * 1. Set VEXVOID_SUPABASE_URL and VEXVOID_SUPABASE_SERVICE_KEY
 * 2. Run: node scripts/analyze-vexvoid-database.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const VEXVOID_CONFIG = {
  url: process.env.VEXVOID_SUPABASE_URL,
  serviceKey: process.env.VEXVOID_SUPABASE_SERVICE_KEY
};

if (!VEXVOID_CONFIG.url || !VEXVOID_CONFIG.serviceKey) {
  console.error('❌ Please set VEXVOID_SUPABASE_URL and VEXVOID_SUPABASE_SERVICE_KEY environment variables');
  process.exit(1);
}

const vexvoidClient = createClient(VEXVOID_CONFIG.url, VEXVOID_CONFIG.serviceKey);

async function analyzeVexvoidDatabase() {
  console.log('🔍 Analyzing vexvoid.com database...\n');
  
  try {
    // Check for tables
    console.log('📋 Checking for tables...');
    const { data: tables, error: tablesError } = await vexvoidClient
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('❌ Failed to get tables:', tablesError.message);
    } else {
      console.log(`✅ Found ${tables.length} tables:`);
      tables.forEach(table => {
        console.log(`   - ${table.table_name} (${table.table_type})`);
      });
    }
    
    console.log('\n📦 Checking for storage buckets...');
    const { data: buckets, error: bucketsError } = await vexvoidClient
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('❌ Failed to get storage buckets:', bucketsError.message);
    } else {
      console.log(`✅ Found ${buckets.length} storage buckets:`);
      
      for (const bucket of buckets) {
        try {
          const { data: objects, error: objectsError } = await vexvoidClient
            .storage
            .from(bucket.name)
            .list();
          
          if (objectsError) {
            console.log(`   - ${bucket.name}: Error listing objects (${objectsError.message})`);
          } else {
            console.log(`   - ${bucket.name}: ${objects.length} objects`);
          }
        } catch (err) {
          console.log(`   - ${bucket.name}: Error analyzing bucket`);
        }
      }
    }
    
    // Check for any other schemas
    console.log('\n🏗️  Checking for other schemas...');
    const { data: schemas, error: schemasError } = await vexvoidClient
      .from('information_schema.schemata')
      .select('schema_name')
      .not('schema_name', 'in', ['information_schema', 'pg_catalog', 'pg_toast']);
    
    if (schemasError) {
      console.error('❌ Failed to get schemas:', schemasError.message);
    } else {
      console.log(`✅ Found ${schemas.length} custom schemas:`);
      schemas.forEach(schema => {
        console.log(`   - ${schema.schema_name}`);
      });
    }
    
    console.log('\n📊 Summary:');
    console.log(`- Tables: ${tables?.length || 0}`);
    console.log(`- Storage buckets: ${buckets?.length || 0}`);
    console.log(`- Custom schemas: ${schemas?.length || 0}`);
    
    if ((tables?.length || 0) === 0 && (buckets?.length || 0) === 0) {
      console.log('\n💡 It looks like your vexvoid database might be empty or only contain storage buckets.');
      console.log('   This is common for simple applications that only use file storage.');
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

analyzeVexvoidDatabase().catch(console.error); 