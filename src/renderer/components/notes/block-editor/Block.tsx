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
  FaPlus,
  FaRobot
} from 'react-icons/fa';
import AIBlock from './blocks/AIBlock';

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
  background-color: transparent;
  transition: background-color 0.2s ease;
  
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

const TodoCheckbox = styled.div<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  border: 1.5px solid ${props => props.$checked ? '#4285f4' : '#777'};
  border-radius: 4px;
  background-color: ${props => props.$checked ? '#4285f4' : 'transparent'};
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #4285f4;
  }
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
    white-space: pre;
    tab-size: 2;
    -moz-tab-size: 2;
  `}
  
  ${props => props.$blockType === BlockType.Callout && `
    background-color: rgba(255, 56, 92, 0.1);
    border-left: 3px solid #FF385C;
    padding: 8px 12px;
    border-radius: 0 4px 4px 0;
  `}
  
  ${props => props.$blockType === BlockType.BulletList && `
    line-height: 1.5;
  `}
  
  ${props => props.$blockType === BlockType.NumberedList && `
    line-height: 1.5;
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

const BulletIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  color: #aaa;
`;

const NumberIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 20px;
  height: 20px;
  margin-right: 8px;
  color: #aaa;
  font-size: 0.9rem;
`;

interface BlockProps {
  block: BlockData;
  isSelected: boolean;
  onUpdate: (block: BlockData) => void;
  onAddBlock: (blockId: string, blockType?: BlockType) => void;
  onDeleteBlock: (blockId: string) => void;
  onOpenBlockMenu: (blockId: string, position: { x: number; y: number }, initialFilterText: string) => void;
  onSelect: (blockId: string) => void;
  onRegenerateAI?: (blockId: string) => void;
}

const Block: React.FC<BlockProps> = ({
  block,
  isSelected,
  onUpdate,
  onAddBlock,
  onDeleteBlock,
  onOpenBlockMenu,
  onSelect,
  onRegenerateAI
}) => {
  const [content, setContent] = useState(block.content);
  const contentRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const [slashMenuActive, setSlashMenuActive] = useState(false);
  const [slashMenuText, setSlashMenuText] = useState('');
  const slashCommandSelectionRef = useRef<number | null>(null);
  const previousContentRef = useRef(content);
  const isUpdatingFromParent = useRef(false);
  
  // Update parent when content changes, but prevent infinite loop
  useEffect(() => {
    // Skip the first render and any updates from parent
    if (isInitialMount.current || isUpdatingFromParent.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Only update parent if content actually changed
    if (content !== previousContentRef.current) {
      previousContentRef.current = content;
      onUpdate({
        ...block,
        content
      });
    }
  }, [content, block, onUpdate]);
  
  // Watch for changes to block content and update state
  useEffect(() => {
    // Only update local state if block content changed from outside
    if (block.content !== content && block.content !== previousContentRef.current) {
      isUpdatingFromParent.current = true;
      previousContentRef.current = block.content;
      setContent(block.content);
      setSlashMenuActive(false);
      setSlashMenuText('');
      
      // Reset the updating flag after state has been applied
      setTimeout(() => {
        isUpdatingFromParent.current = false;
      }, 0);
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
      case BlockType.AI:
        return <FaRobot />;
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
    
    // Handle up arrow key to navigate to previous block
    if (e.key === 'ArrowUp' && !e.shiftKey && !e.metaKey && !e.altKey) {
      // Only navigate if cursor is at the start of the content
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      
      if (range && range.startOffset === 0 && range.collapsed) {
        e.preventDefault();
        
        // Find the current block index in the DOM
        const blockElements = Array.from(document.querySelectorAll('[data-block-id]'));
        const currentBlockIndex = blockElements.findIndex(el => el.getAttribute('data-block-id') === block.id);
        
        // If there's a previous block, select it
        if (currentBlockIndex > 0) {
          const prevBlockId = blockElements[currentBlockIndex - 1].getAttribute('data-block-id');
          if (prevBlockId) {
            onSelect(prevBlockId);
          }
        }
      }
    }
    
    // Handle down arrow key to navigate to next block
    if (e.key === 'ArrowDown' && !e.shiftKey && !e.metaKey && !e.altKey) {
      // Only navigate if cursor is at the end of the content
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      const contentEl = contentRef.current;
      
      if (range && contentEl) {
        const contentLength = contentEl.textContent?.length || 0;
        
        // Check if cursor is at the end of content
        if (range.startOffset === contentLength && range.collapsed) {
          e.preventDefault();
          
          // Find the current block index in the DOM
          const blockElements = Array.from(document.querySelectorAll('[data-block-id]'));
          const currentBlockIndex = blockElements.findIndex(el => el.getAttribute('data-block-id') === block.id);
          
          // If there's a next block, select it
          if (currentBlockIndex < blockElements.length - 1) {
            const nextBlockId = blockElements[currentBlockIndex + 1].getAttribute('data-block-id');
            if (nextBlockId) {
              onSelect(nextBlockId);
            }
          }
        }
      }
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
    // Handle space key to trigger shortcuts
    else if (e.key === ' ' && !slashMenuActive && contentRef.current) {
      const currentText = contentRef.current.textContent || '';
      
      // Check for shortcuts that should be triggered when followed by space
      if (currentText === '#') {
        e.preventDefault();
        applyBlockTransformation(BlockType.Heading1);
      } else if (currentText === '##') {
        e.preventDefault();
        applyBlockTransformation(BlockType.Heading2);
      } else if (currentText === '###') {
        e.preventDefault();
        applyBlockTransformation(BlockType.Heading3);
      } else if (currentText === '-' || currentText === '*') {
        e.preventDefault();
        applyBlockTransformation(BlockType.BulletList);
      } else if (/^\d+\.$/.test(currentText)) {
        e.preventDefault();
        applyBlockTransformation(BlockType.NumberedList);
      } else if (currentText === '[]' || currentText === '[ ]') {
        e.preventDefault();
        applyBlockTransformation(BlockType.ToDo, false);
      } else if (currentText === '>') {
        e.preventDefault();
        applyBlockTransformation(BlockType.Quote);
      }
      // Not a shortcut, let the space through normally
    }
    // Special handling for code blocks: Enter should insert a newline instead of creating a new block
    else if (e.key === 'Enter' && !e.shiftKey && block.type === BlockType.Code) {
      e.preventDefault();
      
      if (contentRef.current) {
        // Get the current selection
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);
        
        if (range) {
          // Insert a newline at the current position
          document.execCommand('insertText', false, '\n');
          
          // Update content state with the new content including line break
          setContent(contentRef.current.textContent || '');
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
      
      // If content is empty and block is a list or todo, convert to paragraph
      if (content === '' && (block.type === BlockType.BulletList || block.type === BlockType.NumberedList || block.type === BlockType.ToDo)) {
        onUpdate({
          ...block,
          type: BlockType.Paragraph
        });
      } 
      // Create a new block of the same type for lists
      else if (block.type === BlockType.BulletList || block.type === BlockType.NumberedList || block.type === BlockType.ToDo) {
        onAddBlock(block.id, block.type);
      } else {
        onAddBlock(block.id);
      }
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
    
    // Skip update if content hasn't changed (prevents unnecessary re-renders)
    if (newContent === content) {
      return;
    }
    
    setContent(newContent);
    
    // If the content no longer contains the slash, exit slash menu mode
    if (slashMenuActive && !newContent.includes('/')) {
      setSlashMenuActive(false);
    }

    // Process direct shortcuts if not in slash menu mode
    if (!slashMenuActive && newContent.trim().length > 0) {
      // Check for direct shortcuts at the beginning of the line
      const trimmedContent = newContent.trim();
      
      // Only check for shortcuts if the content is JUST the shortcut text
      // This prevents accidentally triggering transformations while typing
      if (trimmedContent.length <= 3) {
        // Check for headings
        if (/^#\s*$/.test(trimmedContent) || trimmedContent === '#') {
          applyBlockTransformation(BlockType.Heading1);
        } else if (/^##\s*$/.test(trimmedContent) || trimmedContent === '##') {
          applyBlockTransformation(BlockType.Heading2);
        } else if (/^###\s*$/.test(trimmedContent) || trimmedContent === '###') {
          applyBlockTransformation(BlockType.Heading3);
        } 
        // Check for bullet list
        else if (/^-\s*$/.test(trimmedContent) || trimmedContent === '-' || /^\*\s*$/.test(trimmedContent) || trimmedContent === '*') {
          applyBlockTransformation(BlockType.BulletList);
        } 
        // Check for numbered list
        else if (/^\d+\.\s*$/.test(trimmedContent) || /^\d+\.$/.test(trimmedContent)) {
          applyBlockTransformation(BlockType.NumberedList);
        } 
        // Check for todo list - allow various formats with or without spaces
        else if (/^\[\s*\]\s*$/.test(trimmedContent) || /^\[\]\s*$/.test(trimmedContent)) {
          applyBlockTransformation(BlockType.ToDo, false);
        } 
        // Check for quote
        else if (/^>\s*$/.test(trimmedContent) || trimmedContent === '>') {
          applyBlockTransformation(BlockType.Quote);
        } 
        // Check for code block
        else if (trimmedContent === '```') {
          applyBlockTransformation(BlockType.Code, undefined, 'plaintext');
        } 
        // Check for divider
        else if (trimmedContent === '---') {
          applyBlockTransformation(BlockType.Divider);
        }
      }
    }
  };
  
  // Helper function to apply block transformation
  const applyBlockTransformation = (newType: BlockType, checked?: boolean, language?: string) => {
    // Prevent update loops by marking this as an update from parent
    isUpdatingFromParent.current = true;
    
    // Set previousContent to empty to avoid duplicate updates
    previousContentRef.current = '';
    
    // Update the block through the parent
    onUpdate({
      ...block,
      type: newType,
      content: '',
      ...(checked !== undefined ? { checked } : {}),
      ...(language !== undefined ? { language } : {})
    });
    
    // Update local state
    setContent('');
    
    // Clear the content in the DOM
    if (contentRef.current) {
      contentRef.current.textContent = '';
    }
    
    // Reset the update flag after a short delay
    setTimeout(() => {
      isUpdatingFromParent.current = false;
    }, 0);
  };

  // Handle toggling todo item
  const handleTodoToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent block selection
    
    onUpdate({
      ...block,
      checked: !block.checked
    });
  };

  // Set initial content on mount
  useEffect(() => {
    if (contentRef.current) {
      // Always update the DOM with the current block content
      contentRef.current.textContent = block.content;
      
      // Only update state on initial mount
      if (isInitialMount.current) {
        isInitialMount.current = false;
        setContent(block.content);
        previousContentRef.current = block.content;
      }
    }
  }, [block.content]);

  return (
    <BlockContainer 
      $isSelected={isSelected} 
      $isEmpty={content === ''} 
      $blockType={block.type}
      onClick={() => onSelect(block.id)}
      data-block-id={block.id}
    >
      {block.type === BlockType.AI ? (
        <AIBlock 
          block={block} 
          onRegenerateClick={onRegenerateAI}
        />
      ) : (
        <BlockContent $blockType={block.type}>
          {block.type === BlockType.ToDo && (
            <TodoCheckbox 
              $checked={!!block.checked} 
              onClick={handleTodoToggle}
            >
              {block.checked && <FaCheck size={12} />}
            </TodoCheckbox>
          )}
          {block.type === BlockType.BulletList && (
            <BulletIndicator>
              <span>•</span>
            </BulletIndicator>
          )}
          {block.type === BlockType.NumberedList && (
            <NumberIndicator>
              <span>1.</span>
            </NumberIndicator>
          )}
          <BlockInput
            ref={contentRef}
            $blockType={block.type}
            contentEditable
            suppressContentEditableWarning
            onInput={handleContentChange}
            onKeyDown={handleKeyDown}
          />
        </BlockContent>
      )}
    </BlockContainer>
  );
};

export default Block; 