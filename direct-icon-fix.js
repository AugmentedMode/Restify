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

async function createCustomIcon() {
  try {
    // Create a new image with dark background
    const size = 1024;
    const image = new Jimp(size, size, '#1E1E1E');
    
    // Make the image rounded corners (this is a simple approach)
    const mask = new Jimp(size, size, 0x00000000);
    const radius = size / 4; // Adjust corner radius
    
    // Draw a rounded rectangle on the mask
    mask.scan(0, 0, size, size, function(x, y, idx) {
      // Calculate distance from nearest corner
      const distX = Math.min(x, size - x);
      const distY = Math.min(y, size - y);
      
      if (distX >= radius || distY >= radius) {
        // Not in a corner, make opaque
        this.bitmap.data[idx + 3] = 255;
      } else {
        // In a corner, check if inside the rounded part
        const dx = radius - distX;
        const dy = radius - distY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist <= radius) {
          // Inside the rounded corner
          this.bitmap.data[idx + 3] = 255;
        }
      }
    });
    
    // Apply mask to image
    image.mask(mask, 0, 0);
    
    // Draw code symbols (simplified)
    // This is a very simple drawing, but enough for testing
    const draw = new Jimp(size, size, 0x00000000);
    
    // Draw left bracket
    const bracketWidth = size / 15;
    const bracketColor = 0xFFFFFFFF; // White
    
    // Simple left bracket
    for (let x = size/4; x < size/3; x++) {
      for (let y = size/3; y < 2*size/3; y++) {
        if (Math.abs(y - size/2) < bracketWidth/2 || Math.abs(x - size/4) < bracketWidth/2) {
          draw.setPixelColor(bracketColor, x, y);
        }
      }
    }
    
    // Simple right bracket
    for (let x = 2*size/3; x < 3*size/4; x++) {
      for (let y = size/3; y < 2*size/3; y++) {
        if (Math.abs(y - size/2) < bracketWidth/2 || Math.abs(x - 3*size/4) < bracketWidth/2) {
          draw.setPixelColor(bracketColor, x, y);
        }
      }
    }
    
    // Center slash
    for (let x = size/3; x <= 2*size/3; x++) {
      const y = size/3 + (x - size/3) / (2*size/3 - size/3) * (2*size/3 - size/3);
      for (let dy = -bracketWidth/2; dy < bracketWidth/2; dy++) {
        for (let dx = -bracketWidth/2; dx < bracketWidth/2; dx++) {
          if (y+dy >= 0 && y+dy < size && x+dx >= 0 && x+dx < size) {
            draw.setPixelColor(bracketColor, x+dx, y+dy);
          }
        }
      }
    }
    
    // Composite the drawing onto the image
    image.composite(draw, 0, 0);
    
    // Save the image
    await image.writeAsync(path.join(__dirname, 'assets', 'icon.png'));
    console.log('Created assets/icon.png');
    
    // Copy the file to windows ico (for development)
    fs.copyFileSync(
      path.join(__dirname, 'assets', 'icon.png'),
      path.join(__dirname, 'assets', 'icon.ico')
    );
    console.log('Created dummy icon.ico for Windows');
    
    // Create macOS iconset
    const iconsetDir = path.join(__dirname, 'icon.iconset');
    if (!fs.existsSync(iconsetDir)) {
      fs.mkdirSync(iconsetDir);
    }
    
    // Create various sizes for macOS
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
    
    // Create icns file
    try {
      execSync(`/usr/bin/iconutil -c icns "${iconsetDir}" -o "${path.join(__dirname, 'assets', 'icon.icns')}"`);
      console.log('Created assets/icon.icns');
    } catch (error) {
      console.error('Error creating icns file:', error);
    }
    
    // Clean up
    fs.rmdirSync(iconsetDir, { recursive: true });
    
    console.log('Icon generation complete!');
  } catch (error) {
    console.error('Error generating custom icon:', error);
  }
}

createCustomIcon(); 