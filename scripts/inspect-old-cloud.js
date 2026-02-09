const { createClient } = require('@supabase/supabase-js');

// Self-hosted Supabase (migration complete)
const SUPABASE_URL = 'https://api.b0ase.com';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsYXB1dHp4ZXFneXBwaHpkeHByIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjIwNzAwMywiZXhwIjoyMDYxNzgzMDAzfQ.q7BSh0OmgNZKQYqDFYYy1CVRojdJmktijYPK88kwEgQ';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  console.log('🚀 Connecting to Old Supabase Cloud...');

  // 1. Inspect 'videos' table if it exists
  console.log('\n--- Checking Tables ---');
  const { data: videos, error: vidError } = await supabase
    .from('videos')
    .select('*');
  
  if (vidError) {
    console.log('❌ videos table error:', vidError.message);
  } else {
    console.log(`✅ Found ${videos.length} videos in DB.`);
    const npg = videos.filter(v => 
        (v.filename && v.filename.toLowerCase().includes('ninja')) || 
        (v.filename && v.filename.toLowerCase().includes('npg')) ||
        (v.metadata && JSON.stringify(v.metadata).toLowerCase().includes('ninja'))
    );
    const vex = videos.filter(v => 
        (v.filename && v.filename.toLowerCase().includes('vex')) || 
        (v.filename && v.filename.toLowerCase().includes('void'))
    );
    console.log(`   - NPG Candidates: ${npg.length}`);
    console.log(`   - Vex Candidates: ${vex.length}`);
    if (npg.length > 0) console.log('Sample NPG:', npg[0]);
  }

  // 2. Inspect Storage Buckets
  console.log('\n--- Checking Storage ---');
  const { data: buckets, error: bError } = await supabase.storage.listBuckets();
  
  if (bError) {
    console.log('❌ Storage error:', bError.message);
  } else {
    console.log(`✅ Found ${buckets.length} buckets:`, buckets.map(b => b.name));

    for (const bucket of buckets) {
      console.log(`\n📂 Scanning bucket: ${bucket.name}`);
      // Limit to 100 for check
      const { data: files, error: fError } = await supabase.storage.from(bucket.name).list(null, { limit: 100 });
      if (fError) {
        console.log(`   Error listing bucket: ${fError.message}`);
        continue;
      }
      
      console.log(`   Found ${files.length} files (top level).`);
      
      // Check for NPG / Vex matches
      const npgFiles = files.filter(f => f.name.toLowerCase().includes('ninja') || f.name.toLowerCase().includes('npg'));
      const vexFiles = files.filter(f => f.name.toLowerCase().includes('vex') || f.name.toLowerCase().includes('void'));

      if (npgFiles.length > 0) console.log(`   🎯 NPG Files Found:`, npgFiles.map(f => f.name));
      if (vexFiles.length > 0) console.log(`   🎯 Vex Files Found:`, vexFiles.map(f => f.name));
    }
  }
}

main();
