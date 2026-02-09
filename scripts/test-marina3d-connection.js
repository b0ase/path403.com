#!/usr/bin/env node

/**
 * Simple Marina3D Connection Test
 * Tests basic connectivity and looks for any data
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const MARINA3D_CONFIG = {
  url: 'https://lokglgrszeupwnjjnner.supabase.co',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxva2dsZ3JzemV1cHduampubmVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODExNTAwOSwiZXhwIjoyMDYzNjkxMDA5fQ.xT9vC_VhI5GA9q4E6IBH6J9a_unMqN2SJR-FeULv2cA'
};

const marina3dClient = createClient(MARINA3D_CONFIG.url, MARINA3D_CONFIG.serviceKey);

async function testConnection() {
  console.log('🔌 Testing Marina3D database connection...\n');
  
  try {
    // Test 1: Basic connection test
    console.log('1. Testing basic connection...');
    const { data: testData, error: testError } = await marina3dClient
      .from('auth.users')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.log(`   ❌ Basic connection failed: ${testError.message}`);
    } else {
      console.log('   ✅ Basic connection successful');
    }
    
    // Test 2: Try to list storage buckets
    console.log('\n2. Testing storage buckets...');
    const { data: buckets, error: bucketsError } = await marina3dClient
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.log(`   ❌ Storage buckets failed: ${bucketsError.message}`);
    } else {
      console.log(`   ✅ Found ${buckets?.length || 0} storage buckets`);
      if (buckets && buckets.length > 0) {
        buckets.forEach(bucket => {
          console.log(`      - ${bucket.name}`);
        });
      }
    }
    
    // Test 3: Try common table names
    console.log('\n3. Testing common table names...');
    const commonTables = [
      'users',
      'profiles', 
      'projects',
      'marina3d',
      'marina_3d',
      'models',
      '3d_models',
      'assets',
      'scenes',
      'renderings',
      'clients',
      'teams',
      'content',
      'feedback'
    ];
    
    let foundTables = 0;
    for (const tableName of commonTables) {
      try {
        const { data, error } = await marina3dClient
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          console.log(`   ✅ Found table: ${tableName} (${data?.length || 0} rows)`);
          foundTables++;
        }
      } catch (err) {
        // Table doesn't exist, which is expected
      }
    }
    
    if (foundTables === 0) {
      console.log('   ❌ No common tables found');
    }
    
    // Test 4: Try RPC functions
    console.log('\n4. Testing RPC functions...');
    try {
      const { data: rpcData, error: rpcError } = await marina3dClient
        .rpc('version');
      
      if (rpcError) {
        console.log(`   ❌ RPC test failed: ${rpcError.message}`);
      } else {
        console.log('   ✅ RPC functions accessible');
      }
    } catch (err) {
      console.log(`   ❌ RPC test failed: ${err.message}`);
    }
    
    // Summary
    console.log('\n📊 Connection Test Summary:');
    console.log(`- Storage buckets: ${buckets?.length || 0}`);
    console.log(`- Tables found: ${foundTables}`);
    console.log(`- Database accessible: ${!testError ? 'Yes' : 'No'}`);
    
    if (foundTables === 0 && (!buckets || buckets.length === 0)) {
      console.log('\n❌ Marina3D database appears to be empty or uninitialized');
      console.log('💡 You can safely delete this Supabase project to save costs!');
    } else {
      console.log('\n✅ Marina3D database contains data that may need migration');
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

// Run the test
testConnection().catch(console.error); 