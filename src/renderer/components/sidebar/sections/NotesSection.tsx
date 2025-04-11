import React from 'react';
import { motion } from 'framer-motion';
import { FaStickyNote, FaFileAlt, FaPlus, FaEllipsisV } from 'react-icons/fa';
import {
  RequestItemContainer,
  RequestItem,
  ActionButton,
  ActionButtons,
  CollectionHeader,
  CollectionIcon,
  CollectionTitle,
  EmptyHistoryMessage,
} from '../../../styles/StyledComponents';
import { Note } from '../../../types';
import CollapsibleSection from '../components/CollapsibleSection';

// Animation variants
const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

interface NotesSectionProps {
  notes: Note[];
  activeNoteId: string | null;
  expanded: boolean;
  toggleSection: () => void;
  onSelectNote: (note: Note) => void;
  onAddNote: () => void;
  onOpenNoteOptions: (note: Note) => void;
  filter: string;
  onNavigateToNotes?: () => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  activeNoteId,
  expanded,
  toggleSection,
  onSelectNote,
  onAddNote,
  onOpenNoteOptions,
  filter,
  onNavigateToNotes,
}) => {
  // Filter notes based on search input
  const filterNotes = (notes: Note[], filter: string): Note[] => {
    if (!filter.trim()) return notes;
    
    const lowerFilter = filter.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(lowerFilter) || 
      (note.content && note.content.toLowerCase().includes(lowerFilter))
    );
  };

  const filteredNotes = filter
    ? filterNotes(notes, filter)
    : notes;

  const sectionTitle = (
    <CollectionHeader>
      <CollectionIcon>
        <FaStickyNote />
      </CollectionIcon>
      <CollectionTitle>Notes</CollectionTitle>
    </CollectionHeader>
  );

  const sectionActions = (
    <ActionButtons>
      <ActionButton
        onClick={(e) => {
          e.stopPropagation();
          onAddNote();
          onNavigateToNotes && onNavigateToNotes();
        }}
        title="Add Note"
        className="action-button"
      >
        <FaPlus />
      </ActionButton>
    </ActionButtons>
  );

  // Handle combined section toggle and navigation
  const handleToggleSection = () => {
    toggleSection();
    // Navigate to notes when expanding
    if (!expanded && onNavigateToNotes) {
      onNavigateToNotes();
    }
  };

  return (
    <CollapsibleSection
      title={sectionTitle}
      expanded={expanded}
      onToggle={handleToggleSection}
      actions={sectionActions}
    >
      {filteredNotes.length === 0 ? (
        <EmptyHistoryMessage>
          {filter
            ? 'No matching notes found.'
            : 'No notes yet. Create one to get started.'}
        </EmptyHistoryMessage>
      ) : (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          style={{ marginLeft: 16 }}
        >
          {filteredNotes.map((note) => (
            <motion.div
              key={note.id}
              variants={itemVariants}
              transition={{ duration: 0.2 }}
              whileHover={{ x: 4 }}
            >
              <RequestItemContainer
                active={activeNoteId === note.id}
                data-active={activeNoteId === note.id}
                onClick={() => {
                  onSelectNote(note);
                  // Also navigate to notes when selecting a note
                  onNavigateToNotes && onNavigateToNotes();
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenNoteOptions(note);
                }}
              >
                <RequestItem>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      overflow: 'hidden',
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        marginRight: 8,
                        color: '#6c757d',
                      }}
                    >
                      <FaFileAlt size={14} />
                    </div>
                    <div
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {note.title}
                    </div>
                  </div>
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenNoteOptions(note);
                    }}
                    aria-label="Options"
                    className="action-button"
                  >
                    <FaEllipsisV size={12} />
                  </ActionButton>
                </RequestItem>
              </RequestItemContainer>
            </motion.div>
          ))}
        </motion.div>
      )}
    </CollapsibleSection>
  );
};

export default NotesSection; 