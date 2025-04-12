/**
 * Service for integrating LLM capabilities into the app using Vercel AI SDK
 */
import axios from 'axios';

type AIModelProvider = 'openai' | 'anthropic' | 'gemini' | 'mistral' | 'custom';

interface AIModelConfig {
  provider: AIModelProvider;
  model: string;
  apiKey: string;
  apiUrl?: string;
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
  
  /**
   * Initialize the AI service with configuration
   * @param config The AI model configuration
   */
  public initialize(config: AIModelConfig): void {
    this.config = config;
    
    // Store configuration for future use
    localStorage.setItem(AIService.MODEL_CONFIG_KEY, JSON.stringify(config));
    
    console.log('[AI] Initialized AI service with provider:', config.provider);
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
    
    // Start generating in the background
    this.generateCompletion(prompt, options)
      .then(result => {
        stream.append(result);
        stream.done();
      })
      .catch(error => {
        stream.error(error);
      });
    
    return stream;
  }
  
  /**
   * Call OpenAI API
   */
  private async callOpenAI(
    prompt: string,
    temperature: number,
    maxTokens: number
  ): Promise<string> {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: this.config!.model,
        messages: [{ role: 'user', content: prompt }],
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
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: this.config!.model,
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
    
    const response = await axios.post(
      this.config!.apiUrl,
      {
        prompt,
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
}

// Create a singleton instance
const aiService = new AIService();
export default aiService; 