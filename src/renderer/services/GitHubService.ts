/**
 * Service for interacting with GitHub API
 */
import { encryptValue, decryptValue } from '../utils/encryptionUtils';
import { GitHubPRService } from './DatabaseService';

// Cache refresh time (15 minutes in milliseconds)
const CACHE_TTL = 15 * 60 * 1000;

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
    
    // Also clear cached PR data
    GitHubPRService.clearAllPRs();
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
   * @param useCache Whether to try using cached data first (default: true)
   * @returns Array of open pull requests
   */
  public async getMyOpenPullRequests(useCache: boolean = true) {
    this.ensureInitialized();
    
    // Try to get from cache if requested
    if (useCache) {
      const lastUpdated = await GitHubPRService.getLastUpdatedTimestamp('created');
      const cachedPRs = await GitHubPRService.getMyPRs();
      
      // If we have cached data and it's fresh enough, use it
      if (lastUpdated && cachedPRs.length > 0 && Date.now() - lastUpdated < CACHE_TTL) {
        console.log('[GitHub] Using cached PRs created by user');
        return cachedPRs;
      }
    }
    
    // Get authenticated user first
    const user = await this.getCurrentUser();
    
    // Search for PRs created by the authenticated user that are open
    const { data } = await this.octokit.search.issuesAndPullRequests({
      q: `is:pr is:open author:${user.login}`,
      sort: 'updated',
      order: 'desc',
      per_page: 100
    });

    // Cache the result for future use
    await GitHubPRService.saveMyPRs(data.items);
    
    return data.items;
  }

  /**
   * Get open pull requests where the authenticated user is requested as a reviewer
   * @param useCache Whether to try using cached data first (default: true)
   * @returns Array of pull requests needing review
   */
  public async getPullRequestsForReview(useCache: boolean = true) {
    this.ensureInitialized();
    
    // Try to get from cache if requested
    if (useCache) {
      const lastUpdated = await GitHubPRService.getLastUpdatedTimestamp('review');
      const cachedPRs = await GitHubPRService.getPRsForReview();
      
      // If we have cached data and it's fresh enough, use it
      if (lastUpdated && cachedPRs.length > 0 && Date.now() - lastUpdated < CACHE_TTL) {
        console.log('[GitHub] Using cached PRs for review');
        return cachedPRs;
      }
    }
    
    // Get authenticated user first
    const user = await this.getCurrentUser();
    
    // Search for PRs where the authenticated user is requested as a reviewer
    const { data } = await this.octokit.search.issuesAndPullRequests({
      q: `is:pr is:open review-requested:${user.login}`,
      sort: 'updated',
      order: 'desc',
      per_page: 100
    });

    // Cache the result for future use
    await GitHubPRService.savePRsForReview(data.items);

    return data.items;
  }

  /**
   * Force refresh all cached PR data
   */
  public async refreshAllPRs() {
    if (!this.isInitialized()) {
      return;
    }
    
    try {
      await Promise.all([
        this.getMyOpenPullRequests(false),
        this.getPullRequestsForReview(false)
      ]);
      console.log('[GitHub] Successfully refreshed all PR data');
    } catch (error) {
      console.error('[GitHub] Error refreshing PR data:', error);
    }
  }

  /**
   * Get recent commits made by the authenticated user
   * @param days Number of days to look back (default: 7)
   * @returns Array of recent commits
   */
  public async getRecentCommits(days: number = 7) {
    this.ensureInitialized();
    
    try {
      // Get authenticated user first
      const user = await this.getCurrentUser();
      
      // Calculate the date from days ago
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - days);
      const dateString = daysAgo.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      
      // Search for commits authored by the authenticated user since the specified date
      const { data } = await this.octokit.search.commits({
        q: `author:${user.login} author-date:>=${dateString}`,
        sort: 'author-date',
        order: 'desc',
        per_page: 100
      });
      
      console.log(`[GitHub] Found ${data.items.length} commits in the last ${days} days`);
      return data.items;
    } catch (error) {
      console.error('[GitHub] Error fetching recent commits:', error);
      throw error;
    }
  }

  /**
   * Get commit statistics for repositories the user has access to
   * @returns Object with commit stats
   */
  public async getCommitStats() {
    this.ensureInitialized();
    
    try {
      // Get recent commits for different time periods
      const last24Hours = await this.getRecentCommits(1);
      const lastWeek = await this.getRecentCommits(7);
      const lastMonth = await this.getRecentCommits(30);
      
      // Get repositories with commits
      const repositories = new Set(lastMonth.map((commit: any) => 
        commit.repository?.name || commit.repository?.full_name || 'unknown'
      ));
      
      return {
        lastDay: last24Hours.length,
        lastWeek: lastWeek.length,
        lastMonth: lastMonth.length,
        repositories: Array.from(repositories).length
      };
    } catch (error) {
      console.error('[GitHub] Error fetching commit statistics:', error);
      return {
        lastDay: 0,
        lastWeek: 0,
        lastMonth: 0,
        repositories: 0
      };
    }
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