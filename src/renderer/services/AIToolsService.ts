/**
 * Service for managing AI assistant tools
 */
import EndpointService, { AIEndpointSchema } from './EndpointService';

// Define the tool types
export type AIToolType = 'createEndpoint' | 'searchDocs' | 'formatCode';

// Define the parameters for each tool
export interface CreateEndpointParams {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  requestFormat?: string;
  responseFormat: string;
  description: string;
  implementation: string;
  authRequired?: boolean;
  collectionName?: string;
  collectionId?: string;
  collectionPath?: string[]; // Path to nested collection
}

// Base tool interface
export interface AITool<T = any> {
  name: string;
  description: string;
  execute: (params: T) => Promise<any>;
  formatResult?: (result: any) => string;
}

// Service that manages tools available to AI
export class AIToolsService {
  private static tools: Map<string, AITool<any>> = new Map();
  
  /**
   * Initialize the tools service with default tools
   */
  public static initialize(): void {
    this.registerDefaultTools();
    console.log('[AITools] Initialized with', this.tools.size, 'tools');
  }
  
  /**
   * Register the default set of tools
   */
  private static registerDefaultTools(): void {
    // Register endpoint creation tool
    this.registerTool({
      name: 'createEndpoint',
      description: 'Create a new API endpoint based on provided code and specification',
      execute: async (params: CreateEndpointParams) => {
        console.log('[AITools] Executing createEndpoint tool');
        return await EndpointService.createEndpointFromAITool(params);
      },
      formatResult: (result) => {
        if (!result.success) {
          return `Error creating endpoint: ${result.error}`;
        }
        
        const { additionalData } = result;
        if (!additionalData) {
          return `Successfully created endpoint at ${result.url}`;
        }
        
        // Prepare collection information
        let collectionInfo = '';
        if (result.collectionPath) {
          collectionInfo = `The endpoint has been added to the collection path: **${result.collectionPath}**`;
        } else if (result.collectionName) {
          collectionInfo = `The endpoint has been added to the **${result.collectionName}** collection.`;
        }
        
        // Format a nice response with examples and details
        return `
## ✅ Endpoint Created Successfully

Your new API endpoint is available at: **${result.url}**

${collectionInfo}

### Request Example:
\`\`\`http
${additionalData.requestExample}
\`\`\`

### Response Format:
\`\`\`json
${additionalData.responseExample}
\`\`\`

### Test with cURL:
\`\`\`bash
${additionalData.curl}
\`\`\`

The endpoint has been deployed and is ready to use.
        `.trim();
      }
    });
    
    // Additional tools could be registered here
    // this.registerTool({ name: 'searchDocs', ... });
    // this.registerTool({ name: 'formatCode', ... });
  }
  
  /**
   * Register a new tool
   */
  public static registerTool<T>(tool: AITool<T>): void {
    this.tools.set(tool.name, tool);
    console.log(`[AITools] Registered tool: ${tool.name}`);
  }
  
  /**
   * Get a registered tool by name
   */
  public static getTool(name: string): AITool | undefined {
    return this.tools.get(name);
  }
  
  /**
   * Get all registered tools
   */
  public static getAllTools(): AITool[] {
    return Array.from(this.tools.values());
  }
  
  /**
   * Execute a tool by name with parameters
   */
  public static async executeTool(name: string, params: any): Promise<any> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool '${name}' not found`);
    }
    
    try {
      console.log(`[AITools] Executing tool: ${name}`);
      const result = await tool.execute(params);
      return result;
    } catch (error) {
      console.error(`[AITools] Error executing tool ${name}:`, error);
      throw error;
    }
  }
  
  /**
   * Format the result of a tool execution
   */
  public static formatToolResult(name: string, result: any): string {
    const tool = this.getTool(name);
    if (!tool || !tool.formatResult) {
      // Default formatting if no formatter exists
      return JSON.stringify(result, null, 2);
    }
    
    return tool.formatResult(result);
  }
}

export default AIToolsService; 