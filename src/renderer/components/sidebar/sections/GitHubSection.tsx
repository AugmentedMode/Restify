import React from 'react';
import styled from 'styled-components';
import { FaGithub } from 'react-icons/fa';
import { CollectionTitle } from '../../../styles/StyledComponents';
import { useGitHubProfile } from '../../../hooks/useGitHubProfile';

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

const NotificationBadge = styled.span`
  background-color: #FF385C;
  color: white;
  font-size: 10px;
  font-weight: 500;
  padding: 2px 5px;
  border-radius: 10px;
  margin-left: 8px;
`;

interface GitHubSectionProps {
  onNavigate: () => void;
}

export const GitHubSection: React.FC<GitHubSectionProps> = ({
  onNavigate
}) => {
  // Use GitHub profile hook to get connection status
  const { isConnected } = useGitHubProfile();

  return (
    <Section>
      <SectionHeader onClick={onNavigate}>
        <SectionTitle>
          <FaGithub />
          <CollectionTitle>Pull Requests</CollectionTitle>
          {!isConnected && <NotificationBadge>!</NotificationBadge>}
        </SectionTitle>
      </SectionHeader>
    </Section>
  );
};

export default GitHubSection; 