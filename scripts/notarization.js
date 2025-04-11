const { notarize } = require('@electron/notarize');
const path = require('path');

exports.default = async function notarizing(context) {
  // Only notarize the app on Mac OS
  if (context.electronPlatformName !== 'darwin') {
    return;
  }
  
  console.log('Notarizing macOS application using notarytool...');
  
  // Get the app path
  const appBundleId = context.packager.appInfo.info._configuration.appId;
  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(context.appOutDir, `${appName}.app`);
  
  // Load notarize environment credentials
  const APPLE_ID = process.env.APPLE_ID || 'mrgiggles017@gmail.com';
  const APPLE_APP_SPECIFIC_PASSWORD = process.env.APPLE_APP_SPECIFIC_PASSWORD || process.env.APPLE_API_PASSWORD || 'bxub-ygne-cgoj-ormo';
  const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID || '3BLRKVZ9R4';
  
  console.log(`Notarizing ${appName} with Apple ID: ${APPLE_ID}`);
  
  try {
    // Notarize the app using notarytool
    await notarize({
      tool: 'notarytool',
      appBundleId,
      appPath,
      appleId: APPLE_ID,
      appleIdPassword: APPLE_APP_SPECIFIC_PASSWORD,
      teamId: APPLE_TEAM_ID,
    });
    
    console.log(`Done notarizing ${appName}`);
  } catch (error) {
    console.error(`Error notarizing ${appName}:`, error);
    throw error;
  }
}; 