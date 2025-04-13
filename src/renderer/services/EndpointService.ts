/**
 * Service for creating and managing API endpoints based on provided code
 */
import { ApiResponse, Folder, ApiRequest as AppApiRequest, HttpMethod } from '../types';
import { RequestService } from './RequestService';
import { v4 as uuidv4 } from 'uuid';
import { parseCurlCommand } from '../utils/curlParser';
import { CollectionsService } from './DatabaseService';
import EventService from './EventService';

// Type definitions
export type HttpMethodType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface EndpointConfig {
  path: string;
  method: HttpMethodType;
  code: string;
  description?: string;
  requiresAuth?: boolean;
  collectionId?: string; // Collection to add endpoint to
}

export interface EndpointCreationResponse {
  success: boolean;
  url?: string;
  error?: string;
  endpointId?: string;
  requestId?: string;
  collectionId?: string;
  collectionName?: string;
  collectionPath?: string;
  additionalData?: {
    requestExample?: string;
    responseExample?: string;
    curl?: string;
    metadata?: Record<string, unknown>;
  };
}

export interface AIEndpointSchema {
  endpoint: string;
  method: HttpMethodType;
  requestFormat?: string;
  responseFormat: string;
  description: string;
  implementation: string;
  authRequired?: boolean;
  collectionName?: string;     // Name for a new collection or existing collection
  collectionId?: string;       // Existing collection ID
  collectionPath?: string[];   // Path to nested collection (e.g., ["API Collection", "User Management"])
}

// API Request structure to match app's collection structure
export interface ApiEndpointRequest extends Omit<AppApiRequest, 'method'> {
  method: string;
  implementation: string;
  createdAt: string;
  updatedAt: string;
}

// Extended Folder type that includes timestamps
interface AIFolder extends Omit<Folder, 'items'> {
  items: (ApiEndpointRequest | AIFolder)[];
  createdAt: string;
  updatedAt: string;
}

// Custom error types for better error handling
export class EndpointError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EndpointError';
  }
}

export class EndpointValidationError extends EndpointError {
  constructor(message: string) {
    super(message);
    this.name = 'EndpointValidationError';
  }
}

/**
 * Service for managing API endpoints
 */
export class EndpointService {
  private static readonly ENDPOINT_STORAGE_KEY = 'user_created_endpoints';
  private static readonly DEFAULT_COLLECTION_NAME = 'AI Generated Endpoints';
  
  /**
   * Create a new API endpoint based on provided code
   * @param config The endpoint configuration
   */
  public static async createEndpoint(config: EndpointConfig): Promise<EndpointCreationResponse> {
    try {
      // Validate the endpoint configuration
      this.validateEndpointConfig(config);
      
      // For demo purposes, we'll simulate the endpoint creation
      const endpointId = `endpoint_${Date.now()}`;
      const url = `https://api.example.com/custom/${config.path}`;
      
      // Create API request structure
      const requestId = uuidv4();
      const apiRequest = this.createApiRequest(requestId, config, url);
      
      // Store the endpoint in collections structure
      const collectionId = config.collectionId || 
        await this.addToCollection(apiRequest, this.DEFAULT_COLLECTION_NAME);
      
      // Store the endpoint information for legacy support
      const endpointData = {
        id: endpointId,
        requestId,
        collectionId,
        url,
        ...config,
        createdAt: new Date().toISOString()
      };
      this.storeEndpoint(endpointData);
      
      // Return success response
      return {
        success: true,
        url,
        endpointId,
        requestId,
        collectionId
      };
    } catch (error) {
      console.error('[Endpoint] Error creating endpoint:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Process and create an endpoint directly from AI assistant
   * This is the method that will be called by the AI tool
   */
  public static async createEndpointFromAITool(schema: AIEndpointSchema): Promise<EndpointCreationResponse> {
    try {
      console.log('[Endpoint] Creating AI-driven endpoint', schema.endpoint);
      
      // Enhanced validation for AI-produced schemas
      this.validateAIEndpointSchema(schema);
      
      // Sanitize the endpoint path
      const path = this.sanitizePath(schema.endpoint);
      
      // Process and enhance the implementation code if needed
      const enhancedCode = this.processImplementationCode(schema.implementation, schema.method);
      
      // Create the endpoint with enhanced metadata
      const endpointId = `ai_endpoint_${Date.now()}`;
      
      // Generate proper URL for the endpoint (handles both paths and full URLs)
      const url = this.generateEndpointUrl(schema.endpoint);
      
      // Generate a name for the endpoint
      const name = this.generateEndpointName(schema);
      
      // Generate curl command for the endpoint
      const curlCommand = this.generateCurlCommand(
        schema.method, 
        url, 
        schema.requestFormat || '{}',
        name
      );
      
      console.log('[Endpoint] Generated curl command:', curlCommand);
      
      // Use the curl parser to convert to an API request (same as import functionality)
      const parsedRequest = parseCurlCommand(curlCommand);
      
      // Enhance the parsed request with the fields needed for our ApiEndpointRequest
      const apiRequest: ApiEndpointRequest = {
        ...parsedRequest,
        implementation: enhancedCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        name // Use the generated name
      };
      
      // Handle collection path if provided
      const { collectionId, collectionPathString } = await this.handleCollectionPlacement(apiRequest, schema);
      
      // Get collection name for response
      const collection = await this.getCollectionById(collectionId);
      
      // Additional metadata for AI-created endpoints
      const metadata = this.createEndpointMetadata(
        endpointId, 
        apiRequest.id, 
        collectionId, 
        schema, 
        path, 
        url, 
        enhancedCode
      );
      
      // Store with enhanced metadata for legacy support
      this.storeEndpoint(metadata);
      
      // Return detailed response for AI to format nicely
      return {
        success: true,
        url,
        endpointId,
        requestId: apiRequest.id,
        collectionId,
        collectionName: collection?.name || schema.collectionName || this.DEFAULT_COLLECTION_NAME,
        collectionPath: collectionPathString || undefined,
        // Additional data to help the AI format its response
        additionalData: {
          requestExample: schema.requestFormat 
            ? this.generateRequestExample(schema.method, url, schema.requestFormat)
            : this.generateDefaultRequestExample(schema.method, url),
          responseExample: schema.responseFormat,
          curl: curlCommand,
          metadata
        }
      };
    } catch (error) {
      console.error('[Endpoint] Error creating AI endpoint:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Validate AI endpoint schema
   */
  private static validateAIEndpointSchema(schema: AIEndpointSchema): void {
    if (!schema.endpoint) {
      throw new EndpointValidationError('Endpoint path is required');
    }
    
    if (!schema.method) {
      throw new EndpointValidationError('HTTP method is required');
    }
    
    if (!schema.implementation) {
      throw new EndpointValidationError('Endpoint implementation is required');
    }
    
    if (!schema.responseFormat) {
      throw new EndpointValidationError('Response format is required');
    }
  }
  
  /**
   * Sanitize the endpoint path
   */
  private static sanitizePath(path: string): string {
    return path.startsWith('/') ? path.substring(1) : path;
  }
  
  /**
   * Generate a proper URL for the endpoint
   * Handles both relative paths and fully qualified URLs
   */
  private static generateEndpointUrl(endpoint: string): string {
    // Check if the endpoint is already a full URL
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    
    // Otherwise, treat it as a path and append to the base URL
    const path = this.sanitizePath(endpoint);
    return `https://api.example.com/custom/${path}`;
  }
  
  /**
   * Generate a name for the endpoint based on schema
   */
  private static generateEndpointName(schema: AIEndpointSchema): string {
    return schema.description ? 
      schema.description.split('.')[0].trim() : 
      `${schema.method} ${schema.endpoint}`;
  }
  
  /**
   * Create endpoint metadata object
   */
  private static createEndpointMetadata(
    endpointId: string,
    requestId: string,
    collectionId: string,
    schema: AIEndpointSchema,
    path: string,
    url: string,
    code: string
  ): Record<string, unknown> {
    return {
      id: endpointId,
      requestId,
      collectionId,
      collectionPath: schema.collectionPath,
      url,
      path,
      method: schema.method,
      code,
      description: schema.description,
      requestFormat: schema.requestFormat || null,
      responseFormat: schema.responseFormat,
      authRequired: schema.authRequired || false,
      source: 'ai-assistant',
      createdAt: new Date().toISOString(),
      status: 'active'
    };
  }
  
  /**
   * Handle placement of endpoint in collection structure
   */
  private static async handleCollectionPlacement(
    apiRequest: ApiEndpointRequest, 
    schema: AIEndpointSchema
  ): Promise<{ collectionId: string; collectionPathString: string }> {
    let collectionId: string;
    let collectionPathString = '';
    
    if (schema.collectionPath && schema.collectionPath.length > 0) {
      // Build nested collection path
      collectionId = await this.addToNestedCollection(
        apiRequest, 
        schema.collectionPath
      );
      collectionPathString = schema.collectionPath.join(' > ');
    } else if (schema.collectionName) {
      // Use simple named collection
      collectionId = await this.addToCollection(apiRequest, schema.collectionName);
    } else {
      // Default collection
      collectionId = await this.addToCollection(apiRequest, this.DEFAULT_COLLECTION_NAME);
    }
    
    return { collectionId, collectionPathString };
  }
  
  /**
   * Create an API request object that matches the app's structure
   */
  private static createApiRequest(
    id: string, 
    config: Partial<EndpointConfig>, 
    url: string,
    name?: string
  ): ApiEndpointRequest {
    // Convert method to HttpMethod
    const method = config.method || 'GET';
    
    return {
      id,
      name: name || `${method} ${config.path}`,
      url,
      method,
      params: [],
      headers: [
        { name: 'Content-Type', value: 'application/json', enabled: true }
      ],
      body: {
        mode: 'raw',
        raw: '{}'
      },
      bodyType: 'json',
      folderPath: [],
      auth: {
        type: config.requiresAuth ? 'bearer' : 'none',
        bearer: ''
      },
      implementation: config.code || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Add a request to a collection
   * Creates a new collection if needed or adds to existing
   */
  private static async addToCollection(request: ApiEndpointRequest, collectionName: string): Promise<string> {
    const collections = await this.getCollections();
    
    // Look for existing AI collection
    let aiCollection = collections.find(c => c.name === collectionName);
    
    // Create AI collection if it doesn't exist
    if (!aiCollection) {
      aiCollection = this.createNewCollection(collectionName);
      collections.push(aiCollection);
    }
    
    // Add request to collection
    if (aiCollection) {
      aiCollection.items.push(request);
      aiCollection.updatedAt = new Date().toISOString();
    }
    
    // Save updated collections
    await this.saveCollections(collections);
    
    return aiCollection?.id || '';
  }
  
  /**
   * Create a new collection with the specified name
   */
  private static createNewCollection(name: string): AIFolder {
    return {
      id: uuidv4(),
      name,
      items: [],
      parentPath: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Add a request to a nested collection path
   * Creates collections in the path if they don't exist
   */
  private static async addToNestedCollection(
    request: ApiEndpointRequest, 
    collectionPath: string[]
  ): Promise<string> {
    if (!collectionPath || collectionPath.length === 0) {
      throw new EndpointValidationError('Collection path cannot be empty');
    }
    
    const collections = await this.getCollections();
    let currentLevel = collections;
    let currentFolder: AIFolder | undefined;
    let parentPath: string[] = [];
    
    // Create or navigate to each level of the path
    for (let i = 0; i < collectionPath.length; i++) {
      const folderName = collectionPath[i];
      parentPath = collectionPath.slice(0, i);
      
      // Look for existing folder at this level
      let folder = currentLevel.find(item => item.name === folderName) as AIFolder;
      
      if (!folder) {
        // Create folder if it doesn't exist
        folder = {
          id: uuidv4(),
          name: folderName,
          items: [],
          parentPath: [...parentPath],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        currentLevel.push(folder);
      }
      
      currentFolder = folder;
      
      // Set up for next level
      if (i < collectionPath.length - 1) {
        // Ensure items is initialized
        if (!folder.items) {
          folder.items = [];
        }
        currentLevel = folder.items as AIFolder[];
      }
    }
    
    // Add the request to the final folder
    if (currentFolder) {
      currentFolder.items.push(request);
      currentFolder.updatedAt = new Date().toISOString();
      
      // Save the updated collections
      await this.saveCollections(collections);
      
      return currentFolder.id;
    }
    
    throw new EndpointError('Failed to create or find the specified collection path');
  }
  
  /**
   * Get stored collections from localStorage
   */
  private static async getCollections(): Promise<AIFolder[]> {
    try {
      // Use the DatabaseService to get collections
      const collections = await CollectionsService.getAllCollections();
      return collections as AIFolder[];
    } catch (error) {
      console.error('[Endpoint] Error getting collections:', error);
      return [];
    }
  }
  
  /**
   * Get a collection by ID
   */
  private static async getCollectionById(id: string): Promise<AIFolder | undefined> {
    try {
      const collections = await this.getCollections();
      return collections.find(c => c.id === id);
    } catch (error) {
      console.error('[Endpoint] Error getting collection by ID:', error);
      return undefined;
    }
  }
  
  /**
   * Save collections to the database
   */
  private static async saveCollections(collections: AIFolder[]): Promise<void> {
    try {
      // Use the DatabaseService to save all collections
      await CollectionsService.saveAllCollections(collections as Folder[]);
      console.log('[Endpoint] Collections saved successfully');
      
      // Notify the rest of the app that collections have been updated
      EventService.notifyCollectionsUpdated();
    } catch (error) {
      console.error('[Endpoint] Error saving collections:', error);
      throw new EndpointError(`Failed to save collections: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Process and enhance the implementation code
   */
  private static processImplementationCode(code: string, method: string): string {
    // In a real implementation, this might:
    // - Add security checks
    // - Add logging
    // - Add error handling
    // - Add request validation
    // - Add proper response formatting
    
    // Basic implementation for demo
    return code;
  }
  
  /**
   * Generate a curl example for the created endpoint
   */
  private static generateCurlExample(method: string, url: string, requestFormat?: string): string {
    let curlCmd = `curl -X ${method} ${url}`;
    
    if (method !== 'GET' && requestFormat) {
      curlCmd += ` -H "Content-Type: application/json" -d '${requestFormat}'`;
    }
    
    return curlCmd;
  }
  
  /**
   * Generate a request example based on the method and format
   */
  private static generateRequestExample(method: string, url: string, requestFormat: string): string {
    if (method === 'GET') {
      return `${method} ${url}`;
    }
    
    return `${method} ${url}\nContent-Type: application/json\n\n${requestFormat}`;
  }
  
  /**
   * Generate a default request example if none provided
   */
  private static generateDefaultRequestExample(method: string, url: string): string {
    if (method === 'GET') {
      return `${method} ${url}`;
    }
    
    return `${method} ${url}\nContent-Type: application/json\n\n{}`;
  }
  
  /**
   * Validate endpoint configuration
   */
  private static validateEndpointConfig(config: EndpointConfig): void {
    if (!config.path) {
      throw new EndpointValidationError('Endpoint path is required');
    }
    
    if (!config.method) {
      throw new EndpointValidationError('HTTP method is required');
    }
    
    if (!config.code || config.code.trim() === '') {
      throw new EndpointValidationError('Endpoint code is required');
    }
    
    // Additional validation could be done here
    // - Check for security issues in code
    // - Validate path format
    // - Ensure code follows expected patterns
  }
  
  /**
   * Store endpoint information for later retrieval
   */
  private static storeEndpoint(endpoint: Record<string, unknown>): void {
    const storedEndpoints = this.getStoredEndpoints();
    storedEndpoints.push(endpoint);
    
    localStorage.setItem(
      this.ENDPOINT_STORAGE_KEY,
      JSON.stringify(storedEndpoints)
    );
  }
  
  /**
   * Get all stored endpoints
   */
  public static getStoredEndpoints(): Record<string, unknown>[] {
    const storedEndpoints = localStorage.getItem(this.ENDPOINT_STORAGE_KEY);
    if (!storedEndpoints) return [];
    
    try {
      return JSON.parse(storedEndpoints);
    } catch (error) {
      console.error('[Endpoint] Error parsing stored endpoints:', error);
      return [];
    }
  }
  
  /**
   * Delete a stored endpoint
   */
  public static deleteEndpoint(endpointId: string): boolean {
    const storedEndpoints = this.getStoredEndpoints();
    const filteredEndpoints = storedEndpoints.filter(ep => ep.id !== endpointId);
    
    if (filteredEndpoints.length === storedEndpoints.length) {
      return false; // No endpoint was removed
    }
    
    localStorage.setItem(
      this.ENDPOINT_STORAGE_KEY,
      JSON.stringify(filteredEndpoints)
    );
    
    return true;
  }
  
  /**
   * Generate a full curl command for the created endpoint
   * This matches the format expected by the curl parser
   */
  private static generateCurlCommand(
    method: string, 
    url: string, 
    requestBody: string,
    name?: string
  ): string {
    let curlCmd = `curl -X ${method} ${url}`;
    
    // Add content type header for non-GET requests
    if (method !== 'GET') {
      curlCmd += ` -H 'Content-Type: application/json'`;
    }
    
    // Add request body for non-GET requests
    if (method !== 'GET' && requestBody) {
      // Ensure the request body is a properly formatted string
      let formattedBody = requestBody;
      if (typeof formattedBody === 'object') {
        try {
          formattedBody = JSON.stringify(formattedBody);
        } catch (e) {
          console.error('[Endpoint] Error stringifying request body:', e);
        }
      }
      
      // Double quotes in JSON need to be escaped for curl
      formattedBody = formattedBody.replace(/"/g, '\\"');
      curlCmd += ` -d "${formattedBody}"`;
    }
    
    return curlCmd;
  }
}

export default EndpointService; 