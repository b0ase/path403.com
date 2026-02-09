#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🖼️  Starting image optimization...');

// Check if ImageMagick is installed
try {
  execSync('convert --version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ ImageMagick not found. Please install it first:');
  console.error('   macOS: brew install imagemagick');
  console.error('   Ubuntu: sudo apt-get install imagemagick');
  console.error('   Windows: Download from https://imagemagick.org/');
  process.exit(1);
}

const publicDir = path.join(__dirname, '..', 'public');
const imagesDir = path.join(publicDir, 'images');

// Function to optimize a single image
function optimizeImage(filePath, outputPath, quality = 85) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.png') {
      // Optimize PNG
      execSync(`convert "${filePath}" -strip -quality ${quality} "${outputPath}"`, { stdio: 'ignore' });
    } else if (ext === '.jpg' || ext === '.jpeg') {
      // Optimize JPEG
      execSync(`convert "${filePath}" -strip -quality ${quality} "${outputPath}"`, { stdio: 'ignore' });
    }
    
    const originalSize = fs.statSync(filePath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log(`✅ ${path.basename(filePath)}: ${(originalSize / 1024).toFixed(1)}KB → ${(optimizedSize / 1024).toFixed(1)}KB (${savings}% saved)`);
    
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
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        const fileSize = stat.size;
        
        // Only optimize files larger than 500KB
        if (fileSize > 500 * 1024) {
          const backupPath = itemPath + '.backup';
          
          // Create backup
          fs.copyFileSync(itemPath, backupPath);
          
          // Optimize
          if (optimizeImage(itemPath, itemPath)) {
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
console.log('🔍 Scanning for large images...');
processDirectory(publicDir);
console.log('✨ Image optimization complete!');
