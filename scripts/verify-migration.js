#!/usr/bin/env node

/**
 * Migration Verification Script
 * Checks what was actually migrated to b0ase.com database
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const B0ASE_CONFIG = {
  url: process.env.B0ASE_SUPABASE_URL || 'https://api.b0ase.com',
  serviceKey: process.env.B0ASE_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsYXB1dHp4ZXFneXBwaHpkeHByIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjIwNzAwMywiZXhwIjoyMDYxNzgzMDAzfQ.q7BSh0OmgNZKQYqDFYYy1CVRojdJmktijYPK88kwEgQ'
};

const b0aseClient = createClient(B0ASE_CONFIG.url, B0ASE_CONFIG.serviceKey);

async function verifyMigration() {
  console.log('🔍 Verifying migration to b0ase.com database...\n');
  
  try {
    // Check for vexvoid buckets
    console.log('📦 Checking for vexvoid storage buckets...');
    const { data: buckets, error: bucketsError } = await b0aseClient
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('❌ Failed to get buckets:', bucketsError.message);
      return;
    }
    
    const vexvoidBuckets = buckets.filter(bucket => bucket.name.startsWith('v3xv0id'));
    console.log(`✅ Found ${vexvoidBuckets.length} vexvoid buckets:`);
    
    for (const bucket of vexvoidBuckets) {
      console.log(`   - ${bucket.name} (public: ${bucket.public})`);
      
      // List objects in each bucket
      try {
        const { data: objects, error: objectsError } = await b0aseClient
          .storage
          .from(bucket.name)
          .list();
        
        if (objectsError) {
          console.log(`     ❌ Error listing objects: ${objectsError.message}`);
        } else {
          console.log(`     📁 Contains ${objects.length} objects`);
          if (objects.length > 0) {
            console.log(`     📋 Sample files: ${objects.slice(0, 3).map(obj => obj.name).join(', ')}`);
          }
        }
      } catch (err) {
        console.log(`     ❌ Error accessing bucket: ${err.message}`);
      }
    }
    
    // Check all buckets for comparison
    console.log('\n📊 All storage buckets in b0ase database:');
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (public: ${bucket.public})`);
    });
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyMigration().catch(console.error); 