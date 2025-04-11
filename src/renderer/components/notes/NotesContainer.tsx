import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { Note } from '../../types';
import { FaPlus, FaStickyNote, FaSearch, FaEllipsisH } from 'react-icons/fa';
import NoteOptionsModal from './modals/NoteOptionsModal';
import NoteHeader from './NoteHeader';
import NoteToolbar from './NoteToolbar';
import BlockEditor from './block-editor/BlockEditor';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #121212;
  position: relative;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const EditorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
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
  const [optionsModalNote, setOptionsModalNote] = useState<Note | null>(null);
  
  // Add effect to log when props change to help debug
  useEffect(() => {
    console.log('NotesContainer activeNoteId:', activeNoteId);
    console.log('Notes count:', notes.length);
    if (activeNoteId) {
      const foundNote = notes.find(note => note.id === activeNoteId);
      console.log('Found active note:', foundNote ? 'yes' : 'no');
      if (foundNote) {
        console.log('Active note title:', foundNote.title);
        console.log('Active note content preview:', foundNote.content.substring(0, 50));
      }
    }
  }, [activeNoteId, notes]);
  
  // Find the active note - ensure proper string comparison and provide fallback content
  const activeNote = activeNoteId 
    ? notes.find(note => String(note.id) === String(activeNoteId))
    : null;
  
  // Use an effect to log when the active note changes
  useEffect(() => {
    console.log('Active note updated:', activeNote ? activeNote.id : 'none');
  }, [activeNote]);
  
  // Handle content changes - this will save automatically
  const handleContentChange = useCallback((updatedContent: string) => {
    console.log('Content changed, length:', updatedContent.length);
    if (activeNote) {
      onUpdateNote({
        ...activeNote,
        content: updatedContent,
        updatedAt: Date.now()
      });
    }
  }, [activeNote, onUpdateNote]);
  
  // Handle title change
  const handleTitleChange = useCallback((newTitle: string) => {
    console.log('Title changed:', newTitle);
    if (activeNote) {
      onUpdateNote({
        ...activeNote,
        title: newTitle,
        updatedAt: Date.now()
      });
    }
  }, [activeNote, onUpdateNote]);
  
  // Open options modal for a note
  const handleNoteOptions = useCallback((note: Note) => {
    setOptionsModalNote(note);
  }, []);
  
  // Handle rename note from modal
  const handleRenameNote = useCallback((updatedNote: Note) => {
    if (onRenameNote) {
      onRenameNote(updatedNote.id, updatedNote.title);
    }
  }, [onRenameNote]);
  
  // Handle updating tags
  const handleUpdateTags = useCallback((note: Note, tags: string[]) => {
    onUpdateNote({
      ...note,
      tags,
      updatedAt: Date.now()
    });
  }, [onUpdateNote]);

  // If no active note, show a placeholder or welcome screen
  if (!activeNote) {
    console.log('No active note to display');
    return (
      <Container>
        <NoteHeader 
          title="Markdown Notes"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddNote={onAddNote}
        />
        <EditorContainer>
          <div style={{ textAlign: 'center', marginTop: '100px', color: '#888' }}>
            <p>Select a note or create a new one to begin</p>
            <button 
              onClick={onAddNote}
              style={{ 
                background: '#FF385C', 
                border: 'none', 
                borderRadius: '4px',
                padding: '8px 16px',
                color: 'white',
                marginTop: '20px',
                cursor: 'pointer'
              }}
            >
              <FaPlus style={{ marginRight: '8px' }} />
              Create Note
            </button>
          </div>
        </EditorContainer>
      </Container>
    );
  }

  // Ensure we have valid content for the editor
  const noteContent = activeNote.content || '# New Note\n\nStart writing your markdown here...';
  const noteTitle = activeNote.title || 'Untitled Note';
  
  console.log('Rendering note with title:', noteTitle);

  return (
    <Container>
      <NoteHeader 
        title="Markdown Notes"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddNote={onAddNote}
      />
      <NoteToolbar 
        note={activeNote} 
        onOptions={() => handleNoteOptions(activeNote)} 
      />
      <Content>
        <EditorContainer>
          <BlockEditor
            initialContent={noteContent}
            onContentChange={handleContentChange}
            onTitleChange={handleTitleChange}
            initialTitle={noteTitle}
          />
        </EditorContainer>
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