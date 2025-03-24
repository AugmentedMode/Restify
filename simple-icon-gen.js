// A simpler approach to generate icon files using sharp
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Install sharp if not already available
try {
  execSync('npm list -g sharp || npm install -g sharp');
  execSync('npm install --no-save sharp');
  console.log('Successfully installed dependencies');
} catch (error) {
  console.error('Error installing dependencies:', error);
  process.exit(1);
}

// Dynamic import of sharp
async function generateIcons() {
  try {
    const sharp = require('sharp');
    const svgBuffer = fs.readFileSync(path.join(__dirname, 'assets', 'icon.svg'));
    
    // Generate PNG
    await sharp(svgBuffer)
      .resize(1024, 1024)
      .png()
      .toFile(path.join(__dirname, 'assets', 'icon.png'));
    
    console.log('Generated PNG icon');
    
    // For macOS, copy the PNG file to icon.icns
    // This isn't a real ICNS file, but it will work temporarily for development
    fs.copyFileSync(
      path.join(__dirname, 'assets', 'icon.png'),
      path.join(__dirname, 'assets', 'icon.icns')
    );
    
    console.log('Created temporary icon.icns (not a real ICNS file)');
    
    // For Windows, copy the PNG file to icon.ico
    // This isn't a real ICO file, but it will work temporarily for development
    fs.copyFileSync(
      path.join(__dirname, 'assets', 'icon.png'),
      path.join(__dirname, 'assets', 'icon.ico')
    );
    
    console.log('Created temporary icon.ico (not a real ICO file)');
    
    console.log('Icon generation complete - these are development-only replacements!');
    console.log('For production, you should use proper conversion tools to create real ICNS and ICO files.');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons(); 