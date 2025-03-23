const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Read the SVG file
const svgPath = path.join(__dirname, 'assets', 'icon.svg');
const pngPath = path.join(__dirname, 'assets', 'icon.png');

const svgBuffer = fs.readFileSync(svgPath);

// Convert to PNG
sharp(svgBuffer)
  .png()
  .resize(1024, 1024)
  .toFile(pngPath)
  .then(() => {
    console.log('SVG converted to PNG successfully');
    return true;
  })
  .catch((err) => {
    console.error('Error converting SVG to PNG:', err);
  }); 