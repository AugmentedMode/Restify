const { app } = require('electron');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if iconutil is available (macOS)
try {
  console.log('Creating macOS icon set from SVG...');
  
  // Create a temporary iconset directory
  const iconsetDir = path.join(__dirname, 'icon.iconset');
  if (!fs.existsSync(iconsetDir)) {
    fs.mkdirSync(iconsetDir);
  }
  
  // We'll use macOS's sips command to convert SVG to PNG at various sizes
  // First, create a high-resolution PNG from the SVG
  const svgPath = path.join(__dirname, 'assets', 'icon.svg');
  const pngPath = path.join(__dirname, 'temp-icon.png');
  
  try {
    // Use macOS's built-in tools to work with the SVG
    execSync(`/usr/bin/qlmanage -t -s 1024 -o . "${svgPath}"`, { stdio: 'ignore' });
    // Rename the output file
    const qlOutput = svgPath + '.png';
    if (fs.existsSync(qlOutput)) {
      fs.renameSync(qlOutput, pngPath);
    } else {
      console.error('Failed to generate PNG from SVG using qlmanage');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error generating initial PNG:', error);
    process.exit(1);
  }
  
  // Create required sizes for macOS
  const sizes = {
    'icon_16x16.png': 16,
    'icon_16x16@2x.png': 32,
    'icon_32x32.png': 32,
    'icon_32x32@2x.png': 64,
    'icon_128x128.png': 128,
    'icon_128x128@2x.png': 256,
    'icon_256x256.png': 256,
    'icon_256x256@2x.png': 512,
    'icon_512x512.png': 512,
    'icon_512x512@2x.png': 1024
  };
  
  // Generate each size
  for (const [filename, size] of Object.entries(sizes)) {
    const outputPath = path.join(iconsetDir, filename);
    try {
      execSync(`/usr/bin/sips -z ${size} ${size} "${pngPath}" --out "${outputPath}"`, { stdio: 'ignore' });
      console.log(`Created ${filename}`);
    } catch (error) {
      console.error(`Error creating ${filename}:`, error);
    }
  }
  
  // Use iconutil to create the icns file
  const icnsPath = path.join(__dirname, 'assets', 'icon.icns');
  try {
    execSync(`/usr/bin/iconutil -c icns "${iconsetDir}" -o "${icnsPath}"`);
    console.log(`Created icon.icns at ${icnsPath}`);
  } catch (error) {
    console.error('Error creating icns file:', error);
  }
  
  // Create PNG icon
  try {
    fs.copyFileSync(
      path.join(iconsetDir, 'icon_512x512.png'),
      path.join(__dirname, 'assets', 'icon.png')
    );
    console.log('Updated icon.png');
  } catch (error) {
    console.error('Error updating icon.png:', error);
  }
  
  // Clean up
  try {
    for (const filename of Object.keys(sizes)) {
      fs.unlinkSync(path.join(iconsetDir, filename));
    }
    fs.rmdirSync(iconsetDir);
    fs.unlinkSync(pngPath);
    console.log('Cleaned up temporary files');
  } catch (error) {
    console.error('Error cleaning up:', error);
  }
  
  console.log('Icon generation complete!');
  
} catch (error) {
  console.error('Failed to create macOS icon:', error);
} 