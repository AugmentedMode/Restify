# Restify Development Guide

This document provides guidance for developers working on the Restify project.

## Project Structure

```
restify/
├── .erb/                 # Electron React Boilerplate configuration
├── assets/               # Application assets
├── docs/                 # Documentation
│   ├── api-examples/     # Example API collections
│   └── templates/        # HTML templates
├── scripts/              # Build and utility scripts
│   └── build/            # Build-specific scripts
├── src/                  # Source code
│   ├── main/             # Main process code
│   ├── renderer/         # Renderer process code
│   └── __tests__/        # Tests
└── release/              # Build output
```

## Development Workflow

1. **Setup**: Run `npm install` to install dependencies
2. **Development**: Run `npm start` to start the application in development mode
3. **Testing**: Run `npm test` to run the test suite
4. **Building**: Run `npm run package` to build the application

## Build Process

The application can be built for different platforms:

- `npm run package` - Build for the current platform
- `npm run package:mac` - Build for macOS
- `npm run package:mac:signed` - Build and sign for macOS
- `npm run package:mac:notarized` - Build, sign, and notarize for macOS

## Code Style and Linting

Code style is enforced using ESLint and Prettier. Run `npm run lint` to check for linting issues and `npm run lint:fix` to automatically fix issues.

## Architecture

Restify is built with Electron, React, and TypeScript. The application follows a modular architecture with the following key components:

- **Main Process**: Handles application lifecycle, system integration, and IPC
- **Renderer Process**: Implements the UI and user interactions
- **IPC**: Communication between main and renderer processes

## Testing

Tests are written using Jest and React Testing Library. Run `npm test` to execute the test suite.

## Troubleshooting

If you encounter issues during development:

1. Try clearing the build cache: `rm -rf .erb/dll`
2. Ensure you have the correct Node.js version installed
3. Check the Electron version compatibility 