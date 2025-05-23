import { ApiRequest, ApiResponse, RequestHeader, RequestParam, Environment } from '../types';
import { decryptValue } from './encryptionUtils';
import { useSettings } from './SettingsContext';

/**
 * Process URL with environment variables
 */
export const processUrl = async (url: string, environment?: Environment): Promise<string> => {
  if (!environment) return url;
  
  let processedUrl = url;
  
  // Replace all {{variableName}} with the variable value
  // Using a for..of loop to handle async operations
  for (const [key, value] of Object.entries(environment.variables)) {
    // For encrypted values, decrypt them before substitution
    let actualValue = value;
    try {
      if (typeof value === 'string') {
        actualValue = await decryptValue(value);
      }
    } catch (error) {
      console.error(`Error decrypting variable ${key}:`, error);
    }
      
    processedUrl = processedUrl.replace(new RegExp(`{{${key}}}`, 'g'), actualValue);
  }
  
  return processedUrl;
};

/**
 * Process URL with both environment variables and query parameters
 */
export const processUrlWithParams = async (
  url: string, 
  params: RequestParam[] = [], 
  environment?: Environment
): Promise<string> => {
  // First replace environment variables
  let processedUrl = environment ? await processUrl(url, environment) : url;
  
  // Then add query parameters
  const enabledParams = params.filter(param => param.enabled && param.name.trim());
  
  if (enabledParams.length === 0) {
    return processedUrl;
  }
  
  // Create URLSearchParams
  const searchParams = new URLSearchParams();
  enabledParams.forEach(param => {
    searchParams.append(param.name, param.value);
  });
  
  // Check if URL already has query parameters
  const hasQueryParams = processedUrl.includes('?');
  
  // Add query parameters to URL
  return `${processedUrl}${hasQueryParams ? '&' : '?'}${searchParams.toString()}`;
};

/**
 * Convert request parameters to URL search params format
 */
export const paramsToObject = (params: RequestParam[]): Record<string, string> => {
  const enabledParams = params.filter(param => param.enabled);
  
  return enabledParams.reduce((acc, param) => {
    acc[param.name] = param.value;
    return acc;
  }, {} as Record<string, string>);
};

/**
 * Convert headers to a simple object
 */
export const headersToObject = (headers: RequestHeader[] | Record<string, string>): Record<string, string> => {
  if (!Array.isArray(headers)) {
    return headers; // Already an object
  }
  
  return headers
    .filter(header => header.enabled && header.name)
    .reduce((acc, header) => {
      acc[header.name] = header.value;
      return acc;
    }, {} as Record<string, string>);
};

/**
 * Execute an API request using Electron IPC
 */
export const executeRequest = async (
  request: ApiRequest,
  environment?: Environment
): Promise<ApiResponse> => {
  // Get settings from local storage to avoid React context limitations outside components
  const savedSettings = localStorage.getItem('restifySettings');
  const settings = savedSettings ? JSON.parse(savedSettings) : null;
  
  const processedUrl = await processUrl(request.url, environment);
  const params = paramsToObject(request.params);
  const headers = headersToObject(request.headers);
  
  // Process the body based on its type
  let parsedBody = undefined;
  
  if (request.body) {
    switch (request.bodyType) {
      case 'json':
        try {
          parsedBody = JSON.parse(request.body);
        } catch (error) {
          console.error('Error parsing JSON body:', error);
          parsedBody = request.body; // Use as raw text if not valid JSON
        }
        break;
      
      case 'form-data':
        // For form data, we'll let the Electron side handle the multipart/form-data
        // Here we just parse it to a key-value object
        try {
          const formData = {};
          const lines = request.body.split('\n');
          
          lines.forEach(line => {
            const [key, value] = line.split(':').map(part => part.trim());
            if (key && value) {
              formData[key] = value;
            }
          });
          
          parsedBody = formData;
        } catch (error) {
          console.error('Error parsing form data:', error);
          parsedBody = request.body;
        }
        break;
      
      case 'form-urlencoded':
        try {
          const formData = {};
          const pairs = request.body.split('&');
          
          pairs.forEach(pair => {
            const [key, value] = pair.split('=').map(part => decodeURIComponent(part.trim()));
            if (key) {
              formData[key] = value || '';
            }
          });
          
          parsedBody = formData;
        } catch (error) {
          console.error('Error parsing URL encoded data:', error);
          parsedBody = request.body;
        }
        break;
      
      case 'graphql':
        try {
          parsedBody = JSON.parse(request.body);
        } catch (error) {
          console.error('Error parsing GraphQL query:', error);
          // Attempt to convert it to a proper GraphQL request format
          parsedBody = {
            query: request.body,
            variables: {}
          };
        }
        break;
      
      // For other types, pass the content as is
      default:
        parsedBody = request.body;
    }
  }
  
  // Create request data for IPC
  const requestData = {
    method: request.method.toLowerCase(),
    url: processedUrl,
    headers,
    params,
    data: parsedBody,
    bodyType: request.bodyType,
    // Add API settings
    settings: {
      timeout: settings?.api?.defaultTimeout || 30000,
      followRedirects: settings?.api?.followRedirects !== false, // default to true
      validateSSL: settings?.api?.validateSSL !== false, // default to true
    }
  };
  
  try {
    // Send request through Electron IPC
    // @ts-ignore - window.electron is added by preload
    const response = await window.electron.ipcRenderer.invoke('execute-request', requestData);
    
    return response as ApiResponse;
  } catch (error: any) {
    // Return error as response
    return {
      status: 0,
      statusText: error.message || 'Request failed',
      headers: {},
      data: null,
      time: 0,
      size: 0,
    };
  }
};

/**
 * Save collections to file system
 */
export const saveCollections = async (collections: any[]): Promise<{ success: boolean, error?: string }> => {
  try {
    // @ts-ignore - window.electron is added by preload
    return await window.electron.ipcRenderer.invoke('save-collections', collections);
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Load collections from file system
 */
export const loadCollections = async (): Promise<{ success: boolean, collections?: any[], error?: string }> => {
  try {
    // @ts-ignore - window.electron is added by preload
    return await window.electron.ipcRenderer.invoke('load-collections');
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Save request history to file system
 */
export const saveHistory = async (history: any[]): Promise<{ success: boolean, error?: string }> => {
  try {
    // @ts-ignore - window.electron is added by preload
    return await window.electron.ipcRenderer.invoke('save-history', history);
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Load request history from file system
 */
export const loadHistory = async (): Promise<{ success: boolean, history?: any[], error?: string }> => {
  try {
    // @ts-ignore - window.electron is added by preload
    return await window.electron.ipcRenderer.invoke('load-history');
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Add this new function to clear local storage data
export const clearAllStorageData = (): { success: boolean, message: string } => {
  try {
    // Clear saved responses
    localStorage.removeItem('api-client-responses');
    
    // Clear active request ID
    localStorage.removeItem('api-client-active-request-id');
    
    // Clear collections
    localStorage.removeItem('api-client-collections');
    
    // Clear history
    localStorage.removeItem('api-client-history');
    
    return { 
      success: true, 
      message: 'All app data has been successfully cleared from local storage.' 
    };
  } catch (error) {
    console.error('Failed to clear storage data:', error);
    return { 
      success: false, 
      message: `Failed to clear storage data: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};
