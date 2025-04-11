import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { 
  FaGithub, 
  FaSync, 
  FaExternalLinkAlt, 
  FaLock, 
  FaExclamationTriangle,
  FaArrowLeft,
  FaClock,
  FaCodeBranch,
  FaCheck,
  FaTimes,
  FaCog,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaTrash,
  FaQuestionCircle,
  FaLink,
  FaShieldAlt,
  FaUserSecret,
  FaCommentDots,
  FaUserEdit
} from 'react-icons/fa';
import githubService, { GitHubService } from '../../services/GitHubService';
import { useSettings } from '../../utils/SettingsContext';

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #1e1e1e;
  color: #e0e0e0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: #252525;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #aaa;
  font-size: 18px;
  display: flex;
  align-items: center;
  padding: 5px;
  border-radius: 4px;
  margin-right: 10px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: #FF385C;
  }
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 10px;
  }
`;

const RefreshButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #aaa;
  font-size: 16px;
  padding: 8px;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: #FF385C;
  }
`;

const Content = styled.div`
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #888;
  text-align: center;
  
  svg {
    font-size: 64px;
    margin-bottom: 16px;
    color: #555;
  }
  
  h3 {
    margin: 0 0 8px;
    font-weight: 500;
  }
  
  p {
    max-width: 400px;
    margin: 0 0 24px;
  }
`;

const TokenContainer = styled.div`
  max-width: 550px;
  margin: 40px auto;
  padding: 28px;
  background-color: #252525;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
`;

const TokenInput = styled.input`
  width: 100%;
  padding: 12px;
  background-color: #333;
  border: 1px solid #444;
  color: white;
  border-radius: 4px;
  margin: 10px 0;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
  }
`;

const SaveButton = styled.button`
  background-color: #FF385C;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    background-color: #E0314F;
  }
`;

const SecureBadge = styled.div`
  background-color: #2a2a2a;
  color: #29a745;
  font-size: 0.8rem;
  padding: 6px 10px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  width: fit-content;
`;

const ErrorMessage = styled.div`
  color: #ff3860;
  font-size: 0.9rem;
  margin: 12px 0;
  padding: 12px;
  background-color: rgba(255, 56, 96, 0.1);
  border-radius: 4px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const ResetButton = styled.button`
  background-color: transparent;
  color: #ff3860;
  border: 1px solid #ff3860;
  font-size: 0.8rem;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  
  &:hover {
    background-color: rgba(255, 56, 96, 0.1);
  }
`;

const PRList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PRItem = styled.div`
  background-color: #252525;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const PRHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const PRTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
`;

const PRLink = styled.a`
  color: #FF385C;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const PRMeta = styled.div`
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #aaa;
  margin-top: 12px;
`;

const PRMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  svg {
    animation: spin 1s linear infinite;
    color: #FF385C;
    font-size: 24px;
  }
`;

// Add token management styled components
const ManagementContainer = styled.div`
  margin-bottom: 24px;
  padding: 20px;
  background-color: #252525;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const ManagementHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
  }
  
  svg {
    margin-right: 10px;
    color: #FF385C;
  }
`;

const TokenField = styled.div`
  display: flex;
  align-items: center;
  background-color: #1e1e1e;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 8px 12px;
  margin: 12px 0;
`;

const TokenDisplay = styled.div`
  flex: 1;
  font-family: monospace;
  font-size: 14px;
  color: #ddd;
  user-select: none;
`;

const TokenActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    color: #FF385C;
    background-color: rgba(255, 56, 92, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const OutlineButton = styled.button`
  background-color: transparent;
  color: #FF385C;
  border: 1px solid #FF385C;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background-color: rgba(255, 56, 92, 0.1);
  }
`;

// Add these new styled components after the other style definitions
const ContainerHeader = styled.h3`
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 500;
  color: #fff;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 10px;
    color: #FF385C;
  }
`;

const TokenHelp = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  font-size: 14px;
  color: #bbb;
  
  p {
    margin: 0 0 8px 0;
    line-height: 1.5;
  }
  
  ul {
    margin: 8px 0;
    padding-left: 20px;
  }
  
  li {
    margin: 4px 0;
  }
`;

const PrimaryButton = styled(SaveButton)`
  padding: 12px 20px;
  border-radius: 6px;
  box-shadow: 0 2px 5px rgba(255, 56, 92, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(255, 56, 92, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 3px rgba(255, 56, 92, 0.2);
  }
`;

const EnhancedTokenInput = styled.div`
  position: relative;
  margin: 16px 0;
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #bbb;
`;

const TokenInputField = styled(TokenInput)`
  padding: 14px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:focus {
    box-shadow: 0 0 0 2px rgba(255, 56, 92, 0.2);
  }
  
  &::placeholder {
    color: #666;
  }
`;

const InputHint = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #888;
  margin-top: 6px;
`;

const EnhancedErrorMessage = styled(ErrorMessage)`
  margin: 16px 0;
  padding: 16px;
  border-radius: 6px;
  gap: 12px;
  border-left: 4px solid #ff3860;
  
  svg {
    margin-top: 2px;
    flex-shrink: 0;
  }
`;

const ErrorContent = styled.div`
  flex: 1;
  
  p {
    margin: 0 0 8px 0;
    line-height: 1.5;
  }
`;

const LinkButton = styled.a`
  color: #FF385C;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const EnhancedSpinner = styled(LoadingSpinner)`
  flex-direction: column;
  height: 200px;
  gap: 16px;
  
  svg {
    font-size: 32px;
  }
  
  p {
    color: #aaa;
    font-size: 14px;
  }
`;

// Add a content separator to visually divide sections
const ContentSeparator = styled.div`
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 24px 0;
`;

// Add tab navigation styled components
const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Tab = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  color: ${props => props.active ? '#FF385C' : '#aaa'};
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? '#FF385C' : 'transparent'};
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    color: ${props => props.active ? '#FF385C' : '#ddd'};
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const ReviewBadge = styled.span`
  background-color: rgba(255, 56, 92, 0.1);
  color: #FF385C;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 8px;
`;

const EmptyReview = styled(EmptyState)`
  svg {
    color: #555;
  }
`;

interface GitHubPanelProps {
  onReturn: () => void;
}

const GitHubPanel: React.FC<GitHubPanelProps> = ({ onReturn }) => {
  const [pullRequests, setPullRequests] = useState<any[]>([]);
  const [reviewRequests, setReviewRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'mine' | 'reviews'>('mine');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string>('');
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTokenManagement, setShowTokenManagement] = useState(false);
  const [showFullToken, setShowFullToken] = useState(false);
  const [editingToken, setEditingToken] = useState(false);
  const [newToken, setNewToken] = useState('');
  
  // Get settings from context
  const { settings } = useSettings();
  
  // Function to reset token in case of issues
  const resetToken = () => {
    console.log('[GitHub] Resetting token due to user request');
    GitHubService.resetAllTokens();
    setToken('');
    setInitialized(false);
    setError(null);
    setShowTokenManagement(false);
  };
  
  // Load token from secure storage on component mount
  useEffect(() => {
    const loadToken = async () => {
      try {
        setError(null);
        
        // Use the static helper method
        const savedToken = await GitHubService.loadStoredToken();
        if (savedToken) {
          console.log('[GitHub] Found saved token, initializing service');
          setToken(savedToken);
          await initializeGitHubService(savedToken);
        } else {
          console.log('[GitHub] No saved token found');
        }
      } catch (error) {
        console.error('[GitHub] Failed to load GitHub token:', error);
        setError('Failed to load saved token. Token might be corrupted.');
      }
    };
    
    loadToken();
  }, []);
  
  const initializeGitHubService = async (accessToken: string) => {
    try {
      setError(null);
      
      // Pass the storeGitHubToken setting to the initialize method
      await githubService.initialize(
        accessToken, 
        settings.security.storeGitHubToken
      );
      setInitialized(true);
      
      // Fetch PRs immediately after initialization
      fetchAllPullRequests();
    } catch (error) {
      console.error('[GitHub] Failed to initialize GitHub service:', error);
      setError('Failed to initialize GitHub service. Please check your token.');
      setInitialized(false);
    }
  };
  
  const fetchAllPullRequests = async () => {
    if (!githubService.isInitialized()) {
      setError('GitHub service not initialized. Please add your token.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch both types of PRs in parallel
      const [myPRs, reviewPRs] = await Promise.all([
        githubService.getMyOpenPullRequests(),
        githubService.getPullRequestsForReview()
      ]);
      setPullRequests(myPRs);
      setReviewRequests(reviewPRs);
    } catch (error: any) {
      console.error('[GitHub] Error fetching pull requests:', error);
      if (error.message?.includes('Bad credentials')) {
        setError('Invalid GitHub token. Please check your token and try again.');
        setInitialized(false);
      } else {
        setError(`Error fetching PRs: ${error.message || 'Unknown error'}`);
      }
      setPullRequests([]);
      setReviewRequests([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveToken = async () => {
    if (!token) {
      setError('Please enter a GitHub token');
      return;
    }
    
    try {
      setError(null);
      await initializeGitHubService(token);
    } catch (error: any) {
      setError(`Failed to save token: ${error.message || 'Unknown error'}`);
    }
  };
  
  // Monitor settings changes for storeGitHubToken
  useEffect(() => {
    // If the setting to store token is turned off, clear the token
    if (!settings.security.storeGitHubToken) {
      GitHubService.clearStoredToken();
      // Don't reinitialize as we still want to use the token for the current session
    }
  }, [settings.security.storeGitHubToken]);
  
  // Format the relative time for PR creation/update
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  };
  
  // Add a function to mask the token for display
  const maskToken = (token: string) => {
    if (!token) return '';
    if (showFullToken) return token;
    
    if (token.length <= 10) {
      return '••••••••••';
    }
    
    return token.substring(0, 4) + '••••••••••••••••••••' + token.substring(token.length - 4);
  };
  
  // Add a function to toggle token visibility
  const toggleTokenVisibility = () => {
    setShowFullToken(!showFullToken);
  };
  
  // Add a function to start editing token
  const startEditingToken = () => {
    setEditingToken(true);
    setNewToken(token);
  };
  
  // Add a function to save the updated token
  const saveUpdatedToken = async () => {
    if (!newToken) {
      setError('Please enter a token');
      return;
    }
    
    try {
      setError(null);
      await initializeGitHubService(newToken);
      setEditingToken(false);
    } catch (error: any) {
      setError(`Failed to save token: ${error.message || 'Unknown error'}`);
    }
  };
  
  // Replace the renderContent method with this improved version
  const renderContent = () => {
    if (!initialized) {
      return (
        <TokenContainer>
          <ContainerHeader>
            <FaKey />
            GitHub Personal Access Token
          </ContainerHeader>
          
          <p>Enter your GitHub token to view your open pull requests.</p>
          
          <TokenHelp>
            <p><strong>What is a Personal Access Token?</strong></p>
            <p>A token is required to securely access your GitHub data. To create one:</p>
            <ul>
              <li>Go to your GitHub settings → Developer settings → Personal access tokens</li>
              <li>Click "Generate new token" and confirm your password</li>
              <li>Give it a descriptive name (like "Restify App")</li>
              <li>Select these scopes: <code>repo</code> (to access repository data)</li>
              <li>Click "Generate token" and copy it immediately</li>
            </ul>
            <p>
              <LinkButton 
                href="https://github.com/settings/tokens/new" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLink size={12} /> Create a token on GitHub
              </LinkButton>
            </p>
          </TokenHelp>
          
          <EnhancedTokenInput>
            <InputLabel htmlFor="github-token">Personal Access Token</InputLabel>
            <TokenInputField
              id="github-token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              autoComplete="off"
            />
            <InputHint>
              <FaShieldAlt size={12} />
              <span>Your token will never be shared with anyone</span>
            </InputHint>
          </EnhancedTokenInput>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <PrimaryButton onClick={handleSaveToken}>
              <FaGithub /> Connect GitHub Account
            </PrimaryButton>
            
            {settings.security.storeGitHubToken && (
              <SecureBadge>
                <FaLock size={12} />
                <span>Encrypted at rest</span>
              </SecureBadge>
            )}
          </div>
          
          {error && (
            <EnhancedErrorMessage>
              <FaExclamationTriangle />
              <ErrorContent>
                <p><strong>{error}</strong></p>
                {error.includes('Invalid') && (
                  <p>Check that your token has the correct permissions and hasn't expired.</p>
                )}
                {error.includes('corrupted') && (
                  <p>Your stored token may be corrupted or invalid.</p>
                )}
                {(error.includes('corrupted') || error.includes('Invalid')) && (
                  <ResetButton onClick={resetToken}>
                    Reset All Tokens
                  </ResetButton>
                )}
              </ErrorContent>
            </EnhancedErrorMessage>
          )}
        </TokenContainer>
      );
    }
    
    if (loading) {
      return (
        <EnhancedSpinner>
          <FaSync />
          <p>Loading pull requests...</p>
        </EnhancedSpinner>
      );
    }
    
    if (error) {
      return (
        <EnhancedErrorMessage>
          <FaExclamationTriangle />
          <ErrorContent>
            <p><strong>{error}</strong></p>
            {error.includes('Invalid') && (
              <>
                <p>Your token may have expired or doesn't have the required permissions.</p>
                <p>Try resetting your token and creating a new one with the proper scopes.</p>
              </>
            )}
            {error.includes('Invalid') && (
              <div style={{ marginTop: '12px' }}>
                <ResetButton onClick={resetToken}>
                  Reset All Tokens
                </ResetButton>
                <LinkButton 
                  href="https://github.com/settings/tokens/new" 
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginLeft: '12px' }}
                >
                  <FaLink size={12} /> Create a new token
                </LinkButton>
              </div>
            )}
          </ErrorContent>
        </EnhancedErrorMessage>
      );
    }
    
    // Add tab navigation
    const renderTabContent = () => {
      if (activeTab === 'mine') {
        if (pullRequests.length === 0) {
          return (
            <EmptyState>
              <FaGithub />
              <h3>No open pull requests</h3>
              <p>You don't have any open pull requests at the moment. When you create pull requests, they'll appear here.</p>
              <LinkButton 
                href="https://github.com" 
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginTop: '10px' }}
              >
                <FaGithub /> Go to GitHub
              </LinkButton>
            </EmptyState>
          );
        }

        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Your Open Pull Requests</h3>
              <div style={{ color: '#888', fontSize: '14px' }}>
                {pullRequests.length} {pullRequests.length === 1 ? 'pull request' : 'pull requests'} found
              </div>
            </div>
            <PRList>
              {pullRequests.map((pr: any) => (
                <PRItem key={pr.id}>
                  <PRHeader>
                    <PRTitle>{pr.title}</PRTitle>
                    <PRLink href={pr.html_url} target="_blank" rel="noopener noreferrer">
                      Open in GitHub <FaExternalLinkAlt size={12} />
                    </PRLink>
                  </PRHeader>
                  <div style={{ color: '#aaa', fontSize: '14px', marginTop: '6px' }}>
                    {pr.repository_url?.split('/').slice(-1)[0]}
                  </div>
                  <PRMeta>
                    <PRMetaItem>
                      <FaClock size={12} />
                      <span>Updated {formatRelativeTime(pr.updated_at)}</span>
                    </PRMetaItem>
                    <PRMetaItem>
                      <FaCodeBranch size={12} />
                      <span>{pr.head?.ref}</span>
                    </PRMetaItem>
                    <PRMetaItem>
                      {pr.draft ? (
                        <>
                          <FaTimes size={12} color="#888" />
                          <span>Draft</span>
                        </>
                      ) : (
                        <>
                          <FaCheck size={12} color="#29a745" />
                          <span>Ready</span>
                        </>
                      )}
                    </PRMetaItem>
                  </PRMeta>
                </PRItem>
              ))}
            </PRList>
          </>
        );
      } else {
        // Review requests tab
        if (reviewRequests.length === 0) {
          return (
            <EmptyReview>
              <FaCommentDots />
              <h3>No review requests</h3>
              <p>You don't have any pull requests to review at the moment. When someone requests your review, they'll appear here.</p>
              <LinkButton 
                href="https://github.com/pulls/review-requested" 
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginTop: '10px' }}
              >
                <FaGithub /> Check on GitHub
              </LinkButton>
            </EmptyReview>
          );
        }

        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Pull Requests to Review</h3>
              <div style={{ color: '#888', fontSize: '14px' }}>
                {reviewRequests.length} {reviewRequests.length === 1 ? 'pull request' : 'pull requests'} need your review
              </div>
            </div>
            <PRList>
              {reviewRequests.map((pr: any) => (
                <PRItem key={pr.id}>
                  <PRHeader>
                    <PRTitle>{pr.title}</PRTitle>
                    <PRLink href={pr.html_url} target="_blank" rel="noopener noreferrer">
                      Review on GitHub <FaExternalLinkAlt size={12} />
                    </PRLink>
                  </PRHeader>
                  <div style={{ color: '#aaa', fontSize: '14px', marginTop: '6px' }}>
                    {pr.repository_url?.split('/').slice(-1)[0]} • Opened by {pr.user?.login}
                  </div>
                  <PRMeta>
                    <PRMetaItem>
                      <FaClock size={12} />
                      <span>Updated {formatRelativeTime(pr.updated_at)}</span>
                    </PRMetaItem>
                    <PRMetaItem>
                      <FaCodeBranch size={12} />
                      <span>{pr.head?.ref}</span>
                    </PRMetaItem>
                    <PRMetaItem style={{ color: '#FF385C' }}>
                      <FaUserEdit size={12} />
                      <span>Review requested</span>
                    </PRMetaItem>
                  </PRMeta>
                </PRItem>
              ))}
            </PRList>
          </>
        );
      }
    };
    
    return (
      <>
        <TabsContainer>
          <Tab 
            active={activeTab === 'mine'} 
            onClick={() => setActiveTab('mine')}
          >
            <FaGithub /> My PRs {pullRequests.length > 0 && <ReviewBadge>{pullRequests.length}</ReviewBadge>}
          </Tab>
          <Tab 
            active={activeTab === 'reviews'} 
            onClick={() => setActiveTab('reviews')}
          >
            <FaCommentDots /> Review Requests {reviewRequests.length > 0 && <ReviewBadge>{reviewRequests.length}</ReviewBadge>}
          </Tab>
        </TabsContainer>
        {renderTabContent()}
      </>
    );
  };
  
  // Replace the renderTokenManagement method with this improved version
  const renderTokenManagement = () => {
    if (!initialized) return null;
    
    return (
      <>
        <ManagementContainer>
          <ManagementHeader>
            <FaUserSecret />
            <h3>Token Management</h3>
          </ManagementHeader>
          
          <p>Your GitHub personal access token is used to securely connect with GitHub API.</p>
          
          {editingToken ? (
            <>
              <EnhancedTokenInput>
                <InputLabel htmlFor="new-github-token">New Personal Access Token</InputLabel>
                <TokenInputField
                  id="new-github-token"
                  type="password"
                  value={newToken}
                  onChange={(e) => setNewToken(e.target.value)}
                  placeholder="Enter new GitHub token"
                  autoComplete="off"
                />
                <InputHint>
                  <FaQuestionCircle size={12} />
                  <span>Need a new token? <LinkButton href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer">Create one on GitHub</LinkButton></span>
                </InputHint>
              </EnhancedTokenInput>
              
              <ButtonGroup>
                <PrimaryButton onClick={saveUpdatedToken}>
                  <FaKey /> Save New Token
                </PrimaryButton>
                <OutlineButton onClick={() => setEditingToken(false)}>Cancel</OutlineButton>
              </ButtonGroup>
            </>
          ) : (
            <>
              <div style={{ margin: '16px 0' }}>
                <InputLabel>Current Token</InputLabel>
                <TokenField>
                  <TokenDisplay>{maskToken(token)}</TokenDisplay>
                  <TokenActions>
                    <IconButton onClick={toggleTokenVisibility} title={showFullToken ? "Hide token" : "Show token"}>
                      {showFullToken ? <FaEyeSlash /> : <FaEye />}
                    </IconButton>
                    <IconButton onClick={startEditingToken} title="Edit token">
                      <FaCog />
                    </IconButton>
                    <IconButton onClick={resetToken} title="Reset token">
                      <FaTrash />
                    </IconButton>
                  </TokenActions>
                </TokenField>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#aaa' }}>Token Security</p>
                  <SecureBadge>
                    <FaLock size={12} />
                    <span>Encrypted at rest</span>
                  </SecureBadge>
                </div>
                
                <OutlineButton onClick={startEditingToken}>
                  <FaKey /> Update Token
                </OutlineButton>
              </div>
              
              <div style={{ marginTop: '24px', padding: '12px', backgroundColor: 'rgba(255, 56, 92, 0.05)', borderRadius: '6px', fontSize: '13px' }}>
                <p style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaQuestionCircle /> <strong>When to update your token:</strong>
                </p>
                <ul style={{ margin: '0', paddingLeft: '20px' }}>
                  <li>Your current token has expired</li>
                  <li>You need different permissions</li>
                  <li>You suspect your token has been compromised</li>
                  <li>GitHub security alerts recommend rotation</li>
                </ul>
              </div>
            </>
          )}
        </ManagementContainer>
        <ContentSeparator />
      </>
    );
  };
  
  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={onReturn}>
            <FaArrowLeft />
          </BackButton>
          <Title>
            <FaGithub />
            GitHub Pull Requests
          </Title>
        </HeaderLeft>
        <div style={{ display: 'flex', gap: '8px' }}>
          {initialized && !loading && (
            <>
              <RefreshButton onClick={fetchAllPullRequests}>
                <FaSync />
              </RefreshButton>
              <RefreshButton 
                onClick={() => setShowTokenManagement(!showTokenManagement)} 
                title={showTokenManagement ? "Hide token management" : "Manage token"}
                style={showTokenManagement ? { color: '#FF385C', backgroundColor: 'rgba(255, 56, 92, 0.1)' } : {}}
              >
                <FaCog />
              </RefreshButton>
            </>
          )}
        </div>
      </Header>
      <Content>
        {showTokenManagement && initialized && renderTokenManagement()}
        {renderContent()}
      </Content>
    </Container>
  );
};

export default GitHubPanel; 