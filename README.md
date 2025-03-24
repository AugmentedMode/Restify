# Restify

A modern REST API client for developers.

## Overview

Restify is a desktop application built with Electron and React that helps developers test and interact with REST APIs. It provides a clean, intuitive interface for making API requests, organizing collections, and visualizing responses.

## Features

- Intuitive interface for creating and sending REST API requests
- Support for all HTTP methods (GET, POST, PUT, DELETE, etc.)
- Request organization with collections and folders
- Response visualization with syntax highlighting
- Environment variables and request parameterization
- Request history tracking

## Development

### Prerequisites

- Node.js 16+
- npm 7+

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/restify.git
cd restify

# Install dependencies
npm install
```

### Running in Development Mode

```bash
npm start
```

### Building for Production

```bash
npm run package
```

This will create platform-specific installers in the `release` directory.

## Scripts

- `npm start` - Start the application in development mode
- `npm run package` - Build the application for production
- `npm run lint` - Run the linter
- `npm run test` - Run tests

## License

MIT
