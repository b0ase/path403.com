#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎥 Starting video optimization...');

// Check if FFmpeg is installed
try {
  execSync('ffmpeg -version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ FFmpeg not found. Please install it first:');
  console.error('   macOS: brew install ffmpeg');
  console.error('   Ubuntu: sudo apt-get install ffmpeg');
  console.error('   Windows: Download from https://ffmpeg.org/');
  process.exit(1);
}

const publicDir = path.join(__dirname, '..', 'public');

// Function to optimize a single video
function optimizeVideo(filePath, outputPath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.mp4') {
      // Optimize MP4 with H.264 codec, lower bitrate for web
      execSync(`ffmpeg -i "${filePath}" -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 128k -movflags +faststart "${outputPath}"`, { 
        stdio: 'ignore',
        timeout: 300000 // 5 minutes timeout
      });
    }
    
    const originalSize = fs.statSync(filePath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log(`✅ ${path.basename(filePath)}: ${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(optimizedSize / 1024 / 1024).toFixed(1)}MB (${savings}% saved)`);
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to optimize ${filePath}:`, error.message);
    return false;
  }
}

// Function to process directory recursively
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      processDirectory(itemPath);
    } else if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      if (['.mp4', '.mov', '.avi'].includes(ext)) {
        const fileSize = stat.size;
        
        // Only optimize files larger than 2MB
        if (fileSize > 2 * 1024 * 1024) {
          const backupPath = itemPath + '.backup';
          
          // Create backup
          fs.copyFileSync(itemPath, backupPath);
          
          // Optimize
          if (optimizeVideo(itemPath, itemPath)) {
            // Remove backup if optimization was successful
            fs.unlinkSync(backupPath);
          } else {
            // Restore backup if optimization failed
            fs.copyFileSync(backupPath, itemPath);
            fs.unlinkSync(backupPath);
          }
        }
      }
    }
  });
}

// Start optimization
console.log('🔍 Scanning for large videos...');
processDirectory(publicDir);
console.log('✨ Video optimization complete!');
