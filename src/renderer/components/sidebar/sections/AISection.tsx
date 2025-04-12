import React from 'react';
import { FaRobot } from 'react-icons/fa';
import styled from 'styled-components';

const Section = styled.div`
  margin-bottom: 16px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.8);
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  svg {
    margin-right: 8px;
    color: #FF385C;
  }
`;

const SectionTitle = styled.div`
  flex: 1;
  font-size: 14px;
  font-weight: 500;
`;

const SectionContent = styled.div`
  margin-top: 4px;
  margin-left: 12px;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  svg {
    margin-right: 8px;
    opacity: 0.7;
  }
`;

const ItemText = styled.div`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface AISectionProps {
  expanded: boolean;
  toggleSection: () => void;
  onNavigateToAI: () => void;
}

const AISection: React.FC<AISectionProps> = ({
  expanded,
  toggleSection,
  onNavigateToAI,
}) => {
  return (
    <Section>
      <SectionHeader onClick={toggleSection}>
        <FaRobot size={16} />
        <SectionTitle>AI Assistant</SectionTitle>
        {expanded ? '−' : '+'}
      </SectionHeader>

      {expanded && (
        <SectionContent>
          <Item onClick={onNavigateToAI}>
            <FaRobot size={14} />
            <ItemText>AI Chat</ItemText>
          </Item>
        </SectionContent>
      )}
    </Section>
  );
};

export default AISection; 