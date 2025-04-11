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
  FaTimes
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
  max-width: 500px;
  margin: 40px auto;
  padding: 24px;
  background-color: #252525;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
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

interface GitHubPanelProps {
  onReturn: () => void;
}

const GitHubPanel: React.FC<GitHubPanelProps> = ({ onReturn }) => {
  const [pullRequests, setPullRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string>('');
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get settings from context
  const { settings } = useSettings();
  
  // Function to reset token in case of issues
  const resetToken = () => {
    console.log('[GitHub] Resetting token due to user request');
    GitHubService.clearStoredToken();
    setToken('');
    setInitialized(false);
    setError(null);
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
      fetchPullRequests();
    } catch (error) {
      console.error('[GitHub] Failed to initialize GitHub service:', error);
      setError('Failed to initialize GitHub service. Please check your token.');
      setInitialized(false);
    }
  };
  
  const fetchPullRequests = async () => {
    if (!githubService.isInitialized()) {
      setError('GitHub service not initialized. Please add your token.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const prs = await githubService.getMyOpenPullRequests();
      setPullRequests(prs);
    } catch (error: any) {
      console.error('[GitHub] Error fetching pull requests:', error);
      if (error.message?.includes('Bad credentials')) {
        setError('Invalid GitHub token. Please check your token and try again.');
        setInitialized(false);
      } else {
        setError(`Error fetching PRs: ${error.message || 'Unknown error'}`);
      }
      setPullRequests([]);
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
  
  // Render the content based on state
  const renderContent = () => {
    if (!initialized) {
      return (
        <TokenContainer>
          <h3>GitHub Personal Access Token</h3>
          <p>Enter your GitHub token to view your open pull requests:</p>
          <TokenInput
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="GitHub Personal Access Token"
          />
          <SaveButton onClick={handleSaveToken}>Connect GitHub Account</SaveButton>
          
          {settings.security.storeGitHubToken && (
            <SecureBadge>
              <FaLock size={12} />
              <span>Your token will be encrypted at rest</span>
            </SecureBadge>
          )}
          
          {error && (
            <ErrorMessage>
              <FaExclamationTriangle />
              <div>
                <div>{error}</div>
                {error.includes('corrupted') || error.includes('Invalid') ? (
                  <ResetButton onClick={resetToken}>
                    Reset Stored Token
                  </ResetButton>
                ) : null}
              </div>
            </ErrorMessage>
          )}
        </TokenContainer>
      );
    }
    
    if (loading) {
      return (
        <LoadingSpinner>
          <FaSync />
        </LoadingSpinner>
      );
    }
    
    if (error) {
      return (
        <ErrorMessage>
          <FaExclamationTriangle />
          <div>
            <div>{error}</div>
            {error.includes('Invalid') && (
              <ResetButton onClick={resetToken}>
                Reset Token
              </ResetButton>
            )}
          </div>
        </ErrorMessage>
      );
    }
    
    if (pullRequests.length === 0) {
      return (
        <EmptyState>
          <FaGithub />
          <h3>No open pull requests</h3>
          <p>You don't have any open pull requests at the moment.</p>
        </EmptyState>
      );
    }
    
    return (
      <PRList>
        {pullRequests.map((pr: any) => (
          <PRItem key={pr.id}>
            <PRHeader>
              <PRTitle>{pr.title}</PRTitle>
              <PRLink href={pr.html_url} target="_blank" rel="noopener noreferrer">
                Open in GitHub <FaExternalLinkAlt size={12} />
              </PRLink>
            </PRHeader>
            <div>{pr.repository_url?.split('/').slice(-1)[0]}</div>
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
            My Pull Requests
          </Title>
        </HeaderLeft>
        {initialized && !loading && (
          <RefreshButton onClick={fetchPullRequests}>
            <FaSync />
          </RefreshButton>
        )}
      </Header>
      <Content>
        {renderContent()}
      </Content>
    </Container>
  );
};

export default GitHubPanel; 