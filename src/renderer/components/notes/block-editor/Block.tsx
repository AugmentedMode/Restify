import React, { useRef, useState, useEffect, KeyboardEvent } from 'react';
import styled from 'styled-components';
import { BlockData, BlockType } from './types';
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
  FaCaretRight,
  FaPlus
} from 'react-icons/fa';

interface BlockContainerProps {
  $isSelected: boolean;
  $isDragging?: boolean;
  $isEmpty: boolean;
  $blockType: BlockType;
}

const BlockContainer = styled.div<BlockContainerProps>`
  position: relative;
  margin: 2px 0;
  border-radius: 4px;
  background-color: ${props => props.$isSelected ? 'rgba(255, 255, 255, 0.05)' : 'transparent'};
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.03);
  }
  
  &:hover .block-actions {
    opacity: 1;
  }
`;

const BlockContent = styled.div<{ $blockType: BlockType }>`
  position: relative;
  display: flex;
  min-height: 24px;
  padding: ${props => {
    switch (props.$blockType) {
      case BlockType.Heading1:
        return '16px 8px 8px 8px';
      case BlockType.Heading2:
      case BlockType.Heading3:
        return '12px 8px 6px 8px';
      case BlockType.Quote:
      case BlockType.Callout:
        return '12px 16px';
      default:
        return '6px 8px';
    }
  }};
`;

const BlockTypeIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 8px;
  color: #777;
  font-size: 14px;
`;

const BlockInput = styled.div<{ $blockType: BlockType }>`
  flex: 1;
  border: none;
  background: transparent;
  color: #eee;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  
  font-size: ${props => {
    switch (props.$blockType) {
      case BlockType.Heading1:
        return '1.8rem';
      case BlockType.Heading2:
        return '1.5rem';
      case BlockType.Heading3:
        return '1.2rem';
      case BlockType.Code:
        return '0.9rem';
      default:
        return '1rem';
    }
  }};
  
  font-weight: ${props => {
    switch (props.$blockType) {
      case BlockType.Heading1:
      case BlockType.Heading2:
      case BlockType.Heading3:
        return '600';
      default:
        return '400';
    }
  }};
  
  padding: 0;
  outline: none;
  white-space: pre-wrap;
  word-break: break-word;
  
  ${props => props.$blockType === BlockType.Quote && `
    border-left: 3px solid #777;
    margin-left: 0;
    padding-left: 12px;
    font-style: italic;
    color: #bbb;
  `}
  
  ${props => props.$blockType === BlockType.Code && `
    font-family: 'Fira Code', Menlo, Monaco, 'Courier New', monospace;
    background-color: #2a2a2a;
    padding: 12px;
    border-radius: 4px;
    width: 100%;
    overflow-x: auto;
  `}
  
  ${props => props.$blockType === BlockType.Callout && `
    background-color: rgba(255, 56, 92, 0.1);
    border-left: 3px solid #FF385C;
    padding: 8px 12px;
    border-radius: 0 4px 4px 0;
  `}
`;

const BlockActions = styled.div`
  position: absolute;
  left: -32px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s ease;
`;

const BlockTypeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: #333;
  border: 1px solid #444;
  border-radius: 4px;
  color: #aaa;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #444;
    color: #fff;
  }
`;

const AddBlockButton = styled.button`
  position: absolute;
  left: 50%;
  bottom: -14px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: #333;
  border: 1px solid #444;
  border-radius: 50%;
  color: #aaa;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 5;
  opacity: 0;
  
  &:hover {
    background-color: #FF385C;
    border-color: #FF385C;
    color: #fff;
  }
  
  ${BlockContainer}:hover & {
    opacity: 1;
  }
`;

interface BlockProps {
  block: BlockData;
  isSelected: boolean;
  onUpdate: (block: BlockData) => void;
  onAddBlock: (blockId: string, blockType?: BlockType) => void;
  onDeleteBlock: (blockId: string) => void;
  onOpenBlockMenu: (blockId: string, position: { x: number; y: number }, initialFilterText: string) => void;
  onSelect: (blockId: string) => void;
}

const Block: React.FC<BlockProps> = ({
  block,
  isSelected,
  onUpdate,
  onAddBlock,
  onDeleteBlock,
  onOpenBlockMenu,
  onSelect
}) => {
  const [content, setContent] = useState(block.content);
  const contentRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const [slashMenuActive, setSlashMenuActive] = useState(false);
  const [slashMenuText, setSlashMenuText] = useState('');
  const slashCommandSelectionRef = useRef<number | null>(null);
  
  // Update parent when content changes
  useEffect(() => {
    if (!isInitialMount.current) {
      onUpdate({
        ...block,
        content
      });
    } else {
      isInitialMount.current = false;
    }
  }, [content, block, onUpdate]);
  
  // Watch for changes to block content and update state
  useEffect(() => {
    // If block content changed externally (like when a slash command is selected),
    // update the local content and reset the slash menu state
    if (block.content !== content && !isInitialMount.current) {
      setContent(block.content);
      setSlashMenuActive(false);
      setSlashMenuText('');
    }
  }, [block.content, content]);
  
  // Focus the block when selected
  useEffect(() => {
    if (isSelected && contentRef.current) {
      contentRef.current.focus();
      
      // Place cursor at the end
      const range = document.createRange();
      const selection = window.getSelection();
      
      if (contentRef.current.childNodes.length > 0) {
        const lastNode = contentRef.current.childNodes[contentRef.current.childNodes.length - 1];
        range.setStartAfter(lastNode);
      } else {
        range.setStart(contentRef.current, 0);
      }
      
      range.collapse(true);
      
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [isSelected]);
  
  // Get block type icon
  const getBlockTypeIcon = () => {
    switch (block.type) {
      case BlockType.Heading1:
      case BlockType.Heading2:
      case BlockType.Heading3:
        return <FaHeading />;
      case BlockType.BulletList:
        return <FaListUl />;
      case BlockType.NumberedList:
        return <FaListOl />;
      case BlockType.ToDo:
        return <FaCheck />;
      case BlockType.Quote:
        return <FaQuoteRight />;
      case BlockType.Code:
        return <FaCode />;
      case BlockType.Divider:
        return <FaGripLines />;
      case BlockType.Image:
        return <FaImage />;
      case BlockType.Callout:
        return <FaExclamationCircle />;
      case BlockType.Toggle:
        return <FaCaretRight />;
      case BlockType.Paragraph:
      default:
        return <FaParagraph />;
    }
  };
  
  // Close the slash menu and restore focus
  const closeSlashMenu = () => {
    setSlashMenuActive(false);
    
    // Focus the editor after a short delay to allow the UI to update
    setTimeout(() => {
      if (!contentRef.current) return;
      
      // Get the current content and find the slash position
      const text = contentRef.current.textContent || '';
      const slashIndex = text.lastIndexOf('/');
      
      if (slashIndex >= 0) {
        // Remove the slash and filter text
        const newContent = text.substring(0, slashIndex);
        contentRef.current.textContent = newContent;
        setContent(newContent);
      }
      
      // Focus the content
      contentRef.current.focus();
    }, 10);
  };
  
  // Handle keyboard events like Enter, Backspace, etc.
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // If we're already in slash menu mode and user presses Escape, close it
    if (slashMenuActive && e.key === 'Escape') {
      e.preventDefault();
      closeSlashMenu();
      return;
    }
    
    // Handle /, which opens the block menu
    if (e.key === '/' && !slashMenuActive) {
      e.preventDefault();
      
      if (contentRef.current) {
        // Get cursor position and add / to the content at that position
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);
        
        if (range) {
          // Store the current position where the slash will be inserted
          slashCommandSelectionRef.current = range.startOffset;
          
          // Insert the slash character
          contentRef.current.focus();
          document.execCommand('insertText', false, '/');
          
          const rect = contentRef.current.getBoundingClientRect();
          
          // Get cursor position details for better menu placement
          let cursorRect = rect;
          if (selection && selection.rangeCount > 0) {
            cursorRect = range.getBoundingClientRect();
          }
          
          // Activate slash menu mode
          setSlashMenuActive(true);
          setSlashMenuText('');
          
          onOpenBlockMenu(block.id, { 
            x: cursorRect.left || rect.left, 
            y: (cursorRect.bottom || rect.bottom) + 5
          }, '');
        }
      }
    }
    // Handle Enter to create a new block
    else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // If slash menu is active, close it
      if (slashMenuActive) {
        closeSlashMenu();
        return;
      }
      
      onAddBlock(block.id);
    } 
    // Handle Backspace on empty block to delete
    else if (e.key === 'Backspace') {
      if (content === '') {
        e.preventDefault();
        onDeleteBlock(block.id);
      } else if (slashMenuActive && slashMenuText === '') {
        // If the user has deleted all text after slash, exit slash menu mode
        closeSlashMenu();
      }
    }
    // If slash menu is active, update the filter text for every keypress
    else if (slashMenuActive && e.key.length === 1) { // Only capture printable characters
      const newText = slashMenuText + e.key;
      setSlashMenuText(newText);
      
      // Update the menu with new filter text
      if (contentRef.current) {
        const rect = contentRef.current.getBoundingClientRect();
        const selection = window.getSelection();
        let cursorRect = rect;
        
        if (selection && selection.rangeCount > 0) {
          cursorRect = selection.getRangeAt(0).getBoundingClientRect();
        }
        
        onOpenBlockMenu(block.id, { 
          x: cursorRect.left || rect.left, 
          y: (cursorRect.bottom || rect.bottom) + 5
        }, newText);
      }
    }
  };
  
  // Handle block type button click
  const handleBlockTypeClick = () => {
    if (contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect();
      onOpenBlockMenu(block.id, { x: rect.left, y: rect.bottom }, '');
    }
  };

  // Handle content changes
  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || '';
    setContent(newContent);
    
    // If the content no longer contains the slash, exit slash menu mode
    if (slashMenuActive && !newContent.includes('/')) {
      setSlashMenuActive(false);
    }
  };

  // Set initial content on mount
  useEffect(() => {
    if (contentRef.current && isInitialMount.current) {
      contentRef.current.textContent = content;
    }
  }, []);

  return (
    <BlockContainer 
      $isSelected={isSelected} 
      $isEmpty={content === ''} 
      $blockType={block.type}
      onClick={() => onSelect(block.id)}
      data-block-id={block.id}
    >
      <BlockContent $blockType={block.type}>
        <BlockTypeIcon>
          {getBlockTypeIcon()}
        </BlockTypeIcon>
        
        <BlockInput
          ref={contentRef}
          $blockType={block.type}
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentChange}
          onKeyDown={handleKeyDown}
        />
        
        <BlockActions className="block-actions">
          <BlockTypeButton onClick={handleBlockTypeClick}>
            {getBlockTypeIcon()}
          </BlockTypeButton>
        </BlockActions>
      </BlockContent>
      
      <AddBlockButton onClick={() => onAddBlock(block.id)}>
        <FaPlus size={12} />
      </AddBlockButton>
    </BlockContainer>
  );
};

export default Block; 