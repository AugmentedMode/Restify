/**
 * Service for integrating LLM capabilities into the app using Vercel AI SDK
 */
import axios from 'axios';
import { EndpointService, EndpointConfig, EndpointCreationResponse } from './EndpointService';
import AIToolsService, { AITool } from './AIToolsService';
import EventService from './EventService';

type AIModelProvider = 'openai' | 'anthropic' | 'gemini' | 'mistral' | 'custom';

interface AIModelConfig {
  provider: AIModelProvider;
  model: string;
  apiKey: string;
  apiUrl?: string;
}

// Define tool request format for AI models
interface AIToolCall {
  type: string;
  parameters: any;
}

// Simple event emitter for streaming completions
export class CompletionStream {
  private listeners: { [event: string]: Function[] } = {
    'data': [],
    'done': [],
    'error': []
  };

  constructor(private initialText: string = '') {}

  on(event: 'data' | 'done' | 'error', callback: Function) {
    this.listeners[event].push(callback);
    return this;
  }

  emit(event: 'data' | 'done' | 'error', data?: any) {
    this.listeners[event].forEach(callback => callback(data));
    return this;
  }

  append(text: string) {
    this.emit('data', text);
  }

  done() {
    this.emit('done');
  }

  error(err: Error) {
    this.emit('error', err);
  }
}

export class AIService {
  private static readonly API_KEY_STORAGE_KEY = 'ai_api_key_encrypted';
  private static readonly MODEL_CONFIG_KEY = 'ai_model_config';
  
  private config: AIModelConfig | null = null;
  private tools: AITool[] = [];
  
  /**
   * Initialize the AI service with configuration
   * @param config The AI model configuration
   */
  public initialize(config: AIModelConfig): void {
    this.config = config;
    
    // Store configuration for future use
    localStorage.setItem(AIService.MODEL_CONFIG_KEY, JSON.stringify(config));
    
    // Initialize the AI tools
    AIToolsService.initialize();
    this.tools = AIToolsService.getAllTools();
    
    console.log('[AI] Initialized AI service with provider:', config.provider);
    console.log('[AI] Available tools:', this.tools.map(t => t.name));
  }
  
  /**
   * Get stored configuration
   */
  public static getStoredConfig(): AIModelConfig | null {
    const storedConfig = localStorage.getItem(AIService.MODEL_CONFIG_KEY);
    if (!storedConfig) return null;
    
    try {
      return JSON.parse(storedConfig) as AIModelConfig;
    } catch (error) {
      console.error('[AI] Error parsing stored configuration:', error);
      return null;
    }
  }
  
  /**
   * Check if the service is initialized
   */
  public isInitialized(): boolean {
    return !!this.config;
  }
  
  /**
   * Generate a completion using the configured LLM
   * @param prompt The prompt to send to the LLM
   * @param options Additional options for the request
   */
  public async generateCompletion(
    prompt: string, 
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<string> {
    if (!this.isInitialized()) {
      throw new Error('AI service not initialized. Call initialize() first.');
    }
    
    // Default options
    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens ?? 1000;
    
    try {
      // Handle different providers
      switch (this.config!.provider) {
        case 'openai':
          return await this.callOpenAI(prompt, temperature, maxTokens);
        case 'anthropic':
          return await this.callAnthropic(prompt, temperature, maxTokens);
        case 'custom':
          return await this.callCustomAPI(prompt, temperature, maxTokens);
        default:
          throw new Error(`Provider ${this.config!.provider} not implemented`);
      }
    } catch (error) {
      console.error('[AI] Error generating completion:', error);
      throw error;
    }
  }
  
  /**
   * Generate a streamable completion
   * @param prompt The prompt to send to the LLM
   * @param options Additional options for the request
   */
  public generateStreamableCompletion(
    prompt: string,
    options?: { temperature?: number; maxTokens?: number }
  ): CompletionStream {
    const stream = new CompletionStream();
    
    // Check if the prompt contains a direct tool call request
    const directToolCall = this.checkForDirectToolCall(prompt);
    if (directToolCall) {
      console.log('[AI] Detected direct tool call in prompt');
      this.handleToolCall(directToolCall, stream);
      return stream;
    }
    
    // Start generating in the background
    this.generateCompletion(prompt, options)
      .then(result => {
        // Check if the result contains a tool call
        const toolCall = this.extractToolCall(result);
        if (toolCall) {
          console.log('[AI] Tool call detected in response, executing');
          this.handleToolCall(toolCall, stream);
          return; // Don't append the original result with the tool call
        }
        
        stream.append(result);
        stream.done();
      })
      .catch(error => {
        stream.error(error);
      });
    
    return stream;
  }
  
  /**
   * Extract tool call from AI response if present
   * This improved version can handle more variations in how the AI formats tool calls
   */
  private extractToolCall(response: string): AIToolCall | null {
    // Try several regex patterns to extract the tool call
    const patterns = [
      // Standard format: [TOOL:createEndpoint]{ json }
      /\[TOOL:(\w+)\](\{[\s\S]*\})/,
      
      // Alternative format: [TOOL:createEndpoint]{ json }]
      /\[TOOL:(\w+)\](\{[\s\S]*\}\])/,
      
      // Clean format without brackets: TOOL:createEndpoint{ json }
      /TOOL:(\w+)(\{[\s\S]*\})/
    ];
    
    // Try each pattern in order
    for (const pattern of patterns) {
      const match = response.match(pattern);
      if (match) {
        try {
          const toolType = match[1];
          let paramsJson = match[2].trim();
          
          // Remove any trailing brackets that might have been caught
          if (paramsJson.endsWith(']')) {
            paramsJson = paramsJson.slice(0, -1);
          }
          
          // Clean up the JSON string
          paramsJson = this.sanitizeJsonString(paramsJson);
          
          console.log('[AI] Extracted tool call with pattern:', pattern);
          console.log('[AI] Tool type:', toolType);
          console.log('[AI] Raw params:', paramsJson);
          
          const parameters = JSON.parse(paramsJson);
          return { type: toolType, parameters };
        } catch (error) {
          console.error('[AI] Error parsing tool parameters with pattern:', pattern);
          console.error('[AI] Error details:', error);
          // Continue trying other patterns
        }
      }
    }
    
    // Try a more aggressive approach for edge cases
    try {
      const jsonStart = response.indexOf('{');
      const jsonEnd = response.lastIndexOf('}') + 1;
      
      if (jsonStart > 0 && jsonEnd > jsonStart) {
        const toolTypeMatch = response.slice(0, jsonStart).match(/\[?TOOL:(\w+)\]?/);
        if (toolTypeMatch) {
          const toolType = toolTypeMatch[1];
          const paramsJson = response.slice(jsonStart, jsonEnd);
          
          console.log('[AI] Extracted tool call with fallback method');
          console.log('[AI] Tool type:', toolType);
          console.log('[AI] Raw params:', paramsJson);
          
          try {
            const parameters = JSON.parse(paramsJson);
            return { type: toolType, parameters };
          } catch (e) {
            console.error('[AI] Error parsing fallback JSON:', e);
          }
        }
      }
    } catch (error) {
      console.error('[AI] Error in fallback tool extraction:', error);
    }
    
    return null;
  }
  
  /**
   * Sanitize JSON string for safer parsing
   */
  private sanitizeJsonString(jsonStr: string): string {
    // Remove any trailing commas in objects which can cause JSON.parse to fail
    return jsonStr.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
  }
  
  /**
   * Check if prompt contains a direct tool call (for debugging/testing)
   */
  private checkForDirectToolCall(prompt: string): AIToolCall | null {
    if (prompt.includes('[TOOL:') && prompt.includes('}]')) {
      try {
        // Extract the tool type and parameters
        const toolMatch = prompt.match(/\[TOOL:(\w+)\]/);
        if (!toolMatch) return null;
        
        const toolType = toolMatch[1];
        const jsonMatch = prompt.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;
        
        const paramsJson = this.sanitizeJsonString(jsonMatch[0]);
        const parameters = JSON.parse(paramsJson);
        
        return { type: toolType, parameters };
      } catch (error) {
        console.error('[AI] Error parsing direct tool call:', error);
        return null;
      }
    }
    return null;
  }
  
  /**
   * Handle a tool call and stream the result
   */
  private async handleToolCall(toolCall: AIToolCall, stream: CompletionStream): Promise<void> {
    try {
      console.log('[AI] Executing tool call:', toolCall.type, toolCall.parameters);
      
      // Execute the requested tool
      const result = await AIToolsService.executeTool(toolCall.type, toolCall.parameters);
      
      // Format the result for display
      const formattedResult = AIToolsService.formatToolResult(toolCall.type, result);
      
      // Stream the result
      stream.append(formattedResult);
      stream.done();
    } catch (error) {
      console.error('[AI] Error executing tool call:', error);
      stream.append(`Error executing ${toolCall.type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      stream.done();
    }
  }
  
  /**
   * Create an API endpoint from code
   * @param config Endpoint configuration including code
   */
  public async createEndpointFromCode(config: EndpointConfig): Promise<EndpointCreationResponse> {
    if (!this.isInitialized()) {
      throw new Error('AI service not initialized. Call initialize() first.');
    }
    
    try {
      console.log('[AI] Creating endpoint from code:', config.path);
      // Use the EndpointService to create the endpoint
      return await EndpointService.createEndpoint(config);
    } catch (error) {
      console.error('[AI] Error creating endpoint:', error);
      throw error;
    }
  }
  
  /**
   * Call OpenAI API
   */
  private async callOpenAI(
    prompt: string,
    temperature: number,
    maxTokens: number
  ): Promise<string> {
    // Add system message instructing about tools
    const systemMessage = {
      role: 'system',
      content: `You are a helpful assistant that can create REST API endpoints. 
You have access to tools that you can use.

To use a tool, respond with [TOOL:toolName]{...tool parameters as JSON...}

Available tools:
- createEndpoint: Create a new API endpoint
  Parameters:
  {
    "endpoint": "/path/to/endpoint", (string, required)
    "method": "POST", (string, required, one of: GET, POST, PUT, DELETE, PATCH)
    "requestFormat": "{...}", (string, optional, example JSON request)
    "responseFormat": "{...}", (string, required, example JSON response)
    "description": "Description of what the endpoint does", (string, required)
    "implementation": "code that implements the endpoint", (string, required)
    "authRequired": false, (boolean, optional)
    "collectionName": "My API Collection", (string, optional - creates or uses existing collection)
    "collectionPath": ["Parent Collection", "Child Collection"] (array of strings, optional - specify a nested collection path)
  }

When asked to create an endpoint, please always use the createEndpoint tool.
When using the tool, provide complete, functional code for the implementation.
Endpoints are automatically added to collections in the application. You can organize endpoints in three ways:
1. Default collection: If no collection is specified, endpoints go to "AI Generated Endpoints"
2. Specific collection: Use collectionName for a top-level collection
3. Nested collection: Use collectionPath to place the endpoint in a nested folder structure
   Example: ["API Collection", "User Management", "Authentication"] creates the path API Collection > User Management > Authentication`
    };
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: this.config!.model,
        messages: [
          systemMessage,
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens: maxTokens
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config!.apiKey}`
        }
      }
    );
    
    return response.data.choices[0].message.content;
  }
  
  /**
   * Call Anthropic API
   */
  private async callAnthropic(
    prompt: string,
    temperature: number,
    maxTokens: number
  ): Promise<string> {
    // Add system message instructing about tools
    const systemPrompt = `You are a helpful assistant that can create REST API endpoints. 
You have access to tools that you can use.

To use a tool, respond with [TOOL:toolName]{...tool parameters as JSON...}

Available tools:
- createEndpoint: Create a new API endpoint
  Parameters:
  {
    "endpoint": "/path/to/endpoint", (string, required)
    "method": "POST", (string, required, one of: GET, POST, PUT, DELETE, PATCH)
    "requestFormat": "{...}", (string, optional, example JSON request)
    "responseFormat": "{...}", (string, required, example JSON response)
    "description": "Description of what the endpoint does", (string, required)
    "implementation": "code that implements the endpoint", (string, required)
    "authRequired": false, (boolean, optional)
    "collectionName": "My API Collection", (string, optional - creates or uses existing collection)
    "collectionPath": ["Parent Collection", "Child Collection"] (array of strings, optional - specify a nested collection path)
  }

When asked to create an endpoint, please always use the createEndpoint tool.
When using the tool, provide complete, functional code for the implementation.
Endpoints are automatically added to collections in the application. You can organize endpoints in three ways:
1. Default collection: If no collection is specified, endpoints go to "AI Generated Endpoints"
2. Specific collection: Use collectionName for a top-level collection
3. Nested collection: Use collectionPath to place the endpoint in a nested folder structure
   Example: ["API Collection", "User Management", "Authentication"] creates the path API Collection > User Management > Authentication.`;
    
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: this.config!.model,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config!.apiKey,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    return response.data.content[0].text;
  }
  
  /**
   * Call custom API endpoint
   */
  private async callCustomAPI(
    prompt: string,
    temperature: number,
    maxTokens: number
  ): Promise<string> {
    if (!this.config!.apiUrl) {
      throw new Error('Custom API URL not provided');
    }
    
    // Add tool instructions for custom API
    const enhancedPrompt = `[INSTRUCTIONS FOR AI MODEL]
You are a helpful assistant that can create REST API endpoints.
You have access to tools that you can use.

To use a tool, respond with [TOOL:toolName]{...tool parameters as JSON...}

Available tools:
- createEndpoint: Create a new API endpoint
  Parameters:
  {
    "endpoint": "/path/to/endpoint", (string, required)
    "method": "POST", (string, required, one of: GET, POST, PUT, DELETE, PATCH)
    "requestFormat": "{...}", (string, optional, example JSON request)
    "responseFormat": "{...}", (string, required, example JSON response)
    "description": "Description of what the endpoint does", (string, required)
    "implementation": "code that implements the endpoint", (string, required)
    "authRequired": false, (boolean, optional)
    "collectionName": "My API Collection", (string, optional - creates or uses existing collection)
    "collectionPath": ["Parent Collection", "Child Collection"] (array of strings, optional - specify a nested collection path)
  }

When asked to create an endpoint, please always use the createEndpoint tool.
When using the tool, provide complete, functional code for the implementation.
Endpoints are automatically added to collections in the application. You can organize endpoints in three ways:
1. Default collection: If no collection is specified, endpoints go to "AI Generated Endpoints"
2. Specific collection: Use collectionName for a top-level collection
3. Nested collection: Use collectionPath to place the endpoint in a nested folder structure
   Example: ["API Collection", "User Management", "Authentication"] creates the path API Collection > User Management > Authentication

[USER QUERY]
${prompt}`;
    
    const response = await axios.post(
      this.config!.apiUrl,
      {
        prompt: enhancedPrompt,
        temperature,
        max_tokens: maxTokens
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config!.apiKey}`
        }
      }
    );
    
    return response.data.completion || response.data.text || response.data.content;
  }
  
  /**
   * Clear stored configuration
   */
  public clearConfig(): void {
    localStorage.removeItem(AIService.MODEL_CONFIG_KEY);
    this.config = null;
  }

  /**
   * Debug method to directly call a tool without going through the AI
   * This is helpful for testing and debugging the tool functionality
   */
  public async directToolCall(toolType: string, parameters: any): Promise<string> {
    console.log('[AI] Executing direct tool call:', toolType);
    try {
      // Create a tool call object
      const toolCall = { type: toolType, parameters };
      
      // Execute the tool
      const result = await AIToolsService.executeTool(toolType, parameters);
      
      // Trigger a UI refresh to show the newly created endpoint
      if (toolType === 'createEndpoint' && result.success) {
        // Wait a moment to ensure database operations have completed
        setTimeout(() => {
          try {
            // Use the EventService to notify about collection updates
            EventService.notifyCollectionsUpdated();
            console.log('[AI] Triggered UI refresh after endpoint creation');
          } catch (e) {
            console.error('[AI] Failed to trigger UI refresh:', e);
          }
        }, 500);
      }
      
      // Format the result
      const formattedResult = AIToolsService.formatToolResult(toolType, result);
      
      return formattedResult;
    } catch (error) {
      console.error('[AI] Error in direct tool call:', error);
      return `Error executing ${toolType}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}

// Create a singleton instance
const aiService = new AIService();
export default aiService; 