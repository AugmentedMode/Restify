const { notarize } = require('@electron/notarize');
const { build } = require('../../package.json');
const path = require('path');
const fs = require('fs');

exports.default = async function notarizeMacos(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  console.log(`Notarizing ${appName} found at ${appOutDir}`);

  // Check if we have API key credentials
  if (process.env.APPLE_API_KEY && process.env.APPLE_API_KEY_ID && process.env.APPLE_API_KEY_ISSUER) {
    console.log('Using API key for notarization');
    try {
      // API Key based notarization
      const options = {
        tool: 'notarytool',
        appPath: `${appOutDir}/${appName}.app`,
        appleApiKey: process.env.APPLE_API_KEY,
        appleApiKeyId: process.env.APPLE_API_KEY_ID,
        appleApiIssuer: process.env.APPLE_API_KEY_ISSUER,
      };

      await notarize(options);
      console.log(`Successfully notarized ${appName} using API key`);
    } catch (error) {
      console.error('API Key Notarization failed:', error);
      throw error;
    }
  } else if (process.env.APPLE_ID && process.env.APPLE_APP_SPECIFIC_PASSWORD && process.env.APPLE_TEAM_ID) {
    console.log('Using Apple ID and app-specific password for notarization (fallback)');
    try {
      // Fallback to Apple ID based notarization
      const options = {
        tool: 'notarytool',
        appPath: `${appOutDir}/${appName}.app`,
        appleId: process.env.APPLE_ID,
        appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
        teamId: process.env.APPLE_TEAM_ID,
      };
      
      await notarize(options);
      console.log(`Successfully notarized ${appName} using Apple ID`);
    } catch (error) {
      console.error('Apple ID Notarization failed:', error);
      throw error;
    }
  } else {
    console.error('No valid notarization credentials found in environment variables');
    console.error('Set either APPLE_API_KEY + APPLE_API_KEY_ID + APPLE_API_KEY_ISSUER');
    console.error('Or set APPLE_ID + APPLE_APP_SPECIFIC_PASSWORD + APPLE_TEAM_ID');
    throw new Error('Missing notarization credentials');
  }
};
