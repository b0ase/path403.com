#!/usr/bin/env node

/**
 * Analyze Robust-AE Database Script
 * Examines the robust-ae database structure before migration
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration - You'll need to provide the service key
const ROBUST_AE_CONFIG = {
  url: 'https://uolnhghdqgoqzqlzkein.supabase.co',
  serviceKey: process.env.ROBUST_AE_SUPABASE_SERVICE_KEY || 'PLEASE_PROVIDE_SERVICE_KEY'
};

const robustAeClient = createClient(ROBUST_AE_CONFIG.url, ROBUST_AE_CONFIG.serviceKey);

async function analyzeRobustAeDatabase() {
  console.log('🔍 Analyzing robust-ae database...\n');
  
  try {
    // Check for tables in public schema
    console.log('📋 Checking for tables...');
    let tables = [];
    try {
      const { data: tablesData, error: tablesError } = await robustAeClient
        .from('information_schema.tables')
        .select('table_name, table_type')
        .eq('table_schema', 'public');
      
      if (tablesError) {
        console.log('❌ Failed to get tables:', tablesError.message);
      } else {
        tables = tablesData || [];
        console.log(`✅ Found ${tables.length} tables:`);
        tables.forEach(table => {
          console.log(`   - ${table.table_name} (${table.table_type})`);
        });
      }
    } catch (err) {
      console.log('❌ Error accessing tables:', err.message);
    }
    
    // Check for storage buckets
    console.log('\n📦 Checking for storage buckets...');
    let buckets = [];
    let bucketDetails = [];
    
    try {
      const { data: bucketsData, error: bucketsError } = await robustAeClient
        .storage
        .listBuckets();
      
      if (bucketsError) {
        console.log('❌ Failed to get storage buckets:', bucketsError.message);
      } else {
        buckets = bucketsData || [];
        console.log(`✅ Found ${buckets.length} storage buckets:`);
        
        for (const bucket of buckets) {
          console.log(`   - ${bucket.name} (public: ${bucket.public})`);
          
          try {
            const { data: objects, error: objectsError } = await robustAeClient
              .storage
              .from(bucket.name)
              .list();
            
            if (objectsError) {
              console.log(`     ❌ Error listing objects: ${objectsError.message}`);
              bucketDetails.push({ name: bucket.name, objectCount: 'unknown', error: objectsError.message });
            } else {
              console.log(`     📁 Contains ${objects.length} objects`);
              bucketDetails.push({ name: bucket.name, objectCount: objects.length });
            }
          } catch (err) {
            console.log(`     ❌ Error accessing bucket: ${err.message}`);
          }
        }
      }
    } catch (err) {
      console.log('❌ Error accessing storage:', err.message);
    }
    
    // Check for other schemas
    console.log('\n🏗️ Checking for other schemas...');
    try {
      const { data: schemas, error: schemasError } = await robustAeClient
        .from('information_schema.schemata')
        .select('schema_name')
        .not('schema_name', 'in', ['information_schema', 'pg_catalog', 'pg_toast']);
      
      if (schemasError) {
        console.log('❌ Failed to get schemas:', schemasError.message);
      } else {
        const customSchemas = schemas.filter(s => s.schema_name !== 'public');
        console.log(`✅ Found ${customSchemas.length} custom schemas:`);
        customSchemas.forEach(schema => {
          console.log(`   - ${schema.schema_name}`);
        });
      }
    } catch (err) {
      console.log('❌ Error accessing schemas:', err.message);
    }
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`- Tables: ${tables.length}`);
    console.log(`- Storage buckets: ${buckets.length}`);
    console.log(`- Total storage objects: ${bucketDetails.reduce((sum, bucket) => sum + (bucket.objectCount === 'unknown' ? 0 : bucket.objectCount), 0)}`);
    
    return {
      tables: tables || [],
      buckets: buckets || [],
      bucketDetails
    };
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    return { tables: [], buckets: [], bucketDetails: [] };
  }
}

// Check if service key is provided
if (!process.env.ROBUST_AE_SUPABASE_SERVICE_KEY) {
  console.log('⚠️  Please provide the ROBUST_AE_SUPABASE_SERVICE_KEY environment variable');
  console.log('   Run: export ROBUST_AE_SUPABASE_SERVICE_KEY="your-service-key-here"');
  console.log('   Then run this script again.');
  process.exit(1);
}

analyzeRobustAeDatabase().catch(console.error); 