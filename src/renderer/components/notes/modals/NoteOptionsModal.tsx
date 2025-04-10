import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPen, FaTrash, FaTags, FaFileExport, FaShareAlt, FaCopy } from 'react-icons/fa';
import { Note } from '../../../types';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  width: 400px;
  max-width: 90%;
  overflow: hidden;
  border: 1px solid #333;
`;

const ModalHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #252526;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 260px;
  font-weight: 500;
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #1e1e1e;
`;

const OptionItem = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  font-size: 0.95rem;
  color: #eee;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #2a2a2a;
  }
  
  &.danger {
    color: #ff4d4f;
  }
  
  svg {
    margin-right: 12px;
    font-size: 1rem;
    color: #ccc;
  }
  
  &.danger svg {
    color: #ff4d4f;
  }
`;

const ModalFooter = styled.div`
  padding: 12px 16px;
  border-top: 1px solid #333;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  background-color: #252526;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &.primary {
    background-color: #FF385C;
    color: white;
    border: none;
    
    &:hover {
      background-color: #e63054;
    }
  }
  
  &.secondary {
    background-color: #333;
    color: #ddd;
    border: 1px solid #444;
    
    &:hover {
      background-color: #3a3a3a;
    }
  }
`;

// Form section for inputting data
const FormSection = styled.div`
  padding: 16px;
  border-bottom: 1px solid #333;
  background-color: #1e1e1e;
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #ccc;
  font-weight: 500;
`;

const TextInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  background-color: #252526;
  border: 1px solid #444;
  border-radius: 4px;
  color: #fff;
  font-size: 0.95rem;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
    box-shadow: 0 0 0 2px rgba(255, 56, 92, 0.2);
  }
`;

const InputHelp = styled.div`
  margin-top: 8px;
  font-size: 0.85rem;
  color: #888;
`;

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

const TagInput: React.FC<TagInputProps> = ({ tags, onTagsChange }) => {
  const [inputValue, setInputValue] = useState(tags.join(', '));
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleBlur = () => {
    // Split by commas and trim whitespace
    const newTags = inputValue
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    onTagsChange(newTags);
  };
  
  return (
    <FormSection>
      <InputLabel>Tags</InputLabel>
      <TextInput 
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder="tag1, tag2, tag3"
      />
      <InputHelp>Separate tags with commas</InputHelp>
    </FormSection>
  );
};

interface RenameFormProps {
  currentTitle: string;
  onRename: (newTitle: string) => void;
  onCancel: () => void;
}

const RenameForm: React.FC<RenameFormProps> = ({ currentTitle, onRename, onCancel }) => {
  const [title, setTitle] = useState(currentTitle);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onRename(title.trim());
    }
  };
  
  return (
    <>
      <FormSection>
        <form onSubmit={handleSubmit}>
          <InputLabel htmlFor="noteTitle">Note Title</InputLabel>
          <TextInput 
            id="noteTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title"
            autoFocus
          />
        </form>
      </FormSection>
      <ModalFooter>
        <Button className="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="primary" onClick={handleSubmit}>
          Rename
        </Button>
      </ModalFooter>
    </>
  );
};

interface DeleteConfirmProps {
  noteTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmForm: React.FC<DeleteConfirmProps> = ({ noteTitle, onConfirm, onCancel }) => {
  return (
    <>
      <FormSection>
        <div style={{ color: '#eee', marginBottom: '12px' }}>
          Are you sure you want to delete "{noteTitle}"?
        </div>
        <div style={{ color: '#ff4d4f', fontSize: '0.9rem' }}>
          This action cannot be undone.
        </div>
      </FormSection>
      <ModalFooter>
        <Button className="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="primary" style={{ backgroundColor: '#ff4d4f' }} onClick={onConfirm}>
          Delete
        </Button>
      </ModalFooter>
    </>
  );
};

interface NoteOptionsModalProps {
  isOpen: boolean;
  note: Note;
  onClose: () => void;
  onRename: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onUpdateTags: (note: Note, tags: string[]) => void;
  onDuplicate?: (note: Note) => void;
  onExport?: (note: Note) => void;
  onShare?: (note: Note) => void;
}

const NoteOptionsModal: React.FC<NoteOptionsModalProps> = ({ 
  isOpen, 
  note, 
  onClose, 
  onRename, 
  onDelete,
  onUpdateTags,
  onDuplicate,
  onExport,
  onShare
}) => {
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [tags, setTags] = useState(note.tags || []);
  
  if (!isOpen) return null;
  
  const handleTagsUpdate = (newTags: string[]) => {
    setTags(newTags);
    onUpdateTags(note, newTags);
  };
  
  const handleRenameClick = () => {
    setIsRenaming(true);
  };
  
  const handleRenameSubmit = (newTitle: string) => {
    onRename({
      ...note,
      title: newTitle
    });
    setIsRenaming(false);
    onClose();
  };
  
  const handleCancelRename = () => {
    setIsRenaming(false);
  };
  
  const handleDeleteClick = () => {
    setIsConfirmingDelete(true);
  };
  
  const handleConfirmDelete = () => {
    onDelete(note.id);
    setIsConfirmingDelete(false);
    onClose();
  };
  
  const handleCancelDelete = () => {
    setIsConfirmingDelete(false);
  };
  
  const handleDuplicateClick = () => {
    if (onDuplicate) {
      onDuplicate(note);
    }
    onClose();
  };
  
  const handleExportClick = () => {
    if (onExport) {
      onExport(note);
    }
    onClose();
  };
  
  const handleShareClick = () => {
    if (onShare) {
      onShare(note);
    }
    onClose();
  };
  
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  // If confirming delete, show the delete confirmation form
  if (isConfirmingDelete) {
    return (
      <ModalOverlay onClick={onClose}>
        <ModalContent onClick={stopPropagation}>
          <ModalHeader>
            <ModalTitle>Delete Note</ModalTitle>
          </ModalHeader>
          <DeleteConfirmForm 
            noteTitle={note.title}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        </ModalContent>
      </ModalOverlay>
    );
  }
  
  // If renaming, show the rename form
  if (isRenaming) {
    return (
      <ModalOverlay onClick={onClose}>
        <ModalContent onClick={stopPropagation}>
          <ModalHeader>
            <ModalTitle>Rename Note</ModalTitle>
          </ModalHeader>
          <RenameForm 
            currentTitle={note.title} 
            onRename={handleRenameSubmit} 
            onCancel={handleCancelRename}
          />
        </ModalContent>
      </ModalOverlay>
    );
  }
  
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={stopPropagation}>
        <ModalHeader>
          <ModalTitle>{note.title}</ModalTitle>
        </ModalHeader>
        
        {isEditingTags ? (
          <TagInput tags={tags} onTagsChange={handleTagsUpdate} />
        ) : null}
        
        <OptionsList>
          <OptionItem onClick={handleRenameClick}>
            <FaPen />
            Rename
          </OptionItem>
          
          <OptionItem onClick={() => setIsEditingTags(!isEditingTags)}>
            <FaTags />
            {isEditingTags ? 'Done editing tags' : 'Edit tags'}
          </OptionItem>
          
          {onDuplicate && (
            <OptionItem onClick={handleDuplicateClick}>
              <FaCopy />
              Duplicate
            </OptionItem>
          )}
          
          {onExport && (
            <OptionItem onClick={handleExportClick}>
              <FaFileExport />
              Export
            </OptionItem>
          )}
          
          {onShare && (
            <OptionItem onClick={handleShareClick}>
              <FaShareAlt />
              Share
            </OptionItem>
          )}
          
          <OptionItem className="danger" onClick={handleDeleteClick}>
            <FaTrash />
            Delete
          </OptionItem>
        </OptionsList>
        
        <ModalFooter>
          <Button className="secondary" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default NoteOptionsModal; 