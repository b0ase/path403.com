#!/usr/bin/env node

/**
 * Deep Analyze Robust-AE Database Script
 * Uses direct SQL queries to examine the database structure
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const ROBUST_AE_CONFIG = {
  url: 'https://uolnhghdqgoqzqlzkein.supabase.co',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvbG5oZ2hkcWdvcXpxbHprZWluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ3NzQ1MCwiZXhwIjoyMDY1MDUzNDUwfQ.Pcu-nUOqw35nTmb5rPmQMROdrLLyMupMQtN34i1kFhw'
};

const robustAeClient = createClient(ROBUST_AE_CONFIG.url, ROBUST_AE_CONFIG.serviceKey);

async function deepAnalyzeRobustAe() {
  console.log('🔍 Deep analyzing robust-ae database...\n');
  
  try {
    // Check all schemas
    console.log('📋 Checking all schemas...');
    const { data: schemas, error: schemasError } = await robustAeClient
      .rpc('get_schemas');
    
    if (schemasError) {
      console.log('❌ Failed to get schemas via RPC, trying direct query...');
      
      // Try direct SQL query
      const { data: schemasData, error: schemasSqlError } = await robustAeClient
        .from('information_schema.schemata')
        .select('schema_name');
      
      if (schemasSqlError) {
        console.log('❌ Failed to get schemas:', schemasSqlError.message);
      } else {
        console.log('✅ Found schemas:');
        schemasData.forEach(schema => {
          console.log(`   - ${schema.schema_name}`);
        });
      }
    } else {
      console.log('✅ Found schemas:');
      schemas.forEach(schema => {
        console.log(`   - ${schema.schema_name}`);
      });
    }
    
    // Check for tables in public schema using direct SQL
    console.log('\n📊 Checking for tables in public schema...');
    const { data: tables, error: tablesError } = await robustAeClient
      .rpc('get_tables', { schema_name: 'public' });
    
    if (tablesError) {
      console.log('❌ Failed to get tables via RPC, trying direct query...');
      
      // Try alternative approach
      const { data: tablesData, error: tablesSqlError } = await robustAeClient
        .from('pg_tables')
        .select('tablename, tableowner')
        .eq('schemaname', 'public');
      
      if (tablesSqlError) {
        console.log('❌ Failed to get tables:', tablesSqlError.message);
      } else {
        console.log(`✅ Found ${tablesData.length} tables in public schema:`);
        tablesData.forEach(table => {
          console.log(`   - ${table.tablename} (owner: ${table.tableowner})`);
        });
      }
    } else {
      console.log(`✅ Found ${tables.length} tables in public schema:`);
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }
    
    // Check for storage buckets
    console.log('\n📦 Checking for storage buckets...');
    const { data: buckets, error: bucketsError } = await robustAeClient
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.log('❌ Failed to get storage buckets:', bucketsError.message);
    } else {
      console.log(`✅ Found ${buckets.length} storage buckets:`);
      buckets.forEach(bucket => {
        console.log(`   - ${bucket.name} (public: ${bucket.public})`);
      });
    }
    
    // Check for any data in common Supabase tables
    console.log('\n🔍 Checking for Supabase system tables...');
    const systemTables = ['auth.users', 'storage.buckets', 'storage.objects'];
    
    for (const tableName of systemTables) {
      try {
        const [schema, table] = tableName.split('.');
        const { data, error } = await robustAeClient
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`   ❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`   ✅ ${tableName}: ${data.length} records found`);
        }
      } catch (err) {
        console.log(`   ❌ ${tableName}: ${err.message}`);
      }
    }
    
    // Check for any RLS policies
    console.log('\n🔒 Checking for RLS policies...');
    const { data: policies, error: policiesError } = await robustAeClient
      .from('pg_policies')
      .select('schemaname, tablename, policyname')
      .eq('schemaname', 'public');
    
    if (policiesError) {
      console.log('❌ Failed to get RLS policies:', policiesError.message);
    } else {
      console.log(`✅ Found ${policies.length} RLS policies:`);
      policies.forEach(policy => {
        console.log(`   - ${policy.schemaname}.${policy.tablename}: ${policy.policyname}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Deep analysis failed:', error.message);
  }
}

deepAnalyzeRobustAe().catch(console.error); 