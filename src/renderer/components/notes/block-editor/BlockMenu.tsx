import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { BlockType, Position, BlockMenuOption } from './types';
import { 
  FaParagraph, 
  FaHeading, 
  FaListUl, 
  FaListOl, 
  FaCheck, 
  FaQuoteRight, 
  FaCode, 
  FaGripLines, 
  FaImage, 
  FaExclamationCircle,
  FaCaretRight
} from 'react-icons/fa';

const MenuContainer = styled.div<{ position: Position }>`
  position: absolute;
  left: ${props => props.position.x}px;
  top: ${props => props.position.y}px;
  z-index: 1000;
  background-color: #292929;
  border: 1px solid #444;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  width: 280px;
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 6px;
`;

const MenuTitle = styled.div`
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 6px;
  padding: 0 8px;
`;

const MenuOption = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #444;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 12px;
  color: #aaa;
`;

const OptionContent = styled.div`
  flex: 1;
`;

const OptionTitle = styled.div`
  font-size: 0.9rem;
  color: #eee;
  margin-bottom: 2px;
`;

const OptionDescription = styled.div`
  font-size: 0.75rem;
  color: #777;
`;

const Shortcut = styled.div`
  font-size: 0.75rem;
  color: #888;
  margin-left: 8px;
`;

interface BlockMenuProps {
  position: Position;
  onClose: () => void;
  onSelectBlockType: (type: BlockType) => void;
}

const BlockMenu: React.FC<BlockMenuProps> = ({
  position,
  onClose,
  onSelectBlockType
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Define available block types
  const blockOptions: BlockMenuOption[] = [
    {
      type: BlockType.Paragraph,
      label: 'Text',
      icon: <FaParagraph />,
      shortcut: '/'
    },
    {
      type: BlockType.Heading1,
      label: 'Heading 1',
      icon: <FaHeading />,
      shortcut: '# '
    },
    {
      type: BlockType.Heading2,
      label: 'Heading 2',
      icon: <FaHeading />,
      shortcut: '## '
    },
    {
      type: BlockType.Heading3,
      label: 'Heading 3',
      icon: <FaHeading />,
      shortcut: '### '
    },
    {
      type: BlockType.BulletList,
      label: 'Bullet List',
      icon: <FaListUl />,
      shortcut: '- '
    },
    {
      type: BlockType.NumberedList,
      label: 'Numbered List',
      icon: <FaListOl />,
      shortcut: '1. '
    },
    {
      type: BlockType.ToDo,
      label: 'To-Do',
      icon: <FaCheck />,
      shortcut: '[] '
    },
    {
      type: BlockType.Quote,
      label: 'Quote',
      icon: <FaQuoteRight />,
      shortcut: '> '
    },
    {
      type: BlockType.Code,
      label: 'Code',
      icon: <FaCode />,
      shortcut: '```'
    },
    {
      type: BlockType.Divider,
      label: 'Divider',
      icon: <FaGripLines />,
      shortcut: '---'
    },
    {
      type: BlockType.Callout,
      label: 'Callout',
      icon: <FaExclamationCircle />
    },
    {
      type: BlockType.Toggle,
      label: 'Toggle',
      icon: <FaCaretRight />
    },
    {
      type: BlockType.Image,
      label: 'Image',
      icon: <FaImage />
    }
  ];
  
  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Adjust position to stay in viewport
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 300),
    y: Math.min(position.y, window.innerHeight - 300)
  };

  return (
    <MenuContainer position={adjustedPosition} ref={menuRef}>
      <MenuTitle>BASIC BLOCKS</MenuTitle>
      
      {blockOptions.map(option => (
        <MenuOption 
          key={option.type} 
          onClick={() => onSelectBlockType(option.type)}
        >
          <IconWrapper>
            {option.icon}
          </IconWrapper>
          <OptionContent>
            <OptionTitle>{option.label}</OptionTitle>
            <OptionDescription>
              {option.type === BlockType.Paragraph ? 'Just start writing with plain text' : 
               option.type === BlockType.Heading1 ? 'Big section heading' :
               option.type === BlockType.Code ? 'Create a code snippet' :
               'Create a block of this type'}
            </OptionDescription>
          </OptionContent>
          {option.shortcut && (
            <Shortcut>{option.shortcut}</Shortcut>
          )}
        </MenuOption>
      ))}
    </MenuContainer>
  );
};

export default BlockMenu; 