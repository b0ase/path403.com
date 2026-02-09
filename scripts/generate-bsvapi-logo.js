const sharp = require('sharp');
const fs = require('fs');

const inputSvg = 'public/images/clientprojects/bsvapi-com/bsvapi-logo.svg';
const outputPng = 'public/images/clientprojects/bsvapi-com/bsvapi-logo.png';

(async () => {
  try {
    const svgBuffer = fs.readFileSync(inputSvg);
    await sharp(svgBuffer)
      .png()
      .toFile(outputPng);
    console.log('PNG created successfully:', outputPng);
  } catch (err) {
    console.error('Error creating PNG:', err);
    process.exit(1);
  }
})(); 