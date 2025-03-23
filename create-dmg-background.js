const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function createDmgBackground() {
  // Create a simple HTML file based on the landing page
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          margin: 0;
          padding: 0;
          width: 540px;
          height: 380px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #0f172a;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          color: #f8fafc;
        }
        .logo {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 20px;
          background: linear-gradient(90deg, #6366f1, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .instructions {
          font-size: 1rem;
          color: #94a3b8;
          margin-top: 20px;
          text-align: center;
        }
        .arrow {
          width: 100px;
          height: 40px;
          margin: 20px 0;
          position: relative;
        }
        .arrow::after {
          content: "→";
          position: absolute;
          font-size: 2rem;
          color: #6366f1;
          left: 50%;
          transform: translateX(-50%);
        }
        .icons {
          display: flex;
          width: 100%;
          justify-content: space-around;
          padding: 0 100px;
        }
        .app-icon, .applications-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .icon {
          width: 80px;
          height: 80px;
          background-color: #1e293b;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }
        .icon-text {
          font-size: 0.9rem;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="logo">Restify</div>
      <div class="instructions">Drag Restify to your Applications folder to install</div>
      <div class="icons">
        <div class="app-icon">
          <div class="icon">App</div>
          <div class="icon-text">Restify</div>
        </div>
        <div class="arrow"></div>
        <div class="applications-icon">
          <div class="icon">Apps</div>
          <div class="icon-text">Applications</div>
        </div>
      </div>
    </body>
    </html>
  `;

  const tempHtmlPath = path.join(__dirname, 'temp-dmg-background.html');
  fs.writeFileSync(tempHtmlPath, html);

  // Launch puppeteer to take a screenshot
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 540, height: 380 });
  await page.goto(`file://${tempHtmlPath}`);
  
  // Ensure assets directory exists
  const assetsDir = path.join(__dirname, 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
  }
  
  // Take screenshot and save as PNG
  await page.screenshot({ path: path.join(assetsDir, 'dmg-background.png') });
  
  await browser.close();
  
  // Clean up temporary html file
  fs.unlinkSync(tempHtmlPath);
  
  console.log('DMG background created successfully at assets/dmg-background.png');
}

createDmgBackground().catch(console.error); 