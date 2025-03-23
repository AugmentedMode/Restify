#!/bin/bash

# Exit on error
set -e

# Load environment variables from .env file if it exists
if [ -f .env ]; then
  echo "Loading environment variables from .env file"
  export $(grep -v '^#' .env | xargs)
fi

# Check if we're in production mode or development/testing mode
if [ "$1" == "--production" ]; then
  # Check for required environment variables in production mode
  if [ -z "$APPLE_ID" ] || [ -z "$APPLE_ID_PASS" ] || [ -z "$APPLE_TEAM_ID" ]; then
    echo "Error: Required environment variables are not set for production build."
    echo "Please create a .env file with the following variables:"
    echo "APPLE_ID=your_apple_id@example.com"
    echo "APPLE_ID_PASS=your_app_specific_password"
    echo "APPLE_TEAM_ID=your_team_id"
    exit 1
  fi
else
  echo "Building in development/testing mode (unsigned). For production build use --production flag."
fi

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf release/build

# Install dependencies if needed
if [ "$1" == "--install" ] || [ "$2" == "--install" ]; then
  echo "Installing dependencies..."
  npm install --legacy-peer-deps
fi

# Build and package the application
echo "Building and packaging application..."
npm run package

echo "Build complete! Check release/build directory for the DMG installer."
echo "You can now upload the DMG file to your website or distribution platform."

# If in development mode, provide instructions for uploading to website
if [ "$1" != "--production" ]; then
  echo ""
  echo "Note: This build is unsigned and will show security warnings when installed."
  echo "For a production build with proper signing, use: ./build-macos.sh --production"
  echo ""
  echo "To create a landing page for your app:"
  echo "1. Copy landing-page-template.html to your website directory"
  echo "2. Update the download links to point to your DMG file"
  echo "3. Add your app screenshots to the landing page"
fi 