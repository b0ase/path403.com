import fs from 'fs';
import path from 'path';

const PROJECTS_BASE = '/Volumes/2026/Projects/b0ase.com/public/studio/projects';

const PROJECT_MAPPINGS: Record<string, string> = {
  'Cherry': 'cherry',
  'AIVJ': 'aivj',
  'NPG': 'npg',
  'VexVoid': 'vexvoid',
  'ZeroDice': 'zerodice'
};

console.log('-- Auto-generated video inserts');
console.log('-- Run this in Supabase SQL Editor\n');
console.log('-- First, clear existing data:');
console.log('DELETE FROM "Video";\n');
console.log('-- Insert all videos:');

const inserts: string[] = [];

for (const [folderName, projectSlug] of Object.entries(PROJECT_MAPPINGS)) {
  const folderPath = path.join(PROJECTS_BASE, folderName);

  if (!fs.existsSync(folderPath)) {
    console.log(`-- Skipping ${folderName}: folder not found`);
    continue;
  }

  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.mp4'));

  if (files.length === 0) {
    console.log(`-- Skipping ${folderName}: no mp4 files`);
    continue;
  }

  console.log(`\n-- ${folderName}: ${files.length} videos`);

  for (const filename of files) {
    // Resolve symlinks to get the real path
    const fullPath = fs.realpathSync(path.join(folderPath, filename));
    const escapedFilename = filename.replace(/'/g, "''");
    const url = `file://${fullPath}`;

    inserts.push(`  ('${escapedFilename}', '${url}', '${projectSlug}')`);
  }
}

if (inserts.length > 0) {
  console.log('\nINSERT INTO "Video" (filename, url, "projectSlug") VALUES');
  console.log(inserts.join(',\n') + ';');
}

console.log(`\n-- Total: ${inserts.length} videos`);
