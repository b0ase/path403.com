import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const PROJECTS_BASE = '/Volumes/2026/Projects/b0ase.com/public/studio/projects';

const PROJECT_MAPPINGS: Record<string, string> = {
  'Cherry': 'cherry',
  'AIVJ': 'aivj',
  'NPG': 'npg',
  'VexVoid': 'vexvoid',
  'ZeroDice': 'zerodice'
};

async function syncVideos() {
  console.log('Starting video sync...\n');

  for (const [folderName, projectSlug] of Object.entries(PROJECT_MAPPINGS)) {
    const folderPath = path.join(PROJECTS_BASE, folderName);

    if (!fs.existsSync(folderPath)) {
      console.log(`⚠️  Folder not found: ${folderPath}`);
      continue;
    }

    // Get all mp4 files
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.mp4'));
    console.log(`📁 ${folderName} (${projectSlug}): ${files.length} videos found`);

    if (files.length === 0) continue;

    // Get existing videos for this project
    const { data: existing, error: fetchError } = await supabase
      .from('Video')
      .select('filename')
      .eq('projectSlug', projectSlug);

    if (fetchError) {
      console.error(`   Error fetching existing: ${fetchError.message}`);
      continue;
    }

    const existingFilenames = new Set(existing?.map(v => v.filename) || []);

    // Find new videos to insert
    const newVideos = files
      .filter(f => !existingFilenames.has(f))
      .map(filename => {
        // Resolve symlinks to get the real path
        const fullPath = fs.realpathSync(path.join(folderPath, filename));
        return {
          filename,
          url: `file://${fullPath}`,
          projectSlug
        };
      });

    if (newVideos.length === 0) {
      console.log(`   ✓ Already up to date`);
      continue;
    }

    // Insert new videos
    const { error: insertError } = await supabase
      .from('Video')
      .insert(newVideos);

    if (insertError) {
      console.error(`   ❌ Insert error: ${insertError.message}`);
    } else {
      console.log(`   ✅ Added ${newVideos.length} new videos`);
    }
  }

  console.log('\n✨ Sync complete!');
}

syncVideos().catch(console.error);
