import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaGithub, FaSync, FaExternalLinkAlt, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import githubService, { GitHubService } from '../../../services/GitHubService';
import { useSettings } from '../../../utils/SettingsContext';

// Styled components
const Section = styled.div`
  margin-bottom: 10px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  cursor: pointer;
  user-select: none;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  font-weight: 500;
  
  svg {
    margin-right: 10px;
  }
`;

const SectionContent = styled.div<{ expanded: boolean }>`
  max-height: ${props => (props.expanded ? '300px' : '0')};
  overflow-y: auto;
  overflow-x: hidden;
  transition: max-height 0.2s ease-in-out;
`;

const PRListItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 10px 8px 32px;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 4px;
  color: #dcdcdc;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const PRTitle = styled.div`
  flex: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  margin-right: 10px;
`;

const ExternalLink = styled.div`
  opacity: 0.5;
  
  &:hover {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: #dcdcdc;
  cursor: pointer;
  padding: 2px;
  transition: all 0.2s ease;
  
  &:hover {
    color: white;
  }
`;

const EmptyState = styled.div`
  padding: 10px;
  text-align: center;
  font-size: 0.85rem;
  color: #888;
`;

const TokenInput = styled.input`
  width: 100%;
  padding: 8px;
  background-color: #2a2a2a;
  border: 1px solid #444;
  color: white;
  border-radius: 4px;
  margin: 5px 0;
  
  &:focus {
    outline: none;
    border-color: #666;
  }
`;

const TokenContainer = styled.div`
  padding: 10px;
`;

const SaveButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #0069d9;
  }
`;

// Add a new styled component for the secure badge
const SecureBadge = styled.div`
  background-color: #2a2a2a;
  color: #29a745;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
`;

// Add error message styled component
const ErrorMessage = styled.div`
  color: #ff3860;
  font-size: 0.8rem;
  margin: 8px 0;
  padding: 8px;
  background-color: rgba(255, 56, 96, 0.1);
  border-radius: 4px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const ResetButton = styled.button`
  background-color: transparent;
  color: #ff3860;
  border: 1px solid #ff3860;
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 8px;
  
  &:hover {
    background-color: rgba(255, 56, 96, 0.1);
  }
`;

interface GitHubSectionProps {
  expanded: boolean;
  toggleSection: () => void;
}

export const GitHubSection: React.FC<GitHubSectionProps> = ({
  expanded,
  toggleSection,
}) => {
  const [pullRequests, setPullRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string>('');
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get settings from context to check if we should store the token
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
      
      if (expanded) {
        fetchPullRequests();
      }
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
  
  // Fetch PRs when section is expanded
  useEffect(() => {
    if (expanded && initialized) {
      fetchPullRequests();
    }
  }, [expanded, initialized]);
  
  // Monitor settings changes for storeGitHubToken
  useEffect(() => {
    // If the setting to store token is turned off, clear the token
    if (!settings.security.storeGitHubToken) {
      GitHubService.clearStoredToken();
      // Don't reinitialize as we still want to use the token for the current session
    }
  }, [settings.security.storeGitHubToken]);
  
  const openPullRequest = (url: string) => {
    window.open(url, '_blank');
  };
  
  return (
    <Section>
      <SectionHeader onClick={toggleSection}>
        <SectionTitle>
          <FaGithub />
          <span>My Pull Requests</span>
        </SectionTitle>
        {initialized && (
          <ActionButton onClick={(e) => {
            e.stopPropagation();
            fetchPullRequests();
          }}>
            <FaSync />
          </ActionButton>
        )}
      </SectionHeader>
      
      <SectionContent expanded={expanded}>
        {!initialized ? (
          <TokenContainer>
            <p>Enter your GitHub token to view your open PRs:</p>
            <TokenInput
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="GitHub Personal Access Token"
            />
            <SaveButton onClick={handleSaveToken}>Save Token</SaveButton>
            
            {settings.security.storeGitHubToken && (
              <SecureBadge>
                <FaLock size={10} />
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
        ) : loading ? (
          <EmptyState>Loading...</EmptyState>
        ) : error ? (
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
        ) : pullRequests.length === 0 ? (
          <EmptyState>No open pull requests found</EmptyState>
        ) : (
          pullRequests.map((pr: any) => (
            <PRListItem key={pr.id}>
              <PRTitle>{pr.title}</PRTitle>
              <ExternalLink onClick={() => openPullRequest(pr.html_url)}>
                <FaExternalLinkAlt size={12} />
              </ExternalLink>
            </PRListItem>
          ))
        )}
      </SectionContent>
    </Section>
  );
};

export default GitHubSection; 