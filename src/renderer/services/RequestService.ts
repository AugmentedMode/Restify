import { ApiRequest, ApiResponse } from '../types';
import { executeRequest } from '../utils/apiUtils';

export class RequestService {
  /**
   * Execute an API request with a minimum loading time for better UI feedback
   */
  static async executeApiRequest(request: ApiRequest): Promise<ApiResponse> {
    // Minimum loading time in milliseconds (for UI feedback)
    const MIN_LOADING_TIME = 300;
    const startTime = Date.now();
    
    // Execute the actual request
    const response = await executeRequest(request);
    
    // Calculate elapsed time
    const elapsed = Date.now() - startTime;
    
    // If the request was too fast, wait a bit more to show loading indicator
    const remainingTime = MIN_LOADING_TIME - elapsed;
    if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }
    
    return response;
  }
} 