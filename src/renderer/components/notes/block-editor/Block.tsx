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
  FaRobot,
  FaEdit,
  FaTimes
} from 'react-icons/fa';

// Load markdown components dynamically to avoid ESM import issues
const ReactMarkdown = React.lazy(() => import('react-markdown'));
const rehypeRaw = { default: () => null }; // Placeholder

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

// Add styled component for AI prompt input
const AIPromptContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #121212;
  border-radius: 6px;
  border: 1px solid #333;
  margin: 4px 0;
  padding: 10px 12px;
`;

const RobotIcon = styled.div`
  display: flex;
  align-items: center;
  margin-right: 12px;
  color: #8b3dff;
  
  svg {
    font-size: 18px;
  }
`;

const AIPromptInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  padding: 6px 0;
  color: #eee;
  font-size: 16px;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: #777;
  }
`;

const GenerateButton = styled.button`
  background-color: #8b3dff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-left: 12px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #7a35e0;
  }
  
  &:disabled {
    background-color: #444;
    cursor: not-allowed;
  }
`;

// Add a loading indicator component
const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  color: #8b3dff;
  font-size: 14px;
  margin-left: 8px;
  
  &:after {
    content: '...';
    animation: dots 1.5s steps(4, end) infinite;
    
    @keyframes dots {
      0%, 20% { content: '.'; }
      40% { content: '..'; }
      60% { content: '...'; }
      80%, 100% { content: ''; }
    }
  }
`;

// Add styled component for markdown rendering
const MarkdownContent = styled.div`
  color: #eee;
  font-size: 16px;
  line-height: 1.6;
  padding: 8px 6px;
  position: relative;
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: 1em;
    margin-bottom: 0.5em;
    color: #fff;
    font-weight: 600;
    line-height: 1.2;
  }
  
  h1 {
    font-size: 1.8em;
    border-bottom: 1px solid #333;
    padding-bottom: 0.3em;
  }
  
  h2 {
    font-size: 1.5em;
    border-bottom: 1px solid #333;
    padding-bottom: 0.3em;
  }
  
  h3 {
    font-size: 1.25em;
  }

  p {
    margin-bottom: 1em;
    color: #ddd;
  }

  ul, ol {
    margin-bottom: 1em;
    padding-left: 2em;
    color: #ddd;
  }
  
  li {
    margin-bottom: 0.5em;
  }
  
  code {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    background-color: #2b2b2b;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.85em;
    color: #FF385C;
  }

  pre {
    background-color: #2b2b2b;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin-bottom: 1em;
    border: 1px solid #333;
    
    code {
      background-color: transparent;
      padding: 0;
      color: #ccc;
    }
  }

  blockquote {
    border-left: 4px solid #FF385C;
    padding: 0.5em 1em;
    margin-left: 0;
    margin-bottom: 1em;
    background-color: rgba(255, 56, 92, 0.1);
    border-radius: 0 4px 4px 0;
    color: #ccc;
    
    p {
      margin-bottom: 0;
    }
  }

  a {
    color: #FF385C;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }

  img {
    max-width: 100%;
    border-radius: 8px;
    margin: 1em 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
`;

// Add delete button alongside edit button
const ActionsContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${MarkdownContent}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background-color: transparent;
  border: none;
  color: #777;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s, color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
  
  &.delete:hover {
    background-color: rgba(255, 56, 92, 0.2);
    color: #FF385C;
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
  onRegenerateAI?: (blockId: string) => void;
  isActiveAIBlock?: boolean;
  onAIPromptSubmit?: (blockId: string, prompt: string) => void;
  isLoading?: boolean;
}

const Block: React.FC<BlockProps> = ({
  block,
  isSelected,
  onUpdate,
  onAddBlock,
  onDeleteBlock,
  onOpenBlockMenu,
  onSelect,
  onRegenerateAI,
  isActiveAIBlock = false,
  onAIPromptSubmit,
  isLoading = false
}) => {
  const [content, setContent] = useState(block.content);
  const contentRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const [slashMenuActive, setSlashMenuActive] = useState(false);
  const [slashMenuText, setSlashMenuText] = useState('');
  const slashCommandSelectionRef = useRef<number | null>(null);
  const previousContentRef = useRef(content);
  const isUpdatingFromParent = useRef(false);
  const [aiPrompt, setAIPrompt] = useState('');
  const aiPromptInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Determine if content should be rendered as markdown
  const shouldRenderMarkdown = () => {
    // If editing or this is a fresh AI block, allow editing
    if (isEditing || (block.content === "Generating AI response...")) {
      return false;
    }
    
    // Otherwise check for markdown syntax
    return (
      block.content.includes('#') || 
      block.content.includes('```') || 
      block.content.includes('- ') ||
      block.content.includes('1. ') ||
      block.content.includes('*') ||
      block.content.includes('[') ||
      block.content.includes('>') ||
      block.content.includes('|')
    );
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    // If switching to edit mode, focus the content element
    if (!isEditing && contentRef.current) {
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.focus();
        }
      }, 0);
    }
  };
  
  // Focus the AI input when this block becomes the active AI block
  useEffect(() => {
    if (isActiveAIBlock && aiPromptInputRef.current) {
      aiPromptInputRef.current.focus();
    }
  }, [isActiveAIBlock]);
  
  // Handle submission of AI prompt
  const handleSubmitAIPrompt = () => {
    if (aiPrompt.trim() && onAIPromptSubmit) {
      onAIPromptSubmit(block.id, aiPrompt);
      setAIPrompt('');
    }
  };
  
  // Handle keyboard events for AI prompt input
  const handleAIPromptKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAIPrompt();
    }
  };
  
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
      // If content is empty or just at the very beginning of a non-empty block
      const selection = window.getSelection();
      if (content === '' || (selection?.anchorOffset === 0 && selection.isCollapsed)) {
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

  // Function to process markdown content
  const processMarkdown = (content: string) => {
    // Process task lists for better rendering
    return content.replace(
      /^(\s*)[-*]\s*\[([ x])\]\s*(.+)$/gm, 
      (match, indent, checked, text) => {
        const checkedAttr = checked === 'x' ? ' checked' : '';
        return `${indent}- <div class="task-list-item"><input type="checkbox"${checkedAttr} class="task-list-item-checkbox" disabled />${text}</div>`;
      }
    );
  };

  // Add a keyDown handler to the markdown content container to allow keyboard deletion
  useEffect(() => {
    // This effect adds keyboard event listeners to the document
    const handleDocKeyDown = (e: globalThis.KeyboardEvent) => {
      // Only handle events if this block is selected
      if (!isSelected) return;
      
      // Handle backspace or delete key in markdown view mode
      if ((e.key === 'Backspace' || e.key === 'Delete') && shouldRenderMarkdown() && !isEditing) {
        e.preventDefault();
        onDeleteBlock(block.id);
      }
    };
    
    document.addEventListener('keydown', handleDocKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleDocKeyDown);
    };
  }, [isSelected, block.id, onDeleteBlock, shouldRenderMarkdown, isEditing]);

  return (
    <BlockContainer 
      $isSelected={isSelected} 
      $isEmpty={content === ''} 
      $blockType={block.type}
      onClick={() => onSelect(block.id)}
      data-block-id={block.id}
    >
      {isActiveAIBlock ? (
        <AIPromptContainer>
          <RobotIcon>
            <FaRobot />
          </RobotIcon>
          <AIPromptInput
            ref={aiPromptInputRef}
            value={aiPrompt}
            onChange={(e) => setAIPrompt(e.target.value)}
            placeholder="Tell the AI what to write..."
            onKeyDown={handleAIPromptKeyDown}
          />
          <GenerateButton 
            onClick={handleSubmitAIPrompt} 
            disabled={!aiPrompt.trim() || isLoading}
          >
            {isLoading ? 'Generating' : 'Generate'}
          </GenerateButton>
        </AIPromptContainer>
      ) : isLoading ? (
        <BlockContent $blockType={block.type}>
          <LoadingIndicator>Generating</LoadingIndicator>
        </BlockContent>
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
          
          {/* Render markdown or editable content */}
          {shouldRenderMarkdown() ? (
            <MarkdownContent>
              <React.Suspense fallback={<div>Loading...</div>}>
                <ReactMarkdown>
                  {block.content}
                </ReactMarkdown>
              </React.Suspense>
              <ActionsContainer>
                <ActionButton onClick={toggleEditMode} title="Edit block">
                  <FaEdit size={12} />
                </ActionButton>
                <ActionButton 
                  className="delete" 
                  onClick={() => onDeleteBlock(block.id)} 
                  title="Delete block"
                >
                  <FaTimes size={12} />
                </ActionButton>
              </ActionsContainer>
            </MarkdownContent>
          ) : (
            <>
              <BlockInput
                ref={contentRef}
                $blockType={block.type}
                contentEditable={!isLoading}
                suppressContentEditableWarning
                onInput={handleContentChange}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  // Only switch to markdown mode if there's actual content
                  if (block.content && block.content !== "Generating AI response...") {
                    setIsEditing(false);
                  }
                }}
              />
              <ActionsContainer>
                <ActionButton 
                  className="delete" 
                  onClick={() => onDeleteBlock(block.id)} 
                  title="Delete block"
                >
                  <FaTimes size={12} />
                </ActionButton>
              </ActionsContainer>
            </>
          )}
        </BlockContent>
      )}
    </BlockContainer>
  );
};

export default Block; 