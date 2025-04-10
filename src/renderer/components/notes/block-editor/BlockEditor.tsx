import React, { useState, useEffect, useCallback } from 'react';
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
}

const BlockEditor: React.FC<BlockEditorProps> = ({
  initialContent,
  initialTitle,
  onContentChange,
  onTitleChange
}) => {
  // Parse the initial markdown content into blocks
  const [editorState, setEditorState] = useState<EditorState>(() => {
    // Default to at least one empty paragraph block if no content
    const blocks = initialContent 
      ? parseContentToBlocks(initialContent)
      : [{ id: uuidv4(), type: BlockType.Paragraph, content: '', level: 0 }];
    
    return {
      blocks,
      selectedBlockId: blocks[0].id,
      menuOpen: false,
      menuPosition: { x: 0, y: 0 },
      menuAnchorBlockId: null
    };
  });
  
  const [title, setTitle] = useState(initialTitle);
  
  // Save changes when blocks are updated
  useEffect(() => {
    const content = serializeBlocksToContent(editorState.blocks);
    onContentChange(content);
  }, [editorState.blocks, onContentChange]);
  
  // Update title
  useEffect(() => {
    onTitleChange(title);
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
  const handleOpenBlockMenu = useCallback((blockId: string, position: { x: number, y: number }) => {
    setEditorState(prevState => ({
      ...prevState,
      menuOpen: true,
      menuPosition: position,
      menuAnchorBlockId: blockId
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
  }, []);
  
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
        />
      )}
    </EditorContainer>
  );
};

export default BlockEditor; 