import React from 'react';
import { FaLightbulb } from 'react-icons/fa';
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

interface AIPromptsSectionProps {
  expanded: boolean;
  toggleSection: () => void;
  onNavigateToAIPrompts: () => void;
}

const AIPromptsSection: React.FC<AIPromptsSectionProps> = ({
  expanded,
  toggleSection,
  onNavigateToAIPrompts,
}) => {
  return (
    <Section>
      <SectionHeader onClick={toggleSection}>
        <FaLightbulb size={16} />
        <SectionTitle>AI Prompts</SectionTitle>
        {expanded ? '−' : '+'}
      </SectionHeader>

      {expanded && (
        <SectionContent>
          <Item onClick={onNavigateToAIPrompts}>
            <FaLightbulb size={14} />
            <ItemText>Saved Prompts</ItemText>
          </Item>
        </SectionContent>
      )}
    </Section>
  );
};

export default AIPromptsSection; 