import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  position: relative;
`;

const EditorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
  overflow: hidden; /* Contain the scrolling to the BlockEditor */
  height: 100%; /* Make sure it takes full height */
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
  onOpenSettings?: () => void;
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
  onOpenSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [optionsModalNote, setOptionsModalNote] = useState<Note | null>(null);
  
  // Find the active note - ensure proper string comparison and provide fallback content
  const activeNote = activeNoteId 
    ? notes.find(note => String(note.id) === String(activeNoteId))
    : null;
  
  // Add debug logging
  console.log("Active Note ID:", activeNoteId);
  console.log("Available Notes:", notes);
  console.log("Found Active Note:", activeNote);
  
  // Debounce timeout refs
  const contentUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const titleUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cached content and title to avoid duplicate updates
  const contentCacheRef = useRef<string | null>(null);
  const titleCacheRef = useRef<string | null>(null);
  
  // Handle content changes with debounce
  const handleContentChange = useCallback((updatedContent: string) => {
    if (!activeNote || updatedContent === contentCacheRef.current) return;
    
    // Clear any pending timeouts
    if (contentUpdateTimeoutRef.current) {
      clearTimeout(contentUpdateTimeoutRef.current);
    }
    
    // Cache the content
    contentCacheRef.current = updatedContent;
    
    // Set a new timeout for the update
    contentUpdateTimeoutRef.current = setTimeout(() => {
      onUpdateNote({
        ...activeNote,
        content: updatedContent,
        updatedAt: Date.now()
      });
    }, 300); // 300ms debounce
  }, [activeNote, onUpdateNote]);
  
  // Handle title change with debounce
  const handleTitleChange = useCallback((newTitle: string) => {
    if (!activeNote || newTitle === titleCacheRef.current) return;
    
    // Clear any pending timeouts
    if (titleUpdateTimeoutRef.current) {
      clearTimeout(titleUpdateTimeoutRef.current);
    }
    
    // Cache the title
    titleCacheRef.current = newTitle;
    
    // Set a new timeout for the update
    titleUpdateTimeoutRef.current = setTimeout(() => {
      onUpdateNote({
        ...activeNote,
        title: newTitle,
        updatedAt: Date.now()
      });
    }, 300); // 300ms debounce
  }, [activeNote, onUpdateNote]);
  
  // Update cache refs when active note changes
  useEffect(() => {
    if (activeNote) {
      contentCacheRef.current = activeNote.content;
      titleCacheRef.current = activeNote.title;
    }
  }, [activeNote?.id]); // Only run when note ID changes
  
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

  // Set up event listener for openAISettings event
  useEffect(() => {
    const handleOpenAISettings = () => {
      if (onOpenSettings) {
        onOpenSettings();
      }
    };

    // Add event listener
    window.addEventListener('openAISettings', handleOpenAISettings);

    // Cleanup
    return () => {
      window.removeEventListener('openAISettings', handleOpenAISettings);
    };
  }, [onOpenSettings]);

  // If no active note, show a placeholder or welcome screen
  if (!activeNote) {
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
  const noteContent = activeNote.content || '';
  const noteTitle = activeNote.title || 'Untitled Note';
  
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
            key={activeNote.id} // Add key to force re-mount when note changes
            initialContent={noteContent}
            onContentChange={handleContentChange}
            onTitleChange={handleTitleChange}
            initialTitle={noteTitle}
            noteId={activeNote.id}
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