import React from 'react';
import styled from 'styled-components';
import { FaGithub } from 'react-icons/fa';
import { CollectionTitle } from '../../../styles/StyledComponents';

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

interface GitHubSectionProps {
  onNavigate: () => void;
}

export const GitHubSection: React.FC<GitHubSectionProps> = ({
  onNavigate
}) => {
  return (
    <Section>
      <SectionHeader onClick={onNavigate}>
        <SectionTitle>
          <FaGithub />
          <CollectionTitle>GitHub Pull Requests</CollectionTitle>
        </SectionTitle>
      </SectionHeader>
    </Section>
  );
};

export default GitHubSection; 