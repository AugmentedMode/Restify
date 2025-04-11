/**
 * Service for interacting with GitHub API
 */
import { encryptValue, decryptValue } from '../utils/encryptionUtils';

export class GitHubService {
  private octokit: any = null;
  private token: string | null = null;
  private static readonly TOKEN_STORAGE_KEY = 'github_token_encrypted';
  private static readonly LEGACY_TOKEN_KEY = 'github_token';

  /**
   * Initialize the GitHub API client with a personal access token
   * @param token GitHub personal access token
   * @param shouldStore Whether to store the token in localStorage (default: true)
   */
  public async initialize(token: string, shouldStore: boolean = true): Promise<void> {
    if (!token) {
      throw new Error('GitHub token is required');
    }
    
    console.log('[GitHub] Initializing service with token', token.substring(0, 5) + '...');
    this.token = token;
    
    try {
      // Dynamically import Octokit
      const { Octokit } = await import('@octokit/rest');
      this.octokit = new Octokit({
        auth: token
      });
      
      // Store token in localStorage based on settings
      if (shouldStore) {
        await this.securelyStoreToken(token);
      }
    } catch (error) {
      console.error('[GitHub] Failed to initialize GitHub service:', error);
      throw new Error('Failed to initialize GitHub service');
    }
  }

  /**
   * Check if the service is initialized with a token
   */
  public isInitialized(): boolean {
    return !!this.octokit && !!this.token;
  }

  /**
   * Securely store the token
   * @param token GitHub personal access token
   */
  private async securelyStoreToken(token: string): Promise<void> {
    try {
      // Encrypt the token before storing
      console.log('[GitHub] Encrypting and storing token');
      const encryptedToken = await encryptValue(token);
      
      // Store the encrypted token
      localStorage.setItem(GitHubService.TOKEN_STORAGE_KEY, encryptedToken);
      
      // Remove any unencrypted token if it exists
      localStorage.removeItem(GitHubService.LEGACY_TOKEN_KEY);
    } catch (error) {
      console.error('[GitHub] Error storing token securely:', error);
    }
  }

  /**
   * Retrieve the securely stored token
   * @returns The decrypted GitHub token or null if not found
   */
  public static async getStoredToken(): Promise<string | null> {
    try {
      // Try to get the encrypted token
      const encryptedToken = localStorage.getItem(GitHubService.TOKEN_STORAGE_KEY);
      
      if (encryptedToken) {
        console.log('[GitHub] Found encrypted token, decrypting...');
        // Decrypt the token
        const decryptedToken = await decryptValue(encryptedToken);
        
        // Verify it's not empty
        if (!decryptedToken || decryptedToken === encryptedToken) {
          console.error('[GitHub] Decryption failed, token wasn\'t properly decrypted');
          return null;
        }
        
        console.log('[GitHub] Successfully decrypted token:', decryptedToken.substring(0, 5) + '...');
        return decryptedToken;
      }
      
      // Check for legacy unencrypted token
      const legacyToken = localStorage.getItem(GitHubService.LEGACY_TOKEN_KEY);
      if (legacyToken) {
        console.log('[GitHub] Found legacy token, migrating to encrypted storage');
        // If found, migrate it to encrypted storage
        const instance = new GitHubService();
        await instance.securelyStoreToken(legacyToken);
        localStorage.removeItem(GitHubService.LEGACY_TOKEN_KEY);
        return legacyToken;
      }
      
      console.log('[GitHub] No token found in storage');
      return null;
    } catch (error) {
      console.error('[GitHub] Error retrieving stored token:', error);
      return null;
    }
  }

  /**
   * Helper method to retrieve the token without requiring an instance
   */
  public static async loadStoredToken(): Promise<string | null> {
    return await GitHubService.getStoredToken();
  }
  
  /**
   * Helper method to clear the token without requiring an instance
   */
  public static clearStoredToken(): void {
    localStorage.removeItem(GitHubService.TOKEN_STORAGE_KEY);
    localStorage.removeItem(GitHubService.LEGACY_TOKEN_KEY);
  }
  
  /**
   * Helper method to reset all GitHub-related tokens and encryption keys
   * This is a nuclear option for when encryption fails
   */
  public static resetAllTokens(): void {
    // Clear GitHub tokens
    localStorage.removeItem(GitHubService.TOKEN_STORAGE_KEY);
    localStorage.removeItem(GitHubService.LEGACY_TOKEN_KEY);
    
    // Clear encryption key to force re-generation
    localStorage.removeItem('restify_encryption_key');
    
    console.log('[GitHub] Reset all tokens and encryption keys');
  }

  /**
   * Clear stored token and reset service
   */
  public clearToken(): void {
    localStorage.removeItem(GitHubService.TOKEN_STORAGE_KEY);
    localStorage.removeItem(GitHubService.LEGACY_TOKEN_KEY);
    this.token = null;
    this.octokit = null;
  }

  /**
   * Get the current authenticated user
   * @returns The authenticated user information
   */
  public async getCurrentUser() {
    this.ensureInitialized();
    console.log('[GitHub] Getting current user with token:', this.token?.substring(0, 5) + '...');
    const { data } = await this.octokit.users.getAuthenticated();
    return data;
  }

  /**
   * Get open pull requests created by the authenticated user
   * @returns Array of open pull requests
   */
  public async getMyOpenPullRequests() {
    this.ensureInitialized();
    
    // Get authenticated user first
    const user = await this.getCurrentUser();
    
    // Search for PRs created by the authenticated user that are open
    const { data } = await this.octokit.search.issuesAndPullRequests({
      q: `is:pr is:open author:${user.login}`,
      sort: 'updated',
      order: 'desc',
      per_page: 100
    });

    return data.items;
  }

  /**
   * Get open pull requests where the authenticated user is requested as a reviewer
   * @returns Array of pull requests needing review
   */
  public async getPullRequestsForReview() {
    this.ensureInitialized();
    
    // Get authenticated user first
    const user = await this.getCurrentUser();
    
    // Search for PRs where the authenticated user is requested as a reviewer
    const { data } = await this.octokit.search.issuesAndPullRequests({
      q: `is:pr is:open review-requested:${user.login}`,
      sort: 'updated',
      order: 'desc',
      per_page: 100
    });

    return data.items;
  }

  /**
   * Ensure the service is initialized before making API calls
   */
  private ensureInitialized() {
    if (!this.octokit || !this.token) {
      throw new Error('GitHub service not initialized. Call initialize() with a valid token first.');
    }
  }
}

// Create a singleton instance
const githubService = new GitHubService();
export default githubService; 