import React, { useState } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { Note } from '../../types';
import { FaPlus, FaStickyNote, FaSearch, FaTags, FaFilter, FaSortAmountDown, FaEllipsisH, FaEye, FaEdit, FaSave } from 'react-icons/fa';
import NoteEditor from './NoteEditor';
import NotePreview from './NotePreview';
import NoteOptionsModal from './modals/NoteOptionsModal';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #121212;
  position: relative;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid #333;
  z-index: 10;
`;

const TitleArea = styled.div`
  display: flex;
  align-items: center;
`;

const IconWrapper = styled.div`
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background-color: rgba(255, 56, 92, 0.1);
  color: #FF385C;
  font-size: 1rem;
`;

const Title = styled.h1`
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 220px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 6px 12px 6px 32px;
  border: 1px solid #444;
  border-radius: 4px;
  font-size: 0.85rem;
  background-color: #333;
  color: #fff;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
    box-shadow: 0 0 0 2px rgba(255, 56, 92, 0.2);
  }

  &::placeholder {
    color: #777;
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #777;
  font-size: 0.8rem;
`;

interface ActionButtonProps {
  $isPrimary?: boolean;
  $iconOnly?: boolean;
}

const ActionButton = styled.button<ActionButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.$isPrimary ? '#FF385C' : '#333'};
  color: ${props => props.$isPrimary ? 'white' : '#ccc'};
  border: ${props => props.$isPrimary ? 'none' : '1px solid #444'};
  border-radius: 4px;
  padding: ${props => props.$isPrimary ? '6px 12px' : '6px 8px'};
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.$isPrimary ? '#e63054' : '#444'};
  }
  
  svg {
    margin-right: ${props => props.$iconOnly ? '0' : '6px'};
    font-size: 0.9rem;
  }
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  
  @media (max-width: 1200px) {
    flex-direction: column;
  }
`;

const NoteControls = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid #333;
`;

const TabsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
`;

const Tab = styled.div<{ $active?: boolean }>`
  padding: 6px 12px;
  font-size: 0.85rem;
  color: ${props => props.$active ? '#fff' : '#999'};
  background-color: ${props => props.$active ? '#383838' : 'transparent'};
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #fff;
  }
`;

const NoteTitle = styled.div`
  margin-left: 12px;
  font-size: 0.95rem;
  color: #bbb;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
`;

const EditorPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #333;
  max-width: 50%;
  
  @media (max-width: 1200px) {
    max-width: none;
    width: 100%;
    height: 50%;
    border-right: none;
    border-bottom: 1px solid #333;
  }
`;

const PreviewPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

interface NotesContainerProps {
  notes: Note[];
  activeNoteId: string | null;
  onAddNote: () => void;
  onUpdateNote: (updatedNote: Note) => void;
  onRenameNote?: (noteId: string, newName: string) => void;
  onDeleteNote?: (noteId: string) => void;
  onDuplicateNote?: (note: Note) => void;
  onExportNote?: (note: Note) => void;
}

const NotesContainer: React.FC<NotesContainerProps> = ({
  notes,
  activeNoteId,
  onAddNote,
  onUpdateNote,
  onRenameNote = () => {},
  onDeleteNote = () => {},
  onDuplicateNote,
  onExportNote,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'alphabetical'>('updated');
  const [optionsModalNote, setOptionsModalNote] = useState<Note | null>(null);
  
  // Find the active note
  const activeNote = notes.find(note => note.id === activeNoteId) || null;
  
  // Get all unique tags from notes
  const allTags = notes.reduce((tags, note) => {
    if (note.tags && note.tags.length > 0) {
      note.tags.forEach(tag => {
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      });
    }
    return tags;
  }, [] as string[]);

  // Handle content changes - this will save automatically
  const handleContentChange = (updatedNote: Note) => {
    onUpdateNote(updatedNote);
  };
  
  // Open options modal for a note
  const handleNoteOptions = (note: Note) => {
    setOptionsModalNote(note);
  };
  
  // Handle rename note from modal
  const handleRenameNote = (updatedNote: Note) => {
    if (onRenameNote) {
      onRenameNote(updatedNote.id, updatedNote.title);
    }
  };
  
  // Handle updating tags
  const handleUpdateTags = (note: Note, tags: string[]) => {
    onUpdateNote({
      ...note,
      tags,
      updatedAt: Date.now()
    });
  };

  return (
    <Container>
      <Header>
        <TitleArea>
          <IconWrapper>
            <FaStickyNote />
          </IconWrapper>
          <Title>Markdown Notes</Title>
        </TitleArea>
        <Controls>
          <SearchWrapper>
            <SearchIconWrapper>
              <FaSearch />
            </SearchIconWrapper>
            <SearchInput 
              placeholder="Search notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchWrapper>
          <ActionButton 
            $isPrimary 
            onClick={onAddNote}
          >
            <FaPlus />
            New Note
          </ActionButton>
        </Controls>
      </Header>
      <NoteControls>
        <TabsContainer>
          <Tab $active>Editor</Tab>
          {activeNote && <NoteTitle>{activeNote.title}</NoteTitle>}
        </TabsContainer>
      </NoteControls>
      <Content>
        <EditorPanel>
          {activeNote && (
            <NoteEditor 
              note={activeNote} 
              onSave={handleContentChange} 
              hideHeader
              autoSave
            />
          )}
        </EditorPanel>
        <PreviewPanel>
          {activeNote && (
            <NotePreview 
              content={activeNote?.content || ''} 
              title={activeNote.title}
            />
          )}
        </PreviewPanel>
      </Content>
      
      {/* Note options modal */}
      {optionsModalNote && (
        <NoteOptionsModal
          isOpen={optionsModalNote !== null}
          note={optionsModalNote}
          onClose={() => setOptionsModalNote(null)}
          onRename={handleRenameNote}
          onDelete={onDeleteNote}
          onUpdateTags={handleUpdateTags}
          onDuplicate={onDuplicateNote}
          onExport={onExportNote}
        />
      )}
    </Container>
  );
};

export default NotesContainer;

export const handleNoteOptions = (note: Note, setOptionsModalNote: React.Dispatch<React.SetStateAction<Note | null>>) => {
  setOptionsModalNote(note);
}; 