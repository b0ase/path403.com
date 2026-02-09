const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const PROJECTS = [
  { slug: 'npg', path: '/Users/b0ase/Projects/ninja-punk-girls-com' },
  { slug: 'cherry', path: '/Users/b0ase/Projects/cherry-xxx' },
  { slug: 'vexvoid', path: '/Users/b0ase/Projects/VexVoid/vexvoid.com-website' },
  { slug: 'aivj', path: '/Users/b0ase/Projects/AI-VJ' },
  { slug: 'audex', path: '/Users/b0ase/Projects/audex' }
];

const MEDIA_EXTENSIONS = ['.mp4', '.mov', '.webm', '.mp3', '.wav'];

async function ingest() {
  console.log('🚀 Starting Project Asset Ingestion...');

  for (const project of PROJECTS) {
    if (!fs.existsSync(project.path)) {
      console.warn(`⚠️ Path not found for ${project.slug}: ${project.path}`);
      continue;
    }

    console.log(`\n📂 Scanning ${project.slug} at ${project.path}...`);
    
    // Recursive file search
    const files = getAllFiles(project.path);
    const mediaFiles = files.filter(f => MEDIA_EXTENSIONS.includes(path.extname(f).toLowerCase()));

    console.log(`   Found ${mediaFiles.length} media files.`);

    for (const file of mediaFiles) {
      const filename = path.basename(file);
      const relativePath = path.relative(project.path, file);
      
      // We don't have a file server for these paths yet, 
      // so for now we map the URL to a local file scheme or a placeholder 
      // that the Studio needs to handle (e.g., serving via a local API route).
      // Ideally, we'd copy them to public/, but that might duplicate gb of data.
      // For this script, we'll store the absolute path as the URL for local dev usage,
      // or prefix with a custom protocol.
      const url = `file://${file}`; 

      const type = ['.mp3', '.wav'].includes(path.extname(file).toLowerCase()) ? 'AUDIO' : 'VIDEO';

      // Check existence
      const existing = await prisma.video.findFirst({
        where: { 
            filename: filename,
            projectSlug: project.slug
        }
      });

      if (!existing) {
        await prisma.video.create({
          data: {
            filename,
            url, // Needs special handling in <video src> if local file
            type,
            projectSlug: project.slug,
            metadata: { originalPath: file },
            framePriceSats: 100 // Default
          }
        });
        process.stdout.write('+');
      } else {
        process.stdout.write('.');
      }
    }
  }

  console.log('\n\n✅ Ingestion Complete!');
}

function getAllFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

ingest()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
