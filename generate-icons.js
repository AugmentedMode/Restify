const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Install required packages if not already installed
try {
  execSync('npm list -g sharp || npm install -g sharp');
  execSync('npm list -g svg2png || npm install -g svg2png');
  execSync('npm list -g png2icons || npm install -g png2icons');
} catch (error) {
  console.error('Failed to install required packages:', error);
  process.exit(1);
}

// Source SVG file
const svgPath = path.join(__dirname, 'assets', 'improved-icon.svg');

// Ensure source file exists
if (!fs.existsSync(svgPath)) {
  console.error('Source SVG file not found:', svgPath);
  process.exit(1);
}

// Create temporary directory for intermediate files
const tempDir = path.join(__dirname, 'temp_icons');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Define icon sizes needed for mac icns (and other platforms)
const sizes = [16, 32, 64, 128, 256, 512, 1024];

// Convert SVG to PNG in all required sizes
console.log('Converting SVG to PNGs at various sizes...');
try {
  for (const size of sizes) {
    const outputFile = path.join(tempDir, `icon-${size}.png`);
    execSync(`svg2png ${svgPath} -w ${size} -h ${size} -o ${outputFile}`);
    console.log(`Created ${size}x${size} PNG`);
  }
} catch (error) {
  console.error('Error converting SVG to PNG:', error);
  process.exit(1);
}

// Create macOS icns file
console.log('Creating macOS .icns file...');
try {
  const largestPng = path.join(tempDir, 'icon-1024.png');
  const icnsOutput = path.join(__dirname, 'assets', 'icon.icns');
  execSync(`png2icons ${largestPng} ${icnsOutput} -icns`);
  console.log('Created icon.icns');
} catch (error) {
  console.error('Error creating .icns file:', error);
}

// Create Windows ico file
console.log('Creating Windows .ico file...');
try {
  const largestPng = path.join(tempDir, 'icon-1024.png');
  const icoOutput = path.join(__dirname, 'assets', 'icon.ico');
  execSync(`png2icons ${largestPng} ${icoOutput} -ico`);
  console.log('Created icon.ico');
} catch (error) {
  console.error('Error creating .ico file:', error);
}

// Save the largest PNG as regular icon
try {
  fs.copyFileSync(
    path.join(tempDir, 'icon-1024.png'),
    path.join(__dirname, 'assets', 'icon.png')
  );
  console.log('Updated icon.png');
} catch (error) {
  console.error('Error updating icon.png:', error);
}

// Clean up
console.log('Cleaning up temporary files...');
try {
  for (const size of sizes) {
    fs.unlinkSync(path.join(tempDir, `icon-${size}.png`));
  }
  fs.rmdirSync(tempDir);
} catch (error) {
  console.error('Error cleaning up:', error);
}

console.log('Icon generation complete!'); 