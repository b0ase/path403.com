require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SOURCE_DIR = '/Volumes/2026/iCloud-Backup/cherry-graf-video-jam';
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm'];

async function ingestVideos() {
  console.log(`🔍 Scanning directory: ${SOURCE_DIR}`);

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Error: Directory ${SOURCE_DIR} does not exist.`);
    process.exit(1);
  }

  const files = fs.readdirSync(SOURCE_DIR);
  const videoFiles = files.filter(file => VIDEO_EXTENSIONS.includes(path.extname(file).toLowerCase()));

  console.log(`Found ${videoFiles.length} video files.`);

  for (const file of videoFiles) {
    const filePath = path.join(SOURCE_DIR, file);
    const fileStats = fs.statSync(filePath);
    const fileSize = fileStats.size;
    const fileContent = fs.readFileSync(filePath);

    console.log(`Processing: ${file} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);

    // 1. Check if video already exists in DB
    const { data: existing } = await supabase
      .from('videos')
      .select('id')
      .eq('filename', file)
      .single();

    if (existing) {
      console.log(`  ⚠ Skipped: ${file} (Already in database)`);
      continue;
    }

    // 2. Upload to Storage
    console.log(`  ⬆ Uploading to Storage...`);
    const { data: storageData, error: storageError } = await supabase.storage
      .from('studio-assets')
      .upload(`videos/${file}`, fileContent, {
        contentType: 'video/mp4', // Naive content type, works for most
        upsert: true
      });

    if (storageError) {
      console.error(`  ❌ Upload failed: ${storageError.message}`);
      continue;
    }

    // 3. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('studio-assets')
      .getPublicUrl(`videos/${file}`);

    // 4. Insert into Database
    console.log(`  💾 Inserting into Database...`);
    const { error: dbError } = await supabase
      .from('videos')
      .insert({
        filename: file,
        url: publicUrl,
        size_bytes: fileSize,
        metadata: { source: 'local_ingest', original_path: SOURCE_DIR }
      });

    if (dbError) {
      console.error(`  ❌ DB Insert failed: ${dbError.message}`);
    } else {
      console.log(`  ✅ Success: ${file}`);
    }
  }

  console.log('🎉 Ingestion Complete!');
}

ingestVideos().catch(console.error);
