import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import Block from './Block';
import BlockMenu from './BlockMenu';
import { BlockData, BlockType, EditorState } from './types';
import { parseContentToBlocks, serializeBlocksToContent } from './utils';

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px 0;
`;

const TitleInput = styled.input`
  font-size: 2rem;
  font-weight: 700;
  color: #eee;
  background: transparent;
  border: none;
  padding: 10px 0;
  margin-bottom: 20px;
  width: 100%;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: #555;
  }
`;

const BlocksContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

interface BlockEditorProps {
  initialContent: string;
  initialTitle: string;
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  noteId?: string; // Add noteId prop to detect note changes
}

const BlockEditor: React.FC<BlockEditorProps> = ({
  initialContent,
  initialTitle,
  onContentChange,
  onTitleChange,
  noteId
}) => {
  // Flag to prevent update loops
  const isUpdatingFromProps = useRef(false);
  
  // Track current values to prevent duplicate updates
  const lastEmittedContent = useRef(initialContent);
  const lastEmittedTitle = useRef(initialTitle);
  
  // Current note ID
  const currentNoteIdRef = useRef(noteId);
  
  // Memoize the blocks parsing to avoid unnecessary re-parsing
  const initialBlocks = useMemo(() => {
    return initialContent 
      ? parseContentToBlocks(initialContent)
      : [{ id: uuidv4(), type: BlockType.Paragraph, content: '', level: 0 }];
  }, [initialContent]);
  
  // Initialize editor state from the memoized blocks
  const [editorState, setEditorState] = useState<EditorState>({
    blocks: initialBlocks,
    selectedBlockId: initialBlocks[0].id,
    menuOpen: false,
    menuPosition: { x: 0, y: 0 },
    menuAnchorBlockId: null,
    menuFilterText: ''
  });
  
  const [title, setTitle] = useState(initialTitle);
  
  // Reinitialize the editor ONLY when the note ID changes
  useEffect(() => {
    // If note ID is different, completely reinitialize the editor
    if (noteId !== currentNoteIdRef.current) {
      currentNoteIdRef.current = noteId;
      isUpdatingFromProps.current = true;
      
      // Update last emitted values to match what we're initializing with
      lastEmittedContent.current = initialContent;
      lastEmittedTitle.current = initialTitle;
      
      // Reset the editor with new content blocks
      setEditorState({
        blocks: initialBlocks,
        selectedBlockId: initialBlocks[0].id,
        menuOpen: false,
        menuPosition: { x: 0, y: 0 },
        menuAnchorBlockId: null,
        menuFilterText: ''
      });
      
      // Update title
      setTitle(initialTitle);
      
      // Clear the updating flag after a short delay
      setTimeout(() => {
        isUpdatingFromProps.current = false;
      }, 0);
    }
  }, [noteId, initialContent, initialTitle, initialBlocks]);
  
  // Send content changes to parent, but only when they're from user and actually changed
  useEffect(() => {
    // Skip updates that are from props or during initialization
    if (isUpdatingFromProps.current) {
      return;
    }
    
    // Get current content from blocks
    const content = serializeBlocksToContent(editorState.blocks);
    
    // Only emit if content actually changed from what we last emitted
    if (content !== lastEmittedContent.current) {
      lastEmittedContent.current = content;
      onContentChange(content);
    }
  }, [editorState.blocks, onContentChange]);
  
  // Send title changes to parent, but only when they're from user and actually changed
  useEffect(() => {
    // Skip updates that are from props or during initialization
    if (isUpdatingFromProps.current) {
      return;
    }
    
    // Only emit if title actually changed from what we last emitted
    if (title !== lastEmittedTitle.current) {
      lastEmittedTitle.current = title;
      onTitleChange(title);
    }
  }, [title, onTitleChange]);
  
  // Handle block update
  const handleUpdateBlock = useCallback((updatedBlock: BlockData) => {
    setEditorState(prevState => {
      const newBlocks = prevState.blocks.map(block => 
        block.id === updatedBlock.id ? updatedBlock : block
      );
      
      return {
        ...prevState,
        blocks: newBlocks
      };
    });
  }, []);
  
  // Handle adding a new block
  const handleAddBlock = useCallback((blockId: string, blockType: BlockType = BlockType.Paragraph) => {
    setEditorState(prevState => {
      const blockIndex = prevState.blocks.findIndex(block => block.id === blockId);
      if (blockIndex === -1) return prevState;
      
      const newBlock: BlockData = {
        id: uuidv4(),
        type: blockType,
        content: '',
        level: blockType === BlockType.BulletList || blockType === BlockType.NumberedList 
          ? prevState.blocks[blockIndex].level 
          : 0
      };
      
      const newBlocks = [
        ...prevState.blocks.slice(0, blockIndex + 1),
        newBlock,
        ...prevState.blocks.slice(blockIndex + 1)
      ];
      
      return {
        ...prevState,
        blocks: newBlocks,
        selectedBlockId: newBlock.id
      };
    });
  }, []);
  
  // Handle deleting a block
  const handleDeleteBlock = useCallback((blockId: string) => {
    setEditorState(prevState => {
      // Don't delete if it's the only block
      if (prevState.blocks.length <= 1) {
        return {
          ...prevState,
          blocks: [{ id: prevState.blocks[0].id, type: BlockType.Paragraph, content: '', level: 0 }]
        };
      }
      
      const blockIndex = prevState.blocks.findIndex(block => block.id === blockId);
      if (blockIndex === -1) return prevState;
      
      const newBlocks = [
        ...prevState.blocks.slice(0, blockIndex),
        ...prevState.blocks.slice(blockIndex + 1)
      ];
      
      // Select previous or next block if available
      const newSelectedId = newBlocks[blockIndex - 1]?.id || newBlocks[0]?.id;
      
      return {
        ...prevState,
        blocks: newBlocks,
        selectedBlockId: newSelectedId
      };
    });
  }, []);
  
  // Handle opening block type menu
  const handleOpenBlockMenu = useCallback((
    blockId: string, 
    position: { x: number, y: number },
    initialFilterText: string = ''
  ) => {
    setEditorState(prevState => ({
      ...prevState,
      menuOpen: true,
      menuPosition: position,
      menuAnchorBlockId: blockId,
      menuFilterText: initialFilterText
    }));
  }, []);
  
  // Handle closing block type menu
  const handleCloseBlockMenu = useCallback(() => {
    setEditorState(prevState => ({
      ...prevState,
      menuOpen: false,
      menuAnchorBlockId: null
    }));
  }, []);
  
  // Handle changing block type from menu
  const handleChangeBlockType = useCallback((blockId: string, newType: BlockType) => {
    // First find the block element that had the slash command
    const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
    const contentElement = blockElement?.querySelector('[contenteditable="true"]') as HTMLElement;
    
    // Get the current text content and remove the slash command text
    if (contentElement) {
      const text = contentElement.textContent || '';
      const slashIndex = text.lastIndexOf('/');
      
      if (slashIndex >= 0) {
        // Create the new text without the slash and command text
        const newText = text.substring(0, slashIndex);
        
        // Apply the new content
        contentElement.textContent = newText;
        
        // Get the block data to update
        const blockToUpdate = editorState.blocks.find(b => b.id === blockId);
        if (blockToUpdate) {
          // Update the block content
          const updatedBlock = { 
            ...blockToUpdate, 
            content: newText,
            type: newType 
          };
          
          // Update state with the new block content and type
          setEditorState(prevState => {
            const newBlocks = prevState.blocks.map(block => {
              if (block.id === blockId) {
                return updatedBlock;
              }
              return block;
            });
            
            return {
              ...prevState,
              blocks: newBlocks,
              menuOpen: false,
              menuAnchorBlockId: null
            };
          });
        }
      } else {
        // If no slash found, just update the block type
        setEditorState(prevState => {
          const newBlocks = prevState.blocks.map(block => {
            if (block.id === blockId) {
              return { ...block, type: newType };
            }
            return block;
          });
          
          return {
            ...prevState,
            blocks: newBlocks,
            menuOpen: false,
            menuAnchorBlockId: null
          };
        });
      }
      
      // Set focus to the content element after a short delay
      setTimeout(() => {
        if (contentElement) {
          contentElement.focus();
          
          // Place cursor at the end of the content
          const range = document.createRange();
          const selection = window.getSelection();
          
          // Set cursor at the end
          if (contentElement.childNodes.length > 0) {
            const lastNode = contentElement.childNodes[contentElement.childNodes.length - 1];
            range.setStartAfter(lastNode);
          } else {
            range.setStart(contentElement, 0);
          }
          
          range.collapse(true);
          
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }, 10);
    } else {
      // Fallback if we couldn't find the content element
      setEditorState(prevState => {
        const newBlocks = prevState.blocks.map(block => {
          if (block.id === blockId) {
            return { ...block, type: newType };
          }
          return block;
        });
        
        return {
          ...prevState,
          blocks: newBlocks,
          menuOpen: false,
          menuAnchorBlockId: null
        };
      });
    }
  }, [editorState.blocks]);
  
  // Set the selected block
  const handleSelectBlock = useCallback((blockId: string) => {
    setEditorState(prevState => ({
      ...prevState,
      selectedBlockId: blockId
    }));
  }, []);

  return (
    <EditorContainer>
      <TitleInput
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Untitled"
      />
      
      <BlocksContainer>
        {editorState.blocks.map(block => (
          <Block
            key={block.id}
            block={block}
            isSelected={block.id === editorState.selectedBlockId}
            onUpdate={handleUpdateBlock}
            onAddBlock={handleAddBlock}
            onDeleteBlock={handleDeleteBlock}
            onOpenBlockMenu={handleOpenBlockMenu}
            onSelect={handleSelectBlock}
            data-block-id={block.id}
          />
        ))}
      </BlocksContainer>
      
      {editorState.menuOpen && editorState.menuAnchorBlockId && (
        <BlockMenu
          position={editorState.menuPosition}
          onClose={handleCloseBlockMenu}
          onSelectBlockType={(type) => 
            handleChangeBlockType(editorState.menuAnchorBlockId!, type)
          }
          initialFilterText={editorState.menuFilterText}
        />
      )}
    </EditorContainer>
  );
};

export default BlockEditor; 