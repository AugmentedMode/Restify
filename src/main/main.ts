/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import axios from 'axios';
import fs from 'fs';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

// Configure logging safely
log.info('App starting...');
// Configure autoUpdater to use electron-log
autoUpdater.logger = log;

// Check for updates
const checkForUpdates = () => {
  log.info('Checking for updates...');
  autoUpdater.checkForUpdatesAndNotify()
    .catch(err => {
      log.error('Error checking for updates:', err);
    });
};

// Setup auto-updater events
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info);
});

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available:', info);
});

autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let logMessage = `Download speed: ${progressObj.bytesPerSecond}`;
  logMessage = `${logMessage} - Downloaded ${progressObj.percent}%`;
  logMessage = `${logMessage} (${progressObj.transferred}/${progressObj.total})`;
  log.info(logMessage);
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info);
});

// Check for updates after app is ready
app.on('ready', () => {
  // Check for updates immediately
  checkForUpdates();
  
  // Check for updates every 4 hours
  setInterval(checkForUpdates, 4 * 60 * 60 * 1000);
});

let mainWindow: BrowserWindow | null = null;

// Path for storing collections
const getCollectionsPath = () => {
  return path.join(app.getPath('userData'), 'collections.json');
};

// Path for storing request history
const getHistoryPath = () => {
  return path.join(app.getPath('userData'), 'history.json');
};

// API Request handler
ipcMain.handle('execute-request', async (_, requestData) => {
  try {
    const { method, url, headers, data, params } = requestData;
    
    const startTime = Date.now();
    
    // Set response type to json for proper parsing
    // Use maxContentLength and maxBodyLength to prevent crashes with very large responses
    const response = await axios({
      method,
      url,
      headers,
      data,
      params,
      responseType: 'json',
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      // Add timeout to prevent hanging requests
      timeout: 60000, // 60 seconds
    });
    
    const endTime = Date.now();
    
    // Calculate size more efficiently for large responses
    let responseSize = 0;
    
    if (response.data !== null && response.data !== undefined) {
      // For large responses, use a more efficient way to estimate size
      if (typeof response.data === 'string') {
        responseSize = response.data.length;
      } else if (typeof response.data === 'object') {
        try {
          // Use a more memory-efficient way to measure size
          // For very large objects, this is an estimate to avoid memory issues
          // Sample a few keys if the object has many keys
          const keys = Object.keys(response.data);
          if (keys.length > 100) {
            // Sample a subset of keys to estimate size
            const sampleSize = 50;
            let sampleSum = 0;
            for (let i = 0; i < sampleSize; i += 1) {
              const sampleKey = keys[Math.floor(i * (keys.length / sampleSize))];
              try {
                const keySize = JSON.stringify(sampleKey).length;
                const valueSize = JSON.stringify(
                  response.data[sampleKey]
                ).length;
                sampleSum += keySize + valueSize + 2; // +2 for colon and comma
              } catch {
                // Skip if we can't stringify
              }
            }
            // Estimate full size based on sample
            responseSize = Math.floor((sampleSum / sampleSize) * keys.length) + 2; // +2 for braces
          } else {
            // For smaller objects, stringify the whole thing
            responseSize = JSON.stringify(response.data).length;
          }
        } catch (err) {
          // If we have an error calculating size, estimate conservatively
          responseSize = 1000000; // 1MB estimated
          console.error('Error calculating response size:', err);
        }
      }
    }
    
    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      time: endTime - startTime,
      size: responseSize,
    };
  } catch (error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      let errorResponseSize = 0;
      try {
        errorResponseSize = JSON.stringify(error.response.data || '').length;
      } catch {
        // If stringification fails, estimate
        errorResponseSize = 1000;
      }
      
      return {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data,
        time: 0,
        size: errorResponseSize,
      };
    }
    
    // The request was made but no response was received or
    // something happened in setting up the request that triggered an Error
    return {
      status: 0,
      statusText: error.message || 'Request failed',
      headers: {},
      data: null,
      time: 0,
      size: 0,
    };
  }
});

// Save collections
ipcMain.handle('save-collections', async (_, collections) => {
  try {
    fs.writeFileSync(getCollectionsPath(), JSON.stringify(collections, null, 2));
    return { success: true };
  } catch (error: any) {
    console.error('Failed to save collections:', error);
    return { success: false, error: error.message };
  }
});

// Load collections
ipcMain.handle('load-collections', async () => {
  try {
    if (fs.existsSync(getCollectionsPath())) {
      const data = fs.readFileSync(getCollectionsPath(), 'utf8');
      return { success: true, collections: JSON.parse(data) };
    }
    return { success: true, collections: [] };
  } catch (error: any) {
    console.error('Failed to load collections:', error);
    return { success: false, error: error.message };
  }
});

// Save request history
ipcMain.handle('save-history', async (_, history) => {
  try {
    fs.writeFileSync(getHistoryPath(), JSON.stringify(history, null, 2));
    return { success: true };
  } catch (error: any) {
    console.error('Failed to save history:', error);
    return { success: false, error: error.message };
  }
});

// Load request history
ipcMain.handle('load-history', async () => {
  try {
    if (fs.existsSync(getHistoryPath())) {
      const data = fs.readFileSync(getHistoryPath(), 'utf8');
      return { success: true, history: JSON.parse(data) };
    }
    return { success: true, history: [] };
  } catch (error: any) {
    console.error('Failed to load history:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  // IMPORTANT: Force-use our custom icon instead of default Electron icon
  // Use icon-custom.png directly instead of the standard icon names that might be cached
  const iconPath = path.join(RESOURCES_PATH, 'icon-custom.png');
  console.log('Using custom icon path:', iconPath);
  console.log('Icon exists:', fs.existsSync(iconPath));
  
  // Debug log all files in the assets directory to check for available icons
  console.log('Assets directory:', RESOURCES_PATH);
  if (fs.existsSync(RESOURCES_PATH)) {
    console.log('Assets directory contents:', fs.readdirSync(RESOURCES_PATH));
    
    // Check the icons subdirectory if it exists
    const iconsDir = path.join(RESOURCES_PATH, 'icons');
    if (fs.existsSync(iconsDir)) {
      console.log('Icons directory contents:', fs.readdirSync(iconsDir));
    }
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1280,
    height: 800,
    minWidth: 770,
    minHeight: 660,
    icon: iconPath, // Use our custom icon directly
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Auto-updater (commented out for now as it's not properly defined)
  // new AppUpdater();

  // Set dock icon explicitly for macOS
  if (process.platform === 'darwin') {
    const restifyIconPath = path.join(RESOURCES_PATH, 'icon.icns');
    console.log('Setting dock icon path:', restifyIconPath);
    console.log('Dock icon exists:', fs.existsSync(restifyIconPath));
    app.dock.setIcon(restifyIconPath);
  }
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    // Set app icon explicitly for all platforms
    const RESOURCES_PATH = app.isPackaged
      ? path.join(process.resourcesPath, 'assets')
      : path.join(__dirname, '../../assets');
        
    if (process.platform === 'darwin') {
      // Direct path to our custom icon to bypass any caching issues
      const iconPath = path.join(RESOURCES_PATH, 'icon-custom.png');
      console.log('Setting macOS app icon explicitly:', iconPath);
      console.log('Icon exists:', fs.existsSync(iconPath));
      try {
        app.dock.setIcon(iconPath);
      } catch (error) {
        console.error('Failed to set dock icon:', error);
      }
    }
    
    // Create the main window after setting the icon
    createWindow();
    
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
