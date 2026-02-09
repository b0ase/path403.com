#!/usr/bin/env node

/**
 * Migrate Remaining Files Script
 * Handles files that failed to migrate due to special characters
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const VEXVOID_CONFIG = {
  url: 'https://bgotvvrslolholxgcivz.supabase.co',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnb3R2dnJzbG9saG9seGdjaXZ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA5NTQ4OSwiZXhwIjoyMDY1NjcxNDg5fQ.Ek_L9OMlcJUFGsB_QuUHQciXA1RReu7mg9maujU0E8g'
};

const B0ASE_CONFIG = {
  url: 'https://api.b0ase.com',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsYXB1dHp4ZXFneXBwaHpkeHByIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjIwNzAwMywiZXhwIjoyMDYxNzgzMDAzfQ.q7BSh0OmgNZKQYqDFYYy1CVRojdJmktijYPK88kwEgQ'
};

const vexvoidClient = createClient(VEXVOID_CONFIG.url, VEXVOID_CONFIG.serviceKey);
const b0aseClient = createClient(B0ASE_CONFIG.url, B0ASE_CONFIG.serviceKey);

async function migrateRemainingFiles() {
  console.log('🔄 Migrating remaining files with special characters...\n');
  
  const bucketsToMigrate = [
    { name: 'v3xv0id-images', expectedCount: 8 },
    { name: 'v3xv0id-videos', expectedCount: 1 }
  ];
  
  for (const bucketInfo of bucketsToMigrate) {
    console.log(`📦 Processing bucket: ${bucketInfo.name}`);
    
    try {
      // List all objects in the vexvoid bucket
      const { data: objects, error: listError } = await vexvoidClient
        .storage
        .from(bucketInfo.name)
        .list();
      
      if (listError) {
        console.error(`❌ Failed to list objects in ${bucketInfo.name}:`, listError.message);
        continue;
      }
      
      console.log(`   Found ${objects.length} objects to migrate`);
      
      // Migrate each object individually with better error handling
      for (const object of objects) {
        try {
          console.log(`   📁 Migrating: ${object.name}`);
          
          // Download from vexvoid
          const { data: fileData, error: downloadError } = await vexvoidClient
            .storage
            .from(bucketInfo.name)
            .download(object.name);
          
          if (downloadError) {
            console.error(`     ❌ Download failed: ${downloadError.message}`);
            continue;
          }
          
          // Upload to b0ase with explicit content type
          const { error: uploadError } = await b0aseClient
            .storage
            .from(bucketInfo.name)
            .upload(object.name, fileData, {
              upsert: true,
              contentType: object.metadata?.mimetype || 'application/octet-stream',
              cacheControl: object.metadata?.cacheControl || '3600'
            });
          
          if (uploadError) {
            console.error(`     ❌ Upload failed: ${uploadError.message}`);
          } else {
            console.log(`     ✅ Successfully migrated: ${object.name}`);
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (err) {
          console.error(`     ❌ Error migrating ${object.name}:`, err.message);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error processing bucket ${bucketInfo.name}:`, error.message);
    }
    
    console.log('');
  }
  
  console.log('✅ Migration of remaining files completed!');
}

migrateRemainingFiles().catch(console.error); 