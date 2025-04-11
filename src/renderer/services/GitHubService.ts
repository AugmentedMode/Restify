/**
 * Service for interacting with GitHub API
 */
export class GitHubService {
  private octokit: any = null;
  private token: string | null = null;

  /**
   * Initialize the GitHub API client with a personal access token
   * @param token GitHub personal access token
   */
  public async initialize(token: string): Promise<void> {
    if (!token) {
      throw new Error('GitHub token is required');
    }
    
    this.token = token;
    
    try {
      // Dynamically import Octokit
      const { Octokit } = await import('@octokit/rest');
      this.octokit = new Octokit({
        auth: token
      });
    } catch (error) {
      console.error('Failed to initialize GitHub service:', error);
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
   * Get the current authenticated user
   * @returns The authenticated user information
   */
  public async getCurrentUser() {
    this.ensureInitialized();
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