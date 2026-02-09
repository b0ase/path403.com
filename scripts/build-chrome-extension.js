#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

async function buildChromeExtension() {
  console.log('🚀 Building Chrome Extension for B0ASE...\n');

  const extensionDir = path.join(process.cwd(), 'chrome-extension');
  const publicDir = path.join(process.cwd(), 'public');
  
  // Clean and prepare extension directory
  console.log('📁 Preparing extension directory...');
  await fs.ensureDir(extensionDir);
  await fs.ensureDir(path.join(extensionDir, 'icons'));
  await fs.ensureDir(path.join(extensionDir, 'fonts'));
  
  // Build Next.js app and export static files
  console.log('🔨 Building Next.js app...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('📦 Exporting static site...');
  execSync('npx next export -o chrome-extension/export', { stdio: 'inherit' });
  
  // Copy the exported index.html
  console.log('📄 Creating extension pages...');
  const exportedIndex = path.join(extensionDir, 'export', 'index.html');
  if (await fs.pathExists(exportedIndex)) {
    let htmlContent = await fs.readFile(exportedIndex, 'utf8');
    
    // Modify paths for Chrome extension
    htmlContent = htmlContent.replace(/href="\/_next/g, 'href="./_next');
    htmlContent = htmlContent.replace(/src="\/_next/g, 'src="./_next');
    htmlContent = htmlContent.replace(/href="\/"/g, 'href="./index.html"');
    
    // Add Chrome extension specific styles
    const extensionStyles = `
    <style>
      body {
        min-width: 100vw;
        min-height: 100vh;
        margin: 0;
        padding: 0;
        overflow-x: hidden;
      }
      /* Chrome extension specific adjustments */
      @media (max-width: 800px) {
        .fixed.right-8 { display: none; } /* Hide zoom slider on small screens */
      }
    </style>
    `;
    
    htmlContent = htmlContent.replace('</head>', extensionStyles + '</head>');
    
    await fs.writeFile(path.join(extensionDir, 'index.html'), htmlContent);
  }
  
  // Copy necessary assets
  console.log('🎨 Copying assets...');
  
  // Copy logo for icons
  const logoPath = path.join(publicDir, 'b0ase_logo.png');
  if (await fs.pathExists(logoPath)) {
    // For now, just copy the same logo for all sizes
    // In production, you'd want to resize these properly
    await fs.copy(logoPath, path.join(extensionDir, 'icons', 'icon16.png'));
    await fs.copy(logoPath, path.join(extensionDir, 'icons', 'icon48.png'));
    await fs.copy(logoPath, path.join(extensionDir, 'icons', 'icon128.png'));
  }
  
  // Copy fonts
  const fontsDir = path.join(publicDir, 'fonts');
  if (await fs.pathExists(fontsDir)) {
    await fs.copy(fontsDir, path.join(extensionDir, 'fonts'));
  }
  
  // Copy _next directory from export
  const nextDir = path.join(extensionDir, 'export', '_next');
  if (await fs.pathExists(nextDir)) {
    await fs.move(nextDir, path.join(extensionDir, '_next'), { overwrite: true });
  }
  
  // Create popup.html (simple version that links to the main page)
  const popupHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      width: 350px;
      padding: 20px;
      background: #000;
      color: #fff;
      font-family: 'Helvetica Neue', Helvetica, sans-serif;
      margin: 0;
    }
    h1 {
      font-size: 24px;
      margin: 0 0 10px 0;
      font-weight: 900;
    }
    p {
      margin: 10px 0;
      color: #888;
      font-size: 14px;
    }
    .buttons {
      margin-top: 20px;
      display: flex;
      gap: 10px;
    }
    button {
      background: #fff;
      color: #000;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      flex: 1;
      transition: all 0.2s;
    }
    button:hover {
      opacity: 0.8;
      transform: translateY(-1px);
    }
    .logo {
      width: 40px;
      height: 40px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <img src="icons/icon48.png" class="logo" alt="B0ASE">
  <h1>B0ASE</h1>
  <p>Web Design Studio & Digital Atelier</p>
  <p style="font-size: 12px;">Experience elegant design meets blockchain innovation</p>
  <div class="buttons">
    <button onclick="chrome.tabs.create({url: 'index.html'})">Open Studio</button>
    <button onclick="chrome.tabs.create({url: 'https://b0ase.com'})">Visit Website</button>
  </div>
</body>
</html>`;
  
  await fs.writeFile(path.join(extensionDir, 'popup.html'), popupHtml);
  
  // Clean up export directory
  const exportDir = path.join(extensionDir, 'export');
  if (await fs.pathExists(exportDir)) {
    await fs.remove(exportDir);
  }
  
  console.log('\n✅ Chrome Extension built successfully!');
  console.log('\n📌 To install the extension:');
  console.log('1. Open Chrome and go to chrome://extensions/');
  console.log('2. Enable "Developer mode" in the top right');
  console.log('3. Click "Load unpacked" and select the chrome-extension folder');
  console.log(`4. The extension is located at: ${extensionDir}`);
  
  // Create a simple README for the extension
  const readme = `# B0ASE Chrome Extension

## Installation

1. Open Chrome and navigate to \`chrome://extensions/\`
2. Enable "Developer mode" using the toggle in the top right
3. Click "Load unpacked"
4. Select the \`chrome-extension\` folder from this project
5. The B0ASE extension will be installed!

## Features

- **New Tab Override**: Every new tab opens the B0ASE studio interface
- **Quick Access Popup**: Click the extension icon to quickly access the studio
- **Offline Support**: Once loaded, works without internet connection
- **Full Three.js Animation**: Experience the complete interactive visualization

## Building from Source

Run: \`npm run build:chrome-extension\`

## Notes

- The extension includes the full front page experience with Three.js animations
- Music player functionality requires internet connection for streaming
- All visual effects and interactions work as in the web version
`;
  
  await fs.writeFile(path.join(extensionDir, 'README.md'), readme);
  
  console.log('\n📝 README created at chrome-extension/README.md');
}

// Run the build
buildChromeExtension().catch(console.error);