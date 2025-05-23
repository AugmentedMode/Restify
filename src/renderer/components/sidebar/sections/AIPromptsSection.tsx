import React, { useEffect, useState } from 'react';
import { FaLightbulb, FaPlus, FaStar } from 'react-icons/fa';
import styled from 'styled-components';

// Styled components
const Section = styled.div`
  margin-bottom: 10px;
`;

const SectionHeader = styled.div<{ isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  cursor: pointer;
  user-select: none;
  border-radius: 4px;
  color: ${props => props.isActive ? '#FF385C' : 'rgba(255, 255, 255, 0.8)'};
  background-color: ${props => props.isActive ? 'rgba(255, 56, 92, 0.1)' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.isActive ? 'rgba(255, 56, 92, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
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

const SectionContent = styled.div`
  margin-top: 4px;
  margin-left: 12px;
`;

const Item = styled.div<{ isActive?: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  border-radius: 6px;
  color: ${props => props.isActive ? '#FF385C' : 'rgba(255, 255, 255, 0.8)'};
  background-color: ${props => props.isActive ? 'rgba(255, 56, 92, 0.1)' : 'transparent'};
  font-size: 14px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${props => props.isActive ? 'rgba(255, 56, 92, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
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

const AddButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 56, 92, 0.1);
  border-radius: 6px;
  padding: 6px 12px;
  margin: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 56, 92, 0.2);
  }
  
  svg {
    margin-right: 8px;
    color: #FF385C;
  }
`;

interface AIPromptsSectionProps {
  expanded: boolean;
  toggleSection: () => void;
  onNavigateToPrompts: () => void;
  onAddNewPrompt: () => void;
  onViewSavedPrompts: () => void;
}

const AIPromptsSection: React.FC<AIPromptsSectionProps> = ({
  expanded,
  toggleSection,
  onNavigateToPrompts,
  onAddNewPrompt,
  onViewSavedPrompts,
}) => {
  const [isActive, setIsActive] = useState(false);
  
  // Check if we're on the AI prompts page
  useEffect(() => {
    const checkActiveState = () => {
      const pathname = window.location.pathname;
      setIsActive(pathname.startsWith('/ai-prompts'));
    };
    
    // Check initially
    checkActiveState();
    
    // Listen for route changes
    window.addEventListener('popstate', checkActiveState);
    
    return () => {
      window.removeEventListener('popstate', checkActiveState);
    };
  }, []);
  
  return (
    <Section>
      <SectionHeader onClick={onNavigateToPrompts} isActive={isActive}>
        <SectionTitle>
          <FaLightbulb size={16} />
          AI Prompts
        </SectionTitle>
      </SectionHeader>

      {expanded && (
        <SectionContent>
          <Item onClick={onNavigateToPrompts} isActive={isActive && !window.location.pathname.includes('/new') && !window.location.pathname.includes('/saved')}>
            <FaLightbulb size={14} />
            <ItemText>All Prompts</ItemText>
          </Item>
        </SectionContent>
      )}
    </Section>
  );
};

export default AIPromptsSection; 