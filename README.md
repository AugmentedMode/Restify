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

### macOS Notarization

For distributing on macOS, notarization is required to avoid security warnings:

```bash
npm run package:mac:notarized
```

For more detailed instructions on notarization, see [macOS Notarization Guide](docs/MacOS_NOTARIZATION.md).

## Scripts

- `npm start` - Start the application in development mode
- `npm run package` - Build the application for production
- `npm run package:mac:notarized` - Build, sign, and notarize for macOS distribution
- `npm run lint` - Run the linter
- `npm run test` - Run tests

## License

MIT

# Restify AI Assistant

Restify includes a powerful AI assistant that can help you with various tasks, including creating API endpoints directly from code snippets.

## AI Assistant Features

- Chat with AI models (OpenAI, Anthropic, and custom providers)
- Generate code samples and explanations
- **Create API endpoints from code snippets**

## Creating Endpoints with the AI Assistant

The AI assistant can create API endpoints for you based on code you provide or generate during chat. Here's how to use this feature:

1. Open the AI Assistant in Restify
2. Configure your AI assistant with your preferred provider (OpenAI, Anthropic, etc.)
3. Ask the assistant to create an endpoint by using phrases like:
   - "Create an endpoint that..."
   - "Make an API that..."
   - "Can you create a REST endpoint for..."

4. The assistant will generate code for the endpoint
5. A form will appear allowing you to specify:
   - **Endpoint Path**: The URL path for your API (e.g., `/api/users`)
   - **HTTP Method**: GET, POST, PUT, DELETE, or PATCH
   - **Description**: Optional description of what the endpoint does

6. Click "Create Endpoint" to deploy your API

You can also create an endpoint from any code block the AI generates by clicking the "Create Endpoint" button that appears below code blocks.

## Example Usage

You can ask the AI assistant:

```
Create an endpoint that returns a list of users from a database
```

Or:

```
I need an API endpoint that can process form submissions with validation
```

## Technical Details

The endpoints are created securely with the following features:
- Isolated runtime environment for each endpoint
- Automatic API documentation generation
- Secure authentication options
- Rate limiting and usage monitoring

## Security Notes

- All endpoints are created within your Restify environment
- Code is validated for security issues before deployment
- You can manage and delete created endpoints at any time
