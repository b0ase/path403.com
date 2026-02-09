#!/usr/bin/env node

/**
 * Inspect Vexvoid Objects Script
 * Examines the problematic objects to understand their structure
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const VEXVOID_CONFIG = {
  url: 'https://bgotvvrslolholxgcivz.supabase.co',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnb3R2dnJzbG9saG9seGdjaXZ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDA5NTQ4OSwiZXhwIjoyMDY1NjcxNDg5fQ.Ek_L9OMlcJUFGsB_QuUHQciXA1RReu7mg9maujU0E8g'
};

const vexvoidClient = createClient(VEXVOID_CONFIG.url, VEXVOID_CONFIG.serviceKey);

async function inspectObjects() {
  console.log('🔍 Inspecting vexvoid objects...\n');
  
  const bucketsToInspect = ['v3xv0id-images', 'v3xv0id-videos'];
  
  for (const bucketName of bucketsToInspect) {
    console.log(`📦 Inspecting bucket: ${bucketName}`);
    
    try {
      // List all objects in the bucket
      const { data: objects, error: listError } = await vexvoidClient
        .storage
        .from(bucketName)
        .list();
      
      if (listError) {
        console.error(`❌ Failed to list objects: ${listError.message}`);
        continue;
      }
      
      console.log(`   Found ${objects.length} objects:`);
      
      for (const object of objects) {
        console.log(`\n   📁 Object: ${object.name}`);
        console.log(`      Size: ${object.metadata?.size || 'unknown'} bytes`);
        console.log(`      MIME Type: ${object.metadata?.mimetype || 'unknown'}`);
        console.log(`      Last Modified: ${object.updated_at}`);
        console.log(`      ID: ${object.id}`);
        
        // Try to get a signed URL to see if the file is accessible
        try {
          const { data: signedUrl, error: urlError } = await vexvoidClient
            .storage
            .from(bucketName)
            .createSignedUrl(object.name, 60);
          
          if (urlError) {
            console.log(`      ❌ Signed URL failed: ${urlError.message}`);
          } else {
            console.log(`      ✅ Signed URL generated successfully`);
            console.log(`      🔗 URL: ${signedUrl.signedUrl.substring(0, 100)}...`);
          }
        } catch (err) {
          console.log(`      ❌ Signed URL error: ${err.message}`);
        }
        
        // Try to get the object's public URL
        try {
          const { data: publicUrl } = vexvoidClient
            .storage
            .from(bucketName)
            .getPublicUrl(object.name);
          
          console.log(`      🌐 Public URL: ${publicUrl.publicUrl}`);
        } catch (err) {
          console.log(`      ❌ Public URL error: ${err.message}`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error inspecting bucket ${bucketName}:`, error.message);
    }
    
    console.log('');
  }
}

inspectObjects().catch(console.error); 