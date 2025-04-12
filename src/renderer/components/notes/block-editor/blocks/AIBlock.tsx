import React from 'react';
import styled from 'styled-components';
import { BlockData } from '../types';
import { FaRobot, FaRedo } from 'react-icons/fa';

const Container = styled.div`
  position: relative;
  margin: 12px 0;
  padding: 0;
`;

const Content = styled.div`
  font-size: 16px;
  line-height: 1.6;
  color: #eee;
  white-space: pre-wrap;
  padding: 0;
`;

const ActionButtons = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${Container}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  color: #aaa;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    color: #eee;
  }
`;

interface AIBlockProps {
  block: BlockData;
  onRegenerateClick?: (blockId: string) => void;
}

const AIBlock: React.FC<AIBlockProps> = ({ 
  block,
  onRegenerateClick
}) => {
  return (
    <Container>
      <Content>
        {block.content}
      </Content>
      
      <ActionButtons>
        <ActionButton 
          title="Regenerate" 
          onClick={() => onRegenerateClick?.(block.id)}
        >
          <FaRedo />
        </ActionButton>
      </ActionButtons>
    </Container>
  );
};

export default AIBlock; 