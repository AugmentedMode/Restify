const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Install required dependencies
try {
  execSync('npm install --no-save jimp');
  console.log('Dependencies installed successfully');
} catch (error) {
  console.error('Error installing dependencies:', error);
}

// Import jimp after installation
const Jimp = require('jimp');

// Define icon sizes
const sizes = [16, 32, 64, 128, 256, 512, 1024];

// Function to create PNG icons of different sizes
async function createPngIcons() {
  try {
    // Read the SVG file
    const svgPath = path.join(__dirname, 'assets', 'icon.svg');
    if (!fs.existsSync(svgPath)) {
      console.error('SVG icon not found at:', svgPath);
      return;
    }

    // Create a high-quality PNG from the SVG using mac's qlmanage
    const tempPngPath = path.join(__dirname, 'temp-icon.png');
    try {
      execSync(`/usr/bin/qlmanage -t -s 1024 -o . "${svgPath}"`, { stdio: 'pipe' });
      const qlOutput = svgPath + '.png';
      if (fs.existsSync(qlOutput)) {
        fs.renameSync(qlOutput, tempPngPath);
        console.log('Created high-quality PNG from SVG');
      } else {
        console.error('Failed to generate PNG from SVG using qlmanage');
        return;
      }
    } catch (error) {
      console.error('Error generating temporary PNG:', error);
      return;
    }

    // Make sure iconset directory exists
    const iconsetDir = path.join(__dirname, 'icon.iconset');
    if (!fs.existsSync(iconsetDir)) {
      fs.mkdirSync(iconsetDir);
    }

    // Use Jimp to create properly sized PNG files
    const image = await Jimp.read(tempPngPath);
    
    // Copy the base PNG to assets
    await image.writeAsync(path.join(__dirname, 'assets', 'icon.png'));
    console.log('Created assets/icon.png');

    // Create properly sized icons for macOS iconset
    const macSizes = {
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

    for (const [filename, size] of Object.entries(macSizes)) {
      const resized = image.clone().resize(size, size);
      await resized.writeAsync(path.join(iconsetDir, filename));
      console.log(`Created ${filename} (${size}x${size})`);
    }

    // Use macOS iconutil to create icns
    try {
      execSync(`/usr/bin/iconutil -c icns "${iconsetDir}" -o "${path.join(__dirname, 'assets', 'icon.icns')}"`);
      console.log('Created assets/icon.icns');
    } catch (error) {
      console.error('Error creating icns file:', error);
    }

    // Create a temporary Windows ico file (not a real ICO but will do for development)
    fs.copyFileSync(
      path.join(__dirname, 'assets', 'icon.png'),
      path.join(__dirname, 'assets', 'icon.ico')
    );
    console.log('Created assets/icon.ico (development only)');
    
    // Clean up temp files
    fs.unlinkSync(tempPngPath);
    fs.rmdirSync(iconsetDir, { recursive: true });
    
    console.log('Icon generation complete!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

// Run the icon generation
createPngIcons(); 