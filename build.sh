#!/bin/bash

set -e

# Determine build type from arguments
BUILD_TYPE=${1:-default}

echo "Building Restify..."
npm run package

case $BUILD_TYPE in
  "mac")
    echo "Building for macOS..."
    bash scripts/build/build-macos.sh
    ;;
  "mac-signed")
    echo "Building for macOS with signing..."
    bash scripts/build/build-signed.sh
    ;;
  "mac-notarized")
    echo "Building for macOS with notarization..."
    bash scripts/build/build-with-notarize.sh
    ;;
  *)
    echo "Build completed successfully."
    echo "For platform-specific builds, use: ./build.sh mac|mac-signed|mac-notarized"
    ;;
esac 