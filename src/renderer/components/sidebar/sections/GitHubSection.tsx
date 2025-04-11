import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaGithub, FaSync, FaExternalLinkAlt } from 'react-icons/fa';
import githubService from '../../../services/GitHubService';

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
  
  // Load token from localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
      setToken(savedToken);
      initializeGitHubService(savedToken);
    }
  }, []);
  
  const initializeGitHubService = async (accessToken: string) => {
    try {
      await githubService.initialize(accessToken);
      setInitialized(true);
      if (expanded) {
        fetchPullRequests();
      }
    } catch (error) {
      console.error('Failed to initialize GitHub service:', error);
      setInitialized(false);
    }
  };
  
  const fetchPullRequests = async () => {
    if (!githubService.isInitialized()) {
      return;
    }
    
    setLoading(true);
    try {
      const prs = await githubService.getMyOpenPullRequests();
      setPullRequests(prs);
    } catch (error) {
      console.error('Error fetching pull requests:', error);
      setPullRequests([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveToken = async () => {
    localStorage.setItem('github_token', token);
    await initializeGitHubService(token);
  };
  
  // Fetch PRs when section is expanded
  useEffect(() => {
    if (expanded && initialized) {
      fetchPullRequests();
    }
  }, [expanded, initialized]);
  
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
          </TokenContainer>
        ) : loading ? (
          <EmptyState>Loading...</EmptyState>
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