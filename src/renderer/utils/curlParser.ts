import { v4 as uuidv4 } from 'uuid';
import { ApiRequest, HttpMethod, RequestHeader, BodyType, RequestParam } from '../types';

/**
 * Parse a cURL command and convert it to an ApiRequest object
 * @param curlCommand The cURL command to parse
 * @returns An ApiRequest object
 */
export function parseCurlCommand(curlCommand: string): ApiRequest {
  // Default values
  let method: HttpMethod = 'GET';
  let url = '';
  const headers: RequestHeader[] = [];
  const params: RequestParam[] = [];
  let body = '';
  let username = '';
  let password = '';
  let hasBasicAuth = false;
  
  // Normalize the command - replace line continuations and normalize whitespace
  const normalizedCommand = curlCommand.trim()
    .replace(/\\\n/g, ' ')
    .replace(/\s+/g, ' ');
  
  // Split the curl command into tokens while preserving quoted strings
  const tokens: string[] = [];
  let currentToken = '';
  let inQuotes = false;
  let quoteChar = '';
  
  for (let i = 0; i < normalizedCommand.length; i++) {
    const char = normalizedCommand[i];
    
    if ((char === '"' || char === "'") && (i === 0 || normalizedCommand[i-1] !== '\\')) {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
        quoteChar = '';
      } else {
        currentToken += char;
      }
    } else if (char === ' ' && !inQuotes) {
      if (currentToken) {
        tokens.push(currentToken);
        currentToken = '';
      }
    } else {
      currentToken += char;
    }
  }
  
  if (currentToken) {
    tokens.push(currentToken);
  }
  
  // Extract the URL and parameters
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    // Skip the curl command itself
    if (i === 0 && token.toLowerCase() === 'curl') {
      continue;
    }
    
    // Handle method flag (-X)
    if (token === '-X' && i + 1 < tokens.length) {
      method = tokens[++i] as HttpMethod;
      continue;
    }
    
    // Handle headers (-H)
    if ((token === '-H' || token === '--header') && i + 1 < tokens.length) {
      const headerValue = tokens[++i].replace(/^["']|["']$/g, ''); // Remove surrounding quotes
      const colonIndex = headerValue.indexOf(':');
      
      if (colonIndex > 0) {
        const headerName = headerValue.substring(0, colonIndex).trim();
        const headerVal = headerValue.substring(colonIndex + 1).trim();
        
        headers.push({
          name: headerName,
          value: headerVal,
          enabled: true,
        });
      }
      continue;
    }
    
    // Handle data/body (-d)
    if ((token === '-d' || token === '--data') && i + 1 < tokens.length) {
      body = tokens[++i].replace(/^["']|["']$/g, ''); // Remove surrounding quotes
      
      // If we have a body but no explicit method, assume POST
      if (method === 'GET' && body) {
        method = 'POST';
      }
      continue;
    }
    
    // Handle basic auth (-u)
    if ((token === '-u' || token === '--user') && i + 1 < tokens.length) {
      const authValue = tokens[++i].replace(/^["']|["']$/g, ''); // Remove surrounding quotes
      const colonIndex = authValue.indexOf(':');
      
      if (colonIndex > 0) {
        username = authValue.substring(0, colonIndex);
        password = authValue.substring(colonIndex + 1);
        hasBasicAuth = true;
      }
      continue;
    }
    
    // Skip verbose flag
    if (token === '-v' || token === '--verbose') {
      continue;
    }
    
    // If it's not a flag and doesn't start with a hyphen, it's likely the URL
    if (!token.startsWith('-') && !url) {
      url = token.replace(/^["']|["']$/g, ''); // Remove surrounding quotes
      
      // Parse query parameters if present
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      urlObj.searchParams.forEach((value, key) => {
        params.push({
          name: key,
          value,
          enabled: true,
        });
      });
      
      // Remove query parameters from the URL if we've extracted them
      if (params.length > 0) {
        url = url.split('?')[0];
      }
    }
  }
  
  // If no URL was found, try to find it using a regex
  if (!url) {
    const urlMatch = normalizedCommand.match(/curl\s+["']?(https?:\/\/[^\s"']+)["']?/i);
    if (urlMatch) {
      url = urlMatch[1];
    }
  }
  
  // If the URL doesn't start with http/https, add it
  if (url && !url.startsWith('http')) {
    url = `https://${url}`;
  }
  
  // Determine body type
  let bodyType: BodyType = 'none';
  if (body) {
    // Set default
    bodyType = 'plain-text';
    
    // Check content type header for more specific body type
    const contentTypeHeader = headers.find(h => 
      h.name.toLowerCase() === 'content-type'
    );
    
    if (contentTypeHeader) {
      if (contentTypeHeader.value.includes('application/json')) {
        bodyType = 'json';
      } else if (contentTypeHeader.value.includes('application/x-www-form-urlencoded')) {
        bodyType = 'form-urlencoded';
      } else if (contentTypeHeader.value.includes('multipart/form-data')) {
        bodyType = 'form-data';
      }
    } else {
      // No content type header, try to guess from the body
      if (body.trim().startsWith('{') || body.trim().startsWith('[')) {
        try {
          JSON.parse(body);
          bodyType = 'json';
        } catch {
          // Not valid JSON, keep as plain-text
        }
      } else if (body.includes('&') && body.includes('=')) {
        bodyType = 'form-urlencoded';
      }
    }
  }
  
  // Generate a name for the request
  const urlParts = url.split('/');
  const host = urlParts[2] || '';
  const path = urlParts.slice(3).join('/');
  const name = `${method} ${path || host}`;
  
  // Create and return the request object
  const request: ApiRequest = {
    id: uuidv4(),
    name,
    method,
    url,
    headers,
    params,
    body,
    bodyType,
    folderPath: [],
    auth: {
      type: hasBasicAuth ? 'basic' : 'none',
      bearer: '',
      basic: {
        username,
        password,
      },
    },
  };
  
  // Check for bearer token in headers
  const authHeader = headers.find(h => 
    h.name.toLowerCase() === 'authorization' && 
    h.value.toLowerCase().startsWith('bearer ')
  );
  
  if (authHeader) {
    request.auth.type = 'bearer';
    request.auth.bearer = authHeader.value.substring(7).trim(); // Remove "Bearer " prefix
  }
  
  return request;
}

/**
 * Check if a string is a valid cURL command
 * @param input The string to check
 * @returns True if the string is a valid cURL command
 */
export function isValidCurlCommand(input: string): boolean {
  return input.trim().toLowerCase().startsWith('curl ');
} 